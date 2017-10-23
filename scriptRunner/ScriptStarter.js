const express = require('express');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const yargs = require('yargs');
const path = require('path');
const fs = require('fs');
const randomstring = require('randomstring');
const { spawn } = require('child_process');

const config = {
    concurrentScriptMaximum: 10
};

let activeProcesses = [];

app.get('/', function(req, res) {
    red.send('What are you doing?')
});

io.on('connection', (socket) => {
    console.log('new connection');

    socket.on('runScript', (data) => {

        // Save the script to disk
        let scriptID = randomstring.generate(16) + '.js';
        let scriptSavePath = path.join(__dirname, '../userScripts', scriptID);
        console.log(`Saving script with ID ${scriptID}`);
        fs.writeFile(scriptSavePath, data.script);

        // Kill the oldest process if there is one
        if (activeProcesses.length >= config.concurrentScriptMaximum) {
            let victim = activeProcesses.shift();
            victim.kill();
            socket.emit('announceProcessDeath', victim.uniqueIdentifier);
        }

        // Start a new script runner
        const scriptRunnerProcess = spawn('node', ['scriptRunner', '--server-url=http://cs4003.xyz/', '--script=' + scriptID, '--bot-name=' + data.name]);

        scriptRunnerProcess.uniqueIdentifier = data.name;

        scriptRunnerProcess.stdout.on('data', (data) => {
            console.log(`stdout: ${data}`);
        });

        scriptRunnerProcess.stderr.on('data', (data) => {
            console.log(`stderr: ${data}`);
        });

        scriptRunnerProcess.on('close', (code) => {
            console.log(`child process exited with code ${code}`);
        });

        activeProcesses.push(scriptRunnerProcess);
    });
});


http.listen(3001, () => {
    console.log('listening');
});