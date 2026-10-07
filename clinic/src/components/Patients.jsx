import React, { useState } from 'react';
import { useApp } from '../AppContext.jsx';
import { patientPayStatus, pendingLinesForPatient, appointmentCharges } from '../data.js';
import { NameLink, PayBadge, Badge } from './Shared.jsx';

const TIME_SLOTS = ['09:00 AM', '09:30 AM', '10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM', '02:00 PM', '02:30 PM', '03:00 PM', '03:30 PM', '04:00 PM'];
const today = () => new Date().toISOString().slice(0, 10);

// Your Patient schema keeps appointmentHistory directly on the patient
// document (updated server-side by bookAppointment), so no merging with a
// separate appointments list is needed — this just sorts it.
function appointmentsForPatient(patient) {
  return [...(patient.appointmentHistory || [])].sort((a, b) => String(b.date).localeCompare(String(a.date)));
}

export default function Patients() {
  const { role, patients, bills, doctors, dataLoading, showToast, openPatient, navigate, bookAppointment } = useApp();
  const [popup, setPopup] = useState(null); // { type: 'add' | 'appointments' | 'book' | 'payment', patientId? }
  const isFrontDesk = role === 'manager' || role === 'fos';
  const closePopup = () => setPopup(null);
  const active = popup?.patientId ? patients.find((x) => x._id === popup.patientId) : null;

  return (
    <>
      <div className="page-head">
        <div><h1>Patients</h1><div className="desc">Search, view and manage patient records</div></div>
        <button className="btn btn-accent" onClick={() => setPopup({ type: 'add' })}>+ Add patient</button>
      </div>
      <div className="card">
        <div className="search-box" style={{ width: 280, marginBottom: 16 }}>🔍 Search by name, phone or ID</div>
        {dataLoading && patients.length === 0 ? (
          <div className="popup-empty">Loading patients…</div>
        ) : patients.length === 0 ? (
          <div className="popup-empty">No patients yet — add one to get started.</div>
        ) : (
          <table>
            <tbody>
              <tr>
                <th>ID</th><th>Name</th><th>Gender</th><th>Phone</th><th>Type</th>
                <th>Admission days</th><th>Payment</th><th>Actions</th>
              </tr>
              {patients.map((p) => (
                <tr key={p._id}>
                  <td>{p.id}</td>
                  <td><NameLink id={p._id}>{p.name}</NameLink></td>
                  <td>{p.gender}</td>
                  <td>{p.phone}</td>
                  <td>{p.type}</td>
                  <td>{p.admitted ? (p.admissionDays != null ? `${p.admissionDays} day(s)` : '—') : '—'}</td>
                  <td><PayBadge status={patientPayStatus(bills, p._id)} /></td>
                  <td>
                    {isFrontDesk ? (
                      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                        <button className="btn btn-sm" onClick={() => setPopup({ type: 'appointments', patientId: p._id })}>Appointments</button>
                        <button className="btn btn-sm" onClick={() => setPopup({ type: 'book', patientId: p._id })}>Book appointment</button>
                        <button className="btn btn-sm btn-accent" onClick={() => setPopup({ type: 'payment', patientId: p._id })}>Make Payment</button>
                      </div>
                    ) : (
                      <>
                        <button className="btn btn-sm" onClick={() => openPatient(p._id)}>View</button>{' '}
                        <button className="btn btn-sm" onClick={() => showToast('Opens edit form')}>Edit</button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {popup?.type === 'add' && (
        <div className="popup-overlay" onClick={closePopup}>
          <div className="popup-box" style={{ maxWidth: 460 }} onClick={(e) => e.stopPropagation()}>
            <AddPatientPopup onClose={closePopup} />
          </div>
        </div>
      )}

      {popup && active && (
        <div className="popup-overlay" onClick={closePopup}>
          <div className="popup-box" style={{ maxWidth: 460 }} onClick={(e) => e.stopPropagation()}>
            {popup.type === 'appointments' && (
              <HistoryPopup p={active} history={appointmentsForPatient(active)} onClose={closePopup} />
            )}
            {popup.type === 'payment' && (
              <DuePopup
                p={active} bills={bills} onClose={closePopup}
                onPay={() => { closePopup(); navigate('payments'); }}
              />
            )}
            {popup.type === 'book' && (
              <BookPopup
                p={active} bills={bills} doctors={doctors}
                onClose={closePopup}
                onBook={(form) => { bookAppointment(form); closePopup(); }}
              />
            )}
          </div>
        </div>
      )}
    </>
  );
}

function Head({ title, p, onClose, sub }) {
  return (
    <div className="popup-head">
      <div><h3>{title}</h3><div className="sub">{sub || (p && `${p.name} • ${p.id}`)}</div></div>
      <button className="popup-close" onClick={onClose}>✕</button>
    </div>
  );
}

// The actual Add Patient form — restored as a popup, wired to the real
// addPatient() in AppContext.jsx (POST /api/patients, plus an optional
// Registration bill that's immediately collected).
function AddPatientPopup({ onClose }) {
  const { addPatient, showToast } = useApp();
  const [form, setForm] = useState({ name: '', gender: 'Female', age: '', phone: '', doctor: '', registrationFee: true });
  const [submitting, setSubmitting] = useState(false);
  const set = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.gender || !form.age || !form.phone.trim()) {
      showToast('Name, gender, age and phone are all required');
      return;
    }
    setSubmitting(true);
    const patient = await addPatient({
      name: form.name.trim(), gender: form.gender, age: Number(form.age), phone: form.phone.trim(),
      doctor: form.doctor.trim() || undefined, registrationFee: form.registrationFee,
    });
    setSubmitting(false);
    if (patient) onClose();
  };

  return (
    <form onSubmit={submit}>
      <Head title="Add patient" sub="New patient registration" onClose={onClose} />
      <div className="form-grid">
        <div className="field full"><label>Full name</label><input type="text" value={form.name} onChange={set('name')} placeholder="e.g. Anita Sharma" /></div>
        <div className="field">
          <label>Gender</label>
          <select value={form.gender} onChange={set('gender')}>
            <option>Female</option><option>Male</option><option>Other</option>
          </select>
        </div>
        <div className="field"><label>Age</label><input type="number" min={0} value={form.age} onChange={set('age')} placeholder="e.g. 34" /></div>
        <div className="field full"><label>Phone</label><input type="text" value={form.phone} onChange={set('phone')} placeholder="10-digit mobile number" /></div>
        <div className="field full"><label>Doctor (optional)</label><input type="text" value={form.doctor} onChange={set('doctor')} placeholder="e.g. Dr. Mehta" /></div>
      </div>
      <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, margin: '4px 0 14px' }}>
        <input type="checkbox" checked={form.registrationFee} onChange={(e) => setForm((f) => ({ ...f, registrationFee: e.target.checked }))} />
        Collect ₹200 registration fee now
      </label>
      <button type="submit" className="btn btn-accent" style={{ width: '100%' }} disabled={submitting}>
        {submitting ? 'Registering…' : 'Register patient'}
      </button>
    </form>
  );
}

function HistoryPopup({ p, history, onClose }) {
  return (
    <>
      <Head title="Appointment history" p={p} onClose={onClose} />
      {history.length > 0 ? history.map((a, i) => (
        <div className="popup-appt-row" key={i}>
          <div>
            <div className="d">{a.date || 'Date not recorded'}{a.time ? ` • ${a.time}` : ''}</div>
            <div className="doc">{a.doctor}</div>
          </div>
          <Badge status={a.status} />
        </div>
      )) : <div className="popup-empty">No appointments on record for this patient yet.</div>}
    </>
  );
}

function DuePopup({ p, bills, onClose, onPay }) {
  const lines = pendingLinesForPatient(bills, p._id);
  const total = lines.reduce((sum, l) => sum + l.remaining, 0);
  return (
    <>
      <Head title="Amount due" p={p} onClose={onClose} />
      {lines.length === 0 ? (
        <div className="popup-empty">✅ Nothing pending — this patient is fully cleared.</div>
      ) : (
        <>
          {lines.map((l, i) => (
            <div className="popup-bill-row" key={`${l.billId}-${i}`}>
              <span>{l.description}</span>
              <span>₹{l.remaining}</span>
            </div>
          ))}
          <div className="popup-total-row"><span>Total due</span><span>₹{total}</span></div>
          <button className="btn btn-accent" style={{ width: '100%', marginTop: 16 }} onClick={onPay}>Make payment →</button>
        </>
      )}
    </>
  );
}

function BookPopup({ p, bills, doctors, onClose, onBook }) {
  const [doctorId, setDoctorId] = useState(doctors[0]?._id || '');
  const [date, setDate] = useState(today());
  const [time, setTime] = useState(TIME_SLOTS[0]);
  const { charges, note } = appointmentCharges(p, bills, date);
  const total = charges.reduce((sum, c) => sum + c.amount, 0);
  const doctor = doctors.find((d) => d._id === doctorId);

  return (
    <>
      <Head title="Book appointment" p={p} onClose={onClose} />
      {doctors.length === 0 && (
        <div className="login-error" style={{ marginBottom: 14 }}>
          No doctors found. A Manager needs to link a doctor's user account via POST /api/doctors first.
        </div>
      )}
      <div className="form-grid">
        <div className="field">
          <label>Doctor</label>
          <select value={doctorId} onChange={(e) => setDoctorId(e.target.value)}>
            {doctors.map((d) => <option key={d._id} value={d._id}>{d.name}{d.specialization ? ` — ${d.specialization}` : ''}</option>)}
          </select>
        </div>
        <div className="field">
          <label>Time</label>
          <select value={time} onChange={(e) => setTime(e.target.value)}>
            {TIME_SLOTS.map((t) => <option key={t}>{t}</option>)}
          </select>
        </div>
        <div className="field full">
          <label>Date</label>
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
        </div>
      </div>
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
      <button
        className="btn btn-accent" style={{ width: '100%' }} disabled={!doctorId || !date}
        onClick={() => onBook({ patientId: p._id, patientIdCustom: p.id, doctorId, doctor: doctor?.name, date, time, charges })}
      >
        Book appointment{total > 0 ? ` and add ₹${total} to payments` : ''}
      </button>
    </>
  );
}
