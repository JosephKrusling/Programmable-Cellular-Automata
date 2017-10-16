const Entity = require('./Entity');

function Food(uuid, x, y, radius)
{
    Entity.apply(arguments);
}

Food.prototype.getPosition = function(){
    return [this.x, this.y];
};



module.exports = Food;