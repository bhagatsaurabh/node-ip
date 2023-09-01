import { redraw, props } from "../state/editor.mjs";
import { guid } from "../utility.mjs";

export default class BaseNode {
  constructor(x, y, width, order, type, heading, color, hPadding, vSpacing, inputTerminals, outputTerminals) {
    this.guid = guid();
    this.x = x;
    this.y = y;
    this.width = width;
    this.originalWidth = width;
    this.radius = props.globalRadius;
    this.height = this.radius + props.globalBaseHeight + vSpacing * 3;
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

    this.setup();
  }

  setup() {
    [...this.inputTerminals, ...this.outputTerminals].forEach((terminal) => (terminal.parent = this));
  }
  draw(ctx) {
    this.update();

    ctx.roundRect(this.x, this.y, this.width, this.height, this.radius);
    ctx.lineWidth = props.globalOutlineWidth.toString();
    ctx.fillStyle = "#dededeaa";
    ctx.strokeStyle = props.selectedNodes.includes(this) ? "#add8e6" : "#444";
    ctx.fill();
    ctx.stroke();

    ctx.roundUpperRect(
      this.x,
      this.y - this.height / 2 + props.globalOutlineWidth / 2 + (this.radius + props.globalBaseHeight) / 2,
      this.width - props.globalOutlineWidth * 1.5,
      this.radius + props.globalBaseHeight,
      this.radius
    );
    ctx.lineWidth = 1;
    ctx.fillStyle = this.color;
    ctx.strokeStyle = this.color;
    ctx.fill();
    ctx.stroke();
    ctx.lineWidth = props.globalOutlineWidth.toString();
    ctx.beginPath();
    ctx.moveTo(
      this.x - this.width / 2 + props.globalOutlineWidth / 2,
      this.y - this.height / 2 + this.radius / 2 + props.globalBaseHeight - props.globalOutlineWidth
    );
    ctx.lineTo(
      this.x + this.width / 2 - props.globalOutlineWidth / 2,
      this.y - this.height / 2 + this.radius / 2 + props.globalBaseHeight - props.globalOutlineWidth
    );
    ctx.strokeStyle = "#000000aa";
    ctx.stroke();
    ctx.lineWidth = 1;

    ctx.font = "bold " + props.globalFontSize + "px arial";
    ctx.fillStyle = "#000000aa";
    ctx.fillText(
      this.heading,
      this.x - this.width / 2 + this.width * 0.1,
      this.y - this.height / 2 + props.globalOutlineWidth + (this.radius + props.globalBaseHeight) / 2
    );

    this.components.forEach((component) => component.draw(ctx));
    if (this.inputTerminals) {
      this.inputTerminals.forEach((terminal) => terminal.draw(ctx));
    }
    if (this.outputTerminals) {
      this.outputTerminals.forEach((terminal) => terminal.draw(ctx));
    }
    this.scaleRatio = this.width / this.originalWidth;
  }
  update() {
    if (this.inputTerminals) {
      for (let i = 0; i < this.inputTerminals.length; i += 1) {
        this.inputTerminals[i].x = this.x - this.width / 2;
        this.inputTerminals[i].y =
          this.y -
          this.height / 2 +
          (this.radius + props.globalOutlineWidth + props.globalBaseHeight + this.vSpacing * 3) +
          i * props.globalBaseHeight;
      }
    }
    if (this.outputTerminals) {
      for (let i = 0; i < this.outputTerminals.length; i += 1) {
        this.outputTerminals[i].x = this.x + this.width / 2;
        this.outputTerminals[i].y =
          this.y -
          this.height / 2 +
          (this.radius + props.globalOutlineWidth + props.globalBaseHeight + this.vSpacing * 3) +
          i * props.globalBaseHeight;
      }
    }
  }
  addComponent(component, width, index) {
    component.parent = this;
    component.x = this.x;
    let lastComponent;
    if (this.components.length > 0) {
      if (typeof index !== "undefined" && index < this.components.length) {
        lastComponent = this.components[index - 1];
      } else {
        lastComponent = this.components[this.components.length - 1];
      }
      component.y =
        lastComponent.parent.y -
        lastComponent.parent.height / 2 +
        lastComponent.y +
        lastComponent.height / 2 +
        this.vSpacing +
        component.height / 2;
    } else {
      component.y =
        this.y -
        this.height / 2 +
        props.globalOutlineWidth +
        this.radius +
        props.globalBaseHeight +
        this.vSpacing +
        component.height / 2;
    }

    if (width !== null && typeof width !== "undefined") {
      if (width > this.width - 4 - 2 * this.hPadding) component.width = this.width - 4 - 2 * this.hPadding;
      else component.width = width;
    } else {
      component.width = this.width - 4 - 2 * this.hPadding;
    }

    if (component.type === "slider") this.sliders.push(component);
    this.height += this.vSpacing + component.height;
    this.y += (this.vSpacing + component.height) / 2;

    // convert absolute component (x, y) to relative
    component.x = component.x - (this.x - this.width / 2);
    component.y = component.y - (this.y - this.height / 2);

    if (typeof index !== "undefined" && index < this.components.length) {
      this.components.splice(index, 0, component);
      for (let i = index + 1; i < this.components.length; i += 1) {
        this.components[i].y += component.height + this.vSpacing;
      }
    } else this.components.push(component);
  }
  addTerminal(newTerminal) {
    newTerminal.parent = this;
    if (newTerminal.type === "in") this.inputTerminals.push(newTerminal);
    else this.outputTerminals.push(newTerminal);
    redraw(true);
  }
  scale(factor) {
    this.width *= factor;
    this.height *= factor;
    this.hPadding *= factor;
    this.vSpacing *= factor;
    this.radius *= factor;

    if (this.inputTerminals) {
      this.inputTerminals.forEach((terminal) => terminal.scale(factor));
    }
    if (this.outputTerminals) {
      this.outputTerminals.forEach((terminal) => terminal.scale(factor));
    }
    this.components.forEach((component) => component.scale(factor));

    this.update();
  }
  clicked(pos) {
    if (this.inputTerminals) {
      this.inputTerminals.forEach((terminal) => terminal.clicked(pos));
    }
    if (this.outputTerminals) {
      this.outputTerminals.forEach((terminal) => terminal.clicked(pos));
    }

    for (let component of this.components) {
      if (component.clicked(pos)) break;
    }
  }
  checkBounds(x, y) {
    if (
      x > this.x - this.width / 2 - props.globalTerminalRadius / 2 &&
      x < this.x + this.width / 2 + props.globalTerminalRadius / 2 &&
      y > this.y - this.height / 2 &&
      y < this.y + this.height / 2
    )
      return true;
    return false;
  }
  checkSliderBounds(pos) {
    let sliderC;
    for (let slider of this.sliders) {
      if (
        pos.x > this.x - this.width / 2 + slider.x - slider.width / 2 &&
        pos.x < this.x - this.width / 2 + slider.x + slider.width / 2 &&
        pos.y > this.y - this.height / 2 + slider.y - slider.thumbRadius &&
        pos.y < this.y - this.height / 2 + slider.y + slider.thumbRadius
      ) {
        return slider;
      }
    }

    for (let component of this.components) {
      if (typeof component.checkSliderBounds === "function") {
        if ((sliderC = component.checkSliderBounds(pos)) !== null) return sliderC;
      }
    }

    return null;
  }
}
