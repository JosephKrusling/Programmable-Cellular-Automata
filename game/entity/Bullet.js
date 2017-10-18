const Entity = require('./Entity');

function Bullet(x, y, radius, direction, speed, owner)
{
    Entity.call(this, x, y, radius);
    this.direction = direction;
    this.speed = speed;
    this.owner = owner;
}

Bullet.prototype = Object.create(Entity.prototype);

module.exports = Bullet;