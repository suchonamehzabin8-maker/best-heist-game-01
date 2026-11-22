'use strict';
/* The thief's tools, each with a real cost.
   - Lockpick: hold E at the gem case for a few seconds; it clicks,
     and the noise can pull a guard over.
   - Smoke pellet: Q drops a cloud that blocks every cone for a few
     seconds. Only three.
   - Coin toss: F throws a coin toward the mouse; the nearest guard
     goes to look at where it landed. Only three. */
var GV = window.GV || (window.GV = {});

GV.tools = (function () {
  var C = GV.config;

  function createTools() {
    return {
      lockpick: { active: false, progress: 0 },
      smokeLeft: C.smokeCount,
      coinsLeft: C.coinCount,
      smokes: [], /* {x, y, left} */
      coins: [], /* {x, y, left, landed} */
    };
  }

  function resetTools(tools) {
    tools.lockpick.active = false;
    tools.lockpick.progress = 0;
    tools.smokeLeft = C.smokeCount;
    tools.coinsLeft = C.coinCount;
    tools.smokes.length = 0;
    tools.coins.length = 0;
  }

  /* Hold E near the gem case to work the lock. Returns true while picking. */
  function updateLockpick(tools, thief, guards, dt) {
    var lp = tools.lockpick;
    var near = GV.world.nearGemCase(thief.x, thief.y);
    var caseLocked = GV.world.gemCase.locked;
    if (near && caseLocked && GV.input.pressed('KeyE')) {
      if (!lp.active) {
        lp.active = true;
        GV.audio.lockpickTick();
      }
      lp.progress += dt / C.lockpickSeconds;
      if (lp.progress >= 1) {
        lp.progress = 1;
        lp.active = false;
        GV.world.gemCase.locked = false;
        GV.world.gem.taken = true;
        GV.audio.pickup();
        /* The lock's last click is loud: the nearest guard comes to look. */
        GV.guards.alertNearest(guards, GV.world.gem.x, GV.world.gem.y, C.lockpickNoiseRadius);
        return 'picked';
      }
      return 'picking';
    }
    if (lp.active) {
      /* Letting go of E pauses the pick; progress is kept. */
      lp.active = false;
    }
    return 'idle';
  }

  function throwSmoke(tools, thief) {
    if (tools.smokeLeft <= 0) return false;
    tools.smokeLeft -= 1;
    tools.smokes.push({ x: thief.x, y: thief.y, left: C.smokeSeconds });
    GV.audio.smoke();
    return true;
  }

  function throwCoin(tools, thief) {
    if (tools.coinsLeft <= 0) return false;
    tools.coinsLeft -= 1;
    /* Aim at the mouse, but never further than a good throw. */
    var dx = GV.input.mouseX - thief.x;
    var dy = GV.input.mouseY - thief.y;
    var dist = Math.sqrt(dx * dx + dy * dy);
    var reach = Math.min(dist, C.coinThrowDistance);
    var tx = thief.x;
    var ty = thief.y;
    if (dist > 1) {
      tx = thief.x + (dx / dist) * reach;
      ty = thief.y + (dy / dist) * reach;
    }
    tools.coins.push({ x: tx, y: ty, left: 1.2, landed: true });
    GV.audio.coin();
    return { x: tx, y: ty };
  }

  function updateTools(tools, dt) {
    for (var i = tools.smokes.length - 1; i >= 0; i--) {
      tools.smokes[i].left -= dt;
      if (tools.smokes[i].left <= 0) tools.smokes.splice(i, 1);
    }
    for (var j = tools.coins.length - 1; j >= 0; j--) {
      tools.coins[j].left -= dt;
      if (tools.coins[j].left <= 0) tools.coins.splice(j, 1);
    }
  }

  /* Is the thief inside any smoke cloud right now? */
  function inSmoke(tools, x, y) {
    for (var i = 0; i < tools.smokes.length; i++) {
      var s = tools.smokes[i];
      var dx = x - s.x;
      var dy = y - s.y;
      if (dx * dx + dy * dy < C.smokeRadius * C.smokeRadius) return true;
    }
    return false;
  }

  return {
    createTools: createTools,
    resetTools: resetTools,
    updateLockpick: updateLockpick,
    throwSmoke: throwSmoke,
    throwCoin: throwCoin,
    updateTools: updateTools,
    inSmoke: inSmoke,
  };
})();
