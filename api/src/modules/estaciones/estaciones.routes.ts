import { Router } from 'express';
import {
  getAll,
  getById,
  create,
  update,
  remove,
  updateHotspotMap,
  addOrUpdateSelection,
  removeSelection,
  addPanelOption,
  removePanelOption,
} from './estaciones.controller';
import { authenticate } from '../../middleware/auth';

const router = Router();

router.get('/', authenticate, getAll);
router.get('/:id', authenticate, getById);
router.post('/', authenticate, create);
router.put('/:id', authenticate, update);
router.delete('/:id', authenticate, remove);

// Hotspot map
router.put('/:id/hotspot-map', authenticate, updateHotspotMap);

// Sensor selections
router.post('/:id/selecciones', authenticate, addOrUpdateSelection);
router.delete('/:id/selecciones/:selectionId', authenticate, removeSelection);

// Panel options
router.post('/:id/panel-options', authenticate, addPanelOption);
router.delete('/:id/panel-options/:panelOptionId', authenticate, removePanelOption);

export default router;

