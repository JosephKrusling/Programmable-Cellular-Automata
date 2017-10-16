const Entity = require('./entity');
const Quadtree = require('./util/Quadtree');

let lastTankIndex = 0;

function GameWorld() {
    this.tanks = [];
    this.bullets = [];
    this.food = [];
    this.dimensions = {
        width: 1000,
        height: 10000
    };
    this.food = [];
    for (let i = 0; i < 100; i++)
    {
        this.food.push(this.createRandomFood());
    }

    for (let i = 0; i < 5; i++)
    {
        this.createTank(); // createTank function pushes to the tank list automatically
    }
}

// TODO: THIS IS FUCKING AWFUL O(n^2) AND WILL DESTROY OUR LIVES
// USE QUADTREE FOR FUCKS SAKE YOU MANIAC
GameWorld.prototype.update = function () {
    if (this.tanks === undefined || this.bullets === undefined)
        return;
    for (let tankIndex = 0; tankIndex < this.tanks.length; tankIndex++) {
        for (let bulletIndex = 0; bulletIndex < this.bullets.length; bulletIndex++) {
            let tank = this.tanks[tankIndex];
            let bullet = this.bullets[bulletIndex];
            let result = tank.checkCollision(bullet);
            if(result === true) {
                console.log("Collided!");
            }
        }
    }
};

GameWorld.prototype.createTank = function() {
    // let spawnPoint = this.getGoodSpawnPoint();
    // let newTank = new Entity.Tank(
    //     uuid: getNextTankIndex(),
    //     spawnPoint.x,
    //     spawnPoint.y
    // );
    let spawn = this.getGoodSpawnPoint();
    let tank = new Entity.Tank();
    tank.uuid = getNextTankIndex();
    tank.x= spawn.x;
    tank.y = spawn.y;
    tank.radius = 10;
    // this.tanks.push(newTank);
    this.tanks.push(tank);
    return tank;
};

GameWorld.prototype.spawnBullet = function(owner, direction) {
    let bullet = new Entity.Bullet();
    bullet.x = owner.x;
    bullet.y = owner.y;
    bullet.radius = 2;
    bullet.direction = direction;
    bullet.creationTime = Date.now();
    this.bullets.push(bullet);
    console.log('bullet spawned')
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