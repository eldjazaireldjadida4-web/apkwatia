const ALLOWED_CATEGORIES = new Set(["all", "sports", "news", "culture", "test", "general"]);
const YOUTUBE_HOSTS = new Set(["youtube.com", "youtube-nocookie.com", "youtu.be"]);

function parsePushPayload(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;

  const title = typeof value.title === "string" ? value.title.trim() : "";
  const body = typeof value.body === "string" ? value.body.trim() : "";
  const category = typeof value.category === "string" ? value.category.trim() : "general";
  const url = typeof value.url === "string" ? value.url.trim() : "";

  if (!title || title.length > 100 || !body || body.length > 500) return null;
  if (!ALLOWED_CATEGORIES.has(category)) return null;
  if (url) {
    if (url.length > 2048) return null;
    try {
      const parsed = new URL(url);
      const host = parsed.hostname.toLowerCase().replace(/^www\./, "");
      if (parsed.protocol !== "https:" || ![...YOUTUBE_HOSTS].some((domain) => host === domain || host.endsWith(`.${domain}`))) {
        return null;
      }
    } catch {
      return null;
    }
  }

  return { title, body, category, url };
}

function createPushHandler({ admin, getApp, authorizeAdmin, allowedOrigins }) {
  return async function handler(req, res) {
    const origin = typeof req.headers?.origin === "string" ? req.headers.origin : "";
    const originAllowed = origin ? allowedOrigins.has(origin) : false;
    res.setHeader("Vary", "Origin");

    if (originAllowed) {
      res.setHeader("Access-Control-Allow-Origin", origin);
      res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
      res.setHeader("Access-Control-Allow-Headers", "Authorization, Content-Type");
      res.setHeader("Access-Control-Max-Age", "600");
    }

    if (origin && !originAllowed) {
      return res.status(403).json({ ok: false, error: "Origin not allowed" });
    }
    if (req.method === "OPTIONS") {
      return originAllowed
        ? res.status(204).end()
        : res.status(403).json({ ok: false, error: "Origin not allowed" });
    }
    if (req.method !== "POST") {
      return res.status(405).json({ ok: false, error: "Method not allowed" });
    }

    let authorization;
    try {
      authorization = await authorizeAdmin(req.headers || {});
    } catch {
      return res.status(503).json({ ok: false, error: "Authorization service unavailable" });
    }
    if (authorization.status !== 200) {
      const status = [401, 403, 503].includes(authorization.status) ? authorization.status : 503;
      const error = status === 401
        ? "Authentication required"
        : status === 403
          ? "Administrator access required"
          : "Authorization service unavailable";
      return res.status(status).json({ ok: false, error });
    }

    const payload = parsePushPayload(req.body);
    if (!payload) {
      return res.status(400).json({ ok: false, error: "Invalid notification payload" });
    }

    try {
      const app = getApp();
      const snapshot = await admin.firestore(app).collection("push_tokens").get();
      const tokens = [];
      snapshot.forEach((document) => {
        const token = document.data()?.token;
        if (typeof token === "string" && token.trim().length >= 20 && token.trim().length <= 4096) {
          tokens.push(token.trim());
        }
      });

      if (tokens.length === 0) {
        return res.status(200).json({ ok: true, sent: 0, failed: 0, total: 0 });
      }

      let sent = 0;
      let failed = 0;
      for (let index = 0; index < tokens.length; index += 500) {
        const batch = tokens.slice(index, index + 500);
        try {
          const response = await admin.messaging(app).sendEachForMulticast({
            tokens: batch,
            notification: { title: payload.title, body: payload.body },
            data: {
              category: payload.category,
              ...(payload.url ? { url: payload.url } : {}),
            },
            android: {
              priority: "high",
              notification: { channelId: "general", clickAction: "MAIN" },
            },
          });
          sent += response.successCount || 0;
          failed += response.failureCount || 0;
        } catch {
          failed += batch.length;
        }
      }

      return res.status(200).json({ ok: true, sent, failed, total: tokens.length });
    } catch (error) {
      console.error("push_send_failed", error?.code || "unknown");
      return res.status(500).json({ ok: false, error: "Unable to send notification" });
    }
  };
}

module.exports = { createPushHandler, parsePushPayload };
