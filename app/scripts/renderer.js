// import { refOne } from "./utility.mjs";

var renderContext = renderCanvas.getContext("2d");
var renderWidth = renderCanvas.getAttribute("width");
var renderHeight = renderCanvas.getAttribute("height");

var gSFactor = 1.0;
var scaleRatio = 1.0;
var downScaleStep = 0.9;
var upScaleStep = 1.1;
var tempCanvas = document.createElement("canvas");
var tempContext = tempCanvas.getContext("2d");
var renderWidth = -1,
  renderHeight = -1;

const renderingOverlayEl = refOne(".rendering-overlay");

var outputNode = null;

function renderOutput() {
  var processor;
  for (var node of nodes) {
    if (node.node.type == "output") {
      outputNode = node;
      break;
    }
  }

  if (typeof processor == "undefined") {
    processor = new Worker("scripts/workers/processor_worker.js");
    showRenderingWait();
    var tree = createTree(outputNode);
    //console.log(tree);
    processor.postMessage(tree);
  }
  processor.onmessage = (e) => {
    //console.log('process complete');
    hideRenderingWait();
    outputNode.node.inputTerminals[0].data = e.data;
    processor.terminate();
    processor = undefined;

    renderContext.clearRect(0, 0, renderCanvas.getAttribute("width"), renderCanvas.getAttribute("height"));
    if (outputNode.node.inputTerminals[0].data != null) {
      tempCanvas.width = outputNode.node.inputTerminals[0].data.width;
      tempCanvas.height = outputNode.node.inputTerminals[0].data.height;
      renderWidth = tempCanvas.width * scaleRatio;
      renderHeight = tempCanvas.height * scaleRatio;
      tempContext.putImageData(outputNode.node.inputTerminals[0].data, 0, 0);
      renderContext.drawImage(
        tempCanvas,
        renderCanvas.width / 2 - renderWidth / 2,
        renderCanvas.height / 2 - renderHeight / 2,
        renderWidth,
        renderHeight
      );
    }
  };
}

renderCanvas.addEventListener(
  "mousewheel",
  function (event) {
    if (event.wheelDelta < 0) {
      gSFactor = downScaleStep;
      scaleRatio *= downScaleStep;
    } else if (event.wheelDelta > 0) {
      gSFactor = upScaleStep;
      scaleRatio *= upScaleStep;
    }

    renderWidth *= gSFactor;
    renderHeight *= gSFactor;

    renderContext.clearRect(0, 0, renderCanvas.width, renderCanvas.height);
    renderContext.drawImage(
      tempCanvas,
      renderCanvas.width / 2 - renderWidth / 2,
      renderCanvas.height / 2 - renderHeight / 2,
      renderWidth,
      renderHeight
    );
  },
  true
);

var TreeNode = function (type) {
  this.type = type;
  this.data = null;
  this.config = {};
  this.childs = [];
  this.dataType = null;
};

function createTree() {
  var stack = [];
  var root = new TreeNode("output");
  stack.push({ renderNode: outputNode, processNode: root });

  while (stack.length != 0) {
    currPairNode = stack.pop();
    switch (currPairNode.renderNode.node.type) {
      case "output": {
        break;
      }
      case "imagesource": {
        if (currPairNode.processNode.dataType == "image")
          currPairNode.processNode.data = currPairNode.renderNode.node.outputTerminals[0].data;
        else if (currPairNode.processNode.dataType == "channelR")
          currPairNode.processNode.data = currPairNode.renderNode.node.outputTerminals[1].data;
        else if (currPairNode.processNode.dataType == "channelG")
          currPairNode.processNode.data = currPairNode.renderNode.node.outputTerminals[2].data;
        else currPairNode.processNode.data = currPairNode.renderNode.node.outputTerminals[3].data;
        break;
      }
      case "grayscale": {
        currPairNode.processNode.config = currPairNode.renderNode.config;
        break;
      }
      case "binarize": {
        currPairNode.processNode.config = currPairNode.renderNode.config;
        break;
      }
      case "layer": {
        currPairNode.processNode.config = currPairNode.renderNode.config;
        break;
      }
      case "combinechannel": {
        currPairNode.processNode.config = currPairNode.renderNode.config;
        break;
      }
      case "brightness": {
        currPairNode.processNode.config = currPairNode.renderNode.config;
        break;
      }
      case "contrast": {
        currPairNode.processNode.config = currPairNode.renderNode.config;
        break;
      }
      case "reducepalette": {
        currPairNode.processNode.config = currPairNode.renderNode.config;
        break;
      }
      case "gamma": {
        currPairNode.processNode.config = currPairNode.renderNode.config;
        break;
      }
      default:
        break;
    }
    for (var inputTerminal of currPairNode.renderNode.node.inputTerminals) {
      if (inputTerminal.connector != null) {
        var childNode = new TreeNode(inputTerminal.connector.terminalStartNode.type);
        childNode.dataType = inputTerminal.connector.terminalStart.category;
        currPairNode.processNode.childs.push(childNode);
        stack.push({ renderNode: inputTerminal.connector.terminalStartNode.parent, processNode: childNode });
      }
    }
  }
  return root;
}

function showRenderingWait() {
  renderingOverlayEl.style.visibility = "visible";
  renderingOverlayEl.style.pointerEvents = "all";
}

function hideRenderingWait() {
  renderingOverlayEl.style.visibility = "hidden";
  renderingOverlayEl.style.pointerEvents = "none";
}

function downloadRender() {
  if (outputNode == null || outputNode.node.inputTerminals[0].data == null) {
    alert("Nothing to render");
    return;
  }
  var link = document.createElement("a");
  var tempCanvas = document.createElement("canvas");
  tempCanvas.width = outputNode.node.inputTerminals[0].data.width;
  tempCanvas.height = outputNode.node.inputTerminals[0].data.height;
  tempCanvas.getContext("2d").putImageData(outputNode.node.inputTerminals[0].data, 0, 0);
  link.download = "render.png";
  link.href = tempCanvas.toDataURL();
  link.click();
}
