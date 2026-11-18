import express from 'express';
import { askModel } from './model';
import { mcpClient } from "./mcpClient";
import { toGeminiTools } from './tools';
import { runAgent } from './agent';
import cookieParser from 'cookie-parser'
import { login, logout, requireUser } from './auth.js'

const app = express();
const mcpclient = await mcpClient();
const { tools } = await mcpclient.listTools();
const geminiTools = toGeminiTools(tools)

app.use(express.json());
app.use(cookieParser())

app.post('/auth/google', login)
app.post('/auth/logout', logout)
app.get('/auth/me', requireUser, (_req, res) => {
    res.json({ user: res.locals.user })
})

app.get('/health', (_req, res) => {
    res.json({ status: 'ok' })
})

app.post('/chat', requireUser, async (req, res) => {
    const { messages } = req.body;
    if (!Array.isArray(messages) || messages.length === 0) {
        return res.status(400).json({ error: 'messages is required' })
    }

    try {
        const reply = await runAgent(mcpclient, geminiTools, res.locals.user.id, messages.slice(-20))
        res.json({ reply })
    } catch (err) {
        console.error(err)
        res.status(500).json({ error: 'Something went wrong' })
    }
})
const PORT = 3000;

app.listen(3000, () => {
    console.log('Server is running on port', PORT)
})