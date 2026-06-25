import { useCallback, useRef } from 'react';

// Web — Web Audio API, no files needed

type Ctx = AudioContext & { _ready?: boolean };

function getCtx(): Ctx | null {
  if (typeof window === 'undefined' || !('AudioContext' in window || 'webkitAudioContext' in window)) return null;
  const Win = window as any;
  if (!Win._sharedAudioCtx) {
    Win._sharedAudioCtx = new (window.AudioContext ?? Win.webkitAudioContext)();
  }
  return Win._sharedAudioCtx as Ctx;
}

function playNote(ctx: AudioContext, freq: number, start: number, dur: number, vol: number, decay = 8) {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.type = 'sine';
  osc.frequency.value = freq;
  gain.gain.setValueAtTime(vol, start);
  gain.gain.exponentialRampToValueAtTime(0.001, start + dur);
  osc.start(start);
  osc.stop(start + dur + 0.05);
}

function playWrongBuzz(ctx: AudioContext, vol: number) {
  const t = ctx.currentTime;
  [180, 360, 540].forEach((freq, i) => {
    const v = vol * [0.5, 0.2, 0.08][i];
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = 'sine';
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(v, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.28);
    osc.start(t);
    osc.stop(t + 0.33);
  });
}

const VOL = 0.42;

export function useSounds() {
  const resume = useCallback((ctx: AudioContext) => {
    if (ctx.state === 'suspended') ctx.resume();
  }, []);

  const playTap = useCallback(() => {
    const ctx = getCtx(); if (!ctx) return;
    resume(ctx);
    playNote(ctx, 880, ctx.currentTime, 0.09, VOL, 18);
  }, []);

  const playSelect = useCallback(() => {
    const ctx = getCtx(); if (!ctx) return;
    resume(ctx);
    const t = ctx.currentTime;
    playNote(ctx, 523, t,        0.12, VOL, 10);
    playNote(ctx, 784, t + 0.12, 0.18, VOL, 7);
  }, []);

  const playCorrect = useCallback(() => {
    const ctx = getCtx(); if (!ctx) return;
    resume(ctx);
    const t = ctx.currentTime;
    playNote(ctx, 523, t,        0.11, VOL, 12);
    playNote(ctx, 784, t + 0.11, 0.22, VOL, 6);
  }, []);

  const playWrong = useCallback(() => {
    const ctx = getCtx(); if (!ctx) return;
    resume(ctx);
    playWrongBuzz(ctx, VOL);
  }, []);

  const playComplete = useCallback(() => {
    const ctx = getCtx(); if (!ctx) return;
    resume(ctx);
    const t = ctx.currentTime;
    playNote(ctx, 523,  t,        0.15, VOL, 9);
    playNote(ctx, 659,  t + 0.15, 0.15, VOL, 9);
    playNote(ctx, 784,  t + 0.30, 0.15, VOL, 9);
    playNote(ctx, 1047, t + 0.45, 0.40, VOL, 4);
  }, []);

  return { playTap, playSelect, playCorrect, playWrong, playComplete };
}
