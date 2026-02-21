'use client';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

const navItems = [
    { href: '/dashboard', label: 'Command Center', icon: 'dashboard' },
    { href: '/vehicles', label: 'Vehicle Registry', icon: 'vehicle' },
    { href: '/trips', label: 'Trip Dispatcher', icon: 'trip' },
    { href: '/maintenance', label: 'Maintenance Logs', icon: 'maintenance' },
    { href: '/expenses', label: 'Expenses & Fuel', icon: 'expense' },
    { href: '/drivers', label: 'Driver Profiles', icon: 'driver' },
    { href: '/analytics', label: 'Analytics & Reports', icon: 'analytics' },
];

// Which pages each role can access
const roleAccess = {
    manager: ['/dashboard', '/vehicles', '/trips', '/maintenance', '/expenses', '/drivers', '/analytics'],
    dispatcher: ['/dashboard', '/trips', '/drivers'],
    safety_officer: ['/dashboard', '/maintenance', '/drivers', '/vehicles'],
    analyst: ['/dashboard', '/analytics', '/expenses'],
};

export function getRoleAccess(role) {
    return roleAccess[role] || ['/dashboard'];
}

function NavIcon({ type, size = 18 }) {
    const s = { width: size, height: size, fill: 'none', stroke: 'currentColor', strokeWidth: 1.8, strokeLinecap: 'round', strokeLinejoin: 'round' };
    switch (type) {
        case 'dashboard':
            return (<svg viewBox="0 0 24 24" {...s}><rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" /></svg>);
        case 'vehicle':
            return (<svg viewBox="0 0 24 24" {...s}><path d="M5 17h14V9l-2-4H7L5 9v8z" /><circle cx="7.5" cy="17" r="1.5" /><circle cx="16.5" cy="17" r="1.5" /><path d="M5 9h14" /></svg>);
        case 'trip':
            return (<svg viewBox="0 0 24 24" {...s}><path d="M3 12h4l3-9 4 18 3-9h4" /></svg>);
        case 'maintenance':
            return (<svg viewBox="0 0 24 24" {...s}><path d="M14.7 6.3a1 1 0 000 1.4l1.6 1.6a1 1 0 001.4 0l3.77-3.77a6 6 0 01-7.94 7.94l-6.91 6.91a2.12 2.12 0 01-3-3l6.91-6.91a6 6 0 017.94-7.94l-3.76 3.76z" /></svg>);
        case 'expense':
            return (<svg viewBox="0 0 24 24" {...s}><line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" /></svg>);
        case 'driver':
            return (<svg viewBox="0 0 24 24" {...s}><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>);
        case 'analytics':
            return (<svg viewBox="0 0 24 24" {...s}><line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" /><line x1="6" y1="20" x2="6" y2="14" /></svg>);
        case 'logout':
            return (<svg viewBox="0 0 24 24" {...s}><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" /></svg>);
        default:
            return null;
    }
}

export default function TopBar() {
    const pathname = usePathname();
    const router = useRouter();
    const [user, setUser] = useState(null);

    useEffect(() => {
        const userData = localStorage.getItem('fleetflow_user');
        if (userData) setUser(JSON.parse(userData));
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('fleetflow_token');
        localStorage.removeItem('fleetflow_user');
        router.push('/');
    };

    // Filter nav items based on user's role
    const allowedPaths = user ? getRoleAccess(user.role) : [];
    const visibleNavItems = navItems.filter(item => allowedPaths.includes(item.href));

    return (
        <header className="topbar">
            <div className="topbar-brand">
                <div className="topbar-logo">
                    <svg viewBox="0 0 40 40" width="32" height="32">
                        <circle cx="20" cy="20" r="20" fill="#714b67" />
                        <text x="20" y="26" textAnchor="middle" fill="#fff" fontFamily="Inter, sans-serif" fontWeight="800" fontSize="16">FF</text>
                    </svg>
                </div>
                <span className="topbar-title">FleetFlow</span>
            </div>
            <nav className="topbar-nav">
                {visibleNavItems.map(item => (
                    <a
                        key={item.href}
                        href={item.href}
                        className={`topbar-link ${pathname === item.href ? 'active' : ''}`}
                    >
                        <NavIcon type={item.icon} size={16} />
                        <span>{item.label}</span>
                    </a>
                ))}
            </nav>
            {user && (
                <div className="topbar-user">
                    <div className="topbar-avatar">
                        {user.name?.charAt(0)}
                    </div>
                    <div className="topbar-user-info">
                        <div className="topbar-user-name">{user.name}</div>
                        <div className="topbar-user-role">{user.role?.replace('_', ' ')}</div>
                    </div>
                    <button className="topbar-logout" onClick={handleLogout} title="Logout">
                        <NavIcon type="logout" size={18} />
                    </button>
                </div>
            )}
        </header>
    );
}
