import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { JWTPayload } from '../types';

declare global {
    namespace Express {
        interface Request {
            user?: JWTPayload;
        }
    }
}

export const verifyToken = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    const token = req.cookies.accessToken;

    if (!token) {
        res.status(401).json({ error: 'No token provided. Authorization denied.' });
        return;
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET as string);

        if (typeof decoded === 'string') {
        res.status(401).json({ error: 'Malformed token payload.' });
        return;
    }

    const payload = decoded as JWTPayload;
    
    if (!payload.userId || !payload.email) {
        res.status(401).json({ error: 'Invalid token payload.' });
        return;
    }

    req.user = payload;
    next();
    
    } catch (error) {
        res.status(401).json({ error: 'Invalid or expired token. Authorization denied.' });
    }
};