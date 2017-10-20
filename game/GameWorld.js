const Entity = require('./entity');
const Quadtree = require('./util/Quadtree');

function GameWorld() {
    this.tanks = [];
    this.bullets = [];
    this.food = [];
    this.asteroids = [];
    this.dimensions = {
        width: 2000,
        height: 1000
    };
    this.food = [];
    this.config = {
        tank: {
            maximumSpeed: 10,
            thrustAcceleration: 200, //pixels/s^2
            friction: 0.8
        },
        vision: {
            maximumDistance: 200
        },
        bullet: {
            speed: 700, // per second
            radius: 10,
            maxAge: 2000
        },
        coins: {
            maxAge: 5000
        },
        foodMax: 200,
        asteroidsMax: 20
    };

    this.lastUpdate = Date.now();

    for (let i = 0; i < this.config.asteroidsMax; i++) {
        this.spawnAsteroid();
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
        if (bullet.getAge() > this.config.bullet.maxAge) {
            this.bullets.splice(bulletIndex, 1);
        }

        let distance = bullet.speed * msSinceLastUpdate / 1000;
        bullet.x += distance * Math.cos(bullet.facing);
        bullet.y += distance * Math.sin(bullet.facing);
    }

    // Process player moves
    let playersThatMoved = 0;
    for (let tankIndex = 0; tankIndex < this.tanks.length; tankIndex++) {
        let tank = this.tanks[tankIndex];
        let desiredMove = tank.desiredMove;
        if (desiredMove) {
            playersThatMoved++;

            if ('facing' in desiredMove) {
                tank.facing = desiredMove.facing;
                // console.log(tank.direction);
            }

            if ('thrust' in desiredMove) {
                tank.thrust = desiredMove.thrust;
            }

            if (tank.thrust) {
                tank.xVelocity += this.config.tank.thrustAcceleration * secSinceLastUpdate * Math.cos(tank.facing);
                tank.yVelocity += this.config.tank.thrustAcceleration * secSinceLastUpdate * Math.sin(tank.facing);
            }

            tank.x += tank.xVelocity * secSinceLastUpdate;
            tank.y += tank.yVelocity * secSinceLastUpdate;

            //friction
            tank.xVelocity *= this.config.tank.friction;
            tank.yVelocity *= this.config.tank.friction;

            tank.enforceBounds(0, 0, this.dimensions.width, this.dimensions.height);

            if ('shoot' in desiredMove) {
                if(tank.mayShoot()){
                    this.spawnBullet(tank, tank.facing, this.config.bullet.speed);
                    tank.startAttackCooldown();
                }
            }
            // console.log(desiredMove);

            tank.desiredMove = null;
        }
    }

    // Check for collision between tanks and bullets. VERY INEFFICIENT.
    // TODO: O(n^2)
    let collisions = 0;
    for (let tankIndex = 0; tankIndex < this.tanks.length; tankIndex++) {
        let tank = this.tanks[tankIndex];

        for (let bulletIndex = 0; bulletIndex < this.bullets.length; bulletIndex++) {
            let bullet = this.bullets[bulletIndex];
            if (bullet.owner === tank) {
                continue;
            }
            if(tank.checkCollision(bullet)) {
                this.spawnCoinFountain(tank.points/2, tank.x, tank.y, 200);
                tank.getRekt(); // reset points and respawn
            }
            collisions++;
        }

        for (let asteroidIndex = 0; asteroidIndex < this.asteroids.length; asteroidIndex++) {
            let asteroid = this.asteroids[asteroidIndex];
            if(tank.checkCollision(asteroid)) {
                this.spawnCoinFountain(tank.points/2, tank.x, tank.y, 200);
                tank.getRekt(); // reset points and respawn
            }
            collisions++;
        }

        for (let foodIndex = 0; foodIndex < this.food.length; foodIndex++) {
            let coin = this.food[foodIndex];
            // // coin vacuum
            // let dist2 = tank.distance2(coin);
            // if (dist2 < (this.config.vision.maximumDistance / 2) ** 2) {
            //     let velocity = 800 * secSinceLastUpdate;
            //     let angle = Math.atan2(tank.y - coin.y, tank.x - coin.x);
            //     coin.xVelocity += velocity *= Math.cos(angle);
            //     coin.yVelocity += velocity *= Math.sin(angle);
            // }
            if (tank.checkCollision(coin)) {
                this.food.splice(foodIndex, 1);
                tank.incrementPoints(); // add point value because we just picked up foodzies
            }
        }
    }

    // wtf is this collision code jesus christ
    for (let bulletIndex = 0; bulletIndex < this.bullets.length; bulletIndex++) {
        let bullet = this.bullets[bulletIndex];
        for (let asteroidIndex = 0; asteroidIndex < this.asteroids.length; asteroidIndex++) {
            let asteroid = this.asteroids[asteroidIndex];

            if (bullet.checkCollision(asteroid)) {
                this.killAsteroid(asteroid);
            }
        }
    }

    // Make food drift
    for (let foodIndex = 0; foodIndex < this.food.length; foodIndex++) {
        let food = this.food[foodIndex];
        if (food.getAge() > this.config.coins.maxAge) {
            this.food.splice(this.food.indexOf(food), 1);
        }
        food.drift(0.1, 10);
        food.x += food.xVelocity * secSinceLastUpdate;
        food.y += food.yVelocity * secSinceLastUpdate;
        food.enforceBounds(0, 0, this.dimensions.width, this.dimensions.height);
        food.xVelocity *= 0.9; // todo this is not correct since it decays more for faster updates. fix it
        food.yVelocity *= 0.9;
    }

    // Make asteroids drift and rotate
    for (let asteroidIndex = 0; asteroidIndex < this.asteroids.length; asteroidIndex++) {
        let asteroid = this.asteroids[asteroidIndex];
        asteroid.drift(0.3 * secSinceLastUpdate, 10);
        asteroid.x += asteroid.xVelocity * secSinceLastUpdate;
        asteroid.y += asteroid.yVelocity * secSinceLastUpdate;
        asteroid.enforceBounds(0, 0, this.dimensions.width, this.dimensions.height);
        asteroid.xVelocity *= 0.98; // todo this is not correct since it decays more for faster updates. fix it
        asteroid.yVelocity *= 0.98;

        asteroid.nudge(0.005 * secSinceLastUpdate, 0.05);
        asteroid.facing += asteroid.angularVelocity * secSinceLastUpdate;
        asteroid.angularVelocity *= 0.9;
    }



    console.log(`Updated in ${msSinceLastUpdate}ms. ${this.tanks.length} Tanks, ${this.bullets.length} Bullets, ${playersThatMoved}/${this.tanks.length} Moved`);
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

GameWorld.prototype.spawnBullet = function(owner, facing, speed) {
    let dist = owner.radius + this.config.bullet.radius;

    // So that the bullet spawns on the edge of the player rather than his center
    let x = owner.x + dist * Math.cos(facing);
    let y = owner.y + dist * Math.sin(facing);

    let bullet = new Entity.Bullet(x, y, this.config.bullet.radius, facing, speed, owner);
    this.bullets.push(bullet);
};

GameWorld.prototype.spawnAsteroid = function() {
    let asteroid = new Entity.Asteroid(
        Math.random() * this.dimensions.width,
        Math.random() * this.dimensions.height,
        40,
        Math.random() * 2 * Math.PI
    );
    // console.log(asteroid);
    this.asteroids.push(asteroid);
};

GameWorld.prototype.killAsteroid = function(asteroid) {
    this.spawnCoinFountain(10, asteroid.x, asteroid.y, 160);
    this.asteroids.splice(this.asteroids.indexOf(asteroid), 1);
    this.spawnAsteroid();
};

GameWorld.prototype.spawnCoinFountain = function(quantity, x, y, velocityMax) {
    for (let i = 0; i < quantity; i++) {
        let coin = new Entity.Food(x, y);
        let velocity = Math.random() * velocityMax;
        let angle = Math.random() * 2 * Math.PI;
        coin.xVelocity = velocity * Math.cos(angle);
        coin.yVelocity = velocity * Math.sin(angle);
        this.food.push(coin);
    }
};

GameWorld.prototype.getWorldSurrounding = function(player) {
    let state = {
        myTank: player,
        tanks: [],
        bullets: [],
        coins: [],
        asteroids: []
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
    
    // Add nearby asteroids
    for (let asteroidIndex = 0; asteroidIndex < this.asteroids.length; asteroidIndex++) {
        let asteroid = this.asteroids[asteroidIndex];

        if (asteroid) {
            let distance2 = player.distance2(asteroid);
            let maxdist2 = Math.pow(this.config.vision.maximumDistance, 2);
            if (distance2 < maxdist2) {
                state.asteroids.push(asteroid)
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