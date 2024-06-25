import Thumbnail from "../components/thumbnail.mjs";
import BaseNode from "../components/base-node.mjs";
import Terminal from "../components/terminal.mjs";
import { ctx, props } from "../state/editor.mjs";
import Row from "../components/row.mjs";

export default class ImageSourceNode extends BaseNode {
  constructor(x, y, width, order, hPadding, vSpacing) {
    super(
      x,
      y,
      width,
      order,
      "imagesource",
      "ImageSource",
      "#76ff76aa",
      hPadding,
      vSpacing,
      [],
      [
        new Terminal("out", "image", props.globalTerminalRadius, null),
        new Terminal("out", "channelR", props.globalTerminalRadius, null),
        new Terminal("out", "channelG", props.globalTerminalRadius, null),
        new Terminal("out", "channelB", props.globalTerminalRadius, null),
      ]
    );

    this.setupNode();
  }

  setupNode() {
    const newThumbnail = new Thumbnail(props.globalBaseHeight * 4, (newData, channels) => {
      this.outputTerminals[0].setData(newData);
      this.outputTerminals[1].setData(channels[0]);
      this.outputTerminals[2].setData(channels[1]);
      this.outputTerminals[3].setData(channels[2]);
    });

    this.outputTerminals[0].data = newThumbnail.imageData;
    this.addComponent(newThumbnail);
    this.draw(ctx);
  }
}
