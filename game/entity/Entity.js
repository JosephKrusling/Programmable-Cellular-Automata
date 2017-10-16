function Entity(uuid, x, y, radius) {
    this.uuid = uuid;
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.timeCreated = Date.now();
    console.log('hi im entity and im an alcoholic');
}

Entity.prototype.checkCollision = function(otherEntity) {
    let distanceSquared = (this.x - otherEntity.x)^2 + (this.y - otherEntity.y)^2;
    let radiusSumSquared = (this.radius + this.radius)^2;
    console.log("Entity is checking collision");
    return distanceSquared < radiusSumSquared;
};

module.exports = Entity;