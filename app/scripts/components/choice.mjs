import { redraw, props } from "../state/editor.mjs";

export default class Choice {
  constructor(choiceNames, defaultIndex, onChange) {
    this.type = "choicegroup";
    this.choiceNames = choiceNames;
    this.selectedChoiceIndex = defaultIndex;
    this.choiceHeight = props.globalBaseHeight;
    this.height = this.choiceNames.length * this.choiceHeight;
    this.choiceBoxSize = this.choiceHeight * 0.6;
    this.onChange = onChange;
  }

  draw(ctx) {
    for (let choiceIndex = 0; choiceIndex < this.choiceNames.length; choiceIndex += 1) {
      if (choiceIndex === this.selectedChoiceIndex) {
        ctx.beginPath();
        ctx.rect(
          this.parent.x - this.parent.width / 2 + this.x - this.width / 2,
          this.parent.y -
            this.parent.height / 2 +
            this.y -
            this.height / 2 +
            this.choiceHeight / 2 -
            this.choiceBoxSize / 2 +
            choiceIndex * this.choiceHeight,
          this.choiceBoxSize,
          this.choiceBoxSize
        );
        ctx.fillStyle = "#e0f542aa";
        ctx.fill();
      } else {
        ctx.beginPath();
        ctx.rect(
          this.parent.x - this.parent.width / 2 + this.x - this.width / 2,
          this.parent.y -
            this.parent.height / 2 +
            this.y -
            this.height / 2 +
            this.choiceHeight / 2 -
            this.choiceBoxSize / 2 +
            choiceIndex * this.choiceHeight,
          this.choiceBoxSize,
          this.choiceBoxSize
        );
        ctx.lineWidth = "2";
        ctx.strokeStyle = "#e0f542aa";
        ctx.stroke();
      }

      ctx.fillStyle = "#000000aa";
      ctx.fillText(
        this.choiceNames[choiceIndex],
        this.parent.x - this.parent.width / 2 + this.x - this.width / 2 + this.choiceBoxSize + props.unit,
        this.parent.y -
          this.parent.height / 2 +
          this.y -
          this.height / 2 +
          this.choiceHeight / 2 +
          choiceIndex * this.choiceHeight +
          props.globalFontSize / 3
      );
    }
  }
  scale(factor) {
    this.width *= factor;
    this.height *= factor;
    this.x *= factor;
    this.y *= factor;
    this.choiceBoxSize *= factor;
    this.choiceHeight *= factor;
  }
  clicked(pos) {
    if (
      pos.x > this.parent.x - this.parent.width / 2 + this.x - this.width / 2 &&
      pos.x < this.parent.x - this.parent.width / 2 + this.x + this.width / 2 &&
      pos.y > this.parent.y - this.parent.height / 2 + this.y - this.height / 2 &&
      pos.y < this.parent.y - this.parent.height / 2 + this.y + this.height / 2
    ) {
      if (props.wasDragging) return;
      const clickedIndex = Math.floor(
        (pos.y - (this.parent.y - this.parent.height / 2 + this.y - this.height / 2)) / this.choiceHeight
      );
      if (clickedIndex !== this.selectedChoiceIndex) {
        this.selectedChoiceIndex = clickedIndex;
        this.onChange(this.choiceNames[this.selectedChoiceIndex]);
        redraw(true);
      }
    }
  }
}
