const Entity = require('./Entity');

function Bullet(x, y, radius, direction, owner)
{
    Entity.call(this, x, y, radius);
    this.direction = direction;
    this.owner = owner;
}

Bullet.prototype = Object.create(Entity.prototype);

module.exports = Bullet;