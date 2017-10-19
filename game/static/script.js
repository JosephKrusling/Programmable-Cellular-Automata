var sun = new Image();
var moon = new Image();
var earth = new Image();
function init() {
    // Set up canvas globals
    canvas = document.getElementById('canvas');
    ctx = canvas.getContext('2d');
    config = {
        interpolation: true,
        debugText: false
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

       // console.log(JSON.stringify(bullets));
    });


    // resize the canvas to fill browser window dynamically
    window.addEventListener('resize', resizeCanvas, false);
    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }
    resizeCanvas();


    tanks = [];
    bullets = [];
    coins = [];


    // Start 'er up.
    window.requestAnimationFrame(draw);
}

function draw() {
    ctx.globalCompositeOperation = "source-over"; // make front color overwrite
    ctx.fillStyle = "rgba(15,15,30,1)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // ctx.globalCompositeOperation = 'lighter'; // make colors add

    // console.log(`Draw (${tanks.length} tanks) (${bullets.length} bullets)`);

    for (var i = 0; i < coins.length; i++) {

        var coin = coins[i];
        // console.log(JSON.stringify(bullet));
        ctx.shadowBlur = 15;
        ctx.shadowColor = 'rgba(255, 255, 128, 1)';
        ctx.beginPath();
        ctx.arc(coin.x, coin.y, coin.radius, 0, 2 * Math.PI);
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
        ctx.shadowColor = 'rgba(255, 0, 0, 1)';
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
        ctx.fillStyle = 'rgba(255, 0, 0, 1)';
        ctx.fill();
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


        // draw the tank's point value

    }



    setTimeout(draw, 0);
}


init();