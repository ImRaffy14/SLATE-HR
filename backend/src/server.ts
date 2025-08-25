import app from './app';
import http from 'http';
import { Server as SocketIOServer } from 'socket.io';
import { connectPrisma, disconnectPrisma } from './config/prisma';
import registerSocketHandlers from './sockets';

const PORT = process.env.PORT

const allowedOrigins = ['http://localhost:3002'];

const server = http.createServer(app);
const io = new SocketIOServer(server, {
        cors: { origin: allowedOrigins, methods: ['GET', 'POST'] },
    });

registerSocketHandlers(io);

const startServer = async () => {
    try {
        await connectPrisma();
        server.listen(PORT, () => {
            console.log(`Server is running on port ${PORT} and Connected to Prisma`);
        })
    } catch (error) {
        console.error('Error starting server:', error);
        await disconnectPrisma();
        process.exit(1);
    }
}

startServer()