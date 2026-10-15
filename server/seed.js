import 'dotenv/config';
import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import User from './models/User.js';
import Doctor from './models/Doctor.js';
import Room from './models/Room.js';
import Patient from './models/Patient.js';

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/clinic';
const PASSWORD = 'test1234'; // same password for every seeded account — change after testing

const USERS = [
  { EmployeeId: 'HSP-2291', name: 'Dr. John', designation: 'Manager' },
  { EmployeeId: 'HSP-1001', name: 'Meera Nair', designation: 'Front Office Staff' },
  { EmployeeId: 'HSP-2005', name: 'Dr. Kavita Menon (SD)', designation: 'Senior Doctor', specialization: 'Internal Medicine', department: 'OPD' },
  { EmployeeId: 'HSP-2003', name: 'Dr. Rahul Sharma (SD)', designation: 'Senior Doctor', specialization: 'Cardiology', department: 'OPD' },
  { EmployeeId: 'HSP-2011', name: 'Dr. Arjun Rao (JD)', designation: 'Junior Doctor', specialization: 'General Medicine', department: 'OPD' },
  { EmployeeId: 'HSP-2012', name: 'Dr. Nisha Verma (JD)', designation: 'Junior Doctor', specialization: 'General Medicine', department: 'OPD' },
  { EmployeeId: 'HSP-2013', name: 'Dr. Amit Joshi (JD)', designation: 'Junior Doctor', specialization: 'Family Medicine', department: 'OPD' },
  { EmployeeId: 'HSP-2014', name: 'Dr. Sneha Iyer (JD)', designation: 'Junior Doctor', specialization: 'Pediatrics', department: 'OPD' },
  { EmployeeId: 'HSP-3001', name: 'Sr. Lissy Thomas', designation: 'Nurse' },
  { EmployeeId: 'HSP-4001', name: 'Ravi Kumar', designation: 'Pharmacist' },
];

const JUNIOR_TO_SENIOR = {
  'HSP-2011': 'HSP-2005',
  'HSP-2012': 'HSP-2005',
  'HSP-2013': 'HSP-2003',
  'HSP-2014': 'HSP-2003',
};

const ROOMS = [
  { roomNumber: '101', type: 'general', capacity: 1, perNightCost: 1500, facilities: ['TV', 'AC'] },
  { roomNumber: '102', type: 'general', capacity: 1, perNightCost: 2000, facilities: ['TV', 'AC', 'Bystander Cot'] },
  { roomNumber: '103', type: 'private', capacity: 1, perNightCost: 2500, facilities: ['AC'] },
  { roomNumber: 'ICU-1', type: 'ICU', capacity: 1, perNightCost: 4000, facilities: ['AC'] },
];

const PATIENTS = [
  { id: 'P-001', name: 'Anita Sharma', gender: 'Female', age: 34, phone: '9876543210' },
  { id: 'P-002', name: 'Priya Patel', gender: 'Female', age: 29, phone: '9876543211' },
  { id: 'P-003', name: 'Amit Singh', gender: 'Male', age: 41, phone: '9876543212' },
];

async function run() {
  await mongoose.connect(MONGO_URI);
  console.log('Connected to', MONGO_URI);

  // Remove stale old junior-doctor ID if it was used before with a different password.
  await User.deleteMany({ EmployeeId: 'HSP-2001' });

  const hash = await bcrypt.hash(PASSWORD, 10);

  // Users (+ Doctor profiles for the doctor designations)
  for (const u of USERS) {
    let user = await User.findOne({ EmployeeId: u.EmployeeId });
    if (!user) {
      user = await User.create({ EmployeeId: u.EmployeeId, name: u.name, designation: u.designation, passwordHash: hash });
      console.log('Created user', u.EmployeeId, u.designation);
    } else {
      console.log('User already exists', u.EmployeeId);
    }

    if (user.designation === 'Junior Doctor') {
      const seniorEmployeeId = JUNIOR_TO_SENIOR[user.EmployeeId];
      if (seniorEmployeeId) {
        const seniorUser = await User.findOne({ EmployeeId: seniorEmployeeId });
        if (seniorUser && (!user.reportingDoctorId || user.reportingDoctorId.toString() !== seniorUser._id.toString())) {
          user.reportingDoctorId = seniorUser._id;
          await user.save();
        }
      }
    }

    if (/Doctor/.test(u.designation)) {
      const existingDoctor = await Doctor.findOne({ userId: user._id });
      if (!existingDoctor) {
        await Doctor.create({ userId: user._id, name: u.name, specialization: u.specialization, department: u.department });
        console.log('Created doctor profile for', u.name);
      } else {
        console.log('Doctor profile already exists for', u.name);
      }
    }
  }

  // Rooms
  for (const r of ROOMS) {
    const existing = await Room.findOne({ roomNumber: r.roomNumber });
    if (!existing) {
      await Room.create({ ...r, status: 'available' });
      console.log('Created room', r.roomNumber);
    } else {
      console.log('Room already exists', r.roomNumber);
    }
  }

  // A few sample patients
  for (const p of PATIENTS) {
    const existing = await Patient.findOne({ id: p.id });
    if (!existing) {
      await Patient.create({
        ...p, type: 'OP', lastVisit: null, doctor: '—',
        vitals: { temp: '—', bp: '—', pulse: '—', resp: '—' },
        history: [{ d: new Date().toISOString().slice(0, 10), t: 'Registered', s: 'Seeded patient record.' }],
      });
      console.log('Created patient', p.id, p.name);
    } else {
      console.log('Patient already exists', p.id);
    }
  }

  console.log('\nDone. Every seeded user\'s password is:', PASSWORD);
  await mongoose.disconnect();
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
