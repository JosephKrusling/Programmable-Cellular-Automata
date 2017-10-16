function Entity(uuid, x, y, radius) {
    this.uuid = uuid;
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.timeCreated = Date.now();
    console.log('hi im entity and im an alcoholic');
}

// returns true if a collision has been detected, otherwise false
Entity.prototype.checkCollision = function(entity, otherEntity) {
    let distanceSquared = Math.abs((entity.x - otherEntity.x)^2 + (entity.y - otherEntity.y)^2);
    let radiusSumSquared = (entity.radius + otherEntity.radius)^2;
    //console.log("Entity is checking collision");
    return distanceSquared < radiusSumSquared;
};

module.exports = Entity;