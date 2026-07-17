"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getImageKitAuth = exports.logout = exports.login = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const Employee_1 = require("../models/Employee");
const imagekit_1 = __importDefault(require("imagekit"));
let imagekit = null;
const getImageKitInstance = () => {
    if (!imagekit) {
        imagekit = new imagekit_1.default({
            publicKey: process.env.IMAGEKIT_PUBLIC_KEY,
            privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
            urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT,
        });
    }
    return imagekit;
};
const generateToken = (id, role) => {
    return jsonwebtoken_1.default.sign({ id, role }, process.env.JWT_SECRET || 'fallback_secret', {
        expiresIn: '30d',
    });
};
const login = async (req, res) => {
    try {
        const { identity, password } = req.body;
        if (!identity || !password) {
            res.status(400).json({ success: false, message: 'Please provide credentials' });
            return;
        }
        // Support logging in via Email or Employee ID (username) - exclude soft-deleted
        const employee = await Employee_1.Employee.findOne({
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
    }
    catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ success: false, message: 'Server error during login' });
    }
};
exports.login = login;
const logout = async (_req, res) => {
    res.clearCookie('token');
    res.status(200).json({ success: true, message: 'Successfully logged out' });
};
exports.logout = logout;
const getImageKitAuth = async (_req, res) => {
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
    }
    catch (error) {
        console.error('ImageKit auth error:', error);
        res.status(500).json({ success: false, message: 'Failed to generate ImageKit authentication parameters' });
    }
};
exports.getImageKitAuth = getImageKitAuth;
