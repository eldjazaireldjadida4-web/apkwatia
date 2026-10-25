const DEFAULT_ALLOWED_ORIGINS = [
  "https://elwataniatvapp.web.app",
  "https://elwataniatvapp.firebaseapp.com",
  "https://elwataniatv-channel.vercel.app",
];

const INVALID_TOKEN_CODES = new Set([
  "auth/argument-error",
  "auth/id-token-expired",
  "auth/id-token-revoked",
  "auth/invalid-id-token",
  "auth/user-disabled",
]);

function isValidOrigin(value) {
  try {
    const url = new URL(value);
    if (url.origin !== value || url.username || url.password) return false;
    return url.protocol === "https:" || (url.protocol === "http:" && ["localhost", "127.0.0.1"].includes(url.hostname));
  } catch {
    return false;
  }
}

function parseAllowedOrigins(value = process.env.ADMIN_ALLOWED_ORIGINS) {
  const origins = value == null || value.trim() === ""
    ? DEFAULT_ALLOWED_ORIGINS
    : value.split(",").map((origin) => origin.trim());
  return new Set(origins.filter((origin) => origin && isValidOrigin(origin)));
}

function getBearerToken(headers = {}) {
  const key = Object.keys(headers).find((name) => name.toLowerCase() === "authorization");
  const value = key ? headers[key] : "";
  if (typeof value !== "string") return null;
  const match = value.match(/^Bearer\s+(\S+)$/i);
  return match ? match[1] : null;
}

function createAdminAuthorizer(verifyIdToken) {
  return async function authorizeAdmin(headers) {
    const token = getBearerToken(headers);
    if (!token) return { status: 401 };

    let claims;
    try {
      claims = await verifyIdToken(token);
    } catch (error) {
      return { status: error?.statusCode === 503 || !INVALID_TOKEN_CODES.has(error?.code) ? 503 : 401 };
    }

    return claims?.admin === true || claims?.role === "admin"
      ? { status: 200, uid: claims.uid }
      : { status: 403 };
  };
}

module.exports = { createAdminAuthorizer, getBearerToken, isValidOrigin, parseAllowedOrigins };
