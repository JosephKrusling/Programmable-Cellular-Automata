const app = require('express')();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const PlayerConnection = require('./PlayerConnection');

app.get('/', (req, res) => {
    res.sendFile(__dirname + "/static/index.html");
});

io.on('connection', (socket) => {
    // console.log(PlayerConnection);
    let pc = new PlayerConnection(socket);
    socket.playerConnection = pc;

    socket.on('disconnect', () => {
        pc.disconnected();
    });
    socket.on('scriptError', (error) => {
        console.log('we got a problem boss');
    });
    socket.on('requestMove', (move) => {
        processMove(pc, move);
    })
});

http.listen(3000, () => {
    console.log('listening');
});

function processMove(playerConnection, move) {
    console.log('got a move');
}

function broadcastState() {
    io.sockets.emit('tick', {
        state: {
            name: 'joe',
            x: 35,
            y: 49.33
        }
    });
    setTimeout(() => {
        broadcastState();
    }, 100)
}
broadcastState();