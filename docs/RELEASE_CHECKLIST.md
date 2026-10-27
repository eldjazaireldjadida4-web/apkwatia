# Release Checklist — v8.6.4 / versionCode 42

## Verified in the source and build

- [x] Package: `com.elwataniatv.app`; `targetSdk 36` for Google Play's 2026 requirement.
- [x] Release builds now fail if a signing keystore or any required signing value is missing.
- [x] Release configuration reads `RELEASE_STORE_FILE`, `RELEASE_STORE_PASSWORD`, `RELEASE_KEY_ALIAS`, and `RELEASE_KEY_PASSWORD` from protected Gradle properties or environment variables; no signing secret belongs in Git.
- [x] Public comments remain disabled in Release until terms, reporting, blocking, and ongoing moderation are implemented.
- [x] Admin stream preview validates HTTP(S)/YouTube links, reports playback states honestly, and no longer trusts raw Firestore values in link/color markup.
- [x] Admin preview tests and CI workflow are present.
- [x] 69 Android unit tests, 30 Firestore rules tests, and 3 admin-preview tests passed; `lintDebug`, `lintRelease`, and Android UI-test compilation passed.
- [x] Admin Hosting was deployed and verified with the required CSP headers; the login page loads without browser JavaScript errors. The public download asset was preserved.

## Required before uploading to Play

- [ ] Confirm the app's current highest `versionCode`, whether a Play listing already exists for this package, and its Play App Signing state.
- [ ] First Play release: create one listing for `com.elwataniatv.app`, enroll in Play App Signing, and use the new upload key.
- [ ] Existing listing with Play App Signing: submit the provided upload certificate in **Request upload key reset** and wait for Google's approval. The new key is an upload key, not the app-signing key.
- [ ] Existing legacy listing without Play App Signing: do not use the new key as a replacement; recover the original key or resolve the case with Play Support.
- [ ] Only after the applicable step above, upload `ElWataniaTV-v8.6.4-release-upload-signed-42.aab` to Internal testing.
- [ ] Install the build from Play Internal testing; verify launch, landscape playback, audio/video, stream switching, background/return, and update behavior on BlueStacks 5 and a physical Android device.
- [ ] Capture genuine screenshots from the final app build; no placeholder screenshots are acceptable.
- [ ] Complete Data safety, content rating, target audience, store listing, privacy policy, and any Play declarations using the actual release behavior.
- [ ] Confirm the right to distribute every live stream and archive item.
- [ ] Only after internal testing, decide whether to update the public download page; its current APK is older and has a different signing identity.

## Signing files

The upload keystore, PEM certificate, and credentials are in the private workspace folder `Projects/apkwatia/release-signing/`, outside the repository. Never commit or publicly share the keystore or its passwords. Keep a second secure backup before deleting the local copy.
