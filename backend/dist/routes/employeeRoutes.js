"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const employeeController_1 = require("../controllers/employeeController");
const authMiddleware_1 = require("../middleware/authMiddleware");
const router = (0, express_1.Router)();
// Protect all employee routes
router.use(authMiddleware_1.protect);
// Dashboard statistics (placed before dynamic ID matches)
router.get('/stats', (0, authMiddleware_1.authorize)('Super Admin', 'HR Manager'), employeeController_1.getDashboardStats);
// Bin - soft deleted employees (before /:id to avoid route conflict)
router.get('/bin', (0, authMiddleware_1.authorize)('Super Admin', 'HR Manager'), employeeController_1.getDeletedEmployees);
// General list and creation
router.get('/', employeeController_1.getEmployees);
router.post('/', (0, authMiddleware_1.authorize)('Super Admin', 'HR Manager'), employeeController_1.createEmployee);
// Individual employee management
router.get('/:id', employeeController_1.getEmployeeById);
router.put('/:id', employeeController_1.updateEmployee);
router.delete('/:id', (0, authMiddleware_1.authorize)('Super Admin'), employeeController_1.deleteEmployee);
// Bin actions
router.post('/:id/restore', (0, authMiddleware_1.authorize)('Super Admin'), employeeController_1.restoreEmployee);
router.delete('/:id/permanent', (0, authMiddleware_1.authorize)('Super Admin'), employeeController_1.permanentDeleteEmployee);
// Hierarchy relationships
router.get('/:id/reportees', employeeController_1.getDirectReports);
router.patch('/:id/manager', (0, authMiddleware_1.authorize)('Super Admin', 'HR Manager'), employeeController_1.patchReportingManager);
exports.default = router;
