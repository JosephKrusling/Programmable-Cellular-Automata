const express = require('express');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const runnerServer = require('socket.io-client')('http://localhost:3001/');
const Entity = require('./entity');
const PlayerConnection = require('./PlayerConnection');
const ViewerConnection = require('./ViewerConnection');
const path = require('path');

const GameWorld = require('./GameWorld');
const world = new GameWorld();

const config = {
    network: {
        tickFrequency: 100
    }
};

let playerConnections = [];
let viewerConnections = [];

app.set('port, 80');
app.use(express.static(path.join(__dirname, 'static')));
console.log(__dirname);

// app.get('/', (req, res) => {
//     res.sendFile(__dirname + "/static/index.html");
// });

runnerServer.on('connect', () => {
    console.log('Connected to runner server! Ready to send it scripts.')
});

runnerServer.on('disconnect', () => {
   console.log('Disconnected from runner server!');
});

runnerServer.on('announceProcessDeath', (processName) => {
    console.log(`Terminated bot "${processName}" to make room.`);
    viewerConnections.forEach(function(vc) {
        vc.socket.emit('chat', `Our beloved ${processName} was terminated to make room for a new bot.`)
    });
});


io.on('connection', (socket) => {
    socket.on('disconnect', () => {
        if (socket.type === 'player') {
            socket.playerConnection.disconnected();
            world.deleteTank(socket.playerConnection.player);
        } else if (socket.type === 'viewer') {
            socket.viewerConnection.disconnected();

        }

    });
    socket.on('scriptError', (error) => {
        // console.log(`Script error: ${error}`);
    });
    socket.on('type', (type) => {
        if (type === 'player') {
            socket.type = 'player';

            let pc = new PlayerConnection(socket);
            playerConnections.push(pc);
            socket.playerConnection = pc;
            socket.playerConnection.player = world.createTank();
        } else if (type === 'viewer') {
            socket.type = 'viewer';

            let vc = new ViewerConnection(socket);
            viewerConnections.push(vc);
            socket.viewerConnection = vc;
        } else {
            // unknown type. who are you?
            socket.type = 0;
            socket.disconnect();
            console.log(`Somebody tried to connect with unusual type ${type}`);
        }
    });
    socket.on('action', (packet) => {
        // This desired move is processed in GameWorld.update.
        // It will be unset after it is processed.
        socket.playerConnection.player.desiredMove = packet.desiredMove;
    });
    socket.on("submittedScript", data => {
        data.name = 'bobbyboye';
        console.log(data);
        runnerServer.emit('runScript', data);
        // do stuff with script here
    });
});

http.listen(3000, () => {
    console.log('listening');
});

function update() {
    // Schedule update() to run again.
    setTimeout(() => {
        update();
    }, config.network.tickFrequency);

    // Update the game world.
    world.update();


    // Broadcast the state to all the players.
    playerConnections.forEach(function(pc) {
        pc.socket.emit('tick', {
            state: world.getWorldSurrounding(pc.player)
        })
    });

    let compressed = world.generateViewObject();
    viewerConnections.forEach(function(vc) {
        vc.socket.emit('stateUpdate', compressed)
    });
}
update();
