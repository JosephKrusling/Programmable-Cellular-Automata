const {VM} = require('vm2');
const fs = require('fs');
const socket = require('socket.io-client')('http://localhost:3000');



socket.on('connect', () => {
    console.log('we connected!');
});

let scriptSource = fs.readFileSync('./example.js', {encoding: 'utf8'});

socket.on('tick', (arg) => {
    console.log(JSON.stringify(arg));

    let vm = new VM({
        timeout: 100,
        sandbox: {
            state: arg.state
        }
    });


    try {
        let packet = {};
        let startTime = process.hrtime();
        let scriptResult = vm.run(scriptSource);

        packet.executionTime = process.hrtime(startTime)[1]/1000000; // milliseconds
        packet.desiredMove = scriptResult;

        socket.emit('action', packet);
    } catch(e) {
        socket.emit('scriptError', e);
    }
});
