import BaseNode from "../components/base-node.mjs";
import Terminal from "../components/terminal.mjs";
import Row from "../components/row.mjs";
import { ctx, props } from "../state/editor.mjs";

export default class CombineChannelNode extends BaseNode {
  constructor(x, y, width, order, hPadding, vSpacing) {
    super(
      x,
      y,
      width,
      order,
      "combinechannel",
      "Combine Channel",
      "#76ff76aa",
      hPadding,
      vSpacing,
      [
        new Terminal("in", "channelR|channelH", props.globalTerminalRadius, null),
        new Terminal("in", "channelG|channelS", props.globalTerminalRadius, null),
        new Terminal("in", "channelB|channelV", props.globalTerminalRadius, null),
      ],
      [new Terminal("out", "image", props.globalTerminalRadius, null)]
    );

    this.setupNode();
  }

  setupNode() {
    this.config = {};

    this.addComponent(new Row(props.globalBaseHeight, [], 5));
    this.addComponent(new Row(props.globalBaseHeight, [], 5));
    this.addComponent(new Row(props.globalBaseHeight, [], 5));

    this.draw(ctx);
  }
}
