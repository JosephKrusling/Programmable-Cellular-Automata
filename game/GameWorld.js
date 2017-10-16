const Entity = require('./entity');
let lastTankIndex = 0;

function GameWorld() {
    this.tanks = [];
    this.bullets = [];
    this.dimensions = {
        width: 1000,
        height: 10000
    }
    this.food = [];
    for (let i = 0; i < 100; i++)
    {
        this.food.push(this.createRandomFood());
    }
}

GameWorld.prototype.createTank = function() {
    let spawnPoint = this.getGoodSpawnPoint();
    this.tanks.push(new Entity.Tank(
        getNextTankIndex(),
        spawnPoint.x,
        spawnPoint.y
    ));
};

GameWorld.prototype.getWorldSurrounding = function(player) {
    return {
        tanks: this.tanks,
        bullets: this.bullets
    }
};

function getNextTankIndex() {
    lastTankIndex++;
    return lastTankIndex;
}

GameWorld.prototype.getGoodSpawnPoint = function() {
    return {
        x: Math.random() * this.dimensions.width,
        y: Math.random() * this.dimensions.height
    };
};

// get a new food object with random coordinates
GameWorld.prototype.createRandomFood = function()
{
  return new Entity.Food(Math.random(), Math.random());
};

module.exports = GameWorld;