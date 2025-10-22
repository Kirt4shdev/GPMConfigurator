import { Router } from 'express';
import { authenticate, requireAdmin } from '../../middleware/auth';
import * as adminController from './admin.controller';

const router = Router();

// All admin routes require authentication and admin role
router.use(authenticate, requireAdmin);

// Users management
router.get('/usuarios', adminController.getUsers);
router.put('/usuarios/:id/role', adminController.updateUserRole);

// Data import/export
router.get('/export', adminController.exportData);
router.post('/import', adminController.importData);

// Installation config
router.get('/config/instalacion', adminController.getInstallationConfig);
router.put('/config/instalacion', adminController.updateInstallationConfig);

// Overview/stats
router.get('/overview', adminController.getOverview);

export default router;

