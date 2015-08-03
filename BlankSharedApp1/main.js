// JavaScript source code

// DRAWING OBJECTS
var worldView;

//ANT OBJECTS
var teams;
var paths;

// RESOURCE OBJECTS
var resources;

// MAP CELL OBJECTS
var cellSize = 50;
var cell;

function keyinput(k) {
    console.log("key: " + k);
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

    // START UPDATING
    update(teams, resources);
    setInterval("update(teams, resources)", 1000 / 60);
}

function addToCell(e) {
    var x = Math.floor(e.x % cellSize);
    var y = Math.floor(e.y % cellSize);
    var s = x + "," + y;
    if (cell[s] == null) {
        cell[s] = [];
    }
    cell[s].push(e);
}

function update(teams, resources) {
    worldView.clear();
    cell = {};

    for (var r = 0; r < resources.length; r++) {
        addToCell(resources[r]);
        worldView.drawResource(resources[r]);
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
            //compare to all the ones greater than i
            for(var j = i + 1; j < c.length; j++){
                if (dist(c[i], c[j]) < 15) {
                    console.log(c[i].entity + " " + c[j].entity);
                    //ENEMY ANTS
                    if (c[i].entity == Entity.ANT && c[j].entity == Entity.ANT) {
                        console.log("ants near eachother");
                        if (c[i].color != c[j].color) {
                            console.log("enemy ants collided!");
                        }
                    }
                    // RESOURCE AND ANT
                    if (c[i].entity == Entity.ANT && c[j].entity == Entity.RESOURCE) {
                        console.log("ants near eachother");
                        if (c[i].color != c[j].color) {
                            console.log("enemy ants collided!");
                        }
                    }
                }
            }
        }
    }


}

function dist(e1, e2){
    var dx = e1.x - e2.x;
    var dy = e1.y - e2.y;
    return Math.sqrt(dx * dx + dy * dy);
}