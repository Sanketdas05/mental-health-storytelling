import React from 'react';

/**
 * Anatomical Reaching Dark Hand (Adam / Searching Hand)
 * Lower-Left reaching upward-right towards center.
 * Fingertip is at normalized (0.90, 0.1625) in 500x400 viewBox.
 */
export function DarkHandArt({ className = '', style = {}, ariaHidden = true }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 500 400"
      className={className}
      style={style}
      aria-hidden={ariaHidden}
      preserveAspectRatio="xMidYMid meet"
    >
      <defs>
        <linearGradient id="dhSkinGrad" x1="0%" y1="100%" x2="85%" y2="15%">
          <stop offset="0%" stopColor="#120c08" />
          <stop offset="40%" stopColor="#1a120c" />
          <stop offset="75%" stopColor="#261a12" />
          <stop offset="100%" stopColor="#36251a" />
        </linearGradient>
        <linearGradient id="dhHatchGrad" x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#e0913c" stopOpacity="0.15" />
          <stop offset="60%" stopColor="#e0913c" stopOpacity="0.6" />
          <stop offset="100%" stopColor="#f8be72" stopOpacity="0.9" />
        </linearGradient>
        <filter id="dhDropShadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="6" stdDeviation="10" floodColor="#000000" floodOpacity="0.55" />
        </filter>
      </defs>

      <g filter="url(#dhDropShadow)">
        {/* Forearm and Wrist */}
        <path
          d="M -20,390
             C 30,345 80,300 130,260
             C 142,252 156,246 170,240
             C 182,244 195,242 205,235
             C 218,238 230,234 240,225
             C 252,226 264,220 274,212
             C 292,206 325,182 365,148
             C 395,122 426,90 446,65
             C 453,57 452,51 444,50
             C 436,50 424,59 404,78
             C 375,106 342,133 322,148
             C 306,142 292,142 278,150
             C 266,136 250,130 236,135
             C 222,140 212,152 206,166
             C 188,170 170,182 156,198
             C 136,220 110,235 80,245
             C 48,255 10,265 -20,268
             Z"
          fill="url(#dhSkinGrad)"
          stroke="#0d0906"
          strokeWidth="1.8"
          strokeLinejoin="round"
        />

        {/* Curled Pinky */}
        <path
          d="M 198,238 C 216,250 234,252 245,244 C 254,237 251,227 238,222 C 224,216 206,225 198,238 Z"
          fill="url(#dhSkinGrad)"
          stroke="url(#dhHatchGrad)"
          strokeWidth="1.2"
        />

        {/* Curled Ring Finger */}
        <path
          d="M 230,228 C 252,238 273,239 286,230 C 294,223 290,212 274,207 C 256,202 239,212 230,228 Z"
          fill="url(#dhSkinGrad)"
          stroke="url(#dhHatchGrad)"
          strokeWidth="1.2"
        />

        {/* Gently Curved Middle Finger */}
        <path
          d="M 270,210 C 297,219 328,216 351,202 C 362,194 358,183 340,178 C 313,172 284,183 270,210 Z"
          fill="url(#dhSkinGrad)"
          stroke="url(#dhHatchGrad)"
          strokeWidth="1.2"
        />

        {/* Thumb (Forward and Relaxed) */}
        <path
          d="M 156,198 C 175,175 198,158 225,152 C 240,148 247,158 238,169 C 225,184 204,203 184,216 C 171,225 161,214 156,198 Z"
          fill="url(#dhSkinGrad)"
          stroke="url(#dhHatchGrad)"
          strokeWidth="1.2"
        />

        {/* Outstretched Index Finger (The Reach — fingertip at 450, 65) */}
        <path
          d="M 286,174
             C 314,149 352,118 394,85
             C 419,66 440,50 448,53
             C 454,56 452,65 441,77
             C 414,106 374,138 337,168
             C 318,182 300,188 286,174 Z"
          fill="url(#dhSkinGrad)"
          stroke="url(#dhHatchGrad)"
          strokeWidth="1.4"
          strokeLinejoin="round"
        />

        {/* Engraving Cross-Hatching on Wrist & Tendons */}
        <path d="M 50,260 C 105,238 160,212 214,184" fill="none" stroke="url(#dhHatchGrad)" strokeWidth="1.2" strokeDasharray="4,4" />
        <path d="M 75,275 C 125,254 178,230 230,204" fill="none" stroke="url(#dhHatchGrad)" strokeWidth="1" strokeDasharray="3,4" />
        <path d="M 100,290 C 145,270 192,250 238,234" fill="none" stroke="url(#dhHatchGrad)" strokeWidth="0.8" strokeDasharray="2,4" />

        {/* Knuckle and Joint Creases */}
        <path d="M 280,180 C 287,174 295,169 301,171" fill="none" stroke="url(#dhHatchGrad)" strokeWidth="1.3" />
        <path d="M 338,136 C 345,130 353,126 359,128" fill="none" stroke="url(#dhHatchGrad)" strokeWidth="1.3" />
        <path d="M 395,94 C 402,88 410,84 415,87" fill="none" stroke="url(#dhHatchGrad)" strokeWidth="1.3" />

        {/* Fingertip Warm Spark */}
        <circle cx="450" cy="65" r="3.5" fill="#f8d090" opacity="0.9" />
      </g>
    </svg>
  );
}

/**
 * Anatomical Supportive Light Hand (God / Welcoming Hand)
 * Upper-Right reaching downward-left towards center.
 * Fingertip is at normalized (0.10, 0.8375) in 500x400 viewBox.
 */
export function LightHandArt({ className = '', style = {}, ariaHidden = true }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 500 400"
      className={className}
      style={style}
      aria-hidden={ariaHidden}
      preserveAspectRatio="xMidYMid meet"
    >
      <defs>
        <linearGradient id="lhSkinGrad" x1="100%" y1="0%" x2="15%" y2="85%">
          <stop offset="0%" stopColor="#fffdfa" />
          <stop offset="35%" stopColor="#f8efe4" />
          <stop offset="75%" stopColor="#eddac6" />
          <stop offset="100%" stopColor="#dec6ae" />
        </linearGradient>
        <linearGradient id="lhInkGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#241a12" />
          <stop offset="100%" stopColor="#3d2a1d" />
        </linearGradient>
        <filter id="lhWarmGlow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="4" stdDeviation="12" floodColor="#e0913c" floodOpacity="0.4" />
        </filter>
      </defs>

      <g filter="url(#lhWarmGlow)">
        {/* Forearm and Wrist */}
        <path
          d="M 520,10
             C 470,55 420,100 370,140
             C 358,148 344,154 330,160
             C 318,156 305,158 295,165
             C 282,162 270,166 260,175
             C 248,174 236,180 226,188
             C 208,194 175,218 135,252
             C 105,278 74,310 54,335
             C 47,343 48,349 56,350
             C 64,350 76,341 96,322
             C 125,294 158,267 178,252
             C 194,258 208,258 222,250
             C 234,264 250,270 264,265
             C 278,260 288,248 294,234
             C 312,230 330,218 344,202
             C 364,180 390,165 420,155
             C 452,145 490,135 520,132
             Z"
          fill="url(#lhSkinGrad)"
          stroke="url(#lhInkGrad)"
          strokeWidth="1.8"
          strokeLinejoin="round"
        />

        {/* Curled Pinky */}
        <path
          d="M 302,162 C 284,150 266,148 255,156 C 246,163 249,173 262,178 C 276,184 294,175 302,162 Z"
          fill="url(#lhSkinGrad)"
          stroke="url(#lhInkGrad)"
          strokeWidth="1.2"
        />

        {/* Curled Ring Finger */}
        <path
          d="M 270,172 C 248,162 227,161 214,170 C 206,177 210,188 226,193 C 244,198 261,188 270,172 Z"
          fill="url(#lhSkinGrad)"
          stroke="url(#lhInkGrad)"
          strokeWidth="1.2"
        />

        {/* Gently Curved Middle Finger */}
        <path
          d="M 230,190 C 203,181 172,184 149,198 C 138,206 142,217 160,222 C 187,228 216,217 230,190 Z"
          fill="url(#lhSkinGrad)"
          stroke="url(#lhInkGrad)"
          strokeWidth="1.2"
        />

        {/* Thumb (Tucked & Relaxed) */}
        <path
          d="M 344,202 C 325,225 302,242 275,248 C 260,252 253,242 262,231 C 275,216 296,197 316,184 C 329,175 339,186 344,202 Z"
          fill="url(#lhSkinGrad)"
          stroke="url(#lhInkGrad)"
          strokeWidth="1.2"
        />

        {/* Outstretched Index Finger (Fingertip at 50, 335) */}
        <path
          d="M 214,226
             C 186,251 148,282 106,315
             C 81,334 60,350 52,347
             C 46,344 48,335 59,323
             C 86,294 126,262 163,232
             C 182,218 200,212 214,226 Z"
          fill="url(#lhSkinGrad)"
          stroke="url(#lhInkGrad)"
          strokeWidth="1.4"
          strokeLinejoin="round"
        />

        {/* Delicate Anatomical Hatch Lines */}
        <path d="M 450,140 C 395,162 340,188 286,216" fill="none" stroke="#241a12" strokeOpacity="0.3" strokeWidth="1.2" strokeDasharray="4,4" />
        <path d="M 425,125 C 375,146 322,170 270,196" fill="none" stroke="#241a12" strokeOpacity="0.25" strokeWidth="1" strokeDasharray="3,4" />
        <path d="M 400,110 C 355,130 308,150 262,166" fill="none" stroke="#241a12" strokeOpacity="0.2" strokeWidth="0.8" strokeDasharray="2,4" />

        {/* Knuckle and Joint Creases */}
        <path d="M 220,220 C 213,226 205,231 199,229" fill="none" stroke="#241a12" strokeOpacity="0.55" strokeWidth="1.3" />
        <path d="M 162,264 C 155,270 147,274 141,272" fill="none" stroke="#241a12" strokeOpacity="0.55" strokeWidth="1.3" />
        <path d="M 105,306 C 98,312 90,316 85,313" fill="none" stroke="#241a12" strokeOpacity="0.55" strokeWidth="1.3" />

        {/* Fingertip Warm Bloom Highlight */}
        <circle cx="50" cy="335" r="3.5" fill="#f8d090" opacity="0.9" />
      </g>
    </svg>
  );
}

