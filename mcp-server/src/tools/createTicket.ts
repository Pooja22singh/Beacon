import type { McpServer } from '@modelcontextprotocol/server'
import * as z from 'zod/v4'
import { pool } from '../db.js'

export function registerCreateTicket(server: McpServer) {
    server.registerTool(
        'create_ticket',
        {
            description:
                'Create a support ticket for a problem the other tools cannot solve. Use only after the user has agreed to open a ticket.',
            inputSchema: z.object({
                subject: z.string().min(5).max(100).describe('Short summary of the problem'),
                details: z
                    .string()
                    .min(10)
                    .max(1000)
                    .describe('Full description of the problem, including any order ID'),
                userId: z.string().describe('ID of the logged-in user'),
            }),
        },
        async ({ subject, details, userId }) => {
            const { rows } = await pool.query(
                `INSERT INTO tickets (user_id, subject, details)
         VALUES ($1, $2, $3)
         RETURNING id, created_at::text AS created_at`,
                [userId, subject, details]
            )

            return {
                content: [
                    {
                        type: 'text',
                        text: JSON.stringify({ ticketId: rows[0].id, subject, createdAt: rows[0].created_at }),
                    },
                ],
            }
        }
    )
}