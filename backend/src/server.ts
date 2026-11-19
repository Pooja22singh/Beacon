import express from 'express'
import rateLimit from 'express-rate-limit'
import * as z from 'zod'
import cookieParser from 'cookie-parser'
import { mcpClient } from './mcpClient.js'
import { toGeminiTools } from './tools.js'
import { runAgent } from './agent.js'
import { login, logout, requireUser } from './auth.js'
import { pool } from './db.js'

const app = express()
app.set('trust proxy', 1)

const mcpclient = await mcpClient()
const { tools } = await mcpclient.listTools()
const geminiTools = toGeminiTools(tools)

app.use(express.json())
app.use(cookieParser())

app.post('/auth/google', login)
app.post('/auth/logout', logout)
app.get('/auth/me', requireUser, (_req, res) => {
    res.json({ user: res.locals.user })
})

app.get('/health', (_req, res) => {
    res.json({ status: 'ok' })
})

app.get('/ready', async (_req, res) => {
    try {
        await pool.query('SELECT 1')
        await mcpclient.ping()
        res.json({ status: 'ready' })
    } catch {
        res.status(503).json({ status: 'not ready' })
    }
})

const chatLimiter = rateLimit({
    windowMs: 60 * 1000,
    limit: 10,
    keyGenerator: (_req, res) => res.locals.user.id,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: 'Too many messages. Please wait a minute.' },
})

const ChatBody = z.object({
    messages: z
        .array(
            z.object({
                role: z.enum(['user', 'assistant']),
                text: z.string().min(1).max(2000),
            })
        )
        .min(1)
        .max(50),
})

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
    return Promise.race([
        promise,
        new Promise<T>((_, reject) =>
            setTimeout(() => reject(new Error('timeout')), ms)
        ),
    ])
}

app.post('/chat', requireUser, chatLimiter, async (req, res) => {
    const parsed = ChatBody.safeParse(req.body)
    if (!parsed.success) {
        return res.status(400).json({ error: 'Invalid request' })
    }

    try {
        const reply = await withTimeout(
            runAgent(
                mcpclient,
                geminiTools,
                res.locals.user.id,
                parsed.data.messages.slice(-20)
            ),
            30_000
        )
        res.json({ reply })
    } catch (err) {
        console.error(err)
        const isTimeout = err instanceof Error && err.message === 'timeout'
        res.status(isTimeout ? 504 : 500).json({ error: 'Something went wrong' })
    }
})

const PORT = 3000

app.listen(PORT, () => {
    console.log('Server is running on port', PORT)
})