"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDashboardStats = exports.getOrgTree = exports.patchReportingManager = exports.getDirectReports = exports.permanentDeleteEmployee = exports.restoreEmployee = exports.getDeletedEmployees = exports.deleteEmployee = exports.updateEmployee = exports.getEmployeeById = exports.getEmployees = exports.createEmployee = void 0;
const Employee_1 = require("../models/Employee");
const hierarchy_1 = require("../utils/hierarchy");
const mongoose_1 = require("mongoose");
// Create Employee
const createEmployee = async (req, res) => {
    try {
        const { name, email, phone, department, designation, salary, joiningDate, status, role, reportingManager, profileImage, password, } = req.body;
        // RBAC: HR Manager cannot assign the Super Admin role
        if (req.user?.role === 'HR Manager' && role === 'Super Admin') {
            res.status(403).json({ success: false, message: 'HR Managers cannot create Super Admin accounts' });
            return;
        }
        // Required fields check
        if (!name || !email || !phone || !department || !designation || salary === undefined || !joiningDate) {
            res.status(400).json({ success: false, message: 'Please provide all required fields' });
            return;
        }
        // Phone format validation
        const phoneRegex = /^\+?[\d\s\-().]{7,20}$/;
        const digitCount = String(phone).replace(/\D/g, '').length;
        if (!phoneRegex.test(String(phone).trim()) || digitCount < 7 || digitCount > 15) {
            res.status(400).json({ success: false, message: 'Invalid phone number format. Use 7\u201315 digits, optionally with +, spaces, hyphens, or parentheses.' });
            return;
        }
        // Check unique Email and Phone
        const emailExists = await Employee_1.Employee.findOne({ email: email.toLowerCase().trim(), deletedAt: null });
        if (emailExists) {
            res.status(400).json({ success: false, message: 'Email already exists' });
            return;
        }
        const phoneExists = await Employee_1.Employee.findOne({ phone: phone.trim(), deletedAt: null });
        if (phoneExists) {
            res.status(400).json({ success: false, message: 'Phone number already exists' });
            return;
        }
        // Validate reporting manager
        let managerId = null;
        if (reportingManager && reportingManager !== '') {
            if (!mongoose_1.Types.ObjectId.isValid(reportingManager)) {
                res.status(400).json({ success: false, message: 'Invalid Reporting Manager ID' });
                return;
            }
            const managerExists = await Employee_1.Employee.findOne({ _id: reportingManager, deletedAt: null });
            if (!managerExists) {
                res.status(400).json({ success: false, message: 'Reporting Manager not found' });
                return;
            }
            managerId = reportingManager;
        }
        // Generate Sequential Employee ID
        const lastEmployee = await Employee_1.Employee.findOne({ employeeId: { $regex: /^EMP-\d+$/ }, deletedAt: null })
            .sort({ createdAt: -1 })
            .select('employeeId');
        let nextNum = 10001;
        if (lastEmployee && lastEmployee.employeeId) {
            const match = lastEmployee.employeeId.match(/EMP-(\d+)/);
            if (match) {
                nextNum = parseInt(match[1], 10) + 1;
            }
        }
        // Ensure no collision
        let employeeId = `EMP-${nextNum}`;
        while (await Employee_1.Employee.exists({ employeeId, deletedAt: null })) {
            nextNum++;
            employeeId = `EMP-${nextNum}`;
        }
        // Set Default Password if not provided
        const userPassword = password || `emp${nextNum}`;
        const newEmployee = new Employee_1.Employee({
            employeeId,
            name,
            email: email.toLowerCase().trim(),
            phone: phone.trim(),
            department,
            designation,
            salary,
            joiningDate: new Date(joiningDate),
            status: status || 'Active',
            role: role || 'Employee',
            reportingManager: managerId,
            profileImage: profileImage || '',
            password: userPassword,
        });
        await newEmployee.save();
        // Do not return password in response
        const saved = newEmployee.toObject();
        delete saved.password;
        res.status(201).json({ success: true, employee: saved });
    }
    catch (error) {
        console.error('Error creating employee:', error);
        res.status(500).json({ success: false, message: error.message || 'Server error creating employee' });
    }
};
exports.createEmployee = createEmployee;
// Get All Employees (with Search, Filter, and Sort)
const getEmployees = async (req, res) => {
    try {
        const { search, department, role, status, sortBy, sortOrder, page, limit } = req.query;
        const currentUser = req.user;
        if (!currentUser) {
            res.status(401).json({ success: false, message: 'Unauthorized' });
            return;
        }
        // Pagination params
        const pageNum = Math.max(1, parseInt(page) || 1);
        const pageSize = Math.min(50, Math.max(1, parseInt(limit) || 10));
        const skip = (pageNum - 1) * pageSize;
        // Base query filters (exclude soft-deleted)
        const query = { deletedAt: null };
        // RBAC: Employees can only view themselves
        if (currentUser.role === 'Employee') {
            const self = await Employee_1.Employee.findOne({ _id: currentUser._id, deletedAt: null })
                .populate('reportingManager', 'name email employeeId designation')
                .select('-password');
            res.status(200).json({ success: true, employees: self ? [self] : [] });
            return;
        }
        // For Super Admin and HR Manager, build filters
        if (search) {
            const searchRegex = new RegExp(search, 'i');
            query.$or = [
                { name: searchRegex },
                { email: searchRegex },
                { employeeId: searchRegex }
            ];
        }
        if (department) {
            query.department = department;
        }
        if (role) {
            query.role = role;
        }
        if (status) {
            query.status = status;
        }
        const sortField = sortBy || 'name';
        const order = sortOrder === 'desc' ? -1 : 1;
        const sortOptions = {};
        sortOptions[sortField] = order;
        const [employees, total] = await Promise.all([
            Employee_1.Employee.find(query)
                .populate('reportingManager', 'name email employeeId designation')
                .sort(sortOptions)
                .skip(skip)
                .limit(pageSize)
                .select('-password'),
            Employee_1.Employee.countDocuments(query),
        ]);
        res.status(200).json({
            success: true,
            employees,
            pagination: {
                page: pageNum,
                limit: pageSize,
                total,
                totalPages: Math.ceil(total / pageSize),
            },
        });
    }
    catch (error) {
        console.error('Error fetching employees:', error);
        res.status(500).json({ success: false, message: 'Server error fetching employees' });
    }
};
exports.getEmployees = getEmployees;
// Get Single Employee Details
const getEmployeeById = async (req, res) => {
    try {
        const { id } = req.params;
        const currentUser = req.user;
        if (!currentUser) {
            res.status(401).json({ success: false, message: 'Unauthorized' });
            return;
        }
        // RBAC: Employees can only view their own profile
        if (currentUser.role === 'Employee' && currentUser._id.toString() !== id) {
            res.status(403).json({ success: false, message: 'Access denied: You can only view your own profile' });
            return;
        }
        const employee = await Employee_1.Employee.findOne({ _id: id, deletedAt: null })
            .populate('reportingManager', 'name email employeeId designation')
            .select('-password');
        if (!employee) {
            res.status(404).json({ success: false, message: 'Employee not found' });
            return;
        }
        res.status(200).json({ success: true, employee });
    }
    catch (error) {
        console.error('Error fetching employee details:', error);
        res.status(500).json({ success: false, message: 'Server error fetching employee' });
    }
};
exports.getEmployeeById = getEmployeeById;
// Update Employee
const updateEmployee = async (req, res) => {
    try {
        const { id } = req.params;
        const currentUser = req.user;
        if (!currentUser) {
            res.status(401).json({ success: false, message: 'Unauthorized' });
            return;
        }
        const targetEmployee = await Employee_1.Employee.findOne({ _id: id, deletedAt: null });
        if (!targetEmployee) {
            res.status(404).json({ success: false, message: 'Employee not found' });
            return;
        }
        // RBAC: Employees can only update their own profiles (limited fields)
        if (currentUser.role === 'Employee') {
            if (currentUser._id.toString() !== id) {
                res.status(403).json({ success: false, message: 'Access denied: You can only edit your own profile' });
                return;
            }
            // Restrict fields for Employee self-edit
            const { name, email, phone, profileImage, password } = req.body;
            if (name)
                targetEmployee.name = name;
            if (phone)
                targetEmployee.phone = phone;
            if (profileImage !== undefined)
                targetEmployee.profileImage = profileImage;
            if (email && email.toLowerCase().trim() !== targetEmployee.email) {
                const emailExists = await Employee_1.Employee.findOne({ email: email.toLowerCase().trim(), deletedAt: null });
                if (emailExists) {
                    res.status(400).json({ success: false, message: 'Email already in use' });
                    return;
                }
                targetEmployee.email = email.toLowerCase().trim();
            }
            if (password && password.trim() !== '') {
                targetEmployee.password = password;
            }
            await targetEmployee.save();
            const updated = targetEmployee.toObject();
            delete updated.password;
            res.status(200).json({ success: true, employee: updated });
            return;
        }
        // RBAC: HR Manager restrictions
        if (currentUser.role === 'HR Manager') {
            // HR cannot edit Super Admin profiles
            if (targetEmployee.role === 'Super Admin') {
                res.status(403).json({ success: false, message: 'HR Managers cannot edit Super Admin profiles' });
                return;
            }
            // HR cannot elevate someone to Super Admin or demote a Super Admin
            if (req.body.role === 'Super Admin') {
                res.status(403).json({ success: false, message: 'HR Managers cannot assign the Super Admin role' });
                return;
            }
        }
        // Super Admin & HR Manager flow (updating full fields)
        const { name, email, phone, department, designation, salary, joiningDate, status, role, reportingManager, profileImage, password, } = req.body;
        // Check unique email & phone if changed
        if (email && email.toLowerCase().trim() !== targetEmployee.email) {
            const emailExists = await Employee_1.Employee.findOne({ email: email.toLowerCase().trim(), deletedAt: null });
            if (emailExists) {
                res.status(400).json({ success: false, message: 'Email already exists' });
                return;
            }
            targetEmployee.email = email.toLowerCase().trim();
        }
        if (phone && phone.trim() !== targetEmployee.phone) {
            // Validate format before uniqueness check
            const phoneRegex = /^\+?[\d\s\-().]{7,20}$/;
            const digitCount = String(phone).replace(/\D/g, '').length;
            if (!phoneRegex.test(String(phone).trim()) || digitCount < 7 || digitCount > 15) {
                res.status(400).json({ success: false, message: 'Invalid phone number format. Use 7\u201315 digits, optionally with +, spaces, hyphens, or parentheses.' });
                return;
            }
            const phoneExists = await Employee_1.Employee.findOne({ phone: phone.trim(), deletedAt: null });
            if (phoneExists) {
                res.status(400).json({ success: false, message: 'Phone number already exists' });
                return;
            }
            targetEmployee.phone = phone.trim();
        }
        // Circular Reporting Check if manager is changing
        if (reportingManager !== undefined && reportingManager !== String(targetEmployee.reportingManager || '')) {
            let managerId = null;
            if (reportingManager && reportingManager !== '') {
                if (!mongoose_1.Types.ObjectId.isValid(reportingManager)) {
                    res.status(400).json({ success: false, message: 'Invalid Reporting Manager ID' });
                    return;
                }
                // Loop check
                const isCircular = await (0, hierarchy_1.willCreateCircularReporting)(id, reportingManager);
                if (isCircular) {
                    res.status(400).json({
                        success: false,
                        message: 'Circular reporting detected. This manager assignment would cause a reporting loop.',
                    });
                    return;
                }
                managerId = reportingManager;
            }
            targetEmployee.reportingManager = managerId;
        }
        // Update other fields
        if (name)
            targetEmployee.name = name;
        if (department)
            targetEmployee.department = department;
        if (designation)
            targetEmployee.designation = designation;
        if (salary !== undefined)
            targetEmployee.salary = salary;
        if (joiningDate)
            targetEmployee.joiningDate = new Date(joiningDate);
        if (status)
            targetEmployee.status = status;
        if (role)
            targetEmployee.role = role;
        if (profileImage !== undefined)
            targetEmployee.profileImage = profileImage;
        if (password && password.trim() !== '') {
            targetEmployee.password = password;
        }
        await targetEmployee.save();
        const updated = targetEmployee.toObject();
        delete updated.password;
        res.status(200).json({ success: true, employee: updated });
    }
    catch (error) {
        console.error('Error updating employee:', error);
        res.status(500).json({ success: false, message: error.message || 'Server error updating employee' });
    }
};
exports.updateEmployee = updateEmployee;
// Soft Delete Employee (Super Admin only) - moves to Bin
const deleteEmployee = async (req, res) => {
    try {
        const { id } = req.params;
        const targetEmployee = await Employee_1.Employee.findOne({ _id: id, deletedAt: null });
        if (!targetEmployee) {
            res.status(404).json({ success: false, message: 'Employee not found' });
            return;
        }
        // Prevent deleting oneself
        if (req.user?._id.toString() === id) {
            res.status(400).json({ success: false, message: 'You cannot delete your own account' });
            return;
        }
        // If deleting, set any employee reporting to this manager to report to null instead
        await Employee_1.Employee.updateMany({ reportingManager: id }, { reportingManager: null });
        // Soft delete - set deletedAt timestamp
        targetEmployee.deletedAt = new Date();
        await targetEmployee.save();
        res.status(200).json({ success: true, message: 'Employee moved to bin successfully. Hierarchy auto-adjusted.' });
    }
    catch (error) {
        console.error('Error deleting employee:', error);
        res.status(500).json({ success: false, message: 'Server error deleting employee' });
    }
};
exports.deleteEmployee = deleteEmployee;
// Get Bin - Soft Deleted Employees (Super Admin only)
const getDeletedEmployees = async (req, res) => {
    try {
        const { search, page, limit } = req.query;
        const pageNum = Math.max(1, parseInt(page) || 1);
        const pageSize = Math.min(50, Math.max(1, parseInt(limit) || 10));
        const skip = (pageNum - 1) * pageSize;
        const query = { deletedAt: { $ne: null } };
        if (search) {
            const searchRegex = new RegExp(search, 'i');
            query.$or = [
                { name: searchRegex },
                { email: searchRegex },
                { employeeId: searchRegex },
            ];
        }
        const [employees, total] = await Promise.all([
            Employee_1.Employee.find(query)
                .sort({ deletedAt: -1 })
                .skip(skip)
                .limit(pageSize)
                .select('-password -__v'),
            Employee_1.Employee.countDocuments(query),
        ]);
        res.status(200).json({
            success: true,
            employees,
            pagination: {
                page: pageNum,
                limit: pageSize,
                total,
                totalPages: Math.ceil(total / pageSize),
            },
        });
    }
    catch (error) {
        console.error('Error fetching bin:', error);
        res.status(500).json({ success: false, message: 'Server error fetching bin' });
    }
};
exports.getDeletedEmployees = getDeletedEmployees;
// Restore Employee from Bin (Super Admin only)
const restoreEmployee = async (req, res) => {
    try {
        const { id } = req.params;
        const targetEmployee = await Employee_1.Employee.findOne({ _id: id, deletedAt: { $ne: null } });
        if (!targetEmployee) {
            res.status(404).json({ success: false, message: 'Employee not found in bin' });
            return;
        }
        // Check that the email doesn't conflict with an active employee
        const emailConflict = await Employee_1.Employee.findOne({ email: targetEmployee.email, deletedAt: null });
        if (emailConflict) {
            res.status(400).json({ success: false, message: 'Cannot restore: another active employee already uses this email' });
            return;
        }
        targetEmployee.deletedAt = null;
        await targetEmployee.save();
        res.status(200).json({ success: true, message: 'Employee restored successfully' });
    }
    catch (error) {
        console.error('Error restoring employee:', error);
        res.status(500).json({ success: false, message: 'Server error restoring employee' });
    }
};
exports.restoreEmployee = restoreEmployee;
// Permanent Delete Employee from Bin (Super Admin only)
const permanentDeleteEmployee = async (req, res) => {
    try {
        const { id } = req.params;
        const targetEmployee = await Employee_1.Employee.findOne({ _id: id, deletedAt: { $ne: null } });
        if (!targetEmployee) {
            res.status(404).json({ success: false, message: 'Employee not found in bin' });
            return;
        }
        await Employee_1.Employee.findByIdAndDelete(id);
        res.status(200).json({ success: true, message: 'Employee permanently deleted' });
    }
    catch (error) {
        console.error('Error permanently deleting employee:', error);
        res.status(500).json({ success: false, message: 'Server error permanently deleting employee' });
    }
};
exports.permanentDeleteEmployee = permanentDeleteEmployee;
// Get Direct Reports for a specific Employee
const getDirectReports = async (req, res) => {
    try {
        const { id } = req.params;
        const reportees = await Employee_1.Employee.find({ reportingManager: id, status: 'Active', deletedAt: null })
            .select('name email employeeId designation department profileImage status');
        res.status(200).json({ success: true, reportees });
    }
    catch (error) {
        console.error('Error fetching direct reports:', error);
        res.status(500).json({ success: false, message: 'Server error fetching direct reports' });
    }
};
exports.getDirectReports = getDirectReports;
// Patch reporting manager (Super Admin only - but we can allow HR too as they have Create/Edit)
const patchReportingManager = async (req, res) => {
    try {
        const { id } = req.params;
        const { reportingManagerId } = req.body;
        const targetEmployee = await Employee_1.Employee.findById(id);
        if (!targetEmployee) {
            res.status(404).json({ success: false, message: 'Employee not found' });
            return;
        }
        let managerId = null;
        if (reportingManagerId && reportingManagerId !== '') {
            if (!mongoose_1.Types.ObjectId.isValid(reportingManagerId)) {
                res.status(400).json({ success: false, message: 'Invalid Manager ID' });
                return;
            }
            const isCircular = await (0, hierarchy_1.willCreateCircularReporting)(id, reportingManagerId);
            if (isCircular) {
                res.status(400).json({
                    success: false,
                    message: 'Circular reporting detected. This assignment is blocked.',
                });
                return;
            }
            managerId = reportingManagerId;
        }
        targetEmployee.reportingManager = managerId;
        await targetEmployee.save();
        res.status(200).json({
            success: true,
            message: 'Reporting manager updated successfully',
            employee: {
                _id: targetEmployee._id,
                name: targetEmployee.name,
                reportingManager: targetEmployee.reportingManager,
            },
        });
    }
    catch (error) {
        console.error('Error updating reporting manager:', error);
        res.status(500).json({ success: false, message: 'Server error updating manager' });
    }
};
exports.patchReportingManager = patchReportingManager;
// Get Full Hierarchy Tree
const getOrgTree = async (_req, res) => {
    try {
        // Only active, non-deleted employees are constructed in the tree
        const employees = await Employee_1.Employee.find({ status: 'Active', deletedAt: null })
            .select('name email phone employeeId designation department role status profileImage reportingManager')
            .lean();
        const tree = (0, hierarchy_1.buildOrgTree)(employees);
        res.status(200).json({ success: true, tree });
    }
    catch (error) {
        console.error('Error constructing tree:', error);
        res.status(500).json({ success: false, message: 'Server error building organizational tree' });
    }
};
exports.getOrgTree = getOrgTree;
// Get Dashboard Statistics
const getDashboardStats = async (_req, res) => {
    try {
        const deletedCount = await Employee_1.Employee.countDocuments({ deletedAt: { $ne: null } });
        const totalEmployees = await Employee_1.Employee.countDocuments({ deletedAt: null });
        const activeEmployees = await Employee_1.Employee.countDocuments({ status: 'Active', deletedAt: null });
        const inactiveEmployees = await Employee_1.Employee.countDocuments({ status: 'Inactive', deletedAt: null });
        const departments = await Employee_1.Employee.distinct('department', { deletedAt: null });
        res.status(200).json({
            success: true,
            stats: {
                totalEmployees,
                activeEmployees,
                inactiveEmployees,
                departmentCount: departments.length,
                deletedCount,
            },
        });
    }
    catch (error) {
        console.error('Error fetching dashboard stats:', error);
        res.status(500).json({ success: false, message: 'Server error fetching dashboard stats' });
    }
};
exports.getDashboardStats = getDashboardStats;
