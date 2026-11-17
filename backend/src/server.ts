import express from 'express';
import { askModel } from './model';

console.log('key loaded:', Boolean(process.env.GEMINI_API_KEY))

const app = express();
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