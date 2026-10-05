import express from 'express';
import authMiddleware from '../middleware/authMiddleware.js';
import requireRole from '../middleware/requireRole.js';
import { bookAppointment, listAppointments, updateAppointmentStatus } from '../controllers/appointmentController.js';

const router = express.Router();
router.use(authMiddleware);

router.get('/', listAppointments);
router.post('/', requireRole('Manager', 'Front Office Staff'), bookAppointment);
router.patch('/:id/status', updateAppointmentStatus);

export default router;
