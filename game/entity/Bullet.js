
function Bullet(x, y) {

    this.x = x;
    this.y = y;
    this.size = 1;
}

Buttet.prototype.getPosition = function(){
    return [this.x, this.y];
}

module.exports = Bullet;