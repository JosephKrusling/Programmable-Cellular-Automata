const Entity = require('./Entity');

function Bullet(uuid, x, y, radius)
{
    Entity.apply(arguments);
}

module.exports = Bullet;