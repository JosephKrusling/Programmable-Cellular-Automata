const {VM, VMScript} = require('vm2');
const fs = require('fs');
const yargs = require('yargs');
const path = require('path');
const argv = yargs.argv;
const socket = require('socket.io-client')(argv['server-url']);
let scriptPath = path.join(__dirname, '../userScripts', argv.script)

let scriptSource = fs.readFileSync(scriptPath, {encoding: 'utf8'});

const script = new VMScript(scriptSource);

let state;

let vm = new VM({
    timeout: 50,
    sandbox: {
        getState: function () {
            return state;
        },
        print: function(text) {
            console.log(text);
        }
    }
});

socket.on('connect', () => {
    socket.emit('type', 'player');
});

socket.on('tick', (arg) => {
    // console.log(JSON.stringify(arg));
    state = arg.state;

    try {
        let packet = {};
        let startTime = process.hrtime();
        let scriptResult = vm.run(script);

        packet.executionTime = process.hrtime(startTime)[1]/1000000; // milliseconds
        packet.desiredMove = scriptResult;

        // console.log(`Executed: ${packet.executionTime}`);
        socket.emit('action', packet);
    } catch(e) {
        console.log(`OUCH: ${e}`);
        socket.emit('scriptError', e);
    }
});


