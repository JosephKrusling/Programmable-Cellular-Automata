const {VM} = require('vm2');
const fs = require('fs');
const socket = require('socket.io-client')('http://localhost:3000');



socket.on('connect', () => {
    console.log('we connected!');
});

let scriptSource = fs.readFileSync('./script.js', {encoding: 'utf8'});

socket.on('tick', (arg) => {
    console.log(arg);

    let vm = new VM({
        timeout: 100,
        sandbox: {
            state: arg.state
        }
    });


    try {
        let scriptResult = vm.run(scriptSource);
        socket.emit('requestMove', scriptResult);
    } catch(e) {
        socket.emit('scriptError', e);
    }
});
