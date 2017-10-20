var sun = new Image();
var moon = new Image();
var earth = new Image();
function init() {
    // Set up canvas globals
    canvas = document.getElementById('canvas');
    ctx = canvas.getContext('2d');
    config = {
        interpolation: true,
        debugText: true,
        graphics: {
            colors: {
                background: 'rgba(15,15,30,1)'
            },
            asteroid: {
                drawCollisionCircle: false
            },
            tanks: {
                drawVisionIndicator: true
            }
        }
    };
    dimensions = {
        width: window.innerWidth,
        height: window.innerHeight
    };

    // Set up socket
    socket = io();
    socket.on('connect', function() {
        socket.emit('type', 'viewer');
    });

    socket.on('stateUpdate', function(state) {
        lastPacketReceived = Date.now();
        tanks = state.tanks;
        bullets = state.bullets;
        coins = state.coins;
        asteroids = state.asteroids;
        if (state.dimensions.height !== dimensions.height || state.dimensions.width !== dimensions.width) {
            setTimeout(resizeCanvas, 0);
        }
        dimensions = state.dimensions;
        vision = state.vision;

        // console.log(JSON.stringify(bullets));
    });


    // resize the canvas to fill browser window dynamically
    window.addEventListener('resize', resizeCanvas, false);
    function resizeCanvas() {
        let scaleHorizontal = window.innerWidth / dimensions.width;
        let scaleVertical = window.innerHeight / dimensions.height;
        let practicalScale = Math.min(scaleHorizontal, scaleVertical);
        canvas.width = window.innerWidth / practicalScale;
        canvas.height = window.innerHeight / practicalScale;
        ctx.scale(practicalScale, practicalScale);

    }
    resizeCanvas();


    tanks = [];
    bullets = [];
    coins = [];
    asteroids = [];

    // Start 'er up.
    window.requestAnimationFrame(draw);
}

function draw() {

    ctx.globalCompositeOperation = "source-over"; // make front color overwrite
    ctx.fillStyle = config.graphics.colors.background;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // ctx.globalCompositeOperation = 'lighter'; // make colors add

    // console.log(`Draw (${asteroids.length} asteroids) (${bullets.length} bullets)`);

    for (var i = 0; i < coins.length; i++) {

        var coin = coins[i];
        // console.log(JSON.stringify(bullet));
        ctx.shadowBlur = 15;
        ctx.shadowColor = coin.color;

        var timeAdvanced = (Date.now() - lastPacketReceived) / 1000;
        var deltaX = 0;
        var deltaY = 0;
        if (config.interpolation) {
            deltaX = timeAdvanced * coin.xVelocity;
            deltaY = timeAdvanced * coin.yVelocity;
        }

        ctx.beginPath();
        ctx.arc(coin.x + deltaX, coin.y + deltaY, coin.radius, 0, 2 * Math.PI);
        ctx.closePath();
        ctx.fillStyle = coin.color;
        ctx.fill();

        // ctx.font = '12px Arial';
        // ctx.fillText(`x:${coin.x.toFixed(1)}, y:${coin.y.toFixed(1)}`, coin.x, coin.y);

    }

    for (var i = 0; i < bullets.length; i++) {
        var bullet = bullets[i];
        // console.log(JSON.stringify(bullet));
        ctx.shadowBlur = 15;
        ctx.shadowColor = 'rgba(255, 255, 255, 1)';
        ctx.beginPath();

        // Interpolate to find estimated x of bullet.
        var timeAdvanced = (Date.now() - lastPacketReceived) / 1000;
        // console.log(timeAdvanced);
        var deltaX = 0;
        var deltaY = 0;
        if (config.interpolation) {
            deltaX = timeAdvanced * bullet.speed * Math.cos(bullet.facing);
            deltaY = timeAdvanced * bullet.speed * Math.sin(bullet.facing);
        }


        ctx.arc(bullet.x + deltaX, bullet.y + deltaY, bullet.radius, 0, 2 * Math.PI);
        ctx.closePath();
        ctx.fillStyle = 'rgba(255, 255, 255, 1)';
        ctx.fill();
    }


    for (var i = 0; i < asteroids.length; i++) {
        var asteroid = asteroids[i];

        let deltaX = 0;
        let deltaY = 0;

        // draw the asteroid
        ctx.shadowBlur = 0;

        var shape = [
            {mag: 1.05, angle: 0.5},
            {mag: 0.8, angle: 1.2},
            {mag: 1.15, angle: 1.8},
            {mag: 1.05, angle: 2.6},
            {mag: 1.05, angle: 3.9},
            {mag: 0.5, angle: 4.1},
            {mag: 1.15, angle: 4.6},
            {mag: 1.05, angle: 5.4}];
        ctx.beginPath();
        // ctx.arc(asteroid.x + deltaX, asteroid.y + deltaY, asteroid.radius, 0, 2 * Math.PI);
        var magnitude = shape[0].mag * asteroid.radius;
        var angle = asteroid.facing + shape[0].angle;
        ctx.moveTo(magnitude * Math.cos(angle) + asteroid.x, magnitude * Math.sin(angle) + asteroid.y);

        for (let i = 1; i < shape.length; i++) {
            magnitude = shape[i].mag * asteroid.radius;
            angle = asteroid.facing + shape[i].angle;
            ctx.lineTo(magnitude * Math.cos(angle) + asteroid.x, magnitude * Math.sin(angle) + asteroid.y);
        }

        ctx.closePath();
        ctx.lineWidth = 3;
        ctx.fillStyle = config.graphics.colors.background;
        ctx.fill();
        ctx.strokeStyle = 'rgba(255, 255, 255, 1)';
        ctx.setLineDash([]);
        ctx.stroke();

        if (config.graphics.asteroid.drawCollisionCircle) {
            ctx.beginPath();
            ctx.arc(asteroid.x, asteroid.y, asteroid.radius, 0, 2 * Math.PI);
            ctx.closePath();
            ctx.stroke();
        }
    }

    for (var i = 0; i < tanks.length; i++) {
        var tank = tanks[i];
        ctx.shadowBlur = 15;
        ctx.shadowColor = 'rgba(0, 0, 255, 1)';

        var deltaX = 0;
        var deltaY = 0;
        if (config.interpolation) {
            deltaX = timeAdvanced * tank.xVelocity;
            deltaY = timeAdvanced * tank.yVelocity;
        }

        // Advanced beak math
        // DON'T TRY THIS AT HOME KIDS
        let beakLength = 2.0;
        let beakAngle = Math.PI/4;
        ctx.beginPath();
        ctx.moveTo(tank.x + deltaX + (tank.radius * Math.cos(tank.facing - beakAngle)), tank.y + deltaY + (tank.radius * Math.sin(tank.facing - beakAngle)));
        ctx.lineTo(tank.x + deltaX + (tank.radius * beakLength * Math.cos(tank.facing)), tank.y + deltaY + (tank.radius * beakLength * Math.sin(tank.facing)));
        ctx.lineTo(tank.x + deltaX + (tank.radius * Math.cos(tank.facing + beakAngle)), tank.y + deltaY + (tank.radius * Math.sin(tank.facing + beakAngle)));
        ctx.closePath();
        ctx.fillStyle = 'rgba(0, 128, 255, 1)';
        ctx.fill();

        // draw the tank
        ctx.beginPath();
        ctx.arc(tank.x + deltaX, tank.y + deltaY, tank.radius, 0, 2 * Math.PI);
        ctx.closePath();
        ctx.fillStyle = 'rgba(0, 128, 255, 1)';
        ctx.fill();

        // draw tank's x and y coordinates
        if (config.debugText) {
            ctx.fillStyle = 'rgba(255, 255, 255, 1)';
            ctx.font = '12px Arial';
            ctx.fillText(`x:${tank.x.toFixed(1)}, y:${tank.y.toFixed(1)}`,tank.x + deltaX, tank.y + deltaY);
            ctx.fillText(`points:${tank.points}`,tank.x + deltaX, tank.y + deltaY+12);
        }

        if (config.graphics.tanks.drawVisionIndicator) {
            ctx.beginPath();
            ctx.arc(tank.x + deltaX, tank.y + deltaY, vision, 0, 2 * Math.PI);
            ctx.closePath();
            ctx.strokeStyle = 'rgba(255, 255, 255, 1)';
            ctx.lineWidth = 3;
            ctx.setLineDash([3, 25]);
            ctx.stroke();
        }


        // draw the tank's point value

    }


    setTimeout(draw, 0);
}


init();