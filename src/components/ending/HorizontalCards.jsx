import React from 'react';
import { PN } from './handMath';

export function DeskLampSvg() {
  return (
    <div className="card-obj-wrap" aria-hidden="true">
      <svg
        viewBox="0 0 160 160"
        width="196"
        height="196"
        fill="none"
        stroke="#241a12"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
        style={{ overflow: 'visible' }}
        filter="url(#rough-ink)"
      >
        {/* Amber downward light rays cone */}
        <polygon points="68,52 18,142 110,142" fill="#e0913c" fillOpacity="0.18" stroke="none" />
        <line x1="42" y1="78" x2="28" y2="136" stroke="#e0913c" strokeWidth="1.6" strokeDasharray="3 4" strokeOpacity="0.85" />
        <line x1="60" y1="78" x2="62" y2="138" stroke="#e0913c" strokeWidth="1.6" strokeDasharray="3 4" strokeOpacity="0.85" />
        <line x1="76" y1="74" x2="94" y2="132" stroke="#e0913c" strokeWidth="1.6" strokeDasharray="3 4" strokeOpacity="0.85" />

        {/* Heavy weighted lamp base */}
        <ellipse cx="120" cy="144" rx="24" ry="6" fill="#f4efe6" />
        <path d="M96 144 C96 148 144 148 144 144" />
        {/* Base shadow hatching */}
        <path d="M104 144 L108 147 M114 144 L118 147 M124 144 L128 147 M134 144 L138 147" strokeWidth="1.2" strokeOpacity="0.45" />

        {/* Articulated arm with joints */}
        <circle cx="120" cy="142" r="3.2" fill="#241a12" />
        <line x1="120" y1="140" x2="104" y2="86" />
        <circle cx="104" cy="86" r="3.8" fill="#f4efe6" />
        <line x1="104" y1="86" x2="72" y2="44" />
        <circle cx="72" cy="44" r="3.2" fill="#241a12" />

        {/* Lamp head shade */}
        <path d="M58 36 L84 52 L66 64 L48 44 Z" fill="#f4efe6" />
        <ellipse cx="75" cy="58" rx="13" ry="6.5" transform="rotate(-30 75 58)" fill="#e0913c" fillOpacity="0.25" />
        {/* Shade hatching on shadow side */}
        <path d="M52 41 L56 46 M56 39 L60 44 M60 37 L64 42" strokeWidth="1.2" strokeOpacity="0.45" />
      </svg>
    </div>
  );
}

export function PhotoFrameSvg() {
  return (
    <div className="card-obj-wrap" aria-hidden="true">
      <svg
        viewBox="0 0 160 160"
        width="196"
        height="196"
        fill="none"
        stroke="#241a12"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
        style={{ overflow: 'visible' }}
        filter="url(#rough-ink)"
      >
        {/* Desk surface line */}
        <line x1="14" y1="142" x2="146" y2="142" stroke="#241a12" strokeWidth="1.8" />
        {/* Cast shadow */}
        <polygon points="42,142 122,142 116,146 48,146" fill="#241a12" fillOpacity="0.12" stroke="none" />

        {/* Wooden easel back strut */}
        <line x1="58" y1="92" x2="44" y2="142" strokeWidth="2.8" />

        {/* Tilted frame (rotated ~4deg) */}
        <g transform="rotate(4 80 85)">
          <rect x="36" y="26" width="86" height="110" rx="2" fill="#f7f2e7" strokeWidth="2.4" />
          <rect x="44" y="34" width="70" height="94" rx="1" fill="#fff" strokeWidth="1.5" />

          {/* Amber setting sun accent shape */}
          <circle cx="78" cy="62" r="13" fill="#e0913c" fillOpacity="0.32" stroke="#e0913c" strokeWidth="1.6" />
          {/* Horizon line */}
          <line x1="44" y1="88" x2="114" y2="88" stroke="#241a12" strokeWidth="1.2" strokeDasharray="2 3" />

          {/* Two small hand-drawn stick figure silhouettes sitting together */}
          <circle cx="72" cy="74" r="3.2" fill="#241a12" stroke="none" />
          <path d="M72 78 L72 88 M72 82 L66 86 M72 88 L68 94" strokeWidth="1.5" />

          <circle cx="82" cy="74.5" r="3.2" fill="#241a12" stroke="none" />
          <path d="M82 78.5 L80 88 M80 82 L86 86 M80 88 L84 94" strokeWidth="1.5" />

          <path d="M72 84 Q76 86 80 84" strokeWidth="1.4" />

          {/* Frame hatching on shaded left edge */}
          <path d="M37 32 L43 32 M37 42 L43 42 M37 52 L43 52 M37 62 L43 62 M37 72 L43 72" strokeWidth="1.2" strokeOpacity="0.4" />
        </g>
      </svg>
    </div>
  );
}

export function HorizontalCards({ hzRef, railRef, cntRef, pgdRef, copyAlert }) {
  return (
    <section className="hz" id="hz" ref={hzRef} aria-label="What to say">
      {/* Ink smudges */}
      <div className="ink-smudge card-smudge-1" aria-hidden="true" />
      <div className="ink-smudge card-smudge-2" aria-hidden="true" />

      {/* Screen reader alert for copied text */}
      <div className="sr-only" aria-live="polite">
        {copyAlert}
      </div>

      <div className="hzs">
        <p className="tag">the reach</p>
        <div className="rail" id="rail" ref={railRef}>
          {PN.map((p, i) => {
            // A) Intro Cards 0 and 4: drawn line-art object beside the text (1.4x enlarged)
            if (p.in) {
              return (
                <article key={i} className="pn card-intro">
                  {i === 0 ? <DeskLampSvg /> : <PhotoFrameSvg />}
                  <div className="tx">
                    <p className="k">{p.k}</p>
                    <h3>{p.t}</h3>
                    {p.d && <p className="d">{p.d}</p>}
                  </div>
                </article>
              );
            }

            // B) Say-it Cards 1, 2, 3: Sticky notes
            if (p.c) {
              const stickyRots = ['-2deg', '+1.5deg', '-1deg'];
              const tapeClasses = ['tape-left', 'tape-right', 'tape-mid'];
              const rot = stickyRots[(i - 1) % stickyRots.length];
              const tapeClass = tapeClasses[(i - 1) % tapeClasses.length];
              return (
                <article
                  key={i}
                  className="pn card-sticky"
                  style={{
                    transform: `rotate(${rot})`,
                    '--card-rot': rot
                  }}
                >
                  <div className={`sticky-tape ${tapeClass}`} aria-hidden="true" />
                  <div className="tx">
                    <p className="k">{p.k}</p>
                    <h3 className="sticky-text">{p.t}</h3>
                    <button
                      className="cb"
                      data-t={p.t.replace(/"/g, '&quot;')}
                      aria-label={`Copy line: ${p.t}`}
                    >
                      Copy this line
                    </button>
                  </div>
                </article>
              );
            }

            // C) Friend Step Cards 5, 6, 7: Torn paper slips
            const tornRots = ['-0.6deg', '+0.7deg', '-0.4deg'];
            const rot = tornRots[(i - 5) % tornRots.length];
            const numStr = p.k.slice(0, 2);
            const labelStr = p.k.slice(4).trim();

            return (
              <article
                key={i}
                className="pn card-torn"
                style={{
                  transform: `rotate(${rot})`,
                  '--card-rot': rot
                }}
              >
                <div className="tx">
                  <p className="torn-kicker">
                    <span className="torn-num">{numStr}</span>
                    <span className="torn-dot">·</span>
                    <span className="torn-label">{labelStr}</span>
                  </p>
                  <h3 className="torn-text">{p.t}</h3>
                </div>
              </article>
            );
          })}
        </div>
        <p className="cnt" id="cnt" ref={cntRef}>01 / 08</p>
        <div className="pg">
          <svg viewBox="0 0 1000 24" preserveAspectRatio="none">
            <path
              d="M0 12 C 120 2 220 22 340 12 S 560 2 680 12 S 900 22 1000 12"
              fill="none"
              stroke="currentColor"
              strokeOpacity=".35"
              strokeWidth="1.5"
              vectorEffect="non-scaling-stroke"
            />
            <circle id="pgd" ref={pgdRef} cx="0" cy="12" r="6" fill="#e0913c" />
          </svg>
        </div>
      </div>

      {/* Hand-drawn wavy divider separating cards from note band */}
      <div className="wavy-divider-wrap cards-divider" aria-hidden="true">
        <svg className="wavy-divider-svg" viewBox="0 0 1200 16" preserveAspectRatio="none">
          <path
            d="M 0 8 Q 75 3, 150 8 T 300 8 T 450 8 T 600 8 T 750 8 T 900 8 T 1050 8 T 1200 8"
            fill="none"
            stroke="#3c2814"
            strokeWidth="1.5"
            strokeOpacity="0.22"
            vectorEffect="non-scaling-stroke"
          />
        </svg>
      </div>
    </section>
  );
}

