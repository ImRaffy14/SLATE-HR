import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import prisma from '../config/prisma';
import { UserRole } from '@prisma/client';

// Use the same type declaration as bearerAuth to avoid conflicts
// The type is already declared in bearerAuth.ts, so we don't redeclare it here
// If needed, we can extend it, but for consistency, we'll use the same structure

export const verifyToken = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    // Check Authorization header first, then fallback to cookie
    let token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
        // Fallback to cookie if Authorization header is not present
        token = req.cookies?.accessToken;
    }

    if (!token) {
        res.status(401).json({ error: 'No token provided. Authorization denied.' });
        return;
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as { 
            userId: string;
            email?: string;
        };

        if (typeof decoded === 'string') {
            res.status(401).json({ error: 'Malformed token payload.' });
            return;
        }

        if (!decoded.userId) {
            res.status(401).json({ error: 'Invalid token payload.' });
            return;
        }

        // Fetch user from database to get role (consistent with bearerAuth)
        const user = await prisma.user.findUnique({
            where: { id: decoded.userId },
            select: { id: true, role: true }
        });

        if (!user) {
            res.status(401).json({ error: 'User not found.' });
            return;
        }

        // Set both userId and user to match bearerAuth structure
        req.userId = user.id;
        req.user = {
            id: user.id,
            role: user.role
        };
        next();
    
    } catch (error) {
        if (error instanceof jwt.TokenExpiredError) {
            res.status(401).json({ error: 'Token Expired', message: 'Token has expired' });
            return;
        }
        
        if (error instanceof jwt.JsonWebTokenError) {
            res.status(401).json({ error: 'Invalid Token', message: 'Malformed token' });
            return;
        }

        res.status(401).json({ error: 'Invalid or expired token. Authorization denied.' });
    }
};