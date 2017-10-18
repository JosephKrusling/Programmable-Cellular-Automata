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
        bulletSpeed: 400 // per second
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

    let sinceLastUpdate = Date.now() - this.lastUpdate;
    this.lastUpdate = Date.now();

    // Clear bullets which have expired.
    // Move bullets.
    for (let bulletIndex = 0; bulletIndex < this.bullets.length; bulletIndex++) {
        let bullet = this.bullets[bulletIndex];
        if (bullet.getAge() > 10000) {
            this.bullets.splice(bulletIndex, 1);
        }

        let distance = bullet.speed * sinceLastUpdate / 1000;
        bullet.x += distance * Math.cos(bullet.direction);
        bullet.y += distance * Math.sin(bullet.direction);
    }

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
                    this.spawnBullet(tank, tank.direction, this.config.bulletSpeed);
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



    // console.log(`Updated in ${updatePeriod}ms. ${this.tanks.length} Tanks, ${this.bullets.length} Bullets, ${collisions} Collisions, ${playersThatMoved}/${this.tanks.length} Moved`);
};

GameWorld.prototype.createTank = function() {
    let spawn = this.getGoodSpawnPoint();
    let tank = new Entity.Tank(spawn.x, spawn.y, 15, Math.random() * 2 * Math.PI);

    this.tanks.push(tank);
    return tank;
};

GameWorld.prototype.deleteTank = function (tank) {
    this.tanks.splice(this.tanks.indexOf(tank), 1);
};

GameWorld.prototype.spawnBullet = function(owner, direction, speed) {
    let dist = owner.radius + 2;

    // So that the bullet spawns on the edge of the player rather than his center
    let x = owner.x + dist * Math.cos(direction);
    let y = owner.y + dist * Math.sin(direction);

    let bullet = new Entity.Bullet(x, y, 2, direction, speed, owner);
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