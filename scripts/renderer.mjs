import {
  downScaleStep,
  downScaleStepSensitive,
  renderCtx,
  renderDimensions,
  upScaleStep,
  upScaleStepSensitive,
} from "./state/editor.mjs";
import { nodes } from "./state/nodes.mjs";
import { distance, getPos, refOne } from "./utility.mjs";

let gSFactor = 1.0;
let scaleRatio = 1.0;
const tempCanvas = document.createElement("canvas");
const tempContext = tempCanvas.getContext("2d");
let [renderWidth, renderHeight] = [-1, -1];
let outputNode = null;

const renderingOverlayEl = refOne(".overlay.rendering");
const renderCanvas = refOne("#renderCanvas");

const renderOutput = () => {
  outputNode = nodes.find((node) => node.type === "output");

  let processor;
  if (typeof processor === "undefined") {
    processor = new Worker("scripts/workers/processor_worker.js");
    renderingOverlayEl.classList.add("show");
    processor.postMessage(createTree(outputNode));
  }
  processor.onmessage = (e) => {
    renderingOverlayEl.classList.remove("show");
    outputNode.inputTerminals[0].data = e.data;
    processor.terminate();
    processor = undefined;

    renderCtx.clearRect(0, 0, renderDimensions.x, renderDimensions.y);
    if (outputNode.inputTerminals[0].data !== null) {
      tempCanvas.width = outputNode.inputTerminals[0].data.width;
      tempCanvas.height = outputNode.inputTerminals[0].data.height;
      renderWidth = tempCanvas.width * scaleRatio;
      renderHeight = tempCanvas.height * scaleRatio;
      tempContext.putImageData(outputNode.inputTerminals[0].data, 0, 0);
      renderCtx.drawImage(
        tempCanvas,
        renderDimensions.x / 2 - renderWidth / 2,
        renderDimensions.y / 2 - renderHeight / 2,
        renderWidth,
        renderHeight
      );
    }
  };
};

const handleZoom = (type, isSensitive) => {
  let downStep, upStep;
  if (isSensitive) {
    downStep = downScaleStepSensitive;
    upStep = upScaleStepSensitive;
  } else {
    downStep = downScaleStep;
    upStep = upScaleStep;
  }

  if (type) {
    gSFactor = downStep;
    scaleRatio *= downStep;
  } else {
    gSFactor = upStep;
    scaleRatio *= upStep;
  }
  renderWidth *= gSFactor;
  renderHeight *= gSFactor;

  renderCtx.clearRect(0, 0, renderDimensions.x, renderDimensions.y);
  renderCtx.drawImage(
    tempCanvas,
    renderDimensions.x / 2 - renderWidth / 2,
    renderDimensions.y / 2 - renderHeight / 2,
    renderWidth,
    renderHeight
  );
};

const pointers = [];
let prevDistance = -1;
const removePointer = (e) => {
  const index = pointers.findIndex((pointer) => pointer.id === e.pointerId);
  if (index > -1) {
    pointers.splice(index, 1);
  }

  if (pointers.length < 2) prevDistance = -1;
};
renderCanvas.onpointerdown = (e) => {
  if (pointers.length >= 2) return;

  pointers.push({ id: e.pointerId, pos: getPos(renderCanvas, { x: e.clientX, y: e.clientY }) });
  if (pointers.length === 2) {
    prevDistance = distance(pointers[0].pos, pointers[1].pos);
  }
};
renderCanvas.onpointermove = (e) => {
  if (pointers.length !== 2) return;

  const pointer = pointers.find((pointer) => pointer.id === e.pointerId);
  if (pointer) {
    pointer.pos = getPos(renderCanvas, { x: e.clientX, y: e.clientY });
    const currDistance = distance(pointers[0].pos, pointers[1].pos);
    if (prevDistance > 0) {
      if (currDistance !== prevDistance) {
        handleZoom(currDistance < prevDistance, true);
      }
    }
    prevDistance = currDistance;
  }
};
renderCanvas.onpointerup = (e) => removePointer(e);
renderCanvas.onpointerout = (e) => removePointer(e);

renderCanvas.onwheel = (e) => {
  if (e.wheelDelta) {
    handleZoom(e.wheelDelta < 0, false);
  }
};

class TreeNode {
  constructor(type) {
    this.type = type;
    this.data = null;
    this.config = {};
    this.childs = [];
    this.dataType = null;
  }
}

const createTree = () => {
  const stack = [];
  let root = new TreeNode("output");
  stack.push({ renderNode: outputNode, processNode: root });

  while (stack.length) {
    const currPairNode = stack.pop();
    switch (currPairNode.renderNode.type) {
      case "output": {
        break;
      }
      case "imagesource": {
        let cIndex = 0;
        if (currPairNode.processNode.dataType === "channelR") cIndex = 1;
        if (currPairNode.processNode.dataType === "channelG") cIndex = 2;
        if (currPairNode.processNode.dataType === "channelB") cIndex = 3;

        currPairNode.processNode.data = currPairNode.renderNode.outputTerminals[cIndex].data;
        break;
      }
      case "grayscale":
      case "binarize":
      case "layer":
      case "combinechannel":
      case "brightness":
      case "contrast":
      case "reducepalette":
      case "gamma": {
        currPairNode.processNode.config = currPairNode.renderNode.config;
        break;
      }
      default:
        break;
    }
    currPairNode.renderNode.inputTerminals.forEach((inputTerminal) => {
      if (inputTerminal.connector) {
        const childNode = new TreeNode(inputTerminal.connector.terminalStartNode.type);
        childNode.dataType = inputTerminal.connector.terminalStart.category;
        currPairNode.processNode.childs.push(childNode);
        stack.push({ renderNode: inputTerminal.connector.terminalStartNode, processNode: childNode });
      }
    });
  }
  return root;
};

refOne("#download-rendered").onclick = () => {
  if (outputNode === null || outputNode.inputTerminals[0].data === null) {
    alert("No Output");
    return;
  }
  const link = document.createElement("a");
  const downloadCanvas = document.createElement("canvas");
  downloadCanvas.width = outputNode.inputTerminals[0].data.width;
  downloadCanvas.height = outputNode.inputTerminals[0].data.height;
  downloadCanvas.getContext("2d").putImageData(outputNode.inputTerminals[0].data, 0, 0);
  link.download = "rendered.png";
  link.href = downloadCanvas.toDataURL();
  link.click();
};

export { renderOutput };
