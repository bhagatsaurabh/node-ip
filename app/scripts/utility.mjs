import { 𝜏 } from "./constants.mjs";

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
const S4 = () => {
  return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
};
export const guid = () => {
  return S4() + S4() + "-" + S4() + "-" + S4() + "-" + S4() + "-" + S4() + S4() + S4();
};
export const checkConnectionToOutput = (node, tree) => {
  // If passed node IS the outputNode, then render.
  if (node.type === "output") {
    return true;
  }
  // If outputNode is not connected anywhere, no need to render.
  for (let rNode of tree) {
    if (rNode.type === "output") {
      if (rNode.inputTerminals[0].connector === null) return false;
    }
  }
  // If no path exists between passed node and outputNode, no need to render.
  let queue = [];
  let currNode;
  queue.push(node);
  while (queue.length) {
    currNode = queue.shift();
    for (let outputTerminal of currNode.outputTerminals) {
      if (outputTerminal.connector !== null) {
        if (outputTerminal.connector.terminalEndNode.type === "output") {
          return true;
        } else {
          queue.push(outputTerminal.connector.terminalEndNode);
        }
      }
    }
  }

  return false;
};
export const distance = (a, b) => {
  return Math.sqrt(Math.pow(b.x - a.x, 2) + Math.pow(b.y - a.y, 2));
};
export const midpoint = (a, b) => ({
  x: (a.x + b.x) / 2,
  y: (a.y + b.y) / 2,
});
export const canConnect = (startType, endType) => {
  if (endType.includes(startType)) return true;
  return false;
};
export const extractChannels = (image) => {
  const [channelR, channelG, channelB] = [
    new ImageData(image.width, image.height),
    new ImageData(image.width, image.height),
    new ImageData(image.width, image.height),
  ];

  for (let i = 0; i < image.data.length; i += 4) {
    channelR.data[i + 0] = image.data[i + 0];
    channelR.data[i + 3] = image.data[i + 3];
    channelR.data[i + 1] = 0;
    channelR.data[i + 2] = 0;

    channelG.data[i + 1] = image.data[i + 1];
    channelG.data[i + 3] = image.data[i + 3];
    channelG.data[i + 0] = 0;
    channelG.data[i + 2] = 0;

    channelB.data[i + 2] = image.data[i + 2];
    channelB.data[i + 3] = image.data[i + 3];
    channelB.data[i + 1] = 0;
    channelB.data[i + 0] = 0;
  }

  return [channelR, channelG, channelB];
};
export const normalize = (val, min, max) => (val - min) / (max - min);
export const getPos = (el, pos) => {
  const rect = el.getBoundingClientRect();
  return {
    x: pos.x - rect.left,
    y: pos.y - rect.top,
  };
};
export const debugPoint = (ctx, { x, y }) => {
  setTimeout(() => {
    ctx.beginPath();
    ctx.arc(x, y, 3, 0, 𝜏);
    ctx.fillStyle = "#f00";
    ctx.fill();
  }, 100);
};
export const debugObject = (ctx, obj) => {
  setTimeout(() => {
    ctx.beginPath();
    ctx.arc(obj.x, obj.y, 3, 0, 𝜏);
    ctx.fillStyle = "#f00";
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(obj.x - obj.width / 2, obj.y);
    ctx.lineTo(obj.x + obj.width / 2, obj.y);
    ctx.strokeStyle = "#f00";
    ctx.lineWidth = "1";
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(obj.x, obj.y - obj.height / 2);
    ctx.lineTo(obj.x, obj.y + obj.height / 2);
    ctx.strokeStyle = "#f00";
    ctx.lineWidth = "1";
    ctx.stroke();
  }, 100);
};
export const debugComponent = (ctx, component) => {
  setTimeout(() => {
    ctx.beginPath();
    ctx.arc(
      component.parent.x - component.parent.width / 2 + component.x,
      component.parent.y - component.parent.height / 2 + component.y,
      3,
      0,
      𝜏
    );
    ctx.fillStyle = "#f00";
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(
      component.parent.x - component.parent.width / 2 + component.x - component.width / 2,
      component.parent.y - component.parent.height / 2 + component.y
    );
    ctx.lineTo(
      component.parent.x - component.parent.width / 2 + component.x + component.width / 2,
      component.parent.y - component.parent.height / 2 + component.y
    );
    ctx.strokeStyle = "#f00";
    ctx.lineWidth = "1";
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(
      component.parent.x - component.parent.width / 2 + component.x,
      component.parent.y - component.parent.height / 2 + component.y - component.height / 2
    );
    ctx.lineTo(
      component.parent.x - component.parent.width / 2 + component.x,
      component.parent.y - component.parent.height / 2 + component.y + component.height / 2
    );
    ctx.strokeStyle = "#f00";
    ctx.lineWidth = "1";
    ctx.stroke();
  }, 100);
};
