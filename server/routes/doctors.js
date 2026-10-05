import express from 'express';
import authMiddleware from '../middleware/authMiddleware.js';
import requireRole from '../middleware/requireRole.js';
import { listDoctors, createDoctor } from '../controllers/doctorController.js';

const router = express.Router();
router.use(authMiddleware);

router.get('/', listDoctors);
router.post('/', requireRole('Manager'), createDoctor);

export default router;
