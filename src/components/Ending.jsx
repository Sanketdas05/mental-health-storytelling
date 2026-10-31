import React, { useEffect, useRef, useState } from 'react';
import '../styles/ending.css';
import { audioManager, A } from '../utils/audio';

import {
  clamp,
  ease,
  NS,
  LIGHT,
  DARK,
  paint,
  TH_D,
  TH_L,
  SCL,
  tD,
  tL,
  FD,
  FL,
  dirD,
  dirL,
  fs,
  fD,
  fL,
  RAMP,
  MSG,
  PN
} from './ending/handMath';

import { EndingDefs } from './ending/EndingDefs';
import { TheReachStage } from './ending/TheReachStage';
import { HorizontalCards } from './ending/HorizontalCards';
import { StatementBand } from './ending/StatementBand';
import { HelplinesSection } from './ending/HelplinesSection';
import { EndingFooter } from './ending/EndingFooter';

export function Ending() {
  const trackRef = useRef(null);
  const stageRef = useRef(null);
  const introRef = useRef(null);
  const msgRef = useRef(null);
  const aRef = useRef(null);
  const typedRef = useRef(null);
  const handsRef = useRef(null);
  const gwcRef = useRef(null);
  const hlRef = useRef(null);
  const hdRef = useRef(null);
  const fxRef = useRef(null);
  const amberRef = useRef(null);
  const hlhRef = useRef(null);
  const subRef = useRef(null);
  const hintRef = useRef(null);
  const bloomRef = useRef(null);
  const hzRef = useRef(null);
  const railRef = useRef(null);
  const pgdRef = useRef(null);
  const cntRef = useRef(null);
  const bandRef = useRef(null);
  const hpRef = useRef(null);
  const ftrRef = useRef(null);
  const fhRef = useRef(null);
  const topRef = useRef(null);

  const [liveAnnounce, setLiveAnnounce] = useState('');
  const [copyAlert, setCopyAlert] = useState('');

  useEffect(() => {
    // 1. Initial Hand Renderings
    if (hdRef.current) hdRef.current.innerHTML = paint(DARK, 'dark');
    if (hlRef.current) hlRef.current.innerHTML = paint(LIGHT, 'light');
    if (fhRef.current) {
      fhRef.current.innerHTML =
        '<g transform="translate(' + (488 - fD[0]) + ' ' + (240 - fD[1]) + ') rotate(' + (TH_D * 180 / Math.PI) + ') scale(' + fs + ')">' +
        paint(DARK, 'dark') +
        '</g><g mask="url(#footer-light-arm-mask)" transform="translate(' + (512 - fL[0]) + ' ' + (214 - fL[1]) + ') rotate(' + (TH_L * 180 / Math.PI) + ') scale(' + fs + ')">' +
        paint(LIGHT, 'light') +
        '</g>';
    }

    // --- Web Audio Synthesizer for Ending Section ---
    var lastHbTime = 0;
    var hopefulAudioActive = false;
    var reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    function playEndingHeartbeat(vol) {
      if (reducedMotion) return;
      if (!A.ctx || !A.on || audioManager.isMuted) return;
      var c = A.ctx;
      var now = c.currentTime;
      var osc = c.createOscillator();
      var gain = c.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(60, now);
      osc.frequency.exponentialRampToValueAtTime(36, now + 0.16);
      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(vol * 0.35, now + 0.015);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.24);
      osc.connect(gain);
      gain.connect(A.master || c.destination);
      osc.start(now);
      osc.stop(now + 0.26);
    }

    function playWarmChord() {
      if (!A.ctx || !A.on || audioManager.isMuted) return;
      var c = A.ctx;
      var now = c.currentTime;
      // 4-note warm C-major voicing: C3 (130.81), G3 (196.00), C4 (261.63), E4 (329.63)
      [130.81, 196.00, 261.63, 329.63].forEach(function(freq, idx) {
        var osc = c.createOscillator();
        var gain = c.createGain();
        osc.type = idx % 2 === 0 ? 'sine' : 'triangle';
        osc.frequency.setValueAtTime(freq, now);
        gain.gain.setValueAtTime(0, now);
        gain.gain.linearRampToValueAtTime(0.065, now + 0.8 + idx * 0.15); // slow attack
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 4.2); // ~4s decay
        osc.connect(gain);
        gain.connect(A.master || c.destination);
        osc.start(now);
        osc.stop(now + 4.5);
      });
    }

    // 2. ASCII Pipeline for the Dark Hand
    var CS = 10, asc = [], ascE = 0, ascOK = false;
    var fx = fxRef.current, fctx = fx ? fx.getContext('2d') : null;
    var FW = 1, FH = 1, S1 = 1, OX = 0, OY = 0;

    // Drifting Amber ASCII Glyphs Setup (25-40 small glyphs, 20-45% opacity)
    var amberCanvas = amberRef.current;
    var amberCtx = amberCanvas ? amberCanvas.getContext('2d') : null;
    var amberGlyphs = [];
    var amberChars = ['.', ':', '-', '=', '+', '*'];
    for (var gi = 0; gi < 34; gi++) {
      amberGlyphs.push({
        x: Math.random(),
        y: Math.random(),
        char: amberChars[Math.floor(Math.random() * amberChars.length)],
        size: Math.floor(Math.random() * 5 + 12), // 12-16px
        vy: -(Math.random() * 0.0003 + 0.0002), // upward drift
        vx: (Math.random() - 0.5) * 0.00008,
        opacity: Math.random() * 0.25 + 0.20 // 20-45% opacity
      });
    }

    function geom() {
      if (!handsRef.current || !fx) return;
      var r = handsRef.current.getBoundingClientRect();
      var dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      FW = r.width > 0 ? r.width : (window.innerWidth || 1000);
      FH = r.height > 0 ? r.height : (window.innerHeight || 600);
      S1 = Math.min(FW / 1000, FH / 600);
      OX = (FW - 1000 * S1) / 2;
      OY = (FH - 600 * S1) / 2;
      fx.width = Math.round(FW * dpr);
      fx.height = Math.round(FH * dpr);
      if (fctx) fctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      if (amberCanvas) {
        amberCanvas.width = Math.round(FW * dpr);
        amberCanvas.height = Math.round(FH * dpr);
        if (amberCtx) amberCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
      }
    }

    function buildAscii() {
      geom();
      var EXT = Math.round(2 * (540 * SCL + 30)),
          px = Math.round(EXT * S1),
          cols = Math.max(40, Math.round(px / CS));
      var svg = '<svg xmlns="' + NS + '" width="' + cols + '" height="' + cols + '" viewBox="' + (-EXT / 2) + ' ' + (-EXT / 2) + ' ' + EXT + ' ' + EXT + '">' +
                '<g transform="rotate(' + (TH_D * 180 / Math.PI) + ') scale(' + SCL + ')">' +
                paint(DARK, 'ascii') +
                '</g></svg>';
      var im = new Image();
      im.onload = function() {
        var c = document.createElement('canvas');
        c.width = c.height = cols;
        var x = c.getContext('2d');
        x.drawImage(im, 0, 0, cols, cols);
        var d = x.getImageData(0, 0, cols, cols).data;
        ascE = cols * CS;
        asc = [];
        var numVariants = (reducedMotion || window.innerWidth <= 480) ? 1 : 2;
        for (var v = 0; v < numVariants; v++) {
          var a = document.createElement('canvas');
          a.width = a.height = ascE;
          var g = a.getContext('2d');
          g.font = (CS + 1) + 'px "IBM Plex Mono",monospace';
          g.textBaseline = 'top';
          for (var y = 0; y < cols; y++) {
            for (var xx = 0; xx < cols; xx++) {
              var i = (y * cols + xx) * 4, al = d[i + 3] / 255;
              if (al < 0.3) continue;
              var l = (d[i] * 0.3 + d[i + 1] * 0.59 + d[i + 2] * 0.11) / 255,
                  t = clamp(l * 1.1 + (Math.random() - 0.5) * 0.25);
              g.fillStyle = 'rgba(226,218,200,' + (0.3 + 0.7 * t).toFixed(2) + ')';
              g.fillText(RAMP[Math.min(9, (t * 10) | 0)], xx * CS, y * CS);
            }
          }
          asc.push(a);
        }
        ascOK = true;
      };
      im.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
    }

    var rz;
    const onResize = function() {
      clearTimeout(rz);
      rz = setTimeout(() => {
        geom();
        buildAscii();
      }, 150);
    };
    window.addEventListener('resize', onResize);
    window.addEventListener('orientationchange', onResize);

    // 3. Scroll Timeline State & Dust Particles
    var P = 0, T = 0, warm = false, aA = 1, tm0 = 0;
    var stageStartTime = null;
    var timedHeartbeatPlayed = false;
    var typedAnnounced = false;
    var stageIsActive = false;

    function seg(a, b) {
      return clamp((P - a) / (b - a));
    }

    function read() {
      var tr = trackRef.current;
      if (!tr) return;
      var r = tr.getBoundingClientRect();
      var max = tr.offsetHeight - window.innerHeight;
      if (max > 0) {
        T = clamp(-r.top / max);
      }
      stageIsActive = (r.top <= window.innerHeight && r.bottom >= 0);
    }
    window.addEventListener('scroll', read, { passive: true });
    read();
    P = T;

    var dust = [];
    for (var i = 0; i < 46; i++) {
      dust.push({
        x: Math.random(),
        y: Math.random(),
        r: Math.random() * 1.6 + 0.5,
        vx: (Math.random() - 0.5) * 0.00005,
        vy: -Math.random() * 0.00007 - 0.00002,
        a: Math.random() * 0.5 + 0.15
      });
    }

    // 4. Horizontal Card Section Frame
    var pz = 0, tz = 0;
    function hzFrame() {
      var hz = hzRef.current, rail = railRef.current, pgd = pgdRef.current, cnt = cntRef.current;
      if (!hz || !rail || !pgd || !cnt) return;
      var r = hz.getBoundingClientRect(), max = hz.offsetHeight - window.innerHeight;
      tz = clamp(-r.top / max);
      pz += (tz - pz) * 0.1;
      if (Math.abs(tz - pz) < 0.0004) pz = tz;
      var m = rail.scrollWidth - window.innerWidth;
      rail.style.transform = 'translate3d(' + (-m * pz).toFixed(1) + 'px,0,0)';
      pgd.setAttribute('cx', (pz * 1000).toFixed(1));
      pgd.setAttribute('cy', 12);
      var n = Math.min(PN.length, Math.max(1, Math.round(pz * (PN.length - 1)) + 1));
      cnt.textContent = ('0' + n).slice(-2) + ' / 0' + PN.length;
    }

    // 5. Main requestAnimationFrame Loop
    var rafId;
    var isRunning = true;
    var endingInView = false;

    function frame(t) {
      if (!isRunning) return;

      var tr = trackRef.current;
      var r = tr ? tr.getBoundingClientRect() : null;
      if (tr && r) {
        var max = tr.offsetHeight - window.innerHeight;
        if (max > 0) {
          T = clamp(-r.top / max);
        }
        stageIsActive = (r.top <= window.innerHeight && r.bottom >= 0);
      }

      // If the stage is far offscreen and not active, idle
      if (!stageIsActive && !endingInView && r && (r.top > window.innerHeight * 2 || r.bottom < -window.innerHeight * 2)) {
        hzFrame();
        rafId = requestAnimationFrame(frame);
        return;
      }

      P += (T - P) * 0.14;
      if (Math.abs(T - P) < 0.0004) P = T;

      // Heartbeat sound effects
      if (P >= 0.02 && P < 0.20 && !timedHeartbeatPlayed) {
        timedHeartbeatPlayed = true;
        playEndingHeartbeat(0.85);
      }

      // 1. "Then, one small thing." timing (P: 0.00 -> 0.13)
      var introOp = clamp(P / 0.03) * (1 - clamp((P - 0.09) / 0.04));
      if (introRef.current) introRef.current.style.opacity = introOp.toFixed(3);

      if (hintRef.current) {
        hintRef.current.style.opacity = (P < 0.05) ? '0.7' : (1 - clamp((P - 0.05) / 0.10)).toFixed(2);
      }

      // 2. Stage 2: Strikethrough lime & typewriter "actually, no. can we talk?" (P: 0.11 -> 0.46)
      var msgVis = clamp((P - 0.11) / 0.04) * (1 - clamp((P - 0.40) / 0.06));
      if (msgRef.current) msgRef.current.style.opacity = msgVis.toFixed(3);

      if (aRef.current) {
        var strikeVal = (clamp((P - 0.13) / 0.06) * 100).toFixed(1);
        aRef.current.style.setProperty('--strike', strikeVal + '%');
        aRef.current.style.opacity = (1 - 0.6 * clamp((P - 0.13) / 0.06)).toFixed(2);
      }

      if (typedRef.current) {
        var typeProg = clamp((P - 0.17) / 0.18);
        var charCount = Math.round(MSG.length * typeProg);
        typedRef.current.textContent = MSG.slice(0, charCount);

        // Announce to screen readers when typing completes
        if (charCount >= MSG.length && !typedAnnounced) {
          typedAnnounced = true;
          setLiveAnnounce(MSG);
        }
      }

      // 3. Hands enter and approach (P: 0.30 -> 0.66)
      var handsOp = clamp((P - 0.30) / 0.08);
      var vis = handsOp;
      if (handsRef.current) handsRef.current.style.opacity = handsOp.toFixed(3);

      // Approach easing: 0.34 to 0.66. Touch occurs at P >= 0.66!
      var e = ease(clamp((P - 0.34) / 0.32));
      var k = (1 - e) * 640;
      var sw = reducedMotion ? 0 : Math.sin(t / 1100) * 5 * (1 - e);

      // Touch trigger at P >= 0.66
      var w = P >= 0.66;
      if (w !== warm) {
        warm = w;
        if (w) {
          tm0 = t;
          playWarmChord();
          document.documentElement.classList.add('warm');
        } else {
          document.documentElement.classList.remove('warm');
          if (hopefulAudioActive) {
            hopefulAudioActive = false;
            audioManager.stopCalmHopefulPad();
            audioManager.restoreAnxiousDrone();
          }
        }
      }

      var touchElapsed = warm ? (t - tm0) / 1000 : 0;

      // Responsive B6 Layout: Check portrait vs landscape
      var isPortrait = window.innerWidth / window.innerHeight < 1.0 || window.innerWidth <= 768;
      var narrowShift = isPortrait ? 72 : 0; // Hands meet at ~62% on portrait
      var postEase = warm ? ease(clamp(touchElapsed / 1.0)) : 0;
      var dropY = (36 * postEase) + narrowShift;
      var baseScale = isPortrait ? SCL * 0.82 : SCL; // 80-85% scale on portrait
      var currentScale = baseScale * (1 - 0.08 * postEase);

      var dx = FD.x - dirD[0] * k + sw,
          dy = FD.y - dirD[1] * k + dropY,
          lx = FL.x - dirL[0] * k - sw,
          ly = FL.y - dirL[1] * k + dropY;

      if (hdRef.current) {
        hdRef.current.setAttribute('transform', 'translate(' + dx.toFixed(1) + ' ' + dy.toFixed(1) + ') rotate(' + (TH_D * 180 / Math.PI) + ') scale(' + currentScale.toFixed(3) + ')');
        hdRef.current.style.opacity = warm ? '1' : '0';
      }
      if (hlRef.current) {
        hlRef.current.setAttribute('transform', 'translate(' + lx.toFixed(1) + ' ' + ly.toFixed(1) + ') rotate(' + (TH_L * 180 / Math.PI) + ') scale(' + currentScale.toFixed(3) + ')');
      }

      // Heartbeat during hand approach stopping at touch
      if (P >= 0.38 && P < 0.66 && !reducedMotion) {
        var remaining = 1 - e;
        if (t - lastHbTime > 900) {
          lastHbTime = t;
          playEndingHeartbeat(remaining);
        }
      }

      // Touch bloom animation (expanding circle from exact touch point)
      var touchSvgX = (lx + dx) / 2 + (tL[0] + tD[0]) / 2;
      var touchSvgY = (ly + dy) / 2 + (tL[1] + tD[1]) / 2;
      var touchVpX = OX + touchSvgX * S1;
      var touchVpY = OY + touchSvgY * S1;

      if (bloomRef.current) {
        if (!warm) {
          bloomRef.current.style.transform = 'translate(-50%, -50%) scale(0)';
          bloomRef.current.style.opacity = '0';
        } else {
          bloomRef.current.style.left = touchVpX.toFixed(1) + 'px';
          bloomRef.current.style.top = touchVpY.toFixed(1) + 'px';
          var bloomProgress = clamp((P - 0.66) / 0.12);
          bloomRef.current.style.transform = 'translate(-50%, -50%) scale(' + bloomProgress.toFixed(3) + ')';
          var bOp = bloomProgress < 0.8 ? 1 : clamp(1 - (bloomProgress - 0.8) / 0.2);
          bloomRef.current.style.opacity = bOp.toFixed(3);
        }
      }

      // 1. HEADLINE TIMING: Strictly hidden (opacity: 0) before touch!
      if (!warm) {
        if (hlhRef.current) hlhRef.current.style.opacity = '0';
        if (subRef.current) subRef.current.style.opacity = '0';
      } else {
        var hlhOp = clamp((P - 0.68) / 0.12);
        var subOp = clamp((P - 0.72) / 0.12);
        if (hlhRef.current) hlhRef.current.style.opacity = hlhOp.toFixed(3);
        if (subRef.current) subRef.current.style.opacity = subOp.toFixed(3);
        if (hlhOp > 0.35 && !hopefulAudioActive) {
          hopefulAudioActive = true;
          audioManager.silenceAnxiousDrone();
          audioManager.startCalmHopefulPad();
        }
      }

      // 3. STRAY GLOW: Opacity 0 until fingertip distance gets small (e >= 0.65)
      if (gwcRef.current) {
        gwcRef.current.setAttribute('cx', touchSvgX.toFixed(1));
        gwcRef.current.setAttribute('cy', touchSvgY.toFixed(1));
        if (e < 0.65 || vis < 0.05) {
          gwcRef.current.style.opacity = '0';
          gwcRef.current.setAttribute('r', '0');
        } else {
          var prox = clamp((e - 0.65) / 0.35);
          var pulse = warm ? clamp(1 - (t - tm0) / 1400) : 0;
          var rVal = (prox * 38 + pulse * 110).toFixed(1);
          var opVal = ((prox * 0.75 + pulse * 0.25) * (warm ? clamp(1 - (t - tm0) / 2000) : 1)).toFixed(2);
          gwcRef.current.setAttribute('r', rVal);
          gwcRef.current.style.opacity = opVal;
        }
      }

      /* fx layer: ascii hand + dust */
      if (fctx) {
        fctx.clearRect(0, 0, FW, FH);
        aA += ((warm ? 0 : 1) - aA) * 0.06;
        var warmC = warm ? '224,145,60' : '233,226,211';
        if (!reducedMotion) {
          for (var di = 0; di < dust.length; di++) {
            var d = dust[di];
            d.x += d.vx * 16;
            d.y += d.vy * 16;
            if (d.y < -0.02) {
              d.y = 1.02;
              d.x = Math.random();
            }
            fctx.fillStyle = 'rgba(' + warmC + ',' + (d.a * (0.5 + 0.5 * Math.sin(t / 900 + di))).toFixed(2) + ')';
            fctx.beginPath();
            fctx.arc(d.x * FW, d.y * FH, d.r, 0, 6.3);
            fctx.fill();
          }
        }
        var ascAlpha = warm ? clamp(1 - touchElapsed / 1.4) : 1;
        if (ascOK && vis > 0.02 && ascAlpha > 0.02 && asc.length > 0) {
          fctx.globalAlpha = ascAlpha * vis;
          var ox = OX + (dx) * S1 - ascE / 2, oy = OY + (dy) * S1 - ascE / 2;
          var variantIdx = reducedMotion ? 0 : (((t / 260) | 0) % asc.length);
          fctx.drawImage(asc[variantIdx], ox, oy);
          fctx.globalAlpha = 1;
        }
      }

      // ── A1: DRIFTING AMBER ASCII GLYPHS AROUND HEADLINE ──
      // 25-40 small glyphs drifting upward at 20-45% opacity in warm phase
      if (amberCtx && amberCanvas) {
        amberCtx.clearRect(0, 0, FW, FH);
        if (warm && stageIsActive && !reducedMotion) {
          var glyphWarmFade = clamp(touchElapsed / 1.5);
          amberCtx.font = '500 14px "IBM Plex Mono", monospace';
          amberCtx.textAlign = 'center';
          for (var gi = 0; gi < amberGlyphs.length; gi++) {
            var g = amberGlyphs[gi];
            g.y += g.vy * 16;
            g.x += g.vx * 16;
            if (g.y < -0.05) {
              g.y = 1.05;
              g.x = Math.random();
            }
            var alphaVal = (g.opacity * glyphWarmFade).toFixed(3);
            amberCtx.fillStyle = 'rgba(224, 145, 60, ' + alphaVal + ')';
            amberCtx.fillText(g.char, g.x * FW, g.y * FH);
          }
        }
      }

      hzFrame();
      rafId = requestAnimationFrame(frame);
    }

    // 6. Copy Buttons Click Listeners with Accessibility Alert
    var buttons = document.querySelectorAll('.cb');
    var copyHandlers = [];
    buttons.forEach(function(b) {
      var handler = function() {
        var txt = b.getAttribute('data-t');
        function ok() {
          b.textContent = 'Copied';
          setCopyAlert('Copied to clipboard: ' + txt);
          setTimeout(function() {
            b.textContent = 'Copy this line';
            setCopyAlert('');
          }, 1800);
        }
        function fb() {
          var a = document.createElement('textarea');
          a.value = txt;
          a.style.position = 'fixed';
          a.style.opacity = '0';
          document.body.appendChild(a);
          a.select();
          try { document.execCommand('copy'); ok(); } catch(e) {}
          document.body.removeChild(a);
        }
        try {
          navigator.clipboard.writeText(txt).then(ok, fb);
        } catch(e) {
          fb();
        }
      };
      b.addEventListener('click', handler);
      copyHandlers.push({ b: b, handler: handler });
    });

    // 7. Reveal Observer for Statement Band and Helplines
    var io = new IntersectionObserver(function(en) {
      en.forEach(function(x) {
        if (x.isIntersecting) {
          x.target.classList.add('on');
          io.unobserve(x.target);
        }
      });
    }, { threshold: 0.35 });

    var revealEls = document.querySelectorAll('.band-stmt, .row');
    revealEls.forEach(function(el, idx) {
      if (!el.style.transitionDelay) {
        el.style.transitionDelay = ((idx % 4) * 90) + 'ms';
      }
      io.observe(el);
    });

    // 8. Visibility Change Handler (Pause rAF and Audio when tab is hidden)
    function handleVisibility() {
      if (document.hidden) {
        isRunning = false;
        cancelAnimationFrame(rafId);
      } else {
        if (!isRunning) {
          isRunning = true;
          rafId = requestAnimationFrame(frame);
        }
      }
    }
    document.addEventListener('visibilitychange', handleVisibility);

    // 9. Back to Top Smooth Scroll
    var topLink = topRef.current;
    var handleTopClick = function(e) {
      e.preventDefault();
      if (window.__lenis) {
        window.__lenis.scrollTo(0, { duration: 1.8 });
      } else {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    };
    if (topLink) topLink.addEventListener('click', handleTopClick);

    // IntersectionObserver to only run Ending rAF loop when the ending section is near/in the viewport
    var endingRoot = document.querySelector('.ending-section-root');
    var endingObserver = new IntersectionObserver(function(entries) {
      if (entries[0]) {
        endingInView = entries[0].isIntersecting;
        if (endingInView && isRunning) {
          read();
        }
      }
    }, { rootMargin: '300px 0px' });
    if (endingRoot) endingObserver.observe(endingRoot);

    // Initial Trigger
    geom();
    buildAscii();
    rafId = requestAnimationFrame(frame);

    // Cleanup on unmount
    return () => {
      isRunning = false;
      cancelAnimationFrame(rafId);
      clearTimeout(rz);
      window.removeEventListener('scroll', read);
      window.removeEventListener('resize', onResize);
      document.removeEventListener('visibilitychange', handleVisibility);
      if (endingObserver) endingObserver.disconnect();
      copyHandlers.forEach(function(item) {
        item.b.removeEventListener('click', item.handler);
      });
      io.disconnect();
      if (topLink) topLink.removeEventListener('click', handleTopClick);
      document.documentElement.classList.remove('warm');
      delete window.__setReachProgress;
      if (hopefulAudioActive) {
        audioManager.stopCalmHopefulPad();
        audioManager.restoreAnxiousDrone();
      }
    };
  }, []);

  return (
    <div className="ending-section-root">
      {/* SVG Definitions */}
      <EndingDefs />

      {/* Stage 1: The Reach (Track & Stage) */}
      <TheReachStage
        trackRef={trackRef}
        stageRef={stageRef}
        introRef={introRef}
        msgRef={msgRef}
        aRef={aRef}
        typedRef={typedRef}
        handsRef={handsRef}
        gwcRef={gwcRef}
        hlRef={hlRef}
        hdRef={hdRef}
        fxRef={fxRef}
        amberRef={amberRef}
        hlhRef={hlhRef}
        subRef={subRef}
        hintRef={hintRef}
        bloomRef={bloomRef}
        liveAnnounceText={liveAnnounce}
      />

      {/* Stage 2: Horizontal Cards */}
      <HorizontalCards
        hzRef={hzRef}
        railRef={railRef}
        cntRef={cntRef}
        pgdRef={pgdRef}
        copyAlert={copyAlert}
      />

      {/* Stage 3: Statement Band (No logo, evenly spaced editorial statements) */}
      <StatementBand
        bandRef={bandRef}
      />

      {/* Stage 4: Helplines */}
      <HelplinesSection
        hpRef={hpRef}
      />

      {/* Stage 5: Footer */}
      <EndingFooter
        ftrRef={ftrRef}
        fhRef={fhRef}
        topRef={topRef}
      />
    </div>
  );
}

