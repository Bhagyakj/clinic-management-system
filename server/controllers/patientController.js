import Patient from "../models/Patient.js";
import Payment from "../models/Payment.js";

const buildPatientPayload = (body) => {
  const createdAt = new Date().toISOString().slice(0, 10);

  return {
    id: body.id || `P-${Math.floor(100 + Math.random() * 900)}`,
    name: body.name,
    gender: body.gender,
    age: Number(body.age),
    phone: body.phone,
    type: body.type || "OP",
    lastVisit: body.lastVisit || createdAt,
    doctor: body.doctor || "—",
    vitals: {
      temp: body.vitals?.temp || "—",
      bp: body.vitals?.bp || "—",
      pulse: body.vitals?.pulse || "—",
      resp: body.vitals?.resp || "—",
      weight: body.vitals?.weight || "—",
      height: body.vitals?.height || "—",
    },
    consultations: Array.isArray(body.consultations) ? body.consultations : [],
    prescriptions: Array.isArray(body.prescriptions) ? body.prescriptions : [],
    nurseCharges: Array.isArray(body.nurseCharges) ? body.nurseCharges : [],
    procedures: Array.isArray(body.procedures) ? body.procedures : [],
    admitted: Boolean(body.admitted),
    admissionDays: body.admissionDays ?? null,
    room: body.room || null,
    history:
      Array.isArray(body.history) && body.history.length
        ? body.history
        : [{ d: createdAt, t: "Registered", s: "New patient registered." }],
    appointmentHistory: Array.isArray(body.appointmentHistory)
      ? body.appointmentHistory
      : [],
  };
};

export const getPatients = async (req, res) => {
  try {
    const { search, id, date } = req.query;
    let patients = await Patient.find().sort({ createdAt: -1 });

    if (search) {
      const q = String(search).trim().toLowerCase();
      patients = patients.filter((p) => {
        const fields = [
          p.name,
          p.id,
          p.phone,
          p.lastVisit,
          ...(p.appointmentHistory || []).map((a) => a.date),
          ...(p.history || []).map((h) => h.d),
        ];
        return fields.some((value) =>
          String(value || "")
            .toLowerCase()
            .includes(q),
        );
      });
    }

    if (id) {
      const q = String(id).trim().toLowerCase();
      patients = patients.filter((p) => String(p.id).toLowerCase().includes(q));
    }

    if (date) {
      const q = String(date).trim();
      patients = patients.filter((p) => {
        const patientDates = [
          p.lastVisit,
          ...(p.appointmentHistory || []).map((a) => a.date),
          ...(p.history || []).map((h) => h.d),
        ];
        return patientDates.some((value) => String(value || "").includes(q));
      });
    }

    res.json(patients);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getPatientById = async (req, res) => {
  try {
    const patient = await Patient.findOne({ id: req.params.id });
    if (!patient) return res.status(404).json({ message: "Patient not found" });
    res.json(patient);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createPatient = async (req, res) => {
  try {
    console.log("CREATE PATIENT BODY:", req.body);
    const body = req.body || {};
    const normalizedPhone = String(body.phone || "").trim();
    const normalizedName = String(body.name || "").trim();
    const payload = buildPatientPayload({
      ...body,
      name: normalizedName,
      phone: normalizedPhone,
    });
    const hasAge =
      body.age !== undefined &&
      body.age !== null &&
      String(body.age).trim() !== "";
    const isValidAge =
      hasAge && Number.isFinite(payload.age) && payload.age >= 0;

    if (!payload.name || !payload.gender || !isValidAge || !payload.phone) {
      return res
        .status(400)
        .json({ message: "Name, gender, age and phone are required" });
    }

    const existingByPhone = await Patient.findOne({ phone: payload.phone });
    if (existingByPhone) {
      return res.status(400).json({
        message:
          "A patient with this phone number is already registered. Please use a different phone number or open the existing record.",
      });
    }

    const existingById = await Patient.findOne({ id: payload.id });
    if (existingById) {
      return res
        .status(400)
        .json({ message: "Patient ID already exists. Please try again." });
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
    if (!patient) return res.status(404).json({ message: "Patient not found" });

    const updates = { ...req.body };
    if (updates.age !== undefined) updates.age = Number(updates.age);
    if (updates.vitals)
      updates.vitals = { ...patient.vitals, ...updates.vitals };
    if (updates.consultations) {
      updates.consultations = Array.isArray(updates.consultations)
        ? updates.consultations
        : [updates.consultations];
    }
    if (updates.prescriptions) {
      updates.prescriptions = Array.isArray(updates.prescriptions)
        ? updates.prescriptions
        : [updates.prescriptions];
    }
    if (updates.procedures) {
      updates.procedures = Array.isArray(updates.procedures)
        ? updates.procedures
        : [updates.procedures];
    }

    const updated = await Patient.findOneAndUpdate(
      { id: req.params.id },
      updates,
      { new: true },
    );
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const addNurseCharge = async (req, res) => {
  try {
    const patient = await Patient.findOne({ id: req.params.id });
    if (!patient) return res.status(404).json({ message: 'Patient not found' });

    const { description, amount, category = 'Medicine', note = '' } = req.body || {};
    const charge = {
      createdAt: new Date(),
      createdBy: req.user?.role === 'Nurse' ? req.user?.name || 'Nurse' : 'Nurse',
      category: String(category || 'Medicine').trim() || 'Medicine',
      description: String(description || '').trim(),
      amount: Number(amount) || 0,
      note: String(note || '').trim(),
    };

    if (!charge.description || charge.amount <= 0) {
      return res.status(400).json({ message: 'Charge description and amount are required.' });
    }

    patient.nurseCharges = Array.isArray(patient.nurseCharges) ? patient.nurseCharges : [];
    patient.nurseCharges.unshift(charge);
    await patient.save();

    res.status(201).json(charge);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const convertPendingNurseCharges = async (req, res) => {
  try {
    const patient = await Patient.findOne({ id: req.params.id });
    if (!patient) return res.status(404).json({ message: 'Patient not found' });

    const charges = Array.isArray(patient.nurseCharges) ? patient.nurseCharges : [];
    if (!charges.length) return res.status(400).json({ message: 'No pending nurse charges to convert.' });

    const totalAmount = charges.reduce((sum, item) => sum + Number(item.amount || 0), 0);
    const bill = await Payment.create({
      patientId: patient._id,
      purpose: charges.map((item) => ({
        description: `[Nurse] ${item.category}: ${item.description}`,
        amount: Number(item.amount || 0),
        paid: 0,
      })),
      totalAmount,
      paidAmount: 0,
      status: 'pending',
    });

    patient.nurseCharges = [];
    await patient.save();

    res.status(201).json({ bill, clearedChargeCount: charges.length, totalAmount });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deletePatient = async (req, res) => {
  try {
    const result = await Patient.findOneAndDelete({ id: req.params.id });
    if (!result) return res.status(404).json({ message: "Patient not found" });
    res.json({ message: "Patient deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
