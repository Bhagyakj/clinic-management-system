import mongoose from 'mongoose';

const procedureSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  description: { type: String, default: '' },
  unitCost: { type: Number, default: 0 },
  status: { type: String, enum: ['Active', 'Archived'], default: 'Active' },
}, { timestamps: true });

export default mongoose.model('Procedure', procedureSchema);
