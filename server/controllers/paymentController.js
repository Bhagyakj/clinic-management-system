import Payment from '../models/Payment.js';
import Room from '../models/Room.js';
import resolvePatient from '../utils/resolvePatient.js';

// Turns the request's raw purpose/medicines/room input into one flat list of
// billable lines. `purpose[]` ends up being the single source of truth that
// collectPayment() splits a payment across — medicines and room charges are
// converted into purpose lines too, so "pay ₹1500 of a ₹3000 bill" works the
// same way regardless of what kind of charge it is.
async function buildPurposeLines({ purpose = [], medicines = [], room = [] }) {
  const lines = purpose.map((p) => ({ description: p.description, amount: p.amount, paid: 0 }));

  for (const m of medicines) {
    lines.push({ description: `Medicine (${m.medicineId})`, amount: m.rate * m.count, paid: 0 });
  }

  for (const r of room) {
    const roomDoc = await Room.findById(r.roomId);
    const nightly = roomDoc?.perNightCost || 0;
    const dateLabel = r.date ? new Date(r.date).toISOString().slice(0, 10) : '';
    lines.push({ description: `Room rent — ${roomDoc?.roomNumber || r.roomId} (${dateLabel})`, amount: nightly, paid: 0 });
  }

  return lines;
}

// POST /api/payments — Manager/FOS/Nurse issues a bill.
// Your Patient schema has no `bills` ref array, so a patient's bills are
// simply looked up with Payment.find({ patientId }) — nothing to push onto
// the patient document here.
export const createBill = async (req, res) => {
  try {
    const { patientId, appointmentId, purpose, medicines, room } = req.body;
    const patient = await resolvePatient(patientId);
    if (!patient) return res.status(404).json({ message: 'Patient not found' });

    const lines = await buildPurposeLines({ purpose, medicines, room });
    if (lines.length === 0) return res.status(400).json({ message: 'A bill needs at least one charge' });
    const totalAmount = lines.reduce((sum, l) => sum + l.amount, 0);

    const payment = await Payment.create({
      patientId: patient._id, appointmentId, room, medicines, purpose: lines, totalAmount, paidAmount: 0, status: 'pending',
    });

    res.status(201).json(payment);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/payments?patientId=&status=pending
// patientId accepts either _id or your custom "P-001" id.
export const listPayments = async (req, res) => {
  try {
    const { patientId, status } = req.query;
    const filter = {};
    if (patientId) {
      const patient = await resolvePatient(patientId);
      if (!patient) return res.json([]);
      filter.patientId = patient._id;
    }
    if (status === 'pending') filter.status = { $in: ['pending', 'partial'] };
    else if (status) filter.status = status;

    const payments = await Payment.find(filter).sort({ createdAt: -1 });
    res.json(payments);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// POST /api/payments/:id/collect  { amount, method, transactionId }
// Splits `amount` across this bill's purpose lines, oldest (first) line
// first. A line not fully covered keeps its remaining balance, so a bill
// with several charges can stay "partial" with some lines cleared and some
// not — matching the Payments page showing each unpaid purpose separately.
export const collectPayment = async (req, res) => {
  try {
    const { amount, method, transactionId } = req.body;
    if (!(amount > 0)) return res.status(400).json({ message: 'Amount must be greater than 0' });

    const payment = await Payment.findById(req.params.id);
    if (!payment) return res.status(404).json({ message: 'Bill not found' });

    const due = payment.totalAmount - payment.paidAmount;
    if (amount > due) return res.status(400).json({ message: `Amount exceeds the ₹${due} still due` });

    let left = amount;
    for (const line of payment.purpose) {
      if (left <= 0) break;
      const lineDue = line.amount - line.paid;
      if (lineDue <= 0) continue;
      const applied = Math.min(lineDue, left);
      line.paid += applied;
      left -= applied;
    }

    payment.paidAmount += amount;
    payment.status = payment.paidAmount >= payment.totalAmount ? 'paid' : 'partial';
    payment.paymentInfo = { method, transactionId, date: new Date() };
    if (payment.status === 'paid') payment.paidDate = new Date();

    await payment.save();
    res.json(payment);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
