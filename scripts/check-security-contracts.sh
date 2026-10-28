#!/usr/bin/env bash
set -euo pipefail

root_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
rules="$root_dir/admin/firestore.rules"
gradle="$root_dir/app/build.gradle.kts"
hosting_build="$root_dir/scripts/build-hosting.js"
hosting_config="$root_dir/admin/firebase.json"
root_hosting_config="$root_dir/firebase.json"
api_handler="$root_dir/api/handler.js"
api_security="$root_dir/api/security.js"
api_main="$root_dir/api/send-push.js"


require() {
  local pattern="$1"
  local file="$2"
  if ! grep -Fq "$pattern" "$file"; then
    echo "Missing expected contract in $file: $pattern" >&2
    exit 1
  fi
}

require "allow create: if isSignedIn()" "$rules"
require "match /likes/{programId}" "$rules"
require "match /push_tokens/{userUid}" "$rules"
require "request.resource.data.userUid == request.auth.uid" "$rules"
require "allow write: if isAdmin()" "$rules"
require "firebaseSyncScope?.isActive == true" "$root_dir/app/src/main/java/com/elwataniatv/app/data/repository/WataniaRepository.kt"
require "while (isActive)" "$root_dir/app/src/main/java/com/elwataniatv/app/ui/viewmodel/MainViewModel.kt"
require "RELEASE_STORE_PASSWORD" "$gradle"
require "validateReleaseSigning" "$gradle"
require 'stream-preview.js' "$root_dir/admin/index.html"
require stream-preview.js "$hosting_build"

require 'verifyIdToken(token, true)' "$api_main"
require 'claims?.admin === true' "$api_security"
require 'claims?.role === "admin"' "$api_security"
require 'allowedOrigins.has(origin)' "$api_handler"
require 'Authorization: `Bearer ${idToken}`' "$root_dir/admin/index.html"
require 'endpoint.origin !== "https://elwataniatv-channel.vercel.app"' "$root_dir/admin/index.html"
require 'endpoint.pathname !== "/api/send-push"' "$root_dir/admin/index.html"
require '"node": "22.x"' "$root_dir/api/package.json"
require '"rules": "deny-all.rules"' "$root_dir/rules-tests/firebase.json"
require 'allow read, write: if false' "$root_dir/rules-tests/deny-all.rules"
if grep -Fq 'Access-Control-Allow-Origin", "*"' "$api_handler"; then
  echo "Push API must not allow wildcard CORS" >&2
  exit 1
fi


privacy_default="https://elwataniatvapp.web.app/privacy.html"
privacy_official="https://elwataniatv.dz/privacy"
privacy_default_files=(
  "$root_dir/scripts/seed-firestore.js"
)
for privacy_file in "${privacy_default_files[@]}"; do
  require "$privacy_default" "$privacy_file"
  if grep -Fq "$privacy_official" "$privacy_file"; then
    echo "Unavailable official privacy URL returned in runtime defaults: $privacy_file" >&2
    exit 1
  fi
done
runtime_privacy_files=(
  "$root_dir/app"
  "$root_dir/admin/index.html"
  "$root_dir/scripts"
)
if grep -RInF --exclude='check-security-contracts.sh' "$privacy_official" "${runtime_privacy_files[@]}" >/dev/null; then
  echo "Unavailable official privacy URL returned in runtime, admin UI, or seed paths" >&2
  exit 1
fi


require '"source": "admin/**"' "$root_hosting_config"
require '"Content-Security-Policy"' "$root_hosting_config"
require '"source": "admin/**"' "$hosting_config"
require '"Content-Security-Policy"' "$hosting_config"
require 'https://cdn.jsdelivr.net' "$root_hosting_config"
require 'connect-src '\''self'\'' https: wss:' "$root_hosting_config"
require 'media-src '\''self'\'' data: blob: https:' "$root_hosting_config"
require 'worker-src '\''self'\'' blob:' "$root_hosting_config"
require 'https://www.youtube-nocookie.com' "$root_hosting_config"
require 'https://cdn.jsdelivr.net' "$hosting_config"
require 'media-src '\''self'\'' data: blob: https:' "$hosting_config"
require '"public": "hosting-dist"' "$hosting_config"
require '"predeploy": [' "$hosting_config"
require 'node ../scripts/build-hosting.js' "$hosting_config"
require '"source": "/"' "$hosting_config"
require '"source": "/admin"' "$hosting_config"
require '"source": "/admin/"' "$hosting_config"
require '"source": "/privacy"' "$hosting_config"
require '"source": "/privacy/"' "$hosting_config"
if grep -Fq '"source": "**"' "$hosting_config"; then
  echo "Catch-all Hosting rewrite must not be present" >&2
  exit 1
fi
require 'fs.cpSync' "$hosting_build"
require 'admin/hosting-dist/' "$root_dir/.gitignore"
require 'path.join(rootDir, "ios-pwa", "site")' "$hosting_build"
require 'path.join(outputDir, "ios", "config.js")' "$hosting_build"
require 'safeHttpsUrl' "$root_dir/ios-pwa/site/core.mjs"
require 'serviceWorker.register' "$root_dir/ios-pwa/site/app.js"
require 'manifest.webmanifest' "$root_dir/ios-pwa/site/index.html"
require 'STATIC_FILES' "$root_dir/ios-pwa/site/sw.js"
require '"./config.js"' "$root_dir/ios-pwa/site/sw.js"
require 'https://firestore.googleapis.com' "$root_dir/firebase.json"
node -e 'for (const file of process.argv.slice(1)) JSON.parse(require("fs").readFileSync(file, "utf8"))' "$root_dir/firebase.json" "$root_dir/admin/firebase.json" "$root_dir/ios-pwa/site/manifest.webmanifest"

if git -C "$root_dir" ls-files | grep -E '(^|/)([^/]+\.(jks|keystore|p12|p8|key)|google-services\.json)$' >/dev/null; then
  echo "Tracked signing/Firebase secret file detected" >&2
  exit 1
fi

node --test "$root_dir/admin/tests/stream-preview.test.js" "$root_dir/ios-pwa/tests/core.test.js"

echo "Security and release contract checks passed."
