import { normalizeStreams, safeHttpsUrl, toYouTubeEmbedUrl } from "./core.mjs";

const config = window.__WATANIA_FIREBASE_CONFIG__;
const elements = {
  channels: document.querySelector("#channels"),
  player: document.querySelector("#player"),
  playerTitle: document.querySelector("#player-title"),
  playerState: document.querySelector("#player-state"),
  headerLive: document.querySelector("#header-live"),
  playerEmpty: document.querySelector("#player-empty"),
  status: document.querySelector("#status"),
  refresh: document.querySelector("#refresh"),
  install: document.querySelector("#install-help"),
  installClose: document.querySelector("#install-close"),
};

let streams = [];
let activeId = "";
let loading = false;

function setStatus(message, kind = "info") {
  elements.status.textContent = message;
  elements.status.dataset.kind = kind;
  elements.status.hidden = !message;
}

function setPlayerState(message, state) {
  const label = elements.playerState?.querySelector("span:not(.live-dot)");
  if (label) label.textContent = message;
  if (elements.playerState) elements.playerState.dataset.state = state;
  const headerLabel = elements.headerLive?.querySelector("[data-live-label]");
  const headerMessages = { idle: "اختر قناة", ready: "جاهز للتشغيل", live: "على الهواء", error: "تعذّر التشغيل" };
  const headerMessage = headerMessages[state] ?? "البث المباشر";
  if (headerLabel) headerLabel.textContent = headerMessage;
  if (elements.headerLive) {
    elements.headerLive.dataset.state = state;
    elements.headerLive.setAttribute("aria-label", `حالة البث: ${headerMessage}`);
  }
}

function makeElement(tag, className, text = "") {
  const element = document.createElement(tag);
  if (className) element.className = className;
  if (text) element.textContent = text;
  return element;
}

function renderChannels() {
  elements.channels.replaceChildren();
  if (!streams.length) {
    elements.channels.append(makeElement("p", "empty-state", "لا توجد قنوات بث متاحة حالياً."));
    return;
  }
  for (const stream of streams) {
    const button = makeElement("button", `channel-card${stream.id === activeId ? " is-active" : ""}`);
    button.type = "button";
    button.setAttribute("aria-pressed", String(stream.id === activeId));
    button.setAttribute("aria-label", `شاهد ${stream.title}`);
    if (stream.logoUrl) {
      const logo = makeElement("img", "channel-logo");
      logo.src = stream.logoUrl;
      logo.alt = "";
      logo.loading = "lazy";
      logo.referrerPolicy = "no-referrer";
      const fallback = () => {
        if (!logo.isConnected) return;
        const tile = makeElement("span", "channel-logo-fallback", stream.title.slice(0, 1));
        logo.replaceWith(tile);
      };
      logo.addEventListener("error", fallback, { once: true });
      const settleTimer = setTimeout(() => {
        if (!(logo.complete && logo.naturalWidth > 0)) fallback();
      }, 5000);
      logo.addEventListener("load", () => clearTimeout(settleTimer), { once: true });
      button.append(logo);
    } else {
      button.append(makeElement("span", "channel-logo-fallback", stream.title.slice(0, 1)));
    }
    const details = makeElement("span", "channel-copy");
    details.append(makeElement("span", "channel-title", stream.title));
    details.append(makeElement("span", "channel-caption", stream.id === activeId ? "يُعرض الآن" : "بث مباشر"));
    button.append(details);
    button.addEventListener("click", () => selectStream(stream.id));
    elements.channels.append(button);
  }
}

function renderPlayer() {
  const stream = streams.find((item) => item.id === activeId);
  elements.player.replaceChildren();
  if (!stream) {
    elements.player.hidden = true;
    elements.playerEmpty.hidden = false;
    elements.playerTitle.textContent = "البث المباشر";
    setPlayerState("اختر قناة", "idle");
    return;
  }
  elements.player.hidden = false;
  elements.playerEmpty.hidden = true;
  elements.playerTitle.textContent = stream.title;
  if (stream.type === "youtube") {
    const embedUrl = toYouTubeEmbedUrl(stream.url);
    if (!embedUrl) {
      setPlayerState("تعذّر تشغيل هذه القناة", "error");
      setStatus("رابط البث غير صالح. اختر قناة أخرى أو أبلغ إدارة التطبيق.", "error");
      elements.player.hidden = true;
      elements.playerEmpty.hidden = false;
      return;
    }
    const frame = makeElement("iframe", "player-frame");
    setPlayerState("شغّل البث من YouTube", "ready");
    frame.src = embedUrl;
    frame.title = `بث مباشر: ${stream.title}`;
    frame.allow = "autoplay; encrypted-media; picture-in-picture; fullscreen";
    frame.allowFullscreen = true;
    frame.referrerPolicy = "strict-origin-when-cross-origin";
    elements.player.append(frame);
    return;
  }
  const videoUrl = safeHttpsUrl(stream.url);
  if (!videoUrl) {
    setPlayerState("تعذّر تشغيل هذه القناة", "error");
    setStatus("رابط البث غير آمن أو غير صالح. اختر قناة أخرى أو أبلغ إدارة التطبيق.", "error");
    elements.player.hidden = true;
    elements.playerEmpty.hidden = false;
    return;
  }
  const video = makeElement("video", "player-video");
  setPlayerState("اضغط تشغيل لبدء المشاهدة", "ready");
  video.src = videoUrl;
  video.controls = true;
  video.playsInline = true;
  video.preload = "none";
  video.setAttribute("aria-label", `مشغل ${stream.title}`);
  video.addEventListener("error", () => {
    setPlayerState("تعذّر تشغيل هذه القناة", "error");
    setStatus("تعذّر تشغيل البث. تحقق من اتصال الإنترنت أو جرّب قناة أخرى.", "error");
  }, { once: true });
  video.addEventListener("playing", () => {
    setPlayerState("على الهواء الآن", "live");
    setStatus("أنت تشاهد البث المباشر الآن.", "success");
  }, { once: true });
  elements.player.append(video);
}

function selectStream(id) {
  activeId = id;
  setStatus("اختر زر التشغيل داخل الفيديو لبدء المشاهدة.", "info");
  renderChannels();
  renderPlayer();
  document.querySelector("#live-section").scrollIntoView({ behavior: "smooth", block: "start" });
}

async function fetchStreams() {
  if (loading) return;
  if (!config?.apiKey || !config?.projectId) {
    setStatus("إعداد Firebase غير مكتمل. راجع ملف إعداد الإصدار قبل النشر.", "error");
    return;
  }
  loading = true;
  elements.refresh.disabled = true;
  elements.refresh.setAttribute("aria-busy", "true");
  setStatus("جارٍ تحميل القنوات…");
  try {
    const url = new URL(`https://firestore.googleapis.com/v1/projects/${encodeURIComponent(config.projectId)}/databases/(default)/documents/streams`);
    url.searchParams.set("pageSize", "100");
    url.searchParams.set("key", config.apiKey);
    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), 12000);
    let response;
    try {
      response = await fetch(url, { cache: "no-store", headers: { Accept: "application/json" }, signal: controller.signal });
    } finally {
      window.clearTimeout(timeout);
    }
    if (!response.ok) throw new Error(`firestore-${response.status}`);
    const payload = await response.json();
    streams = normalizeStreams(Array.isArray(payload.documents) ? payload.documents : []);
    if (!streams.some((item) => item.id === activeId)) activeId = "";
    renderChannels();
    renderPlayer();
    setStatus(streams.length ? "القنوات محدّثة. اضغط تشغيل داخل الفيديو للمشاهدة." : "لا توجد قنوات بث متاحة حالياً.", streams.length ? "success" : "info");
  } catch {
    const message = navigator.onLine
      ? "تعذّر الاتصال بالقنوات الآن. أعد المحاولة بعد قليل."
      : "لا يوجد اتصال بالإنترنت. اتصل بالشبكة ثم أعد المحاولة.";
    setStatus(message, "error");
    if (!streams.length) {
      elements.channels.replaceChildren(makeElement("p", "empty-state", message));
      elements.player.hidden = true;
      elements.playerEmpty.hidden = false;
    }
  } finally {
    loading = false;
    elements.refresh.disabled = false;
    elements.refresh.removeAttribute("aria-busy");
  }
}

function setupInstallHelp() {
  const isIos = /iphone|ipad|ipod/i.test(navigator.userAgent);
  const isStandalone = window.matchMedia("(display-mode: standalone)").matches || navigator.standalone === true;
  let dismissed = false;
  try {
    dismissed = localStorage.getItem("watania-install-help-dismissed") === "1";
  } catch {}
  if (isIos && !isStandalone && !dismissed) elements.install.hidden = false;
  elements.installClose.addEventListener("click", () => {
    try {
      localStorage.setItem("watania-install-help-dismissed", "1");
    } catch {}
    elements.install.hidden = true;
  });
}

elements.refresh.addEventListener("click", fetchStreams);
window.addEventListener("online", fetchStreams);
setupInstallHelp();
fetchStreams();

if ("serviceWorker" in navigator && window.isSecureContext) {
  navigator.serviceWorker.register("./sw.js", { scope: "./" }).catch(() => {});
}
