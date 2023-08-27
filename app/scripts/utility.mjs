export const init = () => {
  CanvasRenderingContext2D.prototype.roundRect = function (x, y, width, height, radius) {
    if (typeof radius === "undefined") {
      radius = 5;
    }
    this.beginPath();
    this.moveTo(x - width / 2 + radius, y - height / 2);
    this.lineTo(x - width / 2 + width - radius, y - height / 2);
    this.quadraticCurveTo(
      x - width / 2 + width,
      y - height / 2,
      x - width / 2 + width,
      y - height / 2 + radius
    );
    this.lineTo(x - width / 2 + width, y - height / 2 + height - radius);
    this.quadraticCurveTo(
      x - width / 2 + width,
      y - height / 2 + height,
      x - width / 2 + width - radius,
      y - height / 2 + height
    );
    this.lineTo(x - width / 2 + radius, y - height / 2 + height);
    this.quadraticCurveTo(
      x - width / 2,
      y - height / 2 + height,
      x - width / 2,
      y - height / 2 + height - radius
    );
    this.lineTo(x - width / 2, y - height / 2 + radius);
    this.quadraticCurveTo(x - width / 2, y - height / 2, x - width / 2 + radius, y - height / 2);
    this.closePath();
  };

  CanvasRenderingContext2D.prototype.roundUpperRect = function (x, y, width, height, radius) {
    if (typeof radius === "undefined") {
      radius = 5;
    }
    this.beginPath();
    this.moveTo(x - width / 2 + radius, y - height / 2);
    this.lineTo(x + width / 2 - radius, y - height / 2);
    this.quadraticCurveTo(x + width / 2, y - height / 2, x + width / 2, y - height / 2 + radius);
    this.lineTo(x + width / 2, y - height / 2 + height - radius);
    this.lineTo(x - width / 2, y - height / 2 + height - radius);
    this.lineTo(x - width / 2, y - height / 2 + radius);
    this.quadraticCurveTo(x - width / 2, y - height / 2, x - width / 2 + radius, y - height / 2);
    this.closePath();
  };
};

export const refOne = (query) => document.querySelector(query);
export const refAll = (query) => document.querySelectorAll(query);
export const isInRange = (val, min, max) => {
  if (val > min && val < max) return true;
  return false;
};
export const throttle = (cb, delay) => {
  let timerHandle, args;
  const throttled = (...a) => {
    args = a;
    if (!timerHandle) {
      cb(...args);
      args = null;
      timerHandle = setTimeout(() => {
        timerHandle = null;
        if (args) {
          throttled(...args);
        }
      }, delay);
    }
  };
  return throttled;
};
