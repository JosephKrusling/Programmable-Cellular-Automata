function Entity(uuid, x, y, radius) {
    this.uuid = uuid;
    this.x = x;
    this.y = y;
    this.radius = radius;
    console.log('hi im entity and im an alcoholic');
}

Entity.prototype.checkCollision = function(otherEntity) {
    let distanceSquared = (x - otherEntity.x)^2 + (y - otherEntity.y)^2;
    let radiusSumSquared = (radius + this.radius)^2;

    return distanceSquared < radiusSumSquared;
};

module.exports = Entity;