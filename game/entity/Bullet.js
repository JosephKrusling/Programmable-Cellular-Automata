const Entity = require('./Entity');

function Bullet(x, y, radius, facing, speed, owner)
{
    Entity.call(this, x, y, radius);
    this.facing = facing;
    this.speed = speed;
    this.owner = owner;
}

Bullet.prototype = Object.create(Entity.prototype);

module.exports = Bullet;