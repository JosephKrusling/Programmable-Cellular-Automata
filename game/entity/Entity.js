function Entity(x, y, radius) {
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.timeCreated = Date.now();
}

Entity.prototype.getAge = function() {
    return Date.now() - this.timeCreated;
};

Entity.prototype.checkCollision = function(otherEntity) {
    let distanceSquared = Math.abs((this.x - otherEntity.x)^2 + (this.y - otherEntity.y)^2);
    let radiusSumSquared = (this.radius + otherEntity.radius)^2;

    return distanceSquared < radiusSumSquared;
};

module.exports = Entity;