// JavaScript source code
var Needs = { FOOD: 0, WATER: 1, SHELTER: 2, COMFORT: 3 };
var Quality = {POOR: .5, NORMAL: 1, GOOD: 1.2, EXCELLENT: 1.3};
var Resource = { SOIL: 0, TREES: 1, IRON: 2, GOLD: 3, OIL: 4, ROCK: 5, WATER: 6 };
var Supply = { COTTON: 0, LUMBER: 1, GRAIN: 2 };

function land(x,y,ownerid) {
    this.ownerid = ownerid;
    this.x = x;
    this.y = y;
    this.resources = [];
    this.resources[Resource.SOIL] = Math.random();
    this.resources[Resource.WATER] = Math.random();
    this.resources[Resource.TREES] = Math.pow(Math.random(), 4);
    this.resources[Resource.ROCK] = Math.pow(Math.random(), 8);
    this.resources[Resource.IRON] = Math.pow(Math.random(), 10);
    this.resources[Resource.OIL] = Math.pow(Math.random(), 15);
    this.resources[Resource.GOLD] = Math.pow(Math.random(), 100);
}

// A good that satisfies certain needs
function good(name) {
    this.name = name;
    this.satisfies = []; //needs this satisfies
    this.res = []; // resources this requires
    this.supplies = []; //inputs this supplies
    this.inputs = []; //inputs this requires
    this.difficulty = 1;
}

function goodList(){
    this.list = [];
    this.push = function(e){
        this.list.push(e);
    }
    this.pop = function(){
        return this.list.pop();
    }
    this.isEmpty = function () {
        if (this.list.length > 0) {
            return false;
        }
        return true;
    }
    this.name = function(){
        return this.list[this.list.length-1].name;
    }
    this.satisfies = function(){
        return this.list[this.list.length-1].satisfies;
    }
    this.res = function(){
        return this.list[this.list.length-1].res;
    }
    this.supplies = function(){
        return this.list[this.list.length-1].supplies;
    }
    this.inputs = function () {
        return this.list[this.list.length - 1].inputs;
    }
    this.difficulty = function(){
        return this.list[this.list.length-1].difficulty;
    }
}

// A person who acts to satisfy their needs
function person(id) {
    this.id = id;
    this.x = 0;
    this.y = 0;
    this.inventory = [];
    this.walkspeed = 5;

    //  BASE SKILL STATS
    this.skill = .75 + Math.random() * .5;
    this.doingAction = false;
    this.making = new goodList();
    this.progress = new goodList();

    // CURRENT NEEDS
    this.needs = [];
    this.needs[Needs.FOOD] = 0;
    this.needs[Needs.WATER] = 0;
    this.needs[Needs.COMFORT] = 0;

    this.updateNeeds = function (t) {
        for (var k in this.needs) {
            this.needs[k] += t;
        }
    }

    this.action = function (t) {
        if (this.doingAction) {
            this.continueAction(t);
        }
        else {
            this.pickAndStartAction(t);
        }
    }

    this.continueAction = function (t) {
        //do that action yo!
        //go through all the inputs and make them, or work on the land to get the resource
        var done = true;

        //go through all the supply goods and make or get them
        for (var s in this.making.inputs()) {
            //console.log("you have this much: " + this.checkInventoryForInputs(s));
            //console.log("you need this much: " + this.making.inputs()[s]);
            //console.log(this.inventory);
            // check if the supply is already satisfied because the item is in your inventory
            if (this.checkInventoryForInputs(s) < this.making.inputs()[s]) {
                //this means we don't have enough of this supply item
                // - so we need to make it (or buy it!)
                
                // pick which item supplies enough of this
                var sup = this.pickInput(s);
                this.make(sup);
                done = false;
                break;
            }
        }
        if (done) {
            //go through and work on all the resources for this object
            for (var r in this.making.res()) {
                if (this.progress.res()[r] == null) { this.progress.res()[r] = 0; }
                //console.log("p: " + this.progress.res);
                if (this.progress.res()[r] < this.making.res()[r]) {
                    //TODO: need to evaluate timing and savings for each land tile better than this one
                    // best tile might not have highest stats, it might instead be a bit better and way closer
                    var tile = this.getCurrentMapTile();
                    var bestTile = this.pickBestLand(r);
                    if (this.x != bestTile.x * cellSize || this.y != bestTile.y * cellSize) {
                        //check if we should move to that tile
                        //ie the time we'd save is larger than the time it would take to get there
                        //var transit = this.estimateTravelTime(bestTile);
                        //var savings = this.estimateWorkTime(bestTile, r) - this.estimateWorkTime(tile, r);
                        //if (savings >= transit) {
                        //    console.log("HEY YOU SHOULD MOVE!");
                        this.moveTowardTile(bestTile);
                        //}
                    }
                    else {
                        //console.log(tile.resources[r]);
                        this.progress.res()[r] += tile.resources[r] * t / 1000; //to take about 1 second
                    }
                    done = false;
                    break;
                }
            }
        }
        if (done) {
            console.log("finished making " + this.making.name());
            //remove the supplies used from your inventory!
            this.inventory.push(this.making.pop());
            this.progress.pop();
            if (this.making.isEmpty()) {
                this.doingAction = false;
            }
        }
    }
    this.estimateWorkTime = function (tile, r) {
        return tile.resources[r] * t / 1000;
    }
    this.estimateTravelTime = function (destTile) {
        var curTile = this.getCurrentMapTile();
        var dx = destTile.x - curTile.x;
        var dy = destTile.y - curTile.y;
        var d = Math.sqrt(dy * dy + dx * dx);
        return d / this.walkspeed;
    }
    this.moveTowardTile = function (dest) {
        var curTile = this.getCurrentMapTile();
        var dx = dest.x - curTile.x;
        var dy = dest.y - curTile.y;
        var d = Math.sqrt(dy * dy + dx * dx);
        this.x += dx / d;
        this.y += dy / d;
    }
    this.getCurrentMapTile = function () {
        var xx = Math.floor(this.x / cellSize);
        var yy = Math.floor(this.y / cellSize);
        return map[xx][yy];
    }

    this.pickAndStartAction = function(t){
        //console.log("needs: " + this.needs);
        //find the most pressing need
        var need = this.highestNeed();
        console.log(need);
        if (need < 0) {
            console.log("no needs huh");
            // i guess you are set? wait for now...
            return;
        }
        //check if you have something in your inventory to help it
        var inv = this.checkInventory(need);

        //if you have it, use it
        if (inv >= 0) {
            this.use(inv);
        }
        else {
            // otherwise find the best good to satisify that need
            var g = this.pickGood(need);

            // and make it (or buy it?)
            this.make(g);
        }
    }

    this.highestNeed = function () {
        //order wins in tie, should later take into consideration which one can be satisfied fastest / most efficiently!
        var n = -1;
        var max = 0;
        for (var k in this.needs) {
            if (this.needs[k] > max) {
                max = this.needs[k];
                n = k;
            }
        }
        return n;
    }

    this.checkInventory = function (need) {
        var pick = -1;
        for (var i = 0; i < this.inventory.length; i++) {
            if (this.inventory[i].satisfies[need]) {
                pick = i;
            }
        }
        return pick;
    }

    this.checkInventoryForInputs = function (s) {
        var count = 0;
        for (var i = 0; i < this.inventory.length; i++) {
            if (this.inventory[i].supplies[s] > 0) {
                count += this.inventory[i].supplies[i];
            }
        }
        return count;
    }

    this.use = function (i) {
        console.log("used " + this.inventory[i].name);
        var g = this.inventory[i];
        //apply the effects of the good
        for (var k in g.satisfies) {
            this.needs[k] -= 10000 * g.satisfies[k];
        }
        //then remove the good
        this.inventory.splice(i, 1);
    }

    this.make = function (g) {
        if (!g) { console.log("ERROR: tried making false lol"); }
        this.doingAction = true;
        this.making.push(g);
        this.progress.push(new good("partially made " + g.name));
        console.log("started " + this.making.name());
    }

    this.pickInput = function (supply) {
        var mincost = 10000000;
        var bestbet = "nothing";
        for (var i = 0; i < goods.length; i++) {
            if (goods[i].supplies[supply] > 0) {
                //we found one! estimate its cost!
                var cost = this.estimateCost(goods[i]);

                if (cost < mincost) {
                    mincost = cost;
                    bestbet = goods[i];
                }
            }
        }
        console.log("person picked supply: " + bestbet.name + " it cost: " + mincost);
        return bestbet;
    }

    this.pickGood = function (need) {
        var mincost = 10000000;
        var bestbet = "nothing";
        for (var i = 0; i < goods.length; i++) {
            if (goods[i].satisfies[need] > 0) {
                //we found one! estimate its cost!
                var cost = this.estimateCost(goods[i]);
                cost = cost / goods[i].satisfies[need];
                if (cost < mincost) {
                    mincost = cost;
                    bestbet = goods[i];
                }
            }
        }
        console.log("person picked good: " + bestbet.name + " it cost: " + mincost);
        return bestbet;
    }
    this.pickBestLand = function (r) {
        var bestland = "nothing";
        var bestrate = 0;
        for (var i = 0; i < mapsize; i++) {
            for (var j = 0; j < mapsize; j++) {
                //check if we own it
                //console.log("checking tile " + i + "," + j);
                //console.log("ids: " + this.id + "," + map[i][j].ownerid);
                if (map[i][j].ownerid == this.id) {
                    if (map[i][j].resources[r] > bestrate) {
                        bestland = map[i][j];
                        bestrate = map[i][j].resources[r];
                    }
                }

                //or if we can at least use or rent it!
            }
        }
        return bestland;
    }
    this.estimateCost = function (g) {
        //for each supply in good estimate its cost to make / buy
        var cost = 0;
        for (var key in g.inputs) {
            if (g.inputs[key] > 0) {
                var s = this.pickInput(key);
                cost += this.estimateCost(s) * g.inputs[key];
            }
        }

        //for each resource in good estimate the time to make on your land
        for (var key in g.res) {
            var bestland = this.pickBestLand(key);
            console.log(bestland);
            cost += g.res[key] / bestland.resources[key];
        }

        //then compare this to the market cost of the item! big TODO!!
        return cost;
    }
}

var goods = [];
var g;
g = new good("corn");
g.satisfies[Needs.FOOD] = 1;
g.supplies[Supply.GRAIN] = 1;
g.res[Resource.SOIL] = 1;
goods.push(g);

g = new good("corn chips");
g.satisfies[Needs.FOOD] = 3;
g.inputs[Supply.GRAIN] = 2;
goods.push(g);


g = new good("cotton");
g.res[Resource.SOIL] = 1;
g.supplies[Supply.COTTON] = 1;
goods.push(g);

g = new good("pants");
g.satisfies[Needs.COMFORT] = 1;
g.inputs[Supply.COTTON] = 1;
goods.push(g);

g = new good("drinking water");
g.satisfies[Needs.WATER] = 1;
g.res[Resource.WATER] = 1;
goods.push(g);