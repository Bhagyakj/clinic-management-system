import React from 'react';
import { useApp } from '../AppContext.jsx';
import { NameLink, Badge } from './Shared.jsx';

export default function IPPatients() {
  const { patients } = useApp();
  const ip = patients.filter((p) => p.admitted);

  return (
    <>
      <div className="page-head">
        <div>
          <h1>IP Patients</h1>
          <div className="desc">Currently admitted inpatients</div>
        </div>
      </div>

      <div className="card">
        <h3>Admitted patients</h3>
        {ip.length === 0 ? (
          <div className="popup-empty">No patients currently admitted.</div>
        ) : (
          <table>
            <tbody>
              <tr><th>Patient</th><th>Room</th><th>Status</th></tr>
              {ip.map((p) => (
                <tr key={p._id}>
                  <td><NameLink id={p._id}>{p.name}</NameLink></td>
                  <td>{p.room || '—'}</td>
                  <td><Badge status="stable" /></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </>
  );
}
