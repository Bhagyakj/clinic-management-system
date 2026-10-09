import React from 'react';
import { useApp } from '../AppContext.jsx';
import { pendingBillsCount, patientPayStatus, billBalance } from '../data.js';
import { StatCard, QuickAction, NameLink, Badge, PayBadge, Donut } from './Shared.jsx';

export default function Dashboard() {
  const { role } = useApp();
  switch (role) {
    case 'manager': return <ManagerBody />;
    case 'fos': return <FosBody />;
    case 'jdoc': return <JdocBody />;
    case 'sdoc': return <SdocBody />;
    case 'nurse': return <NurseBody />;
    case 'pharm': return <PharmBody />;
    default: return null;
  }
}

function ManagerBody() {
  const { patients, bills, rooms } = useApp();
  const pending = pendingBillsCount(bills);
  const occupiedRooms = rooms.filter((r) => r.status === 'occupied').length;
  return (
    <>
      <div className="stat-grid">
        <StatCard label="Total Patients" value={patients.length} delta="live from database" />
        <StatCard label="Pending Bills" value={pending} delta={pending > 0 ? `${pending} bill(s) awaiting payment` : 'All bills cleared'} neg={pending > 0} />
        <StatCard label="Occupied Rooms" value={occupiedRooms} delta={`of ${rooms.length} total rooms`} />
        <StatCard label="Admitted Patients" value={patients.filter((p) => p.admitted).length} delta="currently IP" />
      </div>
      <div className="card" style={{ marginBottom: 16 }}>
        <h3>Quick actions</h3>
        <div className="qa-grid">
          <QuickAction icon="👤" label="Add User" nav="users" />
          <QuickAction icon="💊" label="Add Medicine" nav="medicines" />
          <QuickAction icon="🧾" label="Add Procedure" nav="procedures" />
          <QuickAction icon="🚪" label="Manage Rooms" nav="rooms" />
        </div>
      </div>
      <div className="grid-2">
        <div className="card">
          <h3>Recent patients</h3>
          {patients.length === 0 ? <div className="popup-empty">No patients yet.</div> : (
            <table>
              <tbody>
                <tr><th>ID</th><th>Name</th><th>Type</th><th>Last Visit</th><th>Payment</th></tr>
                {patients.slice(0, 5).map((p) => (
                  <tr key={p._id}>
                    <td>{p.id}</td>
                    <td><NameLink id={p._id}>{p.name}</NameLink></td>
                    <td>{p.type}</td>
                    <td>{p.lastVisit || '—'}</td>
                    <td><PayBadge status={patientPayStatus(bills, p._id)} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
        <div className="card">
          <h3>Room status</h3>
          <Donut rooms={rooms} />
        </div>
      </div>
    </>
  );
}

function FosBody() {
  const { patients, doctors, bills, appointments, navigate, openPayment, showToast } = useApp();
  const pendingBills = bills.filter((b) => b.status !== 'paid');
  return (
    <>
      <div className="stat-grid">
        <StatCard label="Total Patients" value={patients.length} delta="live from database" />
        <StatCard label="Appointments Booked" value={appointments.length} delta="all time" />
        <StatCard label="Pending Bills" value={pendingBills.length} delta={pendingBills.length > 0 ? `${pendingBills.length} not yet cleared` : 'All cleared ✓'} neg={pendingBills.length > 0} />
        <StatCard label="Admissions" value={patients.filter((p) => p.admitted).length} delta="currently admitted" />
      </div>
      <div className="card" style={{ marginBottom: 16 }}>
        <h3>Quick actions</h3>
        <div className="qa-grid">
          <QuickAction icon="🧑‍🤝‍🧑" label="Register Patient" nav="patients" />
          <QuickAction icon="📅" label="Book Appointment" nav="patients" />
          <QuickAction icon="💳" label="Make Payment" nav="payments" />
          <QuickAction icon="🛏️" label="New Admission" nav="admissions" />
        </div>
      </div>
      <div className="grid-2">
        <div className="card">
          <h3>Appointments</h3>
          {appointments.length === 0 ? <div className="popup-empty">No appointments booked yet.</div> : (
            <table>
              <tbody>
                <tr><th>Date</th><th>Time</th><th>Patient</th><th>Doctor</th><th>Status</th></tr>
                {appointments.slice(0, 8).map((a) => {
                  const patient = patients.find((p) => p._id === a.patientId);
                  const doctorId = typeof a.doctorId === 'string' ? a.doctorId : a.doctorId?._id;
                  const doctorName = a.doctorId && typeof a.doctorId === 'object' && a.doctorId.name
                    ? a.doctorId.name
                    : doctors.find((d) => d._id === doctorId)?.name || a.doctor || '—';
                  return (
                    <tr key={a._id}>
                      <td>{a.date ? new Date(a.date).toLocaleDateString() : '—'}</td>
                      <td>{a.time}</td>
                      <td>{patient ? <NameLink id={patient._id}>{patient.name}</NameLink> : '—'}</td>
                      <td>{doctorName}</td>
                      <td><Badge status={a.status} /></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
        <div className="card">
          <h3>Pending payments</h3>
          {pendingBills.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '24px 10px', color: 'var(--muted)', fontSize: 13 }}>
              ✅ All bills are cleared — no pending payments.
            </div>
          ) : (
            <table>
              <tbody>
                <tr><th>Patient</th><th>Charges</th><th>Balance</th><th></th></tr>
                {pendingBills.map((b) => {
                  const p = patients.find((x) => x._id === b.patientId);
                  return (
                    <tr key={b._id}>
                      <td>{p ? <NameLink id={p._id}>{p.name}</NameLink> : '—'}</td>
                      <td style={{ fontSize: 12.5 }}>{(b.purpose || []).map((l) => l.description).join(', ')}</td>
                      <td>₹{billBalance(b)}</td>
                      <td><button className="btn btn-sm btn-accent" onClick={() => openPayment(b._id)}>Collect</button></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
          <button className="btn btn-sm" style={{ marginTop: 10 }} onClick={() => navigate('payments')}>View all payments →</button>
        </div>
      </div>
    </>
  );
}

function JdocBody() {
  const { navigate, appointments, patients } = useApp();
  return (
    <>
      <div className="stat-grid">
        <StatCard label="Appointments" value={appointments.length} delta="all time" />
        <StatCard label="Confirmed" value={appointments.filter((a) => a.status === 'confirmed').length} delta="awaiting consult" />
        <StatCard label="Completed" value={appointments.filter((a) => a.status === 'completed').length} delta="all time" />
      </div>
      <div className="grid-2">
        <div className="card">
          <h3>Appointments</h3>
          {appointments.length === 0 ? <div className="popup-empty">No appointments booked yet.</div> : (
            <table>
              <tbody>
                <tr><th>Date</th><th>Time</th><th>Patient</th><th>Status</th><th></th></tr>
                {appointments.slice(0, 8).map((a) => {
                  const patient = patients.find((p) => p._id === a.patientId);
                  return (
                    <tr key={a._id}>
                      <td>{a.date ? new Date(a.date).toLocaleDateString() : '—'}</td>
                      <td>{a.time}</td>
                      <td>{patient ? <NameLink id={patient._id}>{patient.name}</NameLink> : '—'}</td>
                      <td><Badge status={a.status} /></td>
                      <td><button className="btn btn-sm" onClick={() => navigate('consultation')}>View</button></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
        <div className="card">
          <h3>Quick actions</h3>
          <div className="qa-grid" style={{ gridTemplateColumns: '1fr' }}>
            <QuickAction icon="📝" label="Add Consultation" nav="consultation" />
            <QuickAction icon="🕘" label="View Patient History" nav="patients" />
          </div>
        </div>
      </div>
    </>
  );
}

function SdocBody() {
  const { patients, bills } = useApp();
  return (
    <>
      <div className="stat-grid">
        <StatCard label="Total Patients" value={patients.length} delta="live from database" />
        <StatCard label="Admitted (IP)" value={patients.filter((p) => p.admitted).length} delta="currently" />
      </div>
      <div className="grid-2">
        <div className="card">
          <h3>Recent patients</h3>
          {patients.length === 0 ? <div className="popup-empty">No patients yet.</div> : (
            <table>
              <tbody>
                <tr><th>ID</th><th>Name</th><th>Type</th><th>Last Visit</th><th>Payment</th></tr>
                {patients.map((p) => (
                  <tr key={p._id}>
                    <td>{p.id}</td>
                    <td><NameLink id={p._id}>{p.name}</NameLink></td>
                    <td>{p.type}</td>
                    <td>{p.lastVisit || '—'}</td>
                    <td><PayBadge status={patientPayStatus(bills, p._id)} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
        <div className="card">
          <h3>Quick actions</h3>
          <div className="qa-grid" style={{ gridTemplateColumns: '1fr' }}>
            <QuickAction icon="🕘" label="View Patient History" nav="patients" />
            <QuickAction icon="💊" label="Add Prescription" nav="prescription" />
          </div>
        </div>
      </div>
    </>
  );
}

function NurseBody() {
  const { patients } = useApp();
  const ip = patients.filter((p) => p.admitted);
  return (
    <>
      <div className="stat-grid">
        <StatCard label="My IP Patients" value={ip.length} delta="currently admitted" />
      </div>
      <div className="grid-2">
        <div className="card">
          <h3>IP patients</h3>
          {ip.length === 0 ? <div className="popup-empty">No patients currently admitted.</div> : (
            <table>
              <tbody>
                <tr><th>Patient</th><th>Room</th><th>Status</th></tr>
                {ip.map((p) => (
                  <tr key={p._id}>
                    <td><NameLink id={p._id}>{p.name}</NameLink></td>
                    <td>{p.room}</td>
                    <td><Badge status="stable" /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
        <div className="card">
          <h3>Quick actions</h3>
          <div className="qa-grid" style={{ gridTemplateColumns: '1fr' }}>
            <QuickAction icon="💊" label="Record Medicine" />
            <QuickAction icon="🧾" label="Record Procedure" />
            <QuickAction icon="🛏️" label="View IP Patients" nav="ip" />
          </div>
        </div>
      </div>
    </>
  );
}

function PharmBody() {
  const { patients } = useApp();
  return (
    <>
      <div className="stat-grid">
        <StatCard label="Total Patients" value={patients.length} delta="live from database" />
      </div>
      <div className="grid-2">
        <div className="card">
          <h3>Patients</h3>
          {patients.length === 0 ? <div className="popup-empty">No patients yet.</div> : (
            <table>
              <tbody>
                <tr><th>Patient</th><th>Doctor</th><th>Last Visit</th><th></th></tr>
                {patients.slice(0, 5).map((p) => (
                  <tr key={p._id}>
                    <td><NameLink id={p._id}>{p.name}</NameLink></td>
                    <td>{p.doctor}</td>
                    <td>{p.lastVisit || '—'}</td>
                    <td><button className="btn btn-sm">View</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
        <div className="card">
          <h3>Quick actions</h3>
          <div className="qa-grid" style={{ gridTemplateColumns: '1fr' }}>
            <QuickAction icon="🧮" label="Prepare Pharmacy Bill" />
            <QuickAction icon="✅" label="Mark Delivery" />
          </div>
        </div>
      </div>
    </>
  );
}
