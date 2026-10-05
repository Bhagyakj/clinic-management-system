import PatientRoom from '../models/PatientRoom.js';
import Patient from '../models/Patient.js';
import Room from '../models/Room.js';
import Payment from '../models/Payment.js';
import resolvePatient from '../utils/resolvePatient.js';

// GET /api/admissions — currently admitted patients (toDate not set)
export const listAdmissions = async (req, res) => {
  try {
    const admissions = await PatientRoom.find({ toDate: { $exists: false } })
      .populate('patientId', 'id name phone')
      .populate('roomId', 'roomNumber type perNightCost');
    res.json(admissions);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// POST /api/admissions  { patientId, roomId, fromDate }
// patientId accepts either _id or your custom "P-001" id.
// PatientRoom is the source of truth for admission history; patient.admitted/
// admissionDays/room/type (flat fields on your Patient schema) are kept in
// sync here so the Patients table doesn't need an extra query to show them.
export const admitPatient = async (req, res) => {
  try {
    const { patientId, roomId, fromDate } = req.body;
    const patient = await resolvePatient(patientId);
    if (!patient) return res.status(404).json({ message: 'Patient not found' });
    const room = await Room.findById(roomId);
    if (!room) return res.status(404).json({ message: 'Room not found' });
    if (room.status !== 'available') return res.status(400).json({ message: `Room ${room.roomNumber} is ${room.status}, not available` });

    const admission = await PatientRoom.create({ patientId: patient._id, roomId, fromDate: fromDate || new Date() });

    room.status = 'occupied';
    await room.save();

    patient.admitted = true;
    patient.admissionDays = null; // unknown until discharge — see dischargePatient
    patient.room = room.roomNumber;
    patient.type = 'IP';
    await patient.save();

    res.status(201).json(admission);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// POST /api/admissions/:id/discharge  { toDate }
// Frees the room, reverts the patient to OP, and auto-generates the
// room-rent bill for the nights stayed (nights × room.perNightCost).
export const dischargePatient = async (req, res) => {
  try {
    const admission = await PatientRoom.findById(req.params.id);
    if (!admission) return res.status(404).json({ message: 'Admission not found' });
    if (admission.toDate) return res.status(400).json({ message: 'This admission is already discharged' });

    const toDate = req.body.toDate ? new Date(req.body.toDate) : new Date();
    const nights = Math.max(1, Math.round((toDate - admission.fromDate) / 86400000));

    admission.toDate = toDate;
    await admission.save();

    const room = await Room.findById(admission.roomId);
    const patient = await Patient.findById(admission.patientId); // stored as the real _id when admitted, so findById is correct here
    if (room) { room.status = 'available'; await room.save(); }

    let bill = null;
    if (room) {
      const amount = nights * room.perNightCost;
      bill = await Payment.create({
        patientId: admission.patientId,
        room: [{ roomId: room._id, date: toDate }],
        purpose: [{ description: `Room rent — ${room.roomNumber} (${nights} night(s))`, amount, paid: 0 }],
        totalAmount: amount,
        status: 'pending',
      });
    }

    if (patient) {
      patient.admitted = false;
      patient.admissionDays = nights;
      patient.room = null;
      patient.type = 'OP';
      await patient.save();
    }

    res.json({ admission, bill, nights });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
