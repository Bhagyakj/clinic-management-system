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
    weight: { type: String, default: '—' },
    height: { type: String, default: '—' },
  },
  consultations: [{
    createdAt: { type: Date, default: Date.now },
    doctorId: { type: String, default: 'unknown' },
    doctorName: { type: String, default: 'Doctor' },
    assignedSeniorName: { type: String, default: '—' },
    vitals: {
      temp: { type: String, default: '—' },
      bp: { type: String, default: '—' },
      pulse: { type: String, default: '—' },
      resp: { type: String, default: '—' },
      weight: { type: String, default: '—' },
      height: { type: String, default: '—' },
    },
    complaints: { type: String, default: '' },
    observations: { type: String, default: '' },
    diagnosis: { type: String, default: '' },
    status: { type: String, default: 'Open' },
  }],
  admitted: { type: Boolean, default: false },
  admissionDays: { type: Number, default: null },
  room: { type: String, default: null },
  history: [{
    d: { type: String },
    t: { type: String },
    s: { type: String },
  }],
  prescriptions: [{
    createdAt: { type: Date, default: Date.now },
    doctorName: { type: String, default: 'Doctor' },
    medicines: [{
      name: { type: String, default: '' },
      dosage: { type: String, default: '' },
    }],
    notes: { type: String, default: '' },
  }],
  nurseCharges: [{
    createdAt: { type: Date, default: Date.now },
    createdBy: { type: String, default: 'Nurse' },
    category: { type: String, default: 'Medicine' },
    description: { type: String, default: '' },
    amount: { type: Number, default: 0 },
    note: { type: String, default: '' },
  }],
  procedures: [{
    createdAt: { type: Date, default: Date.now },
    doctorName: { type: String, default: 'Doctor' },
    name: { type: String, default: '' },
    instructions: { type: String, default: '' },
  }],
  appointmentHistory: [{
    date: { type: String },
    time: { type: String },
    doctor: { type: String },
    status: { type: String },
  }],
}, { timestamps: true });

export default mongoose.model('Patient', patientSchema);
