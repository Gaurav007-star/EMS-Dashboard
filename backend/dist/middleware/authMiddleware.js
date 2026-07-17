"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authorize = exports.protect = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const Employee_1 = require("../models/Employee");
const protect = async (req, res, next) => {
    let token;
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
        const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET || 'fallback_secret');
        const user = await Employee_1.Employee.findById(decoded.id).select('-password');
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
    }
    catch (error) {
        console.error('JWT Verification Error:', error);
        res.status(401).json({ success: false, message: 'Not authorized, token invalid or expired' });
    }
};
exports.protect = protect;
const authorize = (...roles) => {
    return (req, res, next) => {
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
exports.authorize = authorize;
