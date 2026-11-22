// The Gilded Vault — the room: walls, display cases, the vent crawl,
// the gem case, the getaway door, and the geometry helpers (collision,
// line of sight) every other module uses.

// Room bounds (the outer walls form a rectangle).
const ROOM = { x: 40, y: 40, w: 1200, h: 640 };

// Display cases: solid cover that blocks movement AND sight.
const CASES = [
  { x: 300, y: 180, w: 140, h: 70, label: 'Egypt' },
  { x: 760, y: 180, w: 140, h: 70, label: 'Rome' },
  { x: 300, y: 420, w: 140, h: 70, label: 'Jade' },
  { x: 760, y: 420, w: 140, h: 70, label: 'Silk' },
  { x: 560, y: 300, w: 160, h: 60, label: 'Crown' },
  { x: 1050, y: 420, w: 90, h: 110, label: 'Masks' },
];

// The vent crawl: a duct along the top wall. Inside it the thief is hidden
// and slow. Its lower wall has a gap at each end; the left gap is a one-way
// hatch (you can crawl in, but you cannot crawl back out through it).
const VENT = { x: 120, y: 52, w: 440, h: 34 };
const VENT_ENTRY = { x: 120, y: 86, w: 50, h: 10 }; // left gap (one-way in)
const VENT_EXIT = { x: 510, y: 86, w: 50, h: 10 }; // right gap (out, by the gem)
// The solid stretch of the vent's lower wall between the two gaps.
const VENT_WALL = { x: 170, y: 86, w: 340, h: 10 };

// The gem case (glass, locked) and the gem itself.
const GEM_CASE = { x: 600, y: 96, w: 80, h: 54 };
const GEM = { x: 640, y: 123 };

// The getaway door, on the right wall near the bottom.
const EXIT = { x: 1200, y: 600, w: 40, h: 80 };

// Where the thief starts: the service entrance, bottom-left.
const START = { x: 100, y: 620 };

// Warm lamp pools (visual only).
const LAMPS = [
  { x: 320, y: 150 },
  { x: 960, y: 150 },
  { x: 320, y: 560 },
  { x: 960, y: 560 },
];

// ---- geometry -------------------------------------------------------------

function pointInRect(x, y, r) {
  return x >= r.x && x <= r.x + r.w && y >= r.y && y <= r.y + r.h;
}

function circleHitsRect(cx, cy, cr, r) {
  const nx = Math.max(r.x, Math.min(cx, r.x + r.w));
  const ny = Math.max(r.y, Math.min(cy, r.y + r.h));
  const dx = cx - nx;
  const dy = cy - ny;
  return dx * dx + dy * dy < cr * cr;
}

// All solid rectangles for a given moment. The vent's one-way hatch is solid
// only while the thief is inside the duct (so you cannot slip back out the
// way you came in); the vent wall and the duct's far side are always solid
// from the room side because the duct is entered through its gaps.
function solidRects() {
  const rects = [
    // Outer walls (as four bars, so the doorway gaps are real openings).
    { x: ROOM.x - 14, y: ROOM.y - 14, w: ROOM.w + 28, h: 14 }, // top
    { x: ROOM.x - 14, y: ROOM.y + ROOM.h, w: ROOM.w + 28, h: 14 }, // bottom
    { x: ROOM.x - 14, y: ROOM.y, w: 14, h: ROOM.h }, // left
    { x: ROOM.x + ROOM.w, y: ROOM.y, w: 14, h: ROOM.h }, // right
    VENT_WALL,
    GEM_CASE,
  ];
  for (const c of CASES) rects.push(c);
  if (S.player.inVent) rects.push({ x: VENT_ENTRY.x, y: VENT_ENTRY.y, w: VENT_ENTRY.w, h: VENT_ENTRY.h });
  return rects;
}

// Rectangles that block a viewer's line of sight.
function losBlockers() {
  const rects = [GEM_CASE];
  for (const c of CASES) rects.push(c);
  rects.push(VENT_WALL);
  return rects;
}

// Move a circle (the thief) by (dx, dy) with sliding along solids.
function moveCircle(p, dx, dy) {
  const r = CFG.playerRadius;
  let nx = p.x + dx;
  let ny = p.y + dy;
  const solids = solidRects();
  // X axis first, then Y, so the thief slides along walls.
  let blocked = false;
  for (const s of solids) {
    if (circleHitsRect(nx, p.y, r, s)) { blocked = true; break; }
  }
  if (!blocked) p.x = nx;
  blocked = false;
  for (const s of solids) {
    if (circleHitsRect(p.x, ny, r, s)) { blocked = true; break; }
  }
  if (!blocked) p.y = ny;
}

// Whether a point is inside the vent duct (hidden, slow).
function inVentAt(x, y) {
  return pointInRect(x, y, VENT);
}

// Segment (x1,y1)-(x2,y2) against one rectangle: true when it crosses it.
function segmentHitsRect(x1, y1, x2, y2, r) {
  if (pointInRect(x1, y1, r) || pointInRect(x2, y2, r)) return true;
  const edges = [
    [r.x, r.y, r.x + r.w, r.y],
    [r.x + r.w, r.y, r.x + r.w, r.y + r.h],
    [r.x + r.w, r.y + r.h, r.x, r.y + r.h],
    [r.x, r.y + r.h, r.x, r.y],
  ];
  for (const [ax, ay, bx, by] of edges) {
    if (segmentsCross(x1, y1, x2, y2, ax, ay, bx, by)) return true;
  }
  return false;
}

function segmentsCross(x1, y1, x2, y2, x3, y3, x4, y4) {
  const d1 = (x4 - x3) * (y1 - y3) - (y4 - y3) * (x1 - x3);
  const d2 = (x4 - x3) * (y2 - y3) - (y4 - y3) * (x2 - x3);
  const d3 = (x2 - x1) * (y3 - y1) - (y2 - y1) * (x3 - x1);
  const d4 = (x2 - x1) * (y4 - y1) - (y2 - y1) * (x4 - x1);
  return ((d1 > 0 && d2 < 0) || (d1 < 0 && d2 > 0)) && ((d3 > 0 && d4 < 0) || (d3 < 0 && d4 > 0));
}

// Is the view from (x1,y1) to (x2,y2) clear of cases and the vent wall?
function losClear(x1, y1, x2, y2) {
  for (const r of losBlockers()) {
    if (segmentHitsRect(x1, y1, x2, y2, r)) return false;
  }
  return true;
}

// Does the view cross a smoke cloud? A cloud blocks sight through it.
function blockedBySmoke(x1, y1, x2, y2) {
  for (const s of S.smokes) {
    if (segmentHitsCircle(x1, y1, x2, y2, s.x, s.y, s.r)) return true;
  }
  return false;
}

function segmentHitsCircle(x1, y1, x2, y2, cx, cy, cr) {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const len2 = dx * dx + dy * dy;
  let t = len2 === 0 ? 0 : ((cx - x1) * dx + (cy - y1) * dy) / len2;
  t = Math.max(0, Math.min(1, t));
  const px = x1 + t * dx;
  const py = y1 + t * dy;
  const ddx = px - cx;
  const ddy = py - cy;
  return ddx * ddx + ddy * ddy < cr * cr;
}

// Angle difference wrapped to [-PI, PI].
function angleDiff(a, b) {
  let d = a - b;
  while (d > Math.PI) d -= Math.PI * 2;
  while (d < -Math.PI) d += Math.PI * 2;
  return d;
}
