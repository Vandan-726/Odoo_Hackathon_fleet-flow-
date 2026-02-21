'use client';
import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import TopBar from '@/components/TopBar';
import { getRoleAccess } from '@/components/TopBar';

export default function DashboardLayout({ children }) {
    const pathname = usePathname();
    const router = useRouter();
    const [authorized, setAuthorized] = useState(false);

    useEffect(() => {
        const userData = localStorage.getItem('fleetflow_user');
        if (!userData) {
            router.push('/');
            return;
        }

        const user = JSON.parse(userData);
        const allowedPaths = getRoleAccess(user.role);

        // Check if current pathname is allowed for this role
        const isAllowed = allowedPaths.some(path => pathname === path || pathname.startsWith(path + '/'));

        if (!isAllowed) {
            router.push('/dashboard');
            return;
        }

        setAuthorized(true);
    }, [pathname, router]);

    if (!authorized) {
        return (
            <div className="app-layout">
                <TopBar />
                <main className="main-content">
                    <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-light)' }}>
                        Loading...
                    </div>
                </main>
            </div>
        );
    }

    return (
        <div className="app-layout">
            <TopBar />
            <main className="main-content">
                {children}
            </main>
        </div>
    );
}
