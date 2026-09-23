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

export const INITIAL_PATIENTS = [
  { id: 'P-001', name: 'Anita Sharma', gender: 'Female', age: 34, phone: '9876543210', type: 'OP', lastVisit: '2026-09-18', doctor: 'Dr. Mehta',
    vitals: { temp: '37.5°C', bp: '120/80', pulse: '76', resp: '16' }, admitted: false, admissionDays: null, room: null,
    history: [
      { d: '2026-09-18', t: 'OP Consultation — Dr. Mehta', s: 'Complaint: mild fever, headache. Diagnosis: viral fever. Advised rest and paracetamol.' },
      { d: '2026-08-02', t: 'OP Consultation — Dr. Sharma', s: 'Routine checkup. All vitals normal.' },
      { d: '2026-05-14', t: 'Prescription issued', s: 'Paracetamol 500mg, Cetirizine 10mg — 5 days.' },
    ] },
  { id: 'P-002', name: 'Priya Patel', gender: 'Female', age: 29, phone: '9876543211', type: 'OP', lastVisit: '2026-09-17', doctor: 'Dr. Patel',
    vitals: { temp: '36.9°C', bp: '118/76', pulse: '72', resp: '15' }, admitted: false, admissionDays: null, room: null,
    history: [{ d: '2026-09-17', t: 'OP Consultation — Dr. Patel', s: 'Complaint: seasonal allergy. Prescribed antihistamine.' }] },
  { id: 'P-003', name: 'Amit Singh', gender: 'Male', age: 41, phone: '9876543212', type: 'IP', lastVisit: '2026-09-16', doctor: 'Dr. Verma',
    vitals: { temp: '38.1°C', bp: '130/85', pulse: '88', resp: '18' }, admitted: true, admissionDays: 3, room: 'Room 101',
    history: [
      { d: '2026-09-16', t: 'Admitted — Room 101', s: 'Diagnosis: acute gastritis. Admission required: Yes, 3 days.' },
      { d: '2026-09-15', t: 'OP Consultation — Dr. Verma', s: 'Complaint: abdominal pain. Referred for admission.' },
    ] },
  { id: 'P-004', name: 'Neha Gupta', gender: 'Female', age: 26, phone: '9876543213', type: 'OP', lastVisit: '2026-09-15', doctor: 'Dr. Sharma',
    vitals: { temp: '37.0°C', bp: '115/74', pulse: '70', resp: '14' }, admitted: false, admissionDays: null, room: null,
    history: [{ d: '2026-09-15', t: 'OP Consultation — Dr. Sharma', s: 'Routine antenatal checkup. Normal.' }] },
  { id: 'P-005', name: 'Suresh Kumar', gender: 'Male', age: 52, phone: '9876543214', type: 'OP', lastVisit: '2026-09-14', doctor: 'Dr. Mehta',
    vitals: { temp: '37.2°C', bp: '138/90', pulse: '80', resp: '17' }, admitted: false, admissionDays: null, room: null,
    history: [{ d: '2026-09-14', t: 'OP Consultation — Dr. Mehta', s: 'Follow-up for hypertension. BP slightly elevated, medication adjusted.' }] },
];

export const INITIAL_BILLS = [
  { id: 'B-101', patientId: 'P-001', desc: 'Consultation + blood test', amount: 890, status: 'Pending' },
  { id: 'B-102', patientId: 'P-003', desc: 'Admission — Room 101 (3 days) + procedures', amount: 6200, status: 'Pending' },
  { id: 'B-103', patientId: 'P-002', desc: 'Consultation fee', amount: 500, status: 'Paid' },
  { id: 'B-104', patientId: 'P-004', desc: 'Antenatal checkup', amount: 600, status: 'Pending' },
  { id: 'B-105', patientId: 'P-005', desc: 'Consultation + medicines', amount: 640, status: 'Pending' },
];

export const APPTS = [
  { time: '09:00 AM', patient: 'Anita Sharma', patientId: 'P-001', doctor: 'Dr. Mehta', status: 'progress' },
  { time: '09:30 AM', patient: 'Rajesh Kumar', patientId: 'P-002', doctor: 'Dr. Patel', status: 'waiting' },
  { time: '10:00 AM', patient: 'Pooja Singh', patientId: 'P-003', doctor: 'Dr. Sharma', status: 'confirmed' },
  { time: '10:30 AM', patient: 'Vivek Yadav', patientId: 'P-004', doctor: 'Dr. Sharma', status: 'confirmed' },
  { time: '11:00 AM', patient: 'Sneha Gupta', patientId: 'P-005', doctor: 'Dr. Mehta', status: 'waiting' },
];

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
