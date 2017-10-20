const Rectangle = require('./Rectangle');

function Entity(x, y, radius, facing=0, xVelocity=0, yVelocity=0) {
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.facing = facing;
    this.xVelocity = xVelocity;
    this.yVelocity = yVelocity;
    this.timeCreated = Date.now();
}

Entity.prototype.getRange = function() {

    return new Rectangle(this.x, this.y, this.radius, this.radius);
};

Entity.prototype.getAge = function() {
    return Date.now() - this.timeCreated;
};

Entity.prototype.checkCollision = function(otherEntity) {
    let distanceSquared = this.distance2(otherEntity);
    let radiusSumSquared = Math.pow(this.radius + otherEntity.radius, 2);

    return distanceSquared < radiusSumSquared;
};

Entity.prototype.distance2 = function(otherEntity) {
    return Math.pow(this.x - otherEntity.x, 2) + Math.pow(this.y - otherEntity.y, 2);
};

// Applies a random acceleration
Entity.prototype.drift = function(chance, maxVelocityChange) {
    if (Math.random() > chance)
        return;
    let drift = Math.random() * maxVelocityChange;
    let direction = Math.random() * 2 * Math.PI;
    this.xVelocity += drift * Math.cos(direction);
    this.yVelocity += drift * Math.sin(direction);
};

Entity.prototype.enforceBounds = function(minX, minY, maxX, maxY) {
    this.x = Math.max(this.x, minX);
    this.x = Math.min(this.x, maxX);
    this.y = Math.max(this.y, minY);
    this.y = Math.min(this.y, maxY);
};

module.exports = Entity;