import { props } from "../state/editor.mjs";

export default class Label {
  constructor(height, label, placement) {
    this.type = "label";
    this.height = height;
    this.label = label;
    this.placement = placement;
  }

  draw(ctx) {
    ctx.font = "bold " + props.globalFontSize + "px arial";
    ctx.fillStyle = "#000000aa";
    if (this.placement === "left") {
      ctx.fillText(
        this.label,
        this.parent.x - this.parent.width / 2 + this.x - this.width / 2,
        this.parent.y - this.parent.height / 2 + this.y + props.globalFontSize / 3
      );
    } else if (this.placement === "center") {
      ctx.fillText(
        this.label,
        this.parent.x - this.parent.width / 2 + this.x - ctx.measureText(this.label).width / 2,
        this.parent.y - this.parent.height / 2 + this.y + props.globalFontSize / 3
      );
    } else {
      ctx.fillText(
        this.label,
        this.parent.x - this.parent.width / 2 + this.x + this.width / 2 - ctx.measureText(this.label).width,
        this.parent.y - this.parent.height / 2 + this.y + props.globalFontSize / 3
      );
    }
  }
  scale(factor) {
    this.width *= factor;
    this.height *= factor;
    this.x *= factor;
    this.y *= factor;
  }
  clicked() {}
  setLabel(newLabel) {
    this.label = newLabel;
  }
}
