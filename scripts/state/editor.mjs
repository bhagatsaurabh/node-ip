import { refOne } from "../utility.mjs";
import { connectors } from "./connectors.mjs";
import { nodes } from "./nodes.mjs";

let ctx = refOne("#editorCanvas").getContext("2d");
let renderCtx = refOne("#renderCanvas").getContext("2d");
const dimensions = { x: 0, y: 0 };
const renderDimensions = { x: 0, y: 0 };
const props = {
  currentConnector: null,
  terminalStartFlag: 0,
  globalScaleRatio: 1,
  selectedNodes: [],
  wasDragging: false,
  gSFactor: 1.0,
  globalFontSize: 14,
  globalBaseHeight: 25,
  globalRadius: 8,
  globalOutlineWidth: 2,
  globalTerminalRadius: 7,
  globalConnectorBezierOffset: 60,
  globalConnectorWidth: 6,
  unit: 10,
};
const downScaleStep = 0.9;
const upScaleStep = 1.1;
const downScaleStepSensitive = 0.98;
const upScaleStepSensitive = 1.02;

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
  if (clear) {
    ctx.clearRect(0, 0, dimensions.x, dimensions.y);
  }

  nodes.forEach((node) => node.update());
  connectors.forEach((connector) => connector.draw(connector.terminalEnd.x, connector.terminalEnd.y));
  nodes.forEach((node) => node.draw(ctx));
};
const redrawWithDelta = (delta) => {
  ctx.clearRect(0, 0, dimensions.x, dimensions.y);
  nodes.forEach((node) => {
    node.x += delta.x;
    node.y += delta.y;
  });
  connectors.forEach((connector) => {
    connector.draw(connector.terminalEnd.x, connector.terminalEnd.y);
  });
  nodes.forEach((node) => {
    node.update();
    node.draw(ctx);
  });
};

export {
  props,
  ctx,
  dimensions,
  renderCtx,
  renderDimensions,
  downScaleStep,
  downScaleStepSensitive,
  upScaleStep,
  upScaleStepSensitive,
  setContext,
  redraw,
  redrawWithDelta,
  setDimensions,
};
