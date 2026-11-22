'use strict';
/* The security cameras: wall-mounted, sweeping their red cones on a
   timer. A camera that spots the thief feeds the alarm just like a
   guard does. */
var GV = window.GV || (window.GV = {});

GV.cameras = (function () {
  var C = GV.config;

  function makeCamera(x, y, baseAngle, phase) {
    return {
      x: x,
      y: y,
      baseAngle: baseAngle,
      sweepHalfAngle: 0.75,
      phase: phase,
      angle: baseAngle,
      blink: 0,
    };
  }

  function createCameras() {
    return [
      makeCamera(1252, 250, Math.PI, 0),
      makeCamera(1252, 540, Math.PI, 1.7),
    ];
  }

  function updateCameras(cameras, time) {
    for (var i = 0; i < cameras.length; i++) {
      var cam = cameras[i];
      var t = (time / C.cameraSweepPeriod) * Math.PI * 2 + cam.phase;
      cam.angle = cam.baseAngle + Math.sin(t) * cam.sweepHalfAngle;
      cam.blink = (Math.sin(time * 5 + i * 2) + 1) / 2;
    }
  }

  /* Can this camera see the thief right now? */
  function cameraSeesThief(cam, thiefX, thiefY, inSmoke, inVent) {
    if (inVent || inSmoke) return false;
    var dx = thiefX - cam.x;
    var dy = thiefY - cam.y;
    var dist = Math.sqrt(dx * dx + dy * dy);
    if (dist > C.cameraConeRange) return false;
    if (GV.guards.angleDiff(Math.atan2(dy, dx), cam.angle) > C.cameraConeHalfAngle) return false;
    return !GV.world.lineBlocked(cam.x, cam.y, thiefX, thiefY);
  }

  return {
    createCameras: createCameras,
    updateCameras: updateCameras,
    cameraSeesThief: cameraSeesThief,
  };
})();
