import { readdir, readFile } from 'node:fs/promises'
import path from 'node:path'
import { pool } from './db.js'
import { embed } from './embed.js'

const POLICY_DIR = process.env.POLICY_DIR ?? 'policies'

type Chunk = { title: string; content: string }

async function loadPolicies(): Promise<Chunk[]> {
    const files = (await readdir(POLICY_DIR)).filter((f) => f.endsWith('.md'))
    const chunks: Chunk[] = []

    for (const file of files) {
        const raw = await readFile(path.join(POLICY_DIR, file), 'utf8')
        const lines = raw.split(/\r?\n/)
        const title = lines[0].replace(/^#\s*/, '').trim()
        const body = lines.slice(1).join('\n')

        for (const para of body.split(/\n\s*\n/)) {
            const content = para.trim()
            if (content) chunks.push({ title, content })
        }
    }
    return chunks
}

const chunks = await loadPolicies()
if (chunks.length === 0) {
    throw new Error(`No policy chunks found in ${POLICY_DIR}`)
}
const vectors = await embed(
    chunks.map((c) => `${c.title}\n${c.content}`),
    'RETRIEVAL_DOCUMENT'
)

await pool.query('TRUNCATE policies RESTART IDENTITY')
for (let i = 0; i < chunks.length; i++) {
    await pool.query(
        'INSERT INTO policies (title, content, embedding) VALUES ($1, $2, $3::vector)',
        [chunks[i].title, chunks[i].content, JSON.stringify(vectors[i])]
    )
}

console.log(`Seeded ${chunks.length} chunks from ${POLICY_DIR}`)
await pool.end()