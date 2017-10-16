// a tank is equivalent to a player

// An instance of a player
function Tank(id, x, y) {
    this.id = id;
    this.x = x;
    this.y = y;
    this.size = 5; // maybe configurable in the future? will tanks grow like agario thingies?
    this.health = 10; // setting default health to 10 arbitrarily [said tanner on Mon, Oct 16, 2017 at T15:52:16 -5:00]
}

// returns the health value of this tank
Tank.prototype.getHealth = function (){
    return this.health;
};

// this tank gets hit and reduces health by 1
Tank.prototype.getRekt = function (){
    --this.health;
};

// returns this tank's position as a list. e.g. {x, y}
Tank.prototype.getPosition = function(){
    return [this.x, this.y];
};

module.exports = Tank;