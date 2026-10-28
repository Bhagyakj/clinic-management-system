import React, { useEffect, useMemo, useState } from 'react';
import { useApp } from '../AppContext.jsx';
import { normalizeDoctorUserId } from '../utils/doctorVisibility.js';

const TABS = ['Vitals', 'Complaints', 'Observations', 'Diagnosis Notes'];

export default function Consultation() {
  const { role, navigate, saveConsultation, patients, consultationPatientId, userName, currentUserId, reportingDoctorId, doctors, appointments, setAppointments, api } = useApp();
  const [tab, setTab] = useState('Vitals');
  const isSenior = role === 'sdoc';
  const isJunior = role === 'jdoc';

  const patient = useMemo(() => {
    if (consultationPatientId) return patients.find((p) => p._id === consultationPatientId) || null;
    return patients[0] || null;
  }, [consultationPatientId, patients]);

  const latestConsultation = Array.isArray(patient?.consultations) && patient.consultations.length > 0
    ? patient.consultations[0]
    : null;

  const initialForm = useMemo(() => ({
    temp: latestConsultation?.vitals?.temp ?? patient?.vitals?.temp ?? '',
    bp: latestConsultation?.vitals?.bp ?? patient?.vitals?.bp ?? '',
    pulse: latestConsultation?.vitals?.pulse ?? patient?.vitals?.pulse ?? '',
    resp: latestConsultation?.vitals?.resp ?? patient?.vitals?.resp ?? '',
    weight: latestConsultation?.vitals?.weight ?? '',
    height: latestConsultation?.vitals?.height ?? '',
    complaints: latestConsultation?.complaints ?? '',
    observations: latestConsultation?.observations ?? '',
    diagnosis: latestConsultation?.diagnosis ?? '',
  }), [latestConsultation, patient]);

  const [form, setForm] = useState(initialForm);

  const getDoctorId = (appointment) => {
    if (!appointment?.doctorId) return '';
    if (typeof appointment.doctorId === 'string') return appointment.doctorId;
    if (typeof appointment.doctorId === 'object') return appointment.doctorId._id || '';
    return '';
  };

  const userNameText = String(userName || '').trim();
  const patientDoctorText = String(patient?.doctor || '').trim();

  const currentDoctor = useMemo(() => {
    const safeUserId = String(currentUserId || '').trim();
    const safeUserName = String(userName || '').trim();
    return doctors.find((doctor) => {
      const userIdMatch = safeUserId && normalizeDoctorUserId(doctor?.userId) === safeUserId;
      const name = String(doctor?.name || '').trim();
      const nameMatch = !!safeUserName && (
        name === safeUserName
        || name === safeUserName.replace(/\s*\((?:JD|SD)\)\s*$/i, '')
        || safeUserName.includes(name)
      );
      return userIdMatch || nameMatch;
    }) || null;
  }, [currentUserId, doctors, userName]);

  useEffect(() => {
    setForm(initialForm);
  }, [initialForm]);

  useEffect(() => {
    if (!api || !patient || !currentDoctor) return;

    const pendingNewAppointment = [...appointments]
      .filter((appointment) => {
        const samePatient = appointment.patientId && (
          String(appointment.patientId) === String(patient._id)
          || String(appointment.patientId) === String(patient.id)
        );
        const sameDoctor = String(getDoctorId(appointment)) === String(currentDoctor._id);
        const notCancelled = String(appointment.status || '').toLowerCase() !== 'cancelled';
        return samePatient && sameDoctor && notCancelled && String(appointment.status || '').toLowerCase() === 'new';
      })
      .sort((a, b) => new Date(b.date || 0).getTime() - new Date(a.date || 0).getTime())[0];

    if (!pendingNewAppointment) return;

    let isMounted = true;
    api.updateAppointmentStatus(pendingNewAppointment._id, 'confirmed')
      .then((updatedAppointment) => {
        if (!isMounted) return;
        setAppointments((prev) => prev.map((appointment) => (
          appointment._id === updatedAppointment._id ? updatedAppointment : appointment
        )));
      })
      .catch((err) => {
        console.warn('Could not confirm appointment from consultation view:', err?.message || err);
      });

    return () => {
      isMounted = false;
    };
  }, [api, appointments, currentDoctor, patient, setAppointments]);

  const assignedSeniorName = useMemo(() => {
    if (!reportingDoctorId) return '';
    const seniorDoctor = doctors.find((doctor) => normalizeDoctorUserId(doctor?.userId) === normalizeDoctorUserId(reportingDoctorId));
    return String(seniorDoctor?.name || '').trim();
  }, [doctors, reportingDoctorId]);

  const equalsNameMatch = (a, b) => {
    const first = String(a || '').trim();
    const second = String(b || '').trim();
    if (!first || !second) return false;
    return first === second
      || first.toLowerCase().includes(second.toLowerCase())
      || second.toLowerCase().includes(first.toLowerCase());
  };

  const patientMatchesCurrentDoctor = !patientDoctorText || equalsNameMatch(patientDoctorText, userNameText);
  const patientMatchesAssignedSenior = !!assignedSeniorName && equalsNameMatch(patientDoctorText, assignedSeniorName);
  const canRecord = isSenior || (isJunior && (patientMatchesCurrentDoctor || patientMatchesAssignedSenior));
  const hasRequiredVitals = ['temp', 'bp', 'pulse', 'resp'].every((field) => String(form[field] ?? '').trim() !== '');
  const hasRequiredNotes = ['complaints', 'observations', 'diagnosis'].every((field) => String(form[field] ?? '').trim() !== '');
  const canSave = canRecord && hasRequiredVitals && hasRequiredNotes;

  const handleChange = (field) => (e) => setForm((prev) => ({ ...prev, [field]: e.target.value }));

  if (!patient) {
    return (
      <div className="card" style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--muted)' }}>
        No patient is selected. Open a patient record and start a consultation from there.
      </div>
    );
  }

  return (
    <>
      <div className="page-head">
        <div>
          <h1>{isSenior ? 'Assigned patient consultation' : 'New consultation'}</h1>
          <div className="desc">Patient: {patient.name} &nbsp;•&nbsp; Age {patient.age} &nbsp;•&nbsp; Type {patient.type} &nbsp;•&nbsp; Assigned senior: {patient.doctor || '—'}</div>
        </div>
        <span className="badge waiting">In progress</span>
      </div>

      {!canRecord && isJunior && (
        <div className="card" style={{ marginBottom: 12, color: 'var(--muted)', border: '1px solid var(--line)' }}>
          This patient is assigned to {patient.doctor || 'another doctor'}, so you can only review the consultation notes for this case.
        </div>
      )}

      <div className="card">
        <div className="tabs">
          {TABS.map((t) => (
            <button key={t} className={`tab ${tab === t ? 'active' : ''}`} onClick={() => setTab(t)}>{t}</button>
          ))}
        </div>

        {tab === 'Vitals' && (
          <div className="form-grid cols-3">
            <div className="field"><label>Temperature (°C)</label><input type="text" value={form.temp} onChange={handleChange('temp')} placeholder="e.g. 37.5" disabled={!canRecord} /></div>
            <div className="field"><label>BP (mmHg)</label><input type="text" value={form.bp} onChange={handleChange('bp')} placeholder="e.g. 120/80" disabled={!canRecord} /></div>
            <div className="field"><label>Pulse (bpm)</label><input type="text" value={form.pulse} onChange={handleChange('pulse')} placeholder="e.g. 76" disabled={!canRecord} /></div>
            <div className="field"><label>Respiration (per min)</label><input type="text" value={form.resp} onChange={handleChange('resp')} placeholder="e.g. 16" disabled={!canRecord} /></div>
            <div className="field"><label>Weight (kg)</label><input type="text" value={form.weight} onChange={handleChange('weight')} placeholder="e.g. 62" disabled={!canRecord} /></div>
            <div className="field"><label>Height (cm)</label><input type="text" value={form.height} onChange={handleChange('height')} placeholder="e.g. 160" disabled={!canRecord} /></div>
          </div>
        )}

        {tab === 'Complaints' && (
          <div className="field full" style={{ marginTop: 6 }}>
            <label>Complaints</label>
            <textarea value={form.complaints} onChange={handleChange('complaints')} placeholder="Describe the patient's presenting complaints..." disabled={!canRecord} />
          </div>
        )}

        {tab === 'Observations' && (
          <div className="field full">
            <label>Observations</label>
            <textarea value={form.observations} onChange={handleChange('observations')} placeholder="Clinical observations on examination..." disabled={!canRecord} />
          </div>
        )}

        {tab === 'Diagnosis Notes' && (
          <div className="field full">
            <label>Diagnosis notes {!isSenior && <span style={{ color: 'var(--muted)', fontWeight: 500 }}>(visible to senior doctor)</span>}</label>
            <textarea value={form.diagnosis} onChange={handleChange('diagnosis')} placeholder="Diagnosis and treatment plan..." disabled={!canRecord} />
          </div>
        )}

        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 16, alignItems: 'center' }}>
          <button className="btn" onClick={() => navigate('dashboard')}>Cancel</button>
          <button className="btn btn-accent" onClick={() => saveConsultation(form)} disabled={!canSave}>
            Save consultation
          </button>
        </div>
        {!canSave && (
          <div style={{ marginTop: 10, textAlign: 'right', color: 'var(--muted)', fontSize: 12 }}>
            Complete vitals, complaints, observations, and diagnosis notes to save.
          </div>
        )}
      </div>

      <div className="card" style={{ marginTop: 20 }}>
        <h3 style={{ marginBottom: 12 }}>Patient history</h3>

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
      </div>
    </>
  );
}
