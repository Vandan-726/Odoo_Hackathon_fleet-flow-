'use client';

export default function StatusPill({ status }) {
    const className = status?.toLowerCase().replace(/\s+/g, '-') || '';
    return <span className={`status-pill ${className}`}>{status}</span>;
}
