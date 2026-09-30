import React, { useState, useEffect } from 'react';
import { useApp } from '../AppContext.jsx';
import { allocatePayment, pendingBillsForPatient, billBalance } from '../data.js';

// Popup to take a payment from one patient. The amount can be less than the
// total due — it is split across the pending charges (oldest first), and any
// charge not fully covered stays pending as its own row.
export default function CollectPayment() {
  const { payPatientId, closePayment, patients, bills, recordPayment } = useApp();
  const patient = patients.find((p) => p.id === payPatientId);
  const pending = payPatientId ? pendingBillsForPatient(bills, payPatientId) : [];
  const totalDue = pending.reduce((sum, b) => sum + billBalance(b), 0);

  const [amount, setAmount] = useState('');
  const [method, setMethod] = useState('Cash');
  const [reference, setReference] = useState('');

  useEffect(() => {
    if (payPatientId) { setAmount(String(totalDue)); setMethod('Cash'); setReference(''); }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [payPatientId]);

  if (!payPatientId || !patient) return null;

  const value = Number(amount);
  const valid = value > 0 && value <= totalDue;
  const preview = allocatePayment(pending, valid ? value : 0);

  const confirm = () => {
    if (!valid) return;
    recordPayment({ patientId: payPatientId, amount: value, method, reference });
    closePayment();
  };

  return (
    <div className="popup-overlay" onClick={closePayment}>
      <div className="popup-box" style={{ maxWidth: 520 }} onClick={(e) => e.stopPropagation()}>
        <div className="popup-head">
          <div>
            <h3>Collect payment</h3>
            <div className="sub">{patient.name} • {patient.id}</div>
          </div>
          <button className="popup-close" onClick={closePayment}>✕</button>
        </div>

        {pending.length === 0 ? (
          <div className="popup-empty">✅ Nothing pending — this patient is fully cleared.</div>
        ) : (
          <>
            <div className="field">
              <label>Amount received (total due ₹{totalDue})</label>
              <input type="number" min={1} max={totalDue} value={amount} onChange={(e) => setAmount(e.target.value)} />
              {amount !== '' && !valid && (
                <div style={{ color: 'var(--bad)', fontSize: 12, marginTop: 6 }}>
                  Enter an amount between ₹1 and ₹{totalDue}.
                </div>
              )}
            </div>
            <div className="form-grid" style={{ marginBottom: 4 }}>
              <div className="field">
                <label>Payment method</label>
                <select value={method} onChange={(e) => setMethod(e.target.value)}>
                  <option>Cash</option><option>UPI</option><option>Card</option>
                </select>
              </div>
              <div className="field">
                <label>Reference (UPI / card ref)</label>
                <input type="text" value={reference} onChange={(e) => setReference(e.target.value)} placeholder="optional" />
              </div>
            </div>

            <div className="split-title">How this payment is split</div>
            {preview.map((a) => (
              <div className="split-row" key={a.billId}>
                <div>
                  <div className="d">{a.purpose}</div>
                  <div className="doc">{a.desc} • due ₹{a.due}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div className="d">₹{a.applied}</div>
                  <div className="doc" style={{ color: a.remaining === 0 ? 'var(--good)' : 'var(--warn)' }}>
                    {a.remaining === 0 ? 'Paid in full' : `₹${a.remaining} still pending`}
                  </div>
                </div>
              </div>
            ))}
            <p className="split-note">
              The payment goes to the oldest charge first. Any charge that isn't fully paid stays in
              Payments as its own row, so the patient shows once for each unpaid purpose.
            </p>

            <button className="btn btn-accent" style={{ width: '100%', marginTop: 8 }} disabled={!valid} onClick={confirm}>
              Confirm payment{valid ? ` of ₹${value}` : ''}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
