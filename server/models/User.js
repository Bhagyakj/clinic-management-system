import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  EmployeeId: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  designation: { 
    type: String, 
    enum: ['Manager','Front Office Staff','Pharmacist','Nurse','Junior Doctor','Senior Doctor'],
    required: true
  },
  dateOfBirth: { type: Date },
  mobile: { type: String },
  email: { type: String, unique: true, sparse: true },
  postalAddress: { type: String },
  aadharNumber: { type: String, unique: true, sparse: true },
  panNumber: { type: String, unique: true, sparse: true },
  passwordHash: { type: String, required: true },
  consultationFee: { type: Number }, // doctors only
  reportingDoctorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // junior doctor reports to senior
}, { timestamps: true });

export default mongoose.model('User', userSchema);
