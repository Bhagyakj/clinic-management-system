import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  EmployeeId: { type: String, required: true, unique: true },
  name: String,
  designation: { 
    type: String, 
    enum: ['Manager','Front Office Staff','Pharmacist','Nurse','Junior Doctor','Senior Doctor'],
    required: true
  },
  passwordHash: { type: String, required: true },
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
