const fs = require('fs');
const path = require('path');

const SR = 22050;
const OUT = path.join(__dirname, '../assets/sounds');

function makeWav(samples) {
  const data = Buffer.alloc(44 + samples.length * 2);
  data.write('RIFF', 0, 'ascii');
  data.writeUInt32LE(36 + samples.length * 2, 4);
  data.write('WAVE', 8, 'ascii');
  data.write('fmt ', 12, 'ascii');
  data.writeUInt32LE(16, 16);
  data.writeUInt16LE(1, 20);
  data.writeUInt16LE(1, 22);
  data.writeUInt32LE(SR, 24);
  data.writeUInt32LE(SR * 2, 28);
  data.writeUInt16LE(2, 32);
  data.writeUInt16LE(16, 34);
  data.write('data', 36, 'ascii');
  data.writeUInt32LE(samples.length * 2, 40);
  for (let i = 0; i < samples.length; i++) {
    data.writeInt16LE(Math.max(-32767, Math.min(32767, Math.round(samples[i] * 32767))), 44 + i * 2);
  }
  return data;
}

function note(freq, dur, vol = 0.5, decay = 8) {
  return Array.from({ length: Math.floor(SR * dur) }, (_, i) => {
    const t = i / SR;
    return Math.sin(2 * Math.PI * freq * t) * vol * Math.exp(-t * decay);
  });
}

function seq(...notes) {
  const out = [];
  for (const n of notes) for (const s of n) out.push(s);
  return out;
}

const sounds = {
  // short ding — grade card, UI tap
  'tap.wav': note(880, 0.09, 0.45, 18),
  // two-note chime — subject / lesson select
  'select.wav': seq(note(523, 0.12, 0.42, 10), note(784, 0.18, 0.42, 7)),
  // ascending C-G — correct answer
  'correct.wav': seq(note(523, 0.11, 0.42, 12), note(784, 0.22, 0.42, 6)),
  // low descending buzz — wrong answer
  'wrong.wav': Array.from({ length: Math.floor(SR * 0.28) }, (_, i) => {
    const t = i / SR;
    const env = Math.exp(-t * 6);
    return (Math.sin(2 * Math.PI * 180 * t) * 0.5 +
            Math.sin(2 * Math.PI * 360 * t) * 0.2 +
            Math.sin(2 * Math.PI * 540 * t) * 0.08) * env;
  }),
  // triumphant C-E-G-C arpeggio — lesson complete
  'complete.wav': seq(
    note(523,  0.15, 0.42, 9),
    note(659,  0.15, 0.42, 9),
    note(784,  0.15, 0.42, 9),
    note(1047, 0.40, 0.42, 4),
  ),
};

fs.mkdirSync(OUT, { recursive: true });
for (const [name, samples] of Object.entries(sounds)) {
  fs.writeFileSync(path.join(OUT, name), makeWav(samples));
  console.log(`✓ ${name} (${samples.length} samples, ${(makeWav(samples).length / 1024).toFixed(1)} KB)`);
}
