import React from 'react';
import { useApp } from '../AppContext.jsx';
import { billBalance } from '../data.js';
import { NameLink } from './Shared.jsx';

function StatusBadge({ bill }) {
  if (bill.status === 'Paid') return <span className="badge stable">Paid</span>;
  if ((bill.paid || 0) > 0) return <span className="badge partial">Part paid</span>;
  return <span className="badge pending">Pending</span>;
}

export default function Payments() {
  const { patients, bills, payments, navigate, openPayment } = useApp();
  const pending = bills.filter((b) => b.status === 'Pending');
  const rows = [...bills].sort((a, b) => (a.status === 'Pending' ? 0 : 1) - (b.status === 'Pending' ? 0 : 1));
  const totalDue = pending.reduce((sum, b) => sum + billBalance(b), 0);

  return (
    <>
      <div className="page-head">
        <div>
          <h1>Payments</h1>
          <div className="desc">
            {pending.length > 0 ? `${pending.length} pending charge(s) • ₹${totalDue} to collect` : 'All bills cleared ✓'}
          </div>
        </div>
        <button className="btn btn-accent" onClick={() => navigate('billing')}>+ Issue new bill</button>
      </div>

      <div className="card" style={{ marginBottom: 16 }}>
        <h3>Charges</h3>
        <p className="card-sub">
          One row per charge. A patient who owes for more than one purpose appears once for each, and after a
          part-payment they stay listed for whatever is still unpaid.
        </p>
        <table>
          <tbody>
            <tr>
              <th>Bill</th><th>Patient</th><th>Purpose</th><th>Amount</th><th>Paid</th><th>Balance</th><th>Status</th><th></th>
            </tr>
            {rows.map((b) => {
              const p = patients.find((x) => x.id === b.patientId);
              return (
                <tr key={b.id}>
                  <td>{b.id}</td>
                  <td>{p ? <NameLink id={p.id}>{p.name}</NameLink> : b.patientId}</td>
                  <td>
                    <div style={{ fontWeight: 600 }}>{b.purpose || '—'}</div>
                    <div style={{ fontSize: 12, color: 'var(--muted)' }}>{b.desc}</div>
                  </td>
                  <td>₹{b.amount}</td>
                  <td>₹{b.status === 'Paid' ? b.amount : (b.paid || 0)}</td>
                  <td style={{ fontWeight: 600 }}>₹{billBalance(b)}</td>
                  <td><StatusBadge bill={b} /></td>
                  <td>
                    {b.status === 'Pending'
                      ? <button className="btn btn-sm btn-accent" onClick={() => openPayment(b.patientId)}>Collect payment</button>
                      : <span style={{ color: 'var(--muted)', fontSize: 12 }}>Cleared</span>}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="card">
        <h3>Payment history</h3>
        {payments.length === 0 ? (
          <div className="popup-empty">No payments recorded yet. Use “Collect payment” on a charge above.</div>
        ) : (
          <table>
            <tbody>
              <tr><th>Ref</th><th>Date</th><th>Patient</th><th>Method</th><th>Amount</th><th>Applied to</th></tr>
              {payments.map((pay) => {
                const p = patients.find((x) => x.id === pay.patientId);
                return (
                  <tr key={pay.id}>
                    <td>{pay.id}</td>
                    <td>{pay.date}</td>
                    <td>{p ? p.name : pay.patientId}</td>
                    <td>{pay.method}{pay.reference ? ` • ${pay.reference}` : ''}</td>
                    <td style={{ fontWeight: 600 }}>₹{pay.amount}</td>
                    <td style={{ fontSize: 12.5 }}>
                      {pay.allocations.map((a) => `${a.purpose} ₹${a.applied}`).join(', ')}
                    </td>
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
