// JavaScript source code

// DRAWING OBJECTS
var worldView;

//ANT OBJECTS
var teams;
var ants;
var hills;
var paths;

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

    // SETUP ANT OBJECTS
    teams = new Array();
    teams.push(new team("red", 100, 100));
    teams.push(new team("blue", 300, 300));

    // START UPDATING
    update(teams);
    setInterval("update(teams)", 1000 / 60);
}

function update(teams) {
    worldView.clear();
    for (var t = 0; t < teams.length; t++) {
        var ants = teams[t].ants;
        var hills = teams[t].hills;
        for (var i = 0; i < ants.length; i++) {
            ants[i].update();
            worldView.drawAnt(ants[i]);
        }
        for (var i = 0; i < hills.length; i++) {
            hills[i].update();
            worldView.drawHill(hills[i]);
        }
    }
}