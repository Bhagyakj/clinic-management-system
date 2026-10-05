import Doctor from '../models/Doctor.js';
import User from '../models/User.js';

// GET /api/doctors — used to populate "Doctor" dropdowns (book appointment, etc.)
export const listDoctors = async (req, res) => {
  try {
    const doctors = await Doctor.find().populate('userId', 'name designation EmployeeId');
    res.json(doctors);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// POST /api/doctors — Manager only. Links a clinical profile to an existing
// user account (that user must already have designation Junior/Senior Doctor).
export const createDoctor = async (req, res) => {
  try {
    const { userId, specialization, department, contact } = req.body;
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'No such user' });
    if (!/Doctor/.test(user.designation)) {
      return res.status(400).json({ message: `${user.name} is a ${user.designation}, not a doctor` });
    }
    const existing = await Doctor.findOne({ userId });
    if (existing) return res.status(400).json({ message: 'This user already has a doctor profile' });

    const doctor = await Doctor.create({ userId, name: user.name, specialization, department, contact });
    res.status(201).json(doctor);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
