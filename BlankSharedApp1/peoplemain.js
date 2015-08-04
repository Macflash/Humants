// JavaScript source code

// Interval object
var setintervalid;

// DRAWING OBJECTS
var worldView;
var speed = 500

// MAP CELL OBJECTS
var map = [];
var mapsize = 1;
var cellSize = 50;

//people and market/economy objects
var people = [];
var market = [];


function keyinput(k) {
    if (k == 'q') {
        if (setintervalid) {
            clearInterval(setintervalid);
            setintervalid = 0;
        }
        else { setintervalid = setInterval("update()", speed); }
    }

    //console.log("key: " + k);
    if (k == 'z') {
        worldView.scale /= 1.1;
    }
    if (k == 'x') {
        worldView.scale *= 1.1;
    }

    if (k == 'w') {
        worldView.centerY -= 10 / worldView.scale;
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
    worldView = new worldView(1, 0, 0, canvas, context);

    var id = 0;
    for (var i = 0; i < mapsize; i++) {
        map[i] = [];
        for (var j = 0; j < mapsize; j++) {
            var p = new person(id);
            p.x = (i + .5) * cellSize;
            p.y = (j + .5) * cellSize;
            people[id] = p;
            id++;
            map[i][j] = new land(i, j, id);
        }
    }

    // START UPDATING
    update();
    setintervalid = setInterval("update()", speed);
}

function update() {
    //draw world
    worldView.clear();
    drawMap(map);
    drawPeople(people);

    //update world
    UpdatePeople(people);

}

function UpdatePeople(people) {
    for (var i = 0; i < people.length; i++) {
        people[i].updateNeeds(speed);
        people[i].action(speed);
    }
}

function drawPeople(people) {
    for (var i = 0; i < people.length; i++) {
        worldView.drawCircle(3, "tan", people[i].x, people[i].y);
    }
}

function drawMap(map) {
    for (var i = 0; i < mapsize; i++) {
        for (var j = 0; j < mapsize; j++) {
            var color = null;
            if (map[i][j].resources[Resource.WATER] > .5) { color = "lightblue"; }
            if (map[i][j].resources[Resource.SOIL] > .5) { color = "lightgreen"; }
            if (map[i][j].resources[Resource.TREES] > .5) { color = "green"; }
            if (map[i][j].resources[Resource.ROCK] > .5) { color = "lightgrey"; }
            if (map[i][j].resources[Resource.IRON] > .5) { color = "darkgrey"; }
            if (map[i][j].resources[Resource.OIL] > .5) { color = "black"; }
            if (map[i][j].resources[Resource.GOLD] > .5) { color = "yellow"; }
            worldView.drawRect(map[i][j].x * cellSize, map[i][j].y * cellSize, cellSize, cellSize, color);
        }
    }
}