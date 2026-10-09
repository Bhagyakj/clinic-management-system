import React, { createContext, useContext, useMemo, useState, useCallback } from 'react';
import {
  roleInfo, DESIGNATION_TO_ROLE,
  INITIAL_USERS, INITIAL_MEDICINES, INITIAL_PROCEDURES, // still mock — no backend for these yet
} from './data.js';
import { apiLogin, apiRegister, apiGetMe, authed } from './api.js';

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [screen, setScreen] = useState('login');   // 'login' | 'register' | 'app'
  const [role, setRole] = useState(null);
  const [userName, setUserName] = useState('');
  const [employeeId, setEmployeeId] = useState('');
  const [token, setToken] = useState(() => localStorage.getItem('mf_token') || '');
  const [authLoading, setAuthLoading] = useState(false);
  const [activeNav, setActiveNav] = useState('dashboard');

  // Real data from the API. Empty until loadAllData() runs after login.
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [bills, setBills] = useState([]);       // Payment documents
  const [rooms, setRooms] = useState([]);
  const [admissions, setAdmissions] = useState([]); // PatientRoom documents
  const [dataLoading, setDataLoading] = useState(false);
  const [dataError, setDataError] = useState('');

  // Still local/mock — no backend built yet for Users (beyond auth), Medicines, Procedures
  const [users, setUsers] = useState(INITIAL_USERS);
  const [medicines, setMedicines] = useState(INITIAL_MEDICINES);
  const [procedures, setProcedures] = useState(INITIAL_PROCEDURES);

  // collectPayment is a per-BILL action (POST /payments/:id/collect splits
  // across that one bill's own purpose lines) — so the popup is keyed by
  // billId, not patientId. A patient with several separate bills needs the
  // Payments page to collect each one individually.
  const [payBillId, setPayBillId] = useState(null);
  const [drawerPatientId, setDrawerPatientId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [toastMsg, setToastMsg] = useState('');
  const [toastVisible, setToastVisible] = useState(false);

  const showToast = useCallback((msg) => {
    setToastMsg(msg);
    setToastVisible(true);
    setTimeout(() => setToastVisible(false), 2200);
  }, []);

  const api = useMemo(() => (token ? authed(token) : null), [token]);

  // Loads every collection the app needs in one go. Takes an explicit client
  // (rather than always relying on the `api` memo) so it can run immediately
  // after login/restoreSession, before `token` state has re-rendered `api`.
  const loadAllData = useCallback(async (client) => {
    setDataLoading(true);
    setDataError('');
    try {
      const [p, d, r, pay, appt, adm] = await Promise.all([
        client.listPatients(), client.listDoctors(), client.listRooms(),
        client.listPayments(), client.listAppointments(), client.listAdmissions(),
      ]);
      setPatients(p); setDoctors(d); setRooms(r); setBills(pay); setAppointments(appt); setAdmissions(adm);
    } catch (err) {
      setDataError(err.message);
      showToast(`Couldn't load data from the server: ${err.message}`);
    } finally {
      setDataLoading(false);
    }
  }, [showToast]);

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
      await loadAllData(authed(data.token));
      return { ok: true };
    } catch (err) {
      return { ok: false, error: err.message };
    } finally {
      setAuthLoading(false);
    }
  }, [loadAllData]);

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
      await loadAllData(authed(saved));
    } catch {
      localStorage.removeItem('mf_token');
    }
  }, [loadAllData]);

  const goToLogin = useCallback(() => setScreen('login'), []);
  const goToRegister = useCallback(() => setScreen('register'), []);

  const logout = useCallback(() => {
    localStorage.removeItem('mf_token');
    setToken(''); setRole(null); setUserName(''); setEmployeeId('');
    setPatients([]); setDoctors([]); setAppointments([]); setBills([]); setRooms([]); setAdmissions([]);
    setScreen('login');
  }, []);

  const navigate = useCallback((navKey) => setActiveNav(navKey), []);
  const openPatient = useCallback((id) => setDrawerPatientId(id), []);
  const closeDrawer = useCallback(() => setDrawerPatientId(null), []);
  const openPayment = useCallback((billId) => setPayBillId(billId), []);
  const closePayment = useCallback(() => setPayBillId(null), []);

  /* ---- Patients: real API ---- */
  // `form.patientId` throughout this file means the patient's Mongo _id —
  // that's what every cross-referencing endpoint (appointments/payments/
  // admissions) expects, and it's always present on a fetched patient.
  const addPatient = useCallback(async (form) => {
    if (!api) return;
    try {
      const patient = await api.createPatient({
        name: String(form.name || '').trim(),
        gender: form.gender,
        age: form.age,
        phone: String(form.phone || '').trim(),
        doctor: form.doctor || '—',
      });
      setPatients((prev) => [patient, ...prev]);
      if (form.registrationFee) {
        const bill = await api.createBill({ patientId: patient._id, purpose: [{ description: 'Registration charge', amount: 200 }] });
        const paid = await api.collectPayment(bill._id, { amount: 200, method: 'Cash' });
        setBills((prev) => [paid, ...prev.filter((b) => b._id !== bill._id)]);
      }
      showToast(`Patient ${form.name} registered (${patient.id})`);
      return patient;
    } catch (err) {
      showToast(err?.message ? `Couldn't register patient: ${err.message}` : 'Couldn\'t register patient. Check the form and try again.');
    }
  }, [api, showToast]);

  /* ---- Appointments: real API ---- */
  const bookAppointment = useCallback(async (form) => {
    if (!api) return;
    if (!form || !form.patientId || !form.doctorId || !form.date || !form.time) {
      showToast('Select a patient, doctor, date and time before booking.');
      return;
    }
    try {
      const appt = await api.bookAppointment({
        patientId: form.patientId, doctorId: form.doctorId, date: form.date, time: form.time, notes: form.notes,
      });
      const doctor = doctors.find((d) => d._id === form.doctorId) || { _id: form.doctorId, name: form.doctor || 'Doctor' };
      const normalizedAppointment = {
        ...appt,
        doctorId: typeof appt.doctorId === 'object' && appt.doctorId
          ? appt.doctorId
          : { _id: doctor._id, name: doctor.name, specialization: doctor.specialization || '' },
      };
      const charges = form.charges || [];
      const createdBills = [];
      for (const c of charges) {
        const bill = await api.createBill({ patientId: form.patientId, purpose: [{ description: c.desc, amount: c.amount }] });
        createdBills.push(bill);
      }
      // bookAppointment updates appointmentHistory/lastVisit/doctor on the
      // server — refetch just this one patient rather than the whole list.
      const refreshed = await api.getPatient(form.patientIdCustom);
      setPatients((prev) => prev.map((p) => (p._id === refreshed._id ? refreshed : p)));
      setAppointments((prev) => [normalizedAppointment, ...prev]);
      if (createdBills.length) setBills((prev) => [...createdBills, ...prev]);
      const total = charges.reduce((sum, c) => sum + c.amount, 0);
      showToast(total > 0
        ? `Appointment booked — ₹${total} added to Payments as pending`
        : 'Appointment booked — no charge due');
      return appt;
    } catch (err) {
      showToast(`Couldn't book appointment: ${err.message}`);
    }
  }, [api, doctors, showToast]);

  /* ---- Billing: real API ---- */
  const createBill = useCallback(async (patientId, items) => {
    if (!api) return;
    try {
      const bill = await api.createBill({ patientId, purpose: items.map((i) => ({ description: i.desc, amount: i.amount })) });
      setBills((prev) => [bill, ...prev]);
      showToast('Bill issued — payment pending.');
      return bill;
    } catch (err) {
      showToast(`Couldn't issue bill: ${err.message}`);
    }
  }, [api, showToast]);

  // Collects a (possibly partial) payment against ONE bill, splitting it
  // across that bill's purpose lines oldest-first (done server-side).
  const collectPayment = useCallback(async (billId, { amount, method, reference }) => {
    if (!api) return;
    try {
      const updated = await api.collectPayment(billId, { amount, method, transactionId: reference });
      setBills((prev) => prev.map((b) => (b._id === billId ? updated : b)));
      const patient = patients.find((p) => p._id === updated.patientId);
      showToast(updated.status === 'paid'
        ? `₹${amount} received — ${patient?.name || 'patient'} is fully cleared on this bill`
        : `₹${amount} received — ₹${updated.totalAmount - updated.paidAmount} still pending on this bill`);
      return updated;
    } catch (err) {
      showToast(`Couldn't record payment: ${err.message}`);
    }
  }, [api, patients, showToast]);

  /* ---- Rooms: real API (Manager manages the list; FOS allocates via Admissions) ---- */
  const addRoom = useCallback(async (form) => {
    if (!api) return;
    try {
      const room = await api.createRoom({
        roomNumber: form.roomNumber, type: form.type || 'general', capacity: Number(form.capacity) || 1,
        perNightCost: Number(form.perNightCost), facilities: form.facilities || [],
      });
      setRooms((prev) => [...prev, room]);
      showToast(`Room ${room.roomNumber} added`);
    } catch (err) {
      showToast(`Couldn't add room: ${err.message}`);
    }
  }, [api, showToast]);

  const setRoomStatus = useCallback(async (roomId, status) => {
    if (!api) return;
    try {
      const room = await api.updateRoomStatus(roomId, status);
      setRooms((prev) => prev.map((r) => (r._id === roomId ? room : r)));
    } catch (err) {
      showToast(`Couldn't update room: ${err.message}`);
    }
  }, [api, showToast]);

  /* ---- Admissions: real API ---- */
  const admitPatient = useCallback(async (form) => {
    if (!api) return;
    try {
      const admission = await api.admitPatient({ patientId: form.patientId, roomId: form.roomId, fromDate: form.fromDate });
      setAdmissions((prev) => [admission, ...prev]);
      // admitPatient updates patient.admitted/room/type and the room's status server-side
      const [refreshedPatient, refreshedRooms] = await Promise.all([api.getPatient(form.patientIdCustom), api.listRooms()]);
      setPatients((prev) => prev.map((p) => (p._id === refreshedPatient._id ? refreshedPatient : p)));
      setRooms(refreshedRooms);
      showToast(`Admitted to Room ${form.roomNumber || ''}`.trim());
      return admission;
    } catch (err) {
      showToast(`Couldn't admit patient: ${err.message}`);
    }
  }, [api, showToast]);

  const dischargePatient = useCallback(async (admissionId, { toDate, patientIdCustom }) => {
    if (!api) return;
    try {
      const result = await api.dischargePatient(admissionId, { toDate });
      setAdmissions((prev) => prev.map((a) => (a._id === admissionId ? result.admission : a)));
      if (result.bill) setBills((prev) => [result.bill, ...prev]);
      const [refreshedPatient, refreshedRooms] = await Promise.all([api.getPatient(patientIdCustom), api.listRooms()]);
      setPatients((prev) => prev.map((p) => (p._id === refreshedPatient._id ? refreshedPatient : p)));
      setRooms(refreshedRooms);
      showToast(result.bill
        ? `Discharged — ${result.nights} night(s), ₹${result.bill.totalAmount} room-rent bill issued`
        : 'Discharged');
      return result;
    } catch (err) {
      showToast(`Couldn't discharge patient: ${err.message}`);
    }
  }, [api, showToast]);

  const saveConsultation = useCallback(() => {
    showToast('Consultation saved to patient record (demo only — not yet persisted to the server)');
  }, [showToast]);

  const savePrescription = useCallback(() => {
    showToast('Prescription saved and sent to pharmacy (demo only — not yet persisted to the server)');
  }, [showToast]);

  /* ---- Manager only: user (staff) master — still local/mock ---- */
  const addUser = useCallback((form) => {
    const id = 'U-' + String(users.length + 1).padStart(3, '0');
    setUsers((prev) => [...prev, { id, name: form.name, designation: form.designation, mobile: form.mobile, email: form.email, status: 'Active' }]);
    showToast(`${form.name} added as ${form.designation}`);
  }, [users.length, showToast]);
  const toggleUserStatus = useCallback((id) => {
    setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, status: u.status === 'Active' ? 'Archived' : 'Active' } : u)));
  }, []);

  /* ---- Manager only: medicines master — still local/mock ---- */
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

  /* ---- Manager only: procedures master — still local/mock ---- */
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

  const value = useMemo(() => ({
    screen, role, activeNav, patients, doctors, bills, appointments, rooms, admissions,
    dataLoading, dataError, users, medicines, procedures,
    drawerPatientId, searchTerm, setSearchTerm, toastMsg, toastVisible, userName, employeeId, token, authLoading,
    currentRole: role ? roleInfo(role) : null,
    login, register, logout, restoreSession, goToLogin, goToRegister, navigate, loadAllData,
    openPatient, closeDrawer, saveConsultation, savePrescription, showToast,
    addPatient, bookAppointment, createBill, collectPayment,
    payBillId, openPayment, closePayment,
    addRoom, setRoomStatus, admitPatient, dischargePatient,
    addUser, toggleUserStatus,
    addMedicine, updateMedicine, toggleMedicineStatus,
    addProcedure, updateProcedure, toggleProcedureStatus,
  }), [screen, role, activeNav, patients, doctors, bills, appointments, rooms, admissions,
      dataLoading, dataError, users, medicines, procedures,
      drawerPatientId, searchTerm, toastMsg, toastVisible, userName, employeeId, token, authLoading,
      login, register, logout, restoreSession, goToLogin, goToRegister, navigate, loadAllData,
      openPatient, closeDrawer, saveConsultation, savePrescription, showToast,
      addPatient, bookAppointment, createBill, collectPayment,
      payBillId, openPayment, closePayment,
      addRoom, setRoomStatus, admitPatient, dischargePatient,
      addUser, toggleUserStatus, addMedicine, updateMedicine, toggleMedicineStatus,
      addProcedure, updateProcedure, toggleProcedureStatus]);

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
