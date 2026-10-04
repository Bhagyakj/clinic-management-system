import React, { createContext, useContext, useMemo, useState, useCallback, useEffect } from 'react';
import {
  INITIAL_PATIENTS, INITIAL_BILLS, INITIAL_APPOINTMENTS, INITIAL_USERS,
  INITIAL_MEDICINES, INITIAL_PROCEDURES, INITIAL_ROOMS, roleInfo,
  INITIAL_PAYMENTS, allocatePayment, pendingBillsForPatient, billBalance, DESIGNATION_TO_ROLE,
} from './data.js';
import { apiLogin, apiRegister, apiGetMe, apiGetPatients, apiCreatePatient, apiUpdatePatient, apiDeletePatient } from './api.js';

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [screen, setScreen] = useState('login');   // 'login' | 'register' | 'app'
  const [role, setRole] = useState(null);
  const [userName, setUserName] = useState('');
  const [employeeId, setEmployeeId] = useState('');
  const [token, setToken] = useState(() => localStorage.getItem('mf_token') || '');
  const [authLoading, setAuthLoading] = useState(false);
  const [activeNav, setActiveNav] = useState('dashboard');
  const [patients, setPatients] = useState(INITIAL_PATIENTS);

  const loadPatients = useCallback(async () => {
    try {
      const data = await apiGetPatients();
      if (Array.isArray(data) && data.length > 0) {
        setPatients(data);
      }
    } catch {
      // Use the seeded local dataset if the API is temporarily unavailable.
    }
  }, []);

  useEffect(() => {
    loadPatients();
  }, [loadPatients]);
  const [bills, setBills] = useState(INITIAL_BILLS);
  const [appointments, setAppointments] = useState(INITIAL_APPOINTMENTS);
  const [users, setUsers] = useState(INITIAL_USERS);
  const [medicines, setMedicines] = useState(INITIAL_MEDICINES);
  const [procedures, setProcedures] = useState(INITIAL_PROCEDURES);
  const [rooms, setRooms] = useState(INITIAL_ROOMS);
  const [payments, setPayments] = useState(INITIAL_PAYMENTS);
  const [payPatientId, setPayPatientId] = useState(null); // patient whose 'Collect payment' popup is open
  const [drawerPatientId, setDrawerPatientId] = useState(null);
  const [toastMsg, setToastMsg] = useState('');
  const [toastVisible, setToastVisible] = useState(false);

  const showToast = useCallback((msg) => {
    setToastMsg(msg);
    setToastVisible(true);
    setTimeout(() => setToastVisible(false), 2200);
  }, []);

  // Looks up the Hospital ID (this would be a server call after OTP check)
  // and routes straight to that user's dashboard — no role-picker screen.
  // Calls the real backend. On success, routes straight into the matching
  // role's dashboard — no role-picker screen.
  const login = useCallback(async (empId, password) => {
    setAuthLoading(true);
    try {
      const data = await apiLogin(empId, password); // { token, role, name, employeeId }
      const roleId = DESIGNATION_TO_ROLE[data.role];
      if (!roleId) throw new Error(`Unrecognized designation "${data.role}" from server.`);
      localStorage.setItem('mf_token', data.token);
      setToken(data.token);
      setRole(roleId);
      setUserName(data.name);
      setEmployeeId(data.employeeId || empId);
      setActiveNav('dashboard');
      setScreen('app');
      return { ok: true };
    } catch (err) {
      return { ok: false, error: err.message };
    } finally {
      setAuthLoading(false);
    }
  }, []);

  const register = useCallback(async (form) => {
    setAuthLoading(true);
    try {
      await apiRegister(form);
      return { ok: true };
    } catch (err) {
      return { ok: false, error: err.message };
    } finally {
      setAuthLoading(false);
    }
  }, []);

  // Restore a session from a saved token (e.g. after a page refresh)
  const restoreSession = useCallback(async () => {
    const saved = localStorage.getItem('mf_token');
    if (!saved) return;
    try {
      const me = await apiGetMe(saved);
      const roleId = DESIGNATION_TO_ROLE[me.designation];
      if (!roleId) throw new Error('Unrecognized designation');
      setToken(saved);
      setRole(roleId);
      setUserName(me.name);
      setEmployeeId(me.EmployeeId);
      setActiveNav('dashboard');
      setScreen('app');
    } catch {
      localStorage.removeItem('mf_token');
    }
  }, []);

  const goToLogin = useCallback(() => { setScreen('login'); }, []);
  const goToRegister = useCallback(() => { setScreen('register'); }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('mf_token');
    setToken('');
    setRole(null);
    setUserName('');
    setEmployeeId('');
    setScreen('login');
  }, []);

  const navigate = useCallback((navKey) => setActiveNav(navKey), []);

  const openPatient = useCallback((id) => setDrawerPatientId(id), []);
  const closeDrawer = useCallback(() => setDrawerPatientId(null), []);

  const markBillPaid = useCallback((billId) => {
    setBills((prev) => prev.map((b) => (b.id === billId ? { ...b, paid: b.amount, status: 'Paid' } : b)));
    showToast('Bill marked as paid');
  }, [showToast]);

  const openPayment = useCallback((patientId) => setPayPatientId(patientId), []);
  const closePayment = useCallback(() => setPayPatientId(null), []);

  // Record a (possibly partial) payment. It is split across the patient's pending
  // bills oldest-first; whatever isn't covered stays pending as its own row.
  const recordPayment = useCallback(({ patientId, amount, method, reference }) => {
    const pending = pendingBillsForPatient(bills, patientId);
    const allocations = allocatePayment(pending, amount).filter((a) => a.applied > 0);
    if (allocations.length === 0) return null;
    setBills((prev) => prev.map((b) => {
      const a = allocations.find((x) => x.billId === b.id);
      if (!a) return b;
      const paid = (b.paid || 0) + a.applied;
      return { ...b, paid, status: paid >= b.amount ? 'Paid' : 'Pending' };
    }));
    const patient = patients.find((p) => p.id === patientId);
    setPayments((prev) => [{
      id: 'PAY-' + String(prev.length + 1).padStart(3, '0'), patientId, amount, method, reference: reference || '',
      date: new Date().toISOString().slice(0, 10), allocations,
    }, ...prev]);
    const cleared = allocations.filter((a) => a.remaining === 0).length;
    const left = pending.length - cleared;
    showToast(left > 0
      ? `₹${amount} received from ${patient?.name} — ${left} charge(s) still pending`
      : `₹${amount} received — ${patient?.name} is fully cleared`);
    return allocations;
  }, [bills, patients, showToast]);

  const issueBill = useCallback(({ patientId, admissionYes, admissionDays, room, amount = 890 }) => {
    const totalAmount = Number(amount) || 0;
    const newBill = {
      id: 'B-' + Math.floor(100 + Math.random() * 900),
      patientId,
      purpose: admissionYes ? 'Room Rent' : 'Consultation',
      desc: admissionYes ? `Admission — ${room} (${admissionDays} day(s)) + charges` : 'Consultation + charges',
      amount: totalAmount,
      paid: 0,
      status: 'Pending',
    };
    setBills((prev) => [...prev, newBill]);
    setPatients((prev) => prev.map((p) => {
      if (p.id !== patientId) return p;
      if (!admissionYes) return p;
      return {
        ...p,
        admitted: true,
        admissionDays,
        room,
        type: 'IP',
        history: [
          { d: 'Today', t: `Admitted — ${room}`, s: `Admission required: Yes, ${admissionDays} day(s). Bill ${newBill.id} issued (₹${totalAmount}) — pending payment.` },
          ...p.history,
        ],
      };
    }));
    if (admissionYes && room) {
      setRooms((prev) => prev.map((r) => (r.name === room ? { ...r, status: 'Occupied' } : r)));
    }
    showToast(admissionYes ? `Bill issued — admission for ${admissionDays} day(s). Payment pending.` : 'Bill issued — payment pending. Mark it paid from Payments.');
    return newBill;
  }, [showToast]);

  const saveConsultation = useCallback(() => {
    showToast('Consultation saved to patient record');
  }, [showToast]);

  const savePrescription = useCallback(() => {
    showToast('Prescription saved and sent to pharmacy');
  }, [showToast]);

  /* ---- Manager / FOS: patient registration ---- */
  const addPatient = useCallback(async (form) => {
    const id = form.id || 'P-' + String(patients.length + 1).padStart(3, '0');
    const newPatient = {
      id, name: form.name, gender: form.gender, age: Number(form.age) || 0, phone: form.phone,
      type: form.type || 'OP', lastVisit: new Date().toISOString().slice(0, 10), doctor: form.doctor || '—',
      vitals: { temp: '—', bp: '—', pulse: '—', resp: '—' }, admitted: false, admissionDays: null, room: null,
      history: [{ d: 'Today', t: 'Registered', s: `New patient registered${form.registrationFee ? ' — registration charge collected' : ''}.` }],
    };

    try {
      const saved = await apiCreatePatient(newPatient);
      setPatients((prev) => [saved || newPatient, ...prev]);
      if (form.registrationFee) {
        setBills((prev) => [...prev, { id: 'B-' + Math.floor(100 + Math.random() * 900), patientId: id, purpose: 'Registration', desc: 'Registration charge', amount: 200, paid: 200, status: 'Paid' }]);
      }
      showToast(`Patient ${form.name} registered (${id})`);
      return saved || newPatient;
    } catch (err) {
      setPatients((prev) => [newPatient, ...prev]);
      showToast(`Patient ${form.name} registered locally (${id})`);
      return newPatient;
    }
  }, [patients.length, showToast]);

  const updatePatient = useCallback(async (patientId, patch) => {
    try {
      const updated = await apiUpdatePatient(patientId, patch);
      setPatients((prev) => prev.map((p) => (p.id === patientId ? { ...p, ...updated } : p)));
      showToast('Patient updated');
      return updated;
    } catch (err) {
      setPatients((prev) => prev.map((p) => (p.id === patientId ? { ...p, ...patch } : p)));
      showToast('Patient updated locally');
      return null;
    }
  }, [showToast]);

  const deletePatient = useCallback(async (patientId) => {
    try {
      await apiDeletePatient(patientId);
      setPatients((prev) => prev.filter((p) => p.id !== patientId));
      showToast('Patient deleted');
      return true;
    } catch (err) {
      showToast('Could not delete patient from server');
      return false;
    }
  }, [showToast]);

  /* ---- Manager / FOS: booking / appointments ---- */
  const bookAppointment = useCallback((form) => {
    const patient = patients.find((p) => p.id === form.patientId);
    const newAppt = {
      id: 'A-' + Math.floor(100 + Math.random() * 900),
      time: form.time, date: form.date, patient: patient?.name || 'Unknown', patientId: form.patientId,
      doctor: form.doctor, status: 'confirmed',
    };
    setAppointments((prev) => [...prev, newAppt]);
    const charges = form.charges || [];
    if (charges.length > 0) {
      setBills((prev) => [
        ...prev,
        ...charges.map((c, i) => ({
          id: 'B-' + Math.floor(1000 + Math.random() * 9000) + i, patientId: form.patientId,
          purpose: c.purpose, desc: c.desc, amount: c.amount, paid: 0, status: 'Pending',
        })),
      ]);
    }
    setPatients((prev) => prev.map((p) => (p.id === form.patientId ? { ...p, lastVisit: form.date } : p)));
    const total = charges.reduce((sum, c) => sum + c.amount, 0);
    showToast(total > 0
      ? `Appointment booked with ${form.doctor} — ₹${total} added to Payments as pending`
      : `Appointment booked with ${form.doctor} — no charge due`);
    return newAppt;
  }, [patients, showToast]);

  /* ---- Manager only: user (staff) master ---- */
  const addUser = useCallback((form) => {
    const id = 'U-' + String(users.length + 1).padStart(3, '0');
    setUsers((prev) => [...prev, { id, name: form.name, designation: form.designation, mobile: form.mobile, email: form.email, status: 'Active' }]);
    showToast(`${form.name} added as ${form.designation}`);
  }, [users.length, showToast]);
  const toggleUserStatus = useCallback((id) => {
    setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, status: u.status === 'Active' ? 'Archived' : 'Active' } : u)));
  }, []);

  /* ---- Manager only: medicines master ---- */
  const addMedicine = useCallback((form) => {
    const id = 'M-' + String(medicines.length + 1).padStart(3, '0');
    setMedicines((prev) => [...prev, { id, name: form.name, scientificName: form.scientificName, unitCost: Number(form.unitCost), quantity: Number(form.quantity), status: 'Active' }]);
    showToast(`${form.name} added to medicines`);
  }, [medicines.length, showToast]);
  const updateMedicine = useCallback((id, patch) => {
    setMedicines((prev) => prev.map((m) => (m.id === id ? { ...m, ...patch } : m)));
  }, []);
  const toggleMedicineStatus = useCallback((id) => {
    setMedicines((prev) => prev.map((m) => (m.id === id ? { ...m, status: m.status === 'Active' ? 'Archived' : 'Active' } : m)));
  }, []);

  /* ---- Manager only: procedures master ---- */
  const addProcedure = useCallback((form) => {
    const id = 'PR-' + String(procedures.length + 1).padStart(3, '0');
    setProcedures((prev) => [...prev, { id, name: form.name, description: form.description, unitCost: Number(form.unitCost), status: 'Active' }]);
    showToast(`${form.name} added to procedures`);
  }, [procedures.length, showToast]);
  const updateProcedure = useCallback((id, patch) => {
    setProcedures((prev) => prev.map((p) => (p.id === id ? { ...p, ...patch } : p)));
  }, []);
  const toggleProcedureStatus = useCallback((id) => {
    setProcedures((prev) => prev.map((p) => (p.id === id ? { ...p, status: p.status === 'Active' ? 'Archived' : 'Active' } : p)));
  }, []);

  /* ---- Rooms (Manager manages master list; FOS allocates via Billing) ---- */
  const addRoom = useCallback((form) => {
    const id = 'R-' + form.name.replace(/\D/g, '');
    setRooms((prev) => [...prev, { id, name: form.name, facilities: form.facilities, perNightCost: Number(form.perNightCost), status: 'Available' }]);
    showToast(`${form.name} added`);
  }, [showToast]);
  const setRoomStatus = useCallback((id, status) => {
    setRooms((prev) => prev.map((r) => (r.id === id ? { ...r, status } : r)));
  }, []);

  const value = useMemo(() => ({
    screen, role, activeNav, patients, bills, appointments, users, medicines, procedures, rooms,
    drawerPatientId, toastMsg, toastVisible, userName, employeeId, token, authLoading,
    currentRole: role ? roleInfo(role) : null,
    login, register, logout, restoreSession, goToLogin, goToRegister, navigate,
    openPatient, closeDrawer, markBillPaid, issueBill, saveConsultation, savePrescription, showToast,
    addPatient, updatePatient, deletePatient, bookAppointment, payments, payPatientId, openPayment, closePayment, recordPayment,
    addUser, toggleUserStatus,
    addMedicine, updateMedicine, toggleMedicineStatus,
    addProcedure, updateProcedure, toggleProcedureStatus,
    addRoom, setRoomStatus,
  }), [screen, role, activeNav, patients, bills, appointments, users, medicines, procedures, rooms,
      drawerPatientId, toastMsg, toastVisible, userName, employeeId, token, authLoading,
      login, register, logout, restoreSession, goToLogin, goToRegister, navigate, openPatient, closeDrawer, markBillPaid, issueBill,
      saveConsultation, savePrescription, showToast, addPatient, updatePatient, deletePatient, bookAppointment,
      payments, payPatientId, openPayment, closePayment, recordPayment,
      addUser, toggleUserStatus, addMedicine, updateMedicine, toggleMedicineStatus,
      addProcedure, updateProcedure, toggleProcedureStatus, addRoom, setRoomStatus]);

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
