const app = require('express')();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const Entity = require('./entity');
const PlayerConnection = require('./PlayerConnection');
const GameWorld = require('./GameWorld');
const world = new GameWorld();

const config = {
    network: {
        tickFrequency: 200
    }
};

let playerConnections = [];

app.get('/', (req, res) => {
    res.sendFile(__dirname + "/static/index.html");
});

io.on('connection', (socket) => {
    let pc = new PlayerConnection(socket);
    playerConnections.push(pc);
    socket.playerConnection = pc;


    socket.playerConnection.player = world.createTank();

    socket.on('disconnect', () => {
        pc.disconnected();
        world.deleteTank(pc.player);
    });
    socket.on('scriptError', (error) => {
        console.log(`Script error: ${error}`);
    });
    socket.on('action', (packet) => {
        // This desired move is processed in GameWorld.update.
        // It will be unset after it is processed.
        pc.player.desiredMove = packet.desiredMove;
    })
});

http.listen(3000, () => {
    console.log('listening');
});

function update() {
    // Schedule update() to run again.
    setTimeout(() => {
        update();
    }, config.network.tickFrequency)

    // Update the game world.
    world.update();


    // Broadcast the state to all the players.
    playerConnections.forEach(function(pc) {
        pc.socket.emit('tick', {
            state: world.getWorldSurrounding(pc.player)
        })
    });
}
update();