import { Router } from 'express';
import { getAll, getById, create, update, remove } from './proyectos.controller';
import { authenticate } from '../../middleware/auth';

const router = Router();

router.get('/', authenticate, getAll);
router.get('/:id', authenticate, getById);
router.post('/', authenticate, create);
router.put('/:id', authenticate, update);
router.delete('/:id', authenticate, remove);

export default router;

