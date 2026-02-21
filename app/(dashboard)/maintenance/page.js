'use client';
import { useState, useEffect } from 'react';
import StatusPill from '@/components/StatusPill';
import Modal from '@/components/Modal';

export default function MaintenancePage() {
    const [logs, setLogs] = useState([]);
    const [vehicles, setVehicles] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [error, setError] = useState('');
    const [form, setForm] = useState({ vehicle_id: '', service_type: 'Oil Change', description: '', cost: '', service_date: '' });

    const fetchAll = async () => {
        const [m, v] = await Promise.all([
            fetch('/api/maintenance').then(r => r.json()),
            fetch('/api/vehicles').then(r => r.json()),
        ]);
        setLogs(m);
        setVehicles(v);
    };

    useEffect(() => { fetchAll(); }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        const res = await fetch('/api/maintenance', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ...form, cost: Number(form.cost) }),
        });
        if (!res.ok) { const d = await res.json(); setError(d.error); return; }
        setShowModal(false);
        setForm({ vehicle_id: '', service_type: 'Oil Change', description: '', cost: '', service_date: '' });
        fetchAll();
    };

    const completeMaintenance = async (id) => {
        await fetch(`/api/maintenance/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: 'Completed' }),
        });
        fetchAll();
    };

    const inShopCount = vehicles.filter(v => v.status === 'In Shop').length;
    const totalCost = logs.reduce((s, l) => s + (l.cost || 0), 0);

    return (
        <div className="fade-in">
            <div className="page-header">
                <h1>Maintenance & Service Logs</h1>
                <div className="page-header-actions">
                    <button className="btn btn-primary" onClick={() => { setError(''); setShowModal(true); }}>+ Log Service</button>
                </div>
            </div>

            {inShopCount > 0 && (
                <div className="alert-banner warning">{inShopCount} vehicle(s) currently in shop for maintenance</div>
            )}

            <div className="kpi-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
                <div className="kpi-card">
                    <div className="kpi-card-icon blue"><svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M16 4h2a2 2 0 012 2v14a2 2 0 01-2 2H6a2 2 0 01-2-2V6a2 2 0 012-2h2" /><rect x="8" y="2" width="8" height="4" rx="1" /></svg></div>
                    <div className="kpi-label">Total Services</div>
                    <div className="kpi-value">{logs.length}</div>
                </div>
                <div className="kpi-card">
                    <div className="kpi-card-icon red"><svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" /></svg></div>
                    <div className="kpi-label">Total Maintenance Cost</div>
                    <div className="kpi-value">₹{totalCost.toLocaleString()}</div>
                </div>
                <div className="kpi-card">
                    <div className="kpi-card-icon yellow"><svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M14.7 6.3a1 1 0 000 1.4l1.6 1.6a1 1 0 001.4 0l3.77-3.77a6 6 0 01-7.94 7.94l-6.91 6.91a2.12 2.12 0 01-3-3l6.91-6.91a6 6 0 017.94-7.94l-3.76 3.76z" /></svg></div>
                    <div className="kpi-label">Vehicles In Shop</div>
                    <div className="kpi-value">{inShopCount}</div>
                </div>
            </div>

            <div className="table-container">
                <table>
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Vehicle</th>
                            <th>Service Type</th>
                            <th>Description</th>
                            <th>Cost</th>
                            <th>Date</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {logs.map(log => (
                            <tr key={log.id}>
                                <td style={{ fontWeight: 600, color: 'var(--text-dark)' }}>SVC-{String(log.id).padStart(3, '0')}</td>
                                <td>{log.vehicle_name} <span style={{ color: 'var(--text-light)', fontSize: '.78rem' }}>({log.license_plate})</span></td>
                                <td>{log.service_type}</td>
                                <td>{log.description || '—'}</td>
                                <td>₹{(log.cost || 0).toLocaleString()}</td>
                                <td>{log.service_date}</td>
                                <td><StatusPill status={log.status} /></td>
                                <td>
                                    {(log.status === 'Scheduled' || log.status === 'In Progress') && (
                                        <button className="btn btn-sm btn-success" onClick={() => completeMaintenance(log.id)}>Complete</button>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {logs.length === 0 && <div className="table-empty">No maintenance logs yet</div>}
            </div>

            {showModal && (
                <Modal title="Log New Service" onClose={() => setShowModal(false)}>
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
                                <label>Service Type</label>
                                <select className="form-select" value={form.service_type} onChange={e => setForm({ ...form, service_type: e.target.value })}>
                                    {['Oil Change', 'Tire Rotation', 'Brake Inspection', 'Engine Overhaul', 'Battery Replacement', 'Transmission Service', 'AC Repair', 'General Inspection', 'Other'].map(t => (
                                        <option key={t} value={t}>{t}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                        <div className="form-row">
                            <div className="form-group">
                                <label>Cost (₹)</label>
                                <input className="form-input" type="number" value={form.cost} onChange={e => setForm({ ...form, cost: e.target.value })} placeholder="2500" />
                            </div>
                            <div className="form-group">
                                <label>Service Date</label>
                                <input className="form-input" type="date" value={form.service_date} onChange={e => setForm({ ...form, service_date: e.target.value })} required />
                            </div>
                        </div>
                        <div className="form-group">
                            <label>Description (optional)</label>
                            <textarea className="form-textarea" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="Service details..." />
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, paddingTop: 8 }}>
                            <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                            <button type="submit" className="btn btn-primary">Log Service</button>
                        </div>
                    </form>
                </Modal>
            )}
        </div>
    );
}
