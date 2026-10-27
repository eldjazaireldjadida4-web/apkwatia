#!/usr/bin/env node
/* eslint-env node */
/**
 * Build the Firebase Hosting publish tree from an explicit allowlist.
 * This prevents repository-root files from being exposed by Hosting.
 */

const fs = require("fs");
const path = require("path");

const rootDir = path.resolve(__dirname, "..");
const outputDir = path.join(rootDir, "admin", "hosting-dist");

function fail(message) {
  console.error(`Hosting build failed: ${message}`);
  process.exit(1);
}

function readWebFirebaseConfig() {
  try {
    const source = fs.readFileSync(path.join(rootDir, "admin", "firebase-config.js"), "utf8");
    const match = source.match(/firebaseConfig\s*=\s*\{([\s\S]*?)\n\};/);
    if (!match) return {};
    const config = {};
    for (const [, key, value] of match[1].matchAll(/(\w+)\s*:\s*"([^"]*)"/g)) {
      config[key] = value;
    }
    return config;
  } catch {
    return {};
  }
}

function readAndroidFirebaseConfig() {
  try {
    const configPath = path.join(rootDir, "app", "google-services.json");
    const config = JSON.parse(fs.readFileSync(configPath, "utf8"));
    const client = config.client?.[0];
    const apiKey = client?.api_key?.[0]?.current_key;
    const appId = client?.client_info?.mobilesdk_app_id;
    const projectId = config.project_info?.project_id;
    const messagingSenderId = config.project_info?.project_number;
    const webAppId = appId && appId.includes(":web:") ? appId : undefined;
    if (!apiKey || !projectId || !messagingSenderId) return {};
    return { apiKey, appId: webAppId, projectId, messagingSenderId };
  } catch {
    return {};
  }
}

const webConfig = readWebFirebaseConfig();
const androidConfig = readAndroidFirebaseConfig();
const firstDefined = (...values) => values.find((value) => value != null && value !== "");
const projectId = firstDefined(process.env.FIREBASE_WEB_PROJECT_ID, webConfig.projectId, androidConfig.projectId, "elwataniatvapp");
const firebaseConfig = {
  apiKey: firstDefined(process.env.FIREBASE_WEB_API_KEY, webConfig.apiKey, androidConfig.apiKey),
  authDomain: firstDefined(process.env.FIREBASE_WEB_AUTH_DOMAIN, webConfig.authDomain, `${projectId}.firebaseapp.com`),
  projectId,
  storageBucket: firstDefined(process.env.FIREBASE_WEB_STORAGE_BUCKET, webConfig.storageBucket, `${projectId}.firebasestorage.app`),
  messagingSenderId: firstDefined(process.env.FIREBASE_WEB_MESSAGING_SENDER_ID, webConfig.messagingSenderId, androidConfig.messagingSenderId),
  appId: firstDefined(process.env.FIREBASE_WEB_APP_ID, webConfig.appId, androidConfig.appId),
  measurementId: firstDefined(process.env.FIREBASE_WEB_MEASUREMENT_ID, webConfig.measurementId, "")
};

// Firebase Auth rejects Android app ids on the web dashboard — refuse to ship one.
if (firebaseConfig.appId && !String(firebaseConfig.appId).includes(":web:")) {
  fail(`refusing to build: appId is not a web app id (${firebaseConfig.appId})`);
}

const missingFirebaseFields = ["apiKey", "messagingSenderId", "appId"]
  .filter((field) => !firebaseConfig[field]);
if (missingFirebaseFields.length) {
  fail(`required Firebase Web config fields missing: ${missingFirebaseFields.join(", ")}`);
}

const entries = [
  [path.join(rootDir, "admin", "index.html"), path.join(outputDir, "admin", "index.html"), "file"],
  [path.join(rootDir, "admin", "stream-preview.js"), path.join(outputDir, "admin", "stream-preview.js"), "file"],
  [path.join(rootDir, "privacy.html"), path.join(outputDir, "privacy.html"), "file"],
  [path.join(rootDir, "download.html"), path.join(outputDir, "download.html"), "file"],
  [path.join(rootDir, "assets"), path.join(outputDir, "assets"), "directory"],
];

for (const [source, destination, kind] of entries) {
  if (!fs.existsSync(source)) fail(`missing ${kind}: ${path.relative(rootDir, source)}`);
  const stats = fs.statSync(source);
  if (kind === "file" && !stats.isFile()) fail(`expected file: ${path.relative(rootDir, source)}`);
  if (kind === "directory" && !stats.isDirectory()) fail(`expected directory: ${path.relative(rootDir, source)}`);
}

fs.rmSync(outputDir, { recursive: true, force: true });
fs.mkdirSync(path.join(outputDir, "admin"), { recursive: true });
const firebaseConfigScript = `window.__WATANIA_FIREBASE_CONFIG__ = Object.freeze(${JSON.stringify(firebaseConfig)});`;

for (const [source, destination] of entries) {
  fs.mkdirSync(path.dirname(destination), { recursive: true });
  fs.cpSync(source, destination, { recursive: true });
}

const hostedAdminIndex = path.join(outputDir, "admin", "index.html");
const hostedIndexHtml = fs.readFileSync(hostedAdminIndex, "utf8");
const firebaseConfigTag = /<script src="\.\/firebase-config\.js\?v=[^"]+"><\/script>/;
if (!firebaseConfigTag.test(hostedIndexHtml)) {
  fail("admin/index.html is missing its Firebase config script tag");
}
fs.writeFileSync(
  hostedAdminIndex,
  hostedIndexHtml.replace(firebaseConfigTag, `<script>${firebaseConfigScript}</script>`),
  "utf8"
);

const https = require("https");
const { createHash } = require("crypto");
const downloadsOutput = path.join(outputDir, "assets", "downloads");
const currentDownloadName = "ElwataniaTV-v8.6.0-release.apk.txt";
const currentDownloadUrl = "https://elwataniatvapp.web.app/assets/downloads/ElwataniaTV-v8.6.0-release.apk.txt";
const currentDownloadSha256 = "13b6ce5deccb25fc5794c640841c29873295eab865d17ebf6cf66b38b0405a72";

function fetchCurrentDownload() {
  return new Promise((resolve, reject) => {
    const request = https.get(currentDownloadUrl, { timeout: 30_000 }, (response) => {
      if (response.statusCode !== 200) {
        response.resume();
        reject(new Error(`current public APK download returned HTTP ${response.statusCode}`));
        return;
      }
      let payload = "";
      response.setEncoding("utf8");
      response.on("data", (chunk) => { payload += chunk; });
      response.on("end", () => resolve(payload.trim()));
    });
    request.on("timeout", () => request.destroy(new Error("timed out fetching the current public APK")));
    request.on("error", reject);
  });
}

async function preserveCurrentDownload() {
  const localPayloadPath = process.env.PUBLIC_DOWNLOAD_PAYLOAD_PATH;
  const payload = localPayloadPath
    ? fs.readFileSync(path.resolve(localPayloadPath), "utf8").trim()
    : await fetchCurrentDownload();
  if (!/^[A-Za-z0-9+/]+={0,2}$/.test(payload)) {
    fail("current public APK payload is not valid Base64");
  }
  const apkBytes = Buffer.from(payload, "base64");
  if (!apkBytes.length || apkBytes.toString("base64") !== payload) {
    fail("current public APK payload is not canonical Base64");
  }
  const sha256 = createHash("sha256").update(apkBytes).digest("hex");
  if (sha256 !== currentDownloadSha256) {
    fail("current public APK checksum changed; review the download page before publishing Hosting");
  }
  fs.mkdirSync(downloadsOutput, { recursive: true });
  fs.writeFileSync(path.join(downloadsOutput, currentDownloadName), payload, "utf8");
}

preserveCurrentDownload().then(() => {
  console.log("Firebase Hosting tree built from allowlist; existing public download preserved unchanged:");
  console.log("- admin/index.html -> admin/hosting-dist/admin/index.html");
  console.log("- Firebase config injected inline -> admin/hosting-dist/admin/index.html");
  console.log("- privacy.html -> admin/hosting-dist/privacy.html");
  console.log("- download.html -> admin/hosting-dist/download.html");
  console.log("- existing release APK payload -> admin/hosting-dist/assets/downloads/" + currentDownloadName);
  console.log("- assets/ -> admin/hosting-dist/assets/");
}).catch((error) => fail(`failed to preserve current public download: ${error.message}`));
