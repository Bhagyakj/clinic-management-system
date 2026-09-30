import React, { useState } from 'react';
import { useApp } from '../AppContext.jsx';

export default function Login() {
  const { login, goToRegister, authLoading } = useApp();
  const [employeeId, setEmployeeId] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    if (!employeeId.trim() || !password) {
      setError('Enter your Employee ID and password.');
      return;
    }
    const result = await login(employeeId.trim(), password);
    if (!result.ok) setError(result.error);
  };

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
        <form className="login-card" onSubmit={handleLogin}>
          <div className="logo-row"><div className="mark">➕</div><span>MediFlow Clinic</span></div>
          <h1>Welcome back</h1>
          <p className="sub">Log in with your Employee ID and password. You'll go straight to your own dashboard.</p>

          <div className="field">
            <label>Employee ID</label>
            <input
              type="text" value={employeeId} autoComplete="username"
              onChange={(e) => { setEmployeeId(e.target.value); setError(''); }}
              placeholder="e.g. HSP-2001"
            />
          </div>

          <div className="field">
            <label>Password</label>
            <div className="pw-row">
              <input
                type={showPw ? 'text' : 'password'} value={password} autoComplete="current-password"
                onChange={(e) => { setPassword(e.target.value); setError(''); }}
                placeholder="Enter your password"
              />
              <button type="button" className="pw-toggle" onClick={() => setShowPw((v) => !v)}>{showPw ? 'Hide' : 'Show'}</button>
            </div>
          </div>

          {error && <div className="login-error">{error}</div>}

          <button type="submit" className="btn-primary" disabled={authLoading}>
            {authLoading ? 'Logging in…' : 'Log in'}
          </button>

          <p className="hint">
            New here? <button type="button" className="link-btn" onClick={goToRegister}>Create an account</button>
          </p>
        </form>
      </div>
    </div>
  );
}
