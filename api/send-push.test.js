const test = require("node:test");
const assert = require("node:assert/strict");
const { createPushHandler, parsePushPayload } = require("./handler");
const {
  createAdminAuthorizer,
  getBearerToken,
  isValidOrigin,
  parseAllowedOrigins,
} = require("./security");

const adminOrigin = "https://elwataniatvapp.web.app";

function createResponse() {
  return {
    headers: {},
    statusCode: 200,
    payload: null,
    ended: false,
    setHeader(name, value) {
      this.headers[name.toLowerCase()] = value;
    },
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(value) {
      this.payload = value;
      return this;
    },
    end() {
      this.ended = true;
      return this;
    },
  };
}

test("allowed origins are exact and never accept a wildcard", () => {
  const origins = parseAllowedOrigins("https://admin.example, *, https://evil.example/path");
  assert.deepEqual([...origins], ["https://admin.example"]);
  assert.equal(isValidOrigin("https://admin.example"), true);
  assert.equal(origins.has("https://admin.example"), true);
  assert.equal(origins.has("https://sub.admin.example"), false);
});

test("bearer token parsing rejects missing and malformed authorization", () => {
  assert.equal(getBearerToken({}), null);
  assert.equal(getBearerToken({ authorization: "Basic abc" }), null);
  assert.equal(getBearerToken({ authorization: "Bearer a.b.c" }), "a.b.c");
  assert.equal(getBearerToken({ Authorization: "bearer token" }), "token");
});

test("only Firebase admin claims can authorize push delivery", async () => {
  const authorize = createAdminAuthorizer(async (token) => {
    if (token === "admin") return { uid: "owner", admin: true };
    if (token === "role-admin") return { uid: "owner", role: "admin" };
    if (token === "moderator") return { uid: "mod", role: "moderator" };
    const error = new Error("invalid token");
    error.code = "auth/argument-error";
    throw error;
  });

  assert.deepEqual(await authorize({}), { status: 401 });
  assert.deepEqual(await authorize({ authorization: "Bearer moderator" }), { status: 403 });
  assert.deepEqual(await authorize({ authorization: "Bearer invalid" }), { status: 401 });
  assert.deepEqual(await authorize({ authorization: "Bearer admin" }), { status: 200, uid: "owner" });
  assert.deepEqual(await authorize({ authorization: "Bearer role-admin" }), { status: 200, uid: "owner" });
});

test("identity service failures fail closed", async () => {
  const authorize = createAdminAuthorizer(async () => {
    throw new Error("service unavailable");
  });
  assert.deepEqual(await authorize({ authorization: "Bearer token" }), { status: 503 });
});

test("preflight allows only configured admin origins", async () => {
  const handler = createPushHandler({
    admin: {},
    getApp: () => ({}),
    authorizeAdmin: async () => ({ status: 401 }),
    allowedOrigins: new Set([adminOrigin]),
  });
  const allowed = createResponse();
  await handler({ method: "OPTIONS", headers: { origin: adminOrigin } }, allowed);
  assert.equal(allowed.statusCode, 204);
  assert.equal(allowed.headers["access-control-allow-origin"], adminOrigin);
  assert.match(allowed.headers["access-control-allow-headers"], /Authorization/);

  const denied = createResponse();
  await handler({ method: "OPTIONS", headers: { origin: "https://attacker.example" } }, denied);
  assert.equal(denied.statusCode, 403);
  assert.equal(denied.headers["access-control-allow-origin"], undefined);
});

test("requests without an admin token cannot access Firestore", async () => {
  let databaseReads = 0;
  const handler = createPushHandler({
    admin: { firestore: () => { databaseReads += 1; } },
    getApp: () => ({}),
    authorizeAdmin: createAdminAuthorizer(async () => ({ admin: true })),
    allowedOrigins: new Set([adminOrigin]),
  });
  const response = createResponse();
  await handler({
    method: "POST",
    headers: { origin: adminOrigin },
    body: { title: "News", body: "Update" },
  }, response);
  assert.equal(response.statusCode, 401);
  assert.equal(databaseReads, 0);
});

test("notification payload rejects unsafe links and oversized text", () => {
  assert.equal(parsePushPayload({ title: "News", body: "Update", url: "https://example.com" }), null);
  assert.equal(parsePushPayload({ title: "News", body: "x".repeat(501) }), null);
  assert.ok(parsePushPayload({ title: "News", body: "Update", url: "https://youtu.be/abc123" }));
});

test("push sends use valid FCM multicast messages in batches of 500", async () => {
  const firebaseApp = {};
  const tokens = Array.from({ length: 501 }, (_, index) => `fcm-token-${String(index).padStart(24, "0")}`);
  const batches = [];
  const admin = {
    firestore(app) {
      assert.equal(app, firebaseApp);
      return {
        collection(name) {
          assert.equal(name, "push_tokens");
          return {
            async get() {
              return { forEach(callback) {
                tokens.forEach((token) => callback({ data: () => ({ token }) }));
              } };
            },
          };
        },
      };
    },
    messaging(app) {
      assert.equal(app, firebaseApp);
      return {
        async sendEachForMulticast(message) {
          batches.push(message);
          return { successCount: message.tokens.length, failureCount: 0 };
        },
      };
    },
  };
  const handler = createPushHandler({
    admin,
    getApp: () => firebaseApp,
    authorizeAdmin: async (headers) => (
      headers.authorization === "Bearer valid" ? { status: 200, uid: "owner" } : { status: 401 }
    ),
    allowedOrigins: new Set([adminOrigin]),
  });
  const response = createResponse();

  await handler({
    method: "POST",
    headers: { origin: adminOrigin, authorization: "Bearer valid" },
    body: { title: " News ", body: " Update ", category: "news", url: "https://youtu.be/abc123" },
  }, response);

  assert.equal(response.statusCode, 200);
  assert.deepEqual(response.payload, { ok: true, sent: 501, failed: 0, total: 501 });
  assert.deepEqual(batches.map((batch) => batch.tokens.length), [500, 1]);
  assert.equal(batches[0].notification.title, "News");
  assert.equal(batches[0].notification.body, "Update");
  assert.equal(batches[0].data.category, "news");
  assert.equal(batches[0].data.url, "https://youtu.be/abc123");
});
