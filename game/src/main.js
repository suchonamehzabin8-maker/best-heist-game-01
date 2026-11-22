// The Gilded Vault — game loop and state machine.
// Menu -> playing -> (caught | win), R restarts, Enter starts.

let canvas = null;
let lastTs = 0;
let selfTestMode = false;

function resetGame() {
  S.state = 'playing';
  S.t = 0;
  S.time = 0;
  S.alarm = 0;
  S.spotted = false;
  S.ghost = true;
  S.grace = 0;
  S.graceActive = false;
  S.wasSeen = false;
  S.player.x = START.x;
  S.player.y = START.y;
  S.player.dir = -Math.PI / 2;
  S.player.moving = false;
  S.player.sneaking = false;
  S.player.inVent = false;
  S.gemTaken = false;
  S.lockpick = 0;
  S.tools.smoke = CFG.smokeCount;
  S.tools.coins = CFG.coinCount;
  S.smokes = [];
  S.coins = [];
  S.guards = makeGuards();
  S.cameras = makeCameras();
  S.message = '';
  S.messageT = 0;
  S.score = null;
  S.frozen = false;
  S.stepAcc = 0;
  S.nearCone = false;
}

function computeScore() {
  const seconds = Math.floor(S.time);
  const timeBonus = Math.max(0, CFG.timeBonusCap - seconds) * CFG.timeBonusPerSec;
  const ghostBonus = S.ghost ? CFG.ghostBonus : 0;
  return { loot: CFG.gemValue, timeBonus, ghostBonus, total: CFG.gemValue + timeBonus + ghostBonus, seconds };
}

function update(dt) {
  S.t += dt;
  if (S.state === 'playing') S.time += dt;

  // Tools and timers.
  updateTools(dt);
  if (S.messageT > 0) S.messageT -= dt;

  // Guards and cameras keep sweeping.
  updateGuards(dt);

  if (S.state !== 'playing') return;

  // Player movement.
  const v = inputVector();
  const p = S.player;
  p.sneaking = !!(keys['ShiftLeft'] || keys['ShiftRight']);
  const inVent = inVentAt(p.x, p.y);
  p.inVent = inVent;
  const speed = inVent ? CFG.ventSpeed : p.sneaking ? CFG.sneakSpeed : CFG.walkSpeed;
  const moving = v.x !== 0 || v.y !== 0;
  p.moving = moving;
  if (moving) {
    // Picking the lock roots the thief: moving cancels the channel.
    if (S.lockpick > 0) S.lockpick = 0;
    moveCircle(p, v.x * speed * dt, v.y * speed * dt);
    p.dir = Math.atan2(v.y, v.x);
    S.stepAcc += dt;
    if (S.stepAcc > 0.34) {
      S.stepAcc = 0;
      playStep();
    }
  }

  // Lockpick: hold E by the gem case.
  updateLockpick(dt, !!keys['KeyE']);

  // Smoke on Q, coin on F.
  if (keys['KeyQ']) {
    keys['KeyQ'] = false; // single press
    throwSmoke();
  }
  if (keys['KeyF']) {
    keys['KeyF'] = false;
    throwCoin(mouse.x, mouse.y);
  }
  if (mouse.clicked) {
    mouse.clicked = false;
    throwCoin(mouse.x, mouse.y);
  }

  // Who sees the thief?
  let seenByGuard = false;
  let seenByCamera = false;
  let nearCone = false;
  for (const g of S.guards) {
    if (guardSees(g)) seenByGuard = true;
    const d = Math.hypot(p.x - g.x, p.y - g.y);
    if (d < CFG.guardRange + 40) nearCone = true;
  }
  for (const c of S.cameras) {
    if (cameraSees(c)) seenByCamera = true;
    const d = Math.hypot(p.x - c.x, p.y - c.y);
    if (d < CFG.cameraRange + 40) nearCone = true;
  }
  S.nearCone = nearCone;
  updateAlarm(dt, seenByGuard, seenByCamera);
  updateSiren();

  // Win: gem in hand and standing at the getaway door.
  if (S.gemTaken && pointInRect(p.x, p.y, { x: EXIT.x - 10, y: EXIT.y - 10, w: EXIT.w + 20, h: EXIT.h + 20 })) {
    S.state = 'win';
    S.score = computeScore();
    playWin();
  }
}

function frame(ts) {
  requestAnimationFrame(frame);
  const dt = Math.min(0.05, (ts - lastTs) / 1000 || 0.016);
  lastTs = ts;
  if (!S.frozen) update(dt);
  render();
}

function startGame() {
  canvas = document.getElementById('game');
  initRender(canvas);
  initInput(canvas);
  S.guards = makeGuards();
  S.cameras = makeCameras();

  const params = new URLSearchParams(window.location.search);
  const shot = params.get('shot');
  const selfTest = params.get('selftest');

  if (shot) {
    applyShot(shot);
    render();
    requestAnimationFrame(frame);
    return;
  }

  if (selfTest) {
    selfTestMode = true;
    runSelfTest();
    return;
  }

  window.addEventListener('keydown', (e) => {
    ensureAudio();
    if (S.state === 'menu' && (e.code === 'Enter' || e.code === 'Space')) {
      resetGame();
    } else if ((S.state === 'caught' || S.state === 'win') && e.code === 'KeyR') {
      resetGame();
    }
  });
  canvas.addEventListener('mousedown', () => {
    ensureAudio();
    if (S.state === 'menu') resetGame();
  });

  requestAnimationFrame(frame);
}

// Headless self-test: drives the game through scripted inputs and writes
// the outcome into #selftest for --dump-dom inspection. No real browser
// interaction needed.
function runSelfTest() {
  const out = [];
  const log = (s) => out.push(s);
  resetGame();
  log('start state=' + S.state + ' player=' + S.player.x + ',' + S.player.y);

  // Walk right for 2 seconds: the thief must actually move.
  keys['KeyD'] = true;
  for (let i = 0; i < 120; i++) update(1 / 60);
  keys['KeyD'] = false;
  log('after walk right: x=' + Math.round(S.player.x) + ' (expect > 200)');

  // Park the guards far away, then pick the lock uninterrupted.
  for (const gg of S.guards) { gg.x = 100; gg.y = 100; gg.wait = 999; gg.investigate = null; }
  S.player.x = 640;
  S.player.y = 185;
  keys['KeyE'] = true;
  for (let i = 0; i < 200; i++) update(1 / 60);
  keys['KeyE'] = false;
  log('gem taken=' + S.gemTaken + ' lockpick=' + S.lockpick.toFixed(2));

  // Vision check: the thief standing in a guard's cone is seen.
  resetGame();
  const g = S.guards[0];
  g.wait = 999;
  const dir = guardConeDir(g);
  S.player.x = g.x + Math.cos(dir) * 60;
  S.player.y = g.y + Math.sin(dir) * 60;
  log('guardSees=' + guardSees(g) + ' (expect true)');

  // Alarm rises while seen, and being caught ends the run.
  S.graceActive = false;
  S.grace = 0;
  S.alarm = 0;
  for (let i = 0; i < 180; i++) updateAlarm(1 / 60, true, false);
  log('alarm after 3s seen=' + S.alarm.toFixed(1) + ' (expect >20) spotted=' + S.spotted);
  for (let i = 0; i < 400; i++) updateAlarm(1 / 60, true, false);
  log('state after long exposure=' + S.state + ' (expect caught)');

  // Win path: gem taken, stand at the exit.
  resetGame();
  S.gemTaken = true;
  S.player.x = 1215;
  S.player.y = 640;
  update(1 / 60);
  log('win state=' + S.state + ' score=' + (S.score ? S.score.total : 'null'));

  // Smoke + coin do not throw.
  resetGame();
  throwSmoke();
  throwCoin(600, 400);
  update(1 / 60);
  log('smoke=' + S.smokes.length + ' coins=' + S.coins.length + ' tools=' + S.tools.smoke + '/' + S.tools.coins);

  // Vent hides the thief.
  resetGame();
  S.player.x = 300;
  S.player.y = 69;
  update(1 / 60);
  log('inVent=' + S.player.inVent);

  const node = document.getElementById('selftest');
  if (node) node.textContent = out.join('\n');
  document.title = 'SELFTEST-DONE';
}

document.addEventListener('DOMContentLoaded', startGame);
