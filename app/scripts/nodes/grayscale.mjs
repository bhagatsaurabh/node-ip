import { ctx, props } from "../state/editor.mjs";
import Terminal from "../components/terminal.mjs";
import BaseNode from "../components/base-node.mjs";
import Choice from "../components/choice.mjs";
import { checkConnectionToOutput } from "../utility.mjs";
import { nodes } from "../state/nodes.mjs";
import { renderOutput } from "../renderer.mjs";

export default class GrayscaleNode extends BaseNode {
  constructor(x, y, width, order, hPadding, vSpacing) {
    super(
      x,
      y,
      width,
      order,
      "grayscale",
      "GrayScale",
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
      type: "average",
    };
    this.addComponent(
      new Choice(["Average", "Weighted"], 0, (choice) => {
        this.config.type = choice.toLowerCase();
        if (checkConnectionToOutput(this, nodes)) renderOutput();
      })
    );

    this.draw(ctx);
  }
}
