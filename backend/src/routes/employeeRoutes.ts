import { Router } from 'express';
import {
  createEmployee,
  getEmployees,
  getEmployeeById,
  updateEmployee,
  deleteEmployee,
  getDeletedEmployees,
  restoreEmployee,
  permanentDeleteEmployee,
  getDirectReports,
  patchReportingManager,
  getDashboardStats,
} from '../controllers/employeeController';
import { protect, authorize } from '../middleware/authMiddleware';

const router = Router();

// Protect all employee routes
router.use(protect);

// Dashboard statistics (placed before dynamic ID matches)
router.get('/stats', authorize('Super Admin', 'HR Manager'), getDashboardStats);

// Bin - soft deleted employees (before /:id to avoid route conflict)
router.get('/bin', authorize('Super Admin', 'HR Manager'), getDeletedEmployees);

// General list and creation
router.get('/', getEmployees);
router.post('/', authorize('Super Admin', 'HR Manager'), createEmployee);

// Individual employee management
router.get('/:id', getEmployeeById);
router.put('/:id', updateEmployee);
router.delete('/:id', authorize('Super Admin'), deleteEmployee);

// Bin actions
router.post('/:id/restore', authorize('Super Admin'), restoreEmployee);
router.delete('/:id/permanent', authorize('Super Admin'), permanentDeleteEmployee);

// Hierarchy relationships
router.get('/:id/reportees', getDirectReports);
router.patch('/:id/manager', authorize('Super Admin', 'HR Manager'), patchReportingManager);

export default router;
