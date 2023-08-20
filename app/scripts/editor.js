var context = editorCanvas.getContext('2d');
var editorWidth = editorCanvas.getAttribute('width');
var editorHeight = editorCanvas.getAttribute('height');

var gSFactor = 1.0;

var globalFontSize = editorWidth * 0.014;
var globalRadius = editorWidth * 0.008;
var globalTerminalOffset = editorWidth * 0.01;
var globalTerminalRadius = 5;
var globalOffset = editorWidth * 0.01;
var globalBaseHeight = editorWidth * 0.1 * 0.25;
var globalConnectorBezierOffset = editorWidth * 0.06;
var globalConnectorWidth = editorWidth * 0.006;
var globalOutlineWidth = 2;

var globalScaleRatio = 1; //experimental
var downScaleStep = 0.9;
var upScaleStep = 1.1;

var shiftStatus = false;
var selectedNodes = [];

var nodes = [];
var connectors = [];

var terminalStartFlag = 0;
var currentConnector = null;

var nodeDragFlag = 0;
var currentDragNode = null;
var dragDelta = { x: 0, y: 0 };
var wasDragging = false;

var sliderDragFlag = 0;
var currSlider = null;

var panStart = { x: 0, y: 0 };
var panDelta = { x: 0, y: 0 };
var panFlag = 0;

var currNodeInContextMenu = null;
var currentContextMenu = null;
var isContextMenuOpened = false;

var mousePos = {
    x: 0,
    y: 0
};

pushOutputNode();

document.addEventListener('keydown', (event) => {
    if (!shiftStatus && event.keyCode == 16) {
        shiftStatus = true;
    }
}, true);

document.addEventListener('keyup', (event) => {
    if (event.keyCode == 16) {
        shiftStatus = false;
    }
}, true);

document.addEventListener("dragstart", function (event) {
    if (event.target.id && event.target.classList.length > 0 && event.target.classList.contains('icon')) {
        event.dataTransfer.setData("newNode", event.target.id.replace('Icon', ''));
    }
});

editorCanvas.addEventListener("dragover", function () {
    event.preventDefault();
}, true);

editorCanvas.addEventListener("drop", function () {
    event.preventDefault();
    globalScaleRatio = (nodes.length > 0) ? nodes[0].node.scaleRatio : 1;

    var draggedItemText = event.dataTransfer.getData("newNode");
    var pos = getMousePos(editorCanvas, event);
    var width;

    switch(draggedItemText) {
        case 'image': {
            width = editorWidth * 0.30 * globalScaleRatio;
            var newImageSourceNode = new ImageSourceNode(pos.x, pos.y, width, nodes.length, globalOffset * 1.5, globalOffset * 0.7);
            nodes.unshift(newImageSourceNode);
            
            break;
        }
        case 'grayscale': {
            width = editorWidth * 0.15 * globalScaleRatio;
            var newGrayscaleNode = new GrayscaleNode(pos.x, pos.y, width, nodes.length, globalOffset * 1.5, globalOffset * 0.7);
            nodes.unshift(newGrayscaleNode);
            
            break;
        }
        case 'binarize': {
            width = editorWidth * 0.30 * globalScaleRatio;
            var newBinarizeNode = new BinarizeNode(pos.x, pos.y, width, nodes.length, globalOffset * 1.5, globalOffset * 0.7);
            nodes.unshift(newBinarizeNode);

            break;
        }
        case 'layer': {
            width = editorWidth * 0.30 * globalScaleRatio;
            var newLayerNode = new LayerNode(pos.x, pos.y, width, nodes.length, globalOffset * 1.5, globalOffset * 0.7);
            nodes.unshift(newLayerNode);

            break;
        }
        case 'combinechannel': {
            width = editorWidth * 0.20 * globalScaleRatio;
            var newCombineChannel = new CombineChannelNode(pos.x, pos.y, width, nodes.length, globalOffset * 1.5, globalOffset * 0.7);
            nodes.unshift(newCombineChannel);

            break;
        }
        case 'brightness': {
            width = editorWidth * 0.25 * globalScaleRatio;
            var newBrightness = new BrightnessNode(pos.x, pos.y, width, nodes.length, globalOffset * 1.5, globalOffset * 0.7);
            nodes.unshift(newBrightness);

            break;
        }
        case 'contrast': {
            width = editorWidth * 0.25 * globalScaleRatio;
            var newContrast = new ContrastNode(pos.x, pos.y, width, nodes.length, globalOffset * 1.5, globalOffset * 0.7);
            nodes.unshift(newContrast);

            break;
        }
        case 'reducepalette': {
            width = editorWidth * 0.18 * globalScaleRatio;
            var newReducePalette = new ReducePaletteNode(pos.x, pos.y, width, nodes.length, globalOffset * 1.5, globalOffset * 0.7);
            nodes.unshift(newReducePalette);

            break;
        }
        case 'gamma': {
            width = editorWidth * 0.25 * globalScaleRatio;
            var newGamma = new GammaNode(pos.x, pos.y, width, nodes.length, globalOffset * 1.5, globalOffset * 0.7);
            nodes.unshift(newGamma);

            break;
        }
        default: {
            break;
        }
    }
}, true);

editorCanvas.addEventListener('click', (event) => {
    var pos = getMousePos(editorCanvas, event);
    var node = getNodeFromMousePos(pos);
    if (node == null || typeof(node) == 'undefined') {
        selectedNodes = [];
        redraw(true);
    } else {
        //console.log('canvasClick');
        node.clicked(pos);
        if (wasDragging) wasDragging = false;
    }
}, true);

editorCanvas.addEventListener("mousewheel", function (event) {
    if (event.wheelDelta < 0) {
        gSFactor = downScaleStep;
    }
    else if (event.wheelDelta > 0) {
        gSFactor = upScaleStep;
    }
    var pos = getMousePos(editorCanvas, event);

    globalFontSize *= gSFactor;
    globalRadius *= gSFactor;
    globalTerminalOffset *= gSFactor;
    globalTerminalRadius *= gSFactor;
    globalOffset *= gSFactor;
    globalBaseHeight *= gSFactor;
    globalConnectorBezierOffset *= gSFactor;
    globalConnectorWidth *= gSFactor;
    globalOutlineWidth *= gSFactor;

    for (var i = 0; i < nodes.length; i++){
        if (nodes[i].node.x > pos.x && nodes[i].node.y > pos.y) {
            nodes[i].node.x = (pos.x + gSFactor * (Math.abs(pos.x - nodes[i].node.x)));
            nodes[i].node.y = (pos.y + gSFactor * (Math.abs(pos.y - nodes[i].node.y)));
        }
        else if (nodes[i].node.x > pos.x && nodes[i].node.y < pos.y){
            nodes[i].node.x = (pos.x + gSFactor * (Math.abs(pos.x - nodes[i].node.x)));
            nodes[i].node.y = (pos.y - gSFactor * (Math.abs(pos.y - nodes[i].node.y)));
        }
        else if (nodes[i].node.x < pos.x && nodes[i].node.y > pos.y){
            nodes[i].node.x = (pos.x - gSFactor * (Math.abs(pos.x - nodes[i].node.x)));
            nodes[i].node.y = (pos.y + gSFactor * (Math.abs(pos.y - nodes[i].node.y)));
        }
        else if (nodes[i].node.x < pos.x && nodes[i].node.y < pos.y){
            nodes[i].node.x = (pos.x - gSFactor * (Math.abs(pos.x - nodes[i].node.x)));
            nodes[i].node.y = (pos.y - gSFactor * (Math.abs(pos.y - nodes[i].node.y)));
        }
    }

    for (var i = 0; i < nodes.length; i++){
        nodes[i].scale();
    }

    redraw(true);
}, true);

editorCanvas.addEventListener('mousedown', (event) => {
    if (event.which == 1) {
        var pos = getMousePos(editorCanvas, event);
        var node = getNodeFromMousePos(pos);
        var slider = null;
        if (node != null) slider = node.node.checkSliderBounds(pos);
        if (slider != null) {
            currSlider = slider;
            sliderDragFlag = 1;
        } else if (node != null && nodeDragFlag == 0 && typeof(node) != 'undefined') {
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
}, true);

editorCanvas.addEventListener('mousemove', (event) => {
    mousePos = getMousePos(editorCanvas, event);
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
        context.clearRect(0, 0, editorWidth, editorHeight);
        currentConnector.draw(mousePos.x, mousePos.y);
        redraw(false);
    }
    if (sliderDragFlag == 1) {
        currSlider.slide(mousePos.x);
        redraw(true);
    }
}, true);

editorCanvas.addEventListener('mouseup', (event) => {
    var pos = getMousePos(editorCanvas, event);

    if (nodeDragFlag == 1) {
        currentDragNode = null;
        nodeDragFlag = 0;
    } else if(panFlag == 1) {
        panFlag = 0;
        panDelta.x = panDelta.y = panStart.x = panStart.y = 0;
    } else if (sliderDragFlag == 1) {
        sliderDragFlag = 0;
        var baseNode = currSlider.parent;
        while (!Array.isArray(baseNode.inputTerminals)) {
            baseNode = baseNode.parent;
        }
        isOutputConnected(baseNode);
        currSlider = null;
        currentDragNode = null;
    }
});

editorCanvas.addEventListener("contextmenu", function () { event.preventDefault(); }, true);


function getNewGUID() {
    var S4 = function () {
        return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
    };
    return (S4() + S4() + "-" + S4() + "-" + S4() + "-" + S4() + "-" + S4() + S4() + S4());
}

function getMousePos(canvas, evt) {
    var rect = canvas.getBoundingClientRect();
    return {
        x: evt.clientX - rect.left,
        y: evt.clientY - rect.top
    };
}

function debugPoint(x, y) {
    setTimeout( () => {
        context.beginPath();
        context.arc(x, y, 3, 0, 2 * Math.PI);
        context.fillStyle = '#f00';
        context.fill();
    }, 100);
}

function debugObject(obj) {
    setTimeout( () => {
        context.beginPath();
        context.arc(obj.x, obj.y, 3, 0, 2 * Math.PI);
        context.fillStyle = '#f00';
        context.fill();

        context.beginPath();
        context.moveTo(obj.x - (obj.width / 2), obj.y);
        context.lineTo(obj.x + (obj.width / 2), obj.y);
        context.strokeStyle = '#f00';
        context.lineWidth = '1';
        context.stroke();

        context.beginPath();
        context.moveTo(obj.x, obj.y - (obj.height / 2));
        context.lineTo(obj.x, obj.y + (obj.height / 2));
        context.strokeStyle = '#f00';
        context.lineWidth = '1';
        context.stroke();
    });
}

function debugComponent(component) {
    setTimeout( () => {
        context.beginPath();
        context.arc(component.parent.x - (component.parent.width / 2) + component.x, component.parent.y - (component.parent.height / 2) + component.y, 3, 0, 2 * Math.PI);
        context.fillStyle = '#f00';
        context.fill();

        context.beginPath();
        context.moveTo(component.parent.x - (component.parent.width / 2) + component.x - (component.width / 2), component.parent.y - (component.parent.height / 2) + component.y);
        context.lineTo(component.parent.x - (component.parent.width / 2) + component.x + (component.width / 2), component.parent.y - (component.parent.height / 2) + component.y);
        context.strokeStyle = '#f00';
        context.lineWidth = '1';
        context.stroke();

        context.beginPath();
        context.moveTo(component.parent.x - (component.parent.width / 2) + component.x, component.parent.y - (component.parent.height / 2) + component.y - (component.height / 2));
        context.lineTo(component.parent.x - (component.parent.width / 2) + component.x, component.parent.y - (component.parent.height / 2) + component.y + (component.height / 2));
        context.strokeStyle = '#f00';
        context.lineWidth = '1';
        context.stroke();
    });
}

function redraw(clear) {
    if(clear) context.clearRect(0, 0, editorWidth, editorHeight);

    for (var node of nodes) {
        node.update();
    }

    for (var connector of connectors) {
        connector.draw(connector.terminalEnd.x, connector.terminalEnd.y);
    }

    for (var node of nodes) {
        node.draw();
    }
}

function redrawWithDelta(delta) {
    context.clearRect(0, 0, editorWidth, editorHeight);

    for (var node of nodes) {
        node.node.x += delta.x;
        node.node.y += delta.y;
    }

    for (var connector of connectors) {
        connector.draw(connector.terminalEnd.x, connector.terminalEnd.y);
    }

    for (var node of nodes) {
        node.update();
        node.draw();
    }
}

function getNodeFromMousePos(pos) {
    var inbounds = [];
    for (var node of nodes) {
        if (node.checkBounds(pos.x, pos.y)) inbounds.push(node);
    }
    var highestOrder = Math.max.apply(Math, inbounds.map(function(o) { return o.node.order; }));
    return inbounds.find(function (o) { return o.node.order == highestOrder; });
}

function pushOutputNode() {
    var width = editorWidth * 0.20 * globalScaleRatio;
    var newOutputNode = new OutputNode(editorCanvas.width / 2 - (width / 2), editorCanvas.height / 2, width, nodes.length, globalOffset * 1.5, globalOffset * 0.7);

    nodes.push(newOutputNode);
    redraw();
}

function isOutputConnected(node) {
    if (node.type == 'output') {
        renderOutput();
        return;
    }
    // If outputNode is not connected anywhere, no need to render 
    for(var rNode of nodes) {
        if (rNode.node.type == 'output') {
            if (rNode.node.inputTerminals[0].connector == null) return;
            break;
        }
    }
    // If no path exists between node and outputNode, no need to render
    var queue = [];
    var currNode;
    queue.push(node);
    while(queue.length != 0) {
        currNode = queue.shift();
        for(var outputTerminal of currNode.outputTerminals) {
            if(outputTerminal.connector != null) {
                if(outputTerminal.connector.terminalEndNode.type == 'output') {
                    renderOutput();
                    return;
                } else {
                    queue.push(outputTerminal.connector.terminalEndNode);
                }
            }
        }
    }
}

function canConnect(startType, endType) {
    if (endType.includes(startType)) return true;
    return false;
}