import React, { useState } from 'react';
import { useApp } from '../AppContext.jsx';

export default function Procedures() {
  const { role, procedures, addProcedure, updateProcedure, toggleProcedureStatus } = useApp();
  const canEdit = role === 'manager';
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', description: '', unitCost: '' });

  const set = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));
  const submit = (e) => {
    e.preventDefault();
    if (!form.name) return;
    addProcedure(form);
    setForm({ name: '', description: '', unitCost: '' });
    setShowForm(false);
  };

  return (
    <>
      <div className="page-head">
        <div><h1>Procedures</h1><div className="desc">{canEdit ? 'Add, edit rates, or archive procedures' : 'Available procedures and rates'}</div></div>
        {canEdit && <button className="btn btn-accent" onClick={() => setShowForm((s) => !s)}>{showForm ? 'Cancel' : '+ Add procedure'}</button>}
      </div>

      {canEdit && showForm && (
        <form className="card" style={{ marginBottom: 16 }} onSubmit={submit}>
          <h3>Add procedure</h3>
          <div className="form-grid cols-3">
            <div className="field"><label>Name</label><input type="text" value={form.name} onChange={set('name')} placeholder="e.g. MRI — Knee" /></div>
            <div className="field"><label>Description</label><input type="text" value={form.description} onChange={set('description')} placeholder="Short description" /></div>
            <div className="field"><label>Unit cost (₹)</label><input type="number" value={form.unitCost} onChange={set('unitCost')} placeholder="e.g. 2500" /></div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
            <button type="button" className="btn" onClick={() => setShowForm(false)}>Cancel</button>
            <button type="submit" className="btn btn-accent">Add procedure</button>
          </div>
        </form>
      )}

      <div className="card">
        <table>
          <tbody>
            <tr><th>ID</th><th>Name</th><th>Description</th><th>Unit cost</th><th>Status</th>{canEdit && <th></th>}</tr>
            {procedures.map((p) => (
              <tr key={p.id}>
                <td>{p.id}</td>
                <td style={{ fontWeight: 600 }}>{p.name}</td>
                <td>{p.description}</td>
                <td>
                  {canEdit
                    ? <input type="number" defaultValue={p.unitCost} style={{ width: 90, padding: '5px 8px' }} onBlur={(e) => updateProcedure(p.id, { unitCost: Number(e.target.value) })} />
                    : `₹${p.unitCost}`}
                </td>
                <td><span className={`badge ${p.status === 'Active' ? 'stable' : 'pending'}`}>{p.status}</span></td>
                {canEdit && (
                  <td><button className="btn btn-sm" onClick={() => toggleProcedureStatus(p.id)}>{p.status === 'Active' ? 'Archive' : 'Reactivate'}</button></td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
