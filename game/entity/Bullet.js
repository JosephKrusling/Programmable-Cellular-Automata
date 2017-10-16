const Entity = require('./Entity');

function Bullet(uuid, x, y, radius)
{
    Entity.apply(arguments);
}

Buttet.prototype.getPosition = function(){
    return [this.x, this.y];
}

module.exports = Bullet;