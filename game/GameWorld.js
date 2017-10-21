const Entity = require('./entity');
const Quadtree = require('./util/Quadtree');

function GameWorld() {
    this.tanks = [];
    this.bullets = [];
    this.coins = [];
    this.asteroids = [];
    this.dimensions = {
        width: 3000,
        height: 1500
    };
    this.coins = [];
    this.config = {
        tank: {
            maximumSpeed: 10,
            thrustAcceleration: 250, //pixels/s^2
            friction: 0.8
        },
        vision: {
            maximumDistance: 200
        },
        bullet: {
            speed: 700, // per second
            radius: 10,
            maxAge: 1000
        },
        coins: {
            maxAge: 10000,
            asteroidBountyMin: 5,
            asteroidBountyMax: 10,
            asteroidExplosionVelocity: 100,
            friction: 0.9
        },
        foodMax: 200,
        asteroidsMax: 40
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
            continue;
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
                this.respawnTank(tank);
            }
            collisions++;
        }

        for (let asteroidIndex = 0; asteroidIndex < this.asteroids.length; asteroidIndex++) {
            let asteroid = this.asteroids[asteroidIndex];
            if(tank.checkCollision(asteroid)) {
                this.spawnCoinFountain(tank.points/2, tank.x, tank.y, 200);
                tank.getRekt(); // reset points and respawn
                this.respawnTank(tank);
            }
            collisions++;
        }

        for (let foodIndex = 0; foodIndex < this.coins.length; foodIndex++) {
            let coin = this.coins[foodIndex];
            // // coin vacuum
            // let dist2 = tank.distance2(coin);
            // if (dist2 < (this.config.vision.maximumDistance / 2) ** 2) {
            //     let velocity = 800 * secSinceLastUpdate;
            //     let angle = Math.atan2(tank.y - coin.y, tank.x - coin.x);
            //     coin.xVelocity += velocity *= Math.cos(angle);
            //     coin.yVelocity += velocity *= Math.sin(angle);
            // }
            if (tank.checkCollision(coin)) {
                this.coins.splice(foodIndex, 1);
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

    // Make coins drift
    for (let foodIndex = 0; foodIndex < this.coins.length; foodIndex++) {
        let food = this.coins[foodIndex];
        if (food.getAge() > this.config.coins.maxAge) {
            this.coins.splice(this.coins.indexOf(food), 1);
        }
        food.drift(0.1, 10);
        food.x += food.xVelocity * secSinceLastUpdate;
        food.y += food.yVelocity * secSinceLastUpdate;
        food.enforceBounds(0, 0, this.dimensions.width, this.dimensions.height);
        food.xVelocity *= this.config.coins.friction; // todo this is not correct since it decays more for faster updates. fix it
        food.yVelocity *= this.config.coins.friction;
        food.colorA = 1 - (food.getAge() / this.config.coins.maxAge * 0.9);
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

GameWorld.prototype.respawnTank = function(tank) {
    let spawn = this.getGoodSpawnPoint();
    tank.x = spawn.x;
    tank.y = spawn.y;
    tank.xVelocity = 0;
    tank.yVelocity = 0;
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
    this.spawnCoinFountain(Math.random() * (this.config.coins.asteroidBountyMax - this.config.coins.asteroidBountyMin) + this.config.coins.asteroidBountyMin, asteroid.x, asteroid.y, this.config.coins.asteroidExplosionVelocity);
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
        this.coins.push(coin);
    }
};

GameWorld.prototype.generateViewObject = function() {
    let state  ={
        dimensions: this.dimensions,
        vision: this.config.vision,
        config: {
            bulletMaxAge: this.config.bullet.maxAge
        },
        coins: '',
        tanks: '',
        asteroids: '',
        bullets: ''
    };
    for (let coinIndex = 0; coinIndex < this.coins.length; coinIndex++) {
        let coin = this.coins[coinIndex];
        let msg = '';
        msg += encodeFloat32(coin.x);
        msg += encodeFloat32(coin.y);
        msg += encodeFloat32(coin.radius);
        msg += encodeFloat32(coin.xVelocity);
        msg += encodeFloat32(coin.yVelocity);
        msg += encodeFloat32(coin.timeCreated);
        msg += encodeUint8(coin.colorR);
        msg += encodeUint8(coin.colorG);
        msg += encodeUint8(coin.colorB);
        msg += encodeUint8(Math.round(coin.colorA * 255));
        state.coins += msg;
    }

    for (let tankIndex = 0; tankIndex < this.tanks.length; tankIndex++) {
        let tank = this.tanks[tankIndex];
        let msg = '';
        msg += encodeFloat32(tank.x);
        msg += encodeFloat32(tank.y);
        msg += encodeFloat32(tank.radius);
        msg += encodeFloat32(tank.facing);
        msg += encodeFloat32(tank.xVelocity);
        msg += encodeFloat32(tank.yVelocity);
        msg += encodeFloat32(tank.timeCreated);
        msg += encodeFloat32(tank.points);
        state.tanks += msg;
    }

    for (let asteroidIndex = 0; asteroidIndex < this.asteroids.length; asteroidIndex++) {
        let asteroid = this.asteroids[asteroidIndex];
        let msg = '';
        msg += encodeFloat32(asteroid.x);
        msg += encodeFloat32(asteroid.y);
        msg += encodeFloat32(asteroid.radius);
        msg += encodeFloat32(asteroid.facing);
        msg += encodeFloat32(asteroid.xVelocity);
        msg += encodeFloat32(asteroid.yVelocity);
        msg += encodeFloat32(asteroid.angularVelocity);
        msg += encodeFloat32(asteroid.timeCreated);
        state.asteroids += msg;
    }

    for (let bulletIndex = 0; bulletIndex < this.bullets.length; bulletIndex++) {
        let bullet = this.bullets[bulletIndex];
        let msg = '';
        msg += encodeFloat32(bullet.x);
        msg += encodeFloat32(bullet.y);
        msg += encodeFloat32(bullet.radius);
        msg += encodeFloat32(bullet.facing);
        msg += encodeFloat32(bullet.speed);
        msg += encodeFloat32(bullet.getAge());
        state.bullets += msg;
    }
    return state;
};

var encodeUint8 = (function() {
    var arr = new Uint8Array( 1 );
    return function( number ) {
        // If we assume that the number passed in
        // valid, we can just use it directly.
        // return String.fromCharCode( number );
        arr[0] = number;
        return String.fromCharCode( arr[0] );
    };
}());

var encodeFloat32 = (function() {
    var arr  = new Float32Array( 1 );
    var char = new Uint8Array( arr.buffer );
    return function( number ) {
        arr[0] = number;
        // In production code, please pay
        // attention to endianness here.
        return String.fromCharCode( char[0], char[1], char[2], char[3] );
    };
}());

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
    for (let coinIndex = 0; coinIndex < this.coins.length; coinIndex++) {
        let coin = this.coins[coinIndex];

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

// get a new coins object with random coordinates
GameWorld.prototype.createRandomFood = function()
{
  return new Entity.Food(Math.random() * this.dimensions.width, Math.random() * this.dimensions.height, 5);
};

module.exports = GameWorld;