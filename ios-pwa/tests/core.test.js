import test from "node:test";
import assert from "node:assert/strict";
import {
  decodeFirestoreFields,
  normalizeStream,
  normalizeStreams,
  safeHttpsUrl,
  toYouTubeEmbedUrl,
} from "../site/core.mjs";

test("decodes Firestore REST field types recursively", () => {
  assert.deepEqual(decodeFirestoreFields({
    title: { stringValue: "القناة الوطنية" },
    order: { integerValue: "4" },
    active: { booleanValue: true },
    nested: { mapValue: { fields: { tags: { arrayValue: { values: [{ stringValue: "أخبار" }] } } } } },
  }), {
    title: "القناة الوطنية",
    order: 4,
    active: true,
    nested: { tags: ["أخبار"] },
  });
});

test("normalizes a Firestore stream document using the Android schema", () => {
  const stream = normalizeStream({
    name: "projects/elwataniatvapp/databases/(default)/documents/streams/main",
    fields: {
      title: { stringValue: "البث المباشر" },
      url: { stringValue: "https://cdn.example/live.m3u8" },
      type: { stringValue: "m3u8" },
      logoUrl: { stringValue: "https://cdn.example/logo.png" },
      isActive: { booleanValue: true },
      order: { integerValue: "2" },
    },
  });
  assert.deepEqual(stream, {
    id: "main",
    title: "البث المباشر",
    url: "https://cdn.example/live.m3u8",
    type: "m3u8",
    logoUrl: "https://cdn.example/logo.png",
    order: 2,
  });
});

test("rejects inactive, malformed, and unsupported streams", () => {
  assert.equal(normalizeStream({ id: "off", title: "Off", url: "https://cdn.example/live.m3u8", isActive: false }), null);
  assert.equal(normalizeStream({ id: "unsafe", title: "Unsafe", url: "javascript:alert(1)" }), null);
  assert.equal(normalizeStream({ id: "unsupported", title: "Unsupported", url: "https://cdn.example/live", type: "rtmp" }), null);
  assert.equal(normalizeStream({ id: "blank", title: " ", url: "https://cdn.example/live" }), null);
});

test("sorts streams by order then Arabic title", () => {
  const streams = normalizeStreams([
    { id: "z", title: "أخبار", url: "https://cdn.example/z", order: 2 },
    { id: "b", title: "الجزائر", url: "https://cdn.example/b", order: 1 },
    { id: "a", title: "الأولى", url: "https://cdn.example/a", order: 1 },
  ]);
  assert.deepEqual(streams.map(({ id }) => id), ["a", "b", "z"]);
});

test("only accepts HTTPS URLs without embedded credentials", () => {
  assert.equal(safeHttpsUrl("https://cdn.example/live.m3u8"), "https://cdn.example/live.m3u8");
  assert.equal(safeHttpsUrl("http://cdn.example/live.m3u8"), "");
  assert.equal(safeHttpsUrl("javascript:alert(1)"), "");
  assert.equal(safeHttpsUrl("https://user:pass@cdn.example/live.m3u8"), "");
  assert.equal(safeHttpsUrl("//cdn.example/live.m3u8"), "");
});

test("uses only trusted YouTube URL patterns and privacy-enhanced embeds", () => {
  assert.equal(toYouTubeEmbedUrl("https://youtu.be/abcdefghijk"), "https://www.youtube-nocookie.com/embed/abcdefghijk?autoplay=1&playsinline=1&rel=0");
  assert.equal(toYouTubeEmbedUrl("https://www.youtube.com/watch?v=abcdefghijk"), "https://www.youtube-nocookie.com/embed/abcdefghijk?autoplay=1&playsinline=1&rel=0");
  assert.equal(toYouTubeEmbedUrl("https://youtube.evil.example/watch?v=abcdefghijk"), "");
  assert.equal(toYouTubeEmbedUrl("https://youtube.com/watch?v=short"), "");
});

test("converts YouTube channel live_stream URLs into privacy-enhanced channel embeds", () => {
  assert.equal(
    toYouTubeEmbedUrl("https://www.youtube.com/embed/live_stream?channel=UCTIN753Wd_5nxlOuHvuOhdg"),
    "https://www.youtube-nocookie.com/embed/live_stream?channel=UCTIN753Wd_5nxlOuHvuOhdg&autoplay=1&playsinline=1&rel=0",
  );
  assert.equal(toYouTubeEmbedUrl("https://www.youtube.com/embed/live_stream?channel=NOT_A_CHANNEL_ID"), "");
  assert.equal(toYouTubeEmbedUrl("https://www.youtube.com/embed/live_stream"), "");
  assert.equal(toYouTubeEmbedUrl("https://youtube.evil.example/embed/live_stream?channel=UCTIN753Wd_5nxlOuHvuOhdg"), "");
});
