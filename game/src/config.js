'use strict';
/* The Gilded Vault — tuning numbers for the whole game.
   One place holds every speed, range, rate and score value so the
   game can be balanced without hunting through the other files. */
var GV = window.GV || (window.GV = {});

GV.config = {
  canvasWidth: 1280,
  canvasHeight: 720,
  hudHeight: 56,

  /* The thief. */
  thiefRadius: 13,
  thiefSpeed: 178,
  thiefSneakSpeed: 94,

  /* Guards. */
  guardRadius: 14,
  guardSpeed: 82,
  guardConeRange: 238,
  guardConeHalfAngle: 0.61, // about 35 degrees each side
  guardHearingRadius: 150,

  /* Cameras. */
  cameraConeRange: 268,
  cameraConeHalfAngle: 0.52, // about 30 degrees each side
  cameraSweepPeriod: 4.2,

  /* The alarm meter: 0 quiet, 100 caught. */
  alarmRisePerSec: 44,
  alarmDecayPerSec: 9,
  spottedThreshold: 15, // the SPOTTED! banner appears here
  caughtThreshold: 100,
  sneakDetectionFactor: 0.5, // sneaking halves how fast the alarm rises

  /* Tools. */
  lockpickSeconds: 3,
  lockpickNoiseRadius: 200,
  smokeCount: 3,
  smokeRadius: 96,
  smokeSeconds: 5,
  coinCount: 3,
  coinThrowDistance: 190,
  coinInvestigateSeconds: 4,
  guardInvestigateSeconds: 3.5,

  /* The vent crawl along the top of the gallery: hidden, but slow. */
  ventSpeedFactor: 0.45,

  /* Scoring. */
  gemValue: 50000,
  vaseValue: 8000,
  statueValue: 12000,
  purseValue: 5000,
  ghostBonus: 15000,
  timeBonusPerSec: 50,
  parSeconds: 300,

  /* Colours for the night-gallery look. */
  colours: {
    floorA: '#202636',
    floorB: '#1a1f2e',
    wall: '#2c3247',
    wallTrim: '#8a6d2f',
    gold: '#ffd76a',
    goldDim: '#b98f2e',
    guardCone: 'rgba(96, 165, 250, 0.30)',
    cameraCone: 'rgba(255, 82, 82, 0.26)',
    thief: '#7c5cff',
    guard: '#3b82f6',
    smoke: 'rgba(200, 205, 215, 0.55)',
  },
};
