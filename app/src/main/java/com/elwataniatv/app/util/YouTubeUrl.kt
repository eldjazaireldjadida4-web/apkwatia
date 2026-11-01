package com.elwataniatv.app.util

import java.net.URI
import java.net.URLDecoder
import java.nio.charset.StandardCharsets

private val youtubeHosts = setOf("youtube.com", "youtube-nocookie.com", "youtu.be")
private val videoIdPattern = Regex("^[A-Za-z0-9_-]{3,}$")

private fun parseYouTubeUri(rawUrl: String): URI? {
    val uri = runCatching { URI(rawUrl.trim()) }.getOrNull() ?: return null
    val scheme = uri.scheme?.lowercase() ?: return null
    val host = uri.host?.lowercase()?.removePrefix("www.") ?: return null
    if (scheme != "http" && scheme != "https") return null
    if (youtubeHosts.none { host == it || host.endsWith(".$it") }) return null
    return uri
}

fun extractYouTubeVideoId(rawUrl: String): String? {
    val uri = parseYouTubeUri(rawUrl) ?: return null
    val host = uri.host?.lowercase()?.removePrefix("www.") ?: return null
    val pathSegments = uri.path.orEmpty().trim('/').split('/').filter { it.isNotBlank() }
    val candidate = when {
        host == "youtu.be" -> pathSegments.firstOrNull()
        pathSegments.firstOrNull()?.lowercase() == "watch" -> {
            uri.rawQuery.orEmpty()
                .split('&')
                .mapNotNull { pair ->
                    val parts = pair.split('=', limit = 2)
                    if (parts.size == 2 && parts[0] == "v") {
                        URLDecoder.decode(parts[1], StandardCharsets.UTF_8.name())
                    } else {
                        null
                    }
                }
                .firstOrNull()
        }
        pathSegments.firstOrNull()?.lowercase() in setOf("embed", "v", "shorts", "live") ->
            pathSegments.getOrNull(1)?.takeUnless { it.equals("live_stream", ignoreCase = true) }
        else -> null
    }
    return candidate?.takeIf { videoIdPattern.matches(it) }
}

private val channelIdPattern = Regex("^UC[A-Za-z0-9_-]{22}$")

/** Channel live-stream embeds use the /embed/live_stream?channel=UC… form, not a video id. */
fun extractYouTubeChannelLiveUrl(rawUrl: String): String? {
    val uri = parseYouTubeUri(rawUrl) ?: return null
    val host = uri.host?.lowercase()?.removePrefix("www.") ?: return null
    val segments = uri.path.orEmpty().trim('/').split('/').filter { it.isNotBlank() }.map { it.lowercase() }
    if (segments != listOf("embed", "live_stream") && segments != listOf("live_stream")) return null
    val channel = uri.rawQuery.orEmpty()
        .split('&')
        .mapNotNull { pair ->
            val parts = pair.split('=', limit = 2)
            if (parts.size == 2 && parts[0] == "channel") {
                URLDecoder.decode(parts[1], StandardCharsets.UTF_8.name())
            } else {
                null
            }
        }
        .firstOrNull() ?: return null
    if (!channelIdPattern.matches(channel)) return null
    return "https://www.youtube-nocookie.com/embed/live_stream?channel=" +
        java.net.URLEncoder.encode(channel, StandardCharsets.UTF_8.name())
}

fun youtubeEmbedUrl(rawUrl: String): String? {
    extractYouTubeVideoId(rawUrl)?.let { videoId ->
        return "https://www.youtube-nocookie.com/embed/$videoId?autoplay=1&modestbranding=1&rel=0&playsinline=1"
    }
    return extractYouTubeChannelLiveUrl(rawUrl)
        ?.let { "$it&autoplay=1&modestbranding=1&rel=0&playsinline=1" }
}

fun isYouTubeVideoUrl(rawUrl: String): Boolean = extractYouTubeVideoId(rawUrl) != null
