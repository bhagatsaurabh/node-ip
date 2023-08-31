import { refOne } from "../utility.mjs";
import { connectors } from "./connectors.mjs";
import { nodes } from "./nodes.mjs";

let ctx = refOne("#editorCanvas").getContext("2d");
let renderCtx = refOne("#renderCanvas").getContext("2d");
const dimensions = { x: 0, y: 0 };
const props = {
  currentConnector: null,
  terminalStartFlag: 0,
  globalScaleRatio: 1,
  selectedNodes: [],
  wasDragging: false,
  gSFactor: 1.0,
  globalFontSize: dimensions.x * 0.014,
  globalBaseHeight: dimensions.x * 0.025,
  globalRadius: dimensions.x * 0.008,
  globalOutlineWidth: 2,
  globalTerminalRadius: 5,
  globalConnectorBezierOffset: dimensions.x * 0.06,
  globalConnectorWidth: dimensions.x * 0.006,
};
const renderDimensions = { x: 0, y: 0 };
const unit = dimensions.x * 0.01;

const setContext = (val) => (ctx = val);
const setDimensions = (val, ctx) => {
  if (ctx === "editorCanvas") {
    dimensions.x = val.x;
    dimensions.y = val.y;
  } else {
    renderDimensions.x = val.x;
    renderDimensions.y = val.y;
  }
};
const redraw = (clear) => {
  if (clear) ctx.clearRect(0, 0, dimensions.x, dimensions.y);

  nodes.forEach((node) => node.update());
  connectors.forEach((connector) => connector.draw(connector.terminalEnd.x, connector.terminalEnd.y));
  nodes.forEach((node) => node.draw());
};
const redrawWithDelta = (delta) => {
  ctx.clearRect(0, 0, dimensions.x, dimensions.y);
  nodes.forEach((node) => {
    node.node.x += delta.x;
    node.node.y += delta.y;
  });
  connectors.forEach((connector) => {
    connector.draw(connector.terminalEnd.x, connector.terminalEnd.y);
  });
  nodes.forEach((node) => {
    node.update();
    node.draw();
  });
};

export {
  props,
  ctx,
  dimensions,
  renderCtx,
  renderDimensions,
  unit,
  setContext,
  redraw,
  redrawWithDelta,
  setDimensions,
};
