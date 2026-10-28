import React from 'react';
import { useApp } from '../AppContext.jsx';
import { billBalance } from '../data.js';
import { NameLink } from './Shared.jsx';

function latestPrescriptionFor(patient) {
  const entries = Array.isArray(patient?.prescriptions) ? patient.prescriptions : [];
  return entries.find((entry) => Array.isArray(entry?.medicines) && entry.medicines.length > 0) || null;
}

function pharmacyBillsFor(bills) {
  return (Array.isArray(bills) ? bills : []).filter((bill) => {
    const labels = (bill?.purpose || []).map((line) => String(line?.description || ''));
    return labels.some((label) => /pharmacy|medicine/i.test(label));
  });
}

export default function Pharmacy({ pageKey = 'prescriptions' }) {
  const { patients, bills, medicines, createBill, openPayment, showToast } = useApp();

  const patientsWithPrescriptions = React.useMemo(() => {
    return (patients || []).filter((patient) => Boolean(latestPrescriptionFor(patient)));
  }, [patients]);

  const pharmacyBillList = React.useMemo(() => pharmacyBillsFor(bills), [bills]);

  const prepareBillForPatient = async (patient) => {
    const latest = latestPrescriptionFor(patient);
    if (!latest) {
      showToast('No prescription has been saved for this patient yet.');
      return;
    }

    const purpose = (latest.medicines || [])
      .map((medicine) => {
        const med = (medicines || []).find((item) => String(item?.name || '').toLowerCase() === String(medicine?.name || '').toLowerCase());
        const amount = Number(med?.unitCost || 0);
        if (!medicine?.name || amount <= 0) return null;
        return {
          desc: `Pharmacy — ${medicine.name}${medicine.dosage ? ` (${medicine.dosage})` : ''}`,
          amount,
        };
      })
      .filter(Boolean);

    if (!purpose.length) {
      showToast('This prescription has no valid medicine pricing in the database yet.');
      return;
    }

    await createBill(patient._id, purpose);
  };

  if (pageKey === 'pharmbills') {
    return (
      <>
        <div className="page-head">
          <div><h1>Pharmacy Bills</h1><div className="desc">Bills prepared from prescribed medicines and ready for collection</div></div>
        </div>

        <div className="card">
          {pharmacyBillList.length === 0 ? (
            <div className="popup-empty">No pharmacy bills prepared yet.</div>
          ) : (
            <table>
              <tbody>
                <tr><th>Bill</th><th>Patient</th><th>Items</th><th>Total</th><th>Balance</th><th></th></tr>
                {pharmacyBillList.map((bill) => {
                  const patient = (patients || []).find((p) => p._id === bill.patientId);
                  return (
                    <tr key={bill._id}>
                      <td>{bill._id.slice(-6).toUpperCase()}</td>
                      <td>{patient ? <NameLink id={patient._id}>{patient.name}</NameLink> : '—'}</td>
                      <td>{(bill.purpose || []).map((line) => line.description).join(', ')}</td>
                      <td>₹{bill.totalAmount}</td>
                      <td>₹{billBalance(bill)}</td>
                      <td>
                        {bill.status !== 'paid' && (
                          <button className="btn btn-sm btn-accent" onClick={() => openPayment(bill._id)}>Collect</button>
                        )}
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

  return (
    <>
      <div className="page-head">
        <div><h1>Pharmacy Prescriptions</h1><div className="desc">Review patient prescriptions and prepare the medicine bill</div></div>
      </div>

      <div className="card">
        {patientsWithPrescriptions.length === 0 ? (
          <div className="popup-empty">No patient prescriptions found yet.</div>
        ) : (
          <table>
            <tbody>
              <tr><th>Patient</th><th>Doctor</th><th>Medicines</th><th>Notes</th><th></th></tr>
              {patientsWithPrescriptions.map((patient) => {
                const latest = latestPrescriptionFor(patient);
                return (
                  <tr key={patient._id}>
                    <td><NameLink id={patient._id}>{patient.name}</NameLink></td>
                    <td>{latest?.doctorName || patient.doctor || '—'}</td>
                    <td>{(latest?.medicines || []).map((m) => `${m.name}${m.dosage ? ` (${m.dosage})` : ''}`).join(', ') || '—'}</td>
                    <td>{latest?.notes || '—'}</td>
                    <td>
                      <button className="btn btn-sm btn-accent" onClick={() => prepareBillForPatient(patient)}>Prepare bill</button>
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
