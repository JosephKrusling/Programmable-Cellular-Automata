function PlayerConnection(socket) {
    this.socket = socket;
    console.log('a player connected');
}

PlayerConnection.prototype.disconnected = function() {
    console.log('pc was disconnected');
};

PlayerConnection.prototype.isPlaying = function() {
  return this.player !== undefined;
};

module.exports = PlayerConnection;