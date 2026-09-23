import React from 'react';
import { useApp } from '../AppContext.jsx';
import { billsForPatient, patientPayStatus } from '../data.js';
import { PayBadge } from './Shared.jsx';

export default function PatientDrawer() {
  const { patients, bills, drawerPatientId, closeDrawer, navigate, markBillPaid } = useApp();
  const open = Boolean(drawerPatientId);
  const p = patients.find((x) => x.id === drawerPatientId);

  return (
    <>
      <div className={`overlay ${open ? 'open' : ''}`} onClick={closeDrawer} />
      <div className={`drawer ${open ? 'open' : ''}`}>
        {p && (
          <>
            <div className="drawer-head">
              <div>
                <div className="pname">{p.name}</div>
                <div className="pmeta">{p.id} • {p.gender}, {p.age} yrs • {p.type} patient • {p.phone}</div>
              </div>
              <button className="drawer-close" onClick={closeDrawer}>✕</button>
            </div>
            <div className="drawer-body">
              <div className="drawer-section">
                <h4>Latest vitals</h4>
                <div className="vital-mini">
                  <div className="box"><div className="v">{p.vitals.temp}</div><div className="l">Temperature</div></div>
                  <div className="box"><div className="v">{p.vitals.bp}</div><div className="l">Blood pressure</div></div>
                  <div className="box"><div className="v">{p.vitals.pulse}</div><div className="l">Pulse</div></div>
                  <div className="box"><div className="v">{p.vitals.resp}</div><div className="l">Respiration</div></div>
                </div>
              </div>

              <div className="drawer-section">
                <h4>Billing &amp; admission</h4>
                <div className="vital-mini">
                  <div className="box"><div className="v"><PayBadge status={patientPayStatus(bills, p.id)} /></div><div className="l">Payment status</div></div>
                  <div className="box"><div className="v">{p.admitted ? (p.admissionDays != null ? `${p.admissionDays} day(s)` : '—') : 'Not admitted'}</div><div className="l">Admission days</div></div>
                </div>
                {billsForPatient(bills, p.id).length > 0 && (
                  <table style={{ marginTop: 12 }}>
                    <tbody>
                      <tr><th>Bill</th><th>Amount</th><th>Status</th><th></th></tr>
                      {billsForPatient(bills, p.id).map((b) => (
                        <tr key={b.id}>
                          <td>{b.id} — {b.desc}</td>
                          <td>₹{b.amount}</td>
                          <td><PayBadge status={b.status} /></td>
                          <td>{b.status === 'Pending' && <button className="btn btn-sm btn-accent" onClick={() => markBillPaid(b.id)}>Mark paid</button>}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>

              <div className="drawer-section">
                <h4>Visit history</h4>
                {p.history.map((h, i) => (
                  <div className="history-entry" key={i}>
                    <div className="d">{h.d}</div>
                    <div className="t">{h.t}</div>
                    <div className="s">{h.s}</div>
                  </div>
                ))}
              </div>

              <div className="drawer-section" style={{ display: 'flex', gap: 10 }}>
                <button className="btn btn-accent btn-sm" onClick={() => { closeDrawer(); navigate('consultation'); }}>Start consultation</button>
                <button className="btn btn-sm" onClick={() => { closeDrawer(); navigate('billing'); }}>Issue bill</button>
              </div>
            </div>
          </>
        )}
      </div>
    </>
  );
}
