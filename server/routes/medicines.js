import express from 'express';
import authMiddleware from '../middleware/authMiddleware.js';
import requireRole from '../middleware/requireRole.js';
import { listMedicines, createMedicine, updateMedicine, toggleMedicineStatus } from '../controllers/medicineController.js';

const router = express.Router();
router.use(authMiddleware);

router.get('/', listMedicines);
router.post('/', requireRole('Manager'), createMedicine);
router.put('/:id', requireRole('Manager'), updateMedicine);
router.patch('/:id/status', requireRole('Manager'), toggleMedicineStatus);

export default router;
