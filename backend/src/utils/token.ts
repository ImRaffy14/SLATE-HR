import jwt from 'jsonwebtoken';
import { AppError } from './appError';

const JWT_SECRET = process.env.JWT_SECRET

export const generateToken = (payload: Object) => {
    if (!JWT_SECRET) {
        throw new AppError('JWT secret is not defined', 500);
    }
    return jwt.sign(payload, JWT_SECRET, { expiresIn: '1d' });
}