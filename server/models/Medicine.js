import mongoose from 'mongoose';

const medicineSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  scientificName: { type: String, default: '' },
  unitCost: { type: Number, default: 0 },
  quantity: { type: Number, default: 0 },
  status: { type: String, enum: ['Active', 'Archived'], default: 'Active' },
}, { timestamps: true });

export default mongoose.model('Medicine', medicineSchema);
