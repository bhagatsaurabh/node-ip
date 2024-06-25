const processStack = [];

onmessage = (e) => {
  processStack.push(e.data);
  let nodeInProcess;

  while (processStack.length) {
    if (isNearLeaf(processStack[processStack.length - 1])) {
      nodeInProcess = processStack.pop();
      process(nodeInProcess);
      nodeInProcess.childs = [];
    } else {
      processStack[processStack.length - 1].childs.forEach((child) => {
        if (!isLeaf(child)) processStack.push(child);
      });
    }
  }
  postMessage(e.data.data);
};

const isNearLeaf = (node) => {
  for (const child of node.childs) {
    if (isLeaf(child)) continue;
    return false;
  }
  return true;
};

const isLeaf = (node) => !node.childs.length;

const process = (node) => {
  switch (node.type) {
    case "output": {
      if (node.childs.length) {
        node.data = node.childs[0].data;
      } else node.data = null;
      break;
    }
    case "grayscale": {
      if (node.childs.length) {
        node.data = grayscale(node.childs[0].data, node.config);
      } else node.data = null;
      break;
    }
    case "binarize": {
      if (node.childs.length) {
        node.data = binarize(node.childs[0].data, node.config);
      } else node.data = null;
      break;
    }
    case "layer": {
      if (node.childs.length) {
        node.data = layerAll(node.childs, node.config);
      } else node.data = null;
      break;
    }
    case "combinechannel": {
      if (node.childs.length) {
        const colSpace =
          node.childs[0].dataType.replace("channel", "") +
          node.childs[1].dataType.replace("channel", "") +
          node.childs[2].dataType.replace("channel", "");
        node.data = combineChannels(node.childs[0].data, node.childs[1].data, node.childs[2].data, colSpace);
      } else node.data = null;
      break;
    }
    case "brightness": {
      if (node.childs.length) {
        node.data = brighten(node.childs[0].data, node.childs[0].dataType, node.config.factor / 100);
      } else node.data = null;
      break;
    }
    case "contrast": {
      if (node.childs.length) {
        node.data = contrast(node.childs[0].data, node.childs[0].dataType, node.config.factor / 100);
      } else node.data = null;
      break;
    }
    case "reducepalette": {
      if (node.childs.length) {
        node.data = paletteConvert(node.childs[0].data);
      } else node.data = null;
      break;
    }
    case "gamma": {
      if (node.childs.length) {
        node.data = gamma(node.childs[0].data, node.childs[0].dataType, node.config.factor / 100);
      } else node.data = null;
      break;
    }
    default:
      break;
  }
};

const grayscale = (imageData, config) => {
  let value;

  if (config.type === "weighted") {
    for (let i = 0; i < imageData.data.length; i += 4) {
      value = imageData.data[i + 0] * 0.3 + imageData.data[i + 1] * 0.59 + imageData.data[i + 2] * 0.11;
      imageData.data[i + 0] = value;
      imageData.data[i + 1] = value;
      imageData.data[i + 2] = value;
      //imageData.data[i + 3] = 255;
    }
    return imageData;
  } else {
    for (let i = 0; i < imageData.data.length; i += 4) {
      value = (imageData.data[i + 0] + imageData.data[i + 1] + imageData.data[i + 2]) / 3;
      imageData.data[i + 0] = value;
      imageData.data[i + 1] = value;
      imageData.data[i + 2] = value;
      //imageData.data[i + 3] = 255;
    }
    return imageData;
  }
};

const binarize = (imageData, config) => {
  let average;
  for (let i = 0; i < imageData.data.length; i += 4) {
    average = (imageData.data[i + 0] + imageData.data[i + 1] + imageData.data[i + 2]) / 3;
    if (average > config.threshold) {
      imageData.data[i + 0] = 255;
      imageData.data[i + 1] = 255;
      imageData.data[i + 2] = 255;
    } else {
      imageData.data[i + 0] = 0;
      imageData.data[i + 1] = 0;
      imageData.data[i + 2] = 0;
    }
  }
  return imageData;
};

const layerAll = (nodes, config) => {
  for (let i = 1; i < nodes.length; i += 1) {
    if (nodes[i].data.width !== nodes[0].data.width && nodes[i].data.height !== nodes[0].data.height)
      nodes[i].data = scale(nodes[i].data, nodes[0].data.width, nodes[0].data.height);
  }
  for (let i = 1; i < nodes.length; i += 1) {
    nodes[0].data = blend(nodes[0], nodes[0].data, nodes[i].data, config.alphas[i] / 100);
  }
  return nodes[0].data;
};

const scale = (imageData, width, height) => {
  let scaledData = new ImageData(width, height);
  let xScale = imageData.width / width;
  let yScale = imageData.height / height;
  let xp, yp;
  for (let x = 0; x < scaledData.width; x += 1) {
    for (let y = 0; y < scaledData.height; y += 1) {
      xp = Math.floor(x * xScale);
      yp = Math.floor(y * yScale);
      scaledData.data[(x + y * width) * 4 + 0] = imageData.data[(xp + yp * imageData.width) * 4 + 0];
      scaledData.data[(x + y * width) * 4 + 1] = imageData.data[(xp + yp * imageData.width) * 4 + 1];
      scaledData.data[(x + y * width) * 4 + 2] = imageData.data[(xp + yp * imageData.width) * 4 + 2];
      scaledData.data[(x + y * width) * 4 + 3] = imageData.data[(xp + yp * imageData.width) * 4 + 3];
    }
  }
  return scaledData;
};

const blend = (nodeBase, imageData1, imageData2, blendFactor) => {
  for (let i = 0; i < imageData1.data.length; i += 4) {
    imageData1.data[i + 0] =
      (1 - blendFactor) * imageData1.data[i + 0] + blendFactor * imageData2.data[i + 0];
    imageData1.data[i + 1] =
      (1 - blendFactor) * imageData1.data[i + 1] + blendFactor * imageData2.data[i + 1];
    imageData1.data[i + 2] =
      (1 - blendFactor) * imageData1.data[i + 2] + blendFactor * imageData2.data[i + 2];
  }

  nodeBase.dataType = "image";
  return imageData1;
};

const combineChannels = (imageData1, imageData2, imageData3, _colSpace) => {
  let combinedData = new ImageData(imageData1.width, imageData1.height);
  for (let i = 0; i < imageData1.data.length; i += 4) {
    combinedData.data[i + 0] = imageData1.data[i + 0];
    combinedData.data[i + 1] = imageData2.data[i + 1];
    combinedData.data[i + 2] = imageData3.data[i + 2];
    combinedData.data[i + 3] = imageData1.data[i + 3];
  }
  return combinedData;
};

const brighten = (imageData, dataType, factor) => {
  if (dataType === "image") {
    for (let i = 0; i < imageData.data.length; i += 4) {
      imageData.data[i + 0] = Math.max(0, Math.min(imageData.data[i + 0] + factor * 255, 255));
      imageData.data[i + 1] = Math.max(0, Math.min(imageData.data[i + 1] + factor * 255, 255));
      imageData.data[i + 2] = Math.max(0, Math.min(imageData.data[i + 2] + factor * 255, 255));
    }
  } else if (dataType === "channelR") {
    for (let i = 0; i < imageData.data.length; i += 4) {
      imageData.data[i + 0] = Math.max(0, Math.min(imageData.data[i + 0] + factor * 255, 255));
    }
  } else if (dataType === "channelG") {
    for (let i = 0; i < imageData.data.length; i += 4) {
      imageData.data[i + 1] = Math.max(0, Math.min(imageData.data[i + 1] + factor * 255, 255));
    }
  } else if (dataType === "channelB") {
    for (let i = 0; i < imageData.data.length; i += 4) {
      imageData.data[i + 2] = Math.max(0, Math.min(imageData.data[i + 2] + factor * 255, 255));
    }
  }
  return imageData;
};

const contrast = (imageData, dataType, factor) => {
  let contrastCorrFactor = (259 * (factor * 255 + 255)) / (255 * (259 - factor * 255));
  if (dataType === "image") {
    for (let i = 0; i < imageData.data.length; i += 4) {
      imageData.data[i + 0] = Math.max(
        0,
        Math.min(contrastCorrFactor * (imageData.data[i + 0] - 128) + 128, 255)
      );
      imageData.data[i + 1] = Math.max(
        0,
        Math.min(contrastCorrFactor * (imageData.data[i + 1] - 128) + 128, 255)
      );
      imageData.data[i + 2] = Math.max(
        0,
        Math.min(contrastCorrFactor * (imageData.data[i + 2] - 128) + 128, 255)
      );
    }
  } else if (["channelR", "channelG", "channelB"].includes(dataType)) {
    const cIndex = 0;
    if (dataType === "channelG") cIndex = 1;
    else if (dataType === "channelB") cIndex = 2;

    for (let i = 0; i < imageData.data.length; i += 4) {
      imageData.data[i + cIndex] = Math.max(
        0,
        Math.min(contrastCorrFactor * (imageData.data[i + cIndex] - 128) + 128, 255)
      );
    }
  }
  return imageData;
};

const gamma = (imageData, dataType, factor) => {
  let gFactor = 1 / (factor * (7.99 - 0.01) + 0.01);
  if (dataType === "image") {
    for (let i = 0; i < imageData.data.length; i += 4) {
      imageData.data[i + 0] = Math.max(
        0,
        Math.min(255 * Math.pow(imageData.data[i + 0] / 255.0, gFactor), 255)
      );
      imageData.data[i + 1] = Math.max(
        0,
        Math.min(255 * Math.pow(imageData.data[i + 1] / 255.0, gFactor), 255)
      );
      imageData.data[i + 2] = Math.max(
        0,
        Math.min(255 * Math.pow(imageData.data[i + 2] / 255.0, gFactor), 255)
      );
    }
  } else if (["channelR", "channelG", "channelB"].includes(dataType)) {
    const cIndex = 0;
    if (dataType === "channelG") cIndex = 1;
    else if (dataType === "channelB") cIndex = 2;

    for (let i = 0; i < imageData.data.length; i += 4) {
      imageData.data[i + cIndex] = Math.max(
        0,
        Math.min(255 * Math.pow(imageData.data[i + cIndex] / 255.0, gFactor), 255)
      );
    }
  }
  return imageData;
};

const palette = [
  [0, 0, 0],
  [255, 0, 0],
  [0, 255, 0],
  [0, 0, 255],
  [255, 255, 0],
  [0, 255, 255],
  [255, 0, 255],
  [255, 255, 255],
];

const maxDistace = 195075;
let rDiff, gDiff, bDiff;

const paletteConvert = (imageData) => {
  let nearColor;
  for (let i = 0; i < imageData.data.length; i += 4) {
    nearColor = nearestColor(imageData.data[i + 0], imageData.data[i + 1], imageData.data[i + 2]);
    imageData.data[i + 0] = nearColor[0];
    imageData.data[i + 1] = nearColor[1];
    imageData.data[i + 2] = nearColor[2];
  }
  return imageData;
};

const nearestColor = (r, g, b) => {
  let minimumDistance = maxDistace;
  let distance, nearColor;
  palette.forEach((color) => {
    rDiff = r - color[0];
    gDiff = g - color[1];
    bDiff = b - color[2];
    distance = rDiff * rDiff + gDiff * gDiff + bDiff * bDiff;
    if (distance < minimumDistance) {
      minimumDistance = distance;
      nearColor = color;
    }
  });
  return nearColor;
};
