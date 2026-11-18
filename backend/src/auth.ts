import type { Request, Response, NextFunction } from 'express'
import { OAuth2Client } from 'google-auth-library'
import jwt from 'jsonwebtoken'
import { pool } from './db.js'

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID!
const SESSION_SECRET = process.env.SESSION_SECRET!
const COOKIE = 'beacon_session'
const WEEK_MS = 7 * 24 * 60 * 60 * 1000

const google = new OAuth2Client()

export type SessionUser = { id: string; email: string; name: string }

export async function login(req: Request, res: Response) {
    const { credential } = req.body
    if (!credential) return res.status(400).json({ error: 'credential is required' })

    let payload
    try {
        const ticket = await google.verifyIdToken({
            idToken: credential,
            audience: GOOGLE_CLIENT_ID,
        })
        payload = ticket.getPayload()
    } catch {
        return res.status(401).json({ error: 'Invalid Google token' })
    }
    if (!payload?.sub || !payload.email) {
        return res.status(401).json({ error: 'Invalid Google token' })
    }

    const user: SessionUser = { id: payload.sub, email: payload.email, name: payload.name ?? '' }

    const created = await pool.query(
        'INSERT INTO users (id, email, name) VALUES ($1, $2, $3) ON CONFLICT (id) DO NOTHING',
        [user.id, user.email, user.name]
    )

    // First login: give the new user two demo orders
    if (created.rowCount === 1) {
        await pool.query(
            `INSERT INTO orders (id, user_id, item, status, eta) VALUES
        ('A-' || nextval('order_seq'), $1, 'Desk lamp', 'shipped', CURRENT_DATE + 2),
        ('A-' || nextval('order_seq'), $1, 'Notebook', 'processing', CURRENT_DATE + 6)`,
            [user.id]
        )
    }

    const token = jwt.sign(user, SESSION_SECRET, { expiresIn: '7d' })
    res.cookie(COOKIE, token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: WEEK_MS,
    })
    res.json({ user })
}

export function logout(_req: Request, res: Response) {
    res.clearCookie(COOKIE)
    res.json({ ok: true })
}

export function requireUser(req: Request, res: Response, next: NextFunction) {
    const token = req.cookies?.[COOKIE]
    if (!token) return res.status(401).json({ error: 'Not signed in' })

    try {
        const { id, email, name } = jwt.verify(token, SESSION_SECRET) as SessionUser
        res.locals.user = { id, email, name }
        next()
    } catch {
        return res.status(401).json({ error: 'Session expired' })
    }
}