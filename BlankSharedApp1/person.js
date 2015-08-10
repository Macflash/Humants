// JavaScript source code
var Needs = { FOOD: 0, WATER: 1, COMFORT: 2, SLEEP: 3, CLOTHING: 4, ENTERTAINMENT: 5 };
var Quality = {POOR: .5, NORMAL: 1, GOOD: 1.2, EXCELLENT: 1.3};
var Resource = { SOIL: 0, TREES: 1, IRON: 2, GOLD: 3, OIL: 4, ROCK: 5, WATER: 6, HOUSING: 7 };
var Supply = { COTTON: 0, LUMBER: 1, GRAIN: 2, CORN: 3 };

//using land will deplete the resource

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
    this.resources[Resource.HOUSING] = .1;
}

// A good that satisfies certain needs
function good(name) {
    this.name = name;
    this.satisfies = []; //needs this satisfies
    this.res = []; // resources this requires
    this.supplies = []; //inputs this supplies
    this.inputs = []; //inputs this requires
    this.difficulty = 1;
    this.costs = [];
    this.batch = 1; // how many are made at a time
    this.tradeable = true;
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
    this.costs = function(){
        return this.list[this.list.length-1].costs;
    }
    this.peek = function(){ return this.list[this.list.length-1]; }
}

// A person who acts to satisfy their needs
function person(id) {
    this.id = id;
    this.x = 0;
    this.y = 0;
    this.inventory = [];
    this.walkspeed = 5;
    this.money = 0;
    this.workList = [];

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
    this.needs[Needs.SLEEP] = 0;
    this.needs[Needs.CLOTHING] = 0;

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

    this.buyGoodFromPerson = function (g, p){
        //check if they have the item in their inventory
        var index = p.inventory.indexOf(g);
        if (index >= 0){
            console.log("they have the item!");
            this.inventory.push(p.inventory.splice(index,1)[0]);
            this.making.pop();
            this.progress.pop();
            this.doingAction = false;

            var price = (g.costs[this.id] + g.costs[p.id]) / 2;
            this.money -= price;
            p.money += price;
            console.log("bought " + g.name + " for $" + price);
            //for now cost can be avg of your cost and theirs

        }
        else {
            //see if they are planning on making that good
            this.requestWork(g, p);

        }
    }
    //workList is either a thing indexed by name or maybe better with the actual good number
    this.requestWork = function (g, p) {
        if (p.workList.indexOf(g) < 0) {
            console.log("person " + this.id + " requested " + g.name + " from " + p.id);
            p.workList.push(g);
            console.log(p.workList);
        }
    }

    this.continueAction = function (t) {
        //check if you should buy the item you are working on (our price should be updated since we decided to do this)
        var g = this.making.peek();
        var c = this.lowestMarketPrice(g);
        var x = this.lowestMarketTime(g);
        //buy it if the lowest market time is less than what it would take us to do
        if (x.time < g.costs[this.id]) {
            if (this.moveTowardPerson(people[x.id])) {
                //we are there!
                //buy the item if they have it in their inventory!
                this.buyGoodFromPerson(this.making.peek(), people[x.id]);
                //otherwise wait i guess... its not a big deal because its still faster thats the whole point.
            }
            else {
                this.requestWork(g, people[x.id]);
                // we are still moving
                // so maybe just chill?
            }
        }
        else {
        //do that action yo!
        //go through all the inputs and make them, or work on the land to get the resource
        var done = true;

        //go through all the supply goods and make or get them
        for (var s in this.making.inputs()) {
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
                if (this.progress.res()[r] < this.making.res()[r]) {
                    //TODO: need to evaluate timing and savings for each land tile better than this one
                    // best tile might not have highest stats, it might instead be a bit better and way closer
                    var tile = this.getCurrentMapTile();
                    var bestTile = this.getBestLand(this.making.peek());

                    if (bestTile == "nothing") {
                        //we can't make this!
                        // we might need to try to improve the land!
                        console.log("we cant make that i guess! woops");
                    }
                    else if ((this.x != (bestTile.x + .5) * cellSize) || (this.y != (bestTile.y + .5) * cellSize)) {
                        //check if we should move to that tile
                        //ie the time we'd save is larger than the time it would take to get there
                        //var transit = this.estimateTravelTime(bestTile);
                        //var savings = this.estimateWorkTime(bestTile, r) - this.estimateWorkTime(tile, r);
                        //if (savings >= transit) {
                        this.moveTowardTile(bestTile);
                        //}
                    }
                    else {
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
            var temp = this.making.pop();
            for (var i = 0; i < temp.batch; i++) {
                this.inventory.push(temp);
            }
            this.progress.pop();
            if (this.making.isEmpty()) {
                this.doingAction = false;
            }
        }
    }
    }
    this.estimateWorkTime = function (tile, r) {
        return tile.resources[r] * t / 1000;
    }
    this.estimateTravelTime = function (dest) {
        var destx;
        var desty;
        if (dest.id != null) {
            // then this is a person
            destx = dest.x;
            desty = dest.y;
        }
        else {
            //it is probably a land tile
            destx = (dest.x + .5) * cellSize;
            desty = (dest.y + .5) * cellSize;
        }
        var dx = destx - this.x;
        var dy = desty - this.y;
        var d = Math.sqrt(dy * dy + dx * dx);
        return d / this.walkspeed;
    }
    this.moveTowardTile = function (dest) {
        //console.log("moving to tile!");
        //var curTile = this.getCurrentMapTile();
        var dx = (dest.x + .5) * cellSize - this.x;
        var dy = (dest.y + .5) * cellSize - this.y;
        var d = Math.sqrt(dy * dy + dx * dx);
        if (d < this.walkspeed) {
            this.x = (dest.x + .5) * cellSize;
            this.y = (dest.y + .5) * cellSize;
        }
        else {
            this.x += dx / d;
            this.y += dy / d;
        }
    }
    this.moveTowardPerson = function (p) {
        //console.log("moving to person!");
        //var curTile = this.getCurrentMapTile();
        var dx = p.x - this.x;
        var dy = p.y - this.y;
        var d = Math.sqrt(dy * dy + dx * dx);
        if (d < this.walkspeed) {
            this.x = p.x;
            this.y = p.y;
            return true;
        }
        else {
            this.x += dx / d;
            this.y += dy / d;
            return false;
        }
    }
    this.getCurrentMapTile = function () {
        var xx = Math.floor(this.x / cellSize);
        var yy = Math.floor(this.y / cellSize);
        //console.log("current map tile call (x/y): " + this.x + "," + this.y);
        return map[xx][yy];
    }

    this.pickAndStartAction = function(t){
        //find the most pressing need
        var need = this.highestNeed();

        //check worklist to see if cost of satisfying highest need is less than the next worklist item.
        // ie time profit earned by doing the work is greater than the need cost

        if (need < 0) {
            //check worklist.
            //console.log("no needs checking worklist");
            if (this.workList.length > 0) {
                console.log("doing a worklist item!")
                this.make(this.workList.pop());
            }
            else {
               // console.log("no needs huh");
            }

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
        //console.log(this.needs);
        for (var k in this.needs) {
            if (this.needs[k] > max) {
                max = this.needs[k];
                n = k;
            }
        }
        return n;
    }

    this.checkInventory = function (need) {
        //console.log(this.inventory);
        var pick = -1;
        for (var i = 0; i < this.inventory.length; i++) {
            //console.log(this.inventory);
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
        //console.log("used " + this.inventory[i].name);
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
        //console.log("started " + this.making.name());
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
        //console.log("person picked supply: " + bestbet.name + " it cost: " + mincost);
        return bestbet;
    }

    this.pickGood = function (need) {
        var mincost = 999999999;
        var bestbet = "nothing";
        for (var i = 0; i < goods.length; i++) {
            if (goods[i].satisfies[need] > 0) {
                //we found one! estimate its cost!
                var cost = this.estimateCost(goods[i]);
                var marketcost = this.lowestMarketPrice(goods[i]);
                cost = Math.min(cost, marketcost) / (goods[i].satisfies[need] * goods[i].batch);
                if (cost < mincost) {
                    mincost = cost;
                    bestbet = goods[i];
                }
            }
        }
        //console.log("person picked good: " + bestbet.name + " it cost: " + mincost);
        return bestbet;
    }
    this.getBestLand = function (g) {
        var bestland = "nothing";
        var besttime = 99999999;
        for (var i = 0; i < mapsize; i++) {
            for (var j = 0; j < mapsize; j++) {
                //check if we own it
                if (map[i][j].ownerid == this.id) {
                    var sum = 0;
                    for (var k in map[i][j].resources) {
                        if (map[i][j].resources[k] > 0) {
                            if (g.res[k] >= 0) {
                                sum += g.res[k] / map[i][j].resources[k];
                                //console.log("good res: " + g.res[k]);
                                //console.log("land res: " + map[i][j].resources[k]);
                                //console.log("sum: " + sum);
                            }
                        }
                    }
                    if (sum < besttime) {
                        bestland = map[i][j];
                        besttime = sum;
                    }
                }
                //this is where you'd rent land i guess?
            }
        }
        return bestland;
    }
    this.pickBestLand = function (r) {
        var bestland = "nothing";
        var bestrate = 0;
        for (var i = 0; i < mapsize; i++) {
            for (var j = 0; j < mapsize; j++) {
                //check if we own it
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
                var mycost = this.estimateCost(s);
                var marketcost = this.lowestMarketPrice(s);
                cost += Math.min(mycost, marketcost) * g.inputs[key];
            }
        }

        //for each resource in good estimate the time to make on your land
        for (var key in g.res) {
            var bestland = this.pickBestLand(key);
            cost += g.res[key] / bestland.resources[key];
            cost += this.estimateTravelTime(bestland); //TRAVEL TIME THING WHOA DUDE
        }

        //then compare this to the market cost of the item! big TODO!!
        g.costs[this.id] = cost;

        return cost;
    }
    this.lowestMarketPrice = function (g) {
        if (!g.tradeable) { return 999999999; }
        //console.log(g);
        var lowest = null;
        var first = true;
        for (var id in g.costs) {
            if (first) {
                lowest = g.costs[id];
                first = false;
            }
            else if (g.costs[id] < lowest) {
                lowest = g.costs[id];
            }
        }
        return lowest;
    }
    this.lowestMarketTime = function (g) {
        if (!g.tradeable) { return 999999; }
        var lowest = null;
        var bestid = null;
        var first = true;
        for (var id in g.costs) {
            if (first) {
                lowest = g.costs[id] + this.estimateTravelTime(people[id]);
                bestid = id;
                first = false;
            }
            else if (g.costs[id] + this.estimateTravelTime(people[id]) < lowest) {
                lowest = g.costs[id];
                bestid = id;
            }
        }
        return { "time": lowest, "id": bestid };
    }
}

var goods = [];
var g;
g = new good("corn");
g.satisfies[Needs.FOOD] = 1;
g.supplies[Supply.CORN] = 1;
g.res[Resource.SOIL] = 5;
g.res[Resource.WATER] = 2;
g.batch = 6;
goods.push(g);

g = new good("wheat");
g.satisfies[Needs.FOOD] = 1;
g.supplies[Supply.GRAIN] = 1;
g.res[Resource.SOIL] = 2;
g.res[Resource.WATER] = 3;
g.batch = 4;
goods.push(g);

g = new good("bread");
g.satisfies[Needs.FOOD] = 1;
g.inputs[Supply.GRAIN] = 2;
g.batch = 2;
goods.push(g);

g = new good("corn chips");
g.satisfies[Needs.FOOD] = 1;
g.inputs[Supply.CORN] = 2;
g.batch = 3;
goods.push(g);


g = new good("cotton");
g.res[Resource.SOIL] = 3;
g.supplies[Supply.COTTON] = 1;
g.batch = 3;
goods.push(g);

g = new good("pants");
g.satisfies[Needs.COMFORT] = .5;
g.satisfies[Needs.CLOTHING] = 1;
g.inputs[Supply.COTTON] = 1;
goods.push(g);

g = new good("6 pack of drinking water");
g.satisfies[Needs.WATER] = 1;
g.res[Resource.WATER] = 3;
g.batch = 6;
goods.push(g);

g = new good("drink water");
g.satisfies[Needs.WATER] = .5;
g.res[Resource.WATER] = .5;
g.tradeable = false;
goods.push(g);

g = new good("sleep");
g.satisfies[Needs.SLEEP] = 2;
g.satisfies[Needs.COMFORT] = 1;
g.res[Resource.HOUSING] = 1;
g.tradeable = false;
goods.push(g);

g = new good("logs");
g.res[Resource.TREES] = 1;
g.supplies[Supply.LUMBER] = 1;
g.batch = 3;
goods.push(g);



console.log(goods);