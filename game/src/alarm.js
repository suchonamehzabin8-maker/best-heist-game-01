'use strict';
/* The alarm meter: it rises while any guard or camera sees the thief
   and decays slowly when unseen. Crossing the spotted threshold puts
   up the SPOTTED! warning and starts the grace window — break line of
   sight before the meter fills, or the heist is over. */
var GV = window.GV || (window.GV = {});

GV.alarm = (function () {
  var C = GV.config;

  function createAlarm() {
    return {
      value: 0,
      spotted: false,
      everSpotted: false,
      caught: false,
      /* How long the thief has been seen without a break. */
      seenStreak: 0,
    };
  }

  function updateAlarm(alarm, seen, sneaking, dt) {
    if (seen) {
      var rate = C.alarmRisePerSec * (sneaking ? C.sneakDetectionFactor : 1);
      alarm.value += rate * dt;
      alarm.seenStreak += dt;
      if (alarm.value >= C.spottedThreshold) {
        alarm.spotted = true;
        alarm.everSpotted = true;
      }
    } else {
      alarm.seenStreak = 0;
      alarm.value -= C.alarmDecayPerSec * dt;
      if (alarm.value <= 0) {
        alarm.value = 0;
        alarm.spotted = false;
      } else if (alarm.value < C.spottedThreshold) {
        alarm.spotted = false;
      }
    }
    if (alarm.value >= C.caughtThreshold) {
      alarm.value = C.caughtThreshold;
      alarm.caught = true;
    }
  }

  function resetAlarm(alarm) {
    alarm.value = 0;
    alarm.spotted = false;
    alarm.everSpotted = false;
    alarm.caught = false;
    alarm.seenStreak = 0;
  }

  /* 0 green, 1 red — for the meter's colour and the screen's edge glow. */
  function dangerLevel(alarm) {
    return alarm.value / C.caughtThreshold;
  }

  return {
    createAlarm: createAlarm,
    updateAlarm: updateAlarm,
    resetAlarm: resetAlarm,
    dangerLevel: dangerLevel,
  };
})();
