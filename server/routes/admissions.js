import express from 'express';
import authMiddleware from '../middleware/authMiddleware.js';
import requireRole from '../middleware/requireRole.js';
import { listAdmissions, admitPatient, dischargePatient } from '../controllers/admissionController.js';

const router = express.Router();
router.use(authMiddleware);

router.get('/', listAdmissions);
router.post('/', requireRole('Manager', 'Front Office Staff'), admitPatient);
router.post('/:id/discharge', requireRole('Manager', 'Front Office Staff'), dischargePatient);

export default router;
