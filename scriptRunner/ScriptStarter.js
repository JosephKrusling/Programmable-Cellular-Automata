const express = require('express');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const yargs = require('yargs');
const path = require('path');
const argv = yargs.argv;

app.get('/', function(req, res) {
    red.send('What are you doing?')
});

io.on('connection', (socket) => {
    console.log('new connection');
});

http.listen(3001, () => {
    console.log('listening');
});
//
// const { spawn } = require('child_process');
// const ls = spawn('node', ['scriptRunner', '--server-url=http://localhost:3000', '--script=example.js']);
//
// ls.stdout.on('data', (data) => {
//     console.log(`stdout: ${data}`);
// });
//
// ls.stderr.on('data', (data) => {
//     console.log(`stderr: ${data}`);
// });
//
// ls.on('close', (code) => {
//     console.log(`child process exited with code ${code}`);
// });