const Entity = require('./Entity');

function Asteroid(x, y, radius, facing, speed, owner)
{
    Entity.call(this, x, y, radius, facing);
    this.facing = facing;
    this.speed = speed;
    this.owner = owner;
}

Asteroid.prototype = Object.create(Entity.prototype);

module.exports = Asteroid;