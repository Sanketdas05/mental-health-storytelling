import React from 'react';

export function TheReachStage({
  trackRef,
  stageRef,
  introRef,
  msgRef,
  aRef,
  typedRef,
  handsRef,
  gwcRef,
  hlRef,
  hdRef,
  fxRef,
  amberRef,
  hlhRef,
  subRef,
  hintRef,
  bloomRef,
  ringRef,
  liveAnnounceText
}) {
  return (
    <main className="track" id="track" ref={trackRef}>
      <section className="stage" id="stage" ref={stageRef} aria-label="The reach">
        {/* Paper fibre texture layer in cream half */}
        <div className="paper-fibres-overlay" aria-hidden="true" />

        {/* Ink smudges on section boundaries */}
        <div className="ink-smudge stage-smudge-1" aria-hidden="true" />
        <div className="ink-smudge stage-smudge-2" aria-hidden="true" />

        {/* Scoped tag: only visible when The Reach stage is active */}
        <p className="tag">the reach</p>

        {/* Accessible screen reader announcement for typed text */}
        <div className="sr-only" aria-live="polite" aria-atomic="true">
          {liveAnnounceText}
        </div>

        <div className="bloom" id="bloom" ref={bloomRef}></div>
        <div className="ring" id="ring" ref={ringRef} aria-hidden="true">
          <svg viewBox="0 0 200 200">
            <circle cx="100" cy="100" r="96" fill="none" stroke="#e0913c" strokeWidth="1.4" strokeDasharray="1 7" strokeLinecap="round" />
            <circle cx="100" cy="100" r="78" fill="none" stroke="#e0913c" strokeWidth="1" strokeDasharray="1 5" strokeLinecap="round" />
          </svg>
        </div>
        <p className="l intro" id="intro" ref={introRef}>Then, one small thing.</p>
        <div className="l msg" id="msg" ref={msgRef}>
          <p className="a" id="a" ref={aRef}>I’m fine :)</p>
          <p className="b">
            <span id="typed" ref={typedRef}></span>
            <i className="cur"></i>
          </p>
        </div>
        <svg id="hands" ref={handsRef} viewBox="0 0 1000 600" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
          <circle id="gwc" ref={gwcRef} cx="550" cy="330" r="0" fill="url(#gw)" style={{ opacity: 0 }} />
          <g filter="url(#ink)">
            <g id="hl" ref={hlRef}></g>
            <g id="hd" ref={hdRef}></g>
          </g>
        </svg>
        <canvas id="fx" ref={fxRef} aria-hidden="true"></canvas>

        {/* Drifting amber ASCII glyphs canvas (25-40 small glyphs drifting around headline) */}
        <canvas id="amber-glyphs" ref={amberRef} className="amber-glyphs-canvas" aria-hidden="true"></canvas>

        <div className="cap">
          <p className="lab">Connection made · warmth restored</p>
          <h2 className="hl" id="hlh" ref={hlhRef} style={{ opacity: 0 }}>It’s okay to <em>ask for help.</em></h2>
          <p className="sub" id="sub" ref={subRef} style={{ opacity: 0 }}>“You don’t have to carry this alone.”</p>
        </div>
        <p className="hint" id="hint" ref={hintRef}>scroll</p>

        {/* Hand-drawn wavy divider separating stage from cards */}
        <div className="wavy-divider-wrap stage-divider" aria-hidden="true">
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
    </main>
  );
}

