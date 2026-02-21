import { NextResponse } from 'next/server';
const { getDb } = require('@/lib/db');

export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const token = searchParams.get('token');

        if (!token) {
            return NextResponse.redirect(new URL('/?verify_error=missing_token', request.url));
        }

        const db = await getDb();

        // Look up the token
        const tokenResult = await db.query(
            'SELECT * FROM verification_tokens WHERE token = $1',
            [token]
        );

        if (tokenResult.rows.length === 0) {
            return NextResponse.redirect(new URL('/?verify_error=invalid_token', request.url));
        }

        const tokenRecord = tokenResult.rows[0];

        // Check expiry
        if (new Date(tokenRecord.expires_at) < new Date()) {
            // Delete expired token
            await db.query('DELETE FROM verification_tokens WHERE id = $1', [tokenRecord.id]);
            return NextResponse.redirect(new URL('/?verify_error=expired_token', request.url));
        }

        // Mark user as verified
        await db.query('UPDATE users SET email_verified = true WHERE id = $1', [tokenRecord.user_id]);

        // Delete the used token
        await db.query('DELETE FROM verification_tokens WHERE user_id = $1', [tokenRecord.user_id]);

        // Redirect to login page with success flag
        return NextResponse.redirect(new URL('/?verified=true', request.url));
    } catch (err) {
        console.error('Email verification error:', err);
        return NextResponse.redirect(new URL('/?verify_error=server_error', request.url));
    }
}
