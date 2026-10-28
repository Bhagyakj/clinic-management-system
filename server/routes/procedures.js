import express from 'express';
import authMiddleware from '../middleware/authMiddleware.js';
import requireRole from '../middleware/requireRole.js';
import { listProcedures, createProcedure, updateProcedure, toggleProcedureStatus } from '../controllers/procedureController.js';

const router = express.Router();
router.use(authMiddleware);

router.get('/', listProcedures);
router.post('/', requireRole('Manager'), createProcedure);
router.put('/:id', requireRole('Manager'), updateProcedure);
router.patch('/:id/status', requireRole('Manager'), toggleProcedureStatus);

export default router;
