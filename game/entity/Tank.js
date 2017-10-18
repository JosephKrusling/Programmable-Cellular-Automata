const Entity = require('./Entity');

function Tank(x, y, radius, direction, attackCooldown=5) {
    Entity.call(this, x, y, radius);
    this.direction = direction;
    this.points = 0;
}

Tank.prototype = Object.create(Entity.prototype);

// returns the points value of this tank
Tank.prototype.getPoints = function (){
    return this.points;
};

Tank.prototype.incrementPoints = function(){
    this.points++;
}

// this tank gets hit and reduces health by 1
Tank.prototype.getRekt = function (){
    --this.health;
};

// returns this tank's position as a list. e.g. {x, y}
Tank.prototype.getPosition = function(){
    return [this.x, this.y];
};

module.exports = Tank;