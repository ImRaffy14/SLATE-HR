"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const app_1 = __importDefault(require("./app"));
const http_1 = __importDefault(require("http"));
const socket_io_1 = require("socket.io");
const prisma_1 = require("./config/prisma");
const sockets_1 = __importDefault(require("./sockets"));
const PORT = process.env.PORT;
const allowedOrigins = ['http://localhost:6001', 'https://slate.imraffydev.com', 'https://hr2.slatefreight-ph.com'];
const server = http_1.default.createServer(app_1.default);
const io = new socket_io_1.Server(server, {
    cors: { origin: allowedOrigins, methods: ['GET', 'POST'] },
});
(0, sockets_1.default)(io);
const startServer = async () => {
    try {
        await (0, prisma_1.connectPrisma)();
        server.listen(PORT, () => {
            console.log(`Server is running on port ${PORT} and Connected to Prisma`);
        });
    }
    catch (error) {
        console.error('Error starting server:', error);
        await (0, prisma_1.disconnectPrisma)();
        process.exit(1);
    }
};
startServer();
