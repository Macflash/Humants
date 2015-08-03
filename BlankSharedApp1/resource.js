// JavaScript source code
function resource(type, x, y, amount) {
    this.entity = Entity.RESOURCE;
    this.type = type;
    this.x = x;
    this.y = y;
    this.amount = amount;
}

function SpawnResources(resources, type, num){
    for(var i = 0; i < num; i++){
        resources.push(new resource(type, Math.random() * 2500 - 1200, Math.random() * 2500 - 1200, Math.random() * 14 + 1));
    }
}