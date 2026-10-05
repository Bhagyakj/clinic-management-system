import express from 'express';
import authMiddleware from '../middleware/authMiddleware.js';
import requireRole from '../middleware/requireRole.js';
import { listRooms, createRoom, updateRoomStatus } from '../controllers/roomController.js';

const router = express.Router();
router.use(authMiddleware);

router.get('/', listRooms);
router.post('/', requireRole('Manager'), createRoom);
router.patch('/:id/status', requireRole('Manager', 'Front Office Staff'), updateRoomStatus);

export default router;
