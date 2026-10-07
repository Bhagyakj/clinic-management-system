import React, { useState } from "react";
import { useApp } from "../AppContext.jsx";
import { DESIGNATIONS } from "../data.js";

export default function Register() {
  const { register, goToLogin, authLoading } = useApp();
  const [name, setName] = useState("");
  const [employeeId, setEmployeeId] = useState("");
  const [designation, setDesignation] = useState(DESIGNATIONS[0]);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!name.trim() || !employeeId.trim() || !password) {
      setError("Name, Employee ID and password are all required.");
      return;
    }
    if (password.length < 6) {
      setError("Password should be at least 6 characters.");
      return;
    }
    if (password !== confirm) {
      setError("Passwords don't match.");
      return;
    }
    const result = await register({
      name: name.trim(),
      employeeId: employeeId.trim(),
      designation,
      password,
    });
    if (!result.ok) {
      setError(result.error);
      return;
    }
    setDone(true);
  };

  return (
    <div className="login-wrap">
      <div className="login-art">
        <div className="brand">
          <div className="mark">➕</div>
          <h2>Set up your MediFlow account.</h2>
          <p>
            Your Manager or IT admin gives you an Employee ID — use it here to
            create your login.
          </p>
        </div>
      </div>
      <div className="login-form-side">
        {done ? (
          <div className="login-card">
            <div className="logo-row">
              <div className="mark">➕</div>
              <span>MediFlow Clinic</span>
            </div>
            <h1>Account created</h1>
            <div className="login-info">
              {name}'s account ({employeeId}) is ready. You can log in now.
            </div>
            <button className="btn-primary" onClick={goToLogin}>
              Go to login
            </button>
          </div>
        ) : (
          <form className="login-card" onSubmit={handleSubmit}>
            <div className="logo-row">
              <div className="mark">➕</div>
              <span>MediFlow Clinic</span>
            </div>
            <h1>Create your account</h1>
            <p className="sub">
              This registers you against the clinic's staff directory.
            </p>

            <div className="field">
              <label>Full name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  setError("");
                }}
                placeholder="e.g. Dr. Arjun Rao"
              />
            </div>
            <div className="field">
              <label>Employee ID</label>
              <input
                type="text"
                value={employeeId}
                onChange={(e) => {
                  setEmployeeId(e.target.value);
                  setError("");
                }}
                placeholder="e.g. HSP-2001"
              />
            </div>
            <div className="field">
              <label>Designation</label>
              <select
                value={designation}
                onChange={(e) => setDesignation(e.target.value)}
              >
                {DESIGNATIONS.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>
            <div className="field">
              <label>Password</label>
              <input
                type="password"
                value={password}
                autoComplete="new-password"
                onChange={(e) => {
                  setPassword(e.target.value);
                  setError("");
                }}
                placeholder="At least 6 characters"
              />
            </div>
            <div className="field">
              <label>Confirm password</label>
              <input
                type="password"
                value={confirm}
                autoComplete="new-password"
                onChange={(e) => {
                  setConfirm(e.target.value);
                  setError("");
                }}
                placeholder="Re-enter password"
              />
            </div>

            {error && <div className="login-error">{error}</div>}

            <button
              type="submit"
              className="btn-primary"
              disabled={authLoading}
            >
              {authLoading ? "Creating account…" : "Create account"}
            </button>

            <p className="hint">
              Already have an account?{" "}
              <button type="button" className="link-btn" onClick={goToLogin}>
                Log in
              </button>
            </p>
          </form>
        )}
      </div>
    </div>
  );
}
