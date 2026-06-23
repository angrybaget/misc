#!/usr/bin/env bash
# Firebase Hosting deploy — school28-d2877
# Usage: ./deploy-firebase.sh [--no-build]
#
# Service account key location (in priority order):
#   1. ~/.config/secrets/school28-d2877-sa.json  ← постійне місце
#   2. ~/Downloads/school28-d2877-firebase-adminsdk-fbsvc-*.json  ← fallback
# No firebase-tools login needed — uses service account JWT.

set -euo pipefail

PROJECT="school28-d2877"
SITE="school28-d2877"

# Шукаємо ключ — спочатку постійне місце, потім Downloads
SA_KEY=""
if [[ -f "$HOME/.config/secrets/school28-d2877-sa.json" ]]; then
  SA_KEY="$HOME/.config/secrets/school28-d2877-sa.json"
else
  SA_KEY=$(ls ~/Downloads/school28-d2877-firebase-adminsdk-fbsvc-*.json 2>/dev/null | head -1)
fi

if [[ -z "$SA_KEY" ]]; then
  echo "ERROR: service account key not found."
  echo "Очікується один з варіантів:"
  echo "  ~/.config/secrets/school28-d2877-sa.json"
  echo "  ~/Downloads/school28-d2877-firebase-adminsdk-fbsvc-*.json"
  exit 1
fi

echo "  key: $SA_KEY"

# ── 1. Build ────────────────────────────────────────────────────────────────
if [[ "${1:-}" != "--no-build" ]]; then
  echo "▶ Building..."
  npx expo export --platform web
fi

# ── 2. Get OAuth token ───────────────────────────────────────────────────────
echo "▶ Generating OAuth token..."
TOKEN=$(node - <<NODEJS
const fs = require('fs');
const crypto = require('crypto');
const https = require('https');

const sa = JSON.parse(fs.readFileSync('${SA_KEY}'));
const now = Math.floor(Date.now() / 1000);

const header = Buffer.from(JSON.stringify({ alg: 'RS256', typ: 'JWT' })).toString('base64url');
const payload = Buffer.from(JSON.stringify({
  iss: sa.client_email,
  sub: sa.client_email,
  aud: 'https://oauth2.googleapis.com/token',
  iat: now,
  exp: now + 3600,
  scope: 'https://www.googleapis.com/auth/firebase https://www.googleapis.com/auth/cloud-platform',
})).toString('base64url');

const sign = crypto.createSign('RSA-SHA256');
sign.update(header + '.' + payload);
const sig = sign.sign(sa.private_key, 'base64url');
const jwt = header + '.' + payload + '.' + sig;

const body = 'grant_type=urn%3Aietf%3Aparams%3Aoauth%3Agrant-type%3Ajwt-bearer&assertion=' + jwt;
const req = https.request({
  hostname: 'oauth2.googleapis.com', path: '/token', method: 'POST',
  headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
}, res => {
  let d = '';
  res.on('data', c => d += c);
  res.on('end', () => {
    const j = JSON.parse(d);
    if (!j.access_token) { process.stderr.write(d); process.exit(1); }
    process.stdout.write(j.access_token);
  });
});
req.on('error', e => { process.stderr.write(e.message); process.exit(1); });
req.write(body);
req.end();
NODEJS
)

# ── 3. Create version ────────────────────────────────────────────────────────
echo "▶ Creating hosting version..."
VERSION_RESP=$(curl -sf -X POST \
  "https://firebasehosting.googleapis.com/v1beta1/projects/${PROJECT}/sites/${SITE}/versions" \
  -H "Authorization: Bearer ${TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{"config":{"rewrites":[{"glob":"**","path":"/index.html"}]}}')

VERSION_ID=$(echo "$VERSION_RESP" | python3 -c "import sys,json; print(json.load(sys.stdin)['name'].split('/')[-1])")
VERSION_NAME="projects/${PROJECT}/sites/${SITE}/versions/${VERSION_ID}"
echo "  version: ${VERSION_ID}"

# ── 4. Populate + upload ─────────────────────────────────────────────────────
echo "▶ Uploading files..."
python3 - <<PYEOF
import os, hashlib, json, gzip, base64, urllib.request, urllib.error

token = """${TOKEN}"""
version_name = "${VERSION_NAME}"
dist_dir = "dist"

files = {}
contents = {}
for root, dirs, filenames in os.walk(dist_dir):
    dirs[:] = [d for d in dirs if not d.startswith('.')]
    for fname in filenames:
        if fname.startswith('.'): continue
        full = os.path.join(root, fname)
        rel = full[len(dist_dir):]
        with open(full, 'rb') as f:
            raw = f.read()
        gz = gzip.compress(raw, compresslevel=9)
        sha = hashlib.sha256(gz).hexdigest()
        files[rel] = sha
        contents[sha] = gz

# populateFiles
url = f"https://firebasehosting.googleapis.com/v1beta1/{version_name}:populateFiles"
req = urllib.request.Request(url, json.dumps({"files": files}).encode(), method='POST')
req.add_header('Authorization', f'Bearer {token}')
req.add_header('Content-Type', 'application/json')
with urllib.request.urlopen(req) as r:
    body = json.loads(r.read())

upload_url = body['uploadUrl']
required = body.get('uploadRequiredHashes', [])
print(f"  {len(files)} files total, {len(required)} to upload")

# upload each
for i, sha in enumerate(required, 1):
    req = urllib.request.Request(f"{upload_url}/{sha}", contents[sha], method='POST')
    req.add_header('Authorization', f'Bearer {token}')
    req.add_header('Content-Type', 'application/octet-stream')
    urllib.request.urlopen(req)
    if i % 10 == 0 or i == len(required):
        print(f"  {i}/{len(required)} uploaded")
PYEOF

# ── 5. Finalize ──────────────────────────────────────────────────────────────
echo "▶ Finalizing..."
curl -sf -X PATCH \
  "https://firebasehosting.googleapis.com/v1beta1/${VERSION_NAME}?updateMask=status" \
  -H "Authorization: Bearer ${TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{"status":"FINALIZED"}' > /dev/null

# ── 6. Release ───────────────────────────────────────────────────────────────
echo "▶ Releasing..."
curl -sf -X POST \
  "https://firebasehosting.googleapis.com/v1beta1/projects/${PROJECT}/sites/${SITE}/releases?versionName=${VERSION_NAME}" \
  -H "Authorization: Bearer ${TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{}' > /dev/null

echo ""
echo "✅ Deployed!"
echo "   https://${SITE}.web.app"
echo "   https://${SITE}.firebaseapp.com"
