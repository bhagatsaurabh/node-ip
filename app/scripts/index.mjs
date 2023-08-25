import { init, refAll, refOne } from "./utility.mjs";

init();
refAll(".toolbox .toolbox-category").forEach((el) => (el.style.visibility = "hidden"));

const resizeEl = refOne(".resize");
const editorEl = refOne(".editor");
const renderedEl = refOne(".rendered");

const editorCanvas = refOne("#editorCanvas");
const renderCanvas = refOne("#renderCanvas");

const toolboxEl = refOne(".toolbox");

const { width: editorCanvasWidth, height: editorCanvasHeight } = getComputedStyle(editorEl);
const { width: renderCanvasWidth, height: renderCanvasHeight } = getComputedStyle(renderedEl);

editorCanvas.setAttribute("width", editorCanvasWidth.substring(0, editorCanvasWidth.length - 2));
editorCanvas.setAttribute("height", editorCanvasHeight.substring(0, editorCanvasHeight.length - 2));
renderCanvas.setAttribute("width", renderCanvasWidth.substring(0, renderCanvasWidth.length - 2));
renderCanvas.setAttribute("height", renderCanvasHeight.substring(0, renderCanvasHeight.length - 2));

let resizerWidth = getComputedStyle(resizeEl).width;
resizerWidth = resizerWidth.substring(0, resizerWidth.length - 2);

let isResizing = false;
let pointerId, pos, target;
window.addEventListener("pointerdown", (event) => {
  if (event.target.classList.contains("resize") || event.target.classList.contains("resize-thumb")) {
    pointerId = event.pointerId;
    pos = { x: event.x, y: event.y };
    isResizing = true;
    target = event.target;
    resizingWait(true);
  }
});
window.addEventListener("pointermove", (event) => {
  if (pointerId !== event.pointerId) {
    isResizing = false;
    return;
  }
  if (isResizing && event.x > document.body.clientWidth * 0.3 && event.x < document.body.clientWidth * 0.8) {
    // resizeEl.style.left = event.x - resizerWidth / 2 + "px";
    editorEl.style.width = event.x - resizerWidth / 2 + "px";
    renderedEl.style.width = document.body.clientWidth - event.x - resizerWidth / 2 + "px";
    editorCanvas.setAttribute("width", event.x - resizerWidth / 2);
    renderCanvas.setAttribute("width", document.body.clientWidth - event.x - resizerWidth / 2);
  }
});
window.addEventListener("pointerup", (event) => {
  if (isResizing && pointerId === event.pointerId) {
    isResizing = false;
    resizingWait(false);
  }
});

const resizingWait = (status) => {
  if (status) {
    for (const el of refAll(".resizing-overlay")) {
      el.style.visibility = "visible";
    }
  } else {
    for (const el of refAll(".resizing-overlay")) {
      el.style.visibility = "hidden";
      redraw();
      renderOutput();
    }
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
