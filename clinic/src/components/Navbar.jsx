import React from 'react';
import { useApp } from '../AppContext.jsx';
import { PAGE_TITLES } from '../data.js';

export default function Navbar() {
  const { currentRole, activeNav, userName, searchTerm, setSearchTerm } = useApp();
  const title = PAGE_TITLES[activeNav] || 'Dashboard';

  return (
    <div className="topbar">
      <div className="title">{title}</div>
      <div className="right">
        <label className="search-box" aria-label="Search patients">
          <span>🔍</span>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search patients, bills..."
            aria-label="Search patients or bills"
          />
        </label>
        <div className="icon-btn">🔔<span className="dot" /></div>
        <div className="profile-chip">
          <div className="avatar" style={{ background: currentRole.accent }}>{currentRole.icon}</div>
          <div>
            <div className="name">{userName}</div>
            <div className="role">{currentRole.label}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
