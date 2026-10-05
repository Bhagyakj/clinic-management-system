import Room from '../models/Room.js';

// GET /api/rooms
export const listRooms = async (req, res) => {
  try {
    const { status } = req.query;
    const filter = status ? { status } : {};
    res.json(await Room.find(filter).sort({ roomNumber: 1 }));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// POST /api/rooms — Manager only
export const createRoom = async (req, res) => {
  try {
    const { roomNumber, type, capacity, perNightCost, facilities } = req.body;
    const room = await Room.create({ roomNumber, type, capacity, perNightCost, facilities, status: 'available' });
    res.status(201).json(room);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// PATCH /api/rooms/:id/status  { status: 'available' | 'occupied' | 'maintenance' }
// Occupied/available are normally set by the admission controller, not by
// hand — this is mainly for marking a room under maintenance.
export const updateRoomStatus = async (req, res) => {
  try {
    const room = await Room.findByIdAndUpdate(req.params.id, { status: req.body.status }, { new: true });
    if (!room) return res.status(404).json({ message: 'Room not found' });
    res.json(room);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
