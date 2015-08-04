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
        this.drawCircle(r.amount, "green", r.x, r.y);
    }
    this.drawPath = function (r) {
        this.drawCircle(r.strength / 10, "yellow", r.x, r.y);
    }
    this.drawAnt = function (ant) {
        this.drawCircle(this.antRadius, ant.color, ant.x, ant.y);
    };
    this.drawHill = function (ant) {
        this.drawLINECircle(this.hillRadius, ant.color, ant.x, ant.y);
    };
    this.drawLINECircle = function (radius, color, worldx, worldy) {
        var x = this.scale * (worldx - (this.centerX)) + (this.canvas.width / 2);
        var y = this.scale * (worldy - (this.centerY)) + (this.canvas.height / 2);
        this.context.beginPath();
        this.context.arc(x, y, radius * this.scale, 0, 2 * Math.PI, false);
        //this.context.fillStyle = color;
        //this.context.fill();
        this.context.lineWidth = 1;
        this.context.strokeStyle = color;
        this.context.stroke();
    }
    this.drawCircle = function (radius, color, worldx, worldy) {
        var x = this.scale * (worldx - (this.centerX)) + (this.canvas.width / 2);
        var y = this.scale * (worldy - (this.centerY)) + (this.canvas.height / 2);
        this.context.beginPath();
        this.context.arc(x, y, radius * this.scale, 0, 2 * Math.PI, false);
        this.context.fillStyle = color;
        this.context.fill();
    }
    this.clear = function () {
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.drawCircle(10, "black", 0, 0);
    }
}

