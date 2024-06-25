import BaseNode from "../components/base-node.mjs";
import Terminal from "../components/terminal.mjs";
import Label from "../components/label.mjs";
import { ctx, props } from "../state/editor.mjs";

export default class OutputNode extends BaseNode {
  constructor(x, y, width, order, hPadding, vSpacing) {
    super(
      x,
      y,
      width,
      order,
      "output",
      "Output",
      "#ff6347aa",
      hPadding,
      vSpacing,
      [new Terminal("in", "image|channelR|channelG|channelB", props.globalTerminalRadius, null)],
      []
    );

    this.setupNode();
  }

  setupNode() {
    this.addComponent(new Label(props.globalBaseHeight, "ImageOutput", "left"));
    this.draw(ctx);
  }
}
