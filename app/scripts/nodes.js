var Connector = function(terminalStart, terminalStartNode) {
    this.terminalStart = terminalStart;
    this.terminalStartNode = terminalStartNode;
    this.x1 = terminalStart.x;
    this.y1 = terminalStart.y;
    this.guid = getNewGUID();
}

Connector.prototype.draw = function (x2, y2) {
    context.beginPath();
    this.x1 = this.terminalStart.x;
    this.y1 = this.terminalStart.y;
    this.x2 = x2;
    this.y2 = y2;
    this.x11 = this.x1 + globalConnectorBezierOffset;
    this.y11 = this.y1;
    this.x22 = this.x2 - globalConnectorBezierOffset;
    this.y22 = y2;
    this.xmid = (this.x11 + this.x22) / 2;
    this.ymid = (this.y11 + this.y22) / 2;

    context.moveTo(this.x1, this.y1);
    context.quadraticCurveTo(this.x11, this.y11, this.xmid, this.ymid);
    context.moveTo(this.xmid, this.ymid);
    context.quadraticCurveTo(this.x22, this.y22, this.x2, this.y2);
    
    context.save();
    context.strokeStyle = "#7fff00aa";
    context.lineWidth = Math.round(globalConnectorWidth).toString();
    context.lineCap = "round";
    context.shadowColor = "#7fff00";
    context.shadowBlur = 5;
    context.stroke();
    context.restore();
}

Connector.prototype.connect = function(terminalEnd, terminalEndNode) {
    //console.log('connecting...');
    if (terminalEnd.type == 'out') {
        //console.log('connect attempt to out, aborting');
        currentConnector.terminalStart.connector = null;
        currentConnector = null;
        redraw(true);
    } else {
        //console.log('clean attempt');
        if (terminalEnd.connector != null) {
            //console.log('end terminal already connected, splicing...');
            terminalEnd.connector.terminalStart.connector = null;
            connectors.splice(connectors.indexOf(terminalEnd.connector), 1);
            terminalEnd.connector = null;
        }

        this.terminalEnd = terminalEnd;
        this.terminalEndNode = terminalEndNode;
        this.x2 = terminalEnd.x;
        this.y2 = terminalEnd.y;
        this.terminalStart.connector = this;
        this.terminalEnd.connector = this;

        //console.log('pushed connector');
        connectors.push(currentConnector);
        this.terminalStart.pass(this.terminalEnd);
        if (typeof(this.terminalEnd.onConnect) == 'function') {
            this.terminalEnd.onConnect(this.terminalStart);
        }

        currentConnector = null;
        redraw(true);
    }
}

var ImageSourceNode = function(x, y, width, order, hPadding, vSpacing) {
    this.guid = getNewGUID();

    var newThumbnail = new Thumbnail(globalBaseHeight * 3, (newData, channels) => {
        //console.log('onImageChange');
        this.node.outputTerminals[0].setData(newData);
        this.node.outputTerminals[1].setData(channels[0]);
        this.node.outputTerminals[2].setData(channels[1]);
        this.node.outputTerminals[3].setData(channels[2]);
    });

    this.node = new BaseNode(x, y, width, order, 'imagesource', 'ImageSource', '#76ff76aa', hPadding, vSpacing, [], [
        new Terminal('out', 'image', globalTerminalRadius, newThumbnail.imageData),
        new Terminal('out', 'channelR', globalTerminalRadius, null),
        new Terminal('out', 'channelG', globalTerminalRadius, null),
        new Terminal('out', 'channelB', globalTerminalRadius, null)
    ]);
    this.node.parent = this;
    this.node.addComponent(newThumbnail);
    this.node.addComponent(new HorizontalLayout(globalBaseHeight, [], 5));

    this.draw();
}

ImageSourceNode.prototype.draw = function() {
    this.node.update();
    this.node.draw();
}

ImageSourceNode.prototype.checkBounds = function (x, y) {
    if (x > (this.node.x - (this.node.width / 2) - (globalTerminalRadius / 2)) && x < (this.node.x + (this.node.width / 2) + (globalTerminalRadius / 2)) && y > (this.node.y - (this.node.height / 2)) && y < (this.node.y + (this.node.height / 2)))
        return true;
    return false;
}

ImageSourceNode.prototype.scale = function() {
    this.node.scale();
}

ImageSourceNode.prototype.clicked = function(pos) {
    this.node.clicked(pos);
}

ImageSourceNode.prototype.update = function() {
    this.node.update();
}

var GrayscaleNode = function(x, y, width, order, hPadding, vSpacing) {
    this.guid = getNewGUID();
    this.config = {
        type: 'average'
    }

    var newChoiceGroup = new ChoiceGroup(['Average', 'Weighted'], 0, (choice) => {
        this.config.type = choice.toLowerCase();
        isOutputConnected(this.node);
    });

    this.node = new BaseNode(x, y, width, order, 'grayscale', 'GrayScale', '#76ff76aa', hPadding, vSpacing, [
        new Terminal('in', 'image', globalTerminalRadius, null)
    ], [
        new Terminal('out', 'image', globalTerminalRadius, null)
    ]);
    this.node.parent = this;
    this.node.addComponent(newChoiceGroup);

    this.draw();
}

GrayscaleNode.prototype.draw = function() {
    this.node.update();
    this.node.draw();
}

GrayscaleNode.prototype.checkBounds = function (x, y) {
    if (x > (this.node.x - (this.node.width / 2) - (globalTerminalRadius / 2)) && x < (this.node.x + (this.node.width / 2) + (globalTerminalRadius / 2)) && y > (this.node.y - (this.node.height / 2)) && y < (this.node.y + (this.node.height / 2)))
        return true;
    return false;
}

GrayscaleNode.prototype.scale = function() {
    this.node.scale();
}

GrayscaleNode.prototype.clicked = function(pos) {
    this.node.clicked(pos);
}

GrayscaleNode.prototype.update = function() {
    this.node.update();
}

var BinarizeNode = function(x, y, width, order, hPadding, vSpacing) {
    this.guid = getNewGUID();
    this.config = {
        threshold: 40
    }
    
    var newLabel = new Label(globalBaseHeight, 'Threshold', 'left');
    var newLabelValue = new Label(globalBaseHeight, this.config.threshold, 'right');
    var newHozLayout = new HorizontalLayout(globalBaseHeight, [newLabel, newLabelValue], 5);

    var newSlider = new Slider(globalBaseHeight, globalBaseHeight * 0.5, 0, 255, 40, (value) => {
        this.config.threshold = value;
        newLabelValue.setLabel(this.config.threshold.toString());
    });

    this.node = new BaseNode(x, y, width, order, 'binarize', 'Binarize', '#76ff76aa', hPadding, vSpacing, [
        new Terminal('in', 'image', globalTerminalRadius, null)
    ], [
        new Terminal('out', 'image', globalTerminalRadius, null)
    ]);
    this.node.parent = this;
    this.node.addComponent(newHozLayout);
    this.node.addComponent(newSlider);

    this.draw();
}

BinarizeNode.prototype.draw = function() {
    this.node.update();
    this.node.draw();
}

BinarizeNode.prototype.checkBounds = function (x, y) {
    if (x > (this.node.x - (this.node.width / 2) - (globalTerminalRadius / 2)) && x < (this.node.x + (this.node.width / 2) + (globalTerminalRadius / 2)) && y > (this.node.y - (this.node.height / 2)) && y < (this.node.y + (this.node.height / 2)))
        return true;
    return false;
}

BinarizeNode.prototype.scale = function() {
    this.node.scale();
}

BinarizeNode.prototype.clicked = function(pos) {
    this.node.clicked(pos);
}

BinarizeNode.prototype.update = function() {
    this.node.update();
}

var LayerNode = function(x, y, width, order, hPadding, vSpacing) {
    this.guid = getNewGUID();
    this.config = {
        alphas: [100, 50]
    }

    var label1 = new Label(globalBaseHeight, this.config.alphas[0].toString(), 'right');
    var slider1 = new Slider(globalBaseHeight, globalBaseHeight * 0.5, 0, 100, 100, (value) => {
        this.config.alphas[0] = value;
        label1.setLabel(this.config.alphas[0].toString());
    });
    var hozLayout1 = new HorizontalLayout(globalBaseHeight, [slider1, label1], 5, [.7, .3]);

    var label2 = new Label(globalBaseHeight, this.config.alphas[1].toString(), 'right');
    var slider2 = new Slider(globalBaseHeight, globalBaseHeight * 0.5, 0, 100, 50, (value) => {
        this.config.alphas[1] = value;
        label2.setLabel(this.config.alphas[1].toString());
    });
    var hozLayout2 = new HorizontalLayout(globalBaseHeight, [slider2, label2], 5, [.7, .3]);

    var newButton = new Button(globalBaseHeight * 0.85, 'Add', () => {
        var index = this.config.alphas.length;
        this.config.alphas.push(50);

        var label = new Label(globalBaseHeight, this.config.alphas[index].toString(), 'right');
        var slider = new Slider(globalBaseHeight, globalBaseHeight * 0.5, 0, 100, 50, (value) => {
            this.config.alphas[index] = value;
            label.setLabel(this.config.alphas[index].toString());
        });
        var hozLayout = new HorizontalLayout(globalBaseHeight, [slider, label], 5, [.7, .3]);
        this.node.addComponent(hozLayout, null, this.node.components.length - 2);
        this.node.addTerminal(new Terminal('in', 'image|channelR|channelG|channelB', globalTerminalRadius, null));
    });

    this.node = new BaseNode(x, y, width, order, 'layer', 'Layer', '#76ff76aa', hPadding, vSpacing, [
        new Terminal('in', 'image|channelR|channelG|channelB', globalTerminalRadius, null),
        new Terminal('in', 'image|channelR|channelG|channelB', globalTerminalRadius, null)
    ], [
        new Terminal('out', 'image', globalTerminalRadius, null)
    ]);
    this.node.parent = this;
    this.node.addComponent(hozLayout1);
    this.node.addComponent(hozLayout2);
    this.node.addComponent(new HorizontalLayout(globalBaseHeight, [], 5));
    this.node.addComponent(newButton, this.node.width * 0.4);

    this.draw();
}

LayerNode.prototype.draw = function() {
    this.node.update();
    this.node.draw();
}

LayerNode.prototype.checkBounds = function (x, y) {
    if (x > (this.node.x - (this.node.width / 2) - (globalTerminalRadius / 2)) && x < (this.node.x + (this.node.width / 2) + (globalTerminalRadius / 2)) && y > (this.node.y - (this.node.height / 2)) && y < (this.node.y + (this.node.height / 2)))
        return true;
    return false;
}

LayerNode.prototype.scale = function() {
    this.node.scale();
}

LayerNode.prototype.clicked = function(pos) {
    //console.log('LayerNode:clicked');
    this.node.clicked(pos);
}

LayerNode.prototype.update = function() {
    this.node.update();
}

var BrightnessNode = function(x, y, width, order, hPadding, vSpacing) {
    this.guid = getNewGUID();
    this.config = {
        factor: 0
    }

    var label = new Label(globalBaseHeight, 'Factor', 'left');
    var labelValue = new Label(globalBaseHeight, this.config.factor, 'right');
    var hozLayout = new HorizontalLayout(globalBaseHeight, [label, labelValue], 5);
    var slider = new Slider(globalBaseHeight, globalBaseHeight * 0.5, -100, 100, 0, (value) => {
        this.config.factor = value;
        labelValue.setLabel(this.config.factor.toString());
    })

    var outTerminal = new Terminal('out', 'image|channelR|channelG|channelB', globalTerminalRadius, null);
    var inTerminal = new Terminal('in', 'image|channelR|channelG|channelB', globalTerminalRadius, null, (startTerminal) => {
        outTerminal.category = startTerminal.category;
    });
    this.node = new BaseNode(x, y, width, order, 'brightness', 'Brightness', '#76ff76aa', hPadding, vSpacing, [
        inTerminal
    ], [
        outTerminal
    ]);
    this.node.parent = this;
    this.node.addComponent(hozLayout);
    this.node.addComponent(slider);

    this.draw();
}

BrightnessNode.prototype.draw = function() {
    this.node.update();
    this.node.draw();
}

BrightnessNode.prototype.checkBounds = function (x, y) {
    if (x > (this.node.x - (this.node.width / 2) - (globalTerminalRadius / 2)) && x < (this.node.x + (this.node.width / 2) + (globalTerminalRadius / 2)) && y > (this.node.y - (this.node.height / 2)) && y < (this.node.y + (this.node.height / 2)))
        return true;
    return false;
}

BrightnessNode.prototype.scale = function() {
    this.node.scale();
}

BrightnessNode.prototype.clicked = function(pos) {
    this.node.clicked(pos);
}

BrightnessNode.prototype.update = function() {
    this.node.update();
}

var ContrastNode = function(x, y, width, order, hPadding, vSpacing) {
    this.guid = getNewGUID();
    this.config = {
        factor: 0
    }

    var label = new Label(globalBaseHeight, 'Factor', 'left');
    var labelValue = new Label(globalBaseHeight, this.config.factor, 'right');
    var hozLayout = new HorizontalLayout(globalBaseHeight, [label, labelValue], 5);
    var slider = new Slider(globalBaseHeight, globalBaseHeight * 0.5, -100, 100, 0, (value) => {
        this.config.factor = value;
        labelValue.setLabel(this.config.factor.toString());
    })

    var outTerminal = new Terminal('out', 'image|channelR|channelG|channelB', globalTerminalRadius, null);
    var inTerminal = new Terminal('in', 'image|channelR|channelG|channelB', globalTerminalRadius, null, (startTerminal) => {
        outTerminal.category = startTerminal.category;
    });
    this.node = new BaseNode(x, y, width, order, 'contrast', 'Contrast', '#76ff76aa', hPadding, vSpacing, [
        inTerminal
    ], [
        outTerminal
    ]);
    this.node.parent = this;
    this.node.addComponent(hozLayout);
    this.node.addComponent(slider);

    this.draw();
}

ContrastNode.prototype.draw = function() {
    this.node.update();
    this.node.draw();
}

ContrastNode.prototype.checkBounds = function (x, y) {
    if (x > (this.node.x - (this.node.width / 2) - (globalTerminalRadius / 2)) && x < (this.node.x + (this.node.width / 2) + (globalTerminalRadius / 2)) && y > (this.node.y - (this.node.height / 2)) && y < (this.node.y + (this.node.height / 2)))
        return true;
    return false;
}

ContrastNode.prototype.scale = function() {
    this.node.scale();
}

ContrastNode.prototype.clicked = function(pos) {
    this.node.clicked(pos);
}

ContrastNode.prototype.update = function() {
    this.node.update();
}

var GammaNode = function(x, y, width, order, hPadding, vSpacing) {
    this.guid = getNewGUID();
    this.config = {
        factor: 25
    }

    var label = new Label(globalBaseHeight, 'Factor', 'left');
    var labelValue = new Label(globalBaseHeight, this.config.factor, 'right');
    var hozLayout = new HorizontalLayout(globalBaseHeight, [label, labelValue], 5);
    var slider = new Slider(globalBaseHeight, globalBaseHeight * 0.5, 0, 100, 25, (value) => {
        this.config.factor = value;
        labelValue.setLabel(this.config.factor.toString());
    })

    var outTerminal = new Terminal('out', 'image|channelR|channelG|channelB', globalTerminalRadius, null);
    var inTerminal = new Terminal('in', 'image|channelR|channelG|channelB', globalTerminalRadius, null, (startTerminal) => {
        outTerminal.category = startTerminal.category;
    });
    this.node = new BaseNode(x, y, width, order, 'gamma', 'Gamma', '#76ff76aa', hPadding, vSpacing, [
        inTerminal
    ], [
        outTerminal
    ]);
    this.node.parent = this;
    this.node.addComponent(hozLayout);
    this.node.addComponent(slider);

    this.draw();
}

GammaNode.prototype.draw = function() {
    this.node.update();
    this.node.draw();
}

GammaNode.prototype.checkBounds = function (x, y) {
    if (x > (this.node.x - (this.node.width / 2) - (globalTerminalRadius / 2)) && x < (this.node.x + (this.node.width / 2) + (globalTerminalRadius / 2)) && y > (this.node.y - (this.node.height / 2)) && y < (this.node.y + (this.node.height / 2)))
        return true;
    return false;
}

GammaNode.prototype.scale = function() {
    this.node.scale();
}

GammaNode.prototype.clicked = function(pos) {
    this.node.clicked(pos);
}

GammaNode.prototype.update = function() {
    this.node.update();
}

var ReducePaletteNode = function(x, y, width, order, hPadding, vSpacing) {
    this.guid = getNewGUID();
    this.config = {
    }

    this.node = new BaseNode(x, y, width, order, 'reducepalette', 'ReducePalette', '#76ff76aa', hPadding, vSpacing, [
        new Terminal('in', 'image', globalTerminalRadius, null)
    ], [
        new Terminal('out', 'image', globalTerminalRadius, null)
    ]);
    this.node.parent = this;
    this.node.addComponent(new HorizontalLayout(globalBaseHeight, [], 5));

    this.draw();
}

ReducePaletteNode.prototype.draw = function() {
    this.node.update();
    this.node.draw();
}

ReducePaletteNode.prototype.checkBounds = function (x, y) {
    if (x > (this.node.x - (this.node.width / 2) - (globalTerminalRadius / 2)) && x < (this.node.x + (this.node.width / 2) + (globalTerminalRadius / 2)) && y > (this.node.y - (this.node.height / 2)) && y < (this.node.y + (this.node.height / 2)))
        return true;
    return false;
}

ReducePaletteNode.prototype.scale = function() {
    this.node.scale();
}

ReducePaletteNode.prototype.clicked = function(pos) {
    this.node.clicked(pos);
}

ReducePaletteNode.prototype.update = function() {
    this.node.update();
}

var CombineChannelNode = function(x, y, width, order, hPadding, vSpacing) {
    this.guid = getNewGUID();
    this.config = {
        
    }

    this.node = new BaseNode(x, y, width, order, 'combinechannel', 'Combine Channel', '#76ff76aa', hPadding, vSpacing, [
        new Terminal('in', 'channelR|channelH', globalTerminalRadius, null),
        new Terminal('in', 'channelG|channelS', globalTerminalRadius, null),
        new Terminal('in', 'channelB|channelV', globalTerminalRadius, null)
    ], [
        new Terminal('out', 'image', globalTerminalRadius, null)
    ]);
    this.node.parent = this;
    this.node.addComponent(new HorizontalLayout(globalBaseHeight, [], 5));
    this.node.addComponent(new HorizontalLayout(globalBaseHeight, [], 5));
    this.node.addComponent(new HorizontalLayout(globalBaseHeight, [], 5));

    this.draw();
}

CombineChannelNode.prototype.draw = function() {
    this.node.update();
    this.node.draw();
}

CombineChannelNode.prototype.checkBounds = function (x, y) {
    if (x > (this.node.x - (this.node.width / 2) - (globalTerminalRadius / 2)) && x < (this.node.x + (this.node.width / 2) + (globalTerminalRadius / 2)) && y > (this.node.y - (this.node.height / 2)) && y < (this.node.y + (this.node.height / 2)))
        return true;
    return false;
}

CombineChannelNode.prototype.scale = function() {
    this.node.scale();
}

CombineChannelNode.prototype.clicked = function(pos) {
    this.node.clicked(pos);
}

CombineChannelNode.prototype.update = function() {
    this.node.update();
}

var ColorConvertNode = function(x, y, width, order, hPadding, vSpacing) {
    this.guid = getNewGUID();
    this.config = {
        convertTo: 'hsv'
    }

    var newChoiceGroup = new ChoiceGroup(['HSV'], 0, (choice) => {
        this.config.convertTo = choice.toLowerCase();
        isOutputConnected(this.node);
    });

    this.node = new BaseNode(x, y, width, order, 'colorconvert', 'Color Convert', '#76ff76aa', hPadding, vSpacing, [
        new Terminal('in', 'image', globalTerminalRadius, null)
    ], [
        new Terminal('out', 'channelH', globalTerminalRadius, null),
        new Terminal('out', 'channelS', globalTerminalRadius, null),
        new Terminal('out', 'channelV', globalTerminalRadius, null)
    ]);
    this.node.parent = this;
    this.node.addComponent(newChoiceGroup);

    this.draw();
}

var OutputNode = function(x, y, width, order, hPadding, vSpacing) {
    this.guid = getNewGUID();
    this.node = new BaseNode(x, y, width, order, 'output', 'Output', '#ff6347aa', hPadding, vSpacing, [
        new Terminal('in', 'image|channelR|channelG|channelB', globalTerminalRadius, null)
    ], []);
    this.node.parent = this;
    this.node.addComponent(new Label(globalBaseHeight, 'ImageOutput', 'left'));

    this.draw();
}

OutputNode.prototype.draw = function() {
    this.node.update();
    this.node.draw();
}

OutputNode.prototype.checkBounds = function (x, y) {
    if (x > (this.node.x - (this.node.width / 2) - (globalTerminalRadius / 2)) && x < (this.node.x + (this.node.width / 2) + (globalTerminalRadius / 2)) && y > (this.node.y - (this.node.height / 2)) && y < (this.node.y + (this.node.height / 2)))
        return true;
    return false;
}

OutputNode.prototype.scale = function() {
    this.node.scale();
}

OutputNode.prototype.clicked = function(pos) {
    this.node.clicked(pos);
}

OutputNode.prototype.update = function() {
    this.node.update();
}