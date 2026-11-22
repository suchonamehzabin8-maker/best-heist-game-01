'use strict';
/* The museum gallery: walls, display cases, pillars, the vent crawl,
   the loot, the gem case and the getaway door. This file owns the
   room's geometry, collision and line-of-sight tests. */
var GV = window.GV || (window.GV = {});

GV.world = (function () {
  var C = GV.config;

  /* Play area inside the outer walls (the HUD strip sits above it). */
  var ROOM = { x: 16, y: 72, w: 1248, h: 640 };

  /* Solid rectangles the thief and guards walk around. */
  var walls = [
    /* Right-hand partition: makes the camera corridor along the east wall. */
    { x: 1052, y: 200, w: 16, h: 200 },
    { x: 1052, y: 470, w: 16, h: 90 },
    /* Low partition in the north-west room, with a doorway gap. */
    { x: 120, y: 296, w: 180, h: 16 },
    { x: 360, y: 296, w: 120, h: 16 },
  ];

  /* Glass display cases: cover that blocks sight and movement. */
  var cases = [
    { x: 220, y: 220, w: 150, h: 70, label: 'Porcelain' },
    { x: 420, y: 480, w: 170, h: 70, label: 'Tapestry' },
    { x: 700, y: 250, w: 150, h: 70, label: 'Armour' },
    { x: 880, y: 500, w: 170, h: 70, label: 'Manuscripts' },
  ];

  /* Round marble pillars. */
  var pillars = [
    { x: 320, y: 400, r: 26 },
    { x: 640, y: 400, r: 26 },
    { x: 940, y: 360, r: 26 },
    { x: 480, y: 610, r: 26 },
    { x: 800, y: 610, r: 26 },
  ];

  /* Warm lamp pools that light the floor. */
  var lamps = [
    { x: 320, y: 300, r: 130 },
    { x: 640, y: 520, r: 140 },
    { x: 960, y: 300, r: 130 },
    { x: 1160, y: 150, r: 120 },
  ];

  /* The vent crawl: a grated duct along the top wall. Inside it the
     thief is hidden from every cone, but moves slowly. */
  var vent = { x: 40, y: 84, w: 1200, h: 40 };
  var ventGrates = [
    { x: 80, y: 104 },
    { x: 600, y: 104 },
    { x: 1180, y: 104 },
  ];

  /* Small loot the thief can sweep up by walking over it. */
  var lootItems = [
    { id: 'purse', name: 'Coin Purse', x: 180, y: 150, value: C.purseValue, taken: false, colour: '#e8b64c' },
    { id: 'vase', name: 'Golden Vase', x: 200, y: 640, value: C.vaseValue, taken: false, colour: '#f0c75e' },
    { id: 'statue', name: 'Jade Statue', x: 1160, y: 640, value: C.statueValue, taken: false, colour: '#7fd6a4' },
  ];

  /* The Meridian Star, in its locked glass case at the north wall. */
  var gemCase = { x: 595, y: 140, w: 90, h: 54, locked: true };
  var gem = { x: 640, y: 167, value: C.gemValue, taken: false };

  var entryPoint = { x: 70, y: 680 };
  var exitDoor = { x: 1160, y: 664, w: 96, h: 40 };

  function rects() {
    return walls.concat(cases).concat([gemCase]);
  }

  function clampToRoom(p, radius) {
    p.x = Math.max(ROOM.x + radius, Math.min(ROOM.x + ROOM.w - radius, p.x));
    p.y = Math.max(ROOM.y + radius, Math.min(ROOM.y + ROOM.h - radius, p.y));
  }

  /* Push a circle out of every solid rectangle and pillar. */
  function collideCircle(p, radius) {
    clampToRoom(p, radius);
    var solids = rects();
    for (var i = 0; i < solids.length; i++) {
      var r = solids[i];
      var nearestX = Math.max(r.x, Math.min(p.x, r.x + r.w));
      var nearestY = Math.max(r.y, Math.min(p.y, r.y + r.h));
      var dx = p.x - nearestX;
      var dy = p.y - nearestY;
      var distSq = dx * dx + dy * dy;
      if (distSq < radius * radius) {
        if (distSq === 0) {
          p.y = r.y - radius;
        } else {
          var dist = Math.sqrt(distSq);
          p.x = nearestX + (dx / dist) * radius;
          p.y = nearestY + (dy / dist) * radius;
        }
      }
    }
    for (var j = 0; j < pillars.length; j++) {
      var pil = pillars[j];
      var px = p.x - pil.x;
      var py = p.y - pil.y;
      var dSq = px * px + py * py;
      var minDist = radius + pil.r;
      if (dSq < minDist * minDist && dSq > 0) {
        var d = Math.sqrt(dSq);
        p.x = pil.x + (px / d) * minDist;
        p.y = pil.y + (py / d) * minDist;
      }
    }
  }

  /* True when the segment between two points crosses a wall, a case or
     a pillar: what a vision cone cannot see through. */
  function segmentHitsRect(x1, y1, x2, y2, r) {
    var minX = Math.min(x1, x2);
    var maxX = Math.max(x1, x2);
    var minY = Math.min(y1, y2);
    var maxY = Math.max(y1, y2);
    if (maxX < r.x || minX > r.x + r.w || maxY < r.y || minY > r.y + r.h) return false;
    /* Sample the segment: cheap and exact enough for cone checks. */
    var steps = 24;
    for (var i = 1; i < steps; i++) {
      var t = i / steps;
      var px = x1 + (x2 - x1) * t;
      var py = y1 + (y2 - y1) * t;
      if (px >= r.x && px <= r.x + r.w && py >= r.y && py <= r.y + r.h) return true;
    }
    return false;
  }

  function segmentHitsCircle(x1, y1, x2, y2, c) {
    var dx = x2 - x1;
    var dy = y2 - y1;
    var lenSq = dx * dx + dy * dy;
    if (lenSq === 0) return false;
    var t = ((c.x - x1) * dx + (c.y - y1) * dy) / lenSq;
    t = Math.max(0, Math.min(1, t));
    var px = x1 + dx * t;
    var py = y1 + dy * t;
    var ddx = px - c.x;
    var ddy = py - c.y;
    return ddx * ddx + ddy * ddy < c.r * c.r;
  }

  function lineBlocked(x1, y1, x2, y2) {
    var solids = rects();
    for (var i = 0; i < solids.length; i++) {
      if (segmentHitsRect(x1, y1, x2, y2, solids[i])) return true;
    }
    for (var j = 0; j < pillars.length; j++) {
      if (segmentHitsCircle(x1, y1, x2, y2, pillars[j])) return true;
    }
    return false;
  }

  function inVent(x, y) {
    return x >= vent.x && x <= vent.x + vent.w && y >= vent.y && y <= vent.y + vent.h;
  }

  function nearGemCase(x, y) {
    return Math.abs(x - gem.x) < 95 && Math.abs(y - gem.y) < 80;
  }

  function atExit(x, y) {
    return x >= exitDoor.x && x <= exitDoor.x + exitDoor.w &&
      y >= exitDoor.y - 10 && y <= exitDoor.y + exitDoor.h + 10;
  }

  function resetLoot() {
    for (var i = 0; i < lootItems.length; i++) lootItems[i].taken = false;
    gem.taken = false;
    gemCase.locked = true;
  }

  return {
    room: ROOM,
    walls: walls,
    cases: cases,
    pillars: pillars,
    lamps: lamps,
    vent: vent,
    ventGrates: ventGrates,
    lootItems: lootItems,
    gemCase: gemCase,
    gem: gem,
    entryPoint: entryPoint,
    exitDoor: exitDoor,
    collideCircle: collideCircle,
    lineBlocked: lineBlocked,
    inVent: inVent,
    nearGemCase: nearGemCase,
    atExit: atExit,
    resetLoot: resetLoot,
  };
})();
