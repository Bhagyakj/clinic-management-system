import Appointment from '../models/Appointment.js';
import Doctor from '../models/Doctor.js';
import resolvePatient from '../utils/resolvePatient.js';

function toDateString(d) {
  return typeof d === 'string' ? d : new Date(d).toISOString().slice(0, 10);
}

// POST /api/appointments — Manager/FOS books an appointment.
// `patientId` in the request body can be either the patient's Mongo _id or
// your human-readable `id` (e.g. "P-001") — resolvePatient() handles both.
export const bookAppointment = async (req, res) => {
  try {
    const { patientId, doctorId, date, time, notes } = req.body || {};

    if (!patientId || !doctorId || !date || !time) {
      return res.status(400).json({ message: 'patientId, doctorId, date and time are required' });
    }

    const patient = await resolvePatient(patientId);
    if (!patient) return res.status(404).json({ message: 'Patient not found' });
    const doctor = await Doctor.findById(doctorId);
    if (!doctor) return res.status(404).json({ message: 'Doctor not found' });

    const appointment = await Appointment.create({
      patientId: patient._id, doctorId, date, time, notes, status: 'confirmed',
    });

    // Your Patient schema has no `appointments` ref array — appointments are
    // recorded directly in `appointmentHistory` (matches the frontend's
    // Appointments popup, which reads date/time/doctor/status).
    patient.appointmentHistory.push({ date: toDateString(date), time, doctor: doctor.name, status: 'confirmed' });
    patient.lastVisit = toDateString(date);
    patient.doctor = doctor.name;
    await patient.save();

    doctor.appointments.push(appointment._id);
    await doctor.save();

    res.status(201).json(appointment);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/appointments?patientId=&doctorId=&date=&status=
// patientId here also accepts either _id or your custom "P-001" id.
export const listAppointments = async (req, res) => {
  try {
    const { patientId, doctorId, date, status } = req.query;
    const filter = {};
    if (patientId) {
      const patient = await resolvePatient(patientId);
      if (!patient) return res.json([]);
      filter.patientId = patient._id;
    }
    if (doctorId) filter.doctorId = doctorId;
    if (status) filter.status = status;
    if (date) {
      const start = new Date(date); start.setHours(0, 0, 0, 0);
      const end = new Date(date); end.setHours(23, 59, 59, 999);
      filter.date = { $gte: start, $lte: end };
    }
    const appointments = await Appointment.find(filter)
      .populate('doctorId', 'name specialization')
      .sort({ date: -1 });
    res.json(appointments);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// PATCH /api/appointments/:id/status  { status: 'completed' | 'cancelled' | ... }
export const updateAppointmentStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const appointment = await Appointment.findByIdAndUpdate(req.params.id, { status }, { new: true });
    if (!appointment) return res.status(404).json({ message: 'Appointment not found' });
    res.json(appointment);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
