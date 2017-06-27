/**
 * Created by Ivan on 6/26/2017.
 */

const io = require('socket.io')();

let connections = [];
console.log(connections.length);

io.on('connection', (socket) => {
    connections.push(socket);

    socket.on('disconnect', (data) => {
        connections.splice(connections.indexOf(socket), 1);
    });

    //python event
    socket.on('glamurozni_guz', (data) => {
       console.log("glamurozni_guz");
       console.log(data);
    });

});

exports.broadcastEvent = (tag) => {
    let sock = connections[0];
    if (sock) {
        sock.broadcast.emit(tag);
        sock.emit(tag);
    }
};

exports.broadcastMessage = (tag, message) => {
    let sock = connections[0];
    if (sock) { // ovde ide i openState
        sock.broadcast.emit(tag, message);
        sock.emit(tag, message);
    }
};

io.listen(4200);
console.log("Socket.io up and running");