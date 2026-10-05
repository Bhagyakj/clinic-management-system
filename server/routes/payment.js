import express from 'express';
import authMiddleware from '../middleware/authMiddleware.js';
import requireRole from '../middleware/requireRole.js';
import { createBill, listPayments, collectPayment } from '../controllers/paymentController.js';

const router = express.Router();
router.use(authMiddleware);

router.get('/', listPayments);
router.post('/', requireRole('Manager', 'Front Office Staff', 'Nurse'), createBill);
router.post('/:id/collect', requireRole('Manager', 'Front Office Staff'), collectPayment);

export default router;
