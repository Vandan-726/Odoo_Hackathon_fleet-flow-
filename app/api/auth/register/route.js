import { NextResponse } from 'next/server';
const { getDb } = require('@/lib/db');
const { createToken, hashPassword } = require('@/lib/auth');
const { isValidEmail, isNonEmptyString } = require('@/lib/validate');

const VALID_ROLES = ['manager', 'dispatcher', 'safety_officer', 'analyst'];

export async function POST(request) {
    try {
        const { name, email, password, role } = await request.json();

        // Validate inputs
        if (!isNonEmptyString(name)) {
            return NextResponse.json({ error: 'Name is required' }, { status: 400 });
        }
        if (name.trim().length > 60) {
            return NextResponse.json({ error: 'Name must be under 60 characters' }, { status: 400 });
        }
        if (!isValidEmail(email)) {
            return NextResponse.json({ error: 'Valid email is required' }, { status: 400 });
        }
        if (!password || password.length < 6) {
            return NextResponse.json({ error: 'Password must be at least 6 characters' }, { status: 400 });
        }
        if (!VALID_ROLES.includes(role)) {
            return NextResponse.json({ error: 'Please select a valid role' }, { status: 400 });
        }

        const db = getDb();

        // Check for duplicate email
        const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email.trim().toLowerCase());
        if (existing) {
            return NextResponse.json({ error: 'An account with this email already exists' }, { status: 409 });
        }

        // Create user
        const password_hash = hashPassword(password);
        const result = db.prepare(
            'INSERT INTO users (email, password_hash, name, role) VALUES (?, ?, ?, ?)'
        ).run(email.trim().toLowerCase(), password_hash, name.trim(), role);

        const user = {
            id: result.lastInsertRowid,
            name: name.trim(),
            email: email.trim().toLowerCase(),
            role
        };

        const token = createToken(user);

        return NextResponse.json({ token, user }, { status: 201 });
    } catch (err) {
        console.error('Registration error:', err);
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}
