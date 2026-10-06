import React, { useState, useEffect } from 'react';
import { useApp } from '../AppContext.jsx';
import { billBalance } from '../data.js';

// Popup to collect a (possibly partial) payment against ONE bill. The server
// splits the amount across that bill's own purpose lines, oldest first —
// this just shows a live preview of what that split will look like before
// confirming, then calls the real API.
export default function CollectPayment() {
  const { payBillId, closePayment, patients, bills, collectPayment } = useApp();
  const bill = bills.find((b) => b._id === payBillId);
  const patient = bill ? patients.find((p) => p._id === bill.patientId) : null;
  const totalDue = bill ? billBalance(bill) : 0;

  const [amount, setAmount] = useState('');
  const [method, setMethod] = useState('Cash');
  const [reference, setReference] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (payBillId) { setAmount(String(totalDue)); setMethod('Cash'); setReference(''); }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [payBillId]);

  if (!payBillId || !bill) return null;

  const value = Number(amount);
  const valid = value > 0 && value <= totalDue;

  // Client-side-only preview of the server's oldest-first split, for display
  const preview = (() => {
    let left = valid ? value : 0;
    return (bill.purpose || []).map((line) => {
      const due = (line.amount || 0) - (line.paid || 0);
      const applied = Math.min(Math.max(due, 0), Math.max(left, 0));
      left -= applied;
      return { description: line.description, due, applied, remaining: due - applied };
    });
  })();

  const confirm = async () => {
    if (!valid || submitting) return;
    setSubmitting(true);
    await collectPayment(bill._id, { amount: value, method, reference });
    setSubmitting(false);
    closePayment();
  };

  return (
    <div className="popup-overlay" onClick={closePayment}>
      <div className="popup-box" style={{ maxWidth: 520 }} onClick={(e) => e.stopPropagation()}>
        <div className="popup-head">
          <div>
            <h3>Collect payment</h3>
            <div className="sub">{patient ? `${patient.name} • ${patient.id}` : 'Patient'} — Bill {bill._id.slice(-6).toUpperCase()}</div>
          </div>
          <button className="popup-close" onClick={closePayment}>✕</button>
        </div>

        {totalDue === 0 ? (
          <div className="popup-empty">✅ This bill is already fully paid.</div>
        ) : (
          <>
            <div className="field">
              <label>Amount received (balance due ₹{totalDue})</label>
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
            {preview.map((a, i) => (
              <div className="split-row" key={i}>
                <div>
                  <div className="d">{a.description}</div>
                  <div className="doc">due ₹{a.due}</div>
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
              The payment goes to this bill's oldest unpaid charge first. Any charge that isn't fully covered stays
              pending. This only affects this one bill — if the patient has other separate bills, collect those
              individually from the Payments page.
            </p>

            <button className="btn btn-accent" style={{ width: '100%', marginTop: 8 }} disabled={!valid || submitting} onClick={confirm}>
              {submitting ? 'Recording…' : `Confirm payment${valid ? ` of ₹${value}` : ''}`}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
