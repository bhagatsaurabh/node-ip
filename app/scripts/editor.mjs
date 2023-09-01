import { dimensions, props, redraw, ctx, redrawWithDelta } from "./state/editor.mjs";
import { nodes } from "./state/nodes.mjs";
import { 𝜏 } from "./constants.mjs";
import { checkConnectionToOutput, distance, getPos, refOne } from "./utility.mjs";
import * as nodeTypes from "./nodes/index.mjs";

const downScaleStep = 0.9;
const upScaleStep = 1.1;
let shiftStatus = false;
let nodeDragFlag = 0;
let currDragNode = null;
let dragDelta = { x: 0, y: 0 };
let sliderDragFlag = 0;
let currSlider = null;

let panStart = { x: 0, y: 0 };
let panDelta = { x: 0, y: 0 };
let panFlag = 0;

/* let currNodeInContextMenu = null;
let currentContextMenu = null;
let isContextMenuOpened = false; */

export const pushOutputNode = () => {
  const width = 150 * props.globalScaleRatio;
  nodes.push(
    new nodeTypes.OutputNode(
      dimensions.x / 2 - width / 2,
      dimensions.y / 2,
      width,
      nodes.length,
      props.unit * 1.5,
      props.unit * 0.7
    )
  );
};

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
  props.globalScaleRatio = nodes.length > 0 ? nodes[0].scaleRatio : 1;

  handleDrop(e.dataTransfer.getData("text/plain"), { x: e.clientX, y: e.clientY });
});
editorCanvas.addEventListener("click", (e) => {
  const pos = getPos(editorCanvas, { x: e.clientX, y: e.clientY });
  const node = getNodeFromPos(pos);
  if (!node) {
    props.selectedNodes = [];
    redraw(true);
  } else {
    node.clicked(pos);
    if (props.wasDragging) props.wasDragging = false;
  }
});
const pointers = [];
const prevDistance = -1;
editorCanvas.addEventListener("pointerdown", (e) => {
  if (pointers.length >= 2) return;
  const pos = getPos(editorCanvas, { x: e.clientX, y: e.clientY });
  pointers.push({ id: e.pointerId, pos });

  if (pointers.length === 2) {
    prevDistance = distance(pointers[0].pos, pointers[1].pos);
  } else {
    const node = getNodeFromPos(pos);
    if (node) {
      currSlider = node.checkSliderBounds(pos);
    }
    if (currSlider) {
      sliderDragFlag = 1;
    } else if (node && nodeDragFlag === 0) {
      nodeDragFlag = 1;
      if (shiftStatus) {
        props.selectedNodes.push(node);
      } else {
        props.selectedNodes = [];
        props.selectedNodes.push(node);
      }

      const order = node.order;
      node.order = nodes[nodes.length - 1].order;
      nodes[nodes.length - 1].order = order;

      const index = nodes.indexOf(node);
      nodes[index] = nodes[nodes.length - 1];
      nodes[nodes.length - 1] = node;

      redraw(true);

      currDragNode = node;
      dragDelta = { x: currDragNode.x - pos.x, y: currDragNode.y - pos.y };
    } else {
      panStart = { x: pos.x, y: pos.y };
      panFlag = 1;
    }
  }
});
editorCanvas.addEventListener("pointermove", (e) => {
  const pos = getPos(editorCanvas, { x: e.clientX, y: e.clientY });

  if (pointers.length >= 2) return;
  else if (pointers.length === 2) {
    const pointer = pointers.find((p) => p.id === e.pointerId);
    if (pointer) {
      pointer.pos = pos;
      const currDistance = distance(pointers[0].pos, pointers[1].pos);
      if (currDistance !== prevDistance) {
        handleZoom(currDistance < prevDistance, pos);
      }
      currDistance = prevDistance;
    }
  } else {
    if (currDragNode && sliderDragFlag === 0) {
      currDragNode.x = pos.x + dragDelta.x;
      currDragNode.y = pos.y + dragDelta.y;
      redraw(true);
      props.wasDragging = true;
    }
    if (panFlag) {
      panDelta.x = pos.x - panStart.x;
      panDelta.y = pos.y - panStart.y;
      panStart.x = pos.x;
      panStart.y = pos.y;
      redrawWithDelta(panDelta);
    }
    if (props.terminalStartFlag) {
      ctx.clearRect(0, 0, dimensions.x, dimensions.y);
      props.currentConnector?.draw(pos.x, pos.y);
      redraw(false);
    }
    if (sliderDragFlag) {
      currSlider.slide(pos.x);
      redraw(true);
    }
  }
});
const handlePointerUp = (e) => {
  const index = pointers.findIndex((pointer) => pointer.id === e.pointerId);
  if (index > -1) {
    pointers.splice(index, 1);
  }

  if (nodeDragFlag) {
    currDragNode = null;
    nodeDragFlag = 0;
  } else if (panFlag) {
    panFlag = 0;
    panDelta.x = panDelta.y = panStart.x = panStart.y = 0;
  } else if (sliderDragFlag) {
    sliderDragFlag = 0;
    let baseNode = currSlider.parent;
    while (!Array.isArray(baseNode.inputTerminals)) {
      baseNode = baseNode.parent;
    }
    checkConnectionToOutput(baseNode, nodes);
    currSlider = null;
    currDragNode = null;
  }

  if (pointers.length === 0 && prevDistance !== -1) prevDistance = -1;
};
editorCanvas.addEventListener("pointerup", handlePointerUp);
editorCanvas.addEventListener("pointerout", handlePointerUp);
const handleZoom = (type, pos) => {
  if (type) {
    props.gSFactor = downScaleStep;
  } else {
    props.gSFactor = upScaleStep;
  }

  props.globalFontSize *= props.gSFactor;
  props.globalRadius *= props.gSFactor;
  props.globalTerminalRadius *= props.gSFactor;
  props.unit *= props.gSFactor;
  props.globalBaseHeight *= props.gSFactor;
  props.globalConnectorBezierOffset *= props.gSFactor;
  props.globalConnectorWidth *= props.gSFactor;
  props.globalOutlineWidth *= props.gSFactor;

  for (let node of nodes) {
    if (node.x > pos.x && node.y > pos.y) {
      node.x = pos.x + props.gSFactor * Math.abs(pos.x - node.x);
      node.y = pos.y + props.gSFactor * Math.abs(pos.y - node.y);
    } else if (node.x > pos.x && node.y < pos.y) {
      node.x = pos.x + props.gSFactor * Math.abs(pos.x - node.x);
      node.y = pos.y - props.gSFactor * Math.abs(pos.y - node.y);
    } else if (node.x < pos.x && node.y > pos.y) {
      node.x = pos.x - props.gSFactor * Math.abs(pos.x - node.x);
      node.y = pos.y + props.gSFactor * Math.abs(pos.y - node.y);
    } else if (node.x < pos.x && node.y < pos.y) {
      node.x = pos.x - props.gSFactor * Math.abs(pos.x - node.x);
      node.y = pos.y - props.gSFactor * Math.abs(pos.y - node.y);
    }
  }
  for (let node of nodes) {
    node.scale(props.gSFactor);
  }
  redraw(true);
};
editorCanvas.addEventListener("wheel", (e) => {
  if (e.wheelDelta) {
    handleZoom(e.wheelDelta < 0, getPos(editorCanvas, { x: e.clientX, y: e.clientY }));
  }
});
editorCanvas.addEventListener("contextmenu", (e) => e.preventDefault());

const getNodeFromPos = (pos) => {
  const inbounds = [];
  nodes.forEach((node) => {
    if (node.checkBounds(pos.x, pos.y)) inbounds.push(node);
  });
  const highestOrder = Math.max.apply(
    Math,
    inbounds.map((o) => o.order)
  );
  return inbounds.find((o) => o.order === highestOrder);
};

export const handleDrop = (nodeName, absPos) => {
  const pos = getPos(editorCanvas, absPos);

  let width;
  switch (nodeName) {
    case "image": {
      width = 200 * props.globalScaleRatio;
      nodes.unshift(
        new nodeTypes.ImageSourceNode(pos.x, pos.y, width, nodes.length, props.unit * 1.5, props.unit * 0.7)
      );
      break;
    }
    case "grayscale": {
      width = 150 * props.globalScaleRatio;
      nodes.unshift(
        new nodeTypes.GrayscaleNode(pos.x, pos.y, width, nodes.length, props.unit * 1.5, props.unit * 0.7)
      );
      break;
    }
    case "binarize": {
      width = 200 * props.globalScaleRatio;
      nodes.unshift(
        new nodeTypes.BinarizeNode(pos.x, pos.y, width, nodes.length, props.unit * 1.5, props.unit * 0.7)
      );
      break;
    }
    case "layer": {
      width = 250 * props.globalScaleRatio;
      nodes.unshift(
        new nodeTypes.LayerNode(pos.x, pos.y, width, nodes.length, props.unit * 1.5, props.unit * 0.7)
      );
      break;
    }
    case "combinechannel": {
      width = 150 * props.globalScaleRatio;
      nodes.unshift(
        new nodeTypes.CombineChannelNode(
          pos.x,
          pos.y,
          width,
          nodes.length,
          props.unit * 1.5,
          props.unit * 0.7
        )
      );
      break;
    }
    case "brightness": {
      width = 200 * props.globalScaleRatio;
      nodes.unshift(
        new nodeTypes.BrightnessNode(pos.x, pos.y, width, nodes.length, props.unit * 1.5, props.unit * 0.7)
      );
      break;
    }
    case "contrast": {
      width = 200 * props.globalScaleRatio;
      nodes.unshift(
        new nodeTypes.ContrastNode(pos.x, pos.y, width, nodes.length, props.unit * 1.5, props.unit * 0.7)
      );
      break;
    }
    case "reducepalette": {
      width = 150 * props.globalScaleRatio;
      nodes.unshift(
        new nodeTypes.ReducePaletteNode(pos.x, pos.y, width, nodes.length, props.unit * 1.5, props.unit * 0.7)
      );
      break;
    }
    case "gamma": {
      width = 200 * props.globalScaleRatio;
      nodes.unshift(
        new nodeTypes.GammaNode(pos.x, pos.y, width, nodes.length, props.unit * 1.5, props.unit * 0.7)
      );
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
