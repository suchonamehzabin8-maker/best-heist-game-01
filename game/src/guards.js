'use strict';
/* The museum guards: fixed patrol routes with pauses, sweeping
   vision cones, and the hearing that sends them to investigate a
   noise — a lockpick's clicks or a tossed coin. */
var GV = window.GV || (window.GV = {});

GV.guards = (function () {
  var C = GV.config;

  function makeGuard(name, waypoints, pauseSeconds) {
    return {
      name: name,
      x: waypoints[0].x,
      y: waypoints[0].y,
      waypoints: waypoints,
      waypointIndex: 1,
      pauseSeconds: pauseSeconds,
      pauseLeft: 0,
      facing: 0,
      lookPhase: Math.random() * Math.PI * 2,
      /* 'patrol' | 'investigate' | 'return' */
      mode: 'patrol',
      investigateX: 0,
      investigateY: 0,
      investigateLeft: 0,
    };
  }

  function createGuards() {
    return [
      makeGuard('Marlow', [
        { x: 300, y: 430 }, { x: 640, y: 430 }, { x: 980, y: 430 },
        { x: 980, y: 300 }, { x: 640, y: 300 }, { x: 300, y: 300 },
      ], 1.6),
      makeGuard('Petra', [
        { x: 180, y: 520 }, { x: 180, y: 200 }, { x: 420, y: 200 }, { x: 420, y: 520 },
      ], 1.2),
      makeGuard('Odo', [
        { x: 1150, y: 240 }, { x: 1150, y: 600 },
      ], 2.0),
    ];
  }

  /* Send the nearest guard on patrol to look at a point. */
  function alertNearest(guards, x, y, maxDistance) {
    var best = null;
    var bestDist = maxDistance;
    for (var i = 0; i < guards.length; i++) {
      var g = guards[i];
      if (g.mode !== 'patrol') continue;
      var dx = g.x - x;
      var dy = g.y - y;
      var d = Math.sqrt(dx * dx + dy * dy);
      if (d < bestDist) {
        bestDist = d;
        best = g;
      }
    }
    if (best) {
      best.mode = 'investigate';
      best.investigateX = x;
      best.investigateY = y;
      best.investigateLeft = C.guardInvestigateSeconds;
    }
    return best;
  }

  function moveToward(g, tx, ty, dt) {
    var dx = tx - g.x;
    var dy = ty - g.y;
    var dist = Math.sqrt(dx * dx + dy * dy);
    if (dist < 2) return true;
    var step = C.guardSpeed * dt;
    if (step >= dist) {
      g.x = tx;
      g.y = ty;
      return true;
    }
    g.x += (dx / dist) * step;
    g.y += (dy / dist) * step;
    g.facing = Math.atan2(dy, dx);
    return false;
  }

  function updateGuard(g, dt, time) {
    if (g.mode === 'investigate') {
      if (moveToward(g, g.investigateX, g.investigateY, dt)) {
        /* Arrived: look around for a while. */
        g.investigateLeft -= dt;
        g.facing += Math.sin(time * 1.4 + g.lookPhase) * dt * 1.6;
        if (g.investigateLeft <= 0) {
          g.mode = 'return';
        }
      }
      return;
    }
    if (g.mode === 'return') {
      /* Walk back to the nearest waypoint, then resume the patrol. */
      var best = 0;
      var bestDist = Infinity;
      for (var i = 0; i < g.waypoints.length; i++) {
        var w = g.waypoints[i];
        var d = (w.x - g.x) * (w.x - g.x) + (w.y - g.y) * (w.y - g.y);
        if (d < bestDist) {
          bestDist = d;
          best = i;
        }
      }
      if (moveToward(g, g.waypoints[best].x, g.waypoints[best].y, dt)) {
        g.waypointIndex = (best + 1) % g.waypoints.length;
        g.mode = 'patrol';
      }
      return;
    }
    /* Patrol: walk the waypoints, pausing and looking around at each. */
    if (g.pauseLeft > 0) {
      g.pauseLeft -= dt;
      g.facing += Math.sin(time * 1.1 + g.lookPhase) * dt * 1.1;
      return;
    }
    var target = g.waypoints[g.waypointIndex];
    if (moveToward(g, target.x, target.y, dt)) {
      g.waypointIndex = (g.waypointIndex + 1) % g.waypoints.length;
      g.pauseLeft = g.pauseSeconds;
    }
  }

  function updateGuards(guards, dt, time) {
    for (var i = 0; i < guards.length; i++) updateGuard(guards[i], dt, time);
  }

  function angleDiff(a, b) {
    var d = a - b;
    while (d > Math.PI) d -= Math.PI * 2;
    while (d < -Math.PI) d += Math.PI * 2;
    return Math.abs(d);
  }

  /* Can this guard see the thief right now? */
  function guardSeesThief(g, thiefX, thiefY, inSmoke, inVent) {
    if (inVent || inSmoke) return false;
    var dx = thiefX - g.x;
    var dy = thiefY - g.y;
    var dist = Math.sqrt(dx * dx + dy * dy);
    if (dist > C.guardConeRange) return false;
    if (angleDiff(Math.atan2(dy, dx), g.facing) > C.guardConeHalfAngle) return false;
    return !GV.world.lineBlocked(g.x, g.y, thiefX, thiefY);
  }

  function resetGuards(guards) {
    var fresh = createGuards();
    for (var i = 0; i < guards.length; i++) {
      var f = fresh[i];
      guards[i].x = f.x;
      guards[i].y = f.y;
      guards[i].waypointIndex = f.waypointIndex;
      guards[i].pauseLeft = 0;
      guards[i].facing = f.facing;
      guards[i].mode = 'patrol';
    }
  }

  return {
    createGuards: createGuards,
    updateGuards: updateGuards,
    guardSeesThief: guardSeesThief,
    alertNearest: alertNearest,
    resetGuards: resetGuards,
    angleDiff: angleDiff,
  };
})();
