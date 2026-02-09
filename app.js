const canvas = document.getElementById("mainCanvas");
const ctx = canvas.getContext("2d");
const colorPicker = document.getElementById("colorPicker");
const brushSize = document.getElementById("brushSize");
const clearBtn = document.getElementById("clearBtn");

canvas.width = window.innerWidth-20;
canvas.height = window.innerHeight-75;

let isDrawing = false;

function startDrawing(e){
    isDrawing=true;
    ctx.beginPath();
    ctx.moveTo(e.offsetX, e.offsetY);
    draw(e);
}

function stopDrawing(){
    isDrawing=false;
    ctx.beginPath();
}

function draw(e){
    if(!isDrawing) return;

    ctx.strokeStyle = colorPicker.value;
    ctx.lineWidth = brushSize.value;
    ctx.lineCap = 'round';

    ctx.lineTo(e.offsetX, e.offsetY);
    ctx.stroke();
}

function resizeCanvas(){
    canvas.width = window.innerWidth-20;
    canvas.height = window.innerHeight-75;
}

document.addEventListener("mousedown",startDrawing);
document.addEventListener("mousemove",draw);
document.addEventListener("mouseup",stopDrawing);
window.addEventListener("resize",resizeCanvas);
clearBtn.addEventListener("click",(event)=>{
    ctx.reset();
});