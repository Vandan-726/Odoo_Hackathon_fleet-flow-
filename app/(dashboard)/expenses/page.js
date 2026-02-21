'use client';
import { useState, useEffect } from 'react';
import Modal from '@/components/Modal';

export default function ExpensesPage() {
    const [expenses, setExpenses] = useState([]);
    const [vehicles, setVehicles] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [filterVehicle, setFilterVehicle] = useState('');
    const [error, setError] = useState('');
    const [form, setForm] = useState({ vehicle_id: '', type: 'Fuel', liters: '', cost: '', expense_date: '', notes: '' });

    const fetchAll = async () => {
        const params = new URLSearchParams();
        if (filterVehicle) params.set('vehicle_id', filterVehicle);
        const [e, v] = await Promise.all([
            fetch(`/api/expenses?${params}`).then(r => r.json()),
            fetch('/api/vehicles').then(r => r.json()),
        ]);
        setExpenses(e);
        setVehicles(v);
    };

    useEffect(() => { fetchAll(); }, [filterVehicle]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        const res = await fetch('/api/expenses', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ...form, cost: Number(form.cost), liters: Number(form.liters) }),
        });
        if (!res.ok) { const d = await res.json(); setError(d.error); return; }
        setShowModal(false);
        setForm({ vehicle_id: '', type: 'Fuel', liters: '', cost: '', expense_date: '', notes: '' });
        fetchAll();
    };

    const totalFuel = expenses.filter(e => e.type === 'Fuel').reduce((s, e) => s + (e.cost || 0), 0);
    const totalToll = expenses.filter(e => e.type === 'Toll').reduce((s, e) => s + (e.cost || 0), 0);
    const totalOther = expenses.filter(e => e.type === 'Other').reduce((s, e) => s + (e.cost || 0), 0);

    return (
        <div className="fade-in">
            <div className="page-header">
                <h1>Expenses & Fuel Tracking</h1>
                <div className="page-header-actions">
                    <button className="btn btn-primary" onClick={() => { setError(''); setShowModal(true); }}>+ Log Expense</button>
                </div>
            </div>

            <div className="kpi-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
                <div className="kpi-card">
                    <div className="kpi-card-icon green"><svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M3 22V5a2 2 0 012-2h8a2 2 0 012 2v17" /><path d="M15 11l4 1v5a2 2 0 01-2 2" /><rect x="5" y="7" width="8" height="5" rx="1" /></svg></div>
                    <div className="kpi-label">Fuel Expenses</div>
                    <div className="kpi-value">₹{totalFuel.toLocaleString()}</div>
                    <div className="kpi-sub">{expenses.filter(e => e.type === 'Fuel').length} entries</div>
                </div>
                <div className="kpi-card">
                    <div className="kpi-card-icon yellow"><svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12h4l3-9 4 18 3-9h4" /></svg></div>
                    <div className="kpi-label">Toll Expenses</div>
                    <div className="kpi-value">₹{totalToll.toLocaleString()}</div>
                    <div className="kpi-sub">{expenses.filter(e => e.type === 'Toll').length} entries</div>
                </div>
                <div className="kpi-card">
                    <div className="kpi-card-icon blue"><svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z" /><polyline points="3.27 6.96 12 12.01 20.73 6.96" /><line x1="12" y1="22.08" x2="12" y2="12" /></svg></div>
                    <div className="kpi-label">Other Expenses</div>
                    <div className="kpi-value">₹{totalOther.toLocaleString()}</div>
                    <div className="kpi-sub">{expenses.filter(e => e.type === 'Other').length} entries</div>
                </div>
            </div>

            <div className="filter-bar">
                <select value={filterVehicle} onChange={e => setFilterVehicle(e.target.value)}>
                    <option value="">All Vehicles</option>
                    {vehicles.map(v => (
                        <option key={v.id} value={v.id}>{v.name} — {v.license_plate}</option>
                    ))}
                </select>
            </div>

            <div className="table-container">
                <table>
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Vehicle</th>
                            <th>Type</th>
                            <th>Liters</th>
                            <th>Cost</th>
                            <th>Date</th>
                            <th>Notes</th>
                        </tr>
                    </thead>
                    <tbody>
                        {expenses.map(exp => (
                            <tr key={exp.id}>
                                <td style={{ fontWeight: 600, color: 'var(--text-dark)' }}>EXP-{String(exp.id).padStart(3, '0')}</td>
                                <td>{exp.vehicle_name} <span style={{ color: 'var(--text-light)', fontSize: '.78rem' }}>({exp.license_plate})</span></td>
                                <td>
                                    <span style={{
                                        padding: '2px 8px', borderRadius: 12, fontSize: '.78rem', fontWeight: 600,
                                        background: exp.type === 'Fuel' ? 'var(--green-bg)' : exp.type === 'Toll' ? 'var(--yellow-bg)' : 'var(--blue-bg)',
                                        color: exp.type === 'Fuel' ? 'var(--green)' : exp.type === 'Toll' ? 'var(--yellow)' : 'var(--blue)',
                                    }}>{exp.type}</span>
                                </td>
                                <td>{exp.liters ? `${exp.liters}L` : '—'}</td>
                                <td>₹{(exp.cost || 0).toLocaleString()}</td>
                                <td>{exp.expense_date}</td>
                                <td>{exp.notes || '—'}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {expenses.length === 0 && <div className="table-empty">No expenses logged yet</div>}
            </div>

            {showModal && (
                <Modal title="Log New Expense" onClose={() => setShowModal(false)}>
                    {error && <div className="login-error" style={{ marginBottom: 14 }}>{error}</div>}
                    <form onSubmit={handleSubmit}>
                        <div className="form-row">
                            <div className="form-group">
                                <label>Vehicle</label>
                                <select className="form-select" value={form.vehicle_id} onChange={e => setForm({ ...form, vehicle_id: e.target.value })} required>
                                    <option value="">Select vehicle...</option>
                                    {vehicles.map(v => (
                                        <option key={v.id} value={v.id}>{v.name} — {v.license_plate}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Expense Type</label>
                                <select className="form-select" value={form.type} onChange={e => setForm({ ...form, type: e.target.value })}>
                                    <option value="Fuel">Fuel</option>
                                    <option value="Toll">Toll</option>
                                    <option value="Other">Other</option>
                                </select>
                            </div>
                        </div>
                        <div className="form-row">
                            <div className="form-group">
                                <label>Liters (if Fuel)</label>
                                <input className="form-input" type="number" value={form.liters} onChange={e => setForm({ ...form, liters: e.target.value })} placeholder="50" />
                            </div>
                            <div className="form-group">
                                <label>Cost (₹)</label>
                                <input className="form-input" type="number" value={form.cost} onChange={e => setForm({ ...form, cost: e.target.value })} placeholder="2800" required />
                            </div>
                        </div>
                        <div className="form-row">
                            <div className="form-group">
                                <label>Date</label>
                                <input className="form-input" type="date" value={form.expense_date} onChange={e => setForm({ ...form, expense_date: e.target.value })} required />
                            </div>
                            <div className="form-group">
                                <label>Notes (optional)</label>
                                <input className="form-input" value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} placeholder="Any notes..." />
                            </div>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, paddingTop: 8 }}>
                            <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                            <button type="submit" className="btn btn-primary">Log Expense</button>
                        </div>
                    </form>
                </Modal>
            )}
        </div>
    );
}
