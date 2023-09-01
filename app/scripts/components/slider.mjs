import { props } from "../state/editor.mjs";
import { normalize } from "../utility.mjs";
import { 𝜏 } from "../constants.mjs";

export default class Slider {
  constructor(height, thumbRadius, min, max, defaultValue, onChange) {
    this.type = "slider";
    this.height = height;
    this.thumbRadius = thumbRadius;
    this.min = min;
    this.max = max;
    this.value = defaultValue;
    this.railHeight = props.globalBaseHeight * 0.3;
    this.thumbPos = { x: 0, y: 0 };
    this.onChange = onChange;
  }

  draw(ctx) {
    ctx.beginPath();
    ctx.rect(
      this.parent.x - this.parent.width / 2 + this.x - this.width / 2,
      this.parent.y - this.parent.height / 2 + this.y - this.railHeight / 2,
      this.width,
      this.railHeight
    );
    ctx.fillStyle = "#34c6ebaa";
    ctx.fill();

    ctx.beginPath();
    ctx.fillStyle = "#3480ebff";
    const common = this.parent.x - this.parent.width / 2 + this.x;
    this.thumbPos.x = (this.width / 2) * (2 * normalize(this.value, this.min, this.max) - 1) + common;
    this.thumbPos.y = this.parent.y - this.parent.height / 2 + this.y;
    ctx.arc(this.thumbPos.x, this.thumbPos.y, this.thumbRadius, 0, 𝜏);
    ctx.fill();
  }
  scale(factor) {
    this.width *= factor;
    this.height *= factor;
    this.x *= factor;
    this.y *= factor;
    this.thumbRadius *= factor;
    this.railHeight *= factor;
  }
  slide(x) {
    const common = this.parent.x - this.parent.width / 2 + this.x;
    if (x < common - this.width / 2) {
      this.value = this.min;
    } else if (x > common + this.width / 2) {
      this.value = this.max;
    } else {
      // this.value = Math.floor(
      //   ((x - (common - this.width / 2)) / (common + this.width / 2 - (common - this.width / 2))) *
      //     (this.max - this.min) +
      //     this.min
      // );
      this.value = Math.floor(
        ((x - (common - this.width / 2)) / this.width) * (this.max - this.min) + this.min
      );
    }
    this.onChange(this.value);
  }
  clicked() {}
}
