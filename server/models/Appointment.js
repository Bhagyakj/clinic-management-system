import mongoose from 'mongoose';

const appointmentSchema = new mongoose.Schema({
  patientId: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient', required: true },
  doctorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Doctor', required: true },
  date: { type: Date, required: true },
  time: { type: String, required: true },

  // Not in your original list, but the frontend needs this for its status
  // badges (confirmed / waiting / completed / cancelled).
  status: {
    type: String,
    enum: ['scheduled', 'confirmed', 'completed', 'cancelled'],
    default: 'scheduled',
  },

  notes: { type: String },
}, { timestamps: true });

export default mongoose.model('Appointment', appointmentSchema);
