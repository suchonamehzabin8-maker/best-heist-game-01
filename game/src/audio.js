// The Gilded Vault — sounds from WebAudio only. No audio files.
// Everything is a short oscillator blip so the game needs no network.

let audioCtx = null;
let sirenNodes = null;

function ensureAudio() {
  if (!anyGesture) return;
  if (!audioCtx) {
    try {
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    } catch (e) {
      audioCtx = null;
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') audioCtx.resume();
}

function tone(freq, dur, type, vol, slideTo) {
  if (!audioCtx) return;
  const t0 = audioCtx.currentTime;
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  osc.type = type || 'sine';
  osc.frequency.setValueAtTime(freq, t0);
  if (slideTo) osc.frequency.exponentialRampToValueAtTime(slideTo, t0 + dur);
  gain.gain.setValueAtTime(vol || 0.08, t0);
  gain.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  osc.connect(gain);
  gain.connect(audioCtx.destination);
  osc.start(t0);
  osc.stop(t0 + dur + 0.02);
}

function playStep() {
  tone(140 + rng() * 40, 0.05, 'triangle', 0.03);
}

function playChime() {
  tone(660, 0.12, 'sine', 0.09);
  setTimeout(() => tone(880, 0.16, 'sine', 0.09), 90);
  setTimeout(() => tone(1320, 0.22, 'sine', 0.08), 190);
}

function playClink() {
  tone(1900, 0.07, 'square', 0.04, 1200);
}

function playSoft() {
  tone(320, 0.35, 'sine', 0.05, 90);
}

function playCaught() {
  tone(220, 0.5, 'sawtooth', 0.1, 55);
  setTimeout(() => tone(165, 0.6, 'sawtooth', 0.1, 50), 180);
}

function playWin() {
  [523, 659, 784, 1047].forEach((f, i) => setTimeout(() => tone(f, 0.25, 'sine', 0.09), i * 130));
}

// A low two-tone siren while the alarm is high; call every frame.
function updateSiren() {
  const on = S.state === 'playing' && S.alarm > 45;
  if (on && !sirenNodes && audioCtx) {
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = 'sine';
    osc.frequency.value = 620;
    gain.gain.value = 0.035;
    const lfo = audioCtx.createOscillator();
    const lfoGain = audioCtx.createGain();
    lfo.frequency.value = 1.6;
    lfoGain.gain.value = 180;
    lfo.connect(lfoGain);
    lfoGain.connect(osc.frequency);
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start();
    lfo.start();
    sirenNodes = { osc, lfo, gain };
  } else if (!on && sirenNodes) {
    try {
      sirenNodes.osc.stop();
      sirenNodes.lfo.stop();
    } catch (e) { /* already stopped */ }
    sirenNodes = null;
  }
}
