const test = require("node:test");
const assert = require("node:assert/strict");

test("Expo SDK v8 exposes the push APIs through dynamic import", async () => {
  const { Expo } = await import("expo-server-sdk");
  const expo = new Expo();

  assert.equal(typeof expo.chunkPushNotifications, "function");
  assert.equal(typeof expo.sendPushNotificationsAsync, "function");
});
