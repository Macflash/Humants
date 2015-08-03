// JavaScript source code
var ResourceType= { FOOD: "food", WATER: "water", MINERALS: "minerals" };

function resource(type, x, y, amount) {
    this.type = type;
    this.x = x;
    this.y = y;
    this.amount = amount;
}