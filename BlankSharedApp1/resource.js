// JavaScript source code
var ResourceType = { FOOD: {value: 0, name: "food"}, WATER: {value: 1, name: "water"}, MINERALS: {value: 2, name: "minerals"} };

function resource(type, x, y, amount) {
    this.type = type;
    this.x = x;
    this.y = y;
    this.amount = amount;
}

function SpawnResources(resources, type, num){
    for(var i = 0; i < num; i++){
        resources.push(new resource(type, Math.random()*500, Math.random() * 500, Math.random * 14 + 1));
    }
}