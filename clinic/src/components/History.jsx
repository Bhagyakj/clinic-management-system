import React, { useEffect, useMemo, useState } from 'react';
import { useApp } from '../AppContext.jsx';

function renderHistorySections(patient) {
  if (!patient) return null;

  return (
    <div style={{ display: 'grid', gap: 16 }}>
      <div>
        <h4 style={{ marginBottom: 8 }}>Registration</h4>
        {Array.isArray(patient.history) && patient.history.filter((item) => item?.t === 'Registered').length > 0 ? (
          patient.history.filter((item) => item?.t === 'Registered').map((entry, idx) => (
            <div key={`reg-${idx}`} style={{ border: '1px solid var(--line)', borderRadius: 12, padding: 12, marginBottom: 8 }}>
              <strong>{entry?.d || '—'}</strong>
              <div style={{ color: 'var(--muted)' }}>{entry?.s || 'Patient registered.'}</div>
            </div>
          ))
        ) : (
          <div style={{ color: 'var(--muted)' }}>No registration record available.</div>
        )}
      </div>

      <div>
        <h4 style={{ marginBottom: 8 }}>Appointments</h4>
        {Array.isArray(patient.appointmentHistory) && patient.appointmentHistory.length > 0 ? (
          patient.appointmentHistory.map((entry, idx) => (
            <div key={`appt-${idx}`} style={{ border: '1px solid var(--line)', borderRadius: 12, padding: 12, marginBottom: 8 }}>
              <strong>{entry?.date || '—'}</strong> • {entry?.time || '—'}
              <div>{entry?.doctor || 'Doctor not assigned'}</div>
              <div style={{ color: 'var(--muted)' }}>{entry?.status || 'Status not available'}</div>
            </div>
          ))
        ) : (
          <div style={{ color: 'var(--muted)' }}>No appointment history available.</div>
        )}
      </div>

      <div>
        <h4 style={{ marginBottom: 8 }}>Consultations</h4>
        {Array.isArray(patient.consultations) && patient.consultations.length > 0 ? (
          patient.consultations.map((entry, idx) => (
            <div key={`${entry.createdAt || idx}-${idx}`} style={{ border: '1px solid var(--line)', borderRadius: 12, padding: 16, marginBottom: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, marginBottom: 8 }}>
                <strong>{entry.doctorName}</strong>
                <span style={{ color: 'var(--muted)' }}>{new Date(entry.createdAt).toLocaleString()}</span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 10, marginBottom: 10 }}>
                <div><b>Temp:</b> {entry.vitals?.temp || '—'}</div>
                <div><b>BP:</b> {entry.vitals?.bp || '—'}</div>
                <div><b>Pulse:</b> {entry.vitals?.pulse || '—'}</div>
                <div><b>Resp:</b> {entry.vitals?.resp || '—'}</div>
                <div><b>Weight:</b> {entry.vitals?.weight || '—'}</div>
                <div><b>Height:</b> {entry.vitals?.height || '—'}</div>
              </div>
              <div><b>Complaints:</b> {entry.complaints || '—'}</div>
              <div><b>Observations:</b> {entry.observations || '—'}</div>
              <div><b>Diagnosis:</b> {entry.diagnosis || '—'}</div>
            </div>
          ))
        ) : (
          <div style={{ color: 'var(--muted)' }}>No consultation history available.</div>
        )}
      </div>

      <div>
        <h4 style={{ marginBottom: 8 }}>Prescriptions</h4>
        {Array.isArray(patient.prescriptions) && patient.prescriptions.length > 0 ? (
          patient.prescriptions.map((entry, idx) => (
            <div key={`pres-${idx}`} style={{ border: '1px solid var(--line)', borderRadius: 12, padding: 12, marginBottom: 8 }}>
              <strong>{entry?.doctorName || 'Doctor'}</strong>
              <div style={{ color: 'var(--muted)' }}>{entry?.notes || 'No notes'}</div>
              {Array.isArray(entry?.medicines) && entry.medicines.length > 0 && (
                <ul style={{ margin: '8px 0 0 16px' }}>
                  {entry.medicines.map((m, i) => (
                    <li key={`${m.name || 'med'}-${i}`}>{m.name} — {m.dosage || '—'}</li>
                  ))}
                </ul>
              )}
            </div>
          ))
        ) : (
          <div style={{ color: 'var(--muted)' }}>No prescription history available.</div>
        )}
      </div>
    </div>
  );
}

export default function History() {
  const { role, patients, dataLoading } = useApp();
  const [search, setSearch] = useState('');
  const [selectedId, setSelectedId] = useState('');

  const filteredPatients = useMemo(() => {
    const q = String(search || '').trim().toLowerCase();
    if (!q) return patients;
    return patients.filter((p) => {
      const haystack = [p.name, p.phone, p.id].filter(Boolean).join(' ').toLowerCase();
      return haystack.includes(q);
    });
  }, [patients, search]);

  useEffect(() => {
    if (!filteredPatients.length) {
      setSelectedId('');
      return;
    }
    if (!selectedId || !filteredPatients.some((p) => p._id === selectedId)) {
      setSelectedId(filteredPatients[0]._id);
    }
  }, [filteredPatients, selectedId]);

  const selectedPatient = filteredPatients.find((p) => p._id === selectedId) || filteredPatients[0] || null;

  if (role !== 'sdoc') {
    return (
      <div className="card" style={{ textAlign: 'center', padding: '50px 20px', color: 'var(--muted)' }}>
        <div style={{ fontSize: 30, marginBottom: 10 }}>🕘</div>
        History is available for Senior Doctors only.
      </div>
    );
  }

  return (
    <>
      <div className="page-head">
        <div>
          <h1>History</h1>
          <div className="desc">Patient timeline, consultations, medications and prior visits</div>
        </div>
      </div>

      <div className="card">
        <label className="search-box" style={{ width: 280, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
          <span>🔍</span>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search patient by name, phone or ID"
            style={{ border: 'none', background: 'transparent', outline: 'none', width: '100%' }}
          />
        </label>

        {dataLoading && patients.length === 0 ? (
          <div className="popup-empty">Loading patient history…</div>
        ) : filteredPatients.length === 0 ? (
          <div className="popup-empty">No patient history matches your search.</div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: '320px minmax(0, 1fr)', gap: 16 }}>
            <div style={{ borderRight: '1px solid var(--line)', paddingRight: 8 }}>
              {filteredPatients.map((p) => (
                <button
                  key={p._id}
                  type="button"
                  onClick={() => setSelectedId(p._id)}
                  style={{
                    display: 'block',
                    width: '100%',
                    textAlign: 'left',
                    padding: '12px 10px',
                    marginBottom: 8,
                    border: `1px solid ${selectedPatient?._id === p._id ? 'var(--role-accent)' : 'var(--line)'}`,
                    borderRadius: 10,
                    background: selectedPatient?._id === p._id ? 'var(--role-soft)' : 'transparent',
                    cursor: 'pointer',
                    color: 'inherit',
                  }}
                >
                  <div style={{ fontWeight: 700 }}>{p.name}</div>
                  <div style={{ color: 'var(--muted)', fontSize: 12 }}>{p.id}</div>
                </button>
              ))}
            </div>

            <div>
              {selectedPatient && (
                <>
                  <div style={{ marginBottom: 16 }}>
                    <h3 style={{ margin: '0 0 6px' }}>{selectedPatient.name}</h3>
                    <div style={{ color: 'var(--muted)' }}>
                      {selectedPatient.id} • {selectedPatient.gender} • Age {selectedPatient.age} • Assigned doctor: {selectedPatient.doctor || '—'}
                    </div>
                  </div>
                  {renderHistorySections(selectedPatient)}
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </>
  );
}
