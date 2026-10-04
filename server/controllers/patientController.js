import Patient from '../models/Patient.js';

const buildPatientPayload = (body) => {
  const createdAt = new Date().toISOString().slice(0, 10);

  return {
    id: body.id || `P-${Math.floor(100 + Math.random() * 900)}`,
    name: body.name,
    gender: body.gender,
    age: Number(body.age),
    phone: body.phone,
    type: body.type || 'OP',
    lastVisit: body.lastVisit || createdAt,
    doctor: body.doctor || '—',
    vitals: {
      temp: body.vitals?.temp || '—',
      bp: body.vitals?.bp || '—',
      pulse: body.vitals?.pulse || '—',
      resp: body.vitals?.resp || '—',
    },
    admitted: Boolean(body.admitted),
    admissionDays: body.admissionDays ?? null,
    room: body.room || null,
    history: Array.isArray(body.history) && body.history.length
      ? body.history
      : [{ d: createdAt, t: 'Registered', s: 'New patient registered.' }],
    appointmentHistory: Array.isArray(body.appointmentHistory) ? body.appointmentHistory : [],
  };
};

export const getPatients = async (req, res) => {
  try {
    const patients = await Patient.find().sort({ createdAt: -1 });
    res.json(patients);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getPatientById = async (req, res) => {
  try {
    const patient = await Patient.findOne({ id: req.params.id });
    if (!patient) return res.status(404).json({ message: 'Patient not found' });
    res.json(patient);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createPatient = async (req, res) => {
  try {
    const payload = buildPatientPayload(req.body || {});

    if (!payload.name || !payload.gender || !payload.age || !payload.phone) {
      return res.status(400).json({ message: 'Name, gender, age and phone are required' });
    }

    const existing = await Patient.findOne({ $or: [{ id: payload.id }, { phone: payload.phone }] });
    if (existing) {
      return res.status(400).json({ message: 'Patient already exists with that ID or phone number' });
    }

    const patient = new Patient(payload);
    await patient.save();
    res.status(201).json(patient);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updatePatient = async (req, res) => {
  try {
    const patient = await Patient.findOne({ id: req.params.id });
    if (!patient) return res.status(404).json({ message: 'Patient not found' });

    const updates = { ...req.body };
    if (updates.age !== undefined) updates.age = Number(updates.age);
    if (updates.vitals) updates.vitals = { ...patient.vitals, ...updates.vitals };

    const updated = await Patient.findOneAndUpdate({ id: req.params.id }, updates, { new: true });
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deletePatient = async (req, res) => {
  try {
    const result = await Patient.findOneAndDelete({ id: req.params.id });
    if (!result) return res.status(404).json({ message: 'Patient not found' });
    res.json({ message: 'Patient deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
