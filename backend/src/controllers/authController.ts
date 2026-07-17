import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { Employee } from '../models/Employee';
import ImageKit from 'imagekit';

let imagekit: ImageKit | null = null;

const getImageKitInstance = (): ImageKit => {
  if (!imagekit) {
    imagekit = new ImageKit({
      publicKey: process.env.IMAGEKIT_PUBLIC_KEY!,
      privateKey: process.env.IMAGEKIT_PRIVATE_KEY!,
      urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT!,
    });
  }
  return imagekit;
};

const generateToken = (id: string, role: string): string => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET || 'fallback_secret', {
    expiresIn: '30d',
  });
};

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { identity, password } = req.body;

    if (!identity || !password) {
      res.status(400).json({ success: false, message: 'Please provide credentials' });
      return;
    }

    // Support logging in via Email or Employee ID (username) - exclude soft-deleted
    const employee = await Employee.findOne({
      deletedAt: null,
      $or: [
        { email: identity.toLowerCase().trim() },
        { employeeId: identity.trim() }
      ]
    });

    if (!employee) {
      res.status(401).json({ success: false, message: 'Invalid credentials' });
      return;
    }

    if (employee.status === 'Inactive') {
      res.status(403).json({ success: false, message: 'Your account is deactivated' });
      return;
    }

    const isMatch = await employee.comparePassword(password);
    if (!isMatch) {
      res.status(401).json({ success: false, message: 'Invalid credentials' });
      return;
    }

    const token = generateToken(employee._id.toString(), employee.role);

    // Set cookie (optional, but good practice for SPA)
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
      sameSite: 'lax'
    });

    res.status(200).json({
      success: true,
      token,
      user: {
        id: employee._id,
        employeeId: employee.employeeId,
        name: employee.name,
        email: employee.email,
        role: employee.role,
        profileImage: employee.profileImage,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, message: 'Server error during login' });
  }
};

export const logout = async (_req: Request, res: Response): Promise<void> => {
  res.clearCookie('token');
  res.status(200).json({ success: true, message: 'Successfully logged out' });
};

export const getImageKitAuth = async (_req: Request, res: Response): Promise<void> => {
  try {
    if (!process.env.IMAGEKIT_PRIVATE_KEY || !process.env.IMAGEKIT_PUBLIC_KEY || !process.env.IMAGEKIT_URL_ENDPOINT) {
      res.status(500).json({ success: false, message: 'ImageKit credentials not configured in backend .env' });
      return;
    }
    const ik = getImageKitInstance();
    const authenticationParameters = ik.getAuthenticationParameters();
    res.json({
      ...authenticationParameters,
      publicKey: process.env.IMAGEKIT_PUBLIC_KEY,
    });
  } catch (error: any) {
    console.error('ImageKit auth error:', error);
    res.status(500).json({ success: false, message: 'Failed to generate ImageKit authentication parameters' });
  }
};
