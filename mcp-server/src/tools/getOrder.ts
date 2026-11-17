import type { McpServer } from "@modelcontextprotocol/server"
import * as z from 'zod/v4';
import { orders } from "../orders";

export const registerGetOrder = (server: McpServer) => {
    server.registerTool('get_order', {
        description: "Look up one order by its ID and return its statsus and delivery date",
        inputSchema: z.object({
            orderId: z.string().describe('Order id, for example A-0001'),
            userId: z.string().describe('Id of the logged in user')
        })
    },
        async ({ orderId, userId }) => {
            const order = orders.find((order) => order.id === orderId && order.userId === userId);
            if (!order) {
                return { content: [{ type: 'text', text: 'Order not found' }] }
            }
            const { id, item, status, eta } = order;
            return {
                content: [{
                    type: "text",
                    text: JSON.stringify({ id, item, status, eta })
                }]
            }
        }
    )
}
