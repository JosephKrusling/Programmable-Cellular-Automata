const Entity = require('./entity');
const Quadtree = require('./util/Quadtree');

function GameWorld() {
    this.tanks = [];
    this.bullets = [];
    this.food = [];
    this.dimensions = {
        width: 1000,
        height: 1000
    };
    this.food = [];
    this.config = {
        tanks: {
            maximumSpeed: 10
        },
        vision: {
            maximumDistance: 100
        },
        bulletSpeed: 20
    };

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


    // Clear bullets which have expired.
    // Move bullets.
    for (let bulletIndex = 0; bulletIndex < this.bullets.length; bulletIndex++) {
        let bullet = this.bullets[bulletIndex];
        if (bullet.getAge() > 1000) {
            this.bullets.splice(bulletIndex, 1);
        }

        bullet.x += this.config.bulletSpeed * Math.cos(bullet.direction);
        bullet.y += this.config.bulletSpeed * Math.sin(bullet.direction);
        bullet.direction += 0.3;
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

    let updatePeriod = Date.now() - this.lastUpdate;
    this.lastUpdate = Date.now();

    // console.log(`Updated in ${updatePeriod}ms. ${this.tanks.length} Tanks, ${this.bullets.length} Bullets, ${collisions} Collisions, ${playersThatMoved}/${this.tanks.length} Moved`);
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
    let state = {
        myTank: player,
        tanks: [],
        bullets: []
    };

    // Add nearby tanks
    for (let tankIndex = 0; tankIndex < this.tanks.length; tankIndex++) {
        let tank = this.tanks[tankIndex];

        if (tank) {
            if (tank === player) {
                continue;
            }
            let distance2 = player.distance2(tank);
            let maxdist2 = this.config.vision.maximumDistance^2;
            if (distance2 < maxdist2) {
                state.tanks.push(tank)
            }
        }
    }

    // Add nearby bullets
    for (let bulletIndex = 0; bulletIndex < this.tanks.length; bulletIndex++) {
        let bullet = this.bullets[bulletIndex];

        if (bullet) {
            let distance2 = player.distance2(bullet);
            let maxdist2 = this.config.vision.maximumDistance^2;
            if (distance2 < maxdist2) {
                state.bullets.push(bullet)
            }
        }
    }

    return state;
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