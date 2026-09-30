import React, { useState } from 'react';
import { useApp } from '../AppContext.jsx';

export default function Rooms() {
  const { rooms, addRoom, setRoomStatus } = useApp();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', perNightCost: '', facilities: [] });

  const toggleFacility = (f) => setForm((prev) => ({
    ...prev,
    facilities: prev.facilities.includes(f) ? prev.facilities.filter((x) => x !== f) : [...prev.facilities, f],
  }));

  const submit = (e) => {
    e.preventDefault();
    if (!form.name) return;
    addRoom(form);
    setForm({ name: '', perNightCost: '', facilities: [] });
    setShowForm(false);
  };

  const counts = {
    Available: rooms.filter((r) => r.status === 'Available').length,
    Occupied: rooms.filter((r) => r.status === 'Occupied').length,
    Closed: rooms.filter((r) => r.status === 'Closed').length,
  };

  return (
    <>
      <div className="page-head">
        <div><h1>Rooms</h1><div className="desc">{counts.Available} available • {counts.Occupied} occupied • {counts.Closed} closed</div></div>
        <button className="btn btn-accent" onClick={() => setShowForm((s) => !s)}>{showForm ? 'Cancel' : '+ Add room'}</button>
      </div>

      {showForm && (
        <form className="card" style={{ marginBottom: 16 }} onSubmit={submit}>
          <h3>Add room</h3>
          <div className="form-grid cols-3">
            <div className="field"><label>Room name</label><input type="text" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} placeholder="e.g. Room 106" /></div>
            <div className="field"><label>Per night cost (₹)</label><input type="number" value={form.perNightCost} onChange={(e) => setForm((f) => ({ ...f, perNightCost: e.target.value }))} placeholder="e.g. 1500" /></div>
            <div className="field">
              <label>Facilities</label>
              <div style={{ display: 'flex', gap: 12, paddingTop: 6 }}>
                {['TV', 'AC', 'Bystander Cot'].map((f) => (
                  <label key={f} style={{ fontSize: 13, display: 'flex', alignItems: 'center', gap: 5 }}>
                    <input type="checkbox" checked={form.facilities.includes(f)} onChange={() => toggleFacility(f)} /> {f}
                  </label>
                ))}
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
            <button type="button" className="btn" onClick={() => setShowForm(false)}>Cancel</button>
            <button type="submit" className="btn btn-accent">Add room</button>
          </div>
        </form>
      )}

      <div className="card">
        <table>
          <tbody>
            <tr><th>ID</th><th>Room</th><th>Facilities</th><th>Per night</th><th>Status</th></tr>
            {rooms.map((r) => (
              <tr key={r.id}>
                <td>{r.id}</td>
                <td style={{ fontWeight: 600 }}>{r.name}</td>
                <td>{r.facilities.join(', ') || '—'}</td>
                <td>₹{r.perNightCost}</td>
                <td>
                  <select
                    value={r.status}
                    onChange={(e) => setRoomStatus(r.id, e.target.value)}
                    style={{ padding: '5px 8px', borderRadius: 6, border: '1px solid var(--line)', fontSize: 12.5 }}
                  >
                    <option>Available</option>
                    <option>Occupied</option>
                    <option>Closed</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
