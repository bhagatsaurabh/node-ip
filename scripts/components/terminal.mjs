import { nodes } from "../state/nodes.mjs";
import { redraw, props } from "../state/editor.mjs";
import { removeConnector } from "../state/connectors.mjs";
import { guid, checkConnectionToOutput, distance, canConnect } from "../utility.mjs";
import { 𝜏 } from "../constants.mjs";
import { renderOutput } from "../renderer.mjs";
import { Connector } from "./connector.mjs";

export default class Terminal {
  constructor(type, category, radius, data, onConnect) {
    this.type = type;
    this.category = category;
    this.radius = radius;
    this.connector = null;
    this.guid = guid();
    this.data = data;
    this.selected = false;

    this.setup();
    if (this.type === "in") {
      this.onConnect = onConnect;
    }
  }

  setup() {
    this.color = this.category === "scalar" ? "#cccccc" : "#f00";
    if (this.category.includes("image")) this.color = "#ffff99";
    else if (this.category.includes("channel")) this.color = "#ccccff";
  }
  pass(acceptingTerminal) {
    if (this.type !== "out") return;

    acceptingTerminal.data = this.data;
    if (checkConnectionToOutput(acceptingTerminal.parent, nodes)) renderOutput();
  }
  draw(ctx) {
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, 𝜏);
    ctx.fillStyle = this.color;
    ctx.strokeStyle = "#000000aa";
    ctx.fill();
    ctx.stroke();

    if (this.selected) {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.radius * 1.5, 0, 𝜏);
      ctx.lineWidth = props.unit / 2;
      ctx.strokeStyle = "#000000aa";
      ctx.stroke();
      ctx.lineWidth = "1";
    }
  }
  scale(factor) {
    this.radius *= factor;
  }
  clicked(pos) {
    if (distance(pos, { x: this.x, y: this.y }) < this.radius) {
      if (props.terminalStartFlag === 0) {
        if (this.type !== "in") {
          if (this.connector !== null) {
            this.connector.terminalEnd.connector = null;
            removeConnector(this.connector);
            this.connector = null;
          }
          props.currentConnector = new Connector(this, this.parent);
          this.selected = true;
          redraw(true);
        } else {
          return;
        }
        props.terminalStartFlag = 1;
      } else {
        const currConnector = props.currentConnector;
        if (
          props.currentConnector.terminalStart.guid === this.guid ||
          !canConnect(props.currentConnector.terminalStart.category, this.category)
        ) {
          props.currentConnector.terminalStart.connector = null;
          props.currentConnector = null;
        } else {
          props.currentConnector.connect(this, this.parent);
        }
        if (currConnector) {
          currConnector.terminalStart.selected = false;
        }
        props.terminalStartFlag = 0;
        redraw(true);
      }
    }
  }
  setData(newData) {
    this.data = newData;
    if (this.connector !== null && this.type === "out") this.pass(this.connector.terminalEnd);
    else checkConnectionToOutput(this.parent, nodes);
  }
}
