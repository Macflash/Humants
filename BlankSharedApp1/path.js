// JavaScript source code
function path(color, x, y, back, out, type) {
    this.entity = Entity.PATH;
    this.color = color;
    this.x = x;
    this.y = y;
    this.back = back;
    this.out = out;
    this.type = type;
    this.strength = 100;
    this.update = function () {
        this.strength *= .998;
        if (this.strength < 1) { this.back = null; this.out = null;}
    }
}


function dist(e1, e2) {
    var dx = e1.x - e2.x;
    var dy = e1.y - e2.y;
    return Math.sqrt((dx * dx) + (dy * dy));
}