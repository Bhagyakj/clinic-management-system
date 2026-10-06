import express from 'express';
import { getPatients, getPatientById, createPatient, updatePatient, deletePatient } from '../controllers/patientController.js';
import authMiddleware from '../middleware/authMiddleware.js';
import requireRole from '../middleware/requireRole.js';

const router = express.Router();
router.use(authMiddleware); // was missing — every route here was open to anyone with no token

router.get('/', getPatients);
router.get('/:id', getPatientById);
router.post('/', requireRole('Manager', 'Front Office Staff'), createPatient); // per your PDF: only Manager/FOS enroll patients
router.put('/:id', updatePatient); // left open to any logged-in role — doctors/nurses also update patient records (vitals, notes)
router.delete('/:id', requireRole('Manager'), deletePatient);

export default router;
