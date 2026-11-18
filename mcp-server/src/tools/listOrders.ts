import type { McpServer } from '@modelcontextprotocol/server'
import * as z from 'zod/v4'
import { pool } from '../db.js'

export function registerListOrders(server: McpServer) {
    server.registerTool(
        'list_orders',
        {
            description: "List the logged-in user's recent orders with their IDs, items and status",
            inputSchema: z.object({
                userId: z.string().describe('ID of the logged-in user'),
            }),
        },
        async ({ userId }) => {
            const { rows } = await pool.query(
                `SELECT id, item, status, eta::text AS eta
         FROM orders
         WHERE user_id = $1
         ORDER BY eta DESC
         LIMIT 10`,
                [userId]
            )

            return { content: [{ type: 'text', text: JSON.stringify(rows) }] }
        }
    )
}