import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import prisma from '../config/prisma';

declare global {
  namespace Express {
    interface Request {
      userId?: string;
    }
  }
}

export const bearerAuth = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    res.status(401).json({ 
      error: 'Unauthorized',
      message: 'Unathorized access, token not provided' 
    });
    return;
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { 
      userId: string 
    };

    const userExists = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { id: true }
    });

    if (!userExists) {
      res.status(401).json({ 
        error: 'Invalid Token',
        message: 'User not found' 
      });
      return;
    }

    req.userId = decoded.userId;
    next();
  } catch (err) {
    if (err instanceof jwt.TokenExpiredError) {
      res.status(401).json({ 
        error: 'Token Expired',
        message: 'Token has expired' 
      });
      return;
    }
    
    if (err instanceof jwt.JsonWebTokenError) {
      res.status(401).json({ 
        error: 'Invalid Token',
        message: 'Malformed token' 
      });
      return;
    }

    console.error('Authentication error:', err);
    res.status(500).json({ 
      error: 'Authentication Failed' 
    });
  }
};