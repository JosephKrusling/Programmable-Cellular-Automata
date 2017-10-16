function Tank(id, x, y) {
    this.id = id;
    this.x = x;
    this.y = y;
    this.health = 10; // setting default health to 10 arbitrarily [said tanner on Mon, Oct 16, 2017 at T15:52:16 -5:00]
}

Tank.prototype.getHealth = function (){
    return this.health;
};

// this tank gets hit and reduces health by 1
Tank.prototype.getRekt = function (){
    --this.health;
}



module.exports = Tank;