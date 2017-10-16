function PlayerConnection() {
    console.log('hey!');
}

PlayerConnection.prototype.disconnected = function() {
    console.log('pc was disconnected');
};

module.exports = PlayerConnection;