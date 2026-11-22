// The Gilded Vault — the thief's tools. Every tool costs something:
// the lockpick takes time and makes noise, smoke and coins are limited.

function nearGemCase() {
  const p = S.player;
  return Math.hypot(p.x - GEM.x, p.y - GEM.y) < 105;
}

// Hold E by the gem case to pick the lock. Returns true while channeling.
function updateLockpick(dt, holding) {
  if (S.gemTaken) { S.lockpick = 0; return; }
  if (holding && nearGemCase() && S.state === 'playing') {
    if (S.lockpick === 0) {
      S.message = 'Picking the lock… stay still';
      S.messageT = 0.5;
    }
    S.lockpick += dt / CFG.lockpickTime;
    if (S.lockpick >= 1) {
      S.lockpick = 1;
      S.gemTaken = true;
      S.message = 'Meridian Star secured! Reach the getaway door!';
      S.messageT = 3;
      playChime();
      // The pick makes noise: the nearest guard comes to look.
      nearestGuardInvestigates(GEM.x, GEM.y + 60);
    }
  } else {
    S.lockpick = 0;
  }
}

function throwSmoke() {
  if (S.state !== 'playing') return false;
  if (S.tools.smoke <= 0) {
    S.message = 'No smoke pellets left';
    S.messageT = 1.2;
    return false;
  }
  S.tools.smoke--;
  S.smokes.push({ x: S.player.x, y: S.player.y, r: CFG.smokeRadius, ttl: CFG.smokeTime });
  playSoft();
  return true;
}

// Toss a coin at (x, y): it lands with a clink and the nearest guard
// walks over to look at it.
function throwCoin(x, y) {
  if (S.state !== 'playing') return false;
  if (S.tools.coins <= 0) {
    S.message = 'No coins left';
    S.messageT = 1.2;
    return false;
  }
  const p = S.player;
  const dx = x - p.x;
  const dy = y - p.y;
  const d = Math.hypot(dx, dy);
  if (d > CFG.coinRange) {
    x = p.x + (dx / d) * CFG.coinRange;
    y = p.y + (dy / d) * CFG.coinRange;
  }
  S.tools.coins--;
  S.coins.push({ x0: p.x, y0: p.y, x1: x, y1: y, t: 0, dur: 0.45, landed: false });
  playClink();
  return true;
}

function updateTools(dt) {
  for (const s of S.smokes) s.ttl -= dt;
  S.smokes = S.smokes.filter((s) => s.ttl > 0);
  for (const c of S.coins) {
    if (c.landed) continue;
    c.t += dt;
    if (c.t >= c.dur) {
      c.landed = true;
      c.landT = S.t;
      nearestGuardInvestigates(c.x1, c.y1);
    }
  }
  S.coins = S.coins.filter((c) => !c.landed || S.t - (c.landT || 0) < 0.6);
}
