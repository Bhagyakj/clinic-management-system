import React, { useState } from 'react';
import { useApp } from '../AppContext.jsx';

export default function Rooms() {
  const { rooms, dataLoading, addRoom, setRoomStatus } = useApp();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ roomNumber: '', type: 'general', capacity: 1, perNightCost: '', facilities: [] });

  const toggleFacility = (f) => setForm((prev) => ({
    ...prev,
    facilities: prev.facilities.includes(f) ? prev.facilities.filter((x) => x !== f) : [...prev.facilities, f],
  }));

  const submit = async (e) => {
    e.preventDefault();
    if (!form.roomNumber || !form.perNightCost) return;
    await addRoom(form);
    setForm({ roomNumber: '', type: 'general', capacity: 1, perNightCost: '', facilities: [] });
    setShowForm(false);
  };

  const counts = {
    available: rooms.filter((r) => r.status === 'available').length,
    occupied: rooms.filter((r) => r.status === 'occupied').length,
    maintenance: rooms.filter((r) => r.status === 'maintenance').length,
  };

  return (
    <>
      <div className="page-head">
        <div><h1>Rooms</h1><div className="desc">{counts.available} available • {counts.occupied} occupied • {counts.maintenance} under maintenance</div></div>
        <button className="btn btn-accent" onClick={() => setShowForm((s) => !s)}>{showForm ? 'Cancel' : '+ Add room'}</button>
      </div>

      {showForm && (
        <form className="card" style={{ marginBottom: 16 }} onSubmit={submit}>
          <h3>Add room</h3>
          <div className="form-grid cols-3">
            <div className="field"><label>Room number</label><input type="text" value={form.roomNumber} onChange={(e) => setForm((f) => ({ ...f, roomNumber: e.target.value }))} placeholder="e.g. 106" /></div>
            <div className="field">
              <label>Type</label>
              <select value={form.type} onChange={(e) => setForm((f) => ({ ...f, type: e.target.value }))}>
                <option value="general">General</option><option value="ICU">ICU</option><option value="private">Private</option>
              </select>
            </div>
            <div className="field"><label>Per night cost (₹)</label><input type="number" value={form.perNightCost} onChange={(e) => setForm((f) => ({ ...f, perNightCost: e.target.value }))} placeholder="e.g. 1500" /></div>
            <div className="field"><label>Capacity</label><input type="number" min={1} value={form.capacity} onChange={(e) => setForm((f) => ({ ...f, capacity: e.target.value }))} /></div>
            <div className="field full">
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
        {dataLoading && rooms.length === 0 ? (
          <div className="popup-empty">Loading rooms…</div>
        ) : (
          <table>
            <tbody>
              <tr><th>Room</th><th>Type</th><th>Capacity</th><th>Facilities</th><th>Per night</th><th>Status</th></tr>
              {rooms.map((r) => (
                <tr key={r._id}>
                  <td style={{ fontWeight: 600 }}>{r.roomNumber}</td>
                  <td>{r.type}</td>
                  <td>{r.capacity}</td>
                  <td>{(r.facilities || []).join(', ') || '—'}</td>
                  <td>₹{r.perNightCost}</td>
                  <td>
                    <select
                      value={r.status}
                      onChange={(e) => setRoomStatus(r._id, e.target.value)}
                      disabled={r.status === 'occupied'}
                      title={r.status === 'occupied' ? 'Occupied rooms are freed automatically on discharge' : ''}
                      style={{ padding: '5px 8px', borderRadius: 6, border: '1px solid var(--line)', fontSize: 12.5 }}
                    >
                      <option value="available">Available</option>
                      <option value="occupied">Occupied</option>
                      <option value="maintenance">Maintenance</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </>
  );
}
