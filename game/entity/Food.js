
function Food(x, y)
{
    this.x = x;
    this.y = y;
    this.size = 1;
}

Food.prototype.getPosition = function(){
    return [this.x, this.y];
};



module.exports = Food;