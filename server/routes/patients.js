import express from 'express';
import { getPatients, getPatientById, createPatient, updatePatient, deletePatient } from '../controllers/patientController.js';
import authMiddleware from '../middleware/authMiddleware.js';
import requireRole from '../middleware/requireRole.js';

const router = express.Router();
router.use(authMiddleware);

router.get('/', getPatients);
router.get('/:id', getPatientById);
router.post('/', requireRole('Manager', 'Front Office Staff'), createPatient);
router.put('/:id', updatePatient);
router.delete('/:id', requireRole('Manager'), deletePatient);

export default router;