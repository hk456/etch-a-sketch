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

class RectangleStroke {
    constructor(color, thickness){
        this.color = color;
        this.thickness = thickness;
        this.points = [];
    }

    draw(ctx){
        if(this.points.length < 2) return;

        // set the canvas's property variables to the ones we have currently
        ctx.strokeStyle = this.color;
        ctx.lineWidth = this.thickness;

        // start the path 
        ctx.beginPath();

        // draw the rect 
        let width = Math.abs(this.points[1].x - this.points[0].x);
        let height = Math.abs(this.points[1].y - this.points[0].y);
        let x = this.points[0].x;
        let y = this.points[0].y;

        // draw the damn rectangle (finally, gosh)
        ctx.strokeRect(x, y, width, height);
    }

    addPoint(x, y){
        // there are three cases here 
        
        // first if this is the first point that's being added to the rectangle
        if(this.points.length==0){
            this.points.push({x,y});
        }
        
        // second, if this is the second point that's being added to the rectangle
        else if(this.points.length==1){
            this.points.push({x, y});
            // but now i also want it to draw itself
        }

        // and lastly if this is the third point that's being added to the rectangle
        else{
            // in this case, we do not add this point further, we just change the last variables whereabouts to its
            this.points[1].x = x;
            this.points[1].y = y;
        }
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
const rectTool = document.getElementById("rect-tool");
const pencilTool = document.getElementById("pencil-tool");
const rectBorderSizePicker = document.getElementById("rectBorderSize");

canvas.width = window.innerWidth - 20;
canvas.height = window.innerHeight - 75;

let isBrushStroke = false;
let isRectangle = false;
let isDrawing = false;

rectTool.addEventListener("click", () => {
    isRectangle = true;
    isBrushStroke = false;
});

pencilTool.addEventListener("click", () => {
    isBrushStroke = true;
    isRectangle = false;    
});

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

function drawBrushStroke(e) {
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

function drawRectangle(e){
    // pick the current value of color picker
    let color = colorPicker.value;
    let thiccness = rectBorderSizePicker.value;

    // create a new object containing those rectangle vertex values to draw
    currentStroke = new RectangleStroke(color, thiccness);

    // and add it onto the stack
    undoStack.push(currentStroke);

    // and also include this very point in the object
    currentStroke.addPoint(e.offsetX, e.offsetY);
}

canvas.addEventListener("mousedown", (e) => {
    if(isBrushStroke){
        drawBrushStroke(e);
        isDrawing=true;
    }
    else if(isRectangle){
        drawRectangle(e);
        isDrawing=true;
    }
    else return;
});

window.addEventListener("mousemove", (e) => {
    // only continue this thing if ur drawing
    if(!isDrawing) return;
    // only do this if the thing is still inside the canvas 
    if(e.target==canvas){        
        if(isBrushStroke){
            // pull the latest object from the undo stack, wherein here in this case, it's likely to be a brush stroke
            currentStroke.addPoint(e.offsetX, e.offsetY);
            // then render everything
            renderEverything();
        }
        else if(isRectangle){
            // pull the latest object from the undo stack, wherein here in this case, it's likely to be a rectangle stroke
            currentStroke.addPoint(e.offsetX, e.offsetY);
            // and then render everything, so that the user can see the rectanlge moving whilst he's going to put in the final point for the rectangle
            ctx.reset();
            renderEverything();
        }
    }
});

window.addEventListener("mouseup", (e)=>{
    // set the boolean back to false
    isDrawing=false;
    // and then set the currentStroke object to null, just like the brush stroke one above
    currentStroke = null;
    if(isRectangle){
        // clear everything, and render it again here
        ctx.reset();
        renderEverything();
    }
});

window.addEventListener("resize", () => { 
    // for resizing the thing, thats it
    canvas.width = window.innerWidth - 20;
    canvas.height = window.innerHeight - 75;
});

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
