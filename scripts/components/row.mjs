export default class Row {
  constructor(height, components, spacing, weights) {
    this.sliders = [];
    this.type = "row";
    this.height = height;
    this.components = components;
    this.spacing = spacing;
    this.weights = weights;

    this.setup();
  }

  setup() {
    this.components.forEach((component) => {
      component.parent = this;
      if (component.type === "slider") this.sliders.push(component);
    });
  }
  draw(ctx) {
    if (Array.isArray(this.weights)) {
      const availableWidth = this.width - (this.components.length - 1) * this.spacing;
      let occupiedWidth = 0;
      for (let i = 0; i < this.components.length; i += 1) {
        this.components[i].width = availableWidth * this.weights[i];
        this.components[i].height = this.height;
        this.components[i].x =
          this.parent.x -
          this.parent.width / 2 +
          this.x -
          this.width / 2 +
          i * this.spacing +
          occupiedWidth +
          this.components[i].width / 2;
        this.components[i].y = this.parent.y - this.parent.height / 2 + this.y;

        this.components[i].x = this.components[i].x - (this.x - this.width / 2);
        this.components[i].y = this.components[i].y - (this.y - this.height / 2);

        this.components[i].draw(ctx);
        occupiedWidth += this.components[i].width;
      }
    } else {
      const commonWidth = (this.width - (this.components.length - 1) * this.spacing) / this.components.length;
      for (let i = 0; i < this.components.length; i += 1) {
        this.components[i].width = commonWidth;
        this.components[i].height = this.height;
        this.components[i].x =
          this.parent.x -
          this.parent.width / 2 +
          this.x -
          this.width / 2 +
          i * commonWidth +
          commonWidth / 2 +
          i * this.spacing;
        this.components[i].y = this.parent.y - this.parent.height / 2 + this.y;

        this.components[i].x = this.components[i].x - (this.x - this.width / 2);
        this.components[i].y = this.components[i].y - (this.y - this.height / 2);

        this.components[i].draw(ctx);
      }
    }
  }
  scale(factor) {
    this.width *= factor;
    this.height *= factor;
    this.x *= factor;
    this.y *= factor;
    this.components.forEach((component) => component.scale(factor));
  }
  clicked(pos) {
    if (
      pos.x > this.parent.x - this.parent.width / 2 + this.x - this.width / 2 &&
      pos.x < this.parent.x - this.parent.width / 2 + this.x + this.width / 2 &&
      pos.y > this.parent.y - this.parent.height / 2 + this.y - this.height / 2 &&
      pos.y < this.parent.y - this.parent.height / 2 + this.y + this.height / 2
    ) {
      this.components.forEach((component) => component.clicked(pos));
    }
  }
  checkSliderBounds(pos) {
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
    let sliderC;
    for (let component of this.components) {
      if (typeof component.checkSliderBounds === "function") {
        if ((sliderC = component.checkSliderBounds(pos)) !== null) return sliderC;
      }
    }

    return null;
  }
}
