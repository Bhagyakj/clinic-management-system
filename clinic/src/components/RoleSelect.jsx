import React from 'react';
import { useApp } from '../AppContext.jsx';
import { ROLES } from '../data.js';

export default function RoleSelect() {
  const { enterRole } = useApp();
  return (
    <div className="rs-wrap">
      <div className="rs-top">
        <div className="rs-brand"><div className="mark">➕</div><span>MediFlow Clinic</span></div>
        <div className="rs-user"><div className="avatar">JD</div>Welcome, Dr. John ▾</div>
      </div>
      <div className="rs-hero">
        <h1>Hello,User 👋</h1>
        <p>Select a role to continue to its dashboard</p>
      </div>
      <div className="role-grid">
        {ROLES.map((r) => (
          <button
            key={r.id}
            className="role-card"
            style={{ '--rc': r.accent, '--rs': r.soft }}
            onClick={() => enterRole(r.id)}
          >
            <div className="icon">{r.icon}</div>
            <h3>{r.label}</h3>
            <p>{r.desc}</p>
            <div className="go">Continue →</div>
          </button>
        ))}
      </div>
    </div>
  );
}
