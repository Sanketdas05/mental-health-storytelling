import React from 'react';

export function StatementBand({ bandRef }) {
  return (
    <div className="band-wrap">
      <section className="band" id="band" ref={bandRef} aria-label="A note">
        {/* Paper fibres and mottled texture over flat amber */}
        <div className="paper-fibres-overlay" aria-hidden="true" />
        <div className="band-mottle" aria-hidden="true" />
        <div className="band-paper-grain" aria-hidden="true" />

        {/* Ink smudges */}
        <div className="ink-smudge band-smudge-1" aria-hidden="true" />
        <div className="ink-smudge band-smudge-2" aria-hidden="true" />

        {/* ONE large taped paper note centered on the amber */}
        <div className="band-note">
          <div className="band-note-tape" aria-hidden="true" />

          <h2 className="band-stmt stmt-1" style={{ transitionDelay: '0ms' }}>
            Carrying everything alone in the dark isn’t strength.
          </h2>

          <div className="band-stmt stmt-2" style={{ transitionDelay: '150ms' }}>
            <span className="lead-phrase">It’s just </span>
            <span className="amber-phrase">
              <em>exhaustion with good posture.</em>
              <svg className="draw-underline" viewBox="0 0 320 18" fill="none" preserveAspectRatio="none" aria-hidden="true">
                <path
                  d="M 4 12 Q 80 4 160 11 T 316 8"
                  stroke="#241a12"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />
              </svg>
            </span>
          </div>

          <p className="band-stmt stmt-3" style={{ transitionDelay: '300ms' }}>
            The people who care about you don’t need you to be smooth and unshakeable. They just need you here.
          </p>

          <p className="band-stmt band-signoff" style={{ transitionDelay: '450ms' }}>
            <span className="signoff-dash">— </span>a quiet note for anyone working past midnight
          </p>
        </div>

        {/* Hand-drawn wavy divider separating note band from helplines */}
        <div className="wavy-divider-wrap band-divider" aria-hidden="true">
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
    </div>
  );
}

