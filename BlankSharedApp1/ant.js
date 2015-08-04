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
    this.seeking = ResourceType.FOOD;
    this.target = null;
    this.lastNode = new path(color, x, y, null, null, null);
    this.dir = Math.random() * 360;
    this.turnchance = .1;
    this.pathcount = 0;
    this.turnamt = 30;
    this.movespd = 1;
    this.touchRange = 5;
    this.senseRange = 35;
    this.carryCapacity = 2;
    this.touched = function (e) {
        if (e.entity == Entity.RESOURCE) {
            //touched a resource!
            if (this.carrying == null) {
                console.log("picked up resource");
                var amt = Math.min(this.carryCapacity, e.amount);
                this.carrying = new resource(e.type, null, null, amt);
                e.amount -= amt;
                var cur = this.lastNode;
                while (cur.back != null) {
                    cur = cur.back;
                }
                this.target = cur;
                //console.log(this);
            }
        }



    }
    this.sensed = function (e) {
        if (e.entity == Entity.RESOURCE) {
            //we sensed a resource

            //is it what we are looking for?
            if (this.seeking == e.type && this.carrying == null) {
                //set this as our goal!
                this.target = e;
            }
        }
    }
    this.addNode = function () {
        var node = new path(this.color, this.x, this.y, this.lastNode, null, null);
        this.lastNode.out = node;
        this.lastNode = node;
        paths.push(this.lastNode);
    }
    this.update = function () {

        // if not targetting some objective
        if (this.target == null) {
            // update direction
            var r = Math.random();
            if (r < this.turnchance) {
                this.dir += (this.turnamt * (Math.random() - .5));
            }

            // move the ant
            this.x += dirToX(this.dir) * this.movespd;
            this.y += dirToY(this.dir) * this.movespd;

            this.pathcount += 1;
            if (this.pathcount > 100) {
                this.pathcount = 0;
                //this.addNode();
            }

        }
        else {
            //console.log("targetting!");
            var d = dist(this, this.target);
            if (Math.abs(d) > .0001) {
                var xx = (this.target.x - this.x) * this.movespd / d;
                var yy = (this.target.y - this.y) * this.movespd / d;
                this.x += xx;
                this.y += yy;
                //console.log(Math.sqrt(xx * xx + yy * yy));
            }
            //var tarDir = getDirToTarget(this, this.target);
            //this.dir = tarDir;
            //if (tarDir > this.dir) { this.dir += this.turnamt * Math.random(); }
            //else if (tarDir < this.dir) { this.dir -= this.turnamt * Math.random(); }
        }

    }
}

function dirToX(dir) {
    return Math.cos((dir / 180 )* Math.PI);
}

function dirToY(dir) {
    return Math.sin((dir / 180 )* Math.PI);
}

function getDirToTarget(a, e) {
    var d = 180 * Math.atan((e.y - a.y) / (e.x - a.x)) / Math.PI;
    if (a.x > e.x) { d *= -1;}
    return d;
}


function hill(x, y, color, ants) {
    this.entity = Entity.HILL;
    this.food = 10;
    this.x = x;
    this.y = y;
    this.ants = ants;
    this.color = color;
    this.rate = .005; // 
    this.counter = 1;
    this.spawnAnt = function () {
        this.ants.push(new ant(this.x, this.y, this.color));
    }
    this.update = function () {
        this.counter += this.rate;
        if (this.counter >= 1) {
            if (this.food > 1) {
                this.food -= 1;
                this.counter = 0;
                this.spawnAnt();
            }
        }
    }
}