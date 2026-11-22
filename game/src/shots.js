// The Gilded Vault — scripted shot states for screenshots. A shot freezes
// the game at a fixed moment so the frame is stable: the thief, the guards,
// the cones and the alarm are placed exactly, and the loop only renders.

function applyShot(name) {
  // Every shot starts from a clean playing state.
  resetGame();
  S.state = 'playing';
  S.frozen = true;

  if (name === 'cover') {
    // The cover: the whole room in one frame — thief mid-gallery, a guard
    // cone sweeping toward them, cameras, the glowing gem, a low alarm.
    S.player.x = 430;
    S.player.y = 440;
    S.player.dir = -Math.PI / 2;
    S.alarm = 12;
    S.shotTime = 8.5;
  } else if (name === 'approach') {
    // Crouched by the gem case, lockpick halfway, a guard cone closing in.
    S.player.x = 640;
    S.player.y = 185;
    S.player.dir = -Math.PI / 2;
    S.player.sneaking = true;
    S.lockpick = 0.6;
    S.alarm = 22;
    S.shotTime = 14.0;
  } else if (name === 'alarm') {
    // The caught moment: SPOTTED, alarm nearly full, red banner up.
    S.player.x = 700;
    S.player.y = 350;
    S.player.dir = Math.PI;
    S.alarm = 78;
    S.graceActive = true;
    S.grace = 0.6;
    S.message = 'SPOTTED! Break line of sight!';
    S.messageT = 5;
    S.shotTime = 21.5;
  } else if (name === 'getaway') {
    // The payoff: gem taken, score on the board.
    S.gemTaken = true;
    S.score = { loot: 50000, timeBonus: 18900, ghostBonus: 10000, total: 78900, seconds: 114 };
    S.state = 'win';
    S.shotTime = 0;
  } else {
    S.frozen = false;
  }

  if (S.frozen) {
    // Put the guards where the shot wants them: the patrols are functions
    // of S.t, so set the clock to the shot's moment.
    S.t = S.shotTime;
    for (const g of S.guards) placeGuardAtTime(g, S.t);
    S.nearCone = true;
  }
}

// Advance a guard along its patrol as if the clock had run to time t.
// (A fresh patrol walk from t=0, stepped in small increments.)
function placeGuardAtTime(g, t) {
  g.x = g.route[0].x;
  g.y = g.route[0].y;
  g.wp = 0;
  g.wait = 0;
  g.investigate = null;
  let clock = 0;
  const dt = 0.05;
  const savedT = S.t;
  while (clock < t) {
    S.t = clock;
    // Step this one guard only, using the same movement code.
    if (g.wait > 0) {
      g.wait -= dt;
      g.dir += Math.sin(g.scan * 1.6) * 0.55 * dt;
      g.scan += dt;
    } else {
      const target = g.route[g.wp];
      const arrived = guardStepTo(g, target.x, target.y, dt);
      if (arrived) {
        g.wait = g.pause;
        g.scan = 0;
        g.wp = (g.wp + 1) % g.route.length;
      }
    }
    clock += dt;
  }
  S.t = savedT;
}
