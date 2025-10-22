import { Router } from 'express';
import { getAll, create, update, remove } from './hotspots.controller';
import { authenticate, requireAdmin } from '../../middleware/auth';

const router = Router();

router.get('/', authenticate, getAll);
router.post('/', authenticate, requireAdmin, create);
router.put('/:key', authenticate, requireAdmin, update);
router.delete('/:key', authenticate, requireAdmin, remove);

export default router;

