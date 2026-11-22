'use strict';
/* Sound for The Gilded Vault: every sound is a WebAudio oscillator
   or filtered noise made in code — no audio files. The context is
   created on the first key press so browsers allow it. */
var GV = window.GV || (window.GV = {});

GV.audio = (function () {
  var ctx = null;
  var muted = false;
  var sirenTimer = 0;

  function ensureContext() {
    if (ctx) return ctx;
    try {
      var AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return null;
      ctx = new AC();
    } catch (e) {
      ctx = null;
    }
    return ctx;
  }

  function tone(freq, seconds, type, volume, when) {
    if (muted) return;
    var ac = ensureContext();
    if (!ac) return;
    try {
      var osc = ac.createOscillator();
      var gain = ac.createGain();
      var t = ac.currentTime + (when || 0);
      osc.type = type || 'sine';
      osc.frequency.setValueAtTime(freq, t);
      gain.gain.setValueAtTime(0.0001, t);
      gain.gain.exponentialRampToValueAtTime(volume || 0.12, t + 0.015);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + seconds);
      osc.connect(gain);
      gain.connect(ac.destination);
      osc.start(t);
      osc.stop(t + seconds + 0.05);
    } catch (e) {
      /* Sound is decoration; a failure must never stop the game. */
    }
  }

  function noiseBurst(seconds, volume) {
    if (muted) return;
    var ac = ensureContext();
    if (!ac) return;
    try {
      var len = Math.floor(ac.sampleRate * seconds);
      var buffer = ac.createBuffer(1, len, ac.sampleRate);
      var data = buffer.getChannelData(0);
      for (var i = 0; i < len; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / len);
      var src = ac.createBufferSource();
      src.buffer = buffer;
      var gain = ac.createGain();
      gain.gain.value = volume || 0.08;
      src.connect(gain);
      gain.connect(ac.destination);
      src.start();
    } catch (e) {
      /* Ignore audio failures. */
    }
  }

  return {
    unlock: function () {
      ensureContext();
      if (ctx && ctx.state === 'suspended') ctx.resume();
    },
    toggleMute: function () {
      muted = !muted;
      return muted;
    },
    isMuted: function () {
      return muted;
    },
    footstep: function () {
      noiseBurst(0.05, 0.03);
    },
    pickup: function () {
      tone(660, 0.12, 'triangle', 0.14);
      tone(990, 0.18, 'triangle', 0.14, 0.09);
    },
    lockpickTick: function () {
      tone(1200, 0.04, 'square', 0.05);
    },
    smoke: function () {
      noiseBurst(0.35, 0.1);
    },
    coin: function () {
      tone(2400, 0.06, 'sine', 0.09);
      tone(1800, 0.08, 'sine', 0.07, 0.12);
    },
    spotted: function () {
      tone(220, 0.35, 'sawtooth', 0.12);
      tone(174, 0.4, 'sawtooth', 0.12, 0.12);
    },
    caught: function () {
      tone(160, 0.5, 'sawtooth', 0.16);
      tone(110, 0.8, 'sawtooth', 0.16, 0.3);
    },
    win: function () {
      var notes = [523, 659, 784, 1047];
      for (var i = 0; i < notes.length; i++) tone(notes[i], 0.25, 'triangle', 0.14, i * 0.13);
    },
    /* A low heartbeat tick while the alarm is hot. */
    heartbeat: function (alarmValue, dt) {
      if (alarmValue < 25) return;
      sirenTimer -= dt;
      if (sirenTimer <= 0) {
        tone(70, 0.12, 'sine', 0.16);
        sirenTimer = alarmValue > 60 ? 0.45 : 0.9;
      }
    },
  };
})();
