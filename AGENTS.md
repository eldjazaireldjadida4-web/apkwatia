# Elwatania TV — handoff

## Current state

- Repository: `eldjazaireldjadida4-web/apkwatia`
- Android package: `com.elwataniatv.app`
- Firebase project: `elwataniatvapp`
- Public download page: https://elwataniatvapp.web.app/download
- Admin panel: https://elwataniatvapp.web.app/admin/
- `admin/firebase-config.js` is generated during hosting preparation by `scripts/build-hosting.js`; it is ignored by Git. Never hard-code service-account credentials or commit `google-services.json`.
- Firestore content, streams, archive, websites, social links, banners, branding, maintenance, and version settings are controlled by the admin panel.
- The Play Store release candidate is v8.6.3 / versionCode 41. No release/upload keystore is stored in the repository; a debug APK is never Play-uploadable.

## Safe workflow

1. Read `README.md`, `FIREBASE_SETUP.md`, and `admin/DEPLOY.md` before changes.
2. Never commit service-account JSON, passwords, signing keys, or `.env` files.
3. Run `./gradlew testDebugUnitTest lintDebug lintRelease assembleDebug bundleRelease` after Android changes.
4. For admin changes, run `node scripts/build-hosting.js`, then deploy only the hosting target after review.
5. Verify the public download page and admin login after deployment.
6. Do not change Firestore rules or delete production data without an explicit backup and approval.

## Product boundaries

- Public comments are disabled in Release until the app has the required user terms, consent, report/block tools, and ongoing moderation. Debug retains the comment test path.
- Cloud Functions are not deployed on the free Firebase plan. Aggregated reactions remain read-only until a trusted server-side writer is deployed.
- Do not update the public download page or deploy a Play release until the package is signed with the correct upload key and the Play Console version/signing state is verified.
