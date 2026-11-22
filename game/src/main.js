'use strict';
/* The Gilded Vault — game loop and state machine.
   Phases: menu, playing, caught, win. The loop updates the thief,
   guards, cameras, tools and alarm, then draws one frame. */
var GV = window.GV || (window.GV = {});

GV.main = (function () {
  var C = GV.config;

  var canvas;
  var ctx;
  var state;

  function newThief() {
    return {
      x: GV.world.entryPoint.x,
      y: GV.world.entryPoint.y,
      facing: 0,
      moving: false,
      sneaking: false,
      stepTimer: 0,
    };
  }

  function newState() {
    return {
      phase: 'menu',
      time: 0,
      elapsed: 0,
      thief: newThief(),
      guards: GV.guards.createGuards(),
      cameras: GV.cameras.createCameras(),
      tools: GV.tools.createTools(),
      alarm: GV.alarm.createAlarm(),
      lootValue: 0,
      score: null,
      frozen: false,
      frozenTime: 0,
    };
  }

  function computeScore(s) {
    var timeBonus = Math.max(0, Math.round((C.parSeconds - s.elapsed) * C.timeBonusPerSec));
    var ghostBonus = s.alarm.everSpotted ? 0 : C.ghostBonus;
    return {
      loot: s.lootValue,
      timeBonus: timeBonus,
      ghostBonus: ghostBonus,
      total: s.lootValue + timeBonus + ghostBonus,
    };
  }

  function resetRun() {
    GV.world.resetLoot();
    var fresh = newState();
    fresh.phase = 'playing';
    state.thief = fresh.thief;
    state.guards = fresh.guards;
    state.cameras = fresh.cameras;
    state.tools = fresh.tools;
    state.alarm = fresh.alarm;
    state.elapsed = 0;
    state.lootValue = 0;
    state.score = null;
    state.phase = 'playing';
  }

  function startGame() {
    GV.audio.unlock();
    resetRun();
  }

  function updateThief(dt) {
    var thief = state.thief;
    var move = GV.input.moveVector();
    thief.sneaking = GV.input.sneaking();
    var speed = thief.sneaking ? C.thiefSneakSpeed : C.thiefSpeed;
    if (GV.world.inVent(thief.x, thief.y)) speed *= C.ventSpeedFactor;
    thief.moving = move.x !== 0 || move.y !== 0;
    if (thief.moving) {
      thief.facing = Math.atan2(move.y, move.x);
      thief.x += move.x * speed * dt;
      thief.y += move.y * speed * dt;
      GV.world.collideCircle(thief, C.thiefRadius);
      /* Soft footsteps. */
      thief.stepTimer -= dt;
      if (thief.stepTimer <= 0) {
        GV.audio.footstep();
        thief.stepTimer = thief.sneaking ? 0.55 : 0.34;
      }
    }
  }

  function updateLoot() {
    var thief = state.thief;
    for (var i = 0; i < GV.world.lootItems.length; i++) {
      var item = GV.world.lootItems[i];
      if (item.taken) continue;
      var dx = thief.x - item.x;
      var dy = thief.y - item.y;
      if (dx * dx + dy * dy < 30 * 30) {
        item.taken = true;
        state.lootValue += item.value;
        GV.audio.pickup();
      }
    }
  }

  function anySeesThief() {
    var thief = state.thief;
    var inVent = GV.world.inVent(thief.x, thief.y);
    var inSmoke = GV.tools.inSmoke(state.tools, thief.x, thief.y);
    for (var i = 0; i < state.guards.length; i++) {
      if (GV.guards.guardSeesThief(state.guards[i], thief.x, thief.y, inSmoke, inVent)) return true;
    }
    for (var j = 0; j < state.cameras.length; j++) {
      if (GV.cameras.cameraSeesThief(state.cameras[j], thief.x, thief.y, inSmoke, inVent)) return true;
    }
    return false;
  }

  function update(dt) {
    state.time += dt;
    if (state.phase === 'menu') {
      /* The menu shows the gallery alive behind it. */
      GV.guards.updateGuards(state.guards, dt, state.time);
      GV.cameras.updateCameras(state.cameras, state.time);
      var click = GV.input.consumeClick();
      if (click) {
        var bx = C.canvasWidth / 2;
        if (click.x >= bx - 130 && click.x <= bx + 130 && click.y >= 450 && click.y <= 506) {
          startGame();
        }
      }
      if (GV.input.pressed('Enter')) startGame();
      return;
    }
    if (state.phase !== 'playing') {
      /* R runs the heist again after a catch or a getaway. */
      if ((state.phase === 'caught' || state.phase === 'win') && GV.input.pressed('KeyR')) {
        GV.input.keys.KeyR = false;
        startGame();
      }
      return;
    }

    state.elapsed += dt;
    updateThief(dt);
    GV.guards.updateGuards(state.guards, dt, state.time);
    GV.cameras.updateCameras(state.cameras, state.time);
    GV.tools.updateTools(state.tools, dt);

    /* Tools on their keys. */
    if (GV.input.pressed('KeyQ')) {
      if (GV.tools.throwSmoke(state.tools, state.thief)) GV.input.keys.KeyQ = false;
    }
    if (GV.input.pressed('KeyF')) {
      var landing = GV.tools.throwCoin(state.tools, state.thief);
      if (landing) {
        GV.guards.alertNearest(state.guards, landing.x, landing.y, 340);
        GV.input.keys.KeyF = false;
      }
    }
    var pick = GV.tools.updateLockpick(state.tools, state.thief, state.guards, dt);
    if (pick === 'picked') state.lootValue += GV.world.gem.value;

    updateLoot();

    var seen = anySeesThief();
    var wasSpotted = state.alarm.spotted;
    GV.alarm.updateAlarm(state.alarm, seen, state.thief.sneaking, dt);
    if (state.alarm.spotted && !wasSpotted) GV.audio.spotted();
    GV.audio.heartbeat(state.alarm.value, dt);

    if (state.alarm.caught) {
      state.phase = 'caught';
      GV.audio.caught();
      return;
    }

    /* Getaway: the gem in hand, reach the door. */
    if (GV.world.gem.taken && GV.world.atExit(state.thief.x, state.thief.y)) {
      state.score = computeScore(state);
      state.phase = 'win';
      GV.audio.win();
    }
  }

  function frame(timestamp) {
    var now = timestamp / 1000;
    var dt = Math.min(0.05, now - (frame.last || now));
    frame.last = now;
    if (!state.frozen) update(dt);
    var time = state.frozen ? state.frozenTime : state.time;
    GV.render.draw(ctx, state, time);
    window.requestAnimationFrame(frame);
  }

  function boot() {
    canvas = document.getElementById('game');
    ctx = canvas.getContext('2d');
    state = newState();
    GV.input.attach(canvas);
    /* A staged screenshot freezes the loop on one chosen moment. */
    var shot = GV.shots.shotFromUrl();
    if (shot) {
      state.phase = 'playing';
      GV.shots.applyShot(state, shot);
    }
    window.requestAnimationFrame(frame);
  }

  /* Debug handle for playtesting: state, alarm and positions. */
  function debugSnapshot() {
    return {
      phase: state.phase,
      alarm: Math.round(state.alarm.value * 10) / 10,
      spotted: state.alarm.spotted,
      everSpotted: state.alarm.everSpotted,
      thief: { x: Math.round(state.thief.x), y: Math.round(state.thief.y) },
      gemTaken: GV.world.gem.taken,
      lootValue: state.lootValue,
      elapsed: Math.round(state.elapsed * 10) / 10,
      score: state.score,
      smokeLeft: state.tools.smokeLeft,
      coinsLeft: state.tools.coinsLeft,
      lockpickProgress: Math.round(state.tools.lockpick.progress * 100) / 100,
    };
  }

  window.__vault = {
    snapshot: debugSnapshot,
    startGame: startGame,
    resetRun: resetRun,
    state: function () {
      return state;
    },
  };

  return {
    boot: boot,
    computeScore: computeScore,
    newState: newState,
  };
})();

window.addEventListener('DOMContentLoaded', function () {
  GV.main.boot();
});
