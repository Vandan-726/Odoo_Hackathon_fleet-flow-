import { NextResponse } from 'next/server';
const { getDb } = require('@/lib/db');
const { hashPassword } = require('@/lib/auth');
const { isValidEmail, isNonEmptyString } = require('@/lib/validate');
const { sendVerificationEmail } = require('@/lib/mailer');
const crypto = require('crypto');

const VALID_ROLES = ['manager', 'dispatcher', 'safety_officer', 'analyst'];

export async function POST(request) {
    try {
        const { name, email, password, role } = await request.json();

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

        const db = await getDb();

        const existing = await db.query('SELECT id, email_verified FROM users WHERE email = $1', [email.trim().toLowerCase()]);
        if (existing.rows.length > 0) {
            // If user exists but hasn't verified, resend verification email
            if (!existing.rows[0].email_verified) {
                const token = crypto.randomBytes(32).toString('hex');
                const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

                // Delete old tokens and create new one
                await db.query('DELETE FROM verification_tokens WHERE user_id = $1', [existing.rows[0].id]);
                await db.query(
                    'INSERT INTO verification_tokens (user_id, token, expires_at) VALUES ($1, $2, $3)',
                    [existing.rows[0].id, token, expiresAt]
                );

                try {
                    await sendVerificationEmail(email.trim().toLowerCase(), token);
                } catch (mailErr) {
                    console.error('Failed to resend verification email:', mailErr);
                    return NextResponse.json({ error: 'Failed to send verification email. Please try again.' }, { status: 500 });
                }

                return NextResponse.json({
                    success: true,
                    needsVerification: true,
                    message: 'A verification email has been resent. Please check your inbox.'
                }, { status: 200 });
            }
            return NextResponse.json({ error: 'An account with this email already exists' }, { status: 409 });
        }

        const password_hash = hashPassword(password);
        const result = await db.query(
            'INSERT INTO users (email, password_hash, name, role, email_verified) VALUES ($1, $2, $3, $4, false) RETURNING id',
            [email.trim().toLowerCase(), password_hash, name.trim(), role]
        );

        // Generate verification token
        const token = crypto.randomBytes(32).toString('hex');
        const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

        await db.query(
            'INSERT INTO verification_tokens (user_id, token, expires_at) VALUES ($1, $2, $3)',
            [result.rows[0].id, token, expiresAt]
        );

        // Send verification email
        try {
            await sendVerificationEmail(email.trim().toLowerCase(), token);
        } catch (mailErr) {
            console.error('Failed to send verification email:', mailErr);
            // Clean up user if email fails
            await db.query('DELETE FROM users WHERE id = $1', [result.rows[0].id]);
            return NextResponse.json({ error: 'Failed to send verification email. Please check your email address and try again.' }, { status: 500 });
        }

        return NextResponse.json({
            success: true,
            needsVerification: true,
            message: 'Account created! Please check your email to verify your account.'
        }, { status: 201 });
    } catch (err) {
        console.error('Registration error:', err);
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}
