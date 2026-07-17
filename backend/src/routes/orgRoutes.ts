import { Router } from 'express';
import { getOrgTree } from '../controllers/employeeController';
import { protect } from '../middleware/authMiddleware';

const router = Router();

router.get('/tree', protect, getOrgTree);

export default router;
