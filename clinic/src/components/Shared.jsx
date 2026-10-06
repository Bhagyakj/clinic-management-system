import React from 'react';
import { useApp } from '../AppContext.jsx';

export function Badge({ status }) {
  const map = { confirmed: 'Confirmed', waiting: 'Waiting', completed: 'Completed', progress: 'In Progress', pending: 'Pending', stable: 'Stable', recovering: 'Recovering', monitoring: 'Monitoring' };
  return <span className={`badge ${status}`}>{map[status] || status}</span>;
}

export function PayBadge({ status }) {
  if (status === 'Paid') return <span className="badge stable">Paid</span>;
  if (status === 'Pending') return <span className="badge pending">Pending</span>;
  return <span className="badge" style={{ background: '#EEF1F8', color: 'var(--muted)' }}>—</span>;
}

export function StatCard({ label, value, delta, neg }) {
  return (
    <div className="stat-card">
      <div className="lbl">{label}</div>
      <div className="val">{value}</div>
      <div className={`delta ${neg ? 'neg' : ''}`}>{delta}</div>
    </div>
  );
}

export function QuickAction({ icon, label, nav, onClick }) {
  const { navigate, showToast } = useApp();
  return (
    <button
      className="qa-btn"
      onClick={() => (nav ? navigate(nav) : onClick ? onClick() : showToast(`${label} — demo action`))}
    >
      <div className="ic">{icon}</div>
      {label}
    </button>
  );
}

export function NameLink({ id, children }) {
  const { openPatient } = useApp();
  return (
    <button className="name-link" onClick={() => openPatient(id)}>
      {children}
    </button>
  );
}

export function Toast() {
  const { toastMsg, toastVisible } = useApp();
  return <div className={`toast ${toastVisible ? 'show' : ''}`}>{toastMsg}</div>;
}

// Real Room.status values are lowercase: 'available' | 'occupied' | 'maintenance'
export function Donut({ rooms }) {
  const total = rooms ? rooms.length : 0;
  const avail = rooms ? rooms.filter((r) => r.status === 'available').length : 0;
  const occ = rooms ? rooms.filter((r) => r.status === 'occupied').length : 0;
  const closed = rooms ? rooms.filter((r) => r.status === 'maintenance').length : 0;
  const pctOcc = total > 0 ? (occ / total) * 100 : 0;
  return (
    <div className="donut-wrap">
      <svg width="130" height="130" viewBox="0 0 36 36">
        <circle cx="18" cy="18" r="15.9" fill="none" stroke="#E4E9F2" strokeWidth="4" />
        <circle
          cx="18" cy="18" r="15.9" fill="none" stroke="#2563EB" strokeWidth="4"
          strokeDasharray={`${pctOcc} ${100 - pctOcc}`} strokeDashoffset="25"
          transform="rotate(-90 18 18)"
        />
        <text x="18" y="17" textAnchor="middle" fontSize="6" fontWeight="700" fill="#1B2340" fontFamily="Lexend">{total}</text>
        <text x="18" y="22.5" textAnchor="middle" fontSize="2.6" fill="#6B7488">Total rooms</text>
      </svg>
      <div>
        <div className="legend-item"><span className="legend-dot" style={{ background: '#E4E9F2', border: '2px solid #189A5B' }} />Available — {avail}</div>
        <div className="legend-item"><span className="legend-dot" style={{ background: '#2563EB' }} />Occupied — {occ}</div>
        <div className="legend-item"><span className="legend-dot" style={{ background: '#D9435E' }} />Maintenance — {closed}</div>
      </div>
    </div>
  );
}
