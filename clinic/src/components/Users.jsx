import React, { useState } from 'react';
import { useApp } from '../AppContext.jsx';

const DESIGNATIONS = ['Front Office Staff', 'Junior Doctor', 'Senior Doctor', 'Nurse', 'Pharmacist', 'Manager'];

export default function Users() {
  const { users, addUser, toggleUserStatus } = useApp();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', designation: DESIGNATIONS[0], mobile: '', email: '' });

  const set = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));
  const submit = (e) => {
    e.preventDefault();
    if (!form.name) return;
    addUser(form);
    setForm({ name: '', designation: DESIGNATIONS[0], mobile: '', email: '' });
    setShowForm(false);
  };

  return (
    <>
      <div className="page-head">
        <div><h1>Users</h1><div className="desc">Doctors, nurses, pharmacists and front office staff</div></div>
        <button className="btn btn-accent" onClick={() => setShowForm((s) => !s)}>{showForm ? 'Cancel' : '+ Add user'}</button>
      </div>

      {showForm && (
        <form className="card" style={{ marginBottom: 16 }} onSubmit={submit}>
          <h3>Add user</h3>
          <div className="form-grid cols-3">
            <div className="field"><label>Full name</label><input type="text" value={form.name} onChange={set('name')} placeholder="e.g. Dr. Priya Iyer" /></div>
            <div className="field"><label>Designation</label>
              <select value={form.designation} onChange={set('designation')}>
                {DESIGNATIONS.map((d) => <option key={d}>{d}</option>)}
              </select>
            </div>
            <div className="field"><label>Mobile</label><input type="text" value={form.mobile} onChange={set('mobile')} placeholder="10-digit mobile" /></div>
            <div className="field"><label>Email</label><input type="email" value={form.email} onChange={set('email')} placeholder="name@mediflow.clinic" /></div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
            <button type="button" className="btn" onClick={() => setShowForm(false)}>Cancel</button>
            <button type="submit" className="btn btn-accent">Add user</button>
          </div>
        </form>
      )}

      <div className="card">
        <table>
          <tbody>
            <tr><th>ID</th><th>Name</th><th>Designation</th><th>Mobile</th><th>Email</th><th>Status</th><th></th></tr>
            {users.map((u) => (
              <tr key={u.id}>
                <td>{u.id}</td>
                <td style={{ fontWeight: 600 }}>{u.name}</td>
                <td>{u.designation}</td>
                <td>{u.mobile}</td>
                <td>{u.email}</td>
                <td><span className={`badge ${u.status === 'Active' ? 'stable' : 'pending'}`}>{u.status}</span></td>
                <td>
                  <button className="btn btn-sm" onClick={() => toggleUserStatus(u.id)}>
                    {u.status === 'Active' ? 'Archive' : 'Reactivate'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
