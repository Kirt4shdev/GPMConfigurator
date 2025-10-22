import { Router } from 'express';
import {
  getAll,
  getById,
  create,
  update,
  remove,
  addSensor,
  updateSensor,
  removeSensor,
} from './poas.controller';
import { authenticate } from '../../middleware/auth';

const router = Router();

router.get('/', authenticate, getAll);
router.get('/:id', authenticate, getById);
router.post('/', authenticate, create);
router.put('/:id', authenticate, update);
router.delete('/:id', authenticate, remove);

// POA sensors
router.post('/:id/sensores', authenticate, addSensor);
router.put('/:id/sensores/:sensorId', authenticate, updateSensor);
router.delete('/:id/sensores/:sensorId', authenticate, removeSensor);

export default router;

