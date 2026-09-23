import React from 'react';
import { useApp } from '../AppContext.jsx';
import { NAV, PAGE_TITLES } from '../data.js';
import Dashboard from './Dashboard.jsx';
import Patients from './Patients.jsx';
import Appointments from './Appointments.jsx';
import Consultation from './Consultation.jsx';
import Prescription from './Prescription.jsx';
import Billing from './Billing.jsx';
import Payments from './Payments.jsx';
import Admissions from './Admissions.jsx';
import PatientDrawer from './PatientDrawer.jsx';
import Navbar from './Navbar.jsx';

export default function AppShell() {
  const { role, currentRole, activeNav, navigate, goRoleSelect } = useApp();
  const navItems = NAV[role] || [];

  React.useEffect(() => {
    document.documentElement.style.setProperty('--role-accent', currentRole.accent);
    document.documentElement.style.setProperty('--role-soft', currentRole.soft);
  }, [currentRole]);

  return (
    <div className="app-shell">
      <div className="sidebar">
        <div className="brand"><div className="mark">➕</div><span>MediFlow</span></div>
        {navItems.map(([key, icon, label]) => (
          <div
            key={key}
            className={`nav-item ${activeNav === key ? 'active' : ''}`}
            onClick={() => navigate(key)}
          >
            <span className="ic">{icon}</span>{label}
          </div>
        ))}
        <div className="sidebar-bottom">
          <div className="nav-sep" />
          <div className="nav-item logout-item" onClick={goRoleSelect}>
            <span className="ic">↩️</span>Switch role
          </div>
        </div>
      </div>
      <div className="main">
        <Navbar />
        <div className="content">
          <PageRouter navKey={activeNav} />
        </div>
      </div>
      <PatientDrawer />
    </div>
  );
}

function PageRouter({ navKey }) {
  switch (navKey) {
    case 'patients': return <Patients />;
    case 'appointments': return <Appointments />;
    case 'consultation': return <Consultation />;
    case 'prescription': return <Prescription />;
    case 'billing': return <Billing />;
    case 'payments': return <Payments />;
    case 'admissions': return <Admissions />;
    case 'dashboard': return <Dashboard />;
    default:
      return (
        <>
          <div className="page-head">
            <div><h1>{PAGE_TITLES[navKey] || 'Dashboard'}</h1><div className="desc">Section under this role's workspace</div></div>
          </div>
          <div className="card" style={{ textAlign: 'center', padding: '50px 20px', color: 'var(--muted)' }}>
            <div style={{ fontSize: 30, marginBottom: 10 }}>🗂️</div>
            This is a placeholder for the <b>{PAGE_TITLES[navKey] || navKey}</b> section — build it out the same way as Patients/Billing.
          </div>
        </>
      );
  }
}
