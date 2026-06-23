/**
 * Migrates all lesson data from TypeScript files to Firestore.
 * Run: npx tsx scripts/migrate-to-firestore.ts
 *
 * Uses service account at ~/.config/secrets/school28-d2877-sa.json
 * Does NOT require firebase login — REST API only.
 */
import * as fs from 'fs';
import * as crypto from 'crypto';
import * as https from 'https';
import { ALL_CONTENT } from '../src/data/curriculum/index';

const PROJECT = 'school28-d2877';
const SA_PATH = process.env.HOME + '/.config/secrets/school28-d2877-sa.json';

// ── Auth ─────────────────────────────────────────────────────────────────────

async function getToken(): Promise<string> {
  const sa = JSON.parse(fs.readFileSync(SA_PATH, 'utf8'));
  const now = Math.floor(Date.now() / 1000);
  const header = Buffer.from(JSON.stringify({ alg: 'RS256', typ: 'JWT' })).toString('base64url');
  const payload = Buffer.from(JSON.stringify({
    iss: sa.client_email, sub: sa.client_email,
    aud: 'https://oauth2.googleapis.com/token',
    iat: now, exp: now + 3600,
    scope: 'https://www.googleapis.com/auth/datastore https://www.googleapis.com/auth/cloud-platform',
  })).toString('base64url');
  const sign = crypto.createSign('RSA-SHA256');
  sign.update(header + '.' + payload);
  const jwt = header + '.' + payload + '.' + sign.sign(sa.private_key, 'base64url');

  return new Promise((resolve, reject) => {
    const body = 'grant_type=urn%3Aietf%3Aparams%3Aoauth%3Agrant-type%3Ajwt-bearer&assertion=' + jwt;
    const req = https.request({
      hostname: 'oauth2.googleapis.com', path: '/token', method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    }, (res: import('http').IncomingMessage) => {
      let d = ''; res.on('data', (c: Buffer) => d += c);
      res.on('end', () => {
        const j = JSON.parse(d);
        j.access_token ? resolve(j.access_token) : reject(new Error(d));
      });
    });
    req.write(body); req.end();
  });
}

// ── Firestore REST ────────────────────────────────────────────────────────────

function toFirestoreValue(v: unknown): object {
  if (v === null || v === undefined) return { nullValue: null };
  if (typeof v === 'boolean') return { booleanValue: v };
  if (typeof v === 'number') return Number.isInteger(v) ? { integerValue: String(v) } : { doubleValue: v };
  if (typeof v === 'string') return { stringValue: v };
  if (Array.isArray(v)) return { arrayValue: { values: v.map(toFirestoreValue) } };
  if (typeof v === 'object') {
    const fields: Record<string, object> = {};
    for (const [k, val] of Object.entries(v as object)) fields[k] = toFirestoreValue(val);
    return { mapValue: { fields } };
  }
  return { stringValue: String(v) };
}

function toFirestoreDoc(data: object): object {
  const fields: Record<string, object> = {};
  for (const [k, v] of Object.entries(data)) fields[k] = toFirestoreValue(v);
  return { fields };
}

async function upsertDoc(token: string, path: string, data: object): Promise<void> {
  const body = JSON.stringify(toFirestoreDoc(data));
  return new Promise((resolve, reject) => {
    const req = https.request({
      hostname: 'firestore.googleapis.com',
      path: `/v1/projects/${PROJECT}/databases/(default)/documents/${path}`,
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(body),
      },
    }, (res: import('http').IncomingMessage) => {
      let d = ''; res.on('data', (c: Buffer) => d += c);
      res.on('end', () => {
        const j = JSON.parse(d);
        j.error ? reject(new Error(JSON.stringify(j.error))) : resolve();
      });
    });
    req.write(body); req.end();
  });
}

// ── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  console.log('Getting token...');
  const token = await getToken();

  let lessonCount = 0;

  for (const subject of ALL_CONTENT) {
    const docId = `${subject.gradeId}_${subject.subjectId}`;
    console.log(`\n── ${docId} (${subject.lessons.length} lessons) ──`);

    // Write container doc with metadata
    await upsertDoc(token, `lessons/${docId}`, {
      gradeId: subject.gradeId,
      subjectId: subject.subjectId,
      totalHours: subject.totalHours,
    });

    // Write each lesson as a subcollection document
    // blocks stored as JSON string — Firestore doesn't support arrays-in-arrays (table rows)
    for (const lesson of subject.lessons) {
      await upsertDoc(token, `lessons/${docId}/items/${lesson.id}`, {
        id: lesson.id,
        title: lesson.title,
        intro: lesson.intro,
        order: lesson.id,
        blocksJson: JSON.stringify(lesson.blocks),
        ...(lesson.initialCode !== undefined ? { initialCode: lesson.initialCode } : {}),
      });
      process.stdout.write('.');
      lessonCount++;
    }
  }

  console.log(`\n\n✅ Done — ${ALL_CONTENT.length} subjects, ${lessonCount} lessons migrated`);
}

main().catch(e => { console.error(e); process.exit(1); });
