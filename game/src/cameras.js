// The Gilded Vault — wall-mounted security cameras: fixed positions,
// sweeping red cones on a timer.

function makeCameras() {
  return [
    {
      name: 'Cam 1',
      x: 1212,
      y: 300,
      base: Math.PI, // faces left, down the side corridor
      amp: 0.85,
      period: 6,
      phase: 0,
    },
    {
      name: 'Cam 2',
      x: 180,
      y: 58,
      base: Math.PI / 3, // faces down-right, over the entrance hall
      amp: 0.7,
      period: 8,
      phase: 2.1,
    },
  ];
}

function cameraDir(c) {
  return c.base + c.amp * Math.sin((S.t * Math.PI * 2) / c.period + c.phase);
}

function cameraSees(c) {
  const p = S.player;
  if (p.inVent) return false;
  const dx = p.x - c.x;
  const dy = p.y - c.y;
  const d = Math.hypot(dx, dy);
  const range = CFG.cameraRange * (p.sneaking ? CFG.sneakRangeMul : 1);
  if (d > range) return false;
  const ang = Math.atan2(dy, dx);
  if (Math.abs(angleDiff(ang, cameraDir(c))) > CFG.cameraHalfAngle) return false;
  if (!losClear(c.x, c.y, p.x, p.y)) return false;
  if (blockedBySmoke(c.x, c.y, p.x, p.y)) return false;
  return true;
}
