import mongoose from 'mongoose';

const doctorSchema = new mongoose.Schema({
  // Links this clinical profile back to the login account in `users`.
  // Not in your original list — without it, nothing connects a Doctor
  // document to the person who actually logs in.
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },

  name: { type: String, required: true },
  specialization: { type: String },
  contact: {
    phone: { type: String },
    email: { type: String },
  },
  department: { type: String },
  appointments: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Appointment' }],
}, { timestamps: true });

export default mongoose.model('Doctor', doctorSchema);
