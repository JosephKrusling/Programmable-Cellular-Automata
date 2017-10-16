function Entity(uuid, x, y, radius) {
    this.uuid = uuid;
    this.x = x;
    this.y = y;
    this.radius = radius;
    console.log('hi im entity and im an alcoholic');
}

Entity.prototype.checkCollision = function(otherEntity) {
    return true;
};

module.exports = Entity;