const test = require("node:test");
const assert = require("node:assert/strict");
const { readFileSync } = require("node:fs");
const { resolve } = require("node:path");
const vm = require("node:vm");

const context = { window: {}, URL };
vm.runInNewContext(
  readFileSync(resolve(__dirname, "../stream-preview.js"), "utf8"),
  context,
);
const preview = context.window.WataniaStreamPreview;

test("accepts only absolute HTTP and HTTPS preview URLs without credentials", () => {
  assert.equal(preview.normalizePreviewUrl(" https://media.example/live.m3u8 ").href, "https://media.example/live.m3u8");
  assert.equal(preview.normalizePreviewUrl("javascript:alert(1)"), null);
  assert.equal(preview.normalizePreviewUrl("data:text/html,unsafe"), null);
  assert.equal(preview.normalizePreviewUrl("//media.example/live.m3u8"), null);
  assert.equal(preview.normalizePreviewUrl("https://user:pass@media.example/live.m3u8"), null);
});

test("extracts valid YouTube watch, short, live, and embed IDs", () => {
  const id = "AbCdEf12345";
  assert.equal(preview.youtubeVideoId(`https://www.youtube.com/watch?v=${id}`), id);
  assert.equal(preview.youtubeVideoId(`https://youtu.be/${id}?si=share`), id);
  assert.equal(preview.youtubeVideoId(`https://youtube.com/live/${id}`), id);
  assert.equal(preview.youtubeVideoId(`https://www.youtube-nocookie.com/embed/${id}`), id);
});

test("rejects malformed YouTube URLs and lookalike hosts", () => {
  assert.equal(preview.youtubeVideoId("https://youtube.com/watch?v=short"), null);
  assert.equal(preview.youtubeVideoId("https://youtube.com.evil.example/watch?v=AbCdEf12345"), null);
  assert.equal(preview.isYouTubePreview("https://youtube.com.evil.example/watch?v=AbCdEf12345", "m3u8"), false);
  assert.equal(preview.isYouTubePreview("https://www.youtube.com/watch?v=AbCdEf12345", "m3u8"), true);
});
