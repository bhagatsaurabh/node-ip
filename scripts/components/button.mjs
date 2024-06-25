import { props } from "../state/editor.mjs";

export default class Button {
  constructor(height, label, onClick) {
    this.type = "button";
    this.height = height;
    this.label = label;
    this.onClick = onClick;
  }

  draw(ctx) {
    ctx.beginPath();
    ctx.rect(
      this.parent.x - this.parent.width / 2 + this.x - this.width / 2,
      this.parent.y - this.parent.height / 2 + this.y - this.height / 2,
      this.width,
      this.height
    );
    ctx.fillStyle = "#ccccccaa";
    ctx.strokeStyle = "#000000aa";
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = "#000000aa";
    ctx.fillText(
      this.label,
      this.parent.x - this.parent.width / 2 + this.x - ctx.measureText(this.label).width / 2,
      this.parent.y - this.parent.height / 2 + this.y + props.globalFontSize / 3
    );
  }
  scale(factor) {
    this.width *= factor;
    this.height *= factor;
    this.x *= factor;
    this.y *= factor;
  }
  clicked(pos) {
    if (
      pos.x > this.parent.x - this.parent.width / 2 + this.x - this.width / 2 &&
      pos.x < this.parent.x - this.parent.width / 2 + this.x + this.width / 2 &&
      pos.y > this.parent.y - this.parent.height / 2 + this.y - this.height / 2 &&
      pos.y < this.parent.y - this.parent.height / 2 + this.y + this.height / 2
    ) {
      this.onClick();
      return true;
    }
  }
}
