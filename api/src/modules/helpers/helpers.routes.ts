import { Router } from 'express';
import {
  calculateCablePrice,
  estimateInstallation,
  getInstallationConfig,
  updateInstallationConfig,
} from './helpers.controller';
import { authenticate, requireAdmin } from '../../middleware/auth';

const router = Router();

router.get('/precios/cable', authenticate, calculateCablePrice);
router.get('/instalacion/estimacion', authenticate, estimateInstallation);
router.get('/instalacion/config', authenticate, getInstallationConfig);
router.put('/instalacion/config', authenticate, requireAdmin, updateInstallationConfig);

export default router;

