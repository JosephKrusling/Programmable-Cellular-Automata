const Entity = require('./Entity');

function Tank(x, y, radius, facing, attackCooldown=2000) {
    Entity.call(this, x, y, radius);
    this.facing = facing;
    this.isShooting = false;
    this.lastAttack = 0;
    this.attackCooldown = attackCooldown;
    this.points = 0;
}

Tank.prototype = Object.create(Entity.prototype);

// returns the points value of this tank
Tank.prototype.getPoints = function () {
    return this.points;
};

Tank.prototype.mayShoot = function() {
  return Date.now() - this.lastAttack > this.attackCooldown;
};

Tank.prototype.startAttackCooldown = function() {
    this.lastAttack = Date.now();
};

// returns the health value of this tank
// Tank.prototype.getHealth = function (){
//     return this.health;
// };

Tank.prototype.incrementPoints = function(){
    this.points++;
};

// this tank gets hit and reduces health by 1
Tank.prototype.getRekt = function (){
    // send tank to a new random location
    this.x = Math.random() * 1000; // TODO I hardcoded this because I'm too stupid to figure out how to access with width and height of the canvas, and no, window.canvas.width crashes everything [said tanner on Wed, Oct 18, 2017 at T19:37:35 -5:00]
    this.y = Math.random() * 1000;
    // reset points
    this.points = 0;
};

// returns this tank's position as a list. e.g. {x, y}
Tank.prototype.getPosition = function(){
    return [this.x, this.y];
};

module.exports = Tank;