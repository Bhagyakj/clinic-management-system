import mongoose from 'mongoose';

const patientSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true, trim: true },
  name: { type: String, required: true, trim: true },
  gender: { type: String, enum: ['Male', 'Female', 'Other'], required: true },
  age: { type: Number, required: true, min: 0 },
  phone: { type: String, required: true, trim: true },
  type: { type: String, enum: ['OP', 'IP'], default: 'OP' },
  lastVisit: { type: String, default: null },
  doctor: { type: String, default: '—' },
  vitals: {
    temp: { type: String, default: '—' },
    bp: { type: String, default: '—' },
    pulse: { type: String, default: '—' },
    resp: { type: String, default: '—' },
  },
  admitted: { type: Boolean, default: false },
  admissionDays: { type: Number, default: null },
  room: { type: String, default: null },
  history: [{
    d: { type: String },
    t: { type: String },
    s: { type: String },
  }],
  appointmentHistory: [{
    date: { type: String },
    time: { type: String },
    doctor: { type: String },
    status: { type: String },
  }],
}, { timestamps: true });

export default mongoose.model('Patient', patientSchema);
