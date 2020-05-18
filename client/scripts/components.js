var Terminal = function(type, category, radius, data, onConnect) {
    this.type = type;
    this.category = category;
    this.radius = radius;
    this.connector = null;
    this.guid = getNewGUID();
    this.data = data;

    switch(this.category) {
        case 'scalar': {
            this.color = '#cccccc';
            break;
        }
        default: {
            this.color = '#f00';
            break;
        }
    }
    if (this.category.includes('image'))
        this.color = '#ffff99';
    else if (this.category.includes('channel')) {
        this.color = '#ccccff';
    }

    if (this.type == 'out') {
        Terminal.prototype.pass = function(acceptingTerminal) {
            acceptingTerminal.data = this.data;
            //console.log('data pass success');
            isOutputConnected(acceptingTerminal.parent);
        }
    }
    if (this.type == 'in') {
        this.onConnect = onConnect;
    }
}

Terminal.prototype.draw = function() {
    context.beginPath();
    context.arc(this.x, this.y, this.radius, 0, 2 * Math.PI);
    context.fillStyle = this.color;
    context.strokeStyle = '#000000aa';
    context.fill();
    context.stroke();
}

Terminal.prototype.scale = function() {
    this.radius *= gSFactor;
}

Terminal.prototype.clicked = function(pos) {
    if (pos.x > (this.x - this.radius) && pos.x < (this.x + this.radius) && pos.y > (this.y - this.radius) && pos.y < (this.y + this.radius)) {
        //console.log('Terminal Clicked');
        if (terminalStartFlag == 0) {
            //console.log('TerminalStartFlag : ' + terminalStartFlag);
            //console.log('TerminalType : ' + this.type);
            //console.log('TerminalConnector : ' + (this.connector != null));
            if (this.type != 'in') {
                if (this.connector != null) {
                    this.connector.terminalEnd.connector = null;
                    connectors.splice(connectors.indexOf(this.connector), 1);
                    this.connector = null;
                }
                currentConnector = new Connector(this, this.parent);
                //console.log('assigned current connector');
            } else {
                return;
            }
            terminalStartFlag = 1;
        } else {
            //console.log('TerminalStartFlag : ' + terminalStartFlag);
            if (currentConnector.terminalStart.guid == this.guid || !canConnect(currentConnector.terminalStart.category, this.category)) {
                //console.log(currentConnector.terminalStart.guid + ' ' + this.guid);
                //console.log(currentConnector.terminalStart.category + ' ' + this.category);
                //console.log('Same node or connection rule violation');
                currentConnector.terminalStart.connector = null;
                currentConnector = null;
                redraw(true);
            }
            else {
                //console.log('clean connect');
                currentConnector.connect(this, this.parent);
            }
            terminalStartFlag = 0;
        }
    }
}

Terminal.prototype.setData = function (newData) {
    this.data = newData;
    //console.log('setData');
    if(this.connector != null && this.type == 'out') this.pass(this.connector.terminalEnd);
    else isOutputConnected(this.parent);
}

var Thumbnail = function(height, onImageChange) {
    this.type = 'thumbnail';
    this.height = height;
    this.image = document.createElement('img');
    this.imageData = null;
    this.image.crossOrigin = 'Anonymous';
    this.image.src = '../assets/icons/imageIcon.png';
    this.image.parent = this;
    this.image.onload = function() {
        //console.log('image loaded');
        var canvas = document.createElement('canvas');
        canvas.setAttribute('width', this.width);
        canvas.setAttribute('height', this.height);
        canvas.getContext('2d').drawImage(this, 0, 0);
        this.parent.imageData = canvas.getContext('2d').getImageData(0, 0, canvas.width, canvas.height);
        //console.log('image changed');
        onImageChange(this.parent.imageData, extractRGB(this.parent.imageData));
        this.parent.draw();
    }

    this.htmlInput = document.createElement('input');
    this.htmlInput.type = 'file';
    this.htmlInput.parent = this;
    this.imageFileName = null;
    this.htmlInput.accept = 'image/*';
    this.htmlInput.onchange = function(event) {
        var fileReader = new FileReader();
        fileReader.parent = this;
        this.parent.imageFileName = event.path[0].files[0].name.substring(0, event.path[0].files[0].name.toString().lastIndexOf("."));
        fileReader.onload = function(e) {
            this.parent.parent.image.src = e.target.result;
        }
        fileReader.readAsDataURL(event.path[0].files[0]);
        this.parent.draw();
    }
}

Thumbnail.prototype.draw = function() {
    context.beginPath();
    context.rect(this.parent.x - (this.parent.width / 2) + this.x - (this.width / 2), this.parent.y - (this.parent.height / 2) + this.y - (this.height / 2), this.width, this.height);
    context.fillStyle = '#777777aa';
    context.strokeStyle = '#000000aa';
    context.fill();
    context.stroke();

    var imageWidth, imageHeight;

    if (this.image.width >= this.image.height && this.image.width > this.width) {
        var ratio = this.width / this.image.width;
        imageWidth = this.image.width * ratio;
        imageHeight = this.image.height * ratio;
        if (imageHeight > this.height) {
            var ratio2 =  this.height / imageHeight;
            imageWidth *= ratio2;
            imageHeight *= ratio2;
        }
    } else if (this.image.height >= this.image.width && this.image.height > this.height) {
        var ratio = this.height / this.image.height;
        imageHeight = this.image.height * ratio;
        imageWidth = this.image.width * ratio;

        if (imageWidth > this.width) {
            var ratio2 =  this.width / imageWidth;
            imageWidth *= ratio2;
            imageHeight *= ratio2;
        }
    } else {
        imageWidth = this.image.width;
        imageHeight = this.image.height;
    }

    imageWidth -= globalOffset / 2;
    imageHeight -= globalOffset / 2;

    context.drawImage(this.image, this.parent.x - (this.parent.width / 2) + this.x - (imageWidth / 2), this.parent.y - (this.parent.height / 2) + this.y - (imageHeight / 2), imageWidth, imageHeight);
}

Thumbnail.prototype.scale = function() {
    this.width *= gSFactor;
    this.height *= gSFactor;
    this.x *= gSFactor;
    this.y *= gSFactor;
}

Thumbnail.prototype.clicked = function(pos) {
    if (pos.x > (this.parent.x - (this.parent.width / 2) + this.x - (this.width / 2)) && pos.x < (this.parent.x - (this.parent.width / 2) + this.x + (this.width / 2)) && pos.y > (this.parent.y - (this.parent.height / 2) + this.y - (this.height / 2)) && pos.y < (this.parent.y - (this.parent.height / 2) + this.y + (this.height / 2))) {
        this.htmlInput.click();
    }
}

var HorizontalLayout = function(height, components, spacing, weights) {
    //console.log('HorizontalLayout:constructor');

    this.sliders = [];
    this.type = 'hlayout';
    this.height = height;
    this.components = components;
    this.spacing = spacing;
    this.weights = weights;

    for (var component of components) {
        this.addComponent(component);
        if (component.type == 'slider') this.sliders.push(component);
    }
}

HorizontalLayout.prototype.draw = function() {
    if (Array.isArray(this.weights)) {
        var availableWidth = (this.width - ((this.components.length - 1) * this.spacing));
        var occupiedWidth = 0;
        for (var i = 0 ; i < this.components.length ; i++) {
            this.components[i].width = availableWidth * this.weights[i];
            this.components[i].height = this.height;
            this.components[i].x = this.parent.x - (this.parent.width / 2) + this.x - (this.width / 2) + (i * this.spacing) + occupiedWidth + (this.components[i].width / 2);
            this.components[i].y = this.parent.y - (this.parent.height / 2) + this.y;

            this.components[i].x = this.components[i].x - (this.x - (this.width / 2));
            this.components[i].y = this.components[i].y - (this.y - (this.height / 2));

            this.components[i].draw();
            occupiedWidth += this.components[i].width;
        }
    } else {
        var commonWidth = (this.width - ((this.components.length - 1) * this.spacing)) / this.components.length;
        for (var i = 0 ; i < this.components.length ; i++) {
            this.components[i].width = commonWidth;
            this.components[i].height = this.height;
            this.components[i].x = this.parent.x - (this.parent.width / 2) + this.x - (this.width / 2) + (i * commonWidth) + (commonWidth / 2) + (i * this.spacing);
            this.components[i].y = this.parent.y - (this.parent.height / 2) + this.y;

            this.components[i].x = this.components[i].x - (this.x - (this.width / 2));
            this.components[i].y = this.components[i].y - (this.y - (this.height / 2));

            this.components[i].draw();
        }
    }
}

HorizontalLayout.prototype.addComponent = function(component) {
    component.parent = this;
}

HorizontalLayout.prototype.scale = function() {
    this.width *= gSFactor;
    this.height *= gSFactor;
    this.x *= gSFactor;
    this.y *= gSFactor;

    for(var component of this.components) {
        component.scale();
    }
}

HorizontalLayout.prototype.clicked = function(pos) {
    if (pos.x > (this.parent.x - (this.parent.width / 2) + this.x - (this.width / 2)) && pos.x < (this.parent.x - (this.parent.width / 2) + this.x + (this.width / 2)) && pos.y > (this.parent.y - (this.parent.height / 2) + this.y - (this.height / 2)) && pos.y < (this.parent.y - (this.parent.height / 2) + this.y + (this.height / 2))) {
        for (var component of this.components) {
            component.clicked(pos);
        }
    }
}

HorizontalLayout.prototype.checkSliderBounds = function(pos) {
    for (var slider of this.sliders) {
        if (pos.x > (this.x - (this.width / 2) + slider.x - (slider.width / 2)) && pos.x < (this.x - (this.width / 2) + slider.x + (slider.width / 2)) && pos.y > ((this.y - (this.height / 2) + slider.y) - (slider.thumbRadius)) && pos.y < ((this.y - (this.height / 2) + slider.y) + (slider.thumbRadius))) {
            return slider;
        }
    }
    for (var component of this.components) {
        if (typeof(component.checkSliderBounds) == 'function') {
            if ((sliderC = component.checkSliderBounds(pos)) != null) return sliderC;
        }
    }
    return null;
}

var Label = function(height, label, placement) {
    this.type = 'label';
    this.height = height;
    this.label = label;
    this.placement = placement;
}

Label.prototype.draw = function() {
    context.font = 'bold ' + globalFontSize + 'px arial';
    context.fillStyle = '#000000aa';
    if (this.placement == 'left') {
        context.fillText(this.label, this.parent.x - (this.parent.width / 2) + this.x - (this.width / 2), this.parent.y - (this.parent.height / 2) + this.y + (globalFontSize / 3));
    } else if (this.placement == 'center') {
        context.fillText(this.label, this.parent.x - (this.parent.width / 2) + this.x - (context.measureText(this.label).width / 2), this.parent.y - (this.parent.height / 2) + this.y + (globalFontSize / 3));
    } else {
        context.fillText(this.label, this.parent.x - (this.parent.width / 2) + this.x + (this.width / 2) - context.measureText(this.label).width, this.parent.y - (this.parent.height / 2) + this.y + (globalFontSize / 3));
    }
}

Label.prototype.scale = function() {
    this.width *= gSFactor;
    this.height *= gSFactor;
    this.x *= gSFactor;
    this.y *= gSFactor;
}

Label.prototype.clicked = function(pos) {}

Label.prototype.setLabel = function(newLabel) {
    this.label = newLabel;
}

/* var InputBox = function(height, label, defaultValue, onChange) {
    this.type = 'inputbox';
    this.height = height;
    this.label = label;
    this.input = new CanvasInput({
        canvas: editorCanvas,
        fontSize: globalFontSize,
        padding: 0,
        borderWidth: 0,
        borderColor: 'rgba(0, 0, 0, 0)',
        borderRadius: globalRadius,
        boxShadow: '0px 0px 0px rgba(0, 0, 0, 0)',
        innerShadow: '0px 0px 0px rgba(0, 0, 0, 0)',
        backgroundColor: '#cfcfcf'
    });
    this.input.value(defaultValue);
    this.input.onkeyup(() => {
        onChange(this.input.value());
    });
}

InputBox.prototype.draw = function() {
    if (this.label != null && this.label != undefined && this.label != '') {
        context.font = globalFontSize + 'px arial';
        this.input.width(this.width - context.measureText(this.label).width);
    } else {
        this.input.width(this.width);
    }

    this.input.height(this.height);

    context.fillStyle = '#000000aa';
    context.fillText(this.label, this.parent.x - (this.parent.width  / 2) + this.x - (this.width / 2), this.parent.y - (this.parent.height / 2) + this.y + (globalFontSize / 3));
    this.input.x(this.parent.x - (this.parent.width / 2) + this.x + (this.width / 2) - (this.input.width()));
    this.input.y(this.parent.y - (this.parent.height / 2) + this.y - (this.input.height() / 2));
    this.input.render();
}

InputBox.prototype.scale = function() {
    this.width *= gSFactor;
    this.height *= gSFactor;
    this.x *= gSFactor;
    this.y *= gSFactor;
}

InputBox.prototype.clicked = function(pos) {} */

var ChoiceGroup = function(choiceNames, defaultIndex, onChange) {
    this.type = 'choicegroup';
    this.choiceNames = choiceNames;
    this.selectedChoiceIndex = defaultIndex;
    this.choiceHeight = globalBaseHeight;
    this.height = this.choiceNames.length * this.choiceHeight;
    this.choiceBoxSize = this.choiceHeight  * 0.6;
    this.onChange = onChange;
}
ChoiceGroup.prototype.draw = function() {
    for(var choiceIndex = 0 ; choiceIndex < this.choiceNames.length ; choiceIndex++) {
        if (choiceIndex == this.selectedChoiceIndex) {
            context.beginPath();
            context.rect(this.parent.x - (this.parent.width / 2) + this.x - (this.width / 2), this.parent.y - (this.parent.height / 2) + this.y - (this.height / 2) + (this.choiceHeight / 2) - (this.choiceBoxSize / 2) + (choiceIndex * this.choiceHeight), this.choiceBoxSize, this.choiceBoxSize);
            context.fillStyle = '#e0f542aa';
            context.fill();
        } else {
            context.beginPath();
            context.rect(this.parent.x - (this.parent.width / 2) + this.x - (this.width / 2), this.parent.y - (this.parent.height / 2) + this.y - (this.height / 2) + (this.choiceHeight / 2) - (this.choiceBoxSize / 2) + (choiceIndex * this.choiceHeight), this.choiceBoxSize, this.choiceBoxSize);
            context.lineWidth = '2';
            context.strokeStyle = '#e0f542aa';
            context.stroke();
        }
        context.fillStyle = '#000000aa';
        context.fillText(this.choiceNames[choiceIndex], this.parent.x - (this.parent.width / 2) + this.x - (this.width / 2) + this.choiceBoxSize + globalOffset, this.parent.y - (this.parent.height / 2) + this.y - (this.height / 2) + (this.choiceHeight / 2) + (choiceIndex * this.choiceHeight) + (globalFontSize / 3));
    }
}
ChoiceGroup.prototype.scale = function() {
    this.width *= gSFactor
    this.height *= gSFactor;
    this.x *= gSFactor;
    this.y *= gSFactor;
    this.choiceBoxSize *= gSFactor;
    this.choiceHeight *= gSFactor;
}
ChoiceGroup.prototype.clicked = function(pos) {
    if (pos.x > (this.parent.x - (this.parent.width / 2) + this.x - (this.width / 2)) && pos.x < (this.parent.x - (this.parent.width / 2) + this.x + (this.width / 2)) && pos.y > (this.parent.y - (this.parent.height / 2) + this.y - (this.height / 2)) && pos.y < (this.parent.y - (this.parent.height / 2) + this.y + (this.height / 2))) {
        if (wasDragging) return;
        var clickedIndex = Math.floor((pos.y - (this.parent.y - (this.parent.height / 2) + this.y - (this.height / 2))) / this.choiceHeight);
        if (clickedIndex != this.selectedChoiceIndex) {
            this.selectedChoiceIndex = clickedIndex;
            this.onChange(this.choiceNames[this.selectedChoiceIndex]);
            redraw(true);
        }
    }
}

var Slider = function(height, thumbRadius, min, max, defaultValue, onChange) {
    this.type = 'slider';
    this.height = height;
    this.thumbRadius = thumbRadius;
    this.min = min;
    this.max = max;
    this.value = defaultValue;
    this.railHeight = globalBaseHeight * 0.3;
    this.thumbPos = {x: 0, y: 0};
    this.onChange = onChange;
}

Slider.prototype.draw = function() {
    context.beginPath();
    context.rect(this.parent.x - (this.parent.width / 2) + this.x - (this.width / 2), this.parent.y - (this.parent.height / 2) + this.y - (this.railHeight / 2), this.width, this.railHeight);
    context.fillStyle = '#34c6ebaa'
    context.fill();

    context.beginPath();
    context.fillStyle = '#3480ebff';
    this.thumbPos.x = ((this.value - this.min) / (this.max - this.min)) * ((this.parent.x - (this.parent.width / 2) + this.x + (this.width / 2)) - (this.parent.x - (this.parent.width / 2) + this.x - (this.width / 2))) + (this.parent.x - (this.parent.width / 2) + this.x - (this.width / 2));
    this.thumbPos.y = this.parent.y  - (this.parent.height / 2) + this.y;
    context.arc(this.thumbPos.x, this.thumbPos.y, this.thumbRadius, 0, 2 * Math.PI);
    context.fill();
}

Slider.prototype.scale = function() {
    this.width *= gSFactor;
    this.height *= gSFactor;
    this.x *= gSFactor;
    this.y *= gSFactor;
    this.thumbRadius *= gSFactor;
    this.railHeight *= gSFactor;
}

Slider.prototype.slide = function(x) {
    if (x < (this.parent.x - (this.parent.width / 2) + this.x - (this.width / 2))) {
        this.value = this.min;
    }
    else if (x > (this.parent.x - (this.parent.width / 2) + this.x + (this.width / 2))) {
        this.value = this.max
    }
    else {
        this.value = Math.floor(((x - (this.parent.x - (this.parent.width / 2) + this.x - (this.width / 2))) / ((this.parent.x - (this.parent.width / 2) + this.x + (this.width / 2)) - (this.parent.x - (this.parent.width / 2) + this.x - (this.width / 2)))) * (this.max - this.min) + this.min);
    }
    this.onChange(this.value);
}

Slider.prototype.clicked = function(pos) {}

var Button = function(height, label, onClick) {
    this.type = 'button';
    this.height = height;
    this.label = label;
    this.onClick = onClick;
}

Button.prototype.draw = function() {
    context.beginPath();
    context.rect(this.parent.x - (this.parent.width / 2) + this.x - (this.width / 2), this.parent.y - (this.parent.height / 2) + this.y - (this.height / 2), this.width, this.height);
    context.fillStyle = '#ccccccaa'
    context.strokeStyle = '#000000aa';
    context.fill();
    context.stroke();

    context.fillStyle = '#000000aa';
    context.fillText(this.label, this.parent.x - (this.parent.width / 2) + this.x - (context.measureText(this.label).width / 2), this.parent.y - (this.parent.height / 2) + this.y + (globalFontSize / 3));
}

Button.prototype.scale = function() {
    this.width *= gSFactor;
    this.height *= gSFactor;
    this.x *= gSFactor;
    this.y *= gSFactor;
}

Button.prototype.clicked = function(pos) {
    if (pos.x > (this.parent.x - (this.parent.width / 2) + this.x - (this.width / 2)) && pos.x < (this.parent.x - (this.parent.width / 2) + this.x + (this.width / 2)) && pos.y > (this.parent.y - (this.parent.height / 2) + this.y - (this.height / 2)) && pos.y < ((this.parent.y - (this.parent.height / 2) + this.y + (this.height / 2)))) {
        this.onClick();
        return true;
    }
}

var BaseNode = function(x, y, width, order, type, heading, color, hPadding, vSpacing, inputTerminals, outputTerminals) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.originalWidth = width;
    this.radius = globalRadius;
    this.height = this.radius + globalBaseHeight + vSpacing * 3;
    this.order = order;
    this.type = type;
    this.heading = heading;
    this.color = color;
    this.hPadding = hPadding;
    this.vSpacing = vSpacing;
    this.components = [];
    this.scaleRatio = 1;
    this.inputTerminals = inputTerminals;
    this.outputTerminals = outputTerminals;
    this.sliders = [];
    
    for(var terminal of this.inputTerminals) {
        terminal.parent = this;
    }
    for(var terminal of this.outputTerminals) {
        terminal.parent = this;
    }
}

BaseNode.prototype.draw = function() {

    context.roundRect(this.x, this.y, this.width, this.height, this.radius);
    context.lineWidth = globalOutlineWidth.toString();
    context.fillStyle = "#dededeaa";
    context.strokeStyle = (selectedNodes.includes(this)) ? '#add8e6' : '#444';
    context.fill();
    context.stroke();

    context.roundUpperRect(this.x, this.y - (this.height / 2) + globalOutlineWidth + ((this.radius + globalBaseHeight) / 2), this.width - 4, this.radius + globalBaseHeight, this.radius);
    context.lineWidth = "1";
    context.fillStyle = this.color;
    context.strokeStyle = this.color;
    context.fill();
    context.stroke();
    context.beginPath();
    context.moveTo(this.x - (this.width / 2), this.y - (this.height / 2) + this.radius + globalBaseHeight - 1);
    context.lineTo(this.x + (this.width / 2), this.y - (this.height / 2) + this.radius + globalBaseHeight - 1);
    context.strokeStyle = '#000000aa';
    context.stroke();

    context.font = 'bold ' + globalFontSize + 'px arial';
    context.fillStyle = '#000000aa';
    context.fillText(this.heading, this.x - this.width / 2 + this.width * 0.1, this.y - (this.height / 2) + globalOutlineWidth + ((this.radius + globalBaseHeight) / 2));

    for (var i = 0 ; i < this.components.length ; i++) {
        this.components[i].draw();
    }

    if (this.inputTerminals) {
        for (var i = 0 ; i < this.inputTerminals.length ; i++) {
            this.inputTerminals[i].draw();
        }
    }

    if (this.outputTerminals) {
        for (var i = 0 ; i < this.outputTerminals.length ; i++) {
            this.outputTerminals[i].draw();
        }
    }

    this.scaleRatio = this.width / this.originalWidth;
}

BaseNode.prototype.update = function() {
    if (this.inputTerminals) {
        for (var i = 0 ; i < this.inputTerminals.length ; i++) {
            this.inputTerminals[i].x = this.x - (this.width / 2);
            this.inputTerminals[i].y = this.y - (this.height / 2) + (this.radius + globalOutlineWidth + globalBaseHeight + this.vSpacing * 3) + (i * globalBaseHeight);
        }
    }

    if (this.outputTerminals) {
        for (var i = 0 ; i < this.outputTerminals.length ; i++) {
            this.outputTerminals[i].x = this.x + (this.width / 2);
            this.outputTerminals[i].y = this.y - (this.height / 2) + (this.radius + globalOutlineWidth + globalBaseHeight + this.vSpacing * 3) + (i * globalBaseHeight);
        }
    }
}

BaseNode.prototype.addComponent = function(component, width, index) {
    //console.log('BaseNode:addComponent');
    component.parent = this;
    component.x = this.x;
    var lastComponent;
    if(this.components.length > 0) {
        if (typeof(index) != 'undefined' && index < this.components.length) {
            lastComponent = this.components[index - 1];
        } else {
            lastComponent = this.components[this.components.length - 1];
        }
        component.y = lastComponent.parent.y - (lastComponent.parent.height / 2) + lastComponent.y + (lastComponent.height / 2) + this.vSpacing + (component.height / 2);
    } else {
        component.y = this.y - (this.height / 2) + globalOutlineWidth + this.radius + globalBaseHeight + this.vSpacing + (component.height / 2);
    }
    if (width && width != null) {
        if (width > (this.width - 4 - (2 * this.hPadding)))
            component.width = this.width - 4 - (2 * this.hPadding);
        else component.width = width;
    } else {
        component.width = this.width - 4 - (2 * this.hPadding);
    }
    
    if (component.type == 'slider') this.sliders.push(component);
    this.height += this.vSpacing + component.height;
    this.y += (this.vSpacing + component.height) / 2;

    // convert absolute component (x, y) to relative

    component.x = component.x - (this.x - (this.width / 2));
    component.y = component.y - (this.y - (this.height / 2));

    if (typeof(index) != 'undefined' && index < this.components.length) {
        this.components.splice(index, 0, component);
        for (var i = index + 1 ; i < this.components.length ; i++) {
            this.components[i].y += component.height + this.vSpacing;
        }
    }
    else this.components.push(component);
}

BaseNode.prototype.addTerminal = function(newTerminal) {
    newTerminal.parent = this;
    if (newTerminal.type == 'in')
        this.inputTerminals.push(newTerminal);
    else this.outputTerminals.push(newTerminal);
    redraw(true);
}

BaseNode.prototype.scale = function() {
    this.width *= gSFactor;
    this.height *= gSFactor;
    this.hPadding *= gSFactor;
    this.vSpacing *= gSFactor;
    this.radius *= gSFactor;

    for (var terminal of this.inputTerminals) {
        terminal.scale();
    }

    for (var terminal of this.outputTerminals) {
        terminal.scale();
    }

    for (var component of this.components) {
        component.scale();
    }

    this.update();
}

BaseNode.prototype.clicked = function(pos) {
    //console.log('BaseNode:clicked');
    for (var terminal of this.inputTerminals) {
        terminal.clicked(pos);
    }

    for (var terminal of this.outputTerminals) {
        terminal.clicked(pos);
    }

    for (var component of this.components) {
        if(component.clicked(pos)) break;
    }
}

BaseNode.prototype.checkSliderBounds = function(pos) {
    var sliderC;
    for (var slider of this.sliders) {
        if (pos.x > (this.x - (this.width / 2) + slider.x - (slider.width / 2)) && pos.x < (this.x - (this.width / 2) + slider.x + (slider.width / 2)) && pos.y > ((this.y - (this.height / 2) + slider.y) - (slider.thumbRadius)) && pos.y < ((this.y - (this.height / 2) + slider.y) + (slider.thumbRadius))) {
            return slider;
        }
    }
    for (var component of this.components) {
        if (typeof(component.checkSliderBounds) == 'function') {
            if ((sliderC = component.checkSliderBounds(pos)) != null) return sliderC;
        }
    }
    return null;
}

function extractRGB(imageData) {
    var channelR = new ImageData(imageData.width, imageData.height);
    var channelG = new ImageData(imageData.width, imageData.height);
    var channelB = new ImageData(imageData.width, imageData.height);

    for (var i = 0 ; i < imageData.data.length ; i+=4) {
        channelR.data[i + 0] = imageData.data[i + 0];
        channelR.data[i + 3] = imageData.data[i + 3];
        channelR.data[i + 1] = 0;
        channelR.data[i + 2] = 0;

        channelG.data[i + 1] = imageData.data[i + 1];
        channelG.data[i + 3] = imageData.data[i + 3];
        channelG.data[i + 0] = 0;
        channelG.data[i + 2] = 0;

        channelB.data[i + 2] = imageData.data[i + 2];
        channelB.data[i + 3] = imageData.data[i + 3];
        channelB.data[i + 1] = 0;
        channelB.data[i + 0] = 0;
    }
    return [channelR, channelG, channelB];
}