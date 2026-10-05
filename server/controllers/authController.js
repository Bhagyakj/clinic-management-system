import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const JWT_SECRET = process.env.JWT_SECRET || 'mySuperSecretKey123';

// Register
export const register = async (req, res) => {
  try {
    const { EmployeeId, name, designation, password } = req.body;
    if (!EmployeeId || !name || !designation || !password) {
      return res.status(400).json({ message: 'EmployeeId, name, designation and password are all required' });
    }
    const existing = await User.findOne({ EmployeeId });
    if (existing) return res.status(400).json({ message: 'EmployeeId already exists' });

    const hash = await bcrypt.hash(password, 10);
    const user = new User({ EmployeeId, name, designation, passwordHash: hash });
    await user.save();

    res.status(201).json({ message: 'User registered successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Login
export const login = async (req, res) => {
  try {
    const { EmployeeId, password } = req.body;
    const user = await User.findOne({ EmployeeId });
    if (!user) return res.status(401).json({ message: 'Invalid EmployeeId' });

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) return res.status(401).json({ message: 'Invalid password' });

    const token = jwt.sign(
      { id: user._id, role: user.designation },
      JWT_SECRET,
      { expiresIn: '8h' }
    );

    res.json({ token, role: user.designation, name: user.name, employeeId: user.EmployeeId });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Me
export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-passwordHash');
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
