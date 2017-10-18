var sun = new Image();
var moon = new Image();
var earth = new Image();
function init() {
    // Set up canvas globals
    canvas = document.getElementById('canvas');
    ctx = canvas.getContext('2d');

    // Set up socket
    socket = io();
    socket.on('connect', function() {
        socket.emit('type', 'viewer');
    });

    socket.on('stateUpdate', function(state) {
       tanks = state.tanks;
       bullets = state.bullets;
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


    // Start 'er up.
    window.requestAnimationFrame(draw);
}

function draw() {
    ctx.globalCompositeOperation = "source-over"; // make front color overwrite
    ctx.fillStyle = "rgba(15,15,30,1)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // ctx.globalCompositeOperation = 'lighter'; // make colors add

    console.log(`Draw (${tanks.length} tanks) (${bullets.length} bullets)`);

    for (var i = 0; i < tanks.length; i++) {
        var orb = tanks[i];

        ctx.shadowBlur = 15;
        ctx.shadowColor = 'rgba(0, 0, 255, 1)';
        ctx.beginPath();
        ctx.arc(orb.x, orb.y, 10, 0, 2 * Math.PI);
        ctx.closePath();
        ctx.fillStyle = 'rgba(0, 128, 255, 1)';
        ctx.fill();
    }

    for (var i = 0; i < bullets.length; i++) {

        var bullet = bullets[i];
        ctx.shadowBlur = 15;
        ctx.shadowColor = 'rgba(255, 0, 0, 1)';
        ctx.beginPath();
        ctx.arc(bullet.x, bullet.y, 2, 0, 2 * Math.PI);
        ctx.closePath();
        ctx.fillStyle = 'rgba(255, 64, 0, 1)';
        ctx.fill();
    }

    setTimeout(draw, 0);
}


init();