import React from 'react';
import { useApp } from '../AppContext.jsx';

export default function Login() {
  const { goRoleSelect, showToast } = useApp();
  return (
    <div className="login-wrap">
      <div className="login-art">
        <div className="brand">
          <div className="mark">➕</div>
          <h2>Better care starts with better management.</h2>
          <p>One system for reception, doctors, nursing and pharmacy — built around how your clinic actually runs the day.</p>
        </div>
      </div>
      <div className="login-form-side">
        <div className="login-card">
          <div className="logo-row"><div className="mark">➕</div><span>MediFlow Clinic</span></div>
          <h1>Welcome back</h1>
          <p className="sub">Log in with your Hospital ID and OTP.</p>
          <div className="field"><label>Hospital ID</label><input type="text" defaultValue="HSP-2291" /></div>
          <div className="otp-row">
            <div className="field"><label>OTP</label><input type="text" placeholder="Enter 6-digit OTP" maxLength={6} /></div>
          </div>
          <button className="link-btn" style={{ margin: '8px 0 4px' }} onClick={() => showToast('OTP sent to registered mobile number')}>Get OTP</button>
          <button className="btn-primary" onClick={goRoleSelect}>Log in</button>
          <p className="hint">Trouble logging in? Contact your clinic administrator.</p>
        </div>
      </div>
    </div>
  );
}