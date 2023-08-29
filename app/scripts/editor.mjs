import {
  dimensions,
  gSFactor,
  globalFontSize,
  globalRadius,
  globalTerminalRadius,
  unit,
  globalBaseHeight,
  globalConnectorBezierOffset,
  globalConnectorWidth,
  globalOutlineWidth,
  globalScaleRatio,
  selectedNodes,
  terminalStartFlag,
  currentConnector,
  wasDragging,
  setGlobalScaleRatio,
  setSelectedNodes,
  redraw,
  setWasDragging,
  ctx,
} from "./state/editor.mjs";
import { nodes } from "./state/nodes.mjs";
import { connectors } from "./state/connectors.mjs";
import { 𝜏 } from "./constants.mjs";

const downScaleStep = 0.9;
const upScaleStep = 1.1;
let shiftStatus = false;
let nodeDragFlag = 0;
let currentDragNode = null;
let dragDelta = { x: 0, y: 0 };
let sliderDragFlag = 0;
let currSlider = null;

let panStart = { x: 0, y: 0 };
let panDelta = { x: 0, y: 0 };
let panFlag = 0;

/* let currNodeInContextMenu = null;
let currentContextMenu = null;
let isContextMenuOpened = false; */

let mousePos = { x: 0, y: 0 };

const pushOutputNode = () => {
  const width = dimensions.x * 0.2 * globalScaleRatio;
  nodes.push(
    new OutputNode(
      dimensions.x / 2 - width / 2,
      dimensions.y / 2,
      width,
      nodes.length,
      unit * 1.5,
      unit * 0.7
    )
  );
  redraw();
};
pushOutputNode();

const editorCanvas = refOne("#editorCanvas");
editorCanvas.addEventListener("keydown", (e) => {
  if (!shiftStatus && e.code === "ShiftLeft") {
    shiftStatus = true;
  }
});
editorCanvas.addEventListener("keyup", (e) => {
  if (e.code === "ShiftLeft") {
    shiftStatus = false;
  }
});
editorCanvas.addEventListener("dragover", (e) => e.preventDefault());
editorCanvas.addEventListener("drop", (e) => {
  e.preventDefault();
  setGlobalScaleRatio(nodes.length > 0 ? nodes[0].node.scaleRatio : 1);

  handleDrop(e.dataTransfer.getData("new-node"), { x: e.clientX, y: e.clientY });
});
editorCanvas.addEventListener("click", (e) => {
  const pos = getPos(editorCanvas, { x: e.clientX, y: e.clientY });
  const node = getNodeFromPos(pos);
  if (!node) {
    setSelectedNodes([]);
    redraw(true);
  } else {
    node.clicked(pos);
    if (wasDragging) setWasDragging(false);
  }
});
editorCanvas.addEventListener("mousedown", (event) => {
  if (event.which == 1) {
    var pos = getPos(editorCanvas, event);
    var node = getNodeFromPos(pos);
    var slider = null;
    if (node != null) slider = node.node.checkSliderBounds(pos);
    if (slider != null) {
      currSlider = slider;
      sliderDragFlag = 1;
    } else if (node != null && nodeDragFlag == 0 && typeof node != "undefined") {
      nodeDragFlag = 1;
      if (shiftStatus) {
        selectedNodes.push(node.node);
      } else {
        selectedNodes = [];
        selectedNodes.push(node.node);
      }

      var order = node.node.order;
      node.node.order = nodes[nodes.length - 1].node.order;
      nodes[nodes.length - 1].node.order = order;

      var index = nodes.indexOf(node);
      nodes[index] = nodes[nodes.length - 1];
      nodes[nodes.length - 1] = node;

      redraw(true);

      currentDragNode = node;
      dragDelta.x = currentDragNode.node.x - pos.x;
      dragDelta.y = currentDragNode.node.y - pos.y;
    } else {
      panStart.x = pos.x;
      panStart.y = pos.y;
      panFlag = 1;
    }
  }
});
editorCanvas.addEventListener("mousemove", (event) => {
  mousePos = getPos(editorCanvas, event);
  if (currentDragNode != null && sliderDragFlag == 0) {
    currentDragNode.node.x = mousePos.x + dragDelta.x;
    currentDragNode.node.y = mousePos.y + dragDelta.y;
    redraw(true);
    wasDragging = true;
  }
  if (panFlag == 1) {
    panDelta.x = mousePos.x - panStart.x;
    panDelta.y = mousePos.y - panStart.y;
    panStart.x = mousePos.x;
    panStart.y = mousePos.y;

    redrawWithDelta(panDelta);
  }
  if (terminalStartFlag == 1) {
    context.clearRect(0, 0, dimensions.x, dimensions.y);
    currentConnector.draw(mousePos.x, mousePos.y);
    redraw(false);
  }
  if (sliderDragFlag == 1) {
    currSlider.slide(mousePos.x);
    redraw(true);
  }
});
editorCanvas.addEventListener("mouseup", (event) => {
  var pos = getPos(editorCanvas, event);

  if (nodeDragFlag == 1) {
    currentDragNode = null;
    nodeDragFlag = 0;
  } else if (panFlag == 1) {
    panFlag = 0;
    panDelta.x = panDelta.y = panStart.x = panStart.y = 0;
  } else if (sliderDragFlag == 1) {
    sliderDragFlag = 0;
    var baseNode = currSlider.parent;
    while (!Array.isArray(baseNode.inputTerminals)) {
      baseNode = baseNode.parent;
    }
    checkConnectionToOutput(baseNode, nodes);
    currSlider = null;
    currentDragNode = null;
  }
});
editorCanvas.addEventListener("pointerout", (e) => {});
editorCanvas.addEventListener("mousewheel", function (event) {
  if (event.wheelDelta < 0) {
    gSFactor = downScaleStep;
  } else if (event.wheelDelta > 0) {
    gSFactor = upScaleStep;
  }
  var pos = getPos(editorCanvas, event);

  globalFontSize *= gSFactor;
  globalRadius *= gSFactor;
  globalTerminalRadius *= gSFactor;
  unit *= gSFactor;
  globalBaseHeight *= gSFactor;
  globalConnectorBezierOffset *= gSFactor;
  globalConnectorWidth *= gSFactor;
  globalOutlineWidth *= gSFactor;

  for (var i = 0; i < nodes.length; i++) {
    if (nodes[i].node.x > pos.x && nodes[i].node.y > pos.y) {
      nodes[i].node.x = pos.x + gSFactor * Math.abs(pos.x - nodes[i].node.x);
      nodes[i].node.y = pos.y + gSFactor * Math.abs(pos.y - nodes[i].node.y);
    } else if (nodes[i].node.x > pos.x && nodes[i].node.y < pos.y) {
      nodes[i].node.x = pos.x + gSFactor * Math.abs(pos.x - nodes[i].node.x);
      nodes[i].node.y = pos.y - gSFactor * Math.abs(pos.y - nodes[i].node.y);
    } else if (nodes[i].node.x < pos.x && nodes[i].node.y > pos.y) {
      nodes[i].node.x = pos.x - gSFactor * Math.abs(pos.x - nodes[i].node.x);
      nodes[i].node.y = pos.y + gSFactor * Math.abs(pos.y - nodes[i].node.y);
    } else if (nodes[i].node.x < pos.x && nodes[i].node.y < pos.y) {
      nodes[i].node.x = pos.x - gSFactor * Math.abs(pos.x - nodes[i].node.x);
      nodes[i].node.y = pos.y - gSFactor * Math.abs(pos.y - nodes[i].node.y);
    }
  }

  for (var i = 0; i < nodes.length; i++) {
    nodes[i].scale();
  }

  redraw(true);
});
editorCanvas.addEventListener("contextmenu", (e) => e.preventDefault());

const getPos = (canvas, pos) => {
  const rect = canvas.getBoundingClientRect();
  return {
    x: pos.x - rect.left,
    y: pos.y - rect.top,
  };
};
const getNodeFromPos = (pos) => {
  const inbounds = [];
  nodes.forEach((node) => {
    if (node.checkBounds(pos.x, pos.y)) inbounds.push(node);
  });
  const highestOrder = Math.max.apply(
    Math,
    inbounds.map((o) => o.node.order)
  );
  return inbounds.find((o) => o.node.order === highestOrder);
};

const redrawWithDelta = (delta) => {
  ctx.clearRect(0, 0, dimensions.x, dimensions.y);
  nodes.forEach((node) => {
    node.node.x += delta.x;
    node.node.y += delta.y;
  });
  connectors.forEach((connector) => {
    connector.draw(connector.terminalEnd.x, connector.terminalEnd.y);
  });
  nodes.forEach((node) => {
    node.update();
    node.draw();
  });
};

const handleDrop = (nodeName, absPos) => {
  const pos = getPos(editorCanvas, absPos);

  let width;
  switch (nodeName) {
    case "image": {
      width = dimensions.x * 0.3 * globalScaleRatio;
      nodes.unshift(new ImageSourceNode(pos.x, pos.y, width, nodes.length, unit * 1.5, unit * 0.7));
      break;
    }
    case "grayscale": {
      width = dimensions.x * 0.15 * globalScaleRatio;
      nodes.unshift(new GrayscaleNode(pos.x, pos.y, width, nodes.length, unit * 1.5, unit * 0.7));
      break;
    }
    case "binarize": {
      width = dimensions.x * 0.3 * globalScaleRatio;
      nodes.unshift(new BinarizeNode(pos.x, pos.y, width, nodes.length, unit * 1.5, unit * 0.7));
      break;
    }
    case "layer": {
      width = dimensions.x * 0.3 * globalScaleRatio;
      nodes.unshift(new LayerNode(pos.x, pos.y, width, nodes.length, unit * 1.5, unit * 0.7));
      break;
    }
    case "combinechannel": {
      width = dimensions.x * 0.2 * globalScaleRatio;
      nodes.unshift(new CombineChannelNode(pos.x, pos.y, width, nodes.length, unit * 1.5, unit * 0.7));
      break;
    }
    case "brightness": {
      width = dimensions.x * 0.25 * globalScaleRatio;
      nodes.unshift(new BrightnessNode(pos.x, pos.y, width, nodes.length, unit * 1.5, unit * 0.7));
      break;
    }
    case "contrast": {
      width = dimensions.x * 0.25 * globalScaleRatio;
      nodes.unshift(new ContrastNode(pos.x, pos.y, width, nodes.length, unit * 1.5, unit * 0.7));
      break;
    }
    case "reducepalette": {
      width = dimensions.x * 0.18 * globalScaleRatio;
      nodes.unshift(new ReducePaletteNode(pos.x, pos.y, width, nodes.length, unit * 1.5, unit * 0.7));
      break;
    }
    case "gamma": {
      width = dimensions.x * 0.25 * globalScaleRatio;
      nodes.unshift(new GammaNode(pos.x, pos.y, width, nodes.length, unit * 1.5, unit * 0.7));
      break;
    }
    default:
      break;
  }
};

const debugPoint = ({ x, y }) => {
  setTimeout(() => {
    ctx.beginPath();
    ctx.arc(x, y, 3, 0, 𝜏);
    ctx.fillStyle = "#f00";
    ctx.fill();
  }, 100);
};
const debugObject = (obj) => {
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
const debugComponent = (component) => {
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
