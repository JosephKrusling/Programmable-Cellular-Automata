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
                drawVisionIndicator: false
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

    lastPacketReceived = Date.now();

    mayDraw = false;
    socket.on('stateUpdate', function(state) {
        mayDraw = true;
        var timeSincePacket = Date.now() - lastPacketReceived;
        console.log(timeSincePacket);
        serverConfig = state.config;
        lastPacketReceived = Date.now();
        tanks = decodeTanks(state.tanks);
        bullets = decodeBullets(state.bullets);
        coins = decodeCoins(state.coins);
        asteroids = decodeAsteroids(state.asteroids);
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

function decodeCoins(string) {
    if (string === undefined)
        return [];
    var coins = [];
    var charsRead = 0;
    while (charsRead < string.length) {
        var coin = {};
        charsRead += decodeFloat32(string, charsRead, coin, 'x');
        charsRead += decodeFloat32(string, charsRead, coin, 'y');
        charsRead += decodeFloat32(string, charsRead, coin, 'radius');
        charsRead += decodeFloat32(string, charsRead, coin, 'xVelocity');
        charsRead += decodeFloat32(string, charsRead, coin, 'yVelocity');
        charsRead += decodeFloat32(string, charsRead, coin, 'timeCreated');
        charsRead += decodeUint8(string, charsRead, coin, 'colorR');
        charsRead += decodeUint8(string, charsRead, coin, 'colorG');
        charsRead += decodeUint8(string, charsRead, coin, 'colorB');
        charsRead += decodeUint8(string, charsRead, coin, 'colorA');
        coin.colorA /= 255;
        coins.push(coin)
    }

    return coins;
}

function decodeTanks(string) {
    if (string === undefined)
        return [];
    var tanks = [];
    var charsRead = 0;
    while (charsRead < string.length) {
        var tank = {};
        charsRead += decodeFloat32(string, charsRead, tank, 'x');
        charsRead += decodeFloat32(string, charsRead, tank, 'y');
        charsRead += decodeFloat32(string, charsRead, tank, 'radius');
        charsRead += decodeFloat32(string, charsRead, tank, 'facing');
        charsRead += decodeFloat32(string, charsRead, tank, 'xVelocity');
        charsRead += decodeFloat32(string, charsRead, tank, 'yVelocity');
        charsRead += decodeFloat32(string, charsRead, tank, 'timeCreated');
        charsRead += decodeFloat32(string, charsRead, tank, 'points');
        tanks.push(tank)
    }

    return tanks;
}

function decodeAsteroids(string) {
    if (string === undefined)
        return [];
    var asteroids = [];
    var charsRead = 0;
    while (charsRead < string.length) {
        var asteroid = {};
        charsRead += decodeFloat32(string, charsRead, asteroid, 'x');
        charsRead += decodeFloat32(string, charsRead, asteroid, 'y');
        charsRead += decodeFloat32(string, charsRead, asteroid, 'radius');
        charsRead += decodeFloat32(string, charsRead, asteroid, 'facing');
        charsRead += decodeFloat32(string, charsRead, asteroid, 'xVelocity');
        charsRead += decodeFloat32(string, charsRead, asteroid, 'yVelocity');
        charsRead += decodeFloat32(string, charsRead, asteroid, 'angularVelocity');
        charsRead += decodeFloat32(string, charsRead, asteroid, 'timeCreated');
        asteroids.push(asteroid)
    }

    return asteroids;
}

function decodeBullets(string) {
    if (string === undefined)
        return [];
    var bullets = [];
    var charsRead = 0;
    while (charsRead < string.length) {
        var bullet = {};
        charsRead += decodeFloat32(string, charsRead, bullet, 'x');
        charsRead += decodeFloat32(string, charsRead, bullet, 'y');
        charsRead += decodeFloat32(string, charsRead, bullet, 'radius');
        charsRead += decodeFloat32(string, charsRead, bullet, 'facing');
        charsRead += decodeFloat32(string, charsRead, bullet, 'speed');
        charsRead += decodeFloat32(string, charsRead, bullet, 'age');
        bullets.push(bullet)
    }

    return bullets;
}

var decodeUint8 = function( str, offset, obj, propName ) {
    obj[ propName ] = str.charCodeAt( offset );

    // Number of bytes (characters) read.
    return 1;
};

var decodeFloat32 = (function() {
    var arr  = new Float32Array( 1 );
    var char = new Uint8Array( arr.buffer );
    return function( str, offset, obj, propName ) {
        // Again, pay attention to endianness
        // here in production code.
        for ( var i = 0; i < 4; ++i ) {
            char[i] = str.charCodeAt( offset + i );
        }

        obj[ propName ] = arr[0];

        // Number of bytes (characters) read.
        return 4;
    };
}());

function draw() {


    ctx.globalCompositeOperation = "source-over"; // make front color overwrite
    ctx.fillStyle = config.graphics.colors.background;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    if (!mayDraw) {
        ctx.font = '48px Arial';
        ctx.fillStyle = 'rgba(255, 255, 255, 1)';
        ctx.fillText('Connecting to server', 50, 50);
        setTimeout(draw, 100);
        return;
    }

    // ctx.globalCompositeOperation = 'lighter'; // make colors add

    // console.log(`Draw (${asteroids.length} asteroids) (${bullets.length} bullets)`);

    for (var i = 0; i < coins.length; i++) {

        var coin = coins[i];
        // console.log(JSON.stringify(bullet));
        ctx.shadowBlur = 15;
        ctx.shadowColor = `rgba(${coin.colorR}, ${coin.colorG}, ${coin.colorB}, 1)`;

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
        ctx.fillStyle = `rgba(${coin.colorR}, ${coin.colorG}, ${coin.colorB}, ${coin.colorA})`;
        ctx.fill();

        // ctx.font = '12px Arial';
        // ctx.fillText(`x:${coin.x.toFixed(1)}, y:${coin.y.toFixed(1)}`, coin.x, coin.y);

    }

    for (var i = 0; i < bullets.length; i++) {
        var bullet = bullets[i];
        if (bullet.age + (Date.now() - lastPacketReceived) > serverConfig.bulletMaxAge) {
            // interpolate expiration of bullets
            continue;
        }
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


    requestAnimationFrame(draw);
    // setTimeout(draw, 0);
}


init();

const editorDiv = document.getElementById("editor");
const submitScriptBtn = document.getElementById("submitScript");
const finalizeScriptBtn = document.getElementById("finalizeScript");

submitScriptBtn.addEventListener(
    "click",
    function() {
        editorDiv.style.display = "inline";
        submitScriptBtn.style.display = "none";
        finalizeScriptBtn.style.display = "inline";
    },
    false
);

finalizeScriptBtn.addEventListener(
    "click",
    function() {
        editorDiv.style.display = "none";
        submitScriptBtn.style.display = "inline";
        finalizeScriptBtn.style.display = "none";
        socket.emit("submittedScript", { script: editor.getValue() });
    },
    false
);
