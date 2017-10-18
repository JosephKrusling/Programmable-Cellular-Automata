const Entity = require('./entity');
const Quadtree = require('./util/Quadtree');

function GameWorld() {
    this.tanks = [];
    this.bullets = [];
    this.food = [];
    this.dimensions = {
        width: 700,
        height: 700
    };
    this.food = [];
    this.config = {
        tank: {
            maximumSpeed: 10,
            thrustAcceleration: 50, //pixels/s^2
            friction: 0.9
        },
        vision: {
            maximumDistance: 10000
        },
        bullet: {
            speed: 800, // per second
            radius: 5
        }
    };

    this.lastUpdate = Date.now();
    for (let i = 0; i < 5; i++)
    {
        this.food.push(this.createRandomFood());
    }
}

GameWorld.prototype.update = function () {
    if (this.tanks === undefined || this.bullets === undefined)
        return;

    let msSinceLastUpdate = Date.now() - this.lastUpdate;
    let secSinceLastUpdate = msSinceLastUpdate/1000;
    this.lastUpdate = Date.now();

    // Clear bullets which have expired.
    // Move bullets.
    for (let bulletIndex = 0; bulletIndex < this.bullets.length; bulletIndex++) {
        let bullet = this.bullets[bulletIndex];
        if (bullet.getAge() > 10000) {
            this.bullets.splice(bulletIndex, 1);
        }

        let distance = bullet.speed * msSinceLastUpdate / 1000;
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

            if ('direction' in desiredMove) {
                tank.direction = desiredMove.direction;
                console.log(tank.direction);
            }

            if ('thrust' in desiredMove) {
                tank.thrust = desiredMove.thrust;
            }

            if (tank.thrust) {
                tank.xVelocity += this.config.tank.thrustAcceleration * secSinceLastUpdate * Math.cos(tank.direction);
                tank.yVelocity += this.config.tank.thrustAcceleration * secSinceLastUpdate * Math.sin(tank.direction);
            }

            tank.x += tank.xVelocity * secSinceLastUpdate;
            tank.y += tank.yVelocity * secSinceLastUpdate;

            //friction
            tank.xVelocity *= this.config.tank.friction;
            tank.yVelocity *= this.config.tank.friction;

            tank.enforceBounds(0, 0, this.dimensions.width, this.dimensions.height);
            
            

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

    // Make food drift
    for (let foodIndex = 0; foodIndex < this.food.length; foodIndex++) {
        let food = this.food[foodIndex];
        food.drift(0.1, 10);
        food.x += food.xVelocity * secSinceLastUpdate;
        food.y += food.yVelocity * secSinceLastUpdate;
        food.enforceBounds(0, 0, this.dimensions.width, this.dimensions.height);
        food.xVelocity *= 0.9; // todo this is not correct since it decays more for faster updates. fix it
        food.yVelocity *= 0.9;
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
    let dist = owner.radius + this.config.bullet.radius;

    // So that the bullet spawns on the edge of the player rather than his center
    let x = owner.x + dist * Math.cos(direction);
    let y = owner.y + dist * Math.sin(direction);

    let bullet = new Entity.Bullet(x, y, this.config.bullet.radius, direction, speed, owner);
    this.bullets.push(bullet);
};

GameWorld.prototype.getWorldSurrounding = function(player) {
    let state = {
        myTank: player,
        tanks: [],
        bullets: [],
        coins: []
    };

    // Add nearby tanks
    for (let tankIndex = 0; tankIndex < this.tanks.length; tankIndex++) {
        let tank = this.tanks[tankIndex];

        if (tank) {
            if (tank === player) {
                continue;
            }
            let distance2 = player.distance2(tank);
            let maxdist2 = Math.pow(this.config.vision.maximumDistance, 2);
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
            let maxdist2 = Math.pow(this.config.vision.maximumDistance, 2);
            if (distance2 < maxdist2) {
                state.bullets.push(bullet)
            }
        }
    }
    
    // Add nearby coins
    for (let coinIndex = 0; coinIndex < this.food.length; coinIndex++) {
        let coin = this.food[coinIndex];

        if (coin) {
            let distance2 = player.distance2(coin);
            let maxdist2 = Math.pow(this.config.vision.maximumDistance, 2);
            if (distance2 < maxdist2) {
                state.coins.push(coin)
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
  return new Entity.Food(Math.random() * this.dimensions.width, Math.random() * this.dimensions.height, 5);
};

module.exports = GameWorld;