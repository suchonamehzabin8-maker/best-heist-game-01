'use strict';
/* All canvas drawing for The Gilded Vault: the night gallery, the
   thief, the guards and their cones, the cameras, the loot and the
   HUD — including the menu, SPOTTED! warning, caught and getaway
   screens. */
var GV = window.GV || (window.GV = {});

GV.render = (function () {
  var C = GV.config;
  var COL = C.colours;

  function drawCone(ctx, x, y, angle, halfAngle, range, fill) {
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.arc(x, y, range, angle - halfAngle, angle + halfAngle);
    ctx.closePath();
    ctx.fillStyle = fill;
    ctx.fill();
  }

  function drawFloor(ctx) {
    var room = GV.world.room;
    ctx.fillStyle = COL.floorA;
    ctx.fillRect(room.x, room.y, room.w, room.h);
    /* Checkerboard floor tiles. */
    var tile = 64;
    ctx.fillStyle = COL.floorB;
    for (var ty = room.y; ty < room.y + room.h; ty += tile) {
      for (var tx = room.x; tx < room.x + room.w; tx += tile) {
        var col = Math.floor((tx - room.x) / tile);
        var row = Math.floor((ty - room.y) / tile);
        if ((col + row) % 2 === 0) ctx.fillRect(tx, ty, tile, tile);
      }
    }
    /* A faded gold carpet down the main hall. */
    ctx.fillStyle = 'rgba(150, 110, 40, 0.16)';
    ctx.fillRect(200, 330, 880, 110);
    ctx.strokeStyle = 'rgba(255, 215, 106, 0.35)';
    ctx.lineWidth = 2;
    ctx.strokeRect(200, 330, 880, 110);
  }

  function drawLampPools(ctx) {
    for (var i = 0; i < GV.world.lamps.length; i++) {
      var lamp = GV.world.lamps[i];
      var grad = ctx.createRadialGradient(lamp.x, lamp.y, 8, lamp.x, lamp.y, lamp.r);
      grad.addColorStop(0, 'rgba(247, 200, 115, 0.20)');
      grad.addColorStop(1, 'rgba(247, 200, 115, 0)');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(lamp.x, lamp.y, lamp.r, 0, Math.PI * 2);
      ctx.fill();
      /* The lamp itself: a small brass dome on the floor. */
      ctx.fillStyle = '#c9a24a';
      ctx.beginPath();
      ctx.arc(lamp.x, lamp.y, 6, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  function drawVent(ctx, time) {
    var vent = GV.world.vent;
    ctx.fillStyle = '#12141d';
    ctx.fillRect(vent.x, vent.y, vent.w, vent.h);
    ctx.strokeStyle = '#3a4157';
    ctx.lineWidth = 2;
    ctx.strokeRect(vent.x, vent.y, vent.w, vent.h);
    /* Grate slats. */
    ctx.strokeStyle = 'rgba(120, 130, 160, 0.5)';
    ctx.lineWidth = 1;
    for (var x = vent.x + 12; x < vent.x + vent.w; x += 24) {
      ctx.beginPath();
      ctx.moveTo(x, vent.y + 4);
      ctx.lineTo(x, vent.y + vent.h - 4);
      ctx.stroke();
    }
    ctx.fillStyle = 'rgba(190, 200, 220, 0.75)';
    ctx.font = 'bold 11px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('VENT — HIDDEN, SLOW', vent.x + vent.w * 0.78, vent.y + vent.h / 2 + 4);
    for (var i = 0; i < GV.world.ventGrates.length; i++) {
      var g = GV.world.ventGrates[i];
      ctx.fillStyle = '#8a94ad';
      ctx.fillRect(g.x - 14, g.y - 10, 28, 20);
    }
  }

  function drawWallsAndCover(ctx) {
    var room = GV.world.room;
    /* Outer walls with a gold trim. */
    ctx.fillStyle = COL.wall;
    ctx.fillRect(0, C.hudHeight, C.canvasWidth, 16);
    ctx.fillRect(0, C.canvasHeight - 16, C.canvasWidth, 16);
    ctx.fillRect(0, C.hudHeight, 16, C.canvasHeight - C.hudHeight);
    ctx.fillRect(C.canvasWidth - 16, C.hudHeight, 16, C.canvasHeight - C.hudHeight);
    ctx.strokeStyle = COL.wallTrim;
    ctx.lineWidth = 2;
    ctx.strokeRect(room.x, room.y, room.w, room.h);
    /* Interior partition walls. */
    ctx.fillStyle = COL.wall;
    for (var i = 0; i < GV.world.walls.length; i++) {
      var w = GV.world.walls[i];
      ctx.fillRect(w.x, w.y, w.w, w.h);
      ctx.strokeStyle = COL.wallTrim;
      ctx.strokeRect(w.x, w.y, w.w, w.h);
    }
    /* Display cases: glass tops, gold frames, labels. */
    for (var j = 0; j < GV.world.cases.length; j++) {
      var c = GV.world.cases[j];
      ctx.fillStyle = '#232a3d';
      ctx.fillRect(c.x, c.y, c.w, c.h);
      ctx.fillStyle = 'rgba(160, 200, 255, 0.14)';
      ctx.fillRect(c.x + 4, c.y + 4, c.w - 8, c.h - 8);
      ctx.strokeStyle = COL.goldDim;
      ctx.lineWidth = 3;
      ctx.strokeRect(c.x, c.y, c.w, c.h);
      ctx.fillStyle = 'rgba(220, 225, 240, 0.7)';
      ctx.font = '11px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(c.label, c.x + c.w / 2, c.y + c.h / 2 + 4);
    }
    /* Marble pillars. */
    for (var k = 0; k < GV.world.pillars.length; k++) {
      var p = GV.world.pillars[k];
      var grad = ctx.createRadialGradient(p.x - 8, p.y - 8, 4, p.x, p.y, p.r);
      grad.addColorStop(0, '#5a6280');
      grad.addColorStop(1, '#2c3247');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = COL.wallTrim;
      ctx.lineWidth = 2;
      ctx.stroke();
    }
  }

  function drawLoot(ctx, time) {
    for (var i = 0; i < GV.world.lootItems.length; i++) {
      var item = GV.world.lootItems[i];
      if (item.taken) continue;
      var bob = Math.sin(time * 2 + i * 2) * 2;
      ctx.fillStyle = item.colour;
      ctx.beginPath();
      ctx.arc(item.x, item.y + bob, 11, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.7)';
      ctx.lineWidth = 1.5;
      ctx.stroke();
      ctx.fillStyle = '#10131c';
      ctx.font = 'bold 11px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('$', item.x, item.y + bob + 4);
      ctx.fillStyle = 'rgba(230, 235, 245, 0.85)';
      ctx.font = '11px sans-serif';
      ctx.fillText(item.name, item.x, item.y + bob + 26);
    }
  }

  function drawGemCase(ctx, time, picking) {
    var gc = GV.world.gemCase;
    var gem = GV.world.gem;
    if (!gem.taken) {
      /* The Meridian Star's gold glow. */
      var pulse = 0.55 + Math.sin(time * 3) * 0.2;
      var grad = ctx.createRadialGradient(gem.x, gem.y, 4, gem.x, gem.y, 70);
      grad.addColorStop(0, 'rgba(255, 215, 106, ' + pulse + ')');
      grad.addColorStop(1, 'rgba(255, 215, 106, 0)');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(gem.x, gem.y, 70, 0, Math.PI * 2);
      ctx.fill();
    }
    /* Glass case. */
    ctx.fillStyle = 'rgba(160, 200, 255, 0.16)';
    ctx.fillRect(gc.x, gc.y, gc.w, gc.h);
    ctx.strokeStyle = gc.locked ? '#d33' : COL.goldDim;
    ctx.lineWidth = 3;
    ctx.strokeRect(gc.x, gc.y, gc.w, gc.h);
    if (!gem.taken) {
      /* The gem: a faceted diamond. */
      ctx.fillStyle = COL.gold;
      ctx.beginPath();
      ctx.moveTo(gem.x, gem.y - 13);
      ctx.lineTo(gem.x + 11, gem.y);
      ctx.lineTo(gem.x, gem.y + 13);
      ctx.lineTo(gem.x - 11, gem.y);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = '#fff2c0';
      ctx.lineWidth = 1;
      ctx.stroke();
      ctx.fillStyle = 'rgba(230, 235, 245, 0.9)';
      ctx.font = 'bold 11px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('MERIDIAN STAR', gem.x, gc.y - 10);
      if (gc.locked && !picking) {
        ctx.fillStyle = '#ff8080';
        ctx.font = '11px sans-serif';
        ctx.fillText('LOCKED — hold E to pick', gem.x, gc.y + gc.h + 16);
      }
    }
  }

  function drawExit(ctx, time) {
    var door = GV.world.exitDoor;
    var pulse = 0.5 + Math.sin(time * 2.5) * 0.2;
    ctx.fillStyle = 'rgba(120, 220, 130, ' + pulse * 0.5 + ')';
    ctx.fillRect(door.x - 6, door.y - 6, door.w + 12, door.h + 12);
    ctx.fillStyle = '#1f5c2e';
    ctx.fillRect(door.x, door.y, door.w, door.h);
    ctx.strokeStyle = '#7fd6a4';
    ctx.lineWidth = 3;
    ctx.strokeRect(door.x, door.y, door.w, door.h);
    ctx.fillStyle = '#c9f5d4';
    ctx.font = 'bold 13px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('GETAWAY →', door.x + door.w / 2, door.y + door.h / 2 + 5);
    /* Entry mat, bottom left. */
    ctx.fillStyle = 'rgba(200, 210, 230, 0.5)';
    ctx.font = '11px sans-serif';
    ctx.fillText('ENTRY', GV.world.entryPoint.x, GV.world.entryPoint.y + 24);
  }

  function drawThief(ctx, thief, time) {
    var bob = Math.sin(time * 8) * (thief.moving ? 1.5 : 0);
    /* Soft shadow. */
    ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
    ctx.beginPath();
    ctx.ellipse(thief.x, thief.y + 12, 13, 5, 0, 0, Math.PI * 2);
    ctx.fill();
    /* Cloak: a hooded figure. */
    ctx.fillStyle = COL.thief;
    ctx.beginPath();
    ctx.arc(thief.x, thief.y + bob, C.thiefRadius, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#2a2140';
    ctx.beginPath();
    ctx.arc(thief.x, thief.y + bob - 3, 7, 0, Math.PI * 2);
    ctx.fill();
    /* Eyes, looking where the thief faces. */
    ctx.fillStyle = '#fff';
    var ex = Math.cos(thief.facing) * 3;
    var ey = Math.sin(thief.facing) * 3;
    ctx.beginPath();
    ctx.arc(thief.x + ex - 2.5, thief.y + bob - 4 + ey, 1.6, 0, Math.PI * 2);
    ctx.arc(thief.x + ex + 2.5, thief.y + bob - 4 + ey, 1.6, 0, Math.PI * 2);
    ctx.fill();
    if (thief.sneaking) {
      ctx.strokeStyle = 'rgba(180, 190, 255, 0.8)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(thief.x, thief.y + bob, C.thiefRadius + 4, 0, Math.PI * 2);
      ctx.stroke();
    }
  }

  function drawGuards(ctx, guards) {
    for (var i = 0; i < guards.length; i++) {
      var g = guards[i];
      drawCone(ctx, g.x, g.y, g.facing, C.guardConeHalfAngle, C.guardConeRange, COL.guardCone);
      /* Guard body: navy uniform, cap, torch. */
      ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
      ctx.beginPath();
      ctx.ellipse(g.x, g.y + 12, 13, 5, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#274b8f';
      ctx.beginPath();
      ctx.arc(g.x, g.y, C.guardRadius, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#f2c14e';
      ctx.beginPath();
      ctx.arc(g.x, g.y - 4, 6, Math.PI, 0);
      ctx.fill();
      ctx.fillRect(g.x - 6, g.y - 5, 12, 2);
      ctx.fillStyle = '#fff';
      ctx.beginPath();
      ctx.arc(g.x + Math.cos(g.facing) * 4 - 2, g.y + Math.sin(g.facing) * 4 - 1, 1.5, 0, Math.PI * 2);
      ctx.arc(g.x + Math.cos(g.facing) * 4 + 2, g.y + Math.sin(g.facing) * 4 - 1, 1.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = 'rgba(230, 235, 245, 0.85)';
      ctx.font = '11px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(g.name, g.x, g.y - C.guardRadius - 6);
      if (g.mode === 'investigate') {
        ctx.fillStyle = '#ffd76a';
        ctx.font = 'bold 12px sans-serif';
        ctx.fillText('?', g.x, g.y - C.guardRadius - 20);
      }
    }
  }

  function drawCameras(ctx, cameras, time) {
    for (var i = 0; i < cameras.length; i++) {
      var cam = cameras[i];
      drawCone(ctx, cam.x, cam.y, cam.angle, C.cameraConeHalfAngle, C.cameraConeRange, COL.cameraCone);
      /* Wall mount and camera body. */
      ctx.fillStyle = '#3a4157';
      ctx.fillRect(cam.x - 4, cam.y - 10, 10, 20);
      ctx.fillStyle = '#20242f';
      ctx.beginPath();
      ctx.arc(cam.x - 8, cam.y, 8, 0, Math.PI * 2);
      ctx.fill();
      /* Blinking red light. */
      ctx.fillStyle = cam.blink > 0.5 ? '#ff4040' : '#7a2020';
      ctx.beginPath();
      ctx.arc(cam.x - 8, cam.y - 9, 3, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = 'rgba(230, 235, 245, 0.85)';
      ctx.font = '11px sans-serif';
      ctx.textAlign = 'right';
      ctx.fillText('CAM', cam.x - 14, cam.y + 4);
    }
  }

  function drawToolsLayer(ctx, tools) {
    for (var i = 0; i < tools.smokes.length; i++) {
      var s = tools.smokes[i];
      var alpha = Math.min(1, s.left / 1.5);
      ctx.fillStyle = 'rgba(200, 205, 215, ' + (0.5 * alpha) + ')';
      ctx.beginPath();
      ctx.arc(s.x, s.y, C.smokeRadius, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = 'rgba(200, 205, 215, ' + (0.35 * alpha) + ')';
      ctx.beginPath();
      ctx.arc(s.x - 30, s.y + 14, C.smokeRadius * 0.6, 0, Math.PI * 2);
      ctx.arc(s.x + 34, s.y - 10, C.smokeRadius * 0.55, 0, Math.PI * 2);
      ctx.fill();
    }
    for (var j = 0; j < tools.coins.length; j++) {
      var coin = tools.coins[j];
      ctx.fillStyle = '#ffd76a';
      ctx.beginPath();
      ctx.arc(coin.x, coin.y, 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#fff2c0';
      ctx.lineWidth = 1.5;
      ctx.stroke();
      ctx.strokeStyle = 'rgba(255, 215, 106, 0.6)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(coin.x, coin.y, 14, 0, Math.PI * 2);
      ctx.stroke();
    }
  }

  function drawLockpickProgress(ctx, tools, thief) {
    var lp = tools.lockpick;
    if (!lp.active && lp.progress <= 0) return;
    var w = 90;
    var h = 9;
    var x = thief.x - w / 2;
    var y = thief.y - C.thiefRadius - 26;
    ctx.fillStyle = 'rgba(0, 0, 0, 0.65)';
    ctx.fillRect(x - 2, y - 2, w + 4, h + 4);
    ctx.fillStyle = '#ffd76a';
    ctx.fillRect(x, y, w * lp.progress, h);
    ctx.fillStyle = '#fff';
    ctx.font = '11px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('PICKING LOCK…', thief.x, y - 6);
  }

  function alarmColour(value) {
    if (value < 35) return '#58c96b';
    if (value < 70) return '#f0b23e';
    return '#ff5252';
  }

  function drawHud(ctx, state) {
    /* Top bar. */
    ctx.fillStyle = 'rgba(10, 12, 20, 0.92)';
    ctx.fillRect(0, 0, C.canvasWidth, C.hudHeight);
    ctx.fillStyle = COL.gold;
    ctx.font = 'bold 20px sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('THE GILDED VAULT', 18, 34);
    /* Alarm meter. */
    var meterX = 300;
    var meterW = 320;
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 13px sans-serif';
    ctx.fillText('ALARM', meterX, 22);
    ctx.fillStyle = '#222838';
    ctx.fillRect(meterX, 28, meterW, 16);
    ctx.fillStyle = alarmColour(state.alarm.value);
    ctx.fillRect(meterX, 28, meterW * (state.alarm.value / 100), 16);
    ctx.strokeStyle = '#5a6280';
    ctx.lineWidth = 1;
    ctx.strokeRect(meterX, 28, meterW, 16);
    if (state.alarm.spotted) {
      ctx.fillStyle = '#ff5252';
      ctx.font = 'bold 13px sans-serif';
      ctx.fillText('SPOTTED!', meterX + meterW + 12, 41);
    }
    /* Loot, tools, timer. */
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 14px sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('LOOT $' + state.lootValue.toLocaleString('en-US'), 760, 22);
    ctx.font = '13px sans-serif';
    ctx.fillStyle = '#cfd6e4';
    ctx.fillText('GEM ' + (GV.world.gem.taken ? '✓' : '✗'), 760, 41);
    ctx.fillText('SMOKE ×' + state.tools.smokeLeft + '  (Q)', 940, 22);
    ctx.fillText('COIN ×' + state.tools.coinsLeft + '  (F)', 940, 41);
    var mins = Math.floor(state.elapsed / 60);
    var secs = Math.floor(state.elapsed % 60);
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 16px sans-serif';
    ctx.fillText((mins < 10 ? '0' : '') + mins + ':' + (secs < 10 ? '0' : '') + secs, 1150, 34);
    /* Objective line along the bottom wall, clear of the vent strip. */
    ctx.fillStyle = 'rgba(220, 228, 245, 0.9)';
    ctx.font = '13px sans-serif';
    ctx.textAlign = 'center';
    var objective = GV.world.gem.taken
      ? 'Gem secured — reach the GETAWAY door, bottom right!'
      : 'Steal the Meridian Star — hold E at its case to pick the lock.';
    ctx.fillText(objective, C.canvasWidth / 2, C.canvasHeight - 4);
  }

  function drawEdgeGlow(ctx, alarmValue) {
    if (alarmValue < 25) return;
    var strength = (alarmValue - 25) / 75;
    var grad = ctx.createRadialGradient(
      C.canvasWidth / 2, C.canvasHeight / 2, C.canvasHeight * 0.42,
      C.canvasWidth / 2, C.canvasHeight / 2, C.canvasHeight * 0.75);
    grad.addColorStop(0, 'rgba(255, 40, 40, 0)');
    grad.addColorStop(1, 'rgba(255, 40, 40, ' + (0.45 * strength) + ')');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, C.canvasWidth, C.canvasHeight);
  }

  function drawSpottedBanner(ctx, time) {
    var pulse = 0.7 + Math.sin(time * 8) * 0.3;
    ctx.fillStyle = 'rgba(120, 0, 0, ' + (0.55 * pulse) + ')';
    ctx.fillRect(0, C.canvasHeight / 2 - 46, C.canvasWidth, 52);
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 34px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('SPOTTED!  BREAK LINE OF SIGHT!', C.canvasWidth / 2, C.canvasHeight / 2 - 10);
  }

  function drawMenu(ctx) {
    ctx.fillStyle = 'rgba(8, 10, 18, 0.78)';
    ctx.fillRect(0, 0, C.canvasWidth, C.canvasHeight);
    ctx.fillStyle = COL.gold;
    ctx.font = 'bold 54px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('THE GILDED VAULT', C.canvasWidth / 2, 190);
    ctx.fillStyle = '#e8ecf5';
    ctx.font = '20px sans-serif';
    ctx.fillText('A night at the Meridian Museum. Steal the Meridian Star and get out.', C.canvasWidth / 2, 236);
    ctx.font = '16px sans-serif';
    ctx.fillStyle = '#cfd6e4';
    var lines = [
      'WASD / arrows — move      SHIFT — sneak (slower, harder to spot)',
      'E (hold) — pick the gem case lock      Q — smoke pellet      F — toss a coin (aim with mouse)',
      'Blue cones are guards, red cones are cameras. The vent along the top wall hides you.',
      'Break line of sight before the alarm fills — or the heist is over.',
    ];
    for (var i = 0; i < lines.length; i++) {
      ctx.fillText(lines[i], C.canvasWidth / 2, 300 + i * 28);
    }
    /* Start button. */
    ctx.fillStyle = COL.gold;
    ctx.fillRect(C.canvasWidth / 2 - 130, 450, 260, 56);
    ctx.fillStyle = '#1a1405';
    ctx.font = 'bold 24px sans-serif';
    ctx.fillText('START THE HEIST', C.canvasWidth / 2, 486);
    ctx.fillStyle = '#8a94ad';
    ctx.font = '13px sans-serif';
    ctx.fillText('or press ENTER — M mutes sound — R restarts after a catch', C.canvasWidth / 2, 550);
  }

  function drawCaught(ctx) {
    ctx.fillStyle = 'rgba(60, 0, 0, 0.72)';
    ctx.fillRect(0, 0, C.canvasWidth, C.canvasHeight);
    ctx.fillStyle = '#ff5252';
    ctx.font = 'bold 56px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('CAUGHT!', C.canvasWidth / 2, 300);
    ctx.fillStyle = '#fff';
    ctx.font = '20px sans-serif';
    ctx.fillText('The alarm hit 100 and the museum locked down.', C.canvasWidth / 2, 350);
    ctx.fillText('Press R to try the heist again.', C.canvasWidth / 2, 390);
  }

  function drawWin(ctx, score) {
    ctx.fillStyle = 'rgba(6, 20, 10, 0.82)';
    ctx.fillRect(0, 0, C.canvasWidth, C.canvasHeight);
    ctx.fillStyle = '#7fd6a4';
    ctx.font = 'bold 52px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('GETAWAY!', C.canvasWidth / 2, 180);
    ctx.fillStyle = '#e8ecf5';
    ctx.font = '20px sans-serif';
    ctx.fillText('The Meridian Star is yours. The van is already moving.', C.canvasWidth / 2, 224);
    var rows = [
      ['Loot', '$' + score.loot.toLocaleString('en-US')],
      ['Time bonus', '$' + score.timeBonus.toLocaleString('en-US')],
      ['Ghost bonus (never spotted)', '$' + score.ghostBonus.toLocaleString('en-US')],
      ['TOTAL SCORE', '$' + score.total.toLocaleString('en-US')],
    ];
    ctx.font = '20px sans-serif';
    for (var i = 0; i < rows.length; i++) {
      var y = 300 + i * 40;
      ctx.textAlign = 'right';
      ctx.fillStyle = i === rows.length - 1 ? COL.gold : '#e8ecf5';
      if (i === rows.length - 1) ctx.font = 'bold 24px sans-serif';
      ctx.fillText(rows[i][0], C.canvasWidth / 2 - 20, y);
      ctx.textAlign = 'left';
      ctx.fillText(rows[i][1], C.canvasWidth / 2 + 20, y);
    }
    ctx.fillStyle = '#8a94ad';
    ctx.font = '15px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Press R to run it again — faster, quieter, richer.', C.canvasWidth / 2, 500);
  }

  function drawWorld(ctx, state, time) {
    drawFloor(ctx);
    drawLampPools(ctx);
    drawVent(ctx, time);
    drawWallsAndCover(ctx);
    drawExit(ctx, time);
    drawLoot(ctx, time);
    drawGemCase(ctx, time, state.tools.lockpick.active);
    drawToolsLayer(ctx, state.tools);
    drawGuards(ctx, state.guards);
    drawCameras(ctx, state.cameras, time);
    drawThief(ctx, state.thief, time);
    drawLockpickProgress(ctx, state.tools, state.thief);
    drawEdgeGlow(ctx, state.alarm.value);
  }

  function draw(ctx, state, time) {
    ctx.clearRect(0, 0, C.canvasWidth, C.canvasHeight);
    ctx.fillStyle = '#0b0e17';
    ctx.fillRect(0, 0, C.canvasWidth, C.canvasHeight);
    if (state.phase === 'menu') {
      drawWorld(ctx, state, time);
      drawMenu(ctx);
      return;
    }
    drawWorld(ctx, state, time);
    drawHud(ctx, state);
    if (state.alarm.spotted && state.phase === 'playing') drawSpottedBanner(ctx, time);
    if (state.phase === 'caught') drawCaught(ctx);
    if (state.phase === 'win') drawWin(ctx, state.score);
  }

  return {
    draw: draw,
    drawWorld: drawWorld,
  };
})();
