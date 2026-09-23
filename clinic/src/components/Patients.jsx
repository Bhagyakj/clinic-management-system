import React from 'react';
import { useApp } from '../AppContext.jsx';
import { patientPayStatus } from '../data.js';
import { NameLink, PayBadge } from './Shared.jsx';

export default function Patients() {
  const { patients, bills, showToast, openPatient } = useApp();
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
            <tr><th>ID</th><th>Name</th><th>Gender</th><th>Phone</th><th>Type</th><th>Admission days</th><th>Payment</th><th>Actions</th></tr>
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
                  <button className="btn btn-sm" onClick={() => openPatient(p.id)}>View</button>{' '}
                  <button className="btn btn-sm" onClick={() => showToast('Opens edit form')}>Edit</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
