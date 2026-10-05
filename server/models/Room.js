import mongoose from 'mongoose';

const roomSchema = new mongoose.Schema({
  roomNumber: { type: String, required: true, unique: true },
  type: { type: String, enum: ['general', 'ICU', 'private'], required: true },
  capacity: { type: Number, default: 1 },
  status: { type: String, enum: ['available', 'occupied', 'maintenance'], default: 'available' },
  // Added — your original PDF's IP_Rooms entity had "Per Night Cost"; without
  // it there's no way to auto-generate the room-rent charge on discharge.
  perNightCost: { type: Number, required: true },
  facilities: [{ type: String }], // e.g. ["TV", "AC", "Bystander Cot"]
}, { timestamps: true });

export default mongoose.model('Room', roomSchema);