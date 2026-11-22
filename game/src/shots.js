'use strict';
/* Scripted screenshot states for The Gilded Vault.
   ?shot=cover (or approach, alarm, getaway) in the page URL stages a
   fixed scene and freezes the game loop, so a screenshot is a real
   render of the game's own code at a chosen moment. */
var GV = window.GV || (window.GV = {});

GV.shots = (function () {
  function placeGuard(guards, index, x, y, facing) {
    var g = guards[index];
    g.x = x;
    g.y = y;
    g.facing = facing;
    g.mode = 'patrol';
    g.pauseLeft = 99;
  }

  function applyShot(state, name) {
    var W = GV.world;
    var frozenTime = 1.6;
    if (name === 'cover') {
      /* The money frame: room, thief, guard cones, camera cones, the
         glowing gem and a half-full alarm meter, all in one frame. */
      state.thief.x = 560;
      state.thief.y = 520;
      state.thief.facing = -Math.PI / 2;
      placeGuard(state.guards, 0, 420, 430, Math.PI / 4);
      placeGuard(state.guards, 1, 200, 300, -Math.PI / 2);
      placeGuard(state.guards, 2, 1150, 380, Math.PI);
      state.cameras[0].angle = Math.PI + 0.4;
      state.cameras[1].angle = Math.PI - 0.5;
      /* Alarm half full and amber, but no banner: the cover shows the
         room, not a warning strip across it. */
      state.alarm.value = 38;
      state.alarm.spotted = false;
      state.tools.smokes.push({ x: 620, y: 470, left: 4 });
      state.lootValue = 8000;
      W.lootItems[1].taken = true; /* the vase is already pocketed */
    } else if (name === 'approach') {
      /* Sneaking up to the gem case, lockpick half done, a guard
         sweeping past the armour case. */
      state.thief.x = 640;
      state.thief.y = 250;
      state.thief.facing = -Math.PI / 2;
      state.thief.sneaking = true;
      placeGuard(state.guards, 0, 780, 300, Math.PI);
      placeGuard(state.guards, 1, 300, 200, 0);
      placeGuard(state.guards, 2, 1150, 500, Math.PI);
      state.cameras[0].angle = Math.PI + 0.2;
      state.cameras[1].angle = Math.PI - 0.3;
      state.tools.lockpick.active = true;
      state.tools.lockpick.progress = 0.6;
      state.alarm.value = 8;
      state.lootValue = 17000;
      W.lootItems[0].taken = true;
      W.lootItems[1].taken = true;
    } else if (name === 'alarm') {
      /* Caught in a guard's cone: SPOTTED! banner, alarm nearly full,
         edge glow closing in. */
      state.thief.x = 700;
      state.thief.y = 430;
      state.thief.facing = Math.PI;
      placeGuard(state.guards, 0, 560, 430, 0);
      placeGuard(state.guards, 1, 240, 480, Math.PI / 3);
      placeGuard(state.guards, 2, 1150, 300, Math.PI);
      state.cameras[0].angle = Math.PI + 0.5;
      state.cameras[1].angle = Math.PI - 0.2;
      state.alarm.value = 82;
      state.alarm.spotted = true;
      state.alarm.everSpotted = true;
      state.lootValue = 8000;
      W.lootItems[1].taken = true;
    } else if (name === 'getaway') {
      /* The payoff: gem taken, thief at the getaway door, score shown. */
      state.phase = 'win';
      state.thief.x = 1200;
      state.thief.y = 664;
      state.thief.facing = 0;
      W.gem.taken = true;
      W.gemCase.locked = false;
      W.lootItems[0].taken = true;
      W.lootItems[1].taken = true;
      W.lootItems[2].taken = true;
      state.lootValue = 75000;
      state.elapsed = 187;
      state.score = GV.main.computeScore(state);
      placeGuard(state.guards, 0, 500, 430, Math.PI);
      placeGuard(state.guards, 1, 300, 200, Math.PI / 2);
      placeGuard(state.guards, 2, 1150, 300, Math.PI);
      state.cameras[0].angle = Math.PI + 0.3;
      state.cameras[1].angle = Math.PI - 0.4;
      state.alarm.value = 0;
      state.alarm.spotted = false;
    } else {
      return false;
    }
    state.frozen = true;
    state.frozenTime = frozenTime;
    return true;
  }

  function shotFromUrl() {
    var match = /[?&]shot=([a-z]+)/.exec(window.location.search || '');
    return match ? match[1] : null;
  }

  return {
    applyShot: applyShot,
    shotFromUrl: shotFromUrl,
  };
})();
