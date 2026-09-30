import React, { useState } from 'react';
import { useApp } from '../AppContext.jsx';
import { NameLink, Badge } from './Shared.jsx';

export default function Appointments() {
  const { patients, appointments, showToast, navigate, bookAppointment } = useApp();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ patientId: patients[0]?.id, doctor: 'Dr. Mehta', date: new Date().toISOString().slice(0, 10), time: '09:00 AM' });

  const set = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  const submit = (e) => {
    e.preventDefault();
    bookAppointment(form);
    setShowForm(false);
  };

  return (
    <>
      <div className="page-head">
        <div><h1>Appointments</h1><div className="desc">All doctors • All statuses</div></div>
        <button className="btn btn-accent" onClick={() => setShowForm((s) => !s)}>{showForm ? 'Cancel' : '+ Book appointment'}</button>
      </div>

      {showForm && (
        <form className="card" style={{ marginBottom: 16 }} onSubmit={submit}>
          <h3>Book appointment</h3>
          <div className="form-grid cols-3">
            <div className="field"><label>Patient</label>
              <select value={form.patientId} onChange={set('patientId')}>
                {patients.map((p) => <option key={p.id} value={p.id}>{p.name} — {p.id}</option>)}
              </select>
            </div>
            <div className="field"><label>Doctor</label>
              <select value={form.doctor} onChange={set('doctor')}>
                <option>Dr. Mehta</option><option>Dr. Patel</option><option>Dr. Sharma</option><option>Dr. Verma</option>
              </select>
            </div>
            <div className="field"><label>Date</label><input type="date" value={form.date} onChange={set('date')} /></div>
            <div className="field"><label>Time</label><input type="text" value={form.time} onChange={set('time')} placeholder="e.g. 09:00 AM" /></div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
            <button type="button" className="btn" onClick={() => setShowForm(false)}>Cancel</button>
            <button type="submit" className="btn btn-accent">Book appointment</button>
          </div>
        </form>
      )}

      <div className="card">
        <div style={{ display: 'flex', gap: 10, marginBottom: 16 }}>
          <select style={{ padding: '8px 12px', border: '1px solid var(--line)', borderRadius: 8, fontSize: 13 }}><option>All doctors</option></select>
          <select style={{ padding: '8px 12px', border: '1px solid var(--line)', borderRadius: 8, fontSize: 13 }}><option>All statuses</option></select>
        </div>
        <table>
          <tbody>
            <tr><th>Time</th><th>Patient</th><th>Doctor</th><th>Status</th><th>Actions</th></tr>
            {appointments.map((a) => (
              <tr key={a.id}>
                <td>{a.time}</td>
                <td><NameLink id={a.patientId}>{a.patient}</NameLink></td>
                <td>{a.doctor}</td>
                <td><Badge status={a.status} /></td>
                <td><button className="btn btn-sm" onClick={() => navigate('consultation')}>View</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
