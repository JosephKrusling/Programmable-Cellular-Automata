function Entity(x, y, radius, direction=0, xVelocity=0, yVelocity=0) {
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.direction = direction;
    this.xVelocity = xVelocity;
    this.yVelocity = yVelocity;
    this.timeCreated = Date.now();
}


Entity.prototype.getAge = function() {
    return Date.now() - this.timeCreated;
};

Entity.prototype.checkCollision = function(otherEntity) {
    let distanceSquared = this.distance2(otherEntity);
    let radiusSumSquared = (this.radius + otherEntity.radius)^2;

    return distanceSquared < radiusSumSquared;
};

Entity.prototype.distance2 = function(otherEntity) {
    return Math.abs((this.x - otherEntity.x) ^ 2 + (this.y - otherEntity.y) ^ 2);
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