// The Gilded Vault — guards: fixed patrol routes with pauses, sweeping
// vision cones, and investigation when they hear a noise.

function makeGuards() {
  return [
    {
      name: 'Rook',
      route: [
        { x: 280, y: 290 },
        { x: 1000, y: 290 },
        { x: 1000, y: 390 },
        { x: 280, y: 390 },
      ],
      speed: 72,
      pause: 1.2,
      wp: 0,
      x: 280,
      y: 290,
      dir: 0,
      wait: 0,
      scan: 0,
      investigate: null, // {x, y} or null
      lookT: 0,
    },
    {
      name: 'Bishop',
      route: [
        { x: 480, y: 160 },
        { x: 920, y: 160 },
        { x: 920, y: 280 },
        { x: 480, y: 280 },
      ],
      speed: 82,
      pause: 0.8,
      wp: 0,
      x: 480,
      y: 160,
      dir: 0,
      wait: 0,
      scan: 0,
      investigate: null,
      lookT: 0,
    },
    {
      name: 'Knight',
      route: [
        { x: 300, y: 580 },
        { x: 1000, y: 580 },
      ],
      speed: 62,
      pause: 1.5,
      wp: 0,
      x: 300,
      y: 580,
      dir: 0,
      wait: 0,
      scan: 0,
      investigate: null,
      lookT: 0,
    },
  ];
}

// A guard walks to (tx, ty) at its speed; returns true when it arrives.
function guardStepTo(g, tx, ty, dt) {
  const dx = tx - g.x;
  const dy = ty - g.y;
  const d = Math.hypot(dx, dy);
  if (d < 2) return true;
  const step = Math.min(d, g.speed * dt);
  g.x += (dx / d) * step;
  g.y += (dy / d) * step;
  g.dir = Math.atan2(dy, dx);
  return d <= g.speed * dt + 2;
}

function updateGuards(dt) {
  for (const g of S.guards) {
    if (g.investigate) {
      const arrived = guardStepTo(g, g.investigate.x, g.investigate.y, dt);
      if (arrived) {
        g.lookT += dt;
        // Look around for a couple of seconds, then go back on patrol.
        g.dir += Math.sin(S.t * 2.2) * 0.9 * dt;
        if (g.lookT > 2.2) {
          g.investigate = null;
          g.lookT = 0;
          // Resume at the nearest waypoint.
          let best = 0;
          let bestD = Infinity;
          g.route.forEach((w, i) => {
            const d = Math.hypot(w.x - g.x, w.y - g.y);
            if (d < bestD) { bestD = d; best = i; }
          });
          g.wp = best;
        }
      }
      continue;
    }
    if (g.wait > 0) {
      g.wait -= dt;
      // Scan: sweep the head slowly while paused.
      g.scan += dt;
      g.dir += Math.sin(g.scan * 1.6) * 0.55 * dt;
      continue;
    }
    const target = g.route[g.wp];
    const arrived = guardStepTo(g, target.x, target.y, dt);
    if (arrived) {
      g.wait = g.pause;
      g.scan = 0;
      g.wp = (g.wp + 1) % g.route.length;
    }
  }
}

// The guard's current cone direction: facing, plus a slow sweep while walking.
function guardConeDir(g) {
  return g.dir + Math.sin(S.t * 0.9 + g.x * 0.01) * 0.18;
}

// Can this guard see the thief right now?
function guardSees(g) {
  const p = S.player;
  if (p.inVent) return false;
  const dx = p.x - g.x;
  const dy = p.y - g.y;
  const d = Math.hypot(dx, dy);
  const range = CFG.guardRange * (p.sneaking ? CFG.sneakRangeMul : 1);
  if (d > range) return false;
  const ang = Math.atan2(dy, dx);
  if (Math.abs(angleDiff(ang, guardConeDir(g))) > CFG.guardHalfAngle) return false;
  if (!losClear(g.x, g.y, p.x, p.y)) return false;
  if (blockedBySmoke(g.x, g.y, p.x, p.y)) return false;
  return true;
}

// Send the nearest guard to look at a noise at (x, y).
function nearestGuardInvestigates(x, y) {
  let best = null;
  let bestD = Infinity;
  for (const g of S.guards) {
    const d = Math.hypot(g.x - x, g.y - y);
    if (d < bestD) { bestD = d; best = g; }
  }
  if (best) {
    best.investigate = { x, y };
    best.lookT = 0;
  }
}
