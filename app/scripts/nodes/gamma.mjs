import BaseNode from "../components/base-node.mjs";
import Terminal from "../components/terminal.mjs";
import Slider from "../components/slider.mjs";
import Row from "../components/row.mjs";
import Label from "../components/label.mjs";
import { ctx, props } from "../state/editor.mjs";
import { renderOutput } from "../renderer.mjs";
import { checkConnectionToOutput } from "../utility.mjs";
import { nodes } from "../state/nodes.mjs";

export default class GammaNode extends BaseNode {
  constructor(x, y, width, order, hPadding, vSpacing) {
    super(
      x,
      y,
      width,
      order,
      "gamma",
      "Gamma",
      "#76ff76aa",
      hPadding,
      vSpacing,
      [new Terminal("in", "image|channelR|channelG|channelB", props.globalTerminalRadius, null)],
      [new Terminal("out", "image|channelR|channelG|channelB", props.globalTerminalRadius, null)]
    );

    this.seuptNode();
  }

  seuptNode() {
    this.inputTerminals[0].onConnect = (startTerminal) => {
      this.outputTerminals[0].category = startTerminal.category;
    };

    this.config = {
      factor: 25,
    };

    const labelValue = new Label(props.globalBaseHeight, this.config.factor, "right");

    this.addComponent(
      new Row(props.globalBaseHeight, [new Label(props.globalBaseHeight, "Factor", "left"), labelValue], 5)
    );
    this.addComponent(
      new Slider(props.globalBaseHeight, props.globalBaseHeight * 0.4, 0, 100, 25, (value) => {
        this.config.factor = value;
        labelValue.setLabel(this.config.factor.toString());
        if (checkConnectionToOutput(this, nodes)) renderOutput();
      })
    );

    this.draw(ctx);
  }
}
