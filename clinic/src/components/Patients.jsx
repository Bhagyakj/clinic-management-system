import React, { useState } from 'react';
import { useApp } from '../AppContext.jsx';
import { patientPayStatus } from '../data.js';
import { NameLink, PayBadge, Badge } from './Shared.jsx';

function pendingBillsForPatient(bills, patientId) {
  return bills.filter((b) => b.patientId === patientId && b.status === 'Pending');
}
export default function Patients() {
  const { role, patients, bills, showToast, openPatient, navigate } = useApp();
  const [popup, setPopup] = useState(null); // { type: 'appointments' | 'payment', patientId } | null

  const isFrontDesk = role === 'manager' || role === 'fos';
  const closePopup = () => setPopup(null);

  const goToBilling = () => {
    closePopup();
    navigate('payments');
  };

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
                    <>
                      <button className="btn btn-sm" onClick={() => setPopup({ type: 'appointments', patientId: p.id })}>Appointments</button>{' '}
                      <button className="btn btn-sm btn-accent" onClick={() => setPopup({ type: 'payment', patientId: p.id })}>Make Payment</button>
                    </>
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

      {popup && (
        <PopupModal
          popup={popup}
          patients={patients}
          bills={bills}
          onClose={closePopup}
          onGoToBilling={goToBilling}
        />
      )}
    </>
  );
}

function PopupModal({ popup, patients, bills, onClose, onGoToBilling }) {
  const p = patients.find((x) => x.id === popup.patientId);
  if (!p) return null;

  return (
    <div className="popup-overlay" onClick={onClose}>
      <div className="popup-box" onClick={(e) => e.stopPropagation()}>
        {popup.type === 'appointments' ? (
          <>
            <div className="popup-head">
              <div>
                <h3>Appointment history</h3>
                <div className="sub">{p.name} • {p.id}</div>
              </div>
              <button className="popup-close" onClick={onClose}>✕</button>
            </div>
            {p.appointmentHistory && p.appointmentHistory.length > 0 ? (
              p.appointmentHistory.map((a, i) => (
                <div className="popup-appt-row" key={i}>
                  <div>
                    <div className="d">{a.date} • {a.time}</div>
                    <div className="doc">{a.doctor}</div>
                  </div>
                  <Badge status={a.status} />
                </div>
              ))
            ) : (
              <div className="popup-empty">No past appointments on record.</div>
            )}
          </>
        ) : (
          <PaymentPopup p={p} bills={bills} onClose={onClose} onGoToBilling={onGoToBilling} />
        )}
      </div>
    </div>
  );
}

function PaymentPopup({ p, bills, onClose, onGoToBilling }) {
  const pending = pendingBillsForPatient(bills, p.id);
  const total = pending.reduce((sum, b) => sum + b.amount, 0);

  return (
    <>
      <div className="popup-head">
        <div>
          <h3>Amount due</h3>
          <div className="sub">{p.name} • {p.id}</div>
        </div>
        <button className="popup-close" onClick={onClose}>✕</button>
      </div>
      {pending.length === 0 ? (
        <div className="popup-empty">✅ Nothing pending — this patient is fully cleared.</div>
      ) : (
        <>
          {pending.map((b) => (
            <div className="popup-bill-row" key={b.id}>
              <span>{b.desc}</span>
              <span>₹{b.amount}</span>
            </div>
          ))}
          <div className="popup-total-row"><span>Total due</span><span>₹{total}</span></div>
          <button className="btn btn-accent" style={{ width: '100%', marginTop: 16 }} onClick={onGoToBilling}>
            Make payment →
          </button>
        </>
      )}
    </>
  );
}
