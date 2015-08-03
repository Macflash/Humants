// JavaScript source code
function worldView(scale, centerX, centerY, canvas, context) {
    this.scale = scale;
    this.centerX = centerX;
    this.centerY = centerY;
    this.canvas = canvas;
    this.context = context;
    this.antRadius = 5;
    this.hillRadius = 15;
    this.drawResource = function (r) {
        this.drawCircle(r.amount * this.scale, "green", this.scale * (r.x - (this.centerX)) + (this.canvas.width / 2), this.scale * (r.y - (this.centerY)) + (this.canvas.height / 2));
    }
    this.drawAnt = function (ant) {
        this.drawCircle(this.antRadius * this.scale, ant.color, this.scale * (ant.x - (this.centerX)) + (this.canvas.width / 2), this.scale * (ant.y - (this.centerY)) + (this.canvas.height / 2));
    };
    this.drawHill = function (ant) {
        this.drawCircle(this.hillRadius * this.scale, ant.color, this.scale * (ant.x - (this.centerX)) + (this.canvas.width / 2), this.scale * (ant.y - (this.centerY)) + (this.canvas.height / 2));
    };
    this.drawCircle = function (radius, color, x, y) {
        this.context.beginPath();
        this.context.arc(x, y, radius, 0, 2 * Math.PI, false);
        this.context.fillStyle = color;
        this.context.fill();
        //this.context.lineWidth = 1;
        //this.context.strokeStyle = color;
        //this.context.stroke();
    }
    this.clear = function () {
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }
}

