'use strict';
/* Keyboard and mouse input for The Gilded Vault.
   Keys are tracked by their physical code so WASD and the arrow keys
   both work; the mouse position is kept in canvas coordinates for
   aiming the coin toss and clicking menu buttons. */
var GV = window.GV || (window.GV = {});

GV.input = {
  keys: {},
  mouseX: 640,
  mouseY: 360,
  mouseClicked: false,
  mouseClickX: 0,
  mouseClickY: 0,

  /* A movement vector from the held keys, normalised. */
  moveVector: function () {
    var x = 0;
    var y = 0;
    if (this.keys.KeyA || this.keys.ArrowLeft) x -= 1;
    if (this.keys.KeyD || this.keys.ArrowRight) x += 1;
    if (this.keys.KeyW || this.keys.ArrowUp) y -= 1;
    if (this.keys.KeyS || this.keys.ArrowDown) y += 1;
    if (x !== 0 && y !== 0) {
      var len = Math.sqrt(2);
      x /= len;
      y /= len;
    }
    return { x: x, y: y };
  },

  sneaking: function () {
    return !!this.keys.ShiftLeft || !!this.keys.ShiftRight;
  },

  pressed: function (code) {
    return !!this.keys[code];
  },

  consumeClick: function () {
    if (!this.mouseClicked) return null;
    this.mouseClicked = false;
    return { x: this.mouseClickX, y: this.mouseClickY };
  },

  attach: function (canvas) {
    var self = this;
    window.addEventListener('keydown', function (e) {
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space'].indexOf(e.code) >= 0) {
        e.preventDefault();
      }
      self.keys[e.code] = true;
      if (e.code === 'KeyM') GV.audio.toggleMute();
    });
    window.addEventListener('keyup', function (e) {
      self.keys[e.code] = false;
    });
    window.addEventListener('blur', function () {
      self.keys = {};
    });
    canvas.addEventListener('mousemove', function (e) {
      var rect = canvas.getBoundingClientRect();
      self.mouseX = ((e.clientX - rect.left) / rect.width) * GV.config.canvasWidth;
      self.mouseY = ((e.clientY - rect.top) / rect.height) * GV.config.canvasHeight;
    });
    canvas.addEventListener('mousedown', function (e) {
      var rect = canvas.getBoundingClientRect();
      self.mouseClickX = ((e.clientX - rect.left) / rect.width) * GV.config.canvasWidth;
      self.mouseClickY = ((e.clientY - rect.top) / rect.height) * GV.config.canvasHeight;
      self.mouseClicked = true;
    });
  },
};
