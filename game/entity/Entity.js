function Entity(x, y, radius, facing=0, xVelocity=0, yVelocity=0, angularVelocity=0) {
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.facing = facing;
    this.xVelocity = xVelocity;
    this.yVelocity = yVelocity;
    this.angularVelocity = angularVelocity;
    this.timeCreated = Date.now();
}


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

Entity.prototype.nudge = function(chance, maxAngularVelocityChange) {
    this.angularVelocity += Math.random() * maxAngularVelocityChange * 2 - maxAngularVelocityChange;
};

Entity.prototype.enforceBounds = function(minX, minY, maxX, maxY) {
    if (this.x < minX) {
        this.x = minX;
        this.xVelocity *= -1;
    }
    if (this.y < minY) {
        this.y = minY;
        this.yVelocity *= -1;
    }
    if (this.x > maxX) {
        this.x = maxX;
        this.xVelocity *= -1;
    }
    if (this.y > maxY) {
        this.y = maxY;
        this.yVelocity *= -1;
    }
};

module.exports = Entity;