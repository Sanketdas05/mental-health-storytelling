import { useEffect, useRef } from 'react';
import { gsap, prefersReducedMotion } from '../animations/motion';
import { audioManager } from '../utils/audio';

// Four discrete luminance levels for chunky analog static (same recipe as preloader)
const LUMA = [12, 70, 195, 250];

// Rich halo of inner monologue thoughts orbiting the centered character
// (pure typography, NO bubbles - exactly matching the user's reference design)
const THOUGHTS = [
  // Prominent racing thoughts
  { text: "what if they leave",          x: 21, y: 22, cls: "lead" },
  { text: "you're too much",            x: 78, y: 20, cls: "lead" },
  { text: "I'm tired",                  x: 50, y: 11, cls: "lead accent" },
  { text: "just say you're fine",        x: 18, y: 46, cls: "lead" },
  { text: "keep smiling",               x: 82, y: 36, cls: "accent" },
  { text: "nobody gets it",             x: 16, y: 64, cls: "" },
  { text: "don't be a burden",          x: 81, y: 56, cls: "" },
  { text: "why can't I just be normal", x: 26, y: 78, cls: "" },
  { text: "everyone else is coping",    x: 74, y: 74, cls: "dim" },
  { text: "what if I say the wrong thing", x: 50, y: 88, cls: "" },
  { text: "what if…",                   x: 86, y: 26, cls: "accent" },

  // Ambient whispered background thoughts
  { text: "it's fine.",                 x: 31, y: 36, cls: "dim" },
  { text: "nod.",                       x: 69, y: 46, cls: "dim" },
  { text: "don't make it weird",        x: 34, y: 58, cls: "dim" },
  { text: "act normal",                 x: 66, y: 65, cls: "dim" },
  { text: "breathe",                    x: 51, y: 18, cls: "dim" },
  { text: "they're watching",           x: 22, y: 92, cls: "dim" },
  { text: "smile",                      x: 76, y: 85, cls: "dim" },
];

const MATRIX_TEXT = "what if they leave. you're too much. nobody gets it. just say you're fine. why can't I just be normal. don't be a burden. what if I say the wrong thing. keep smiling. it's fine. everyone else is coping. don't make it weird. ";

export function Thoughts() {
  const phoneCanvasRef = useRef(null);
  const characterCanvasRef = useRef(null);

  // ─── 1. Phone Screen CRT Static, Tearing & Degraded Character Canvas ─────
  useEffect(() => {
    const canvas = phoneCanvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) return;

    const cw = 220;
    const ch = 440;
    canvas.width = cw;
    canvas.height = ch;

    const reduced = prefersReducedMotion();

    // Internal state
    const state = {
      staticAmp: 1.0,     // 1.0 down to ~0.2, settling at ~0.06
      charFlash: 0.0,     // Spikes on message send
      tearPulse: 0.0,     // Extra tear band on message send
      time: 0,
    };

    // Global hooks so GSAP timeline can drive static & tear flashes
    window.__setPhoneStaticAmp = (amp) => {
      state.staticAmp = Math.max(0.04, Math.min(1.0, amp));
    };

    window.__triggerPhoneTearFlash = () => {
      state.charFlash = 1.0;
      state.tearPulse = 1.0;
      try {
        audioManager.playMessageNotification();
      } catch (_) {}
    };

    // 3-5 horizontal tearing bands with random offsets and intervals (100-300ms)
    const numBands = 4;
    const tearBands = Array.from({ length: numBands }, () => ({
      y: Math.random() * ch,
      h: 4 + Math.random() * 16,
      offset: (Math.random() - 0.5) * 18,
      nextUpdate: performance.now() + 100 + Math.random() * 200,
    }));

    // Chunky analog static offscreen buffer (220x440)
    const offStatic = document.createElement('canvas');
    offStatic.width = cw;
    offStatic.height = ch;
    const offStaticCtx = offStatic.getContext('2d', { willReadFrequently: true });
    const staticImgData = offStaticCtx.createImageData(cw, ch);
    const staticBuf = new Uint32Array(staticImgData.data.buffer);

    // Degraded character offscreen preparation (1-bit / ink-threshold / scanline mask)
    const offChar = document.createElement('canvas');
    offChar.width = cw;
    offChar.height = ch;
    const offCharCtx = offChar.getContext('2d', { willReadFrequently: true });
    let charReady = false;

    const charImg = new Image();
    charImg.src = '/media/character-anxious.jpg';
    charImg.onload = () => {
      if (!offCharCtx) return;
      // Crop ONLY the wide, haunted eyes of the character (source size 896x1200)
      const eyeSx = 285;
      const eyeSy = 235;
      const eyeSw = 326;
      const eyeSh = 150;

      // Draw onto offChar centered in the upper-mid screen above message area
      const eyeDw = cw * 0.88;
      const eyeDh = eyeDw * (eyeSh / eyeSw);
      const eyeDx = (cw - eyeDw) / 2;
      const eyeDy = ch * 0.28;

      offCharCtx.drawImage(charImg, eyeSx, eyeSy, eyeSw, eyeSh, eyeDx, eyeDy, eyeDw, eyeDh);

      const imgData = offCharCtx.getImageData(0, 0, cw, ch);
      const d = imgData.data;

      const eyeCenterY = eyeDy + eyeDh * 0.5;
      const eyeRadiusY = eyeDh * 0.52;
      const eyeRadiusX = eyeDw * 0.50;

      // Apply 1-bit / ink-threshold with scanlines and soft elliptical feather mask so ONLY eyes show
      for (let y = 0; y < ch; y++) {
        const isScanline = (y % 2 === 0);
        const distY = Math.abs(y - eyeCenterY) / eyeRadiusY;

        for (let x = 0; x < cw; x++) {
          const idx = (y * cw + x) * 4;
          const r = d[idx];
          const g = d[idx + 1];
          const b = d[idx + 2];
          const lum = r * 0.299 + g * 0.587 + b * 0.114;

          const distX = Math.abs(x - (eyeDx + eyeDw * 0.5)) / eyeRadiusX;
          const ellipseDist = distX * distX + distY * distY;

          // Outside elliptical crop area -> clear to black
          if (ellipseDist > 1.0) {
            d[idx] = 10;
            d[idx + 1] = 10;
            d[idx + 2] = 9;
            d[idx + 3] = 255;
            continue;
          }

          // Soft feathering at the ellipse perimeter (0.75 - 1.0)
          const feather = ellipseDist > 0.75 ? (1.0 - ellipseDist) / 0.25 : 1.0;

          // High-contrast ink threshold (eyes stay intense white; dark shadows clip)
          let inkVal;
          if (lum < 40) {
            inkVal = 8;
          } else if (lum < 85) {
            inkVal = isScanline ? 18 : 35;
          } else if (lum < 140) {
            inkVal = isScanline ? 80 : 130;
          } else {
            inkVal = isScanline ? 200 : 255;
          }

          inkVal = Math.floor(inkVal * feather);

          // Subtle phosphor-green tint on brightest eye highlights
          d[idx] = Math.min(255, Math.floor(inkVal * 0.94));
          d[idx + 1] = Math.min(255, Math.floor(inkVal * 1.02));
          d[idx + 2] = Math.min(255, Math.floor(inkVal * 0.88));
          d[idx + 3] = 255;
        }
      }

      offCharCtx.putImageData(imgData, 0, 0);
      charReady = true;
    };

    // Main animation loop at ~12 fps for chunky static
    let lastStaticTime = 0;
    let animId;

    const loop = (timestamp) => {
      animId = requestAnimationFrame(loop);

      state.time += 0.016;

      // Decay impulse spikes
      if (state.charFlash > 0.01) state.charFlash *= 0.88;
      else state.charFlash = 0;

      if (state.tearPulse > 0.01) state.tearPulse *= 0.84;
      else state.tearPulse = 0;

      // Rate limit static regeneration to ~12-14 fps (every ~75ms)
      const shouldUpdateStatic = (timestamp - lastStaticTime > 75);
      if (shouldUpdateStatic) lastStaticTime = timestamp;

      // ── 1. Clear Screen Canvas (Dark phosphor background: #080907)
      ctx.fillStyle = '#080907';
      ctx.fillRect(0, 0, cw, ch);

      // ── 2. Degraded Ghost Character Layer
      if (charReady && offCharCtx) {
        // Base visibility: barely visible ghost (alpha 0.04 - 0.12)
        // Spikes up to 0.45 when a message is sent or on tear flash
        const baseAlpha = 0.06 + Math.sin(state.time * 2.3) * 0.04;
        const flashAlpha = state.charFlash * 0.42;
        const totalCharAlpha = Math.min(0.55, baseAlpha + flashAlpha);

        ctx.save();
        ctx.globalAlpha = totalCharAlpha;

        // Jitter subtly along X on spike
        const jitterX = state.charFlash > 0.1 ? (Math.random() - 0.5) * 6 : 0;
        ctx.drawImage(offChar, jitterX, 0);
        ctx.restore();
      }

      // ── 3. Horizontal Tearing Bands (100-300ms intervals, random Y)
      if (!reduced) {
        const now = performance.now();
        for (let i = 0; i < numBands; i++) {
          const b = tearBands[i];
          if (now > b.nextUpdate) {
            b.y = 40 + Math.random() * (ch - 80);
            b.h = 4 + Math.random() * 18;
            b.offset = (Math.random() - 0.5) * 22;
            b.nextUpdate = now + 120 + Math.random() * 200;
          }

          // Slice and re-draw with horizontal offset
          ctx.drawImage(canvas, 0, b.y, cw, b.h, b.offset, b.y, cw, b.h);
        }

        // Extra tear pulse on message send
        if (state.tearPulse > 0.1) {
          const py = ch * 0.44 + (Math.random() - 0.5) * 44;
          const poff = (Math.random() > 0.5 ? 1 : -1) * (20 + state.tearPulse * 24);
          ctx.drawImage(canvas, 0, py, cw, 24, poff, py, cw, 24);
        }
      }

      // ── 4. Chunky Analog Static (Same recipe as preloader: ~12 fps, discrete LUMA levels)
      const amp = state.staticAmp;
      if (amp > 0.03) {
        if (shouldUpdateStatic) {
          const total = cw * ch;
          const thresh = Math.min(0.95, amp * 1.15);
          for (let i = 0; i < total; i++) {
            if (Math.random() < thresh) {
              const v = LUMA[Math.floor(Math.random() * 4)];
              const a = Math.floor(amp * 190 * (0.4 + Math.random() * 0.6));
              // Faint phosphor-green & warm off-white (AABBGGRR)
              const g = Math.min(255, v + 25);
              staticBuf[i] = (a << 24) | (v << 16) | (g << 8) | v;
            } else {
              staticBuf[i] = 0;
            }
          }
          offStaticCtx.putImageData(staticImgData, 0, 0);
        }

        ctx.save();
        ctx.globalAlpha = 1.0;
        ctx.drawImage(offStatic, 0, 0);
        ctx.restore();
      }

      // ── 5. ~35% Phosphor-Green Tint Wash
      ctx.save();
      ctx.fillStyle = 'rgba(199, 244, 100, 0.08)';
      ctx.fillRect(0, 0, cw, ch);
      ctx.restore();
    };

    animId = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(animId);
      delete window.__setPhoneStaticAmp;
      delete window.__triggerPhoneTearFlash;
    };
  }, []);

  // ─── 2. Seamless Character Canvas (Flood-fill alpha mask removes black background) ───
  useEffect(() => {
    // Initial states for GSAP timeline elements
    gsap.set('.thought-item', { opacity: 0, scale: 0.5 });
    gsap.set('#prof', { opacity: 0, scale: 0.85 });
    gsap.set('.mono-log-line, .typing-indicator', { opacity: 0, y: 10 });
    gsap.set('#thoughtMatrix', { opacity: 0 });

    const canvas = characterCanvasRef.current;
    if (!canvas) return;

    const img = new Image();
    img.src = '/media/character-anxious.jpg';
    img.onload = () => {
      const w = img.naturalWidth || 896;
      const h = img.naturalHeight || 1200;
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext('2d', { willReadFrequently: true });
      if (!ctx) return;

      ctx.drawImage(img, 0, 0);
      const imgData = ctx.getImageData(0, 0, w, h);
      const d = imgData.data;

      // Flood-fill background pixels from all four borders
      // This strips ONLY the outer background black while preserving the character's hair, shirt, and scribbles
      const visited = new Uint8Array(w * h);
      const queue = new Int32Array(w * h * 2);
      let qHead = 0;
      let qTail = 0;

      for (let x = 0; x < w; x++) {
        queue[qTail++] = x;
        queue[qTail++] = 0;
        queue[qTail++] = x;
        queue[qTail++] = h - 1;
      }
      for (let y = 0; y < h; y++) {
        queue[qTail++] = 0;
        queue[qTail++] = y;
        queue[qTail++] = w - 1;
        queue[qTail++] = y;
      }

      while (qHead < qTail) {
        const x = queue[qHead++];
        const y = queue[qHead++];
        const idx = y * w + x;
        if (visited[idx]) continue;
        visited[idx] = 1;

        const p = idx * 4;
        const lum = d[p] * 0.299 + d[p + 1] * 0.587 + d[p + 2] * 0.114;
        if (lum < 42) {
          d[p + 3] = 0; // Pure 100% transparency for background! Eliminates black box!
          if (x > 0 && !visited[idx - 1]) {
            queue[qTail++] = x - 1;
            queue[qTail++] = y;
          }
          if (x < w - 1 && !visited[idx + 1]) {
            queue[qTail++] = x + 1;
            queue[qTail++] = y;
          }
          if (y > 0 && !visited[idx - w]) {
            queue[qTail++] = x;
            queue[qTail++] = y - 1;
          }
          if (y < h - 1 && !visited[idx + w]) {
            queue[qTail++] = x;
            queue[qTail++] = y + 1;
          }
        } else if (lum < 65) {
          // Feathered edge for smooth transition
          d[p + 3] = Math.round(((lum - 42) / 23) * 255);
        }
      }

      ctx.putImageData(imgData, 0, 0);
    };
  }, []);

  return (
    <section className="thoughts scene" id="phoneScene" aria-labelledby="phone-scene-title">
      <p className="eyebrow phone-index type-narrator" id="phone-scene-title">THE MESSAGE <span>02</span></p>

      {/* ── 1. SCENE BACKDROP: Dark Workstation (desk, lamp glow, desk surface; NO blue-grey) ── */}
      <div className="phone-scene-backdrop" aria-hidden="true" />

      {/* ── Spill: Soft phosphor-green light from screen onto desk behind the phone ── */}
      <div className="phone-glow-spill" aria-hidden="true" />

      {/* ── Background text matrix — blends thoughts into the ASCII text wall ── */}
      <div id="thoughtMatrix" className="thought-matrix type-thought" aria-hidden="true">
        {Array.from({ length: 36 }).map((_, i) => (
          <div key={i} className="matrix-row">
            {MATRIX_TEXT.repeat(4)}
          </div>
        ))}
      </div>

      {/* ── Main character — rendered with 100% transparent background (NO black box!) ── */}
      <div id="prof" className="character-portrait" aria-hidden="true" style={{ mixBlendMode: 'screen' }}>
        <canvas
          ref={characterCanvasRef}
          className="character-canvas"
          aria-hidden="true"
        />
      </div>

      {/* ── Floating thoughts — pure monospace typography matching what he thinks ── */}
      <div id="bub" className="bubbles-container type-thought" aria-hidden="true">
        {THOUGHTS.map(({ text, x, y, cls }, idx) => (
          <div
            key={idx}
            className={`thought-item ${cls}`.trim()}
            style={{ left: `${x}%`, top: `${y}%` }}
          >
            {text}
          </div>
        ))}
      </div>

      {/* ── 2. PHASE 3 DESK PHONE (match-cut from workstation desk) ── */}
      <div id="ph" className="desk-phone-matchcut" aria-label="A desk phone receiving a message through signal interference">
        {/* Layer a: Casing illustration (scratched dark casing, inked outlines, matching desk art) */}
        <div className="phone-chassis-top" aria-hidden="true">
          <div className="phone-speaker-slit" />
          <div className="phone-camera-dot" />
        </div>

        {/* Hand-drawn scratches SVG across dark casing */}
        <svg className="phone-casing-scratches" viewBox="0 0 340 700" preserveAspectRatio="none" aria-hidden="true">
          <path d="M12,40 L38,90 M25,45 L18,75" stroke="#e8e5df" strokeWidth="0.8" strokeOpacity="0.32" strokeLinecap="round" />
          <path d="M328,120 L305,170 M320,135 L310,195" stroke="#e8e5df" strokeWidth="0.8" strokeOpacity="0.28" strokeLinecap="round" />
          <path d="M15,520 L40,580 M28,620 L16,660" stroke="#e8e5df" strokeWidth="0.8" strokeOpacity="0.35" strokeLinecap="round" />
          <path d="M325,480 L295,540 M315,510 L322,570" stroke="#e8e5df" strokeWidth="0.8" strokeOpacity="0.3" strokeLinecap="round" />
          <path d="M60,688 L140,692 M200,689 L280,691" stroke="#e8e5df" strokeWidth="0.7" strokeOpacity="0.25" strokeLinecap="round" />
        </svg>

        {/* Layer b & c: Screen frame enclosing static canvas, degraded character, label & log lines */}
        <div className="phone-screen-frame">
          {/* Static Canvas: chunky static (~12 fps, ~35% phosphor-green) + tearing + degraded character */}
          <canvas
            ref={phoneCanvasRef}
            className="phone-screen-canvas"
            aria-hidden="true"
          />

          {/* CRT Scanline overlay + subtle barrel curve vignette */}
          <div className="phone-crt-scanlines" aria-hidden="true" />

          {/* Small mono label "CONNECTING…" in status bar */}
          <div className="phone-status-bar" aria-hidden="true">
            <span className="phone-signal-code">434 MHz · CH-02</span>
            <span className="phone-status-label type-thought" id="phoneStatusLabel">
              CONNECTING<span className="phone-dots">...</span>
            </span>
          </div>

          {/* Layer 3: Message Sequence (Monospace log lines, not chat bubbles) */}
          <div className="phone-log-container type-thought" id="phoneLog" aria-live="polite">
            {/* 1. Incoming: "hey… you okay?" (off-white, left-aligned) */}
            <div className="mono-log-line incoming" id="m1">
              <span className="log-arrow">&gt;</span> <span className="log-text">hey… you okay?</span>
            </div>

            {/* 2. Pause with typing indicator: "…" */}
            <div className="mono-log-line incoming typing-indicator" id="mTyping" aria-label="Typing">
              <span className="log-arrow">&gt;</span> <span className="typing-dots">…</span>
            </div>

            {/* 3. Reply: "I'm fine :)" (phosphor green, right-aligned) */}
            <div className="mono-log-line reply" id="m2">
              <span className="log-text">I'm fine :)</span> <span className="log-arrow">&lt;</span>
            </div>

            {/* 4. Incoming follow-up: "you sure?" (off-white, left-aligned) */}
            <div className="mono-log-line incoming" id="m3">
              <span className="log-arrow">&gt;</span> <span className="log-text">you sure?</span>
            </div>

            {/* 5. Second reply: "yeah. all good :)" (phosphor green, right-aligned) */}
            <div className="mono-log-line reply" id="m4">
              <span className="log-text">yeah. all good :)</span> <span className="log-arrow">&lt;</span>
            </div>
          </div>

          {/* Layer d: Glass: scratch overlay, diagonal reflection, edge vignette */}
          <div className="phone-glass-overlay" aria-hidden="true">
            <svg className="glass-scratches-svg" viewBox="0 0 220 440" preserveAspectRatio="none">
              <path d="M20,60 L90,140 M80,128 L140,195" stroke="#ffffff" strokeWidth="0.55" strokeOpacity="0.22" />
              <path d="M170,220 L215,290 M185,240 L150,310" stroke="#ffffff" strokeWidth="0.5" strokeOpacity="0.18" />
              <path d="M35,350 L105,410" stroke="#ffffff" strokeWidth="0.6" strokeOpacity="0.2" />
            </svg>
            <div className="glass-reflection-streak" />
            <div className="glass-screen-vignette" />
          </div>
        </div>

        {/* Inked home button circle matching the desk art phone */}
        <div className="phone-chassis-bottom" aria-hidden="true">
          <div className="phone-home-button" />
        </div>
      </div>
    </section>
  );
}
