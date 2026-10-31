/**
 * EntryGate — NO SIGNAL Preloader -> CRT Power-On Transition
 *
 * States:
 *   loading  -> label aria-disabled, cursor:progress, real/simulated progress
 *   ready    -> blinking "CLICK TO TUNE IN", label focused
 *   hover    -> "STATUS: FINE" / "[ ENTER ]", static dims 30%
 *   activate -> label fade -> clip-path collapses to CRT screen rect (620ms)
 *               -> bright horizontal line (240ms) -> dot fade (220ms) -> CRT powers on
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { audioManager } from '../utils/audio';

/* ── Assets to preload (Critical for initial scene, remainder deferred to idle) ── */
const CRITICAL_ASSETS = [
  '/media/ws-desk.jpg',
  '/media/ws-bg.jpg',
];

const DEFERRED_ASSETS = [
  '/media/ws-char.png',
  '/media/character-anxious.jpg',
  '/media/anxiety.jpeg',
  '/media/anxiety-drained.png',
  '/media/room.jpg',
  '/media/hands.png',
];

const ASSETS = CRITICAL_ASSETS;

/* ── Terminal fragments flashed on the static ── */
const TERMINAL_LINES = [
  '> connect --user',
  '> status: fine',
  '> no reply',
  '> ping: timeout',
  '> mask --enable',
  '> signal: lost',
];

/* ── Four discrete luminance levels for chunky analog static ── */
const LUMA = [12, 70, 195, 250];

function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
function pick(arr) {
  return arr[randInt(0, arr.length - 1)];
}

/* ── Static canvas hook — runs a rAF loop, reads brightness from ref ── */
function useStaticCanvas(canvasRef, brightnessRef) {
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    // 220x124 offscreen — upscaled with image-rendering:pixelated via CSS
    const off = document.createElement('canvas');
    off.width = 220;
    off.height = 124;
    const oCtx = off.getContext('2d', { willReadFrequently: true });

    let animId;
    let lastDraw = 0;

    const draw = (ts) => {
      animId = requestAnimationFrame(draw);
      if (ts - lastDraw < 80) return; // ~12.5 fps for chunky analog feel
      lastDraw = ts;

      const id = oCtx.createImageData(220, 124);
      const buf = new Uint32Array(id.data.buffer);
      for (let i = 0; i < buf.length; i++) {
        const v = LUMA[randInt(0, 3)];
        buf[i] = 0xff000000 | (v << 16) | (v << 8) | v;
      }
      oCtx.putImageData(id, 0, 0);

      const br = brightnessRef.current != null ? brightnessRef.current : 1;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.filter = `brightness(${br})`;
      ctx.drawImage(off, 0, 0, canvas.width, canvas.height);
      ctx.filter = 'none';
    };

    animId = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(animId);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}

/* ── Simulated progress ramp (~1.2 s ease for fast LCP & low main thread time) ── */
function useSimProgress(enabled) {
  const [pct, setPct] = useState(0);
  useEffect(() => {
    if (!enabled) return;
    const start = Date.now();
    const dur = 1200;
    let raf;
    const tick = () => {
      const t = Math.min(1, (Date.now() - start) / dur);
      const eased = t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
      setPct(Math.round(eased * 100));
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [enabled]);
  return pct;
}

/* ══════════════════════════════════════════════
   MAIN COMPONENT
   ══════════════════════════════════════════════ */
export function EntryGate({ onEnter }) {
  const containerRef = useRef(null);
  const canvasRef    = useRef(null);
  const labelRef     = useRef(null);

  /* Loading */
  const [realPct, setRealPct]   = useState(0);
  const [realDone, setRealDone] = useState(false);
  const useSimulated = ASSETS.length === 0;
  const simPct  = useSimProgress(useSimulated);
  const pct     = useSimulated ? simPct : realPct;
  const isReady = useSimulated ? simPct >= 100 : realDone;

  /* Interaction */
  const [isHover,     setIsHover]     = useState(false);
  const [isActivated, setIsActivated] = useState(false);

  /* Glitch */
  const [glitchLabel, setGlitchLabel] = useState(false);
  const [termLine,    setTermLine]    = useState(null);

  /* Canvas brightness (via ref for zero-allocation loop) */
  const brightnessRef = useRef(1.0);

  /* Reduced motion */
  const reduced = typeof window !== 'undefined'
    ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
    : false;

  useStaticCanvas(canvasRef, brightnessRef);

  /* Real asset preloading with critical path priority */
  useEffect(() => {
    if (useSimulated) return;
    let loaded = 0;
    const total = ASSETS.length;
    const bump = () => {
      loaded += 1;
      const p = Math.min(100, Math.round((loaded / total) * 100));
      setRealPct(p);
      if (loaded >= total) setTimeout(() => setRealDone(true), 150);
    };
    ASSETS.forEach(src => {
      const img = new Image();
      img.src = src;
      img.onload = bump;
      img.onerror = bump;
    });
    const fallback = setTimeout(() => { setRealPct(100); setRealDone(true); }, 1500);

    // Preload deferred non-critical assets during browser idle time
    const preloadDeferred = () => {
      DEFERRED_ASSETS.forEach(src => {
        const img = new Image();
        img.src = src;
      });
    };

    if (typeof window !== 'undefined' && 'requestIdleCallback' in window) {
      window.requestIdleCallback(preloadDeferred, { timeout: 3000 });
    } else {
      setTimeout(preloadDeferred, 1500);
    }

    return () => clearTimeout(fallback);
  }, [useSimulated]);

  /* Auto-focus when ready */
  useEffect(() => {
    if (isReady && labelRef.current) {
      setTimeout(() => { if (labelRef.current) labelRef.current.focus(); }, 80);
    }
  }, [isReady]);

  /* Glitch loop (every 2-5 s) */
  useEffect(() => {
    if (reduced || isActivated) return;
    let timer;
    const schedule = () => {
      timer = setTimeout(() => {
        if (isActivated) return;
        setGlitchLabel(true);
        setTermLine({ text: pick(TERMINAL_LINES), x: randInt(5, 75), y: randInt(10, 80) });
        const dur = randInt(80, 150);
        setTimeout(() => { setGlitchLabel(false); setTermLine(null); }, dur);
        schedule();
      }, randInt(2000, 5000));
    };
    schedule();
    return () => clearTimeout(timer);
  }, [reduced, isActivated]);

  /* Sync canvas brightness with hover */
  useEffect(() => {
    brightnessRef.current = isHover ? 0.7 : 1.0;
  }, [isHover]);

  /* Activation sequence */
  const handleActivate = useCallback(() => {
    if (!isReady || isActivated) return;
    setIsActivated(true);
    audioManager.playEnterThump();
    audioManager.init();

    const container = containerRef.current;
    if (!container) { if (onEnter) onEnter(); return; }

    /* Locate CRT screen face element */
    const getCRTRect = () => {
      const candidates = [
        document.querySelector('.crt-screen-face'),
        document.querySelector('.crt-screen-inner'),
        document.querySelector('.crt-bezel'),
      ];
      for (const el of candidates) {
        if (el) {
          const r = el.getBoundingClientRect();
          if (r.width > 0) return r;
        }
      }
      /* Fallback geometry matching CSS variables */
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      const bezelW = Math.max(300, Math.min(920, vw * 0.72));
      const bezelH = bezelW * 0.75;
      const pad    = Math.max(14, Math.min(32, bezelW * 0.025));
      const grille = Math.max(6, Math.min(12, bezelH * 0.012));
      const sw = bezelW - pad * 2;
      const sh = bezelH - pad * 2 - grille;
      const sl = (vw - bezelW) / 2 + pad;
      const st = (vh - bezelH) / 2 + pad;
      return { left: sl, top: st, width: sw, height: sh, right: sl + sw, bottom: st + sh };
    };

    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const r  = getCRTRect();

    if (reduced) {
      container.style.transition = 'opacity 450ms ease';
      container.style.opacity = '0';
      setTimeout(() => { container.style.display = 'none'; if (onEnter) onEnter(); }, 480);
      return;
    }

    /* Phase 1 — label fades out (160 ms) */
    const lbl = labelRef.current;
    if (lbl) { lbl.style.transition = 'opacity 160ms ease'; lbl.style.opacity = '0'; }

    /* Phase 2 — clip-path shrinks to CRT screen rect (520 ms) */
    setTimeout(() => {
      container.style.transition = 'clip-path 520ms cubic-bezier(.7,0,.3,1)';
      container.style.clipPath =
        `inset(${r.top}px ${vw - r.right}px ${vh - r.bottom}px ${r.left}px)`;

      /* Phase 3 — compress into horizontal CRT cathode beam line (170 ms) */
      setTimeout(() => {
        brightnessRef.current = 3.5;
        container.style.filter = 'brightness(3.2)';
        const cy = r.top + r.height / 2;
        container.style.transition =
          'clip-path 170ms cubic-bezier(.7,0,.15,1), filter 170ms ease';
        container.style.clipPath =
          `inset(${cy - 1.5}px ${vw - r.right}px ${vh - cy - 1.5}px ${r.left}px)`;

        /* Phase 4 — hand off seamlessly to CRT screen expansion */
        setTimeout(() => {
          container.style.display = 'none';
          if (onEnter) onEnter();
        }, 175);
      }, 530);
    }, 160);
  }, [isReady, isActivated, onEnter, reduced]);

  /* Keyboard */
  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleActivate();
    }
  }, [handleActivate]);

  /* Glitched "NO SIGNAL" text */
  const BASE = 'NO SIGNAL';
  const glitchedText = (() => {
    if (!glitchLabel) return BASE;
    const arr = BASE.split('');
    const n = randInt(1, 3);
    const used = [];
    for (let k = 0; k < n; k++) {
      let idx = randInt(0, arr.length - 1);
      let tries = 0;
      while ((used.includes(idx) || arr[idx] === ' ') && tries < 20) {
        idx = randInt(0, arr.length - 1);
        tries++;
      }
      arr[idx] = '_';
      used.push(idx);
    }
    return arr.join('');
  })();

  return (
    <div
      ref={containerRef}
      className={`eg-root${isActivated ? ' eg-activating' : ''}`}
      role="dialog"
      aria-modal="true"
      aria-label="Loading — I'm fine."
      aria-busy={!isReady}
      style={{ clipPath: 'inset(0px 0px 0px 0px)' }}
    >
      {/* Chunky B&W static canvas — 100vw/vh, upscaled via CSS */}
      <canvas ref={canvasRef} className="eg-static" aria-hidden="true" />

      {/* Sickly-green tint overlay (overlay blend, ~35%) */}
      <div className="eg-tint" aria-hidden="true" />

      {/* Vignette */}
      <div className="eg-vignette" aria-hidden="true" />

      {/* 3px scanlines */}
      <div className="eg-scanlines" aria-hidden="true" />

      {/* Slow rolling lighter band (~6s) */}
      <div className="eg-roll-band" aria-hidden="true" />

      {/* Terminal fragment flash (30% opacity, ~140 ms) */}
      {termLine && (
        <span
          className="eg-term-frag"
          aria-hidden="true"
          style={{ left: `${termLine.x}%`, top: `${termLine.y}%` }}
        >
          {termLine.text}
        </span>
      )}

      {/* Centre NO SIGNAL label / enter button */}
      <button
        ref={labelRef}
        className={`eg-label${isHover ? ' is-hover' : ''}${isActivated ? ' is-exiting' : ''}`}
        aria-label="Enter: I'm fine."
        aria-disabled={!isReady}
        disabled={!isReady}
        onClick={handleActivate}
        onKeyDown={handleKeyDown}
        onMouseEnter={() => { if (isReady) setIsHover(true); }}
        onMouseLeave={() => setIsHover(false)}
        onFocus={() => { if (isReady) setIsHover(true); }}
        onBlur={() => setIsHover(false)}
        style={{ cursor: isReady ? 'pointer' : 'progress' }}
      >
        {/* Line 1 — "NO SIGNAL" or glitched or "STATUS: FINE" on hover */}
        <span className="eg-l1" aria-live="polite">
          {isHover ? 'STATUS: FINE' : glitchedText}
        </span>

        {/* Line 2 — progress / ready / hover */}
        <span className="eg-l2">
          {isHover
            ? '[ ENTER ]'
            : isReady
              ? <span className="eg-blink">CLICK TO TUNE IN</span>
              : `ACQUIRING ${String(pct).padStart(3, '0')}%`
          }
        </span>

        {/* 2-px progress bar along label bottom */}
        {!isHover && !isReady && (
          <span
            className="eg-prog-bar"
            role="progressbar"
            aria-valuenow={pct}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label={`Loading ${pct}%`}
          >
            <span className="eg-prog-fill" style={{ width: `${pct}%` }} />
          </span>
        )}
      </button>
    </div>
  );
}
