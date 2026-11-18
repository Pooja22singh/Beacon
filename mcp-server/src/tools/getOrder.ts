import type { McpServer } from "@modelcontextprotocol/server"
import * as z from 'zod/v4';
import { pool } from '../db.js'

export const registerGetOrder = (server: McpServer) => {
    server.registerTool('get_order', {
        description: "Look up one order by its ID and return its statsus and delivery date",
        inputSchema: z.object({
            orderId: z.string().describe('Order id, for example A-0001'),
            userId: z.string().describe('Id of the logged in user')
        })
    },
        async ({ orderId, userId }) => {
            const { rows } = await pool.query(
                'SELECT id, item, status, eta::text AS eta FROM orders WHERE id = $1 AND user_id = $2',
                [orderId, userId]
            )
            console.error('get_order', { orderId, userId, rowCount: rows.length })
            if (rows.length === 0) {
                return { content: [{ type: 'text', text: 'Order not found' }] }
            }

            return { content: [{ type: 'text', text: JSON.stringify(rows[0]) }] }
        }
    )
}
