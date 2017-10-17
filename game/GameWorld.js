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
    this.lastUpdate = Date.now();
    for (let i = 0; i < 100; i++)
    {
        this.food.push(this.createRandomFood());
    }
}

GameWorld.prototype.update = function () {
    if (this.tanks === undefined || this.bullets === undefined)
        return;

    // Process player moves
    let playersThatMoved = 0;
    for (let tankIndex = 0; tankIndex < this.tanks.length; tankIndex++) {
        let tank = this.tanks[tankIndex];
        let desiredMove = tank.desiredMove;
        if (desiredMove) {
            playersThatMoved++;

            switch (desiredMove.command) {
                case 'move':
                    break;

                case 'shoot':
                    this.spawnBullet(tank, desiredMove.direction);
                    break;
            }

            // console.log(desiredMove);

            tank.desiredMove = null;
        }
    }

    // Check for collision between tanks and bullets. VERY INEFFICIENT.
    // TODO: O(n^2)
    let collisions = 0;
    for (let tankIndex = 0; tankIndex < this.tanks.length; tankIndex++) {
        for (let bulletIndex = 0; bulletIndex < this.bullets.length; bulletIndex++) {
            let tank = this.tanks[tankIndex];
            let bullet = this.bullets[bulletIndex];
            if (bullet.owner === tank) {
                continue;
            }
            if(tank.checkCollision(bullet)) {
                // hit
            }
            collisions++;

        }
    }

    // Clear bullets which have expired.
    for (let bulletIndex = 0; bulletIndex < this.bullets.length; bulletIndex++) {
        if (this.bullets[bulletIndex].getAge() > 1000) {
            this.bullets.splice(bulletIndex, 1);
        }
    }

    let updatePeriod = Date.now() - this.lastUpdate;
    this.lastUpdate = Date.now();

    console.log(`Updated in ${updatePeriod}ms. ${this.tanks.length} Tanks, ${this.bullets.length} Bullets, ${collisions} Collisions, ${playersThatMoved}/${this.tanks.length} Moved`);
};

GameWorld.prototype.createTank = function() {
    let spawn = this.getGoodSpawnPoint();
    let tank = new Entity.Tank(spawn.x, spawn.y, 10);

    this.tanks.push(tank);
    return tank;
};

GameWorld.prototype.deleteTank = function (tank) {
    this.tanks.splice(this.tanks.indexOf(tank), 1);
};

GameWorld.prototype.spawnBullet = function(owner, direction) {
    let bullet = new Entity.Bullet(owner.x, owner.y, 2, direction, owner);
    this.bullets.push(bullet);
};

GameWorld.prototype.getWorldSurrounding = function(player) {
    return {
        tanks: this.tanks,
        bullets: this.bullets
    }
};

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