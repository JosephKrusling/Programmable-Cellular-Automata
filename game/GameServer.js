const app = require('express')();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const Entity = require('./entity');
const PlayerConnection = require('./PlayerConnection');
const GameWorld = require('./GameWorld');

const world = new GameWorld();
let playerConnections = [];

app.get('/', (req, res) => {
    res.sendFile(__dirname + "/static/index.html");
});

io.on('connection', (socket) => {
    // console.log(PlayerConnection);
    let pc = new PlayerConnection(socket);
    socket.playerConnection = pc;
    socket.playerConnection.player = new Entity.Tank();
    playerConnections.push(pc);

    socket.on('disconnect', () => {
        pc.disconnected();
    });
    socket.on('scriptError', (error) => {
        console.log('we got a problem boss');
    });
    socket.on('action', (move) => {
        processMove(pc, move);
    })
});

http.listen(3000, () => {
    console.log('listening');
});

function processMove(playerConnection, move) {
    console.log('got a move:');
    console.log(move);
}

function broadcastState() {
    playerConnections.forEach(function(pc) {
        pc.socket.emit('tick', {
            state: {
                name: 'joe',
                x: 35,
                y: 49.33
            }
        })
    });
    setTimeout(() => {
        broadcastState();
    }, 100)
}
broadcastState();