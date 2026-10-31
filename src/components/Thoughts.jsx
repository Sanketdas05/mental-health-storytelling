import { useEffect, useRef } from 'react';
import { gsap, prefersReducedMotion } from '../animations/motion';
import { audioManager } from '../utils/audio';

// Four discrete luminance levels for chunky analog static on phone screen
const LUMA = [12, 70, 195, 250];

// Landing points on body (0..1 figure-space), the word that lands there, and when (local p)
const SEEDS = [
  [.36, .26, "what if they leave", .54],
  [.64, .26, "you're too much", .58],
  [.50, .36, "why can't I just be normal", .62],
  [.32, .42, "nobody gets it", .66],
  [.68, .42, "don't be a burden", .70],
  [.50, .50, "just say you're fine", .74],
  [.50, .56, "keep smiling", .78]
];

// Ambient whispered background thoughts
const AMB = [
  ["breathe", .50, .08],
  ["it's fine.", .36, .28],
  ["nod.", .70, .38],
  ["act normal", .78, .52],
  ["everyone else is coping", .74, .68],
  ["smile", .80, .78],
  ["don't make it weird", .30, .48],
  ["they're watching", .22, .88]
];

// Exact eye coordinates and metrics in figure.png (source dimensions 896 x 1200)
const FIGW = 896;
const FIGH = 1200;
const EYES = [
  { x: 394, y: 318, rx: 26, ry: 13.5, irisR: 12.5, patchSize: 28 }, // Viewer's left
  { x: 511, y: 317, rx: 27, ry: 13.5, irisR: 13.0, patchSize: 28 }  // Viewer's right
];

const CS = 8;
const CH = 11;
const RAMP = " .,:;-=+*x#%@";

const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
const lerp = (a, b, k) => a + (b - a) * k;
const seg = (t, a, b) => clamp((t - a) / (b - a));
const ez = (x) => x * x * (3 - 2 * x);

const heart = (now, p) => {
  const bpm = 58 + 62 * p;
  const ph = (now / 1000 * bpm / 60) % 1;
  return Math.exp(-ph * 9);
};

export function Thoughts() {
  const phoneCanvasRef = useRef(null);
  const figCanvasRef = useRef(null);
  const textCanvasRef = useRef(null);
  const progressRef = useRef(0);

  // Hook for timeline to update phase 3 local progress (0..1)
  useEffect(() => {
    window.__setPhase3Progress = (val) => {
      progressRef.current = val;
    };
    return () => {
      delete window.__setPhase3Progress;
    };
  }, []);

  // ─── 1. Phone Screen CRT Static, Tearing & Degraded Ghost Eyes ──────────
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

    const state = {
      staticAmp: 1.0,
      charFlash: 0.0,
      tearPulse: 0.0,
      time: 0,
    };

    window.__setPhoneStaticAmp = (amp) => {
      state.staticAmp = Math.max(0.04, Math.min(1.0, amp));
    };

    window.__triggerPhoneTearFlash = () => {
      state.charFlash = 1.0;
      state.tearPulse = 1.0;
      try {
        audioManager.playMessageNotification();
      } catch (_) { }
    };

    const numBands = 4;
    const tearBands = Array.from({ length: numBands }, () => ({
      y: Math.random() * ch,
      h: 4 + Math.random() * 16,
      offset: (Math.random() - 0.5) * 18,
      nextUpdate: performance.now() + 100 + Math.random() * 200,
    }));

    const offStatic = document.createElement('canvas');
    offStatic.width = cw;
    offStatic.height = ch;
    const offStaticCtx = offStatic.getContext('2d', { willReadFrequently: true });
    const staticImgData = offStaticCtx.createImageData(cw, ch);
    const staticBuf = new Uint32Array(staticImgData.data.buffer);

    const offChar = document.createElement('canvas');
    offChar.width = cw;
    offChar.height = ch;
    const offCharCtx = offChar.getContext('2d', { willReadFrequently: true });
    let charReady = false;

    const charImg = new Image();
    charImg.src = '/media/character-anxious.jpg';
    charImg.onload = () => {
      if (!offCharCtx) return;
      const eyeSx = 285;
      const eyeSy = 235;
      const eyeSw = 326;
      const eyeSh = 150;

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

          if (ellipseDist > 1.0) {
            d[idx] = 10;
            d[idx + 1] = 10;
            d[idx + 2] = 9;
            d[idx + 3] = 255;
            continue;
          }

          const feather = ellipseDist > 0.75 ? (1.0 - ellipseDist) / 0.25 : 1.0;

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

          d[idx] = Math.min(255, Math.floor(inkVal * 0.94));
          d[idx + 1] = Math.min(255, Math.floor(inkVal * 1.02));
          d[idx + 2] = Math.min(255, Math.floor(inkVal * 0.88));
          d[idx + 3] = 255;
        }
      }

      offCharCtx.putImageData(imgData, 0, 0);
      charReady = true;
    };

    let lastStaticTime = 0;
    let animId;
    let phoneSceneEl = null;

    const loop = (timestamp) => {
      animId = requestAnimationFrame(loop);

      // Only stop phone CRT static once phone scene has fully completed / dollied away (p >= 0.55)
      const p = progressRef.current;
      if (p >= 0.55) {
        return;
      }

      // Skip CRT rendering if phone scene is inactive / hidden before phase 3
      const el = phoneSceneEl || (phoneSceneEl = document.getElementById('phoneScene'));
      if (el && el.style.visibility === 'hidden' && p <= 0) {
        return;
      }

      state.time += 0.016;

      if (state.charFlash > 0.01) state.charFlash *= 0.88;
      else state.charFlash = 0;

      if (state.tearPulse > 0.01) state.tearPulse *= 0.84;
      else state.tearPulse = 0;

      const shouldUpdateStatic = (timestamp - lastStaticTime > 75);
      if (shouldUpdateStatic) lastStaticTime = timestamp;

      ctx.fillStyle = '#080907';
      ctx.fillRect(0, 0, cw, ch);

      if (charReady && offCharCtx) {
        const baseAlpha = 0.06 + Math.sin(state.time * 2.3) * 0.04;
        const flashAlpha = state.charFlash * 0.42;
        const totalCharAlpha = Math.min(0.55, baseAlpha + flashAlpha);

        ctx.save();
        ctx.globalAlpha = totalCharAlpha;
        const jitterX = state.charFlash > 0.1 ? (Math.random() - 0.5) * 6 : 0;
        ctx.drawImage(offChar, jitterX, 0);
        ctx.restore();
      }

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
          ctx.drawImage(canvas, 0, b.y, cw, b.h, b.offset, b.y, cw, b.h);
        }

        if (state.tearPulse > 0.1) {
          const py = ch * 0.44 + (Math.random() - 0.5) * 44;
          const poff = (Math.random() > 0.5 ? 1 : -1) * (20 + state.tearPulse * 24);
          ctx.drawImage(canvas, 0, py, cw, 24, poff, py, cw, 24);
        }
      }

      const amp = state.staticAmp;
      if (amp > 0.03) {
        if (shouldUpdateStatic) {
          const total = cw * ch;
          const thresh = Math.min(0.95, amp * 1.15);
          for (let i = 0; i < total; i++) {
            if (Math.random() < thresh) {
              const v = LUMA[Math.floor(Math.random() * 4)];
              const a = Math.floor(amp * 190 * (0.4 + Math.random() * 0.6));
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

  // ─── 2. Prototype Phase 3: Alive Character + Tracking Eyes + Glitch Erosion ───
  useEffect(() => {
    const cv = textCanvasRef.current;
    const fg = figCanvasRef.current;
    if (!cv || !fg) return;

    const cx = cv.getContext('2d');
    const fx = fg.getContext('2d');
    if (!cx || !fx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    let W = window.innerWidth;
    let H = window.innerHeight;
    const resizeCanvases = () => {
      W = window.innerWidth;
      H = window.innerHeight;
      cv.width = Math.round(W * dpr);
      cv.height = Math.round(H * dpr);
      fg.width = Math.round(W * dpr);
      fg.height = Math.round(H * dpr);
      cx.setTransform(dpr, 0, 0, dpr, 0, 0);
      fx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resizeCanvases();

    const reduced = prefersReducedMotion();

    // Prepare figure with complete multi-pass background removal (0 black box!)
    const offChar = document.createElement('canvas');
    const offCtx = offChar.getContext('2d', { willReadFrequently: true });
    let charFigureReady = false;
    let P = [];

    const buildGrid = () => {
      if (!charFigureReady) return;
      const cols = Math.ceil(W / CS);
      const rows = Math.ceil(H / CH);
      // Man dimensions (0.90 height, 0.07 top) - exactly matching Phase 4 AnxietyScene
      const fh = H * 0.90;
      const fw = fh * (FIGW / FIGH);
      const figR = {
        x: (W - fw) / 2,
        y: H * 0.07,
        w: fw,
        h: fh,
        s: fw / FIGW
      };

      // Sample luminance grid from transparent character
      const c = document.createElement('canvas');
      c.width = cols;
      c.height = rows;
      const x = c.getContext('2d');
      x.drawImage(offChar, 0, 0, offChar.width, offChar.height, figR.x / CS, figR.y / CH, figR.w / CS, figR.h / CH);
      const d = x.getImageData(0, 0, cols, rows).data;
      const LF = new Float32Array(cols * rows);

      for (let i = 0; i < LF.length; i++) {
        const a = d[i * 4 + 3] / 255;
        LF[i] = ((d[i * 4] * 0.3 + d[i * 4 + 1] * 0.59 + d[i * 4 + 2] * 0.11) / 255) * a;
      }

      const seeds = SEEDS.map(s => ({
        x: figR.x + s[0] * figR.w,
        y: figR.y + s[1] * figR.h,
        w: s[2],
        t: s[3]
      }));

      const S = [];

      for (let r = 0; r < rows; r++) {
        for (let col = 0; col < cols; col++) {
          const i = r * cols + col;
          const cellX = col * CS + CS / 2;
          const cellY = r * CH + CH / 2;
          const alpha = d[i * 4 + 3] / 255;
          const lum = LF[i];

          // Glitch effect covers skin and facial/anatomical contours
          const isSkin = (alpha > 0.15 && lum >= 0.10);
          if (isSkin) {
            let tc = 9, wd = '';
            const eye = EYES.some(e => {
              const ex = figR.x + e.x * figR.s;
              const ey = figR.y + e.y * figR.s;
              const dx = (cellX - ex) / (e.rx * figR.s * 1.15);
              const dy = (cellY - ey) / (e.ry * figR.s * 1.15);
              return dx * dx + dy * dy <= 1.0;
            });
            if (!eye) {
              seeds.forEach(s => {
                const t = s.t + Math.hypot(cellX - s.x, cellY - s.y) / 850 + (Math.random() - 0.5) * 0.02;
                if (t < tc) {
                  tc = t;
                  wd = s.w;
                }
              });
            }
            S.push({ x: cellX, y: cellY, L: Math.max(0.12, lum), tc: eye ? 0.95 : tc, eye, wd, id: i });
          }
        }
      }
      P = S;
    };

    const charImg = new Image();
    let irisCanvases = null;

    const onFigureLoaded = () => {
      const w = charImg.naturalWidth || FIGW;
      const h = charImg.naturalHeight || FIGH;
      offChar.width = w;
      offChar.height = h;
      offCtx.clearRect(0, 0, w, h);
      offCtx.drawImage(charImg, 0, 0);

      // Extract high-resolution circular irises from original figure
      irisCanvases = EYES.map(eye => {
        const c = document.createElement('canvas');
        c.width = eye.patchSize;
        c.height = eye.patchSize;
        const ctx = c.getContext('2d');
        if (!ctx) return c;
        const half = eye.patchSize / 2;
        ctx.beginPath();
        ctx.arc(half, half, eye.irisR, 0, Math.PI * 2);
        ctx.clip();
        ctx.drawImage(
          charImg,
          eye.x - half,
          eye.y - half,
          eye.patchSize,
          eye.patchSize,
          0,
          0,
          eye.patchSize,
          eye.patchSize
        );
        return c;
      });

      // Clear the static irises on offChar with the sclera tone so character has clean white eyeballs
      offCtx.save();
      offCtx.fillStyle = '#fcfbfa';
      EYES.forEach(eye => {
        offCtx.beginPath();
        offCtx.ellipse(eye.x, eye.y, eye.irisR + 0.5, eye.irisR, 0, 0, Math.PI * 2);
        offCtx.fill();
      });
      offCtx.restore();

      charFigureReady = true;
      buildGrid();
    };
    charImg.onload = onFigureLoaded;
    charImg.src = '/media/figure.png';
    if (charImg.complete && charImg.naturalWidth > 0) {
      onFigureLoaded();
    }

    // Tracking state
    let px = -999, py = -999;
    let eyeCurX = 0, eyeCurY = 0;

    const onPointerMove = (e) => {
      px = e.clientX;
      py = e.clientY;
    };
    window.addEventListener('pointermove', onPointerMove, { passive: true });
    window.addEventListener('resize', () => {
      resizeCanvases();
      buildGrid();
    });

    let animId;
    const frame = (now) => {
      const p = progressRef.current;

      // Only run figure and thought rendering when Phase 3 is active
      if (p <= 0.005 || p >= 0.99) {
        return;
      }

      const fh = H * 0.90;
      const fw = fh * (FIGW / FIGH);
      const figR = {
        x: (W - fw) / 2,
        y: H * 0.07,
        w: fw,
        h: fh,
        s: fw / FIGW
      };

      // Flinch impulse calculated from landing thoughts
      let fl = 0;
      SEEDS.forEach((s) => {
        const d = p - s[3];
        if (d > 0 && d < 0.05) {
          fl += (1 - d / 0.05) * Math.sin(d * 1400) * 0.5;
        }
      });

      const br = Math.sin(now / 4600 * 6.283);
      const hb = heart(now, p) * 0.006 * (reduced ? 0 : 1);
      const sy = 1 + 0.011 * br + hb + fl * 0.01;
      const sx = 1 + 0.004 * br + hb * 0.4;
      const sway = 0.004 * Math.sin(now / 1700) + fl * 0.01;
      const pvx = figR.x + figR.w / 2;
      const pvy = figR.y + figR.h;
      const Tf = (x, y) => {
        const ys = pvy + (y - pvy) * sy;
        const xs = pvx + (x - pvx) * sx;
        return [xs + sway * (ys - pvy), ys];
      };

      // ── Smooth Gaze Tracking calculation ──
      let targetGazeX = 0;
      let targetGazeY = 0;

      if (px > -100 && !reduced) {
        // Calculate eye midpoint in world/screen coordinates
        const midSrcX = (EYES[0].x + EYES[1].x) / 2;
        const midSrcY = (EYES[0].y + EYES[1].y) / 2;
        const [midScreenX, midScreenY] = Tf(figR.x + midSrcX * figR.s, figR.y + midSrcY * figR.s);

        const dx = px - midScreenX;
        const dy = py - midScreenY;
        const dist = Math.hypot(dx, dy);
        const angle = Math.atan2(dy, dx);

        // Maximum travel inside eye socket (elliptical range)
        const maxTravelX = 13.0 * figR.s;
        const maxTravelY = 5.0 * figR.s;

        // Smooth acceleration based on cursor distance
        const mag = Math.min(1.0, dist / 280);

        // Anxious micro-tremor
        const microJitter = (Math.sin(now / 95) * 0.35 + (Math.random() - 0.5) * 0.25) * figR.s;

        targetGazeX = Math.cos(angle) * maxTravelX * mag + microJitter;
        targetGazeY = Math.sin(angle) * maxTravelY * mag + microJitter * 0.5;
      } else {
        // Subtle natural breathing / nervous drift when no pointer
        targetGazeX = Math.sin(now / 1400) * 1.8 * figR.s;
        targetGazeY = Math.cos(now / 1900) * 1.0 * figR.s;
      }

      eyeCurX = lerp(eyeCurX, targetGazeX, 0.16);
      eyeCurY = lerp(eyeCurY, targetGazeY, 0.16);

      // ── Render Figure Layer ──
      fx.clearRect(0, 0, W, H);
      const figA = seg(p, 0.40, 0.52) * (1 - seg(p, 0.88, 0.96));

      if (figA > 0 && charFigureReady) {
        fx.save();
        fx.globalAlpha = figA;
        fx.translate(pvx, pvy);
        fx.transform(1, 0, sway, 1, 0, 0);
        fx.scale(sx, sy);
        fx.translate(-pvx, -pvy);

        // Draw transparent character (with clean sclera ready for tracking pupils)
        fx.drawImage(offChar, figR.x, figR.y, figR.w, figR.h);

        // Render Tracking Pupils clipped to scleras
        if (irisCanvases && irisCanvases.length === 2) {
          EYES.forEach((eye, i) => {
            const cx = figR.x + eye.x * figR.s;
            const cy = figR.y + eye.y * figR.s;
            const scleraRx = eye.rx * figR.s;
            const scleraRy = eye.ry * figR.s;

            fx.save();
            fx.beginPath();
            fx.ellipse(cx, cy, scleraRx, scleraRy, 0, 0, Math.PI * 2);
            fx.clip();

            const ic = irisCanvases[i];
            const destW = ic.width * figR.s;
            const destH = ic.height * figR.s;
            const destX = cx + eyeCurX - destW / 2;
            const destY = cy + eyeCurY - destH / 2;
            fx.drawImage(ic, destX, destY, destW, destH);
            fx.restore();
          });
        }



        // GLITCH EROSION: Erase cells where thoughts have landed!
        for (const q of P) {
          if (q.tc < p && !q.eye) {
            fx.clearRect(q.x - CS / 2 - 0.5, q.y - CH / 2 - 0.5, CS + 1, CH + 1);
          }
        }

        fx.restore();
      }

      // ── Render Text & Glitch Glyphs Layer ──
      cx.clearRect(0, 0, W, H);
      if (p > 0.42 && p < 0.98) {
        // Approaching thoughts landing on body (disappear the instant they hit the character!)
        cx.textBaseline = 'middle';
        const fontSize = Math.max(14, Math.min(22, W * 0.015));
        cx.font = `600 ${fontSize}px "JetBrains Mono", monospace`;

        SEEDS.forEach((s, i) => {
          // Disappear as soon as the thought lands on the character (p >= s[3])
          if (p < s[3] - 0.14 || p >= s[3]) return;
          const a = ez(seg(p, s[3] - 0.13, s[3]));
          const sx0 = (s[0] < 0.5 ? W * 0.16 : W * 0.84);
          const sy0 = H * (0.16 + 0.10 * (i % 7));

          const targetX = figR.x + s[0] * figR.w;
          const targetY = figR.y + s[1] * figR.h;

          const x = lerp(sx0, targetX, a);
          const y = lerp(sy0, targetY, a);
          const alpha = seg(p, s[3] - 0.14, s[3] - 0.08) * (1 - seg(p, s[3] - 0.015, s[3]));

          const word = s[2];
          const isTier1 = (word === "you're too much" || word === "what if they leave" || word === "nobody gets it" || word === "why can't I just be normal" || word === "don't be a burden");
          const isTier2 = (word === "just say you're fine" || word === "keep smiling");

          cx.textAlign = 'center';

          if (isTier1) {
            // Tier 1: Full brightness + soft dark halo
            cx.save();
            cx.shadowColor = 'rgba(0, 0, 0, 0.95)';
            cx.shadowBlur = 12;
            cx.fillStyle = `rgba(255, 255, 255, ${Math.max(0, alpha * 0.98)})`;
            cx.fillText(word, x, y);
            cx.restore();
          } else if (isTier2) {
            // Tier 2: ~60% opacity
            cx.fillStyle = `rgba(233, 230, 223, ${Math.max(0, alpha * 0.60)})`;
            cx.fillText(word, x, y);
          } else {
            // Tier 3: ~35% opacity
            cx.fillStyle = `rgba(215, 210, 200, ${Math.max(0, alpha * 0.35)})`;
            cx.fillText(word, x, y);
          }
        });

        // Ambient whispered background thoughts
        AMB.forEach(([w, u, v]) => {
          const a = (1 - seg(p, 0.82, 0.92)) * seg(p, 0.44, 0.52);
          if (a <= 0) return;
          cx.fillStyle = `rgba(215, 210, 200, ${0.35 * a})`;
          cx.textAlign = 'center';
          cx.fillText(w, W * u + Math.sin(now / 2000 + u * 9) * 6, H * v);
        });

        // GLITCH GLYPHS: Render letters of the thoughts + glitch glyphs covering skin
        cx.font = `600 ${CS * 1.55}px "JetBrains Mono", monospace`;
        cx.textAlign = 'left';
        const t4 = (now / 110) | 0;

        for (const q of P) {
          if (p < q.tc || q.eye) continue;
          let [x, y] = Tf(q.x, q.y);

          const isGlitching = (p - q.tc < 0.08);
          let ch;
          if (isGlitching || (q.id + t4 * ((q.id % 7) + 1)) % 19 === 0) {
            ch = RAMP[(Math.random() * RAMP.length) | 0];
          } else {
            ch = q.wd ? q.wd[q.id % q.wd.length] : RAMP[Math.min(RAMP.length - 1, (q.L * RAMP.length) | 0)];
          }
          if (!ch || ch === ' ') continue;

          const fadeOut = 1 - seg(p, 0.88, 0.96);
          const alpha = Math.min(1, (0.55 + q.L * 0.45) * fadeOut);

          cx.fillStyle = isGlitching ? '#ffffff' : `rgba(233, 230, 223, ${alpha})`;
          cx.fillText(ch, x - CS / 2, y);
        }
      }
    };

    let isAnimRunning = true;
    function loop(now) {
      if (!isAnimRunning) return;
      frame(now);
      animId = requestAnimationFrame(loop);
    }
    animId = requestAnimationFrame(loop);

    const onVisibilityChange = () => {
      if (document.hidden) {
        isAnimRunning = false;
        cancelAnimationFrame(animId);
      } else {
        if (!isAnimRunning) {
          isAnimRunning = true;
          animId = requestAnimationFrame(loop);
        }
      }
    };
    document.addEventListener('visibilitychange', onVisibilityChange);

    return () => {
      isAnimRunning = false;
      cancelAnimationFrame(animId);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('resize', resizeCanvases);
      document.removeEventListener('visibilitychange', onVisibilityChange);
    };
  }, []);

  return (
    <section className="thoughts scene" id="phoneScene" aria-labelledby="phone-scene-title">
      <p className="eyebrow phone-index type-narrator" id="phone-scene-title">THE MESSAGE <span>02</span></p>

      {/* ── 1. SCENE BACKDROP: Dark Workstation ── */}
      <div className="phone-scene-backdrop" aria-hidden="true" />

      {/* ── Soft Phosphor Spill ── */}
      <div className="phone-glow-spill" aria-hidden="true" />

      {/* ── 2. Prototype Phase 3 Alive Figure & Glitching Thoughts Canvases ── */}
      <canvas
        ref={figCanvasRef}
        id="fig"
        className="phase3-fig-canvas"
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 2 }}
        aria-hidden="true"
      />
      <canvas
        ref={textCanvasRef}
        id="cv"
        className="phase3-cv-canvas"
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 3 }}
        aria-hidden="true"
      />

      {/* ── 3. PHASE 3 DESK PHONE (match-cut from workstation desk, full UI intact!) ── */}
      <div id="ph" className="desk-phone-matchcut" aria-label="A desk phone receiving a message through signal interference" style={{ zIndex: 4 }}>
        {/* Layer a: Casing illustration */}
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
