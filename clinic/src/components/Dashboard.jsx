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
  const occupiedRooms = rooms.filter((r) => r.status === 'Occupied').length;
  return (
    <>
      <div className="stat-grid">
        <StatCard label="Total Patients" value={patients.length} delta="+12% from last week" />
        <StatCard label="Today's Appointments" value="28" delta="+5% from yesterday" />
        <StatCard label="Pending Payments" value={pending} delta={pending > 0 ? `${pending} bill(s) awaiting payment` : 'All bills cleared'} neg />
        <StatCard label="Occupied Rooms" value={occupiedRooms} delta={`of ${rooms.length} total rooms`} />
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
          <table>
            <tbody>
              <tr><th>ID</th><th>Name</th><th>Type</th><th>Last Visit</th><th>Payment</th></tr>
              {patients.slice(0, 5).map((p) => (
                <tr key={p.id}>
                  <td>{p.id}</td>
                  <td><NameLink id={p.id}>{p.name}</NameLink></td>
                  <td>{p.type}</td>
                  <td>{p.lastVisit}</td>
                  <td><PayBadge status={patientPayStatus(bills, p.id)} /></td>
                </tr>
              ))}
            </tbody>
          </table>
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
  const { patients, bills, appointments, navigate, openPayment } = useApp();
  const pending = bills.filter((b) => b.status === 'Pending');
  const pendingCount = pending.length;
  return (
    <>
      <div className="stat-grid">
        <StatCard label="Total Patients" value={patients.length} delta="+8% from last week" />
        <StatCard label="Today's Appointments" value={appointments.length} delta="+3% from yesterday" />
        <StatCard label="Pending Payments" value={pendingCount} delta={pendingCount > 0 ? `${pendingCount} patient bill(s) not yet cleared` : 'All patients cleared ✓'} neg={pendingCount > 0} />
        <StatCard label="Admissions" value={patients.filter((p) => p.admitted).length} delta="currently admitted" />
      </div>
      <div className="card" style={{ marginBottom: 16 }}>
        <h3>Quick actions</h3>
        <div className="qa-grid">
          <QuickAction icon="🧑‍🤝‍🧑" label="Register Patient" nav="patients" />
          <QuickAction icon="📅" label="Book Appointment" nav="appointments" />
          <QuickAction icon="💳" label="Make Payment" nav="payments" />
          <QuickAction icon="🛏️" label="New Admission" nav="admissions" />
        </div>
      </div>
      <div className="grid-2">
        <div className="card">
          <h3>Today's appointments</h3>
          <table>
            <tbody>
              <tr><th>Time</th><th>Patient</th><th>Doctor</th><th>Status</th></tr>
              {appointments.map((a) => (
                <tr key={a.id}>
                  <td>{a.time}</td>
                  <td><NameLink id={a.patientId}>{a.patient}</NameLink></td>
                  <td>{a.doctor}</td>
                  <td><Badge status={a.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="card">
          <h3>Pending payments</h3>
          {pending.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '24px 10px', color: 'var(--muted)', fontSize: 13 }}>
              ✅ All bills are cleared — no pending payments.
            </div>
          ) : (
            <table>
              <tbody>
                <tr><th>Patient</th><th>Bill</th><th>Amount</th><th></th></tr>
                {pending.map((b) => {
                  const p = patients.find((x) => x.id === b.patientId);
                  return (
                    <tr key={b.id}>
                      <td><NameLink id={p.id}>{p.name}</NameLink></td>
                      <td>{b.desc}</td>
                      <td>₹{billBalance(b)}</td>
                      <td><button className="btn btn-sm btn-accent" onClick={() => openPayment(b.patientId)}>Collect</button></td>
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
  const { navigate, appointments } = useApp();
  return (
    <>
      <div className="stat-grid">
        <StatCard label="Today's Appointments" value={appointments.length} delta="+2 from yesterday" />
        <StatCard label="Waiting Patients" value={appointments.filter((a) => a.status === 'waiting').length} delta="-1 from yesterday" />
        <StatCard label="Completed Consultations" value="8" delta="+3 from yesterday" />
      </div>
      <div className="grid-2">
        <div className="card">
          <h3>Today's appointments</h3>
          <table>
            <tbody>
              <tr><th>Time</th><th>Patient</th><th>Type</th><th>Status</th><th></th></tr>
              {appointments.map((a) => (
                <tr key={a.id}>
                  <td>{a.time}</td>
                  <td><NameLink id={a.patientId}>{a.patient}</NameLink></td>
                  <td>OP</td>
                  <td><Badge status={a.status} /></td>
                  <td><button className="btn btn-sm" onClick={() => navigate('consultation')}>View</button></td>
                </tr>
              ))}
            </tbody>
          </table>
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
        <StatCard label="Today's Appointments" value="14" delta="+1 from yesterday" />
        <StatCard label="Pending Prescriptions" value="6" delta="-2 from yesterday" neg />
        <StatCard label="Patient Histories Reviewed" value="24" delta="+4 from yesterday" />
      </div>
      <div className="grid-2">
        <div className="card">
          <h3>Recent patients</h3>
          <table>
            <tbody>
              <tr><th>ID</th><th>Name</th><th>Type</th><th>Last Visit</th><th>Payment</th></tr>
              {patients.map((p) => (
                <tr key={p.id}>
                  <td>{p.id}</td>
                  <td><NameLink id={p.id}>{p.name}</NameLink></td>
                  <td>{p.type}</td>
                  <td>{p.lastVisit}</td>
                  <td><PayBadge status={patientPayStatus(bills, p.id)} /></td>
                </tr>
              ))}
            </tbody>
          </table>
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
        <StatCard label="My IP Patients" value={ip.length} delta="+1 from yesterday" />
        <StatCard label="Today's Medicines" value="8" delta="+2 from yesterday" />
        <StatCard label="Today's Procedures" value="4" delta="-1 from yesterday" neg />
      </div>
      <div className="grid-2">
        <div className="card">
          <h3>My IP patients</h3>
          <table>
            <tbody>
              <tr><th>Patient</th><th>Room</th><th>Admitted On</th><th>Status</th></tr>
              {ip.map((p) => (
                <tr key={p.id}>
                  <td><NameLink id={p.id}>{p.name}</NameLink></td>
                  <td>{p.room}</td>
                  <td>{p.lastVisit}</td>
                  <td><Badge status="stable" /></td>
                </tr>
              ))}
            </tbody>
          </table>
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
        <StatCard label="Pending Prescriptions" value="9" delta="-3% from yesterday" neg />
        <StatCard label="Pending Bills" value="5" delta="+4% from yesterday" />
        <StatCard label="Delivered Medicines" value="18" delta="+6% from yesterday" />
      </div>
      <div className="grid-2">
        <div className="card">
          <h3>Pending prescriptions</h3>
          <table>
            <tbody>
              <tr><th>Patient</th><th>Doctor</th><th>Date</th><th>Status</th><th></th></tr>
              {patients.slice(0, 3).map((p) => (
                <tr key={p.id}>
                  <td><NameLink id={p.id}>{p.name}</NameLink></td>
                  <td>{p.doctor}</td>
                  <td>{p.lastVisit}</td>
                  <td><Badge status="pending" /></td>
                  <td><button className="btn btn-sm">View</button></td>
                </tr>
              ))}
            </tbody>
          </table>
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
