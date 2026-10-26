plugins {
    alias(libs.plugins.android.application)
    alias(libs.plugins.kotlin.android)
    alias(libs.plugins.kotlin.compose)
    alias(libs.plugins.ksp)
    alias(libs.plugins.kotlin.serialization)
    alias(libs.plugins.hilt)
}

val googleServicesFile = rootProject.file("google-services.json")
val appGoogleServicesFile = file("google-services.json")
val hasGoogleServices = googleServicesFile.exists() || appGoogleServicesFile.exists()
if (hasGoogleServices) {
    if (googleServicesFile.exists() && !appGoogleServicesFile.exists()) {
        copy {
            from(googleServicesFile)
            into(projectDir)
        }
    }
    apply(plugin = "com.google.gms.google-services")
    apply(plugin = "com.google.firebase.crashlytics")
} else {
    tasks.configureEach {
        if (name in setOf("packageDebug", "packageRelease", "bundleDebug", "bundleRelease")) {
            doFirst {
                throw GradleException(
                    "Cannot build an installable APK/AAB without google-services.json for com.elwataniatv.app. Add the Android client config locally at app/google-services.json or the project root."
                )
            }
        }
    }
}

android {
    namespace = "com.elwataniatv.app"
    compileSdk = 36

    // In-app language switching (Arabic/English) must work inside Play App
    // Bundles: keep all locale resources in the base module instead of
    // splitting them, otherwise a device running "en" cannot switch to
    // Arabic without Play Core downloading the split on demand.
    bundle {
        language {
            enableSplit = false
        }
        density {
            enableSplit = true
        }
        abi {
            enableSplit = true
        }
    }

    defaultConfig {
        applicationId = "com.elwataniatv.app"
        minSdk = 24
        targetSdk = 36
        versionCode = 39
        versionName = "8.6.1"

        testInstrumentationRunner = "androidx.test.runner.AndroidJUnitRunner"
        vectorDrawables {
            useSupportLibrary = true
        }
    }

    // Release signing is opt-in. Values may come from Gradle properties or
    // environment variables; no secret or keystore is stored in this repo.
    fun signingValue(name: String): String? =
        providers.gradleProperty(name).orNull?.takeIf { it.isNotBlank() }
            ?: providers.environmentVariable(name).orNull?.takeIf { it.isNotBlank() }

    val releaseStoreFile = signingValue("RELEASE_STORE_FILE")
    val releaseStorePassword = signingValue("RELEASE_STORE_PASSWORD")
    val releaseKeyAlias = signingValue("RELEASE_KEY_ALIAS")
    val releaseKeyPassword = signingValue("RELEASE_KEY_PASSWORD")
    val hasReleaseSigning = listOf(
        releaseStoreFile,
        releaseStorePassword,
        releaseKeyAlias,
        releaseKeyPassword
    ).all { it != null }

    fun resolveReleaseStoreFile(path: String): File {
        val appRelative = file(path)
        return if (appRelative.exists()) appRelative else rootProject.file(path)
    }

    signingConfigs {
        create("debugConfig") {
            storeFile = file("${rootDir}/debug.keystore")
            storePassword = "android"
            keyAlias = "androiddebugkey"
            keyPassword = "android"
        }
        if (hasReleaseSigning) {
            create("releaseConfig") {
                storeFile = resolveReleaseStoreFile(releaseStoreFile!!)
                storePassword = releaseStorePassword!!
                keyAlias = releaseKeyAlias!!
                keyPassword = releaseKeyPassword!!
            }
        }
    }

    buildTypes {
        release {
            if (hasReleaseSigning) {
                signingConfig = signingConfigs.getByName("releaseConfig")
            }
            isMinifyEnabled = true
            isShrinkResources = true
            proguardFiles(
                getDefaultProguardFile("proguard-android-optimize.txt"),
                "proguard-rules.pro"
            )
        }
        debug {
            // Use the committed debug.keystore when present (stable debug signature
            // across machines / CI); otherwise fall back to the auto-generated
            // ~/.android/debug.keystore so a fresh clone always builds.
            signingConfig = if (file("${rootDir}/debug.keystore").exists()) {
                signingConfigs.getByName("debugConfig")
            } else {
                signingConfigs.getByName("debug")
            }
        }
    }

    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_17
        targetCompatibility = JavaVersion.VERSION_17
    }



    buildFeatures {
        compose = true
        buildConfig = true
    }

    configurations.all {
        exclude(group = "androidx.privacysandbox.ads", module = "ads-adservices")
        exclude(group = "androidx.privacysandbox.ads", module = "ads-adservices-java")
    }

    packaging {
        resources {
            excludes += "/META-INDEX/AL2.0"
            excludes += "/META-INDEX/LGPL2.1"
        }
    }

    // lintDebug/lint run in CI and locally; skip the duplicate lintVital
    // pass on release assembles to keep constrained builders (3.5-4 GB
    // cgroup) from being OOM-killed after R8 minification.
    lint {
        checkReleaseBuilds = false
        abortOnError = true
    }
}

dependencies {
    implementation(libs.androidx.core.ktx)
    implementation(libs.androidx.core.splashscreen)
    implementation(libs.androidx.lifecycle.runtime.ktx)
    implementation(libs.androidx.lifecycle.viewmodel.compose)
    implementation(libs.androidx.lifecycle.runtime.compose)
    implementation(libs.androidx.activity.compose)

    implementation(platform(libs.androidx.compose.bom))
    implementation(libs.androidx.ui)
    implementation(libs.androidx.ui.graphics)
    implementation(libs.androidx.ui.tooling.preview)
    implementation(libs.androidx.material3)
    // Android TV optimized Material components and focus-aware foundations.
    implementation(libs.androidx.tv.material)
    implementation(libs.androidx.tv.foundation)
    implementation(libs.androidx.material.icons.extended)
    implementation(libs.androidx.navigation.compose)

    implementation(libs.androidx.room.runtime)
    implementation(libs.androidx.room.ktx)
    ksp(libs.androidx.room.compiler)

    implementation(libs.androidx.media3.exoplayer)
    implementation(libs.androidx.media3.exoplayer.hls)
    implementation(libs.androidx.media3.ui)
    implementation(libs.androidx.media3.session)
    implementation("androidx.media:media:1.7.0")

    implementation(libs.coil.compose)
    implementation(libs.kotlinx.serialization.json)
    implementation(libs.kotlinx.coroutines.android)

    implementation(libs.hilt.android)
    implementation(libs.hilt.navigation.compose)
    ksp(libs.hilt.compiler)

    // Firebase (versions managed by BOM)
    implementation(platform(libs.firebase.bom))
    implementation(libs.firebase.firestore)
    implementation(libs.firebase.auth)
    implementation(libs.firebase.messaging)
    // Analytics/Measurement excluded to eliminate adservices ServiceUnavailableException on emulator
    // implementation(libs.firebase.analytics)
    implementation(libs.firebase.crashlytics)
    implementation(libs.firebase.storage)
    implementation(libs.firebase.appcheck)
    implementation(libs.firebase.appcheck.playintegrity)
    implementation(libs.firebase.appcheck.debug)
    implementation(libs.play.review)

    testImplementation(libs.junit)
    androidTestImplementation(platform(libs.androidx.compose.bom))
    androidTestImplementation(libs.androidx.compose.ui.test.junit4)
    androidTestImplementation(libs.androidx.test.ext.junit)
    debugImplementation(libs.androidx.ui.tooling)
    debugImplementation(libs.androidx.compose.ui.test.manifest)
}

tasks.withType<org.jetbrains.kotlin.gradle.tasks.KotlinCompile>().configureEach {
    compilerOptions {
        jvmTarget.set(org.jetbrains.kotlin.gradle.dsl.JvmTarget.JVM_17)
    }
}
