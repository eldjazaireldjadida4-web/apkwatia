package com.elwataniatv.app.util

import org.junit.Assert.assertEquals
import org.junit.Assert.assertNull
import org.junit.Test

class YouTubeLiveStreamUrlTest {
    @Test
    fun treatsChannelLiveStreamUrlAsChannelEmbedNotVideoId() {
        val url = "https://www.youtube.com/embed/live_stream?channel=UCTIN753Wd_5nxlOuHvuOhdg"
        assertNull(extractYouTubeVideoId(url))
        assertEquals(
            "https://www.youtube-nocookie.com/embed/live_stream?channel=UCTIN753Wd_5nxlOuHvuOhdg&autoplay=1&modestbranding=1&rel=0&playsinline=1",
            youtubeEmbedUrl(url)
        )
    }

    @Test
    fun rejectsChannelLiveStreamUrlsWithMalformedChannelIds() {
        assertNull(youtubeEmbedUrl("https://www.youtube.com/embed/live_stream?channel=BAD"))
        assertNull(youtubeEmbedUrl("https://www.youtube.com/embed/live_stream"))
    }

    @Test
    fun rejectsChannelLiveStreamPathsOnUnsafeHosts() {
        assertNull(youtubeEmbedUrl("https://youtube.evil.example/embed/live_stream?channel=UCTIN753Wd_5nxlOuHvuOhdg"))
    }
}
