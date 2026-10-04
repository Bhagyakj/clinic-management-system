import React, { useMemo, useState } from 'react';
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
  const { role, patients, bills, appointments, users, showToast, openPatient, openPayment, navigate, bookAppointment, addPatient, updatePatient, deletePatient } = useApp();
  const [popup, setPopup] = useState(null); // { type: 'appointments' | 'book' | 'payment' | 'add' | 'edit', patientId }
  const [search, setSearch] = useState('');
  const isFrontDesk = role === 'manager' || role === 'fos';
  const closePopup = () => setPopup(null);
  const active = popup ? patients.find((x) => x.id === popup.patientId) : null;

  const filteredPatients = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return patients;

    return patients.filter((p) => {
      const haystack = [
        p.name,
        p.id,
        p.phone,
        p.gender,
        p.type,
        p.doctor,
        String(p.age || ''),
        String(p.admissionDays || ''),
      ].join(' ').toLowerCase();
      return haystack.includes(q);
    });
  }, [search, patients]);

  return (
    <>
      <div className="page-head">
        <div><h1>Patients</h1><div className="desc">Search, view and manage patient records</div></div>
        <button className="btn btn-accent" onClick={() => setPopup({ type: 'add' })}>+ Add patient</button>
      </div>
      <div className="card patient-card">
        <div className="search-box patient-search">
          <span aria-hidden="true">🔍</span>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, ID, phone or age"
            style={{ border: 'none', outline: 'none', background: 'transparent', width: '100%', color: 'var(--ink)' }}
          />
        </div>

        {search && (
          <div className="patient-search-meta">
            {filteredPatients.length === 0 ? 'No matching patient found.' : `${filteredPatients.length} matching patient(s) found.`}
          </div>
        )}

        {search && filteredPatients.length > 0 && (
          <div className="patient-detail-list">
            {filteredPatients.slice(0, 3).map((p) => (
              <div className="patient-detail-card" key={p.id}>
                <div className="patient-detail-head">
                  <div>
                    <div className="patient-detail-name">{p.name}</div>
                    <div className="patient-detail-sub">{p.id} • {p.gender} • Age {p.age}</div>
                  </div>
                  <PayBadge status={patientPayStatus(bills, p.id)} />
                </div>

                <div className="patient-detail-meta">
                  <span>Phone: {p.phone}</span>
                  <span>Type: {p.type}</span>
                  <span>Last visit: {p.lastVisit || '—'}</span>
                </div>

                <div className="patient-history-stack">
                  {(p.history || []).slice(0, 3).map((h, index) => (
                    <div className="patient-history-item" key={`${p.id}-${index}`}>
                      <strong>{h.d}</strong>
                      <span>{h.t}</span>
                      <small>{h.s}</small>
                    </div>
                  ))}

                  {(p.appointmentHistory || []).slice(0, 2).map((a, index) => (
                    <div className="patient-history-item" key={`${p.id}-appt-${index}`}>
                      <strong>{a.date}</strong>
                      <span>{a.time} • {a.doctor}</span>
                      <small>{a.status}</small>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="patient-table-wrap">
          <table>
            <tbody>
              <tr>
                <th>ID</th><th>Name</th><th>Gender</th><th>Phone</th><th>Type</th>
                <th>Age</th><th>Admission days</th><th>Payment</th><th>Actions</th>
              </tr>
              {filteredPatients.map((p) => (
                <tr key={p.id}>
                  <td>{p.id}</td>
                  <td><NameLink id={p.id}>{p.name}</NameLink></td>
                  <td>{p.gender}</td>
                  <td>{p.phone}</td>
                  <td>{p.type}</td>
                  <td>{p.age}</td>
                  <td>{p.admitted ? (p.admissionDays != null ? `${p.admissionDays} day(s)` : '—') : '—'}</td>
                  <td><PayBadge status={patientPayStatus(bills, p.id)} /></td>
                  <td>
                    {isFrontDesk ? (
                      <div className="patient-actions">
                        <button className="btn btn-sm" onClick={() => setPopup({ type: 'appointments', patientId: p.id })}>Appointments</button>
                        <button className="btn btn-sm" onClick={() => setPopup({ type: 'book', patientId: p.id })}>Book</button>
                        <button className="btn btn-sm" onClick={() => setPopup({ type: 'edit', patientId: p.id })}>Edit</button>
                        <button className="btn btn-sm btn-accent" onClick={() => setPopup({ type: 'payment', patientId: p.id })}>Pay</button>
                        <button className="btn btn-sm btn-danger" onClick={() => deletePatient(p.id)}>Delete</button>
                      </div>
                    ) : (
                      <div className="patient-actions">
                        <button className="btn btn-sm" onClick={() => openPatient(p.id)}>View</button>{' '}
                        <button className="btn btn-sm" onClick={() => setPopup({ type: 'edit', patientId: p.id })}>Edit</button>
                        <button className="btn btn-sm btn-danger" onClick={() => deletePatient(p.id)}>Delete</button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredPatients.length === 0 && search && (
            <div className="popup-empty" style={{ padding: '18px 8px 6px' }}>No patients match this search.</div>
          )}
        </div>
      </div>

      {popup && (
        <div className="popup-overlay" onClick={closePopup}>
          <div className="popup-box" style={{ maxWidth: 460 }} onClick={(e) => e.stopPropagation()}>
            {popup.type === 'add' && (
              <AddPatientPopup
                onClose={closePopup}
                onAdd={async (form) => {
                  const patient = await addPatient(form);
                  if (patient) closePopup();
                }}
              />
            )}
            {popup.type === 'edit' && active && (
              <EditPatientPopup
                patient={active}
                onClose={closePopup}
                onSave={async (form) => {
                  const updated = await updatePatient(active.id, form);
                  if (updated) closePopup();
                }}
              />
            )}
            {popup.type === 'appointments' && active && (
              <HistoryPopup p={active} history={appointmentsForPatient(appointments, active)} onClose={closePopup} />
            )}
            {popup.type === 'payment' && active && (
              <DuePopup
                p={active} bills={bills} onClose={closePopup}
                onPay={() => { closePopup(); navigate('payments'); openPayment(active.id); }}
              />
            )}
            {popup.type === 'book' && active && (
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

function AddPatientPopup({ onClose, onAdd }) {
  const initialForm = {
    name: '',
    gender: 'Male',
    age: '',
    phone: '',
    doctor: '—',
    type: 'OP',
    registrationFee: false,
  };
  const [form, setForm] = useState(initialForm);

  const handleChange = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

  return (
    <>
      <div className="popup-head">
        <div><h3>Add new patient</h3><div className="sub">Create a patient record</div></div>
        <button className="popup-close" onClick={onClose}>✕</button>
      </div>
      <div className="form-grid">
        <div className="field full">
          <label>Full name</label>
          <input value={form.name} onChange={(e) => handleChange('name', e.target.value)} placeholder="Enter patient name" />
        </div>
        <div className="field">
          <label>Gender</label>
          <select value={form.gender} onChange={(e) => handleChange('gender', e.target.value)}>
            <option>Male</option>
            <option>Female</option>
            <option>Other</option>
          </select>
        </div>
        <div className="field">
          <label>Age</label>
          <input type="number" min="0" value={form.age} onChange={(e) => handleChange('age', e.target.value)} placeholder="Age" />
        </div>
        <div className="field full">
          <label>Phone number</label>
          <input value={form.phone} onChange={(e) => handleChange('phone', e.target.value)} placeholder="e.g. 9876543210" />
        </div>
        <div className="field">
          <label>Patient type</label>
          <select value={form.type} onChange={(e) => handleChange('type', e.target.value)}>
            <option value="OP">OP</option>
            <option value="IP">IP</option>
          </select>
        </div>
        <div className="field">
          <label>Doctor</label>
          <input value={form.doctor} onChange={(e) => handleChange('doctor', e.target.value)} placeholder="Assigned doctor" />
        </div>
      </div>
      <div className="toggle-row" style={{ marginTop: 12 }}>
        <input type="checkbox" checked={form.registrationFee} onChange={(e) => handleChange('registrationFee', e.target.checked)} />
        <label>Registration fee paid</label>
      </div>
      <button
        className="btn btn-accent"
        style={{ width: '100%', marginTop: 18 }}
        onClick={() => {
          if (!form.name || !form.phone || !form.age) return;
          onAdd({
            ...form,
            id: `P-${String(Date.now()).slice(-5)}`,
            age: Number(form.age),
            registrationFee: form.registrationFee,
          });
        }}
      >
        Save patient
      </button>
    </>
  );
}

function EditPatientPopup({ patient, onClose, onSave }) {
  const [form, setForm] = useState({
    name: patient.name || '',
    gender: patient.gender || 'Male',
    age: patient.age || '',
    phone: patient.phone || '',
    type: patient.type || 'OP',
    doctor: patient.doctor || '—',
  });

  const handleChange = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

  return (
    <>
      <div className="popup-head">
        <div><h3>Edit patient</h3><div className="sub">{patient.id}</div></div>
        <button className="popup-close" onClick={onClose}>✕</button>
      </div>
      <div className="form-grid">
        <div className="field full">
          <label>Full name</label>
          <input value={form.name} onChange={(e) => handleChange('name', e.target.value)} />
        </div>
        <div className="field">
          <label>Gender</label>
          <select value={form.gender} onChange={(e) => handleChange('gender', e.target.value)}>
            <option>Male</option>
            <option>Female</option>
            <option>Other</option>
          </select>
        </div>
        <div className="field">
          <label>Age</label>
          <input type="number" value={form.age} onChange={(e) => handleChange('age', e.target.value)} />
        </div>
        <div className="field full">
          <label>Phone number</label>
          <input value={form.phone} onChange={(e) => handleChange('phone', e.target.value)} />
        </div>
        <div className="field">
          <label>Type</label>
          <select value={form.type} onChange={(e) => handleChange('type', e.target.value)}>
            <option value="OP">OP</option>
            <option value="IP">IP</option>
          </select>
        </div>
        <div className="field">
          <label>Doctor</label>
          <input value={form.doctor} onChange={(e) => handleChange('doctor', e.target.value)} />
        </div>
      </div>
      <button
        className="btn btn-accent"
        style={{ width: '100%', marginTop: 18 }}
        onClick={() => {
          onSave({
            name: form.name,
            gender: form.gender,
            age: Number(form.age),
            phone: form.phone,
            type: form.type,
            doctor: form.doctor,
          });
        }}
      >
        Save changes
      </button>
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
