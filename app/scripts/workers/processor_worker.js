var processStack = [];

onmessage = (e) => {
    //console.log('processor got data');
    processStack.push(e.data);
    var nodeInProcess;

    while(processStack.length != 0) {
        if (isNearLeaf(processStack[processStack.length - 1])){
            nodeInProcess = processStack.pop()
            process(nodeInProcess);
            nodeInProcess.childs = [];
        } else {
            for(var child of processStack[processStack.length - 1].childs) {
                if (!isLeaf(child)) processStack.push(child);
            }
        }
    }
    postMessage(e.data.data);
};

function isNearLeaf(node) {
    for (var child of node.childs) {
        if(isLeaf(child)) continue;
        else return false;
    }
    return true;
}

function isLeaf (node) {
    return (node.childs.length == 0);
}

function process(node) {
    switch (node.type) {
        case 'output': {
            if (node.childs.length > 0) {
                node.data = node.childs[0].data
            } else node.data = null;
            break;
        }
        case 'grayscale': {
            if (node.childs.length > 0) {
                node.data = grayscale(node.childs[0].data, node.config);
            } else node.data = null;
            break;
        }
        case 'binarize': {
            if (node.childs.length > 0) {
                node.data = binarize(node.childs[0].data, node.config);
            } else node.data = null;
            break;
        }
        case 'layer': {
            if (node.childs.length > 0) {
                node.data = layerAll(node.childs, node.config);
            } else node.data = null;
            break;
        }
        case 'combinechannel': {
            if (node.childs.length > 0) {
                //console.log('combining channels: ' + node.childs[0].dataType + ' ' + node.childs[1].dataType + ' ' + node.childs[2].dataType);
                var colSpace = node.childs[0].dataType.replace('channel', '') + node.childs[1].dataType.replace('channel', '') + node.childs[2].dataType.replace('channel', '');
                node.data = combineChannels(node.childs[0].data, node.childs[1].data, node.childs[2].data, colSpace);
            } else node.data = null;
            break;
        }
        case 'brightness': {
            if (node.childs.length > 0) {
                node.data = brighten(node.childs[0].data, node.childs[0].dataType, node.config.factor / 100);
            } else node.data = null;
            break;
        }
        case 'contrast': {
            if (node.childs.length > 0) {
                node.data = contrast(node.childs[0].data, node.childs[0].dataType, node.config.factor / 100);
            } else node.data = null;
            break;
        }
        case 'reducepalette': {
            if (node.childs.length > 0) {
                node.data = paletteConvert(node.childs[0].data);
            } else node.data = null;
            break;
        }
        case 'gamma': {
            if (node.childs.length > 0) {
                node.data = gamma(node.childs[0].data, node.childs[0].dataType, node.config.factor / 100);
            } else node.data = null;
            break;
        }
        default : break;
    }
}

function grayscale(imageData, config) {
    var value;

    if (config.type == 'weighted') {
        for (var i = 0 ; i < imageData.data.length ; i+=4) {
            value = (imageData.data[i + 0] * 0.3) + (imageData.data[i + 1] * 0.59) + (imageData.data[i + 2] * 0.11);
            imageData.data[i + 0] = value;
            imageData.data[i + 1] = value;
            imageData.data[i + 2] = value;
            //imageData.data[i + 3] = 255;
        }
        return imageData;
    } else {
        for (var i = 0 ; i < imageData.data.length ; i+=4) {
            value = (imageData.data[i + 0] + imageData.data[i + 1] + imageData.data[i + 2]) / 3;
            imageData.data[i + 0] = value;
            imageData.data[i + 1] = value;
            imageData.data[i + 2] = value;
            //imageData.data[i + 3] = 255;
        }
        return imageData;
    }
}

function binarize(imageData, config) {
    var average;
    for (var i = 0 ; i < imageData.data.length ; i+=4) {
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
}

function layerAll(nodes, config) {
    for (var i = 1 ; i < nodes.length ; i++) {
        if (nodes[i].data.width != nodes[0].data.width && nodes[i].data.height != nodes[0].data.height)
            nodes[i].data = scale(nodes[i].data, nodes[0].data.width, nodes[0].data.height);
    }
    for (var i = 1 ; i < nodes.length; i++) {
        nodes[0].data = blend(nodes[0], nodes[0].data, nodes[i].data, config.alphas[i] / 100);
    }
    return nodes[0].data;
}

function scale(imageData, width, height) {
    var scaledData = new ImageData(width, height);
    var xScale = imageData.width / width;
    var yScale = imageData.height / height;
    var xp, yp;
    for (var x = 0 ; x < scaledData.width ; x++) {
        for (var y = 0 ; y < scaledData.height ; y++) {
            xp = Math.floor(x*xScale);
            yp = Math.floor(y*yScale);
            scaledData.data[(x + y * width) * 4 + 0] = imageData.data[(xp + yp * imageData.width) * 4 + 0];
            scaledData.data[(x + y * width) * 4 + 1] = imageData.data[(xp + yp * imageData.width) * 4 + 1];
            scaledData.data[(x + y * width) * 4 + 2] = imageData.data[(xp + yp * imageData.width) * 4 + 2];
            scaledData.data[(x + y * width) * 4 + 3] = imageData.data[(xp + yp * imageData.width) * 4 + 3];
        }
    }
    return scaledData;
}

function blend(nodeBase, imageData1, imageData2, blendFactor) {

    for (var i = 0 ; i < imageData1.data.length ; i+=4) {
        imageData1.data[i + 0] = (1-blendFactor) * imageData1.data[i + 0] + (blendFactor) * imageData2.data[i + 0];
        imageData1.data[i + 1] = (1-blendFactor) * imageData1.data[i + 1] + (blendFactor) * imageData2.data[i + 1];
        imageData1.data[i + 2] = (1-blendFactor) * imageData1.data[i + 2] + (blendFactor) * imageData2.data[i + 2];
    }
    
    nodeBase.dataType = 'image';

    return imageData1;
}

function combineChannels(imageData1, imageData2, imageData3, colSpace) {
    var combinedData = new ImageData(imageData1.width, imageData1.height);
    for (var i = 0 ; i < imageData1.data.length ; i+=4) {
        combinedData.data[i + 0] = imageData1.data[i + 0];
        combinedData.data[i + 1] = imageData2.data[i + 1];
        combinedData.data[i + 2] = imageData3.data[i + 2];
        combinedData.data[i + 3] = imageData1.data[i + 3];
    }
    return combinedData;
}

function brighten(imageData, dataType, factor) {
    if (dataType == 'image') {
        for (var i = 0 ; i < imageData.data.length ; i+=4) {
            imageData.data[i + 0] =  Math.max(0, Math.min(imageData.data[i + 0] + (factor * 255), 255));
            imageData.data[i + 1] = Math.max(0, Math.min(imageData.data[i + 1] + (factor * 255), 255));
            imageData.data[i + 2] = Math.max(0, Math.min(imageData.data[i + 2] + (factor * 255), 255));
        }
    } else if (dataType == 'channelR') {
        for (var i = 0 ; i < imageData.data.length ; i+=4) {
            imageData.data[i + 0] = Math.max(0, Math.min(imageData.data[i + 0] + (factor * 255), 255));
        }
    } else if (dataType == 'channelG') {
        for (var i = 0 ; i < imageData.data.length ; i+=4) {
            imageData.data[i + 1] = Math.max(0, Math.min(imageData.data[i + 1] + (factor * 255), 255));
        }
    } else if (dataType == 'channelB') {
        for (var i = 0 ; i < imageData.data.length ; i+=4) {
            imageData.data[i + 2] = Math.max(0, Math.min(imageData.data[i + 2] + (factor * 255), 255));
        }
    }
    return imageData;
}

function contrast(imageData, dataType, factor) {
    var contrastCorrFactor = (259 * ((factor * 255) + 255))/(255*(259 - (factor * 255)));
    if (dataType == 'image') {
        for (var i = 0 ; i < imageData.data.length ; i+=4) {
            imageData.data[i + 0] =  Math.max(0, Math.min(contrastCorrFactor * (imageData.data[i + 0] - 128) + 128, 255));
            imageData.data[i + 1] = Math.max(0, Math.min(contrastCorrFactor * (imageData.data[i + 1] - 128) + 128, 255));
            imageData.data[i + 2] = Math.max(0, Math.min(contrastCorrFactor * (imageData.data[i + 2] - 128) + 128, 255));
        }
    } else if (dataType == 'channelR') {
        for (var i = 0 ; i < imageData.data.length ; i+=4) {
            imageData.data[i + 0] = Math.max(0, Math.min(contrastCorrFactor * (imageData.data[i + 0] - 128) + 128, 255));
        }
    } else if (dataType == 'channelG') {
        for (var i = 0 ; i < imageData.data.length ; i+=4) {
            imageData.data[i + 1] = Math.max(0, Math.min(contrastCorrFactor * (imageData.data[i + 1] - 128) + 128, 255));
        }
    } else if (dataType == 'channelB') {
        for (var i = 0 ; i < imageData.data.length ; i+=4) {
            imageData.data[i + 2] = Math.max(0, Math.min(contrastCorrFactor * (imageData.data[i + 2] - 128) + 128, 255));
        }
    }
    return imageData;
}

function gamma(imageData, dataType, factor) {
    var gFactor = 1 / (factor * (7.99 - 0.01) + 0.01);
    if (dataType == 'image') {
        for (var i = 0 ; i < imageData.data.length ; i+=4) {
            imageData.data[i + 0] =  Math.max(0, Math.min(255 * Math.pow(imageData.data[i + 0] / 255.0, gFactor), 255));
            imageData.data[i + 1] = Math.max(0, Math.min(255 * Math.pow(imageData.data[i + 1] / 255.0, gFactor), 255));
            imageData.data[i + 2] = Math.max(0, Math.min(255 * Math.pow(imageData.data[i + 2] / 255.0, gFactor), 255));
        }
    } else if (dataType == 'channelR') {
        for (var i = 0 ; i < imageData.data.length ; i+=4) {
            imageData.data[i + 0] =  Math.max(0, Math.min(255 * Math.pow(imageData.data[i + 0] / 255.0, gFactor), 255));
        }
    } else if (dataType == 'channelG') {
        for (var i = 0 ; i < imageData.data.length ; i+=4) {
            imageData.data[i + 1] = Math.max(0, Math.min(255 * Math.pow(imageData.data[i + 1] / 255.0, gFactor), 255));
        }
    } else if (dataType == 'channelB') {
        for (var i = 0 ; i < imageData.data.length ; i+=4) {
            imageData.data[i + 2] = Math.max(0, Math.min(255 * Math.pow(imageData.data[i + 2] / 255.0, gFactor), 255));
        }
    }
    return imageData;
}

var palette = [
    [0, 0, 0],      // Black
    [255, 0, 0],    // Red
    [0, 255, 0],    // Green
    [0, 0, 255],    // Blue
    [255, 255, 0],  // Yellow
    [0, 255, 255],  // Cyan
    [255, 0, 255],  // Magenta
    [255, 255, 255] // White
];

var maxDistace = 195075;
var rDiff, gDiff, bDiff;

function paletteConvert(imageData) {
    var nearColor;
    for (var i = 0 ; i < imageData.data.length ; i+=4) {
        nearColor = nearestColor(imageData.data[i + 0], imageData.data[i + 1], imageData.data[i + 2]);
        imageData.data[i + 0] = nearColor[0];
        imageData.data[i + 1] = nearColor[1];
        imageData.data[i + 2] = nearColor[2];
    }
    return imageData;
}

function nearestColor(r, g, b) {
    var minimumDistance = maxDistace;
    var distance, nearColor;
    for(var color of palette)
    {
        rDiff = r - color[0];
        gDiff = g - color[1];
        bDiff = b - color[2];
        distance = rDiff*rDiff + gDiff*gDiff + bDiff*bDiff;
        if(distance < minimumDistance)
        {
            minimumDistance = distance;
            nearColor = color;
        }
    }
    return nearColor;
}