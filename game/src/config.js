// The Gilded Vault — tuning numbers and shared game state.
// Everything the other modules read or write lives on S; CFG never changes.

const CFG = {
  W: 1280,
  H: 720,
  playerRadius: 12,
  walkSpeed: 178,
  sneakSpeed: 96,
  ventSpeed: 72,
  guardRange: 235,
  guardHalfAngle: 0.56, // ~32 degrees each side
  cameraRange: 285,
  cameraHalfAngle: 0.55,
  sneakRangeMul: 0.62, // sneaking shrinks every viewer's range
  alarmRiseGuard: 24, // alarm points per second while a guard sees the thief
  alarmRiseCamera: 19,
  alarmDecay: 7, // alarm points per second while unseen
  graceTime: 1.2, // seconds of "SPOTTED!" warning before the alarm starts rising
  lockpickTime: 3.0,
  lockpickNoise: 300, // guards inside this radius investigate the gem case
  smokeCount: 3,
  smokeRadius: 95,
  smokeTime: 4.5,
  coinCount: 5,
  coinRange: 330,
  gemValue: 50000,
  ghostBonus: 10000,
  timeBonusPerSec: 150,
  timeBonusCap: 240,
};

// Mutable state. main.js owns the loop; the other modules read and mutate S.
const S = {
  state: 'menu', // menu | playing | caught | win
  t: 0, // absolute animation clock (seconds, always advances)
  time: 0, // play time since the heist started (seconds)
  alarm: 0,
  spotted: false, // true once any viewer has held sight past the grace window
  ghost: true, // false once spotted
  grace: 0, // grace window remaining
  graceActive: false,
  wasSeen: false, // was the thief seen on the previous tick (grace opens once per sighting)
  player: { x: 100, y: 620, dir: -Math.PI / 2, moving: false, sneaking: false, inVent: false },
  gemTaken: false,
  lockpick: 0, // 0..1 channel progress
  tools: { smoke: CFG.smokeCount, coins: CFG.coinCount },
  smokes: [], // {x, y, r, ttl}
  coins: [], // thrown coins in flight {x0,y0,x1,y1,t,dur}
  guards: [],
  cameras: [],
  message: '',
  messageT: 0,
  score: null, // {loot, timeBonus, ghostBonus, total, seconds} on win
  frozen: false, // screenshots: render a fixed moment, do not simulate
  shotTime: 0,
  stepAcc: 0,
};
