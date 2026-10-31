/* ─── Hand Math & Geometry (unchanged from public/index.html) ─── */

export const clamp = function(x, a, b) {
  return Math.min(b === undefined ? 1 : b, Math.max(a === undefined ? 0 : a, x));
};

export const ease = function(t) {
  return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
};

export const NS = 'http://www.w3.org/2000/svg';

export function sc(pts) {
  var n = pts.length, d = 'M' + pts[0][0] + ' ' + pts[0][1];
  for (var i = 0; i < n; i++) {
    var p0 = pts[(i - 1 + n) % n], p1 = pts[i], p2 = pts[(i + 1) % n], p3 = pts[(i + 2) % n];
    d += 'C' + (p1[0] + (p2[0] - p0[0]) / 6).toFixed(1) + ' ' + (p1[1] + (p2[1] - p0[1]) / 6).toFixed(1) + ' ' +
         (p2[0] - (p3[0] - p1[0]) / 6).toFixed(1) + ' ' + (p2[1] - (p3[1] - p1[1]) / 6).toFixed(1) + ' ' +
         p2[0].toFixed(1) + ' ' + p2[1].toFixed(1);
  }
  return d + 'Z';
}

export function fing(bx, by, a0, L, B, w0, w1) {
  var P = [[bx, by]], a = a0, x = bx, y = by, i;
  for (i = 0; i < 3; i++) {
    a += B[i];
    x += Math.sin(a) * L[i];
    y -= Math.cos(a) * L[i];
    P.push([x, y]);
  }
  var S = [], T = [];
  function cr(p0, p1, p2, p3, t) {
    var t2 = t * t, t3 = t2 * t;
    return [
      0.5 * ((2 * p1[0]) + (-p0[0] + p2[0]) * t + (2 * p0[0] - 5 * p1[0] + 4 * p2[0] - p3[0]) * t2 + (-p0[0] + 3 * p1[0] - 3 * p2[0] + p3[0]) * t3),
      0.5 * ((2 * p1[1]) + (-p0[1] + p2[1]) * t + (2 * p0[1] - 5 * p1[1] + 4 * p2[1] - p3[1]) * t2 + (-p0[1] + 3 * p1[1] - 3 * p2[1] + p3[1]) * t3)
    ];
  }
  var E = [[2 * P[0][0] - P[1][0], 2 * P[0][1] - P[1][1]]].concat(P).concat([[2 * P[3][0] - P[2][0], 2 * P[3][1] - P[2][1]]]);
  for (var s = 0; s < 3; s++) {
    for (var k = 0; k < 8; k++) {
      S.push(cr(E[s], E[s + 1], E[s + 2], E[s + 3], k / 8));
    }
  }
  S.push(P[3]);
  var n = S.length, Lf = [], Rt = [], Hl = [], Sh = [];
  for (i = 0; i < n; i++) {
    var pa = S[Math.max(0, i - 1)], pb = S[Math.min(n - 1, i + 1)], tx = pb[0] - pa[0], ty = pb[1] - pa[1], l = Math.hypot(tx, ty) || 1;
    tx /= l;
    ty /= l;
    var t = i / (n - 1), w = (w0 + (w1 - w0) * t) / 2 * (1 + 0.07 * Math.sin(t * 18)), nx = -ty, ny = tx;
    Lf.push([S[i][0] + nx * w, S[i][1] + ny * w]);
    Rt.push([S[i][0] - nx * w, S[i][1] - ny * w]);
    Hl.push([S[i][0] + nx * w * 0.45, S[i][1] + ny * w * 0.45]);
    Sh.push([S[i][0] - nx * w * 0.5, S[i][1] - ny * w * 0.5]);
    if (i === n - 1) T = [tx, ty, w];
  }
  var cap = [];
  for (i = 1; i < 8; i++) {
    var ph = i / 8 * Math.PI, q = S[n - 1];
    cap.push([q[0] + (-T[1] * Math.cos(ph) + T[0] * Math.sin(ph)) * T[2], q[1] + (T[0] * Math.cos(ph) + T[1] * Math.sin(ph)) * T[2]]);
  }
  var poly = Lf.concat(cap).concat(Rt.reverse());
  var ln = function(a) {
    return 'M' + a.map(function(p) { return p[0].toFixed(1) + ' ' + p[1].toFixed(1); }).join('L');
  };
  var nc = S[n - 1], nl = [], nx = -T[1], ny = T[0], rx = T[2] * 0.56, ry = T[2] * 0.9;
  for (i = 0; i < 14; i++) {
    var ph = i / 14 * 6.2832;
    nl.push([nc[0] + nx * rx * Math.cos(ph) + T[0] * (ry * Math.sin(ph) - T[2] * 0.15), nc[1] + ny * rx * Math.cos(ph) + T[1] * (ry * Math.sin(ph) - T[2] * 0.15)]);
  }
  // 6-10 short hatching strokes per finger on the shadow side
  var ht = [];
  for (i = 3; i < n - 3; i += 2) {
    var p0 = Sh[i];
    var dx = (Lf[i][0] - Rt[i][0]) * 0.38;
    var dy = (Lf[i][1] - Rt[i][1]) * 0.38;
    ht.push('M' + p0[0].toFixed(1) + ' ' + p0[1].toFixed(1) + 'L' + (p0[0] + dx).toFixed(1) + ' ' + (p0[1] + dy).toFixed(1));
  }
  return {
    d: ln(poly) + 'Z',
    hl: ln(Hl.slice(2, n - 2)),
    sh: ln(Sh.slice(2, n - 2)),
    nail: ln(nl) + 'Z',
    hatch: ht.join(' '),
    tip: [S[n - 1][0] + T[0] * T[2], S[n - 1][1] + T[1] * T[2]]
  };
}

export function hand(spec) {
  var X = [-33, -10, 14, 36], Y = [-104, -112, -108, -92],
      W0 = spec.W0 || [21, 22, 20, 17], W1 = spec.W1 || [13, 13, 12, 10],
      SP = [-0.11, -0.03, 0.06, 0.16], F = [];
  for (var i = 0; i < 4; i++) {
    F.push(fing(X[i], Y[i], SP[i] + (spec.sp || 0), spec.L[i], spec.B[i], W0[i], W1[i]));
  }
  F.push(fing(-46, -46, spec.ta, spec.TL, spec.TB, 26, 15));
  var palm = sc([[-28, 10], [-48, -14], [-57, -46], [-46, -92], [-34, -110], [-10, -118], [14, -114], [38, -100], [46, -68], [41, -30], [30, 10], [0, 18]]);
  var arm = 'M-30 4C-32 130 -42 300 -52 540L52 540C42 300 32 130 30 4Z';
  var tend = [[-24, -98, -16, -14], [-4, -104, 0, -10], [16, -100, 13, -12]].map(function(a) {
    return 'M' + a[0] + ' ' + a[1] + 'Q' + ((a[0] + a[2]) / 2 + 3) + ' ' + ((a[1] + a[3]) / 2) + ' ' + a[2] + ' ' + a[3];
  }).join('');
  // Hatching strokes across the back of the hand (metacarpal / knuckle region)
  var palmHatch = [
    [-24, -84, -14, -68], [-18, -88, -8, -72], [-12, -90, -2, -74],
    [-6, -92, 4, -76], [0, -90, 10, -74], [6, -86, 16, -70],
    [-20, -64, -10, -50], [-12, -66, -2, -52], [-4, -68, 6, -54]
  ].map(function(a) {
    return 'M' + a[0] + ' ' + a[1] + 'L' + a[2] + ' ' + a[3];
  }).join(' ');
  return { shapes: [arm, palm].concat(F.map(function(f) { return f.d; })), F: F, tip: F[0].tip, tend: tend, palmHatch: palmHatch };
}

export var LIGHT = hand({
  L: [[46, 30, 24], [50, 32, 26], [47, 31, 25], [38, 25, 19]],
  B: [[0.02, 0.08, 0.12], [0.02, 0.1, 0.14], [0.04, 0.12, 0.17], [0.06, 0.16, 0.2]],
  ta: -0.8,
  TL: [34, 28, 24],
  TB: [-0.05, 0.15, 0.2]
});

export var DARK = hand({
  L: [[48, 32, 26], [20, 14, 10], [19, 13, 9], [16, 11, 8]],
  B: [[0, 0.02, 0.03], [0.45, 0.55, 0.55], [0.5, 0.6, 0.55], [0.55, 0.65, 0.55]],
  W0: [21, 24, 22, 19],
  W1: [13, 19, 18, 15],
  ta: -0.45,
  TL: [30, 26, 22],
  TB: [0.3, 0.5, 0.55]
});

export function paint(h, mode) {
  var s = h.shapes;
  if (mode === 'light') {
    // Forearm hatching on shadow side (from wrist y=40 to elbow y=500)
    var armHatch = [
      [28, 40, 16, 60], [30, 80, 18, 100], [32, 120, 20, 140],
      [34, 160, 22, 180], [36, 210, 24, 230], [38, 260, 26, 280],
      [40, 310, 28, 330], [42, 370, 30, 390], [44, 430, 32, 450],
      [46, 490, 34, 510]
    ].map(function(a) {
      return 'M' + a[0] + ' ' + a[1] + 'L' + a[2] + ' ' + a[3];
    }).join(' ');

    return (
      // Same outline weight ~4px on entire hand & forearm
      '<g stroke="#241a12" stroke-width="4" stroke-linejoin="round" fill="#241a12">' +
      s.map(function(d) { return '<path d="' + d + '"/>'; }).join('') +
      '</g>' +
      // Light flesh fill
      '<g fill="url(#gl)">' +
      s.map(function(d) { return '<path d="' + d + '"/>'; }).join('') +
      '</g>' +
      // Faint warm shadow under the palm
      '<ellipse cx="0" cy="-45" rx="36" ry="24" fill="#c98a58" fill-opacity="0.22"/>' +
      // Lit edge outline along lit side of forearm in dark phase (reads lit from hand side)
      '<path d="M-30 4C-32 130 -42 300 -52 540" fill="none" stroke="rgba(246, 241, 231, 0.45)" stroke-width="2" stroke-linecap="round"/>' +
      // Highlight & mid-shadow along finger spine
      '<g fill="none" stroke-linecap="round">' +
      '<g stroke="#fff" stroke-opacity=".75" stroke-width="2.6">' +
      h.F.map(function(f) { return '<path d="' + f.hl + '"/>'; }).join('') +
      '</g>' +
      '<g stroke="#a9805f" stroke-opacity=".35" stroke-width="2.6">' +
      h.F.map(function(f) { return '<path d="' + f.sh + '"/>'; }).join('') +
      '</g>' +
      // 6-10 short hatching strokes per finger on shadow side, back of hand, and forearm
      '<path d="' + h.F.map(function(f) { return f.hatch; }).join(' ') + ' ' + (h.palmHatch || '') + ' ' + armHatch + '" stroke="#241a12" stroke-width="1.3" stroke-opacity="0.35"/>' +
      '</g>' +
      // Nails and subtle tendons
      '<g fill="none" stroke="#241a12" stroke-opacity=".45" stroke-width="1.4" stroke-linecap="round">' +
      h.F.map(function(f) { return '<path d="' + f.nail + '"/>'; }).join('') +
      '<path d="' + h.tend + '" stroke-opacity=".25"/>' +
      '</g>'
    );
  }
  if (mode === 'dark') {
    // 6-10 short sparse hatch marks across the back of the hand and wrist in light colour at 25% opacity
    var darkHatch = [
      [-26, -92, -20, -82], [-20, -95, -14, -85], [-14, -98, -8, -88],
      [-40, -46, -32, -38], [-36, -42, -28, -34], [-24, -40, -16, -32],
      [-20, 20, -10, 32], [-14, 38, -4, 50], [-8, 56, 2, 68]
    ].map(function(a) {
      return 'M' + a[0] + ' ' + a[1] + 'L' + a[2] + ' ' + a[3];
    }).join(' ');

    return (
      // Same outline weight ~4px
      '<g stroke="#0b0a09" stroke-width="4" stroke-linejoin="round" fill="#0b0a09">' +
      s.map(function(d) { return '<path d="' + d + '"/>'; }).join('') +
      '</g>' +
      // Pure solid black fill
      '<g fill="#0b0a09">' +
      s.map(function(d) { return '<path d="' + d + '"/>'; }).join('') +
      '</g>' +
      // Thin cool rim light (rgba(217,209,192,.6), 1.5px) along top edge of index finger, thumb and knuckles
      '<g fill="none" stroke="rgba(217,209,192,0.6)" stroke-width="1.5" stroke-linecap="round">' +
      '<path d="' + h.F[0].hl + ' ' + h.F[4].hl + ' M -35 -112 Q -10 -120 14 -116 M -48 -44 Q -44 -14 -28 10"/>' +
      '</g>' +
      // 6-10 short sparse hatch marks across back of hand and wrist (rgba(217,209,192,.25))
      '<path d="' + darkHatch + '" fill="none" stroke="rgba(217,209,192,0.25)" stroke-width="1.2" stroke-linecap="round"/>' +
      // Cool nails and tendons
      '<g fill="none" stroke="rgba(217,209,192,0.45)" stroke-width="1.4">' +
      [h.F[0], h.F[4]].map(function(f) { return '<path d="' + f.nail + '"/>'; }).join('') +
      '<path d="' + h.tend + '" stroke-opacity=".22"/>' +
      '</g>'
    );
  }
  return (
    '<g fill="#8f897e" stroke="#8f897e" stroke-width="3" stroke-linejoin="round">' +
    s.map(function(d) { return '<path d="' + d + '"/>'; }).join('') +
    '</g><g fill="none" stroke="#fff" stroke-width="6" stroke-linecap="round">' +
    h.F.map(function(f) { return '<path d="' + f.hl + '"/>'; }).join('') +
    '</g>'
  );
}

export var TH_D = Math.PI * 0.29;
export var TH_L = Math.PI * 1.29;
export var SCL = 0.95;

export function rot(th, x, y) {
  return [x * Math.cos(th) - y * Math.sin(th), x * Math.sin(th) + y * Math.cos(th)];
}

export var tD = rot(TH_D, DARK.tip[0] * SCL, DARK.tip[1] * SCL);
export var tL = rot(TH_L, LIGHT.tip[0] * SCL, LIGHT.tip[1] * SCL);
// Hands meet in the comfortable upper-center of the SVG viewport (Y=255 of 600)
// Resolves issue where dark hand sat too low at the bottom edge
export var FD = { x: 508 - tD[0], y: 255 - tD[1] };
export var FL = { x: 526 - tL[0], y: 255 - tL[1] };
export var dirD = [Math.sin(TH_D), -Math.cos(TH_D)];
export var dirL = [Math.sin(TH_L), -Math.cos(TH_L)];
export var fs = 0.72; // Balanced scale for footer
export var fD = rot(TH_D, DARK.tip[0] * fs, DARK.tip[1] * fs);
export var fL = rot(TH_L, LIGHT.tip[0] * fs, LIGHT.tip[1] * fs);

export var RAMP = ' .:-=+*#%@';
export var MSG = 'actually, no. can we talk?';

export var BG = ['#241a12', '#e0913c', '#f2c490', '#2d2218', '#f2c490', '#e0913c', '#241a12', '#f2c490'];
export var ILS = [
  // 0: The Desk Lamp (Intro 1)
  '<path d="M42 46 L76 90 L20 90 Z" fill="#f6f1e7" opacity="0.45"/>' +
  '<ellipse cx="32" cy="78" rx="14" ry="5" fill="#241a12"/>' +
  '<path d="M32 78 L38 52 L56 34" fill="none" stroke="#241a12" stroke-width="4" stroke-linecap="round"/>' +
  '<path d="M50 26 L68 38 L54 50 L42 34 Z" fill="#e0913c" stroke="#241a12" stroke-width="2.5" stroke-linejoin="round"/>' +
  '<circle cx="53" cy="44" r="3" fill="#fff"/>',

  // 1: The Sticky Notes (01 Say it softly)
  '<rect x="22" y="24" width="48" height="48" rx="3" fill="#241a12" opacity="0.25" transform="rotate(7 46 48)"/>' +
  '<rect x="24" y="24" width="48" height="48" rx="3" fill="#f6f1e7" stroke="#241a12" stroke-width="2.5"/>' +
  '<path d="M56 72 L72 56 L56 56 Z" fill="#e2d8c7" stroke="#241a12" stroke-width="2"/>' +
  '<path d="M32 36 h30 M32 44 h24 M32 52 h28" stroke="#241a12" stroke-width="2.5" stroke-linecap="round"/>' +
  '<rect x="40" y="20" width="16" height="7" rx="2" fill="#241a12"/>',

  // 2: Two Warm Mugs (02 Ask for company)
  '<path d="M34 32 C30 24 38 18 34 11" fill="none" stroke="#e0913c" stroke-width="2.5" stroke-linecap="round"/>' +
  '<path d="M60 28 C64 20 56 15 60 8" fill="none" stroke="#e0913c" stroke-width="2.5" stroke-linecap="round"/>' +
  '<path d="M22 52 C12 52 12 68 22 68" fill="none" stroke="#241a12" stroke-width="3.5" stroke-linecap="round"/>' +
  '<rect x="20" y="44" width="28" height="34" rx="6" fill="#241a12"/>' +
  '<path d="M74 48 C84 48 84 66 74 66" fill="none" stroke="#241a12" stroke-width="3.5" stroke-linecap="round"/>' +
  '<rect x="46" y="38" width="30" height="40" rx="6" fill="#f6f1e7" stroke="#241a12" stroke-width="2.5"/>' +
  '<circle cx="61" cy="58" r="3" fill="#e0913c"/>',

  // 3: The Laptop Screen (03 Tell the truth)
  '<rect x="18" y="20" width="64" height="44" rx="4" fill="#241a12" stroke="#f6f1e7" stroke-width="2.5"/>' +
  '<rect x="23" y="25" width="54" height="34" rx="2" fill="#16130f"/>' +
  '<path d="M28 35 h18 M28 43 h32 M28 51 h12" stroke="#f6f1e7" stroke-width="2" stroke-linecap="round"/>' +
  '<rect x="44" y="49" width="4" height="5" fill="#8fe03a"/>' +
  '<path d="M10 66 L90 66 L82 74 L18 74 Z" fill="#f6f1e7" stroke="#241a12" stroke-width="2"/>' +
  '<rect x="42" y="68" width="16" height="4" rx="1" fill="#241a12" opacity="0.3"/>',

  // 4: The Photo Frame (Intro 2)
  '<rect x="26" y="16" width="48" height="64" rx="4" fill="#f6f1e7" stroke="#241a12" stroke-width="3"/>' +
  '<rect x="32" y="22" width="36" height="52" rx="2" fill="#241a12"/>' +
  '<circle cx="50" cy="38" r="8" fill="#e0913c"/>' +
  '<path d="M32 66 Q42 54 52 64 Q60 56 68 70 L32 70 Z" fill="#f6f1e7"/>' +
  '<path d="M50 78 L50 86" stroke="#241a12" stroke-width="3" stroke-linecap="round"/>',

  // 5: The Phone (01 Acknowledge)
  '<rect x="28" y="14" width="44" height="72" rx="9" fill="#241a12" stroke="#f6f1e7" stroke-width="2.5"/>' +
  '<rect x="32" y="20" width="36" height="58" rx="5" fill="#16130f"/>' +
  '<rect x="44" y="16" width="12" height="2" rx="1" fill="#f6f1e7" opacity="0.6"/>' +
  '<rect x="36" y="32" width="28" height="20" rx="5" fill="#f6f1e7"/>' +
  '<path d="M36 46 L31 50 L36 49 Z" fill="#f6f1e7"/>' +
  '<circle cx="43" cy="42" r="2" fill="#241a12"/>' +
  '<circle cx="50" cy="42" r="2" fill="#241a12"/>' +
  '<circle cx="57" cy="42" r="2" fill="#241a12"/>' +
  '<circle cx="50" cy="68" r="3.5" fill="#8fe03a"/>',

  // 6: Open Papers & Notebook (02 Lower the threshold)
  '<path d="M18 28 L50 32 L50 74 L18 70 Z" fill="#f6f1e7" stroke="#241a12" stroke-width="2.5"/>' +
  '<path d="M50 32 L82 28 L82 70 L50 74 Z" fill="#f6f1e7" stroke="#241a12" stroke-width="2.5"/>' +
  '<line x1="50" y1="32" x2="50" y2="74" stroke="#e0913c" stroke-width="2.5"/>' +
  '<path d="M24 40 h18 M24 48 h16 M24 56 h20 M56 40 h20 M56 48 h16 M56 56 h18" stroke="#241a12" stroke-width="1.2" stroke-linecap="round" opacity="0.4"/>' +
  '<path d="M62 76 L82 62 L85 65 L65 79 Z" fill="#e0913c" stroke="#241a12" stroke-width="1.5"/>' +
  '<path d="M62 76 L58 79 L65 79 Z" fill="#f6f1e7" stroke="#241a12" stroke-width="1.5"/>',

  // 7: Folded Note (03 Follow up)
  '<rect x="20" y="28" width="60" height="44" rx="4" fill="#f6f1e7" stroke="#241a12" stroke-width="2.5"/>' +
  '<path d="M20 28 L50 52 L80 28" fill="none" stroke="#241a12" stroke-width="2.5" stroke-linejoin="round"/>' +
  '<path d="M20 72 L42 50 M80 72 L58 50" stroke="#241a12" stroke-width="1.5" opacity="0.35"/>' +
  '<circle cx="50" cy="52" r="9" fill="#e0913c" stroke="#241a12" stroke-width="2"/>' +
  '<path d="M47 51 a2 2 0 0 1 3 0 a2 2 0 0 1 3 0 c0 2.5 -3 4.5 -3 4.5 s-3 -2 -3 -4.5 z" fill="#241a12"/>'
];

export function il(i) {
  var bg = BG[i % BG.length];
  var art = ILS[i % ILS.length];
  return (
    '<svg viewBox="0 0 100 100" role="img" aria-label="" width="100%" height="100%">' +
    '<rect width="100" height="100" fill="' + bg + '"/>' +
    art +
    '<rect width="100" height="100" fill="url(#dots)" opacity="0.55"/>' +
    '</svg>'
  );
}

export var PN = [
  { k: 'If you don’t know what to say', t: 'Start with one honest line.', d: 'Three you can send tonight. Tap one to copy it.', in: 1 },
  { k: '01 · Say it softly', t: 'I haven’t been feeling like myself lately and could really use someone to talk to.', c: 1 },
  { k: '02 · Ask for company', t: 'I’m having a hard time right now. Can we hang out? No pressure to talk about it.', c: 1 },
  { k: '03 · Tell the truth', t: 'Work has been consuming everything and I’m running on empty. Just wanted to be honest.', c: 1 },
  { k: 'For friends', t: 'When someone tells you they’re fine.', d: 'Three small things that open the door.', in: 1 },
  { k: '01 · Acknowledge the reflex', t: '“I know you usually say you’re fine, but you’ve been carrying a lot lately. How are you really doing today?”' },
  { k: '02 · Lower the threshold', t: '“You don’t have to explain anything or be cheerful. We can just sit together or talk about something completely dumb.”' },
  { k: '03 · Follow up three days later', t: 'The second check-in is the one that proves you meant it. A quiet “thinking of you, no need to reply” breaks the silence.' }
];

