import React, { useState } from 'react';
import { useApp } from '../AppContext.jsx';
import { patientPayStatus, pendingBillsForPatient, billBalance, appointmentCharges } from '../data.js';
import { NameLink, PayBadge, Badge } from './Shared.jsx';

const TIME_SLOTS = ['09:00 AM', '09:30 AM', '10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM', '02:00 PM', '02:30 PM', '03:00 PM', '03:30 PM', '04:00 PM'];
const today = () => new Date().toISOString().slice(0, 10);

// Appointment history = every appointment booked for this patient + any older history stored on the patient
function appointmentsForPatient(appointments, patient) {
  const fromBookings = (appointments || [])
    .filter((a) => a.patientId === patient.id)
    .map((a) => ({ date: a.date, time: a.time, doctor: a.doctor, status: a.status }));
  const all = [...fromBookings, ...(patient.appointmentHistory || [])];
  const seen = new Set();
  return all
    .filter((a) => {
      const key = `${a.date}|${a.time}|${a.doctor}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    .sort((a, b) => String(b.date).localeCompare(String(a.date)));
}

export default function Patients() {
  const { role, patients, bills, appointments, users, showToast, openPatient, openPayment, navigate, bookAppointment } = useApp();
  const [popup, setPopup] = useState(null); // { type: 'appointments' | 'book' | 'payment', patientId }
  const isFrontDesk = role === 'manager' || role === 'fos';
  const closePopup = () => setPopup(null);
  const active = popup ? patients.find((x) => x.id === popup.patientId) : null;

  return (
    <>
      <div className="page-head">
        <div><h1>Patients</h1><div className="desc">Search, view and manage patient records</div></div>
        <button className="btn btn-accent" onClick={() => showToast('Opens add-patient form')}>+ Add patient</button>
      </div>
      <div className="card">
        <div className="search-box" style={{ width: 280, marginBottom: 16 }}>🔍 Search by name, phone or ID</div>
        <table>
          <tbody>
            <tr>
              <th>ID</th><th>Name</th><th>Gender</th><th>Phone</th><th>Type</th>
              <th>Admission days</th><th>Payment</th><th>Actions</th>
            </tr>
            {patients.map((p) => (
              <tr key={p.id}>
                <td>{p.id}</td>
                <td><NameLink id={p.id}>{p.name}</NameLink></td>
                <td>{p.gender}</td>
                <td>{p.phone}</td>
                <td>{p.type}</td>
                <td>{p.admitted ? (p.admissionDays != null ? `${p.admissionDays} day(s)` : '—') : '—'}</td>
                <td><PayBadge status={patientPayStatus(bills, p.id)} /></td>
                <td>
                  {isFrontDesk ? (
                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                      <button className="btn btn-sm" onClick={() => setPopup({ type: 'appointments', patientId: p.id })}>Appointments</button>
                      <button className="btn btn-sm" onClick={() => setPopup({ type: 'book', patientId: p.id })}>Book appointment</button>
                      <button className="btn btn-sm btn-accent" onClick={() => setPopup({ type: 'payment', patientId: p.id })}>Make Payment</button>
                    </div>
                  ) : (
                    <>
                      <button className="btn btn-sm" onClick={() => openPatient(p.id)}>View</button>{' '}
                      <button className="btn btn-sm" onClick={() => showToast('Opens edit form')}>Edit</button>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {popup && active && (
        <div className="popup-overlay" onClick={closePopup}>
          <div className="popup-box" style={{ maxWidth: 460 }} onClick={(e) => e.stopPropagation()}>
            {popup.type === 'appointments' && (
              <HistoryPopup p={active} history={appointmentsForPatient(appointments, active)} onClose={closePopup} />
            )}
            {popup.type === 'payment' && (
              <DuePopup
                p={active} bills={bills} onClose={closePopup}
                onPay={() => { closePopup(); navigate('payments'); openPayment(active.id); }}
              />
            )}
            {popup.type === 'book' && (
              <BookPopup
                p={active} bills={bills} appointments={appointments} users={users}
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
  const pending = pendingBillsForPatient(bills, p.id);
  const total = pending.reduce((sum, b) => sum + billBalance(b), 0);
  return (
    <>
      <Head title="Amount due" p={p} onClose={onClose} />
      {pending.length === 0 ? (
        <div className="popup-empty">✅ Nothing pending — this patient is fully cleared.</div>
      ) : (
        <>
          {pending.map((b) => (
            <div className="popup-bill-row" key={b.id}>
              <span>{b.purpose || b.desc}<span style={{ color: 'var(--muted)', fontSize: 12 }}> — {b.desc}</span></span>
              <span>₹{billBalance(b)}</span>
            </div>
          ))}
          <div className="popup-total-row"><span>Total due</span><span>₹{total}</span></div>
          <button className="btn btn-accent" style={{ width: '100%', marginTop: 16 }} onClick={onPay}>Make payment →</button>
        </>
      )}
    </>
  );
}

function BookPopup({ p, bills, appointments, users, onClose, onBook }) {
  const doctors = users.filter((u) => /doctor/i.test(u.designation) && u.status !== 'Archived');
  const [doctor, setDoctor] = useState(doctors[0]?.name || '');
  const [date, setDate] = useState(today());
  const [time, setTime] = useState(TIME_SLOTS[0]);
  const { charges, note } = appointmentCharges(p, appointments, bills, date);
  const total = charges.reduce((sum, c) => sum + c.amount, 0);

  return (
    <>
      <Head title="Book appointment" p={p} onClose={onClose} />
      <div className="form-grid">
        <div className="field">
          <label>Doctor</label>
          <select value={doctor} onChange={(e) => setDoctor(e.target.value)}>
            {doctors.map((d) => <option key={d.id}>{d.name}</option>)}
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
            {charges.map((c) => <div className="row" key={c.purpose}><span>{c.desc}</span><span>₹{c.amount}</span></div>)}
            <div className="total"><span>To collect</span><span>₹{total}</span></div>
          </>
        )}
      </div>
      <button
        className="btn btn-accent" style={{ width: '100%' }} disabled={!doctor || !date}
        onClick={() => onBook({ patientId: p.id, doctor, date, time, charges })}
      >
        Book appointment{total > 0 ? ` and add ₹${total} to payments` : ''}
      </button>
    </>
  );
}
