import { useEffect, useRef } from 'react';
import { prefersReducedMotion } from '../animations/motion';

const TXT = "what if they leave. you're too much. nobody gets it. just say you're fine. why can't I just be normal. don't be a burden. what if I say the wrong thing. keep smiling. it's fine. everyone else is coping. don't make it weird. I can't breathe. stop watching me. ".repeat(60);

// Multi-tier ASCII ramps
const RAMP = " .'`^\",:;Il!i><~+_-?][}{1)(|\\/tfjrxnuvczXYUJCLQ0OZmwqpdbkhao*#MW&8%B@$";
const DENSE_RAMP = "@#%&WM$8888";
const SPIRAL_RAMP = "@#%*O0o+=~.";
const GLITCH_CHARS = "01!@#$%^&*<>~?{}[]|/\\=+-:;X#_░▒▓█";

// Pre-computed color lookup tables with warm sketch ink & paper tones
const INK_PALETTE = [];
const BRIGHT_PALETTE = [];
const GLITCH_PALETTE = [];
for (let i = 0; i <= 25; i++) {
  const alpha = (i / 25).toFixed(2);
  INK_PALETTE[i] = `rgba(226,220,210,${alpha})`;
  BRIGHT_PALETTE[i] = `rgba(246,242,234,${alpha})`;
  GLITCH_PALETTE[i] = `rgba(255,255,255,${alpha})`;
}

const ez = (x) => (x < 0.5 ? 2 * x * x : 1 - Math.pow(-2 * x + 2, 2) / 2);
const seg = (t, a, b) => Math.max(0, Math.min(1, (t - a) / (b - a)));
const lerp = (a, b, t) => a + (b - a) * t;

export function AnxietyScene({ stateRef }) {
  const canvasRef = useRef(null);
  const captionRef = useRef(null);

  const stateRef_ = useRef({
    W: 0,
    H: 0,
    px: -999,
    py: -999,
    cpx: -999,          // Smoothed fluid cursor position X
    cpy: -999,          // Smoothed fluid cursor position Y
    vx: 0,              // Cursor velocity X
    vy: 0,              // Cursor velocity Y
    distortEnergy: 0,   // Accumulated fluid disturbance energy
    charInk: null,      // High-res ink buffer for the anxious boy
    facesInk: null,     // High-res ink buffer for looming sketched faces (anxiety.jpeg)
    drainedInk: null,   // Scribble vortex coils for the drained character state
    IW: 1,
    IH: 1,
    cs: 7.5,
    ch: 10.2,
    boyBounds: { x: 0, y: 0, w: 1, h: 1 },
    animId: null,
    progress: 0,
  });

  useEffect(() => {
    if (stateRef) stateRef.current = stateRef_.current;
  }, [stateRef]);

  useEffect(() => {
    if (prefersReducedMotion()) return;

    const canvas = canvasRef.current;
    const caption = captionRef.current;
    if (!canvas || !caption) return;

    const ctx = canvas.getContext('2d');
    const s = stateRef_.current;

    const charImg = new Image();
    const facesImg = new Image();
    let charReady = false;
    let facesReady = false;

    let drainedCanvas = null;
    let drainedCtx = null;

    // ── Build Screen Grid Ink Buffers ─────────────────────────────────────
    const buildBuffers = () => {
      if (s.W === 0) return;

      // Cell size by viewport: >=1025 -> 8px, <=1024 -> 10px, <=480 -> 13px
      if (s.W >= 1025) {
        s.cs = 8.0;
      } else if (s.W <= 480) {
        s.cs = 13.0;
      } else {
        s.cs = 10.0;
      }
      s.ch = s.cs * 1.36;

      s.IW = Math.ceil(s.W / s.cs);
      s.IH = Math.ceil(s.H / s.ch);

      const totalCells = s.IW * s.IH;
      s.charInk = new Float32Array(totalCells);
      s.facesInk = new Float32Array(totalCells);
      s.drainedInk = new Float32Array(totalCells);

      // Aspect ratio factor to correct monospace font height vs width
      const fontAspect = s.ch / s.cs;

      // 1. Draw Boy with correct anatomical proportions matching Phase 3 Thoughts figure 1:1
      if (charReady && charImg.naturalWidth > 0) {
        const off = document.createElement('canvas');
        off.width = s.IW;
        off.height = s.IH;
        const octx = off.getContext('2d', { willReadFrequently: true });

        // Match Phase 3 figure dimensions (896 x 1200) and bounds (0.90 height, 0.07 top) for seamless morph
        const FIGW = 896;
        const FIGH = 1200;
        const boyH = s.IH * 0.90;
        const boyY = s.IH * 0.07;
        const boyW = boyH * (FIGW / FIGH) * fontAspect;
        const boyX = (s.IW - boyW) / 2;

        s.boyBounds = { x: boyX, y: boyY, w: boyW, h: boyH };

        octx.drawImage(charImg, boyX, boyY, boyW, boyH);
        const data = octx.getImageData(0, 0, s.IW, s.IH).data;

        for (let i = 0; i < totalCells; i++) {
          const alpha = data[i * 4 + 3] / 255;
          const r = data[i * 4];
          const g = data[i * 4 + 1];
          const b = data[i * 4 + 2];
          const lum = ((r * 0.299 + g * 0.587 + b * 0.114) / 255) * alpha;

          if (alpha > 0.12) {
            s.charInk[i] = lum < 0.05 ? 0.14 : Math.max(0.14, Math.pow(lum, 0.90));
          } else {
            s.charInk[i] = 0;
          }
        }
      }

      // 2. Draw Looming Faces (reduce faces on small screens: 6 on desktop, 3 on phones)
      if (facesReady && facesImg.naturalWidth > 0) {
        const off = document.createElement('canvas');
        off.width = s.IW;
        off.height = s.IH;
        const octx = off.getContext('2d', { willReadFrequently: true });

        const facesAspect = facesImg.naturalWidth / facesImg.naturalHeight;
        const isSmall = s.W <= 768;
        // On small screens crop to 3 central faces, on desktop show full 6 faces
        const facesH = s.IH * (isSmall ? 0.72 : 0.82);
        const facesW = facesH * facesAspect * fontAspect;
        const facesX = (s.IW - facesW) / 2;
        const facesY = -s.IH * 0.04;

        octx.drawImage(facesImg, facesX, facesY, facesW, facesH);
        const data = octx.getImageData(0, 0, s.IW, s.IH).data;

        for (let i = 0; i < totalCells; i++) {
          const r = data[i * 4];
          const g = data[i * 4 + 1];
          const b = data[i * 4 + 2];
          const lum = (r * 0.299 + g * 0.587 + b * 0.114) / 255;
          s.facesInk[i] = lum < 0.08 ? 0 : Math.pow(lum, 0.92);
        }
      }

      // Initialize offscreen canvas for the animated drained scribble spirals
      drainedCanvas = document.createElement('canvas');
      drainedCanvas.width = s.IW;
      drainedCanvas.height = s.IH;
      drainedCtx = drainedCanvas.getContext('2d', { willReadFrequently: true });
    };

    // ── Build Drained Scribble Coils (anxiety-drained.png + anxiety.jpeg) ──
    const updateDrainedSpirals = (time) => {
      if (!drainedCtx || s.IW === 0) return;
      const W = s.IW;
      const H = s.IH;
      drainedCtx.clearRect(0, 0, W, H);

      const bb = s.boyBounds;
      // 7 Drained energy vortex centers calibrated to figure.png anatomy
      const spirals = [
        // 1. Head / Face (replaces eyes and facial features)
        { cx: bb.x + bb.w * 0.48, cy: bb.y + bb.h * 0.31, rx: bb.w * 0.16, ry: bb.h * 0.11, speed: 1.1, loops: 5.5 },
        // 2. Left chest
        { cx: bb.x + bb.w * 0.36, cy: bb.y + bb.h * 0.66, rx: bb.w * 0.13, ry: bb.h * 0.09, speed: -1.4, loops: 4.5 },
        // 3. Right chest
        { cx: bb.x + bb.w * 0.60, cy: bb.y + bb.h * 0.68, rx: bb.w * 0.14, ry: bb.h * 0.10, speed: 1.2, loops: 4.5 },
        // 4. Upper abdomen
        { cx: bb.x + bb.w * 0.44, cy: bb.y + bb.h * 0.80, rx: bb.w * 0.12, ry: bb.h * 0.08, speed: -1.6, loops: 4.0 },
        // 5. Lower abdomen
        { cx: bb.x + bb.w * 0.54, cy: bb.y + bb.h * 0.90, rx: bb.w * 0.13, ry: bb.h * 0.08, speed: 1.3, loops: 4.0 },
        // 6. Left shoulder / arm
        { cx: bb.x + bb.w * 0.22, cy: bb.y + bb.h * 0.74, rx: bb.w * 0.09, ry: bb.h * 0.07, speed: 1.5, loops: 3.5 },
        // 7. Right shoulder / arm
        { cx: bb.x + bb.w * 0.74, cy: bb.y + bb.h * 0.74, rx: bb.w * 0.09, ry: bb.h * 0.07, speed: -1.5, loops: 3.5 },
      ];

      drainedCtx.strokeStyle = '#ffffff';
      drainedCtx.lineWidth = 2.2;

      spirals.forEach((sp, idx) => {
        drainedCtx.save();
        drainedCtx.translate(sp.cx, sp.cy);
        drainedCtx.rotate(time * sp.speed * 0.0018);

        drainedCtx.beginPath();
        const totalSteps = 70;
        for (let i = 0; i < totalSteps; i++) {
          const t = i / totalSteps;
          const theta = t * sp.loops * Math.PI * 2;
          const rNorm = t;
          // Organic hand-drawn scribble jitter
          const wobble = 1 + 0.14 * Math.sin(theta * 3.5 + idx);
          const x = Math.cos(theta) * sp.rx * rNorm * wobble;
          const y = Math.sin(theta) * sp.ry * rNorm * wobble;
          if (i === 0) drainedCtx.moveTo(x, y);
          else drainedCtx.lineTo(x, y);
        }
        drainedCtx.stroke();
        drainedCtx.restore();
      });

      // Vertical siphoning tension tendrils streaming from head to looming faces
      drainedCtx.strokeStyle = 'rgba(255,255,255,0.7)';
      drainedCtx.lineWidth = 1.6;
      const tendrilCount = 7;
      for (let i = 0; i < tendrilCount; i++) {
        const tx = bb.x + bb.w * (0.34 + i * 0.045);
        const topY = Math.max(0, bb.y - bb.h * 0.06);
        const botY = bb.y + bb.h * 0.24;
        const wave = Math.sin(time * 0.003 + i) * 5;
        drainedCtx.beginPath();
        drainedCtx.moveTo(tx, botY);
        drainedCtx.quadraticCurveTo(tx + wave, (topY + botY) / 2, tx - wave * 0.5, topY);
        drainedCtx.stroke();
      }

      const d = drainedCtx.getImageData(0, 0, W, H).data;
      for (let i = 0; i < s.drainedInk.length; i++) {
        s.drainedInk[i] = (d[i * 4] * 0.299 + d[i * 4 + 1] * 0.587 + d[i * 4 + 2] * 0.114) / 255;
      }
    };

    charImg.onload = () => {
      charReady = true;
      buildBuffers();
    };
    charImg.src = '/media/figure.png';
    if (charImg.complete && charImg.naturalWidth > 0) {
      charReady = true;
      buildBuffers();
    }

    facesImg.onload = () => {
      facesReady = true;
      buildBuffers();
    };
    facesImg.src = '/media/looming-faces.jpg';

    const resize = () => {
      const r = Math.min(window.devicePixelRatio || 1, 1.5);
      s.W = window.innerWidth;
      s.H = window.innerHeight;
      canvas.width = Math.round(s.W * r);
      canvas.height = Math.round(s.H * r);
      ctx.setTransform(r, 0, 0, r, 0, 0);
      buildBuffers();
    };

    resize();
    window.addEventListener('resize', resize);

    // ── Fluid Mouse Interaction with Velocity Tracking ────────────────────
    const onPointer = (e) => {
      const prevX = s.px < 0 ? e.clientX : s.px;
      const prevY = s.py < 0 ? e.clientY : s.py;
      s.px = e.clientX;
      s.py = e.clientY;

      const dx = e.clientX - prevX;
      const dy = e.clientY - prevY;
      const dist = Math.hypot(dx, dy);

      // Track cursor velocity & inject fluid distortion energy (subtle, refined)
      s.vx = dx * 0.25 + s.vx * 0.45;
      s.vy = dy * 0.25 + s.vy * 0.45;
      s.distortEnergy = Math.min(0.8, s.distortEnergy + dist * 0.009);
    };

    const onPointerLeave = () => {
      s.px = -999;
      s.py = -999;
    };

    window.addEventListener('pointermove', onPointer, { passive: true });
    window.addEventListener('pointerleave', onPointerLeave);

    // ── Main Render Loop ──────────────────────────────────────────────────
    const loop = (now) => {
      const p = Math.max(0, s.progress);
      const { W, H, px, py, charInk, facesInk, drainedInk, IW, IH, cs, ch } = s;

      // ── Performance optimization: If scene is idle/invisible, skip canvas pipeline entirely ──
      if (p >= 0.995) {
        if (s.cpx > 0) ctx.clearRect(0, 0, W, H);
        return;
      }

      ctx.clearRect(0, 0, W, H);
      if (!charInk || IW === 0) return;

      // Update fluid trailing cursor physics
      if (px > 0) {
        if (s.cpx < 0) {
          s.cpx = px;
          s.cpy = py;
        } else {
          s.cpx += (px - s.cpx) * 0.22;
          s.cpy += (py - s.cpy) * 0.22;
        }
      } else {
        s.cpx = -999;
        s.cpy = -999;
      }

      // Smooth decay of fluid distortion energy & velocity
      s.distortEnergy *= 0.82;
      s.vx *= 0.80;
      s.vy *= 0.80;

      // Timeline stages:
      // 1. boyRes: Boy is 100% formed in ASCII right from blend start (seamless cross-dissolve, zero break)
      const boyRes = 1.0;

      // 2. faceEmergence: Looming sketched faces from anxiety.jpeg crowd in AFTER boy is blended (0.28 -> 0.62)
      const faceEmergence = ez(seg(p, 0.28, 0.62));

      // 3. drainedState: Boy transitions into hollow silhouette with glowing scribble vortexes (0.58 -> 0.88)
      const drainedState = ez(seg(p, 0.58, 0.88));

      // 4. cleanFade: Smooth fade-out at the end (NO TWIRL, NO ROTATION)
      const cleanFade = 1 - ez(seg(p, 0.88, 0.99));

      if (cleanFade <= 0.01) return;

      // Only calculate and read back spirals when actually in the drained state
      if (drainedState > 0.02) {
        updateDrainedSpirals(now);
      }

      const cols = IW;
      const rows = IH;

      ctx.font = `bold ${Math.round(cs * 1.15)}px 'DM Mono', monospace`;
      ctx.textBaseline = 'top';

      const rampLen = RAMP.length;
      const denseLen = DENSE_RAMP.length;
      const spiralLen = SPIRAL_RAMP.length;
      const glitchLen = GLITCH_CHARS.length;

      // Subtle, localized interaction radius
      const DISTORT_RADIUS = 110;

      let lastFill = '';

      for (let r = 0; r < rows; r++) {
        const rowOffset = r * cols;
        const baseY = r * ch;

        for (let c = 0; c < cols; c++) {
          const idx = rowOffset + c;
          const baseX = c * cs;

          const L_boy = charInk[idx] || 0;
          const L_faces = facesInk ? (facesInk[idx] || 0) : 0;
          const L_drained = drainedInk ? (drainedInk[idx] || 0) : 0;

          // Conditions
          const isSpiral = L_drained > 0.14 && drainedState > 0.05;
          const hasFace = L_faces > 0.12 && faceEmergence > 0.02;
          const hasBoy = L_boy > 0.06;

          let a = 0;
          let chr = '';
          let isBright = false;
          let isGlitched = false;

          if (isSpiral) {
            // Drained scribble vortex coils (anxiety-drained state)
            const spiralL = L_drained * drainedState;
            a = Math.min(1, (spiralL * 1.6) * cleanFade);
            const rIdx = Math.min(spiralLen - 1, (spiralL * spiralLen) | 0);
            chr = SPIRAL_RAMP[rIdx];
            isBright = true;
          } else if (hasBoy) {
            // Boy: primary anchor figure; dims down into hollow silhouette as anxiety coils take over
            const dimFactor = 1 - drainedState * 0.75;
            const combinedL = hasFace
              ? Math.max(L_boy * dimFactor, L_faces * faceEmergence * 0.85)
              : L_boy * dimFactor;
            const isShirtOrArm = L_boy <= 0.16;
            // Slightly visible shirt and left arm (a ~ 0.32..0.38)
            a = Math.min(1, Math.max(isShirtOrArm ? 0.32 : 0.44, combinedL * 1.45) * cleanFade);
            const rIdx = Math.min(rampLen - 1, Math.max(isShirtOrArm ? 1 : 0, (combinedL * rampLen) | 0));
            chr = RAMP[rIdx];
            if (hasFace && faceEmergence > 0.35 && Math.random() < 0.08) {
              isBright = true;
            }
          } else if (hasFace) {
            // Looming sketched crowd faces emerging around and above the boy
            const faceL = L_faces * faceEmergence;
            a = Math.min(1, (faceL * 1.40) * cleanFade);
            const rIdx = Math.min(denseLen - 1, (faceL * denseLen) | 0);
            chr = DENSE_RAMP[rIdx];
            isBright = (faceEmergence > 0.35 && faceL > 0.45);
          } else {
            // Background thoughts: clearly legible with solid contrast
            a = 0.36 * cleanFade;
            chr = TXT[(r * cols + c) % TXT.length];
          }

          // ── Subtle Fluid Distortion & Glitch Mechanics ──────────────────
          let drawX = baseX;
          let drawY = baseY;

          if (s.cpx > 0) {
            const dx = baseX - s.cpx;
            const dy = baseY - s.cpy;
            const dd = Math.hypot(dx, dy);

            if (dd < DISTORT_RADIUS) {
              const norm = 1 - dd / DISTORT_RADIUS;
              const falloff = norm * norm; // Quadratic fluid falloff

              // 1. Subtle fluid liquid repulsion
              const pushForce = falloff * (5 + s.distortEnergy * 6);
              drawX += (dx / (dd + 1)) * pushForce;
              drawY += (dy / (dd + 1)) * pushForce;

              // 2. Gentle liquid wake drag from cursor velocity
              drawX += s.vx * falloff * 0.12;
              drawY += s.vy * falloff * 0.12;

              // 3. Delicate wave ripple
              const ripple = Math.sin(dd * 0.14 - now * 0.012) * falloff * (1.2 + s.distortEnergy * 1.5);
              drawX += (dx / (dd + 1)) * ripple;
              drawY += (dy / (dd + 1)) * ripple;

              // 4. Subtle, occasional glitch scramble
              const glitchProb = falloff * (0.05 + s.distortEnergy * 0.09);
              if (Math.random() < glitchProb) {
                chr = GLITCH_CHARS[(Math.random() * glitchLen) | 0];
                // Tiny scanline jitter
                drawX += (Math.random() - 0.5) * 3.5 * norm;
                isGlitched = true;
                a = Math.min(1, a + 0.22 * norm);
              } else {
                a = Math.min(1, a + norm * 0.20);
              }
            }
          }

          if (a < 0.04) continue;

          // Zero-allocation pre-cached color palette (eliminates GC pauses)
          const bucket = Math.min(25, (a * 25) | 0);
          const fill = isGlitched
            ? GLITCH_PALETTE[bucket]
            : isBright
            ? BRIGHT_PALETTE[bucket]
            : INK_PALETTE[bucket];

          if (fill !== lastFill) {
            ctx.fillStyle = fill;
            lastFill = fill;
          }

          ctx.fillText(chr, drawX, drawY);
        }
      }

      // ── Dynamic Tension Caption (Narrator Job: small sans caps at ~60% opacity) ──
      let cp = 'Racing thoughts';
      if (p > 0.72) {
        cp = 'Completely drained.';
        // Story color code: Lime drains completely to muted ash-grey at ~60% opacity
        caption.style.color = 'rgba(180, 175, 165, 0.65)';
      } else if (p > 0.42) {
        cp = 'The voices crowd in.';
        caption.style.color = 'rgba(233, 230, 223, 0.60)';
      } else if (p > 0.22) {
        cp = 'You keep smiling. It keeps growing.';
        caption.style.color = 'rgba(233, 230, 223, 0.60)';
      } else {
        caption.style.color = 'rgba(233, 230, 223, 0.60)';
      }

      if (caption.textContent !== cp) caption.textContent = cp;
      caption.style.opacity = String(seg(p, 0.22, 0.38) * cleanFade);
    };

    let isAnxRunning = true;
    const anxLoop = (now) => {
      if (!isAnxRunning) return;
      loop(now);
      s.animId = requestAnimationFrame(anxLoop);
    };
    s.animId = requestAnimationFrame(anxLoop);

    const onVisibility = () => {
      if (document.hidden) {
        isAnxRunning = false;
        cancelAnimationFrame(s.animId);
      } else {
        if (!isAnxRunning) {
          isAnxRunning = true;
          s.animId = requestAnimationFrame(anxLoop);
        }
      }
    };
    document.addEventListener('visibilitychange', onVisibility);

    return () => {
      isAnxRunning = false;
      cancelAnimationFrame(s.animId);
      window.removeEventListener('resize', resize);
      window.removeEventListener('pointermove', onPointer);
      window.removeEventListener('pointerleave', onPointerLeave);
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, []);

  return (
    <section className="anxiety-scene scene" id="anx" aria-labelledby="anx-title">
      <p className="eyebrow anx-index type-narrator">THE WEIGHT <span>04</span></p>
      <h2 id="anx-title" className="sr-only">The weight of it all</h2>
      <canvas ref={canvasRef} id="wall" aria-hidden="true" />
      <div ref={captionRef} id="cap" className="type-narrator" />
    </section>
  );
}
