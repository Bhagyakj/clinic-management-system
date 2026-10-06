export const ROLES = [
  { id: 'manager', label: 'Manager', icon: '🧑‍💼', accent: '#2563EB', soft: '#E3EEFF', desc: 'Manage staff, medicines, procedures, rooms, payments and bills' },
  { id: 'fos', label: 'Front Office Staff', icon: '🗂️', accent: '#189A5B', soft: '#E1F7EA', desc: 'Register patients, book appointments, handle payments and admissions' },
  { id: 'jdoc', label: 'Junior Doctor', icon: '🩺', accent: '#7C4DFF', soft: '#EFE7FF', desc: 'Record vitals, complaints and observations' },
  { id: 'sdoc', label: 'Senior Doctor', icon: '⚕️', accent: '#DB8B1F', soft: '#FFF2DE', desc: 'View history, prescribe medicines and procedures' },
  { id: 'nurse', label: 'Nurse', icon: '💉', accent: '#0E9C87', soft: '#DFF6F2', desc: 'Manage medicines and procedures for IP patients' },
  { id: 'pharm', label: 'Pharmacist', icon: '💊', accent: '#D93B72', soft: '#FFE6EF', desc: 'View prescriptions, prepare pharmacy bills and mark delivery' },
];

export function roleInfo(id) {
  return ROLES.find((r) => r.id === id);
}

/* The backend returns the raw designation string (from the Mongoose enum).
   This maps it to the short role id this app's NAV/ROLES config uses. */
export const DESIGNATION_TO_ROLE = {
  'Manager': 'manager',
  'Front Office Staff': 'fos',
  'Pharmacist': 'pharm',
  'Nurse': 'nurse',
  'Junior Doctor': 'jdoc',
  'Senior Doctor': 'sdoc',
};
export const DESIGNATIONS = Object.keys(DESIGNATION_TO_ROLE);

export const NAV = {
  manager: [['dashboard', '📊', 'Dashboard'], ['users', '👥', 'Users'], ['medicines', '💊', 'Medicines'], ['procedures', '🧾', 'Procedures'], ['rooms', '🚪', 'Rooms'], ['patients', '🧑‍🤝‍🧑', 'Patients'], ['payments', '💳', 'Payments'], ['billing', '🧮', 'Billing'], ['reports', '📈', 'Reports'], ['settings', '⚙️', 'Settings']],
  fos: [['dashboard', '📊', 'Dashboard'], ['patients', '🧑‍🤝‍🧑', 'Patients'], ['appointments', '📅', 'Appointments'], ['billing', '🧮', 'Billing'], ['payments', '💳', 'Payments'], ['admissions', '🛏️', 'Admissions'], ['reports', '📈', 'Reports']],
  jdoc: [['dashboard', '📊', 'Dashboard'], ['appointments', '📅', 'Appointments'], ['consultation', '📝', 'Consultation'], ['patients', '🧑‍🤝‍🧑', 'Patients'], ['reports', '📈', 'Reports']],
  sdoc: [['dashboard', '📊', 'Dashboard'], ['patients', '🧑‍🤝‍🧑', 'Patients'], ['consultation', '📝', 'Consultation'], ['prescription', '💊', 'Prescription'], ['history', '🕘', 'History'], ['reports', '📈', 'Reports']],
  nurse: [['dashboard', '📊', 'Dashboard'], ['ip', '🛏️', 'IP Patients'], ['medicines', '💊', 'Medicines'], ['procedures', '🧾', 'Procedures'], ['reports', '📈', 'Reports']],
  pharm: [['dashboard', '📊', 'Dashboard'], ['prescriptions', '📝', 'Prescriptions'], ['pharmbills', '🧮', 'Pharmacy Bills'], ['medicines', '💊', 'Medicines'], ['reports', '📈', 'Reports']],
};

export const PAGE_TITLES = {
  dashboard: 'Dashboard', users: 'Users', medicines: 'Medicines', procedures: 'Procedures', rooms: 'Rooms',
  payments: 'Payments', billing: 'Billing', reports: 'Reports', settings: 'Settings', patients: 'Patients',
  appointments: 'Appointments', admissions: 'Admissions', consultation: 'Consultation', prescription: 'Prescription',
  history: 'History', ip: 'IP Patients', prescriptions: 'Prescriptions', pharmbills: 'Pharmacy Bills',
};

/* ===================================================================
   Still local/mock below — no backend exists yet for Users (beyond
   auth), Medicines or Procedures management. Patients, Doctors,
   Appointments, Payments, Rooms and Admissions are now real API data,
   loaded in AppContext.jsx — there is no mock data for them anymore.
   =================================================================== */
export const INITIAL_USERS = [
  { id: 'U-001', name: 'Dr. John', designation: 'Manager', mobile: '9900011122', email: 'john@mediflow.clinic', status: 'Active' },
  { id: 'U-002', name: 'Meera Nair', designation: 'Front Office Staff', mobile: '9900011123', email: 'meera@mediflow.clinic', status: 'Active' },
  { id: 'U-003', name: 'Dr. Arjun Rao', designation: 'Junior Doctor', mobile: '9900011124', email: 'arjun@mediflow.clinic', status: 'Active' },
  { id: 'U-004', name: 'Dr. Kavita Menon', designation: 'Senior Doctor', mobile: '9900011125', email: 'kavita@mediflow.clinic', status: 'Active' },
  { id: 'U-005', name: 'Sr. Lissy Thomas', designation: 'Nurse', mobile: '9900011126', email: 'lissy@mediflow.clinic', status: 'Active' },
  { id: 'U-006', name: 'Ravi Kumar', designation: 'Pharmacist', mobile: '9900011127', email: 'ravi@mediflow.clinic', status: 'Active' },
];

export const INITIAL_MEDICINES = [
  { id: 'M-001', name: 'Paracetamol 500mg', scientificName: 'Acetaminophen', unitCost: 4, quantity: 320, status: 'Active' },
  { id: 'M-002', name: 'Amoxicillin 250mg', scientificName: 'Amoxicillin', unitCost: 8, quantity: 150, status: 'Active' },
  { id: 'M-003', name: 'Cetirizine 10mg', scientificName: 'Cetirizine HCl', unitCost: 3, quantity: 200, status: 'Active' },
];

export const INITIAL_PROCEDURES = [
  { id: 'PR-001', name: 'Blood Test — CBC', description: 'Complete blood count', unitCost: 350, status: 'Active' },
  { id: 'PR-002', name: 'ECG', description: 'Electrocardiogram', unitCost: 500, status: 'Active' },
  { id: 'PR-003', name: 'X-Ray — Chest', description: 'Single view chest x-ray', unitCost: 600, status: 'Active' },
];

export const CONSULTATION_FEE = 500;
export const REGISTRATION_FEE = 200;
export const CONSULTATION_GAP_DAYS = 30;

/* ===================================================================
   Billing helpers — these now operate on the REAL Payment document
   shape returned by the backend:
     { _id, patientId, purpose: [{ description, amount, paid }],
       totalAmount, paidAmount, status: 'pending'|'partial'|'paid' }
   This is different from the old mock shape (one purpose per bill) —
   one Payment document can now bundle several charges, each tracked
   separately via purpose[].paid.
   =================================================================== */

export function billBalance(bill) {
  return Math.max(0, (bill.totalAmount || 0) - (bill.paidAmount || 0));
}

export function billsForPatient(bills, patientId) {
  return bills.filter((b) => b.patientId === patientId);
}

export function patientPayStatus(bills, patientId) {
  const bs = billsForPatient(bills, patientId);
  if (bs.length === 0) return 'No bills';
  return bs.every((b) => b.status === 'paid') ? 'Paid' : 'Pending';
}

export function pendingBillsCount(bills) {
  return bills.filter((b) => b.status !== 'paid').length;
}

// Every unpaid purpose line, across every pending/partial bill for one
// patient, flattened to one row each — so a patient owing for two separate
// charges still shows up twice, even though both might live in the same
// Payment document. Each row carries its parent bill's id, since collecting
// payment happens per-bill (POST /payments/:id/collect), not per-line.
export function pendingLinesForPatient(bills, patientId) {
  const rows = [];
  for (const bill of billsForPatient(bills, patientId)) {
    if (bill.status === 'paid') continue;
    (bill.purpose || []).forEach((line, index) => {
      const remaining = (line.amount || 0) - (line.paid || 0);
      if (remaining > 0) {
        rows.push({
          billId: bill._id, lineIndex: index, description: line.description,
          amount: line.amount, paid: line.paid || 0, remaining,
          billBalance: billBalance(bill),
        });
      }
    });
  }
  return rows;
}

function daysBetween(fromISO, toISO) {
  return Math.round((new Date(toISO) - new Date(fromISO)) / 86400000);
}

// Which charges apply when booking an appointment for this patient on `date`?
//  - first-ever appointment: consultation (+ registration if never collected)
//  - repeat patient: consultation only if the last visit was more than 30 days ago
// Reads straight off the real Patient document (appointmentHistory/lastVisit
// are already kept up to date server-side by bookAppointment).
export function appointmentCharges(patient, bills, date) {
  const lastVisit = patient.lastVisit || null;
  const hasHistory = (patient.appointmentHistory && patient.appointmentHistory.length > 0)
    || (patient.history || []).some((h) => /consultation|admitted/i.test(h.t));
  const charges = [];
  let note;
  if (!hasHistory) {
    const hasRegistration = billsForPatient(bills, patient._id)
      .some((b) => (b.purpose || []).some((l) => /registration/i.test(l.description)));
    if (!hasRegistration) charges.push({ desc: 'Registration charge', amount: REGISTRATION_FEE });
    charges.push({ desc: 'Consultation fee', amount: CONSULTATION_FEE });
    note = 'New patient — first appointment.';
  } else {
    const gap = lastVisit ? daysBetween(lastVisit, date) : null;
    if (gap === null || gap > CONSULTATION_GAP_DAYS) {
      charges.push({ desc: 'Consultation fee', amount: CONSULTATION_FEE });
      note = gap === null ? 'Repeat patient.' : `Repeat patient — last visit ${gap} days ago (more than ${CONSULTATION_GAP_DAYS}).`;
    } else {
      note = `Repeat patient — last visit ${Math.max(gap, 0)} days ago (within ${CONSULTATION_GAP_DAYS} days), so no consultation charge.`;
    }
  }
  return { charges, note, lastVisit };
}
