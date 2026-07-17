import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { Employee, IEmployee } from '../models/Employee';

export interface AuthRequest extends Request {
  user?: IEmployee;
}

export const protect = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  let token: string | undefined;

  // Read from Authorization header: Bearer <token>
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  } 
  // Alternatively, read from cookie if implemented
  else if (req.cookies && req.cookies.token) {
    token = req.cookies.token;
  }

  if (!token) {
    res.status(401).json({ success: false, message: 'Not authorized, token missing' });
    return;
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret') as {
      id: string;
      role: string;
    };

    const user = await Employee.findById(decoded.id).select('-password');
    if (!user) {
      res.status(401).json({ success: false, message: 'Not authorized, user not found' });
      return;
    }

    if (user.status === 'Inactive') {
      res.status(403).json({ success: false, message: 'Your account is deactivated' });
      return;
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('JWT Verification Error:', error);
    res.status(401).json({ success: false, message: 'Not authorized, token invalid or expired' });
  }
};

export const authorize = (...roles: Array<'Super Admin' | 'HR Manager' | 'Employee'>) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Not authorized' });
      return;
    }

    if (!roles.includes(req.user.role)) {
      res.status(403).json({
        success: false,
        message: `Forbidden: Access restricted to [${roles.join(', ')}]`,
      });
      return;
    }

    next();
  };
};
