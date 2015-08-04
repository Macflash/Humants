// JavaScript source code

// Interval object
var setintervalid;

// DRAWING OBJECTS
var worldView;

//ANT OBJECTS
var teams;
var paths;

// RESOURCE OBJECTS
var resources;

// MAP CELL OBJECTS
var cellSize = 73;
var cell;

function keyinput(k) {
    if (k == 'q') {
        if (setintervalid) {
            clearInterval(setintervalid);
            setintervalid = 0;
            console.log(teams);
        }
        else { setintervalid = setInterval("update(teams, resources, paths)", 1000 / 60); }
    }

    //console.log("key: " + k);
    if (k == 'z') {
        worldView.scale /= 1.1;
    }
    if (k == 'x') {
        worldView.scale *= 1.1;
    }

    if (k == 'w') {
        worldView.centerY -= 10/ worldView.scale;
    }

    if (k == 's') {
        worldView.centerY += 10 / worldView.scale;
    }

    if (k == 'a') {
        worldView.centerX -= 10 / worldView.scale;
    }

    if (k == 'd') {
        worldView.centerX += 10 / worldView.scale;
    }
}

function init() {
    // SETUP DRAWING OBJECTS
    var canvas = document.getElementById("maincanvas");
    canvas.onkeypress = function (evt) { keyinput(String.fromCharCode(evt.which)); };
    var context = canvas.getContext("2d");
    worldView = new worldView(1, 250, 250, canvas, context);

    // SETUP UP MAP OBJECTS
    resources = new Array();
    SpawnResources(resources, ResourceType.FOOD, 100);
    //console.log(resources.length);

    // SETUP ANT OBJECTS
    teams = new Array();
    teams.push(new team("red", 100, 100));
    teams.push(new team("blue", 300, 300));

    // SETUP MAP CELLS FOR LIMITING COLLISION CALLS
    paths = new Array();

    // START UPDATING
    update(teams, resources, paths);
    setintervalid = setInterval("update(teams, resources, paths)", 1000 / 60);
}

function addToCell(e) {
    var x = Math.floor(e.x / cellSize);
    var y = Math.floor(e.y / cellSize);
    var s = x + "," + y;
    //console.log(s);
    if (cell[s] == null) {
        cell[s] = [];
    }
    cell[s].push(e);
}

function update(teams, resources, paths) {
    worldView.clear();
    cell = {};

    for (var r = 0; r < resources.length; r++) {
        if (resources[r].amount <= 0) {
            var first = resources.slice(0, r);
            if (r == resources.length - 1) { resources = first; }
            else {
                var second = resources.slice(r + 1, resources.length);
                resources = first.concat(second);
            }
        }
        addToCell(resources[r]);
        worldView.drawResource(resources[r]);
    }

    for (var r = 0; r < paths.length; r++) {
        paths[r].update();
        if (paths[r].strength < 1) {
            var first = paths.slice(0, r);
            if (r == paths.length - 1) { paths = first; }
            else {
                var second = paths.slice(r + 1, paths.length);
                paths = first.concat(second);
            }
        }
        else {
            addToCell(paths[r]);
            worldView.drawPath(paths[r]);
        }
    }


    for (var t = 0; t < teams.length; t++) {
        var ants = teams[t].ants;
        var hills = teams[t].hills;
        for (var i = 0; i < ants.length; i++) {
            ants[i].update();
            addToCell(ants[i]);
            worldView.drawAnt(ants[i]);
        }
        for (var i = 0; i < hills.length; i++) {
            hills[i].update();
            addToCell(hills[i]);
            worldView.drawHill(hills[i]);
        }
    }

    // NEED TO CHECK FOR COLLISIONS BETWEEN ANTS AND RESOURCES / OTHER ANTS
    for (var key in cell) {
        var c = cell[key];
        for (var i = 0; i < c.length - 1; i++) {
            //console.log(c.length);
            //compare to all the ones greater than i
            for (var j = i + 1; j < c.length; j++) {
                
                //determine the entity types
                var ant = null;
                var enemyAnt = null;
                var resource = null;
                var hill = null; // not used right now!

                if (c[i].entity == Entity.ANT) {
                    ant = c[i];
                    if (c[j].entity == Entity.ANT) {
                        enemyAnt = c[j];
                    }
                    if (c[j].entity == Entity.RESOURCE) {
                        resource = c[j];
                    }
                    if (c[j].entity == Entity.HILL) {
                        hill = c[j];
                    }
                }
                else if (c[j].entity == Entity.ANT) {
                    ant = c[j];
                    if (c[i].entity == Entity.RESOURCE) {
                        resource = c[i];
                    }
                    if (c[i].entity == Entity.HILL) {
                        hill = c[i];
                    }
                }

                //get distance
                if (ant == null) { continue; }
                if (resource != null) {
                    // ant resource
                    var d = dist(ant, resource) - resource.amount;
                    if (d <= ant.touchRange) {
                        // ant hit resource
                        ant.touched(resource);
                    }
                    if (d <= ant.senseRange) {
                        ant.sensed(resource);
                    }
                }
                if (enemyAnt != null) {
                    // ant to ant
                }
                if (hill != null) {
                    if (ant.carrying != null) {
                        var d = dist(ant, hill) - 18;
                        if (d <= ant.touchRange) {
                            if (ant.carrying.type == ResourceType.FOOD && ant.color == hill.color) {
                                console.log("DROPPED OFF FOOD!");
                                hill.food += ant.carrying.amount;
                            }
                            ant.carrying = null;
                            ant.target = null;
                            ant.lastnode = new path(ant.color, ant.x, ant.y, null, null, null);
                        }
                    }
                }
            }
        }
    }


}