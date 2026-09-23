import React from 'react';
import { useApp } from '../AppContext.jsx';
import { patientPayStatus } from '../data.js';
import { NameLink, PayBadge } from './Shared.jsx';

export default function Payments() {
  const { patients, bills, navigate, markBillPaid } = useApp();
  const pending = bills.filter((b) => b.status === 'Pending');
  const paid = bills.filter((b) => b.status === 'Paid');

  return (
    <>
      <div className="page-head">
        <div>
          <h1>Payments</h1>
          <div className="desc">{pending.length > 0 ? `${pending.length} bill(s) pending • ${paid.length} cleared` : 'All bills cleared ✓'}</div>
        </div>
        <button className="btn btn-accent" onClick={() => navigate('billing')}>+ Issue new bill</button>
      </div>

      {pending.length === 0 && (
        <div className="card" style={{ textAlign: 'center', padding: '40px 20px', marginBottom: 16 }}>
          <div style={{ fontSize: 30, marginBottom: 8 }}>✅</div>
          <h3 style={{ marginBottom: 4 }}>All cleared</h3>
          <p style={{ color: 'var(--muted)', fontSize: 13 }}>Every patient bill has been paid. New bills will appear here as they're issued.</p>
        </div>
      )}

      <div className="card" style={{ marginBottom: 16 }}>
        <h3>{pending.length > 0 ? 'Pending payments' : 'Recent bills'}</h3>
        <table>
          <tbody>
            <tr><th>Bill ID</th><th>Patient</th><th>Description</th><th>Amount</th><th>Status</th><th></th></tr>
            {bills.map((b) => {
              const p = patients.find((x) => x.id === b.patientId);
              return (
                <tr key={b.id}>
                  <td>{b.id}</td>
                  <td><NameLink id={p.id}>{p.name}</NameLink></td>
                  <td>{b.desc}</td>
                  <td>₹{b.amount}</td>
                  <td><PayBadge status={b.status} /></td>
                  <td>
                    {b.status === 'Pending'
                      ? <button className="btn btn-sm btn-accent" onClick={() => markBillPaid(b.id)}>Mark paid</button>
                      : <span style={{ color: 'var(--muted)', fontSize: 12 }}>Cleared</span>}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="card">
        <h3>Patient clearance status</h3>
        <table>
          <tbody>
            <tr><th>Patient</th><th>Type</th><th>Overall status</th></tr>
            {patients.map((p) => (
              <tr key={p.id}>
                <td><NameLink id={p.id}>{p.name}</NameLink></td>
                <td>{p.type}</td>
                <td><PayBadge status={patientPayStatus(bills, p.id)} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
