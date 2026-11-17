import express from 'express';
import { askModel } from './model';
import { mcpClient } from "./mcpClient";

const app = express();
const mcpclient = await mcpClient();
const { tools } = await mcpclient.listTools();

console.log("mcptools", tools);
app.use(express.json());

app.get('/health', (_req, res) => {
    res.json({ status: 'ok' })
})

app.post('/chat', async (req, res) => {
    const { message } = req.body;
    const reply = await askModel(message);
    console.log("reply", reply);
    res.json({ reply });
})

const PORT = 3000;

app.listen(3000, () => {
    console.log('Server is running on port', PORT)
})