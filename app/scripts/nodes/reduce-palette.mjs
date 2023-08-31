import BaseNode from "../components/base-node.mjs";
import Terminal from "../components/terminal.mjs";
import Row from "../components/row.mjs";
import { ctx, props } from "../state/editor.mjs";

export default class ReducePaletteNode extends BaseNode {
  constructor(x, y, width, order, hPadding, vSpacing) {
    super(
      x,
      y,
      width,
      order,
      "reducepalette",
      "ReducePalette",
      "#76ff76aa",
      hPadding,
      vSpacing,
      [new Terminal("in", "image", props.globalTerminalRadius, null)],
      [new Terminal("out", "image", props.globalTerminalRadius, null)]
    );

    this.setupNode();
  }

  setupNode() {
    this.config = {};
    this.addComponent(new Row(props.globalBaseHeight, [], 5));
    this.draw(ctx);
  }
}
