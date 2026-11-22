// The Gilded Vault — all canvas drawing: the dark gallery, warm lamp
// pools, guard and camera cones, the glowing gem, the thief, and the HUD.

let ctx = null;

function initRender(canvas) {
  ctx = canvas.getContext('2d');
}

function drawCone(x, y, dir, halfAngle, range, color) {
  ctx.save();
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.arc(x, y, range, dir - halfAngle, dir + halfAngle);
  ctx.closePath();
  ctx.fillStyle = color;
  ctx.fill();
  ctx.restore();
}

function drawRoom() {
  // Floor: dark gallery with a faint tile grid.
  ctx.fillStyle = '#141824';
  ctx.fillRect(0, 0, CFG.W, CFG.H);
  ctx.strokeStyle = 'rgba(255,255,255,0.045)';
  ctx.lineWidth = 1;
  for (let x = ROOM.x; x <= ROOM.x + ROOM.w; x += 60) {
    ctx.beginPath(); ctx.moveTo(x, ROOM.y); ctx.lineTo(x, ROOM.y + ROOM.h); ctx.stroke();
  }
  for (let y = ROOM.y; y <= ROOM.y + ROOM.h; y += 60) {
    ctx.beginPath(); ctx.moveTo(ROOM.x, y); ctx.lineTo(ROOM.x + ROOM.w, y); ctx.stroke();
  }

  // Warm pools of light under the lamps.
  for (const lamp of LAMPS) {
    const g = ctx.createRadialGradient(lamp.x, lamp.y, 10, lamp.x, lamp.y, 150);
    g.addColorStop(0, 'rgba(255,196,110,0.20)');
    g.addColorStop(1, 'rgba(255,196,110,0)');
    ctx.fillStyle = g;
    ctx.fillRect(lamp.x - 150, lamp.y - 150, 300, 300);
    ctx.fillStyle = '#ffd98f';
    ctx.beginPath(); ctx.arc(lamp.x, lamp.y, 5, 0, Math.PI * 2); ctx.fill();
  }

  // Walls: dark stone with a gold trim line.
  ctx.fillStyle = '#2a2f42';
  ctx.fillRect(ROOM.x - 14, ROOM.y - 14, ROOM.w + 28, 14);
  ctx.fillRect(ROOM.x - 14, ROOM.y + ROOM.h, ROOM.w + 28, 14);
  ctx.fillRect(ROOM.x - 14, ROOM.y, 14, ROOM.h);
  ctx.fillRect(ROOM.x + ROOM.w, ROOM.y, 14, ROOM.h);
  ctx.strokeStyle = '#8a6d2f';
  ctx.lineWidth = 2;
  ctx.strokeRect(ROOM.x - 14, ROOM.y - 14, ROOM.w + 28, ROOM.h + 28);

  // The vent duct along the top wall, with grate slats.
  ctx.fillStyle = '#0b0d13';
  ctx.fillRect(VENT.x, VENT.y, VENT.w, VENT.h);
  ctx.strokeStyle = '#3d4459';
  ctx.lineWidth = 2;
  ctx.strokeRect(VENT.x, VENT.y, VENT.w, VENT.h);
  ctx.strokeStyle = 'rgba(140,150,180,0.5)';
  ctx.lineWidth = 1;
  for (let x = VENT.x + 14; x < VENT.x + VENT.w; x += 18) {
    ctx.beginPath(); ctx.moveTo(x, VENT.y + 4); ctx.lineTo(x, VENT.y + VENT.h - 4); ctx.stroke();
  }
  ctx.fillStyle = '#9fb4d8';
  ctx.font = 'bold 11px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('VENT', VENT.x + VENT.w / 2, VENT.y + VENT.h - 22);

  // Display cases: glass tops, gold frames, labels.
  for (const c of CASES) {
    ctx.fillStyle = '#1d2334';
    ctx.fillRect(c.x, c.y, c.w, c.h);
    ctx.strokeStyle = '#8a6d2f';
    ctx.lineWidth = 2;
    ctx.strokeRect(c.x, c.y, c.w, c.h);
    ctx.fillStyle = 'rgba(160,200,255,0.10)';
    ctx.fillRect(c.x + 4, c.y + 4, c.w - 8, c.h - 8);
    ctx.strokeStyle = 'rgba(255,255,255,0.25)';
    ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(c.x + 6, c.y + c.h - 6); ctx.lineTo(c.x + c.w - 20, c.y + 6); ctx.stroke();
    ctx.fillStyle = '#c8b273';
    ctx.font = 'bold 11px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(c.label.toUpperCase(), c.x + c.w / 2, c.y + c.h / 2 + 4);
  }

  // The gem case and the glowing Meridian Star.
  ctx.fillStyle = '#232a3d';
  ctx.fillRect(GEM_CASE.x, GEM_CASE.y, GEM_CASE.w, GEM_CASE.h);
  ctx.strokeStyle = S.gemTaken ? '#3d4459' : '#ffd34d';
  ctx.lineWidth = 2;
  ctx.strokeRect(GEM_CASE.x, GEM_CASE.y, GEM_CASE.w, GEM_CASE.h);
  if (!S.gemTaken) {
    const pulse = 0.55 + 0.35 * Math.sin(S.t * 3);
    const g = ctx.createRadialGradient(GEM.x, GEM.y, 2, GEM.x, GEM.y, 70);
    g.addColorStop(0, `rgba(255,211,77,${0.5 * pulse})`);
    g.addColorStop(1, 'rgba(255,211,77,0)');
    ctx.fillStyle = g;
    ctx.fillRect(GEM.x - 70, GEM.y - 70, 140, 140);
    ctx.save();
    ctx.translate(GEM.x, GEM.y);
    ctx.rotate(Math.PI / 4);
    ctx.fillStyle = '#ffe27a';
    ctx.fillRect(-11, -11, 22, 22);
    ctx.fillStyle = '#fff6c8';
    ctx.fillRect(-6, -6, 12, 12);
    ctx.restore();
    ctx.fillStyle = '#ffd34d';
    ctx.font = 'bold 11px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('MERIDIAN STAR', GEM.x, GEM_CASE.y + GEM_CASE.h + 16);
  } else {
    ctx.fillStyle = '#5a6278';
    ctx.font = 'bold 11px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('EMPTY CASE', GEM.x, GEM_CASE.y + GEM_CASE.h + 16);
  }

  // Lockpick progress ring over the gem case.
  if (S.lockpick > 0 && !S.gemTaken) {
    ctx.strokeStyle = '#ffd34d';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(GEM.x, GEM.y, 30, -Math.PI / 2, -Math.PI / 2 + S.lockpick * Math.PI * 2);
    ctx.stroke();
  }

  // The getaway door: gold when the gem is taken, grey before.
  ctx.fillStyle = S.gemTaken ? '#8a6d2f' : '#3a3f52';
  ctx.fillRect(EXIT.x, EXIT.y, EXIT.w, EXIT.h);
  ctx.strokeStyle = S.gemTaken ? '#ffd34d' : '#5a6278';
  ctx.lineWidth = 3;
  ctx.strokeRect(EXIT.x, EXIT.y, EXIT.w, EXIT.h);
  ctx.fillStyle = S.gemTaken ? '#ffe27a' : '#9aa2b5';
  ctx.font = 'bold 12px sans-serif';
  ctx.textAlign = 'center';
  ctx.save();
  ctx.translate(EXIT.x + EXIT.w / 2, EXIT.y + EXIT.h / 2);
  ctx.rotate(-Math.PI / 2);
  ctx.fillText('GETAWAY', 0, 4);
  ctx.restore();

  // Start marker.
  ctx.fillStyle = 'rgba(255,255,255,0.35)';
  ctx.font = 'bold 11px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('SERVICE ENTRANCE', START.x + 40, START.y + 34);
}

function drawGuards() {
  for (const g of S.guards) {
    const dir = guardConeDir(g);
    const alert = g.investigate ? 'rgba(255,170,60,0.20)' : 'rgba(90,160,255,0.20)';
    drawCone(g.x, g.y, dir, CFG.guardHalfAngle, CFG.guardRange, alert);
    // Guard body: dark uniform, cap, facing tick.
    ctx.fillStyle = '#20263a';
    ctx.beginPath(); ctx.arc(g.x, g.y, 13, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = '#7fa8e8';
    ctx.lineWidth = 2;
    ctx.beginPath(); ctx.arc(g.x, g.y, 13, 0, Math.PI * 2); ctx.stroke();
    ctx.fillStyle = '#7fa8e8';
    ctx.beginPath(); ctx.arc(g.x + Math.cos(dir) * 9, g.y + Math.sin(dir) * 9, 4, 0, Math.PI * 2); ctx.fill();
    if (g.investigate) {
      ctx.fillStyle = '#ffb03a';
      ctx.font = 'bold 18px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('?', g.x, g.y - 20);
    }
  }
}

function drawCameras() {
  for (const c of S.cameras) {
    const dir = cameraDir(c);
    drawCone(c.x, c.y, dir, CFG.cameraHalfAngle, CFG.cameraRange, 'rgba(255,70,70,0.16)');
    // Wall mount + lens.
    ctx.fillStyle = '#2a2f42';
    ctx.fillRect(c.x - 9, c.y - 7, 18, 14);
    ctx.strokeStyle = '#c05a5a';
    ctx.lineWidth = 2;
    ctx.strokeRect(c.x - 9, c.y - 7, 18, 14);
    ctx.fillStyle = '#ff5a5a';
    ctx.beginPath(); ctx.arc(c.x + Math.cos(dir) * 11, c.y + Math.sin(dir) * 11, 3.5, 0, Math.PI * 2); ctx.fill();
    // Blinking light.
    if (Math.sin(S.t * 4 + c.phase) > 0) {
      ctx.fillStyle = '#ff2020';
      ctx.beginPath(); ctx.arc(c.x, c.y - 11, 2.5, 0, Math.PI * 2); ctx.fill();
    }
  }
}

function drawPlayer() {
  const p = S.player;
  // Smoke clouds first (they sit over the floor, under the thief).
  for (const s of S.smokes) {
    ctx.fillStyle = `rgba(180,185,200,${0.35 * Math.min(1, s.ttl)})`;
    ctx.beginPath(); ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = `rgba(200,205,220,${0.25 * Math.min(1, s.ttl)})`;
    ctx.beginPath(); ctx.arc(s.x - 20, s.y + 12, s.r * 0.6, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(s.x + 22, s.y - 10, s.r * 0.55, 0, Math.PI * 2); ctx.fill();
  }
  // Thrown coins in flight.
  for (const c of S.coins) {
    const k = c.landed ? 1 : c.t / c.dur;
    const x = c.x0 + (c.x1 - c.x0) * k;
    const y = c.y0 + (c.y1 - c.y0) * k - (c.landed ? 0 : Math.sin(k * Math.PI) * 26);
    ctx.fillStyle = '#ffd34d';
    ctx.beginPath(); ctx.arc(x, y, 4, 0, Math.PI * 2); ctx.fill();
  }
  // The thief: a hooded figure, gold-trimmed; dimmer while sneaking.
  ctx.save();
  if (p.sneaking) ctx.globalAlpha = 0.75;
  if (p.inVent) ctx.globalAlpha = 0.55;
  ctx.fillStyle = '#101018';
  ctx.beginPath(); ctx.arc(p.x, p.y, CFG.playerRadius, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = '#e8c96a';
  ctx.lineWidth = 2;
  ctx.beginPath(); ctx.arc(p.x, p.y, CFG.playerRadius, 0, Math.PI * 2); ctx.stroke();
  ctx.fillStyle = '#e8c96a';
  ctx.beginPath(); ctx.arc(p.x + Math.cos(p.dir) * 7, p.y + Math.sin(p.dir) * 7, 3.5, 0, Math.PI * 2); ctx.fill();
  ctx.restore();
  // Edge glow when a cone is close (tension cue).
  if (S.state === 'playing' && S.nearCone) {
    ctx.strokeStyle = 'rgba(255,80,80,0.35)';
    ctx.lineWidth = 5;
    ctx.strokeRect(3, 3, CFG.W - 6, CFG.H - 6);
  }
}

function drawHUD() {
  // Top bar.
  ctx.fillStyle = 'rgba(8,10,16,0.72)';
  ctx.fillRect(0, 0, CFG.W, 36);
  ctx.fillStyle = '#e8e4d8';
  ctx.font = 'bold 15px sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText(S.gemTaken ? 'GET TO THE GETAWAY DOOR' : 'STEAL THE MERIDIAN STAR', 14, 23);
  ctx.textAlign = 'right';
  const mm = Math.floor(S.time / 60);
  const ss = Math.floor(S.time % 60).toString().padStart(2, '0');
  ctx.fillText(`${mm}:${ss}`, CFG.W - 14, 23);

  // Alarm meter, top center.
  const aw = 320;
  const ax = (CFG.W - aw) / 2;
  ctx.fillStyle = '#20242f';
  ctx.fillRect(ax, 10, aw, 16);
  const alarmColor = S.alarm > 70 ? '#ff3b30' : S.alarm > 30 ? '#ff9500' : '#ffd34d';
  ctx.fillStyle = alarmColor;
  ctx.fillRect(ax, 10, aw * (S.alarm / 100), 16);
  ctx.strokeStyle = '#5a6278';
  ctx.lineWidth = 1;
  ctx.strokeRect(ax, 10, aw, 16);
  ctx.fillStyle = '#e8e4d8';
  ctx.font = 'bold 11px sans-serif';
  ctx.textAlign = 'right';
  ctx.fillText('ALARM', ax - 10, 23);
  ctx.textAlign = 'left';

  // Tool counts, bottom-left.
  ctx.fillStyle = 'rgba(8,10,16,0.72)';
  ctx.fillRect(10, CFG.H - 40, 300, 30);
  ctx.fillStyle = '#e8e4d8';
  ctx.font = '13px sans-serif';
  ctx.fillText(`Smoke [Q]: ${S.tools.smoke}    Coin [F/click]: ${S.tools.coins}    Sneak [Shift]    Lockpick [hold E]`, 18, CFG.H - 20);

  // Gem status, bottom-right.
  ctx.fillStyle = 'rgba(8,10,16,0.72)';
  ctx.fillRect(CFG.W - 220, CFG.H - 40, 210, 30);
  ctx.fillStyle = S.gemTaken ? '#ffd34d' : '#9aa2b5';
  ctx.font = 'bold 13px sans-serif';
  ctx.textAlign = 'right';
  ctx.fillText(S.gemTaken ? '◆ MERIDIAN STAR ✓' : '◇ MERIDIAN STAR', CFG.W - 22, CFG.H - 20);
  ctx.textAlign = 'left';

  // Transient message.
  if (S.messageT > 0 && S.message) {
    ctx.fillStyle = 'rgba(8,10,16,0.78)';
    const w = ctx.measureText(S.message).width + 28;
    ctx.fillRect((CFG.W - w) / 2, 52, w, 30);
    ctx.fillStyle = '#ffd34d';
    ctx.font = 'bold 15px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(S.message, CFG.W / 2, 72);
    ctx.textAlign = 'left';
  }

  // SPOTTED warning banner.
  if (S.graceActive) {
    ctx.fillStyle = 'rgba(255,40,30,0.85)';
    ctx.fillRect(0, 92, CFG.W, 40);
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 24px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('SPOTTED! BREAK LINE OF SIGHT!', CFG.W / 2, 120);
    ctx.textAlign = 'left';
  }
}

function drawScreen(title, lines, accent) {
  ctx.fillStyle = 'rgba(6,8,14,0.88)';
  ctx.fillRect(0, 0, CFG.W, CFG.H);
  ctx.fillStyle = accent;
  ctx.font = 'bold 64px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(title, CFG.W / 2, 240);
  ctx.fillStyle = '#e8e4d8';
  ctx.font = '18px sans-serif';
  lines.forEach((line, i) => {
    ctx.fillText(line, CFG.W / 2, 300 + i * 32);
  });
  ctx.textAlign = 'left';
}

function render() {
  ctx.clearRect(0, 0, CFG.W, CFG.H);
  drawRoom();
  drawCameras();
  drawGuards();
  drawPlayer();
  if (S.state === 'playing') drawHUD();
  if (S.state === 'menu') {
    drawScreen('THE GILDED VAULT', [
      'A museum at night. One gem. Three guards. Two cameras.',
      '',
      'WASD / arrows — move      Shift — sneak (slower, harder to see)',
      'Hold E by the gem case — pick the lock (3s, makes noise)',
      'Q — smoke pellet (blocks sight)      F / click — toss a coin (distracts a guard)',
      'Crawl the vent along the top wall to slip past unseen — it is slow, and one-way.',
      'Grab the Meridian Star, then reach the GETAWAY door.',
      '',
      'Press ENTER or click to begin.',
    ], '#ffd34d');
  } else if (S.state === 'caught') {
    drawScreen('CAUGHT!', [
      'The alarm hit 100 and the gallery doors slammed shut.',
      'The Meridian Star stays in its case — this time.',
      '',
      'Press R to try again.',
    ], '#ff3b30');
  } else if (S.state === 'win' && S.score) {
    const s = S.score;
    drawScreen('GETAWAY!', [
      `Loot: $${s.loot.toLocaleString('en-US')} — the Meridian Star is yours.`,
      `Time bonus: $${s.timeBonus.toLocaleString('en-US')} (${s.seconds}s).`,
      s.ghostBonus > 0 ? `Ghost bonus: $${s.ghostBonus.toLocaleString('en-US')} — never spotted.` : 'Ghost bonus: $0 — you were spotted.',
      '',
      `TOTAL SCORE: $${s.total.toLocaleString('en-US')}`,
      '',
      'Press R to run it again.',
    ], '#ffd34d');
  }
}
