import React, { useState } from 'react';
import { useApp } from '../AppContext.jsx';
import { patientPayStatus, pendingLinesForPatient, appointmentCharges } from '../data.js';
import { NameLink, PayBadge, Badge } from './Shared.jsx';

const TIME_SLOTS = ['09:00 AM', '09:30 AM', '10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM', '02:00 PM', '02:30 PM', '03:00 PM', '03:30 PM', '04:00 PM'];
const today = () => new Date().toISOString().slice(0, 10);

// Your Patient schema keeps appointmentHistory directly on the patient
// document (updated server-side by bookAppointment), so no merging with a
// separate appointments list is needed anymore — this just sorts it.
function appointmentsForPatient(patient) {
  return [...(patient.appointmentHistory || [])].sort((a, b) => String(b.date).localeCompare(String(a.date)));
}

export default function Patients() {
  const { role, patients, bills, doctors, dataLoading, showToast, openPatient, navigate, bookAppointment, addPatient, searchTerm } = useApp();
  const [popup, setPopup] = useState(null); // { type: 'appointments' | 'book' | 'payment', patientId }
  const [showAddForm, setShowAddForm] = useState(false);
  const [form, setForm] = useState({ name: '', gender: 'Male', age: '', phone: '', type: 'OP', doctor: '' });
  const isFrontDesk = role === 'manager' || role === 'fos';
  const closePopup = () => setPopup(null);
  const active = popup ? patients.find((x) => x._id === popup.patientId) : null;

  const filteredPatients = patients.filter((p) => {
    const q = searchTerm.trim().toLowerCase();
    if (!q) return true;

    const dateMatches = [
      p.lastVisit,
      p.createdAt,
      ...(p.appointmentHistory || []).map((a) => a.date),
      ...(p.history || []).map((h) => h.d),
    ].filter(Boolean).map((value) => String(value).toLowerCase());

    return [p.name, p.phone, p.id, ...dateMatches].some((value) => String(value || '').toLowerCase().includes(q));
  });

  const handleAddPatient = async (event) => {
    event.preventDefault();
    const cleanedName = String(form.name || '').trim();
    const cleanedPhone = String(form.phone || '').trim();
    const age = Number(form.age);
    if (!cleanedName || !cleanedPhone || !Number.isFinite(age) || age <= 0) {
      showToast('Fill in a valid patient name, age and phone number.');
      return;
    }
    const patient = await addPatient({
      name: cleanedName,
      gender: form.gender,
      age,
      phone: cleanedPhone,
      doctor: String(form.doctor || '').trim() || '—',
      type: form.type,
    });
    if (patient) {
      setShowAddForm(false);
      setForm({ name: '', gender: 'Male', age: '', phone: '', type: 'OP', doctor: '' });
    }
  };

  return (
    <>
      <div className="page-head">
        <div><h1>Patients</h1><div className="desc">Search, view and manage patient records</div></div>
        <button className="btn btn-accent" onClick={() => setShowAddForm(true)}>+ Add patient</button>
      </div>
      <div className="card">
        {dataLoading && patients.length === 0 ? (
          <div className="popup-empty">Loading patients…</div>
        ) : filteredPatients.length === 0 ? (
          <div className="popup-empty">No patients match your search — add one to get started.</div>
        ) : (
          <table>
            <tbody>
              <tr>
                <th>ID</th><th>Name</th><th>Gender</th><th>Phone</th><th>Type</th>
                <th>Admission days</th><th>Payment</th><th>Actions</th>
              </tr>
              {filteredPatients.map((p) => (
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

      {showAddForm && (
        <div className="popup-overlay" onClick={() => setShowAddForm(false)}>
          <div className="popup-box" style={{ maxWidth: 480 }} onClick={(e) => e.stopPropagation()}>
            <div className="popup-head">
              <div><h3>Add patient</h3><div className="sub">Register a new patient record</div></div>
              <button className="popup-close" onClick={() => setShowAddForm(false)}>✕</button>
            </div>
            <form onSubmit={handleAddPatient}>
              <div className="form-grid">
                <div className="field full">
                  <label>Patient name</label>
                  <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Enter full name" />
                </div>
                <div className="field">
                  <label>Gender</label>
                  <select value={form.gender} onChange={(e) => setForm({ ...form, gender: e.target.value })}>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div className="field">
                  <label>Age</label>
                  <input type="number" min="0" value={form.age} onChange={(e) => setForm({ ...form, age: e.target.value })} placeholder="25" />
                </div>
                <div className="field">
                  <label>Phone</label>
                  <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="9876543210" />
                </div>
                <div className="field">
                  <label>Type</label>
                  <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
                    <option value="OP">OP</option>
                    <option value="IP">IP</option>
                  </select>
                </div>
                <div className="field">
                  <label>Doctor</label>
                  <input value={form.doctor} onChange={(e) => setForm({ ...form, doctor: e.target.value })} placeholder="Assigned doctor" />
                </div>
              </div>
              <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 18 }}>
                <button type="button" className="btn" onClick={() => setShowAddForm(false)}>Cancel</button>
                <button type="submit" className="btn btn-accent">Save patient</button>
              </div>
            </form>
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

function Head({ title, p, onClose }) {
  return (
    <div className="popup-head">
      <div><h3>{title}</h3><div className="sub">{p.name} • {p.id}</div></div>
      <button className="popup-close" onClick={onClose}>✕</button>
    </div>
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
