"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require('dotenv').config();
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const errorHandler_1 = require("./utils/errorHandler");
const index_1 = __importDefault(require("./routes/index"));
const logger_1 = __importDefault(require("./middlewares/logger"));
const app = (0, express_1.default)();
const allowedOrigins = ['http://localhost:6001', 'https://slate.imraffydev.com', 'https://hr2.slatefreight-ph.com'];
app.use((0, cors_1.default)({
    origin: allowedOrigins,
    credentials: true,
}));
app.use(express_1.default.json());
app.use((0, cookie_parser_1.default)(process.env.COOKIE_SECRET || process.env.JWT_SECRET));
app.use(express_1.default.urlencoded({ extended: true }));
app.use(logger_1.default);
app.use('/api/v1', index_1.default);
app.get('/', (req, res) => {
    res.send('Hello World!');
});
app.use(errorHandler_1.errorHandler);
exports.default = app;
