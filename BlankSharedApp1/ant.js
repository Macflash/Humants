// JavaScript source code

var Seeking = { FOOD: "food", WATER: "water" };

function ant(x, y) {
    this.x = x;
    this.y = y;
    this.carrying = null;
    this.seeking = null;
    this.following = null;
    this.dir = 0;
    this.turnchance = .1;
    this.turnamt = 10;
    this.movespd = 1;
    this.update = function () {
        // update direction
        var r = random();
        if (r < this.turnchance) {
            this.dir += (this.turnamt * (random() - .5));
        }

        // move the ant
        this.x += dirToX(dir) * this.movespd;
        this.y += dirToY(dir) * this.movespd;
    }
}

function dirToX(dir) {
    return Math.cos((dir / 180 )* Math.PI);
}

function dirToY(dir) {
    return Math.sin((dir / 180 )* Math.PI);
}


function antHill(x, y, color) {
    this.x = x;
    this.y = y;
    this.rate = .2;
    this.color;
}