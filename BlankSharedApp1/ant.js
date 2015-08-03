// JavaScript source code

function team(color) {
    this.color = color;
    this.ants = new Array();
    this.hills = new Array();
}

function team(color, x, y) {
    this.color = color;
    this.ants = new Array();
    this.hills = new Array();
    this.hills.push(new hill(x, y, color, this.ants));
}

function ant(x, y, color) {
    this.entity = Entity.ANT;
    this.x = x;
    this.y = y;
    this.color = color;
    this.carrying = null;
    this.seeking = null;
    this.following = null;
    this.dir = Math.random() * 360;
    this.turnchance = .1;
    this.turnamt = 30;
    this.movespd = 1;
    this.update = function () {
        // update direction
        var r = Math.random();
        if (r < this.turnchance) {
            this.dir += (this.turnamt * (Math.random() - .5));
        }

        // move the ant
        this.x += dirToX(this.dir) * this.movespd;
        this.y += dirToY(this.dir) * this.movespd;
    }
}

function dirToX(dir) {
    return Math.cos((dir / 180 )* Math.PI);
}

function dirToY(dir) {
    return Math.sin((dir / 180 )* Math.PI);
}


function hill(x, y, color, ants) {
    this.food = 10;
    this.x = x;
    this.y = y;
    this.ants = ants;
    this.color = color;
    this.rate = .05; // 
    this.counter = 0;
    this.spawnAnt = function () {
        this.ants.push(new ant(this.x, this.y, this.color));
    }
    this.update = function () {
        this.counter += this.rate;
        if (this.counter > 1) {
            if (this.food > 1) {
                this.food -= 1;
                this.counter = 0;
                this.spawnAnt();
            }
        }
    }
}