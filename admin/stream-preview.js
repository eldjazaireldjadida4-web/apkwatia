(function (root) {
  const youtubeHosts = new Set(["youtube.com", "m.youtube.com", "youtu.be", "youtube-nocookie.com"]);

  function normalizePreviewUrl(rawUrl) {
    try {
      const url = new URL(String(rawUrl ?? "").trim());
      if (!["http:", "https:"].includes(url.protocol) || url.username || url.password) return null;
      return url;
    } catch {
      return null;
    }
  }

  function youtubeVideoId(rawUrl) {
    const url = normalizePreviewUrl(rawUrl);
    if (!url) return null;
    const host = url.hostname.toLowerCase().replace(/^www\./, "");
    let id = null;
    if (host === "youtu.be") {
      id = url.pathname.split("/").filter(Boolean)[0] || null;
    } else if (["youtube.com", "m.youtube.com", "youtube-nocookie.com"].includes(host)) {
      id = url.searchParams.get("v") || url.pathname.match(/^\/(?:live|embed|shorts)\/([^/?#]+)/)?.[1] || null;
    }
    return id && /^[A-Za-z0-9_-]{11}$/.test(id) ? id : null;
  }

  function isYouTubePreview(rawUrl, type) {
    const url = normalizePreviewUrl(rawUrl);
    if (!url) return false;
    const host = url.hostname.toLowerCase().replace(/^www\./, "");
    return type === "youtube" || youtubeHosts.has(host);
  }

  root.WataniaStreamPreview = Object.freeze({
    normalizePreviewUrl,
    youtubeVideoId,
    isYouTubePreview,
  });
})(typeof window === "undefined" ? globalThis : window);
