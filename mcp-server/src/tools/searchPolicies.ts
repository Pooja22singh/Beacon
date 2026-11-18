import type { McpServer } from '@modelcontextprotocol/server'
import * as z from 'zod/v4'
import { pool } from '../db.js'
import { embed } from '../embed.js'

export function registerSearchPolicies(server: McpServer) {
    server.registerTool(
        'search_policies',
        {
            description:
                'Search the store policy documents (returns, refunds, shipping, cancellations, warranty) and return the most relevant passages',
            inputSchema: z.object({
                query: z.string().min(3).max(300).describe('What to look for, in plain words'),
            }),
        },
        async ({ query }) => {
            const [vector] = await embed([query], 'RETRIEVAL_QUERY')

            const { rows } = await pool.query(
                `SELECT title, content, 1 - (embedding <=> $1::vector) AS similarity
         FROM policies
         ORDER BY embedding <=> $1::vector
         LIMIT 3`,
                [JSON.stringify(vector)]
            )

            return { content: [{ type: 'text', text: JSON.stringify(rows) }] }
        }
    )
}