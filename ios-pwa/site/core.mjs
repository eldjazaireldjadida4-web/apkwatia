const SAFE_DATA_IMAGE = /^data:image\/(?:png|jpeg|webp|gif);base64,[A-Za-z0-9+/]+={0,2}$/i;

export function decodeFirestoreValue(value) {
  if (!value || typeof value !== "object") return value;
  if (Object.hasOwn(value, "stringValue")) return value.stringValue;
  if (Object.hasOwn(value, "integerValue")) return Number(value.integerValue);
  if (Object.hasOwn(value, "doubleValue")) return Number(value.doubleValue);
  if (Object.hasOwn(value, "booleanValue")) return value.booleanValue;
  if (Object.hasOwn(value, "timestampValue")) return value.timestampValue;
  if (Object.hasOwn(value, "nullValue")) return null;
  if (Object.hasOwn(value, "arrayValue")) return (value.arrayValue.values ?? []).map(decodeFirestoreValue);
  if (Object.hasOwn(value, "mapValue")) return decodeFirestoreFields(value.mapValue.fields ?? {});
  return value;
}

export function decodeFirestoreFields(fields = {}) {
  return Object.fromEntries(Object.entries(fields).map(([key, value]) => [key, decodeFirestoreValue(value)]));
}

export function safeHttpsUrl(value, { allowImageData = false } = {}) {
  const candidate = String(value ?? "").trim();
  if (allowImageData && SAFE_DATA_IMAGE.test(candidate)) return candidate;
  try {
    const url = new URL(candidate);
    if (url.protocol !== "https:" || url.username || url.password) return "";
    return url.href;
  } catch {
    return "";
  }
}

export function normalizeStream(document, fallbackId = "") {
  const data = document?.fields ? decodeFirestoreFields(document.fields) : document ?? {};
  const id = String(document?.name?.split("/").at(-1) ?? data.id ?? fallbackId).trim();
  const title = String(data.title ?? "").trim();
  const url = safeHttpsUrl(data.url);
  const type = String(data.type ?? "m3u8").trim().toLowerCase();
  const logoUrl = safeHttpsUrl(data.logoUrl ?? data.icon ?? "", { allowImageData: true });
  const order = Number.isFinite(Number(data.order)) ? Number(data.order) : 0;
  if (!id || !title || !url || data.isActive === false) return null;
  if (!new Set(["m3u8", "youtube", "other"]).has(type)) return null;
  return { id, title, url, type, logoUrl, order };
}

export function toYouTubeEmbedUrl(value) {
  const safeUrl = safeHttpsUrl(value);
  if (!safeUrl) return "";
  try {
    const url = new URL(safeUrl);
    const host = url.hostname.toLowerCase();
    if (["youtube.com", "www.youtube.com", "m.youtube.com", "youtube-nocookie.com", "www.youtube-nocookie.com"].includes(host)) {
      if (url.pathname === "/embed/live_stream" || url.pathname === "/live_stream") {
        const channelId = url.searchParams.get("channel") ?? "";
        if (!/^UC[A-Za-z0-9_-]{22}$/.test(channelId)) return "";
        return `https://www.youtube-nocookie.com/embed/live_stream?channel=${encodeURIComponent(channelId)}&autoplay=1&playsinline=1&rel=0`;
      }
    }
    let videoId = "";
    if (host === "youtu.be") videoId = url.pathname.split("/").filter(Boolean)[0] ?? "";
    if (["youtube.com", "www.youtube.com", "m.youtube.com", "youtube-nocookie.com", "www.youtube-nocookie.com"].includes(host)) {
      if (url.pathname === "/watch") videoId = url.searchParams.get("v") ?? "";
      else if (/^\/(?:embed|live)\//.test(url.pathname)) videoId = url.pathname.split("/").filter(Boolean)[1] ?? "";
    }
    if (!/^[A-Za-z0-9_-]{11}$/.test(videoId)) return "";
    return `https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&playsinline=1&rel=0`;
  } catch {
    return "";
  }
}

export function normalizeStreams(documents = []) {
  return documents
    .map((document) => normalizeStream(document))
    .filter(Boolean)
    .sort((left, right) => left.order - right.order || left.title.localeCompare(right.title, "ar"));
}
