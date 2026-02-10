class BrushStroke {
    constructor(color, lineWidth) {
        this.color = color;
        this.lineWidth = lineWidth;
        this.points = [];
    }

    draw(ctx) {
        if(this.points.length < 2) return;

        // set the canvas' contexts' variables to the ones of the object currently
        ctx.strokeStyle = this.color;
        ctx.lineWidth = this.lineWidth;
        ctx.lineCap = "round";
        ctx.lineJoin = "round";

        // START THE PATH 
        ctx.beginPath();

        // move to the first point that triggered this method 
        ctx.moveTo(this.points[0].x, this.points[0].y);
        
        // draw the connecting lines 
        for(let i=1;i<this.points.length;i++){
            ctx.lineTo(this.points[i].x, this.points[i].y);
        }

        // finalize
        ctx.stroke();
    }

    addPoint(x, y) {
        this.points.push({ x, y });
    }
}

let undoStack = [];
let redoStack = []; // this will have a capacity of 5.
let currentStroke = null; // this will hold the current object that will be in working

// taking input buttons 
const canvas = document.getElementById("mainCanvas");
const ctx = canvas.getContext("2d");
const colorPicker = document.getElementById("colorPicker");
const brushSizeSelector = document.getElementById("brushSize");
const clearBtn = document.getElementById("clearBtn");
const redoBtn = document.getElementById("redo");
const undoBtn = document.getElementById("undo");

canvas.width = window.innerWidth - 20;
canvas.height = window.innerHeight - 75;

let isDrawing = false;

function renderEverything() {
    // 1. wipe the slateboard clean of everything
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // 2. REDRAW: loop through the stack from START to FINISH
    // using ForEach is naturally FIFO (starts at index 0)
    undoStack.forEach(obj => {
        // Each object uses its internal array 
        // of points to draw itself from using its pre-defined properties
        obj.draw(ctx);
    });
}

function beginDraw(e) {
    isDrawing=true;

    // pick the current values of color and color width chosen
    let color = colorPicker.value;
    let colorWidth = brushSizeSelector.value;

    // create a new object containing those obtained values
    currentStroke = new BrushStroke(color, colorWidth);

    // and add it onto the undo stack
    undoStack.push(currentStroke);

    // and also include this very point in the object
    currentStroke.addPoint(e.offsetX, e.offsetY);
}

function keepDrawing(e) {
    if(!isDrawing) return;

    // only draw if the mouse is still inside the canvas
    if(e.target == canvas) {
        currentStroke.addPoint(e.offsetX, e.offsetY);
        renderEverything();
    }
}

// for resizing the thing, thats it
function resizeCanvas() {
    canvas.width = window.innerWidth - 20;
    canvas.height = window.innerHeight - 75;
}

canvas.addEventListener("mousedown", beginDraw);

window.addEventListener("mousemove", keepDrawing);

window.addEventListener("mouseup", ()=>{
    isDrawing=false;
    currentStroke = null;
});

window.addEventListener("resize", resizeCanvas);

clearBtn.addEventListener("click", (event) => {
    ctx.reset();
    undoStack = [];
    redoStack = [];
    renderEverything();
});

undoBtn.addEventListener("click", (event) => {
    // first check if the stack has any elements in the first place
    if(undoStack.length > 0){
        // then pop the latest object from the list and store it in a variable
        let removedStroke = undoStack.pop();

        // push to redo 
        redoStack.push(removedStroke);

        // if the limit hits 5, remove the oldest from the redo stack
        if(redoStack.length > 5){
            redoStack.shift();
        }
        
        // trigger a redraw loop to draw all the remaining objects again now
        renderEverything();
    }
});

redoBtn.addEventListener("click", (event) => {
    // first, check if the queue has any objects left to begin with
    if(redoStack.length > 0){
        // take the first element of the queue 
        let restoredStroke = redoStack.pop();

        // add it onto the undoStack 
        undoStack.push(restoredStroke);

        // and redraw everything
        renderEverything();
    }    
});