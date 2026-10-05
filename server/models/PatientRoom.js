import mongoose from 'mongoose';

const patientRoomSchema = new mongoose.Schema({
  patientId: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient', required: true },
  roomId: { type: mongoose.Schema.Types.ObjectId, ref: 'Room', required: true },
  fromDate: { type: Date, required: true },
  toDate: { type: Date }, // null/unset while the patient is still admitted
  // From your original PDF's Admissions entity ("the date up to which room
  // rent is paid") — not in your new field list, kept because Billing needs
  // it to know how many unpaid nights to charge.
  paymentUpto: { type: Date },
}, { timestamps: true });

export default mongoose.model('PatientRoom', patientRoomSchema);
