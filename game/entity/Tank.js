const Entity = require('./Entity');

function Tank(x, y, radius) {
    Entity.call(this, x, y, radius);
}

Tank.prototype = Object.create(Entity.prototype);

// returns the health value of this tank
Tank.prototype.getHealth = function (){
    return this.health;
};

// this tank gets hit and reduces health by 1
Tank.prototype.getRekt = function (){
    --this.health;
};

// returns this tank's position as a list. e.g. {x, y}
Tank.prototype.getPosition = function(){
    return [this.x, this.y];
};

module.exports = Tank;