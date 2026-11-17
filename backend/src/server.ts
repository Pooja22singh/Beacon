import express from 'express';
import { askModel } from './model';
import { mcpClient } from "./mcpClient";
import { toGeminiTools } from './tools';
import { runAgent } from './agent';


const app = express();
const DEMO_USER_ID = 'u1'
const mcpclient = await mcpClient();
const { tools } = await mcpclient.listTools();
const geminiTools = toGeminiTools(tools)

app.use(express.json());

app.get('/health', (_req, res) => {
    res.json({ status: 'ok' })
})

app.post('/chat', async (req, res) => {
    const { message } = req.body
    if (!message) {
        return res.status(400).json({ error: 'message is required' })
    }

    try {
        const reply = await runAgent(mcpclient, geminiTools, DEMO_USER_ID, message)
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