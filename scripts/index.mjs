import { renderOutput } from "./renderer.mjs";
import { redraw, setDimensions } from "./state/editor.mjs";
import { init, refAll, refOne, isInRange, throttle } from "./utility.mjs";
import { handleDrop, pushOutputNode } from "./editor.mjs";

init();
refAll(".toolbox .toolbox-category").forEach((el) => (el.style.visibility = "hidden"));

const editorEl = refOne(".editor");
const renderedEl = refOne(".rendered");
const editorCanvas = refOne("#editorCanvas");
const renderCanvas = refOne("#renderCanvas");
const toolboxEl = refOne(".toolbox");

let outputPushed = false;
const handleCanvasResize = throttle((entries) => {
  entries.forEach((entry) => {
    entry.target.width = entry.contentRect.width;
    entry.target.height = entry.contentRect.height;
    setDimensions({ x: entry.target.width, y: entry.target.height }, entry.target.id);
  });

  if (!outputPushed) {
    pushOutputNode();
    outputPushed = !outputPushed;
  }

  redraw(true);
  renderOutput();
}, 100);
const resizeObserver = new ResizeObserver(handleCanvasResize);

resizeObserver.observe(editorCanvas);
resizeObserver.observe(renderCanvas);

let resizerThickness = getComputedStyle(refOne(":root")).getPropertyValue("--resizer-thickness");
resizerThickness = parseInt(resizerThickness.slice(0, -2));

let layout;
const mqList = window.matchMedia("(max-width: 768px)");
const resetLayout = () => {
  if (layout === "horizontal") {
    editorEl.style.width = visualViewport.width * 0.6 - resizerThickness / 2 - 1 + "px";
    editorEl.style.height = "100%";
    renderedEl.style.width = visualViewport.width * 0.4 - resizerThickness / 2 + 1 + "px";
    renderedEl.style.height = "100%";
    editorCanvas.width = editorEl.style.width.slice(0, -2);
    editorCanvas.height = visualViewport.height;
    renderCanvas.width = renderedEl.style.width.slice(0, -2);
    renderCanvas.height = visualViewport.height;
  } else if (layout === "vertical") {
    editorEl.style.height = visualViewport.height * 0.6 - resizerThickness / 2 - 1 + "px";
    editorEl.style.width = "100%";
    renderedEl.style.height = visualViewport.height * 0.4 - resizerThickness / 2 + 1 + "px";
    renderedEl.style.width = "100%";
    editorCanvas.height = editorEl.style.height.slice(0, -2);
    editorCanvas.width = visualViewport.width;
    renderCanvas.height = renderedEl.style.height.slice(0, -2);
    renderCanvas.width = visualViewport.width;
  }
};
const handleMediaChange = (event) => {
  if (event.matches) layout = "vertical";
  else layout = "horizontal";
  resetLayout();
};
mqList.addEventListener("change", handleMediaChange);
handleMediaChange({ matches: mqList.matches });

let isResizing = false;
let pointerId, pos, target;
const handleResizeStart = (event) => {
  if (event.target.classList.contains("resize") || event.target.classList.contains("resize-thumb")) {
    event.stopPropagation();
    pointerId = event.pointerId;
    pos = { x: event.x, y: event.y };
    isResizing = true;
    target = event.target;
    resizingWait(true);
  }
};
const handleResize = (event) => {
  if (pointerId !== event.pointerId) {
    isResizing = false;
    return;
  }
  if (layout === "horizontal") {
    const clientWidth = visualViewport.width;
    if (isResizing && isInRange(event.x, clientWidth * 0.3, clientWidth * 0.8)) {
      editorEl.style.width = event.x - resizerThickness / 2 + "px";
      renderedEl.style.width = clientWidth - event.x - resizerThickness / 2 + "px";
      editorCanvas.setAttribute("width", event.x - resizerThickness / 2);
      renderCanvas.setAttribute("width", clientWidth - event.x - resizerThickness / 2);
    }
  } else if (layout === "vertical") {
    const clientHeight = visualViewport.height;
    if (isResizing && isInRange(event.y, clientHeight * 0.3, clientHeight * 0.8)) {
      editorEl.style.height = event.y - resizerThickness / 2 + "px";
      renderedEl.style.height = clientHeight - event.y - resizerThickness / 2 + "px";
      editorCanvas.setAttribute("height", event.y - resizerThickness / 2);
      renderCanvas.setAttribute("height", clientHeight - event.y - resizerThickness / 2);
    }
  }
};
const handleResizeFinish = (event) => {
  if (isResizing && pointerId === event.pointerId) {
    isResizing = false;
    resizingWait(false);
  }
};
window.addEventListener("pointerdown", handleResizeStart);
window.addEventListener("pointermove", handleResize);
window.addEventListener("pointerup", handleResizeFinish);
window.addEventListener("contextmenu", (event) => {
  if (event.target.classList.contains("resize") || event.target.classList.contains("resize-thumb")) {
    event.preventDefault();
  }
});

const resizingWait = (status) => {
  for (const el of refAll(".overlay")) {
    if (status) {
      el.classList.add("show");
    } else {
      el.classList.remove("show");
    }
  }

  if (!status) {
    redraw(true);
    renderOutput();
  }
};

const toolboxSectionClickHandler = (e) => {
  const name = e.target.dataset.category;

  if (name === "close") {
    toolboxEl.classList.toggle("open");
    refAll(".toolbox .heading").forEach((el) => el.classList.remove("active"));
    refAll(".toolbox .toolbox-category").forEach((el) => el.classList.remove("show"));
    return;
  }

  refAll(".toolbox .heading").forEach((el) => el.classList.remove("active"));
  e.target.classList.add("active");
  const section = refOne(`#toolbox-${name}`);
  const isToolboxOpened = toolboxEl.classList.contains("open");
  if (!isToolboxOpened || section.classList.contains("show")) {
    toolboxEl.classList.toggle("open");
    if (section.classList.contains("show")) {
      refAll(".toolbox .heading").forEach((el) => el.classList.remove("active"));
      refAll(".toolbox .toolbox-category").forEach((el) => el.classList.remove("show"));
      return;
    }
  }
  refAll(".toolbox .toolbox-category").forEach((el) => el.classList.remove("show"));
  section.classList.toggle("show");
};

refAll(".toolbox .toolbox-category").forEach((el) =>
  el.addEventListener("transitionend", (e) => {
    if (!e.target.classList.contains("toolbox-category")) return;
    e.stopPropagation();
    if (e.target.classList.contains("show")) {
      e.target.removeAttribute("style");
    } else {
      e.target.style.visibility = "hidden";
    }
  })
);

for (const heading of refAll(".toolbox .heading")) {
  heading.addEventListener("click", toolboxSectionClickHandler);
}

refAll(".item-container").forEach((el) => {
  el.addEventListener("dragstart", (e) => {
    e.dataTransfer.setData("text/plain", e.target.dataset.name);
  });
  el.addEventListener("click", (e) => {
    const rect = editorCanvas.getBoundingClientRect();
    handleDrop(e.target.dataset.name, { x: rect.x + rect.width / 2, y: rect.y + rect.height / 2 });
  });
});
