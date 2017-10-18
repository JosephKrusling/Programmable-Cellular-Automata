const {VM, VMScript} = require('vm2');
const fs = require('fs');
const socket = require('socket.io-client')('http://localhost:3000');



socket.on('connect', () => {
    socket.emit('type', 'player');
});

let scriptSource = fs.readFileSync('./example.js', {encoding: 'utf8'});

const script = new VMScript(scriptSource);

socket.on('tick', (arg) => {
    // console.log(JSON.stringify(arg));

    let vm = new VM({
        timeout: 50,
        sandbox: {
            state: arg.state,
            print: function(text) {
                console.log(text);
            }
        }
    });


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
