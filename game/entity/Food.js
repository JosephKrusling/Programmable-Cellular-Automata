const Entity = require('./Entity');

function Food(x, y, radius)
{
    Entity.call(this, x, y, radius);
}

Food.prototype.getPosition = function(){
    return [this.x, this.y];
};



module.exports = Food;