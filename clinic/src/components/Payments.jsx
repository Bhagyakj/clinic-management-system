import React from 'react';
import { useApp } from '../AppContext.jsx';
import { billBalance, pendingBillsCount } from '../data.js';
import { NameLink, PayBadge } from './Shared.jsx';

function LineStatus({ line }) {
  if (line.paid > 0) return <span className="badge partial">Part paid</span>;
  return <span className="badge pending">Pending</span>;
}

// Flattens every unpaid purpose line across every patient's bills into one
// row each. Several lines can point at the same bill — "Collect" on any of
// them opens that one bill (the real unit of payment), not just that line.
function pendingLinesAll(bills, patients) {
  const rows = [];
  for (const bill of bills) {
    if (bill.status === 'paid') continue;
    const patient = patients.find((p) => p._id === bill.patientId);
    (bill.purpose || []).forEach((line, index) => {
      const remaining = (line.amount || 0) - (line.paid || 0);
      if (remaining > 0) {
        rows.push({ bill, patient, line, index, remaining });
      }
    });
  }
  return rows;
}

export default function Payments() {
  const { patients, bills, dataLoading, navigate, openPayment } = useApp();
  const pendingRows = pendingLinesAll(bills, patients);
  const totalDue = pendingRows.reduce((sum, r) => sum + r.remaining, 0);
  const clearedBills = bills.filter((b) => b.status === 'paid');

  return (
    <>
      <div className="page-head">
        <div>
          <h1>Payments</h1>
          <div className="desc">
            {pendingRows.length > 0 ? `${pendingRows.length} pending charge(s) • ₹${totalDue} to collect` : 'All bills cleared ✓'}
          </div>
        </div>
        <button className="btn btn-accent" onClick={() => navigate('billing')}>+ Issue new bill</button>
      </div>

      <div className="card" style={{ marginBottom: 16 }}>
        <h3>Charges</h3>
        <p className="card-sub">
          One row per charge. A patient who owes for more than one purpose appears once for each, and after a
          part-payment they stay listed for whatever is still unpaid. Collecting a payment settles the whole bill
          that charge belongs to (oldest line in that bill first) — a patient's other, separate bills aren't touched.
        </p>
        {dataLoading && bills.length === 0 ? (
          <div className="popup-empty">Loading payments…</div>
        ) : pendingRows.length === 0 ? (
          <div className="popup-empty">✅ Nothing pending.</div>
        ) : (
          <table>
            <tbody>
              <tr>
                <th>Bill</th><th>Patient</th><th>Charge</th><th>Amount</th><th>Paid</th><th>Balance</th><th>Status</th><th></th>
              </tr>
              {pendingRows.map((r) => (
                <tr key={`${r.bill._id}-${r.index}`}>
                  <td>{r.bill._id.slice(-6).toUpperCase()}</td>
                  <td>{r.patient ? <NameLink id={r.patient._id}>{r.patient.name}</NameLink> : '—'}</td>
                  <td>{r.line.description}</td>
                  <td>₹{r.line.amount}</td>
                  <td>₹{r.line.paid || 0}</td>
                  <td style={{ fontWeight: 600 }}>₹{r.remaining}</td>
                  <td><LineStatus line={r.line} /></td>
                  <td><button className="btn btn-sm btn-accent" onClick={() => openPayment(r.bill._id)}>Collect payment</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div className="card">
        <h3>Cleared bills</h3>
        {clearedBills.length === 0 ? (
          <div className="popup-empty">No bills fully paid yet.</div>
        ) : (
          <table>
            <tbody>
              <tr><th>Bill</th><th>Patient</th><th>Total</th><th>Paid on</th></tr>
              {clearedBills.map((b) => {
                const p = patients.find((x) => x._id === b.patientId);
                return (
                  <tr key={b._id}>
                    <td>{b._id.slice(-6).toUpperCase()}</td>
                    <td>{p ? <NameLink id={p._id}>{p.name}</NameLink> : '—'}</td>
                    <td>₹{b.totalAmount}</td>
                    <td>{b.paidDate ? new Date(b.paidDate).toLocaleDateString() : '—'}</td>
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
