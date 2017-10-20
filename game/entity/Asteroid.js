const Entity = require('./Entity');

function Asteroid(x, y, radius, facing)
{
    Entity.call(this, x, y, radius, facing);
}

Asteroid.prototype = Object.create(Entity.prototype);

module.exports = Asteroid;