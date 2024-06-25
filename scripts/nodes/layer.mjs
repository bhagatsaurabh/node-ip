import BaseNode from "../components/base-node.mjs";
import Terminal from "../components/terminal.mjs";
import Label from "../components/label.mjs";
import Slider from "../components/slider.mjs";
import Row from "../components/row.mjs";
import Button from "../components/button.mjs";
import { ctx, props } from "../state/editor.mjs";
import { renderOutput } from "../renderer.mjs";
import { checkConnectionToOutput } from "../utility.mjs";
import { nodes } from "../state/nodes.mjs";

export default class LayerNode extends BaseNode {
  constructor(x, y, width, order, hPadding, vSpacing) {
    super(
      x,
      y,
      width,
      order,
      "layer",
      "Layer",
      "#76ff76aa",
      hPadding,
      vSpacing,
      [
        new Terminal("in", "image|channelR|channelG|channelB", props.globalTerminalRadius, null),
        new Terminal("in", "image|channelR|channelG|channelB", props.globalTerminalRadius, null),
      ],
      [new Terminal("out", "image", props.globalTerminalRadius, null)]
    );

    this.setupNode();
  }

  setupNode() {
    this.config = {
      alphas: [100, 50],
    };

    const label1 = new Label(props.globalBaseHeight, this.config.alphas[0].toString(), "right");
    const label2 = new Label(props.globalBaseHeight, this.config.alphas[1].toString(), "right");

    this.addComponent(
      new Row(
        props.globalBaseHeight,
        [
          new Slider(props.globalBaseHeight, props.globalBaseHeight * 0.3, 0, 100, 100, (value) => {
            this.config.alphas[0] = value;
            label1.setLabel(this.config.alphas[0].toString());
            if (checkConnectionToOutput(this, nodes)) renderOutput();
          }),
          label1,
        ],
        5,
        [0.7, 0.3]
      )
    );
    this.addComponent(
      new Row(
        props.globalBaseHeight,
        [
          new Slider(props.globalBaseHeight, props.globalBaseHeight * 0.3, 0, 100, 50, (value) => {
            this.config.alphas[1] = value;
            label2.setLabel(this.config.alphas[1].toString());
            if (checkConnectionToOutput(this, nodes)) renderOutput();
          }),
          label2,
        ],
        5,
        [0.7, 0.3]
      )
    );
    this.addComponent(new Row(props.globalBaseHeight, [], 5));
    this.addComponent(
      new Button(props.globalBaseHeight * 0.85, "Add", () => {
        const index = this.config.alphas.length;
        this.config.alphas.push(50);

        const label = new Label(props.globalBaseHeight, this.config.alphas[index].toString(), "right");
        this.addComponent(
          new Row(
            props.globalBaseHeight,
            [
              new Slider(props.globalBaseHeight, props.globalBaseHeight * 0.3, 0, 100, 50, (value) => {
                this.config.alphas[index] = value;
                label.setLabel(this.config.alphas[index].toString());
                if (checkConnectionToOutput(this, nodes)) renderOutput();
              }),
              label,
            ],
            5,
            [0.7, 0.3]
          ),
          null,
          this.components.length - 2
        );
        this.addTerminal(
          new Terminal("in", "image|channelR|channelG|channelB", props.globalTerminalRadius, null)
        );
      }),
      this.width * 0.4
    );

    this.draw(ctx);
  }
}
