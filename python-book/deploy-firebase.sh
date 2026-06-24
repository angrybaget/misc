#!/usr/bin/env bash
# Firebase Hosting deploy — school28-d2877
# Usage: ./deploy-firebase.sh [--no-build]
#
# Service account key location (in priority order):
#   1. ~/.config/secrets/school28-d2877-sa.json  ← постійне місце
#   2. ~/Downloads/school28-d2877-firebase-adminsdk-fbsvc-*.json  ← fallback
# No firebase-tools login needed — uses service account JWT.
#
# Email notifications: save Resend API key to ~/.config/secrets/resend_api_key.txt

set -uo pipefail   # no -e: handle errors manually to send failure email

PROJECT="school28-d2877"
SITE="school28-d2877"
TO_EMAIL="pulseupbass@gmail.com"
START_TIME=$(date '+%Y-%m-%d %H:%M:%S')
BUILD_MODE="${1:-}"

# ── Email helper (Node.js + Resend) ─────────────────────────────────────────
send_email() {
  local status="$1"   # ✅ Успіх / ❌ Помилка
  local detail="$2"   # опис
  local api_key_file="$HOME/.config/secrets/resend_api_key.txt"

  if [[ ! -f "$api_key_file" ]]; then
    echo "  (email skip — ключ не знайдено: $api_key_file)"
    return 0
  fi

  local finish_time; finish_time=$(date '+%Y-%m-%d %H:%M:%S')

  node - "$status" "$detail" "$START_TIME" "$finish_time" "$(cat "$api_key_file")" "$TO_EMAIL" <<'NODEJS'
const https = require('https');
const [, , status, detail, startTime, finishTime, apiKey, toEmail] = process.argv;

const isOk = status.includes('✅');
const color = isOk ? '#16a34a' : '#dc2626';
const bg    = isOk ? '#f0fdf4' : '#fef2f2';

const html = `
<div style="font-family:sans-serif;max-width:520px;margin:0 auto">
  <div style="background:${color};padding:20px 24px;border-radius:8px 8px 0 0">
    <h2 style="margin:0;color:#fff;font-size:20px">${status} Firebase Deploy</h2>
  </div>
  <div style="background:${bg};padding:20px 24px;border:1px solid #e5e7eb;border-top:none;border-radius:0 0 8px 8px">
    <table style="width:100%;border-collapse:collapse;font-size:14px">
      <tr><td style="padding:6px 0;color:#6b7280;width:110px">Проєкт</td>
          <td style="padding:6px 0;font-weight:600">school28-d2877</td></tr>
      <tr><td style="padding:6px 0;color:#6b7280">Початок</td>
          <td style="padding:6px 0">${startTime}</td></tr>
      <tr><td style="padding:6px 0;color:#6b7280">Завершено</td>
          <td style="padding:6px 0">${finishTime}</td></tr>
      <tr><td style="padding:6px 0;color:#6b7280">Деталі</td>
          <td style="padding:6px 0">${detail}</td></tr>
    </table>
    ${isOk ? `<div style="margin-top:16px">
      <a href="https://school28-d2877.web.app" style="background:#4f46e5;color:#fff;padding:10px 20px;border-radius:6px;text-decoration:none;font-size:14px;font-weight:600">
        Відкрити сайт →
      </a>
    </div>` : ''}
  </div>
</div>`;

const body = JSON.stringify({
  from: 'School28 Deploy <onboarding@resend.dev>',
  to: [toEmail],
  subject: `${status} Deploy school28 — ${finishTime}`,
  html,
});

const req = https.request({
  hostname: 'api.resend.com',
  path: '/emails',
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${apiKey}`,
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(body),
  },
}, res => {
  let d = ''; res.on('data', c => d += c);
  res.on('end', () => {
    const j = JSON.parse(d);
    if (j.error || res.statusCode >= 400) {
      process.stderr.write(`Email error: ${JSON.stringify(j)}\n`);
    } else {
      process.stdout.write(`  Email надіслано → ${toEmail}\n`);
    }
  });
});
req.on('error', e => process.stderr.write(`Email send failed: ${e.message}\n`));
req.write(body);
req.end();
NODEJS
}

# ── Error trap: catch any failure, send email, exit ──────────────────────────
on_error() {
  local exit_code=$?
  local line=$1
  echo ""
  echo "❌ Помилка на рядку ${line} (exit ${exit_code})"
  send_email "❌ Помилка" "Скрипт завершився з помилкою на рядку ${line} (exit code: ${exit_code})"
  exit $exit_code
}
trap 'on_error $LINENO' ERR

# ── Locate service account key ───────────────────────────────────────────────
SA_KEY=""
if [[ -f "$HOME/.config/secrets/school28-d2877-sa.json" ]]; then
  SA_KEY="$HOME/.config/secrets/school28-d2877-sa.json"
else
  SA_KEY=$(ls ~/Downloads/school28-d2877-firebase-adminsdk-fbsvc-*.json 2>/dev/null | head -1 || true)
fi

if [[ -z "$SA_KEY" ]]; then
  echo "ERROR: service account key not found."
  echo "  ~/.config/secrets/school28-d2877-sa.json"
  echo "  ~/Downloads/school28-d2877-firebase-adminsdk-fbsvc-*.json"
  send_email "❌ Помилка" "Service account key не знайдено"
  exit 1
fi
echo "  key: $SA_KEY"

# ── 1. Tests ─────────────────────────────────────────────────────────────────
echo "▶ Running tests..."
npm test
echo "  Tests passed ✓"

# ── 2. Build ─────────────────────────────────────────────────────────────────
if [[ "$BUILD_MODE" != "--no-build" ]]; then
  echo "▶ Building..."
  npx expo export --platform web
fi

# ── 3. Get OAuth token ────────────────────────────────────────────────────────
echo "▶ Generating OAuth token..."
TOKEN=$(node - <<NODEJS
const fs = require('fs');
const crypto = require('crypto');
const https = require('https');

const sa = JSON.parse(fs.readFileSync('${SA_KEY}'));
const now = Math.floor(Date.now() / 1000);

const header = Buffer.from(JSON.stringify({ alg: 'RS256', typ: 'JWT' })).toString('base64url');
const payload = Buffer.from(JSON.stringify({
  iss: sa.client_email, sub: sa.client_email,
  aud: 'https://oauth2.googleapis.com/token',
  iat: now, exp: now + 3600,
  scope: 'https://www.googleapis.com/auth/firebase https://www.googleapis.com/auth/cloud-platform',
})).toString('base64url');

const sign = crypto.createSign('RSA-SHA256');
sign.update(header + '.' + payload);
const jwt = header + '.' + payload + '.' + sign.sign(sa.private_key, 'base64url');

const body = 'grant_type=urn%3Aietf%3Aparams%3Aoauth%3Agrant-type%3Ajwt-bearer&assertion=' + jwt;
const req = https.request({
  hostname: 'oauth2.googleapis.com', path: '/token', method: 'POST',
  headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
}, res => {
  let d = ''; res.on('data', c => d += c);
  res.on('end', () => {
    const j = JSON.parse(d);
    if (!j.access_token) { process.stderr.write(d); process.exit(1); }
    process.stdout.write(j.access_token);
  });
});
req.on('error', e => { process.stderr.write(e.message); process.exit(1); });
req.write(body); req.end();
NODEJS
)

# ── 3. Create version ─────────────────────────────────────────────────────────
echo "▶ Creating hosting version..."
VERSION_RESP=$(curl -sf -X POST \
  "https://firebasehosting.googleapis.com/v1beta1/projects/${PROJECT}/sites/${SITE}/versions" \
  -H "Authorization: Bearer ${TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{"config":{"rewrites":[{"glob":"**","path":"/index.html"}]}}')

VERSION_ID=$(echo "$VERSION_RESP" | python3 -c "import sys,json; print(json.load(sys.stdin)['name'].split('/')[-1])")
VERSION_NAME="projects/${PROJECT}/sites/${SITE}/versions/${VERSION_ID}"
echo "  version: ${VERSION_ID}"

# ── 4. Populate + upload ──────────────────────────────────────────────────────
echo "▶ Uploading files..."
python3 - <<PYEOF
import os, hashlib, json, gzip, urllib.request

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

url = f"https://firebasehosting.googleapis.com/v1beta1/{version_name}:populateFiles"
req = urllib.request.Request(url, json.dumps({"files": files}).encode(), method='POST')
req.add_header('Authorization', f'Bearer {token}')
req.add_header('Content-Type', 'application/json')
with urllib.request.urlopen(req) as r:
    body = json.loads(r.read())

upload_url = body['uploadUrl']
required = body.get('uploadRequiredHashes', [])
print(f"  {len(files)} files total, {len(required)} to upload")

for i, sha in enumerate(required, 1):
    req = urllib.request.Request(f"{upload_url}/{sha}", contents[sha], method='POST')
    req.add_header('Authorization', f'Bearer {token}')
    req.add_header('Content-Type', 'application/octet-stream')
    urllib.request.urlopen(req)
    if i % 10 == 0 or i == len(required):
        print(f"  {i}/{len(required)} uploaded")
PYEOF

# ── 5. Finalize ───────────────────────────────────────────────────────────────
echo "▶ Finalizing..."
curl -sf -X PATCH \
  "https://firebasehosting.googleapis.com/v1beta1/${VERSION_NAME}?updateMask=status" \
  -H "Authorization: Bearer ${TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{"status":"FINALIZED"}' > /dev/null

# ── 6. Release ────────────────────────────────────────────────────────────────
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

# ── 7. Email notification ─────────────────────────────────────────────────────
send_email "✅ Успіх" "Деплой завершено. <a href='https://${SITE}.web.app'>https://${SITE}.web.app</a>"
