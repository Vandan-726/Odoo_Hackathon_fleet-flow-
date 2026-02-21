'use client';
import { useState, useEffect } from 'react';
import StatusPill from '@/components/StatusPill';

export default function DashboardPage() {
    const [analytics, setAnalytics] = useState(null);
    const [trips, setTrips] = useState([]);
    const [allTrips, setAllTrips] = useState([]);
    const [vehicles, setVehicles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filterType, setFilterType] = useState('');
    const [filterStatus, setFilterStatus] = useState('');

    useEffect(() => {
        Promise.all([
            fetch('/api/analytics').then(r => r.json()),
            fetch('/api/trips').then(r => r.json()),
            fetch('/api/vehicles').then(r => r.json()),
        ]).then(([a, t, v]) => {
            setAnalytics(a);
            setAllTrips(t);
            setTrips(t);
            setVehicles(v);
            setLoading(false);
        });
    }, []);

    // Filter trips based on vehicle type
    useEffect(() => {
        let filtered = allTrips;
        if (filterStatus) filtered = filtered.filter(t => t.status === filterStatus);
        setTrips(filtered);
    }, [filterStatus, allTrips]);

    if (loading) return <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-light)' }}>Loading dashboard...</div>;

    const kpis = analytics?.kpis || {};

    return (
        <div className="fade-in">
            <div className="page-header">
                <h1>Command Center</h1>
                <div className="page-header-actions">
                    <select className="form-select" style={{ width: 'auto', padding: '7px 30px 7px 10px', fontSize: '.82rem' }} value={filterType} onChange={e => setFilterType(e.target.value)}>
                        <option value="">Fleet Type</option>
                        <option value="Truck">Truck</option>
                        <option value="Van">Van</option>
                        <option value="Bike">Bike</option>
                    </select>
                    <select className="form-select" style={{ width: 'auto', padding: '7px 30px 7px 10px', fontSize: '.82rem' }} value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
                        <option value="">Status</option>
                        <option value="Draft">Draft</option>
                        <option value="Dispatched">Dispatched</option>
                        <option value="Completed">Completed</option>
                        <option value="Cancelled">Cancelled</option>
                    </select>
                </div>
            </div>

            {/* 4 KPI cards in one row — matching wireframe */}
            <div className="kpi-grid">
                <div className="kpi-card">
                    <div className="kpi-card-icon blue"><svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M5 17h14V9l-2-4H7L5 9v8z" /><circle cx="7.5" cy="17" r="1.5" /><circle cx="16.5" cy="17" r="1.5" /><path d="M5 9h14" /></svg></div>
                    <div className="kpi-label">Active Fleet</div>
                    <div className="kpi-value">{kpis.activeFleet || 0}</div>
                    <div className="kpi-sub">{kpis.totalVehicles} total vehicles</div>
                </div>
                <div className="kpi-card">
                    <div className="kpi-card-icon yellow"><svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M14.7 6.3a1 1 0 000 1.4l1.6 1.6a1 1 0 001.4 0l3.77-3.77a6 6 0 01-7.94 7.94l-6.91 6.91a2.12 2.12 0 01-3-3l6.91-6.91a6 6 0 017.94-7.94l-3.76 3.76z" /></svg></div>
                    <div className="kpi-label">Maintenance Alerts</div>
                    <div className="kpi-value">{kpis.inShop || 0}</div>
                    <div className="kpi-sub">Vehicles in shop</div>
                </div>
                <div className="kpi-card">
                    <div className="kpi-card-icon green"><svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" /><line x1="6" y1="20" x2="6" y2="14" /></svg></div>
                    <div className="kpi-label">Utilization Rate</div>
                    <div className="kpi-value">{kpis.utilizationRate || 0}%</div>
                    <div className="kpi-sub">{kpis.available} available</div>
                </div>
                <div className="kpi-card">
                    <div className="kpi-card-icon purple"><svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z" /><polyline points="3.27 6.96 12 12.01 20.73 6.96" /><line x1="12" y1="22.08" x2="12" y2="12" /></svg></div>
                    <div className="kpi-label">Pending Cargo</div>
                    <div className="kpi-value">{kpis.pendingCargo || 0}</div>
                    <div className="kpi-sub">Awaiting dispatch</div>
                </div>
            </div>

            {/* Recent Trips table */}
            <div className="table-container">
                <div className="table-toolbar">
                    <h3>Recent Trips</h3>
                </div>
                <table>
                    <thead>
                        <tr>
                            <th>Trip</th>
                            <th>Vehicle</th>
                            <th>Driver</th>
                            <th>Route</th>
                            <th>Cargo</th>
                            <th>Revenue</th>
                            <th>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {trips.slice(0, 10).map(trip => (
                            <tr key={trip.id}>
                                <td style={{ fontWeight: 600, color: 'var(--text-dark)' }}>TRIP-{String(trip.id).padStart(3, '0')}</td>
                                <td>{trip.vehicle_name} <span style={{ color: 'var(--text-light)', fontSize: '.78rem' }}>({trip.license_plate})</span></td>
                                <td>{trip.driver_name}</td>
                                <td>{trip.origin} → {trip.destination}</td>
                                <td>{trip.cargo_weight_kg} kg</td>
                                <td>₹{(trip.revenue || 0).toLocaleString()}</td>
                                <td><StatusPill status={trip.status} /></td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {trips.length === 0 && <div className="table-empty">No trips yet</div>}
            </div>
        </div>
    );
}
