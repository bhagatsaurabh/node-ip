import { init, refAll, refOne } from "./utility.mjs";

init();
refAll(".toolbox .toolbox-category").forEach((el) => (el.style.visibility = "hidden"));

const resizeEl = refOne(".resize");
const editorEl = refOne(".editor");
const renderedEl = refOne(".rendered");

var editorCanvas = document.getElementById("editorCanvas");
var renderCanvas = document.getElementById("renderCanvas");

const toolboxEl = refOne(".toolbox");

var editorCanvasWidth = getComputedStyle(editorEl).width;
var editorCanvasHeight = getComputedStyle(editorEl).height;
var renderCanvasWidth = getComputedStyle(renderedEl).width;
var renderCanvasHeight = getComputedStyle(renderedEl).height;

editorCanvas.setAttribute("width", editorCanvasWidth.substring(0, editorCanvasWidth.length - 2));
editorCanvas.setAttribute("height", editorCanvasHeight.substring(0, editorCanvasHeight.length - 2));

renderCanvas.setAttribute("width", renderCanvasWidth.substring(0, renderCanvasWidth.length - 2));
renderCanvas.setAttribute("height", renderCanvasHeight.substring(0, renderCanvasHeight.length - 2));

var resizerWidth = window.getComputedStyle(resizeEl).width;
resizerWidth = resizerWidth.substring(0, resizerWidth.length - 2);

var isResizing = false;

window.addEventListener("mousedown", (event) => {
  if (event.target.classList.contains("resize")) {
    isResizing = true;
    resizingWait(true);
  }
});

window.addEventListener("mousemove", (event) => {
  if (isResizing && event.x > document.body.clientWidth * 0.3 && event.x < document.body.clientWidth * 0.8) {
    resizeEl.style.left = event.x - resizerWidth / 2 + "px";
    editorEl.style.width = event.x - resizerWidth / 2 + "px";
    renderedEl.style.width = document.body.clientWidth - event.x - resizerWidth / 2 + "px";
    editorCanvas.setAttribute("width", event.x - resizerWidth / 2);
    renderCanvas.setAttribute("width", document.body.clientWidth - event.x - resizerWidth / 2);
  }
});

window.addEventListener("mouseup", (event) => {
  if (isResizing) {
    isResizing = false;
    resizingWait(false);
  }
});

function resizingWait(status) {
  if (status) {
    for (var el of refAll(".resizing-overlay")) {
      el.style.visibility = "visible";
    }
  } else {
    for (var el of refAll(".resizing-overlay")) {
      el.style.visibility = "hidden";
      redraw();
      renderOutput();
    }
  }
}

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
