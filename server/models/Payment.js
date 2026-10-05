import mongoose from 'mongoose';

const purposeSchema = new mongoose.Schema({
  description: { type: String, required: true },
  amount: { type: Number, required: true },
  // Added — needed so a part-payment can be tracked per charge, not just
  // for the bill as a whole. Without this, "patient paid ₹1500 of ₹3000"
  // can't tell you which specific charge is still owed.
  paid: { type: Number, default: 0 },
}, { _id: false });

const roomChargeSchema = new mongoose.Schema({
  roomId: { type: mongoose.Schema.Types.ObjectId, ref: 'Room' },
  date: { type: Date },
}, { _id: false });

const medicineLineSchema = new mongoose.Schema({
  medicineId: { type: mongoose.Schema.Types.ObjectId, ref: 'Medicine' },
  count: { type: Number, required: true },
  rate: { type: Number, required: true },
}, { _id: false });

const paymentSchema = new mongoose.Schema({
  patientId: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient', required: true },
  appointmentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Appointment' },
  room: [roomChargeSchema],
  purpose: [purposeSchema],
  medicines: [medicineLineSchema],

  totalAmount: { type: Number, required: true },
  // Added — running total actually collected across all lines. Lets the
  // controller recompute `status` without re-summing every purpose/medicine
  // line on every read.
  paidAmount: { type: Number, default: 0 },

  status: { type: String, enum: ['pending', 'partial', 'paid'], default: 'pending' },
  paymentInfo: {
    method: { type: String, enum: ['Cash', 'UPI', 'Card'] },
    transactionId: { type: String },
    date: { type: Date },
  },
  paidDate: { type: Date },
}, { timestamps: true });

export default mongoose.model('Payment', paymentSchema);
