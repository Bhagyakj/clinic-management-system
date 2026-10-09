import React, { useMemo, useState } from 'react';
import { useApp } from '../AppContext.jsx';
import { appointmentCharges } from '../data.js';
import { NameLink, Badge } from './Shared.jsx';

const today = () => new Date().toISOString().slice(0, 10);

const getDoctorId = (appointment) => {
  if (!appointment?.doctorId) return '';
  if (typeof appointment.doctorId === 'string') return appointment.doctorId;
  if (typeof appointment.doctorId === 'object') return appointment.doctorId._id || '';
  return '';
};

const getDoctorName = (appointment, doctors) => {
  if (appointment?.doctorId && typeof appointment.doctorId === 'object' && appointment.doctorId.name) {
    return appointment.doctorId.name;
  }
  const doctor = doctors.find((d) => d._id === getDoctorId(appointment));
  if (doctor?.name) return doctor.name;
  if (appointment?.doctor) return appointment.doctor;
  return '—';
};

export default function Appointments() {
  const { patients, doctors, bills, appointments, dataLoading, navigate, bookAppointment } = useApp();
  const [showForm, setShowForm] = useState(false);
  const [patientId, setPatientId] = useState(patients[0]?._id || '');
  const [doctorId, setDoctorId] = useState(doctors[0]?._id || '');
  const [selectedDoctorId, setSelectedDoctorId] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [date, setDate] = useState(today());
  const [time, setTime] = useState('09:00 AM');

  const patient = patients.find((p) => p._id === patientId);
  const doctor = doctors.find((d) => d._id === doctorId);
  const { charges, note } = patient ? appointmentCharges(patient, bills, date) : { charges: [], note: '' };
  const total = charges.reduce((sum, c) => sum + c.amount, 0);

  const filteredAppointments = useMemo(() => appointments.filter((a) => {
    const matchesDoctor = selectedDoctorId === 'all' || getDoctorId(a) === selectedDoctorId;
    const matchesStatus = selectedStatus === 'all' || String(a.status || '').toLowerCase() === selectedStatus;
    return matchesDoctor && matchesStatus;
  }), [appointments, selectedDoctorId, selectedStatus]);

  const submit = async (e) => {
    e.preventDefault();
    if (!patient || !doctor) return;
    await bookAppointment({ patientId: patient._id, patientIdCustom: patient.id, doctorId, doctor: doctor.name, date, time, charges });
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
          {patients.length === 0 && <div className="login-error" style={{ marginBottom: 12 }}>No patients yet — add one from the Patients page first.</div>}
          {doctors.length === 0 && <div className="login-error" style={{ marginBottom: 12 }}>No doctors found — a Manager needs to link a doctor's account via POST /api/doctors first.</div>}
          <div className="form-grid cols-3">
            <div className="field"><label>Patient</label>
              <select value={patientId} onChange={(e) => setPatientId(e.target.value)}>
                {patients.map((p) => <option key={p._id} value={p._id}>{p.name} — {p.id}</option>)}
              </select>
            </div>
            <div className="field"><label>Doctor</label>
              <select value={doctorId} onChange={(e) => setDoctorId(e.target.value)}>
                {doctors.map((d) => <option key={d._id} value={d._id}>{d.name}</option>)}
              </select>
            </div>
            <div className="field"><label>Date</label><input type="date" value={date} onChange={(e) => setDate(e.target.value)} /></div>
            <div className="field"><label>Time</label><input type="text" value={time} onChange={(e) => setTime(e.target.value)} placeholder="e.g. 09:00 AM" /></div>
          </div>
          {patient && (
            <div className="charge-box">
              <div className="note">{note}</div>
              {charges.length === 0 ? (
                <div style={{ fontWeight: 600, color: 'var(--good)' }}>No charge to collect for this appointment.</div>
              ) : (
                <>
                  {charges.map((c) => <div className="row" key={c.desc}><span>{c.desc}</span><span>₹{c.amount}</span></div>)}
                  <div className="total"><span>To collect</span><span>₹{total}</span></div>
                </>
              )}
            </div>
          )}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
            <button type="button" className="btn" onClick={() => setShowForm(false)}>Cancel</button>
            <button type="submit" className="btn btn-accent" disabled={!patient || !doctor}>Book appointment</button>
          </div>
        </form>
      )}

      <div className="card">
        <div style={{ display: 'flex', gap: 10, marginBottom: 16 }}>
          <select
            value={selectedDoctorId}
            onChange={(e) => setSelectedDoctorId(e.target.value)}
            style={{ padding: '8px 12px', border: '1px solid var(--line)', borderRadius: 8, fontSize: 13 }}
          >
            <option value="all">All doctors</option>
            {doctors.map((d) => <option key={d._id} value={d._id}>{d.name}</option>)}
          </select>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            style={{ padding: '8px 12px', border: '1px solid var(--line)', borderRadius: 8, fontSize: 13 }}
          >
            <option value="all">All statuses</option>
            <option value="confirmed">Confirmed</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
        {dataLoading && appointments.length === 0 ? (
          <div className="popup-empty">Loading…</div>
        ) : filteredAppointments.length === 0 ? (
          <div className="popup-empty">No appointments match the selected filters.</div>
        ) : (
          <table>
            <tbody>
              <tr><th>Date</th><th>Time</th><th>Patient</th><th>Doctor</th><th>Status</th><th>Actions</th></tr>
              {filteredAppointments.map((a) => {
                const p = patients.find((x) => x._id === a.patientId);
                return (
                  <tr key={a._id}>
                    <td>{a.date ? new Date(a.date).toLocaleDateString() : '—'}</td>
                    <td>{a.time}</td>
                    <td>{p ? <NameLink id={p._id}>{p.name}</NameLink> : '—'}</td>
                    <td>{getDoctorName(a, doctors)}</td>
                    <td><Badge status={a.status} /></td>
                    <td><button className="btn btn-sm" onClick={() => navigate('consultation')}>View</button></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </>
  );
}
