"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = registerSocketHandlers;
function registerSocketHandlers(io) {
    io.on('connection', (socket) => {
        console.log(`User connected: ${socket.id}`);
        // Handle incoming messages from the client
        socket.on('disconnect', () => {
            console.log(`User disconnected: ${socket.id}`);
        });
    });
}
