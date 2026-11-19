import { McpServer } from '@modelcontextprotocol/server'
import { registerGetOrder } from './tools/getOrder.js'
import { registerSearchPolicies } from './tools/searchPolicies.js'
import { registerCreateTicket } from './tools/createTicket.js'
import { registerListOrders } from './tools/listOrders.js'

export const createServer = () => {
    const server = new McpServer({ name: 'beacon', version: '1.0.1' })
    registerGetOrder(server)
    registerSearchPolicies(server)
    registerCreateTicket(server)
    registerListOrders(server)
    return server
}