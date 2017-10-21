const Entity = require('./Entity');

function Tank(x, y, radius, facing, attackCooldown=1000) {
    Entity.call(this, x, y, radius);
    this.facing = facing;
    this.isShooting = false;
    this.lastAttack = 0;
    this.attackCooldown = attackCooldown;
    this.points = 0;
    this.name = "Unnamed";

    
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
    // reset points
    this.points = 0;
};

// returns this tank's position as a list. e.g. {x, y}
Tank.prototype.getPosition = function(){
    return [this.x, this.y];
};

module.exports = Tank;