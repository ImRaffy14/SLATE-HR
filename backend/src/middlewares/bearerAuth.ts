import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import prisma from '../config/prisma';
import { UserRole } from '@prisma/client';

declare global {
  namespace Express {
    interface Request {
      userId?: string;
      user?: {
        id: string;
        role: UserRole;
      };
    }
  }
}

export const bearerAuth = async (
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
    res.status(401).json({ 
      error: 'Unauthorized',
      message: 'Unauthorized access, token not provided' 
    });
    return;
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { 
      userId: string 
    };

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { id: true, role: true }
    });

    if (!user) {
      res.status(401).json({ 
        error: 'Invalid Token',
        message: 'User not found' 
      });
      return;
    }

    req.userId = user.id;
    req.user = {
      id: user.id,
      role: user.role
    };
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