import { Router } from 'express';
import { getAll, getById, create, update, remove } from './sensores.controller';
import { authenticate, requireAdmin } from '../../middleware/auth';

const router = Router();

router.get('/', authenticate, getAll);
router.get('/:id', authenticate, getById);
router.post('/', authenticate, requireAdmin, create);
router.put('/:id', authenticate, requireAdmin, update);
router.delete('/:id', authenticate, requireAdmin, remove);

export default router;

