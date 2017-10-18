function ViewerConnection(socket) {
    this.socket = socket;
    console.log('New Viewer Connection!');
}

ViewerConnection.prototype.disconnected = function() {
    console.log('viewer disconnected');
};

module.exports = ViewerConnection;