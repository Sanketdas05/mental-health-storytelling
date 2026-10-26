// ════════════════════════════════════════════════════════════════════════════
// Generative Web Audio System — Tension, Static & Heartbeat Engine
// ════════════════════════════════════════════════════════════════════════════

export const A = {
  ctx: null,
  on: false,
  hushed: false,
  master: null,
  lp: null,
  drone: null,
  hissGain: null,
  noiseSource: null,
  hb: null
};

export const U = {
  state: {
    progress: 0,
    tension: 0
  },
  hush: null,
  warm: null,
  beep: null,
  buzz: null,
  sound: null
};

// ── 1. Audio Start (Static Hiss + Sub-bass Drone + Heartbeat) ────────────────
export function audioStart() {
  if (A.ctx) {
    if (A.ctx.state === 'suspended') {
      A.ctx.resume();
    }
    return;
  }
  const AC = typeof window !== 'undefined'
    ? (window.AudioContext || window.webkitAudioContext)
    : null;
  if (!AC) return;

  const c = A.ctx = new AC();
  const m = A.master = c.createGain();
  m.gain.value = 0;
  m.connect(c.destination);

  // ── CRT Static Hiss Layer (Active at the start, fades as we leave intro) ──
  const bufSize = c.sampleRate * 2;
  const noiseBuf = c.createBuffer(1, bufSize, c.sampleRate);
  const out = noiseBuf.getChannelData(0);
  let b0 = 0, b1 = 0, b2 = 0;
  for (let i = 0; i < bufSize; i++) {
    const white = Math.random() * 2 - 1;
    b0 = 0.99886 * b0 + white * 0.0555;
    b1 = 0.99332 * b1 + white * 0.0750;
    b2 = 0.96900 * b2 + white * 0.1538;
    out[i] = (b0 + b1 + b2) * 0.045;
  }
  const noiseSrc = A.noiseSource = c.createBufferSource();
  noiseSrc.buffer = noiseBuf;
  noiseSrc.loop = true;

  const noiseFilt = c.createBiquadFilter();
  noiseFilt.type = 'bandpass';
  noiseFilt.frequency.setValueAtTime(2400, c.currentTime);
  noiseFilt.Q.setValueAtTime(0.45, c.currentTime);

  const hg = A.hissGain = c.createGain();
  hg.gain.value = 0.025; // Subtle, non-intrusive CRT texture for intro only

  noiseSrc.connect(noiseFilt);
  noiseFilt.connect(hg);
  hg.connect(m);
  noiseSrc.start(0);

  // ── Analogue Detuned Sub-bass Drone ───────────────────────────────────────
  const lp = A.lp = c.createBiquadFilter();
  lp.type = 'lowpass';
  lp.frequency.value = 160;

  const dg = A.drone = c.createGain();
  dg.gain.value = 0.04;

  // Analogue detuned sub-bass drone: A1 (55Hz), chorused A1 (55.35Hz), E2 fifth (82.4Hz)
  [55, 55.35, 82.4].forEach(f => {
    const o = c.createOscillator();
    o.type = 'sawtooth';
    o.frequency.value = f;
    o.connect(lp);
    o.start();
  });

  lp.connect(dg);
  dg.connect(m);

  beat();
}

// ── 2. Master Sound Toggle ──────────────────────────────────────────────────
export function soundOn(v) {
  A.on = v;
  if (v) {
    audioStart();
    if (!A.ctx) return;
    A.ctx.resume();
    A.master.gain.cancelScheduledValues(A.ctx.currentTime);
    A.master.gain.linearRampToValueAtTime(0.9, A.ctx.currentTime + 1.2);
  } else if (A.ctx) {
    A.master.gain.cancelScheduledValues(A.ctx.currentTime);
    A.master.gain.linearRampToValueAtTime(0, A.ctx.currentTime + 0.4);
  }

  if (typeof document !== 'undefined') {
    const b = document.querySelector('.u-snd') || document.querySelector('.minimal-sound-btn');
    if (b) {
      b.textContent = v ? 'sound on' : 'sound off';
      b.setAttribute('aria-pressed', v);
    }
  }
}

// ── 3. Heartbeat Double-Pulse Thump ("Lub-Dub") ─────────────────────────────
export function thump(v) {
  if (!A.ctx || !A.master) return;
  const c = A.ctx;
  const t = c.currentTime;

  [0, 0.19].forEach((d, i) => {
    const o = c.createOscillator();
    const g = c.createGain();
    o.type = 'sine';
    o.frequency.setValueAtTime(i ? 62 : 78, t + d);
    o.frequency.exponentialRampToValueAtTime(38, t + d + 0.16);
    g.gain.setValueAtTime(0, t + d);
    g.gain.linearRampToValueAtTime(v * (i ? 0.6 : 1), t + d + 0.015);
    g.gain.exponentialRampToValueAtTime(0.001, t + d + 0.2);
    o.connect(g);
    g.connect(A.master);
    o.start(t + d);
    o.stop(t + d + 0.25);
  });
}

// ── 4. Generative Heartbeat Loop ────────────────────────────────────────────
// Pacing is driven directly by U.state.tension: 54 bpm (resting) up to 120 bpm (panic)
export function beat() {
  const v = U.state.tension;
  if (A.on && A.ctx && v > 0.04 && !A.hushed) {
    thump(0.55 * v);
  }
  clearTimeout(A.hb);
  const bpm = 54 + v * 66;
  A.hb = setTimeout(beat, 60000 / bpm);
}

// ── 5. Narrative Silence / Hush ─────────────────────────────────────────────
U.hush = (s = 3) => {
  if (!A.ctx || !A.on) return;
  A.hushed = true;
  const t = A.ctx.currentTime;
  A.master.gain.cancelScheduledValues(t);
  A.master.gain.linearRampToValueAtTime(0, t + 0.4);
  setTimeout(() => {
    if (A.on && A.ctx) {
      A.master.gain.linearRampToValueAtTime(0.9, A.ctx.currentTime + 2);
    }
    A.hushed = false;
  }, s * 1000);
};

// ── 6. Warm Resolution Bloom (C Major Chord) ────────────────────────────────
U.warm = () => {
  if (!A.ctx || !A.on) return;
  const c = A.ctx;
  const t = c.currentTime;

  [261.63, 329.63, 392, 523.25].forEach((f, i) => {
    const o = c.createOscillator();
    const g = c.createGain();
    o.type = 'sine';
    o.frequency.value = f;
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(0.07, t + 1.2 + i * 0.25);
    g.gain.exponentialRampToValueAtTime(0.0005, t + 4.5);
    o.connect(g);
    g.connect(A.master);
    o.start(t);
    o.stop(t + 4.6);
  });
};

// ── 7. Interactive Audio Feedback (Beep) ────────────────────────────────────
U.beep = (f = 440, d = 0.09, type = 'sine', v = 0.05) => {
  if (!A.on || !A.ctx || A.hushed) return;
  const c = A.ctx;
  const o = c.createOscillator();
  const g = c.createGain();
  o.type = type;
  o.frequency.value = f;
  g.gain.setValueAtTime(v, c.currentTime);
  g.gain.exponentialRampToValueAtTime(1e-4, c.currentTime + d);
  o.connect(g);
  g.connect(A.master);
  o.start();
  o.stop(c.currentTime + d);
};

// ── 8. Haptic Feedback ──────────────────────────────────────────────────────
U.buzz = (ms = 30) => {
  if (typeof navigator !== 'undefined' && navigator.vibrate && A.on !== false) {
    try {
      navigator.vibrate(ms);
    } catch (_) {}
  }
};

U.sound = soundOn;

// Expose on window for easy access/debugging
if (typeof window !== 'undefined') {
  window.A = A;
  window.U = U;
}

// ── 9. Website Narrative Progression Mapping ────────────────────────────────
// Translates normalized scroll progress (0.0 to 1.0) into psychological tension:
// - 0.00 - 0.12: CRT "I'M FINE." (Static hiss active, resting tension ~0.02)
// - 0.12 - 0.22: Interlude (Hiss fades out, tension rises 0.02 -> 0.18, heartbeat awakes)
// - 0.22 - 0.50: Workstation Desk (Dread builds 0.18 -> 0.40, heart ~75 bpm)
// - 0.50 - 0.68: Thoughts spiral (Overthinking accelerates 0.40 -> 0.75)
// - 0.68 - 0.85: Anxiety ASCII Breakdown (Panic climax, 0.75 -> 1.00, racing 120 bpm)
// - 0.85 - 1.00: Hands Scene (Grounding & relief, tension drops to 0.0, warm bloom)
function updateProgression(progress) {
  U.state.progress = progress;

  let tension = 0;
  if (progress <= 0.10) {
    tension = 0.02;
  } else if (progress <= 0.22) {
    const t = (progress - 0.10) / 0.12;
    tension = 0.02 + t * 0.16;
  } else if (progress <= 0.50) {
    const t = (progress - 0.22) / 0.28;
    tension = 0.18 + t * 0.22;
  } else if (progress <= 0.68) {
    const t = (progress - 0.50) / 0.18;
    tension = 0.40 + t * 0.35;
  } else if (progress <= 0.85) {
    const t = (progress - 0.68) / 0.17;
    tension = 0.75 + t * 0.25;
  } else {
    // Hands scene relief: rapid decompression
    const t = (progress - 0.85) / 0.15;
    tension = Math.max(0, 1.0 - t * 1.3);
  }

  U.state.tension = tension;

  if (A.ctx) {
    const now = A.ctx.currentTime;

    // CRT Static Hiss: faint in intro (0-0.06), dissolves quickly so story ambiance breathes
    if (A.hissGain) {
      const hissVol = progress < 0.06
        ? 0.025 * (1 - progress / 0.06)
        : 0;
      A.hissGain.gain.setTargetAtTime(hissVol, now, 0.2);
    }

    // Drone acoustics: lowpass filter and gain scale with tension
    if (A.lp && A.drone) {
      const cutoff = 160 + tension * 140;
      A.lp.frequency.setTargetAtTime(cutoff, now, 0.35);

      const dVol = 0.04 + tension * 0.045;
      A.drone.gain.setTargetAtTime(dVol, now, 0.35);
    }
  }
}

// ── 10. Tactile Button Click Sound (Mechanical switch snap + cathode thump) ─
export function playButtonClickSound() {
  try {
    const AC = typeof window !== 'undefined'
      ? (window.AudioContext || window.webkitAudioContext)
      : null;
    if (!AC) return;

    // Use active context or create instant one if not yet initialized
    let ctx = A.ctx;
    if (!ctx) {
      audioStart();
      ctx = A.ctx;
    }
    if (!ctx) return;
    if (ctx.state === 'suspended') ctx.resume();

    const now = ctx.currentTime;

    // 1. Mechanical switch click (transient snap burst)
    const clickBuf = ctx.createBuffer(1, ctx.sampleRate * 0.04, ctx.sampleRate);
    const d = clickBuf.getChannelData(0);
    for (let i = 0; i < d.length; i++) {
      d[i] = (Math.random() * 2 - 1) * Math.exp(-i / (ctx.sampleRate * 0.006));
    }
    const clickSrc = ctx.createBufferSource();
    clickSrc.buffer = clickBuf;
    const clickFilter = ctx.createBiquadFilter();
    clickFilter.type = 'highpass';
    clickFilter.frequency.setValueAtTime(1400, now);
    const clickGain = ctx.createGain();
    clickGain.gain.setValueAtTime(0.55, now);
    clickGain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);
    clickSrc.connect(clickFilter);
    clickFilter.connect(clickGain);
    clickGain.connect(ctx.destination);
    clickSrc.start(now);

    // 2. Deep cathode relay resonance thump (78Hz -> 32Hz)
    const thumpOsc = ctx.createOscillator();
    const thumpGain = ctx.createGain();
    thumpOsc.type = 'sine';
    thumpOsc.frequency.setValueAtTime(78, now);
    thumpOsc.frequency.exponentialRampToValueAtTime(32, now + 0.28);
    thumpGain.gain.setValueAtTime(0.65, now);
    thumpGain.gain.exponentialRampToValueAtTime(0.001, now + 0.32);
    thumpOsc.connect(thumpGain);
    thumpGain.connect(ctx.destination);
    thumpOsc.start(now);
    thumpOsc.stop(now + 0.35);

    U.buzz(35);
  } catch (_) {}
}

// ── 11. Realistic Mechanical Lamp Switch Sound (Tactile Dual-Action Rocker) ─
export function playLampClickSound(turningOn = true) {
  try {
    const AC = typeof window !== 'undefined'
      ? (window.AudioContext || window.webkitAudioContext)
      : null;
    if (!AC) return;

    if (!A.ctx) {
      audioStart();
    }
    const ctx = A.ctx;
    if (!ctx) return;
    if (ctx.state === 'suspended') {
      ctx.resume();
    }

    const now = ctx.currentTime;

    // Helper: generate shaped acoustic transient noise bursts
    const makeNoiseBurst = (startTime, duration, centerFreq, q, peakGain) => {
      const sampleCount = Math.max(1, Math.floor(ctx.sampleRate * duration));
      const buffer = ctx.createBuffer(1, sampleCount, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < sampleCount; i++) {
        const decay = Math.exp(-i / (ctx.sampleRate * (duration * 0.3)));
        data[i] = (Math.random() * 2 - 1) * decay;
      }
      const source = ctx.createBufferSource();
      source.buffer = buffer;

      const filter = ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(centerFreq, startTime);
      filter.Q.setValueAtTime(q, startTime);

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(peakGain, startTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

      source.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      source.start(startTime);
    };

    // Helper: resonant body/enclosure acoustics (hard plastic / metal lamp housing clack)
    const makeHousingResonance = (startTime, freq, duration, peakGain) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, startTime);
      osc.frequency.exponentialRampToValueAtTime(freq * 0.88, startTime + duration);

      gain.gain.setValueAtTime(peakGain, startTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(startTime);
      osc.stop(startTime + duration + 0.01);
    };

    // 1. Initial mechanical detent release (t = 0ms)
    makeNoiseBurst(now, 0.008, 2500, 2.8, 0.38);
    makeHousingResonance(now, 640, 0.016, 0.18);

    // 2. Main rocker impact & contact slam (t = 16ms: authentic "k-clack")
    const t2 = now + 0.016;
    const snapFreq = turningOn ? 2200 : 1900;
    makeNoiseBurst(t2, 0.012, snapFreq, 2.2, 0.65);

    // Lamp casing cavity resonance ("thock")
    const res1 = turningOn ? 540 : 470;
    const res2 = turningOn ? 860 : 780;
    makeHousingResonance(t2, res1, 0.032, 0.32);
    makeHousingResonance(t2, res2, 0.022, 0.18);

    // High contact spring tick
    makeNoiseBurst(t2 + 0.002, 0.006, 4600, 3.8, 0.16);

    U.buzz(24);
  } catch (_) {}
}

// ── 12. Backward-Compatible AudioManager Adapter ────────────────────────────
class AudioManager {
  constructor() {
    this.initialized = false;
  }

  get isMuted() {
    return !A.on;
  }

  get ctx() {
    return A.ctx;
  }

  init() {
    if (this.initialized) return;
    this.initialized = true;
    soundOn(true);
  }

  toggleMute() {
    soundOn(!A.on);
    return !A.on;
  }

  setMute(muted) {
    soundOn(!muted);
  }

  setScrollProgress(progress) {
    updateProgression(progress);
  }

  playWarmWarmthChime() {
    U.warm();
    U.hush(4.2);
  }

  playKeyClick() {
    U.beep(850, 0.04, 'sine', 0.035);
  }

  playLampClick(turningOn = true) {
    playLampClickSound(turningOn);
  }

  playEnterThump() {
    playButtonClickSound();
  }

  playEnterChime() {
    playButtonClickSound();
  }

  playMessageNotification() {
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      try { navigator.vibrate(15); } catch (_) {}
    }
    U.beep(540, 0.08, 'sine', 0.04);
  }

  thump(v = 0.5) {
    thump(v);
  }
}

export const audioManager = new AudioManager();
