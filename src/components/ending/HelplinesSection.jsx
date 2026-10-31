import React from 'react';

export function HelplinesSection({ hpRef }) {
  return (
    <section className="hp" id="hp" ref={hpRef} aria-label="Helplines">
      {/* Paper fibres and ink smudges */}
      <div className="paper-fibres-overlay" aria-hidden="true" />
      <div className="ink-smudge hp-smudge-1" aria-hidden="true" />
      <div className="ink-smudge hp-smudge-2" aria-hidden="true" />

      <div className="w">
        <h2>If now is the moment, call or text.</h2>
        <p className="s">Helplines · available 24/7</p>
        <div className="row">
          <small>United States &amp; Canada</small>
          <a href="tel:988" aria-label="Call 988 Suicide and Crisis Lifeline">988</a>
          <p>Suicide &amp; Crisis Lifeline. Free, 24/7, call or text.</p>
        </div>
        <div className="row">
          <small>United Kingdom</small>
          <div>
            <a href="tel:111" aria-label="Call 111 NHS mental health services">111</a>
            <a className="m" href="sms:85258?body=SHOUT" aria-label="Text SHOUT to 85258">Text SHOUT to 85258</a>
          </div>
          <p>NHS mental health services and a 24/7 crisis text line.</p>
        </div>
        <div className="row">
          <small>India</small>
          <div>
            <a href="tel:14416" aria-label="Call Tele-MANAS 14416">14416</a>
            <a className="m" href="tel:18005990019" aria-label="Call KIRAN 1800-599-0019">1800-599-0019</a>
          </div>
          <p>Tele-MANAS and KIRAN national mental health helplines.</p>
        </div>
        <div className="row">
          <small>Anywhere</small>
          <a className="m" href="https://findahelpline.com" target="_blank" rel="noopener noreferrer" aria-label="Visit findahelpline.com">
            findahelpline.com
          </a>
          <p>Free support services, searchable by country.</p>
        </div>
        <p className="fine">If you are in immediate danger, call your local emergency number.</p>
      </div>

      {/* Hand-drawn wavy divider separating helplines from footer */}
      <div className="wavy-divider-wrap hp-divider" aria-hidden="true">
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


