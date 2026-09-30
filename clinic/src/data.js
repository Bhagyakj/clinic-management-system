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

/* In a real system this lookup happens server-side after OTP verification —
   the backend returns the logged-in user's role, and the app never shows a
   role picker. This map stands in for that response during development. */
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

/* Demo credentials only. In the real system the server checks the Hospital ID
   plus an OTP or the (hashed) password, and returns the user's role. */

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

export const INITIAL_APPOINTMENTS = [
  { id: 'A-001', time: '09:00 AM', date: '2026-09-22', patient: 'Anita Sharma', patientId: 'P-001', doctor: 'Dr. Mehta', status: 'progress' },
  { id: 'A-002', time: '09:30 AM', date: '2026-09-22', patient: 'Priya Patel', patientId: 'P-002', doctor: 'Dr. Patel', status: 'waiting' },
  { id: 'A-003', time: '10:00 AM', date: '2026-09-22', patient: 'Amit Singh', patientId: 'P-003', doctor: 'Dr. Sharma', status: 'confirmed' },
  { id: 'A-004', time: '10:30 AM', date: '2026-09-22', patient: 'Neha Gupta', patientId: 'P-004', doctor: 'Dr. Sharma', status: 'confirmed' },
  { id: 'A-005', time: '11:00 AM', date: '2026-09-22', patient: 'Suresh Kumar', patientId: 'P-005', doctor: 'Dr. Mehta', status: 'waiting' },
];
// kept for any old imports; prefer INITIAL_APPOINTMENTS via context going forward
export const APPTS = INITIAL_APPOINTMENTS;

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

export const INITIAL_ROOMS = [
  { id: 'R-101', name: 'Room 101', facilities: ['TV', 'AC'], perNightCost: 1500, status: 'Occupied' },
  { id: 'R-102', name: 'Room 102', facilities: ['TV', 'AC', 'Bystander Cot'], perNightCost: 2000, status: 'Available' },
  { id: 'R-103', name: 'Room 103', facilities: ['AC'], perNightCost: 1200, status: 'Available' },
  { id: 'R-104', name: 'Room 104', facilities: ['TV'], perNightCost: 1000, status: 'Available' },
  { id: 'R-105', name: 'Room 105', facilities: ['TV', 'AC', 'Bystander Cot'], perNightCost: 2200, status: 'Closed' },
];

export const INITIAL_PATIENTS = [
  { id: 'P-001', name: 'Anita Sharma', gender: 'Female', age: 34, phone: '9876543210', type: 'OP', lastVisit: '2026-09-18', doctor: 'Dr. Mehta',
    vitals: { temp: '37.5°C', bp: '120/80', pulse: '76', resp: '16' }, admitted: false, admissionDays: null, room: null,
    appointmentHistory: [
      { date: '2026-09-18', time: '09:00 AM', doctor: 'Dr. Mehta', status: 'completed' },
      { date: '2026-08-02', time: '10:30 AM', doctor: 'Dr. Sharma', status: 'completed' },
      { date: '2026-05-14', time: '11:00 AM', doctor: 'Dr. Mehta', status: 'completed' },
    ],
    history: [
      { d: '2026-09-18', t: 'OP Consultation — Dr. Mehta', s: 'Complaint: mild fever, headache. Diagnosis: viral fever. Advised rest and paracetamol.' },
      { d: '2026-08-02', t: 'OP Consultation — Dr. Sharma', s: 'Routine checkup. All vitals normal.' },
      { d: '2026-05-14', t: 'Prescription issued', s: 'Paracetamol 500mg, Cetirizine 10mg — 5 days.' },
    ] },
  { id: 'P-002', name: 'Priya Patel', gender: 'Female', age: 29, phone: '9876543211', type: 'OP', lastVisit: '2026-09-17', doctor: 'Dr. Patel',
    vitals: { temp: '36.9°C', bp: '118/76', pulse: '72', resp: '15' }, admitted: false, admissionDays: null, room: null,
    appointmentHistory: [
      { date: '2026-09-17', time: '09:30 AM', doctor: 'Dr. Patel', status: 'completed' },
    ],
    history: [{ d: '2026-09-17', t: 'OP Consultation — Dr. Patel', s: 'Complaint: seasonal allergy. Prescribed antihistamine.' }] },
  { id: 'P-003', name: 'Amit Singh', gender: 'Male', age: 41, phone: '9876543212', type: 'IP', lastVisit: '2026-09-16', doctor: 'Dr. Verma',
    vitals: { temp: '38.1°C', bp: '130/85', pulse: '88', resp: '18' }, admitted: true, admissionDays: 3, room: 'Room 101',
    appointmentHistory: [
      { date: '2026-09-16', time: '10:00 AM', doctor: 'Dr. Verma', status: 'completed' },
      { date: '2026-09-15', time: '02:00 PM', doctor: 'Dr. Verma', status: 'completed' },
    ],
    history: [
      { d: '2026-09-16', t: 'Admitted — Room 101', s: 'Diagnosis: acute gastritis. Admission required: Yes, 3 days.' },
      { d: '2026-09-15', t: 'OP Consultation — Dr. Verma', s: 'Complaint: abdominal pain. Referred for admission.' },
    ] },
  { id: 'P-004', name: 'Neha Gupta', gender: 'Female', age: 26, phone: '9876543213', type: 'OP', lastVisit: '2026-09-15', doctor: 'Dr. Sharma',
    vitals: { temp: '37.0°C', bp: '115/74', pulse: '70', resp: '14' }, admitted: false, admissionDays: null, room: null,
    appointmentHistory: [
      { date: '2026-09-15', time: '10:30 AM', doctor: 'Dr. Sharma', status: 'completed' },
    ],
    history: [{ d: '2026-09-15', t: 'OP Consultation — Dr. Sharma', s: 'Routine antenatal checkup. Normal.' }] },
  { id: 'P-005', name: 'Suresh Kumar', gender: 'Male', age: 52, phone: '9876543214', type: 'OP', lastVisit: '2026-09-14', doctor: 'Dr. Mehta',
    vitals: { temp: '37.2°C', bp: '138/90', pulse: '80', resp: '17' }, admitted: false, admissionDays: null, room: null,
    appointmentHistory: [
      { date: '2026-09-14', time: '11:00 AM', doctor: 'Dr. Mehta', status: 'completed' },
    ],
    history: [{ d: '2026-09-14', t: 'OP Consultation — Dr. Mehta', s: 'Follow-up for hypertension. BP slightly elevated, medication adjusted.' }] },
];

export const INITIAL_BILLS = [
  // Anita owes three separate charges (₹3000 total) — good for testing part-payments
  { id: 'B-101', patientId: 'P-001', purpose: 'Consultation', desc: 'Consultation fee', amount: 800, paid: 0, status: 'Pending' },
  { id: 'B-106', patientId: 'P-001', purpose: 'Procedure', desc: 'Blood test — CBC', amount: 1000, paid: 0, status: 'Pending' },
  { id: 'B-107', patientId: 'P-001', purpose: 'Medicine', desc: 'Pharmacy bill', amount: 1200, paid: 0, status: 'Pending' },
  { id: 'B-102', patientId: 'P-003', purpose: 'Room Rent', desc: 'Admission — Room 101 (3 days) + procedures', amount: 6200, paid: 0, status: 'Pending' },
  { id: 'B-103', patientId: 'P-002', purpose: 'Consultation', desc: 'Consultation fee', amount: 500, paid: 500, status: 'Paid' },
  { id: 'B-104', patientId: 'P-004', purpose: 'Consultation', desc: 'Antenatal checkup', amount: 600, paid: 0, status: 'Pending' },
  { id: 'B-105', patientId: 'P-005', purpose: 'Consultation', desc: 'Consultation + medicines', amount: 640, paid: 0, status: 'Pending' },
];

export const INITIAL_PAYMENTS = [];

export const CONSULTATION_FEE = 500;
export const REGISTRATION_FEE = 200;
export const CONSULTATION_GAP_DAYS = 30;

// ---- bill / payment helpers ----
export function billBalance(b) {
  return b.status === 'Paid' ? 0 : Math.max(0, b.amount - (b.paid || 0));
}

// Splits a payment across a patient's pending bills, oldest first. A bill that
// isn't fully covered stays pending with a smaller balance — so the patient
// keeps showing up once per unpaid purpose.
export function allocatePayment(pendingBills, amount) {
  let left = amount;
  return pendingBills.map((b) => {
    const due = billBalance(b);
    const applied = Math.min(due, Math.max(left, 0));
    left -= applied;
    return { billId: b.id, purpose: b.purpose || b.desc, desc: b.desc, due, applied, remaining: due - applied };
  });
}

function daysBetween(fromISO, toISO) {
  return Math.round((new Date(toISO) - new Date(fromISO)) / 86400000);
}

// Which charges apply when booking an appointment for this patient on `date`?
//  - first-ever appointment: consultation (+ registration if it was never collected)
//  - repeat patient: consultation only if the last visit was more than 30 days ago
export function appointmentCharges(patient, appointments, bills, date) {
  const dates = [
    patient.lastVisit,
    ...(patient.appointmentHistory || []).map((a) => a.date),
    ...appointments.filter((a) => a.patientId === patient.id).map((a) => a.date),
  ].filter((d) => /^\d{4}-\d{2}-\d{2}$/.test(String(d)));
  const lastVisit = dates.sort().slice(-1)[0] || null;
  const hasHistory = (patient.history || []).some((h) => /consultation|admitted/i.test(h.t)) ||
    appointments.some((a) => a.patientId === patient.id) || (patient.appointmentHistory || []).length > 0;
  const charges = [];
  let note;
  if (!hasHistory) {
    const hasRegistration = bills.some((b) => b.patientId === patient.id && b.purpose === 'Registration');
    if (!hasRegistration) charges.push({ purpose: 'Registration', desc: 'Registration charge', amount: REGISTRATION_FEE });
    charges.push({ purpose: 'Consultation', desc: 'Consultation fee', amount: CONSULTATION_FEE });
    note = 'New patient — first appointment.';
  } else {
    const gap = lastVisit ? daysBetween(lastVisit, date) : null;
    if (gap === null || gap > CONSULTATION_GAP_DAYS) {
      charges.push({ purpose: 'Consultation', desc: 'Consultation fee', amount: CONSULTATION_FEE });
      note = gap === null ? 'Repeat patient.' : `Repeat patient — last visit ${gap} days ago (more than ${CONSULTATION_GAP_DAYS}).`;
    } else {
      note = `Repeat patient — last visit ${Math.max(gap, 0)} days ago (within ${CONSULTATION_GAP_DAYS} days), so no consultation charge.`;
    }
  }
  return { charges, note, lastVisit };
}


export function billsForPatient(bills, patientId) {
  return bills.filter((b) => b.patientId === patientId);
}

export function patientPayStatus(bills, patientId) {
  const bs = billsForPatient(bills, patientId);
  if (bs.length === 0) return 'No bills';
  return bs.every((b) => b.status === 'Paid') ? 'Paid' : 'Pending';
}

export function pendingBillsCount(bills) {
  return bills.filter((b) => b.status === 'Pending').length;
}

// Every pending bill is returned as its own line — a patient owing for two
// separate charges (e.g. consultation + procedure) gets two records here,
// never merged into one.
export function pendingBillsForPatient(bills, patientId) {
  return bills.filter((b) => b.patientId === patientId && billBalance(b) > 0);
}
