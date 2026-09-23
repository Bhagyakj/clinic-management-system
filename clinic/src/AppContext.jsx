import React, { createContext, useContext, useMemo, useState, useCallback } from 'react';
import { INITIAL_PATIENTS, INITIAL_BILLS, roleInfo } from './data.js';

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [screen, setScreen] = useState('login');   // 'login' | 'roleselect' | 'app'
  const [role, setRole] = useState(null);
  const [activeNav, setActiveNav] = useState('dashboard');
  const [patients, setPatients] = useState(INITIAL_PATIENTS);
  const [bills, setBills] = useState(INITIAL_BILLS);
  const [drawerPatientId, setDrawerPatientId] = useState(null);
  const [toastMsg, setToastMsg] = useState('');
  const [toastVisible, setToastVisible] = useState(false);

  const showToast = useCallback((msg) => {
    setToastMsg(msg);
    setToastVisible(true);
    setTimeout(() => setToastVisible(false), 2200);
  }, []);

  const goLogin = useCallback(() => setScreen('login'), []);
  const goRoleSelect = useCallback(() => setScreen('roleselect'), []);
  const enterRole = useCallback((roleId) => {
    setRole(roleId);
    setActiveNav('dashboard');
    setScreen('app');
  }, []);
  const navigate = useCallback((navKey) => setActiveNav(navKey), []);

  const openPatient = useCallback((id) => setDrawerPatientId(id), []);
  const closeDrawer = useCallback(() => setDrawerPatientId(null), []);

  const markBillPaid = useCallback((billId) => {
    setBills((prev) => {
      const next = prev.map((b) => (b.id === billId ? { ...b, status: 'Paid' } : b));
      const bill = next.find((b) => b.id === billId);
      const patient = patients.find((p) => p.id === bill?.patientId);
      showToast(patient ? `Marked paid — ${patient.name} is now fully cleared` : 'Bill marked as paid');
      return next;
    });
  }, [patients, showToast]);

  const issueBill = useCallback(({ patientId, admissionYes, admissionDays, room, amount = 890 }) => {
    const newBill = {
      id: 'B-' + Math.floor(100 + Math.random() * 900),
      patientId,
      desc: admissionYes ? `Admission — ${room} (${admissionDays} day(s)) + charges` : 'Consultation + charges',
      amount,
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
          { d: 'Today', t: `Admitted — ${room}`, s: `Admission required: Yes, ${admissionDays} day(s). Bill ${newBill.id} issued (₹${amount}) — pending payment.` },
          ...p.history,
        ],
      };
    }));
    showToast(admissionYes ? `Bill issued — admission for ${admissionDays} day(s). Payment pending.` : 'Bill issued — payment pending. Mark it paid from Payments.');
    return newBill;
  }, [showToast]);

  const saveConsultation = useCallback(() => {
    showToast('Consultation saved to patient record');
  }, [showToast]);

  const savePrescription = useCallback(() => {
    showToast('Prescription saved and sent to pharmacy');
  }, [showToast]);

  const value = useMemo(() => ({
    screen, role, activeNav, patients, bills, drawerPatientId, toastMsg, toastVisible,
    currentRole: role ? roleInfo(role) : null,
    goLogin, goRoleSelect, enterRole, navigate,
    openPatient, closeDrawer, markBillPaid, issueBill, saveConsultation, savePrescription, showToast,
  }), [screen, role, activeNav, patients, bills, drawerPatientId, toastMsg, toastVisible,
      goLogin, goRoleSelect, enterRole, navigate, openPatient, closeDrawer, markBillPaid, issueBill,
      saveConsultation, savePrescription, showToast]);

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
