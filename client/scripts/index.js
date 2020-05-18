var resizerContainer = document.getElementById('resizerContainer');
var editorContainer = document.getElementById('editorContainer');
var renderContiner = document.getElementById('renderContainer');

var editorCanvas = document.getElementById('editorCanvas');
var renderCanvas = document.getElementById('renderCanvas');

var toolboxContainer = document.getElementById('toolboxContainer');

var editorCanvasWidth = getComputedStyle(editorContainer).width;
var editorCanvasHeight = getComputedStyle(editorContainer).height;
var renderCanvasWidth = getComputedStyle(renderContiner).width;
var renderCanvasHeight = getComputedStyle(renderContiner).height;

editorCanvas.setAttribute('width', editorCanvasWidth.substring(0, editorCanvasWidth.length - 2));
editorCanvas.setAttribute('height', editorCanvasHeight.substring(0, editorCanvasHeight.length - 2));

renderCanvas.setAttribute('width', renderCanvasWidth.substring(0, renderCanvasWidth.length - 2));
renderCanvas.setAttribute('height', renderCanvasHeight.substring(0, renderCanvasHeight.length - 2));

var resizerWidth = window.getComputedStyle(resizerContainer).width;
resizerWidth = resizerWidth.substring(0, resizerWidth.length - 2);

var isResizing = false;
var currentSection = '';

window.addEventListener('mousedown', (event) => {
    if (event.target.id == 'resizerContainer') { 
        isResizing = true;
        resizingWait(true);
    }
});

window.addEventListener('mousemove', (event) => {
    if (isResizing && (event.x > (document.body.clientWidth * 0.3) && event.x < (document.body.clientWidth * 0.8))) {
        resizerContainer.style.left = (event.x - (resizerWidth / 2)) + 'px';
        editorContainer.style.width = (event.x - (resizerWidth / 2)) + 'px';
        renderContiner.style.width = ((document.body.clientWidth - event.x) - (resizerWidth / 2)) + 'px';
        editorCanvas.setAttribute('width', (event.x - (resizerWidth / 2)));
        renderCanvas.setAttribute('width', ((document.body.clientWidth - event.x) - (resizerWidth / 2)));
    }
});

window.addEventListener('mouseup', (event) => {
    if (isResizing) {
        isResizing = false;
        resizingWait(false);
    }
});

function resizingWait(status) {
    if (status) {
        for (var el of document.getElementsByClassName('resizingWait')) {
            el.style.visibility = 'visible';
        }
    } else {
        for (var el of document.getElementsByClassName('resizingWait')) {
            el.style.visibility = 'hidden';
            redraw();
            renderOutput();
        }
    }
}

function toolboxSectionClicked(section) {
    if (currentSection == section.id) {
        currentSection = '';
        showAllSectionHeadings();
        toolboxContainer.style.left = '-4%';
        setTimeout( () => {
            document.getElementById(section.id.replace('Heading', '')).style.zIndex = '4';
        }, 300);
    } else {
        currentSection = section.id;
        hideAllSectionHeadings(section.id);
        toolboxContainer.style.left = '0';
        document.getElementById(section.id.replace('Heading', '')).style.zIndex = '5';
    }
}

function hideAllSectionHeadings(id) {
    for (var el of document.getElementsByClassName('toolboxSectionHeading')) {
        if (el.id != id) {
            el.style.opacity = '0';
            el.style.pointerEvents = 'none';
        }
    }
}

function showAllSectionHeadings() {
    for (var el of document.getElementsByClassName('toolboxSectionHeading')) {
        el.style.opacity = '1';
        el.style.pointerEvents = 'all';
    }
}