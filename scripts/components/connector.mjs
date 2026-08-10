import { connectors } from "../state/connectors.mjs";
import { ctx, props, redraw } from "../state/editor.mjs";
import { guid } from "../utility.mjs";

export class Connector {
  constructor(terminalStart, terminalStartNode) {
    this.terminalStart = terminalStart;
    this.terminalStartNode = terminalStartNode;
    this.x1 = terminalStart.x;
    this.y1 = terminalStart.y;
    this.guid = guid();
  }

  draw(x2, y2) {
    ctx.beginPath();
    this.x1 = this.terminalStart.x;
    this.y1 = this.terminalStart.y;
    this.x2 = x2;
    this.y2 = y2;
    this.x11 = this.x1 + props.globalConnectorBezierOffset;
    this.y11 = this.y1;
    this.x22 = this.x2 - props.globalConnectorBezierOffset;
    this.y22 = y2;
    this.xmid = (this.x11 + this.x22) / 2;
    this.ymid = (this.y11 + this.y22) / 2;

    ctx.moveTo(this.x1, this.y1);
    ctx.quadraticCurveTo(this.x11, this.y11, this.xmid, this.ymid);
    ctx.moveTo(this.xmid, this.ymid);
    ctx.quadraticCurveTo(this.x22, this.y22, this.x2, this.y2);

    ctx.save();
    ctx.strokeStyle = "#7fff00aa";
    ctx.lineWidth = Math.round(props.globalConnectorWidth).toString();
    ctx.lineCap = "round";
    ctx.shadowColor = "#7fff00";
    ctx.shadowBlur = 5;
    ctx.stroke();
    ctx.restore();
  }
  connect(terminalEnd, terminalEndNode) {
    if (terminalEnd.type === "out") {
      props.currentConnector.terminalStart.connector = null;
      props.currentConnector = null;
      redraw(true);
    } else {
      if (terminalEnd.connector) {
        terminalEnd.connector.terminalStart.connector = null;
        connectors.splice(connectors.indexOf(terminalEnd.connector), 1);
        terminalEnd.connector = null;
      }

      this.terminalEnd = terminalEnd;
      this.terminalEndNode = terminalEndNode;
      this.x2 = terminalEnd.x;
      this.y2 = terminalEnd.y;
      this.terminalStart.connector = this;
      this.terminalEnd.connector = this;

      connectors.push(props.currentConnector);
      this.terminalStart.pass(this.terminalEnd);
      if (typeof this.terminalEnd.onConnect === "function") {
        this.terminalEnd.onConnect(this.terminalStart);
      }

      props.currentConnector = null;
      redraw(true);
    }
  }
}
