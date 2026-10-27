package com.elwataniatv.app

import java.nio.file.Files
import java.nio.file.Path
import java.nio.file.Paths
import org.junit.Assert.assertFalse
import org.junit.Assert.assertTrue
import org.junit.Test

/** Regression guard: client reaction writes must not return to the Android layer. */
class InteractionWriteSafetyTest {

    @Test
    fun clientReactionWriteApisAndHandlersAreAbsent() {
        val firebaseSync = source("app/src/main/java/com/elwataniatv/app/data/remote/FirebaseSync.kt")
        val repository = source("app/src/main/java/com/elwataniatv/app/data/repository/WataniaRepository.kt")
        val viewModel = source("app/src/main/java/com/elwataniatv/app/ui/viewmodel/MainViewModel.kt")
        val mainActivity = source("app/src/main/java/com/elwataniatv/app/MainActivity.kt")
        val liveScreen = source("app/src/main/java/com/elwataniatv/app/ui/screens/LiveScreen.kt")
        val commentSection = source("app/src/main/java/com/elwataniatv/app/ui/components/CommentSection.kt")

        assertFalse(firebaseSync.contains("submitLiveReaction"))
        assertFalse(firebaseSync.contains("toggleCommentReaction"))
        assertFalse(repository.contains("reactLive("))
        assertFalse(repository.contains("likeComment("))
        assertFalse(viewModel.contains("reactLive("))
        assertFalse(viewModel.contains("likeComment("))
        assertFalse(mainActivity.contains("onReact"))
        assertFalse(mainActivity.contains("onLikeComment"))
        assertFalse(liveScreen.contains("liveReactionsEnabled"))
        assertFalse(liveScreen.contains("onReact"))
        assertFalse(commentSection.contains("commentReactionsEnabled"))
        assertFalse(commentSection.contains("onLikeComment"))

        assertTrue(firebaseSync.contains("listenLiveReactions"))
        assertTrue(firebaseSync.contains("listenComments"))
    }

    @Test
    fun publicCommentsAreDisabledInReleaseBuildAndFailedPostsAreNotCached() {
        val build = source("app/build.gradle.kts")
        val firebaseSync = source("app/src/main/java/com/elwataniatv/app/data/remote/FirebaseSync.kt")
        val contentSync = source("app/src/main/java/com/elwataniatv/app/data/remote/FirestoreContentSync.kt")
        val repository = source("app/src/main/java/com/elwataniatv/app/data/repository/WataniaRepository.kt")
        val liveScreen = source("app/src/main/java/com/elwataniatv/app/ui/screens/LiveScreen.kt")
        val addComment = repository.substringAfter("suspend fun addComment").substringBefore("fun submitFeedback")

        assertTrue(build.contains("buildConfigField(\"boolean\", \"PUBLIC_COMMENTS_ENABLED\", \"false\")"))
        assertTrue(build.contains("buildConfigField(\"boolean\", \"PUBLIC_COMMENTS_ENABLED\", \"true\")"))
        assertTrue(firebaseSync.contains("if (BuildConfig.PUBLIC_COMMENTS_ENABLED)"))
        assertTrue(contentSync.contains("if (!BuildConfig.PUBLIC_COMMENTS_ENABLED)"))
        assertTrue(liveScreen.contains("enableComments && BuildConfig.PUBLIC_COMMENTS_ENABLED"))
        assertTrue(addComment.indexOf("firebaseSync.postComment") < addComment.indexOf("commentsDao().insertComment"))
    }

    private fun source(relativePath: String): String {
        val cleanRelative = relativePath.removePrefix("app/")
        var dir: Path? = Paths.get(".").toAbsolutePath().normalize()
        while (dir != null) {
            val p1 = dir.resolve(relativePath)
            if (Files.exists(p1)) return Files.readAllBytes(p1).toString(Charsets.UTF_8)
            val p2 = dir.resolve(cleanRelative)
            if (Files.exists(p2)) return Files.readAllBytes(p2).toString(Charsets.UTF_8)
            val p3 = dir.resolve("app").resolve(cleanRelative)
            if (Files.exists(p3)) return Files.readAllBytes(p3).toString(Charsets.UTF_8)
            dir = dir.parent
        }
        return ""
    }
}
