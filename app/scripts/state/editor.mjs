import { refOne } from "../utility.mjs";
import { connectors } from "./connectors.mjs";
import { nodes } from "./nodes.mjs";

let terminalStartFlag = 0;
let currentConnector = null;
let ctx = refOne("#editorCanvas").getContext("2d");
let renderCtx = refOne("#renderCanvas").getContext("2d");
const dimensions = { x: 0, y: 0 };
const renderDimensions = { x: 0, y: 0 };
const unit = dimensions.x * 0.01;
let globalFontSize = dimensions.x * 0.014;
let globalBaseHeight = dimensions.x * 0.025;
let wasDragging = false;
let globalRadius = dimensions.x * 0.008;
let globalOutlineWidth = 2;
let selectedNodes = [];
let gSFactor = 1.0;
let globalTerminalRadius = 5;
let globalConnectorBezierOffset = dimensions.x * 0.06;
let globalConnectorWidth = dimensions.x * 0.006;
let globalScaleRatio = 1;

const setCurrentConnector = (val) => (currentConnector = val);
const setTerminalStartFlag = (val) => (terminalStartFlag = val);
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
const setGlobalScaleRatio = (val) => (globalScaleRatio = val);
const setSelectedNodes = (val) => (selectedNodes = val);
const setWasDragging = (val) => (wasDragging = val);

export {
  terminalStartFlag,
  currentConnector,
  ctx,
  dimensions,
  renderCtx,
  renderDimensions,
  unit,
  globalFontSize,
  globalBaseHeight,
  wasDragging,
  globalRadius,
  globalOutlineWidth,
  selectedNodes,
  gSFactor,
  globalTerminalRadius,
  globalConnectorBezierOffset,
  globalConnectorWidth,
  globalScaleRatio,
  setCurrentConnector,
  setTerminalStartFlag,
  setContext,
  redraw,
  setDimensions,
  setGlobalScaleRatio,
  setSelectedNodes,
  setWasDragging,
};
