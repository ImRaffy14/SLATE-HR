require('dotenv').config();
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { Request, Response } from 'express';
import { errorHandler } from './utils/errorHandler';
import Routes from './routes/index'
import requestLogger from './middlewares/logger';

const app = express();

const allowedOrigins = ['http://localhost:3002'];

app.use(cors({
    origin: allowedOrigins,
    credentials: true,
}));

app.use(express.json())
app.use(cookieParser())
app.use(express.urlencoded({ extended: true }))
app.use(requestLogger)

app.use('/api/v1', Routes)

app.get('/', (req: Request, res: Response) => {
    res.send('Hello World!')
})

app.use(errorHandler)


export default app;