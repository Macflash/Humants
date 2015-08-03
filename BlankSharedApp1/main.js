// JavaScript source code

// DRAWING OBJECTS
var canvas;
var context;

//ANT OBJECTS
var ants;


function init() {
    // SETUP DRAWING OBJECTS
    canvas = document.getElementById("maincanvas");
    context = canvas.getContext("2d");
    drawCircle(5, "blue", 200, 300);

    // SETUP ANT OBJECTS
    ants = new Array();
    ants.push(new ant(100, 100));

    update();
    setInterval("update()", 100);
}

function update() {
    for (var i = 0; i < ants.length; i++){
        ants[i].update();
        drawCircle(5, "red", ants[i].x, ants[i].y);
    }
}


function drawCircle(radius, color, x, y) {
    context.beginPath();
    context.arc(x, y, radius, 0, 2 * Math.PI, false);
    context.fillStyle = color;
    context.fill();
    context.lineWidth = 1;
    context.strokeStyle = color;
    context.stroke();
}