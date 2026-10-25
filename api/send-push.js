const admin = require("firebase-admin");
const { createPushHandler } = require("./handler");
const { createAdminAuthorizer, parseAllowedOrigins } = require("./security");

function getApp() {
  if (admin.apps.length > 0) return admin.app();

  const raw = process.env.FIREBASE_SERVICE_ACCOUNT;
  if (!raw) {
    const error = new Error("FIREBASE_SERVICE_ACCOUNT is not configured");
    error.statusCode = 503;
    throw error;
  }
  let serviceAccount;
  try {
    serviceAccount = JSON.parse(raw);
  } catch {
    const error = new Error("FIREBASE_SERVICE_ACCOUNT is invalid");
    error.statusCode = 503;
    throw error;
  }
  try {
    return admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
  } catch {
    const error = new Error("Firebase Admin initialization failed");
    error.statusCode = 503;
    throw error;
  }
}

const authorizeAdmin = createAdminAuthorizer(async (token) => {
  const app = getApp();
  return admin.auth(app).verifyIdToken(token, true);
});

module.exports = createPushHandler({
  admin,
  getApp,
  authorizeAdmin,
  allowedOrigins: parseAllowedOrigins(),
});
