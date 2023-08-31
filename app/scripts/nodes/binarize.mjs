import BaseNode from "../components/base-node.mjs";
import Label from "../components/label.mjs";
import Row from "../components/row.mjs";
import Slider from "../components/slider.mjs";
import Terminal from "../components/terminal.mjs";
import { props } from "../state/editor.mjs";

export default class BinarizeNode extends BaseNode {
  constructor(x, y, width, order, hPadding, vSpacing) {
    super(
      x,
      y,
      width,
      order,
      "binarize",
      "Binarize",
      "#76ff76aa",
      hPadding,
      vSpacing,
      [new Terminal("in", "image", props.globalTerminalRadius, null)],
      [new Terminal("out", "image", props.globalTerminalRadius, null)]
    );

    this.setupNode();
  }

  setupNode() {
    this.config = {
      threshold: 40,
    };

    const newLabelValue = new Label(props.globalBaseHeight, this.config.threshold, "right");
    this.addComponent(
      new Row(
        props.globalBaseHeight,
        [new Label(props.globalBaseHeight, "Threshold", "left"), newLabelValue],
        5
      )
    );
    this.addComponent(
      new Slider(props.globalBaseHeight, props.globalBaseHeight * 0.5, 0, 255, 40, (value) => {
        this.config.threshold = value;
        newLabelValue.setLabel(this.config.threshold.toString());
      })
    );

    this.draw();
  }
}