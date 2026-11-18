import { McpServer } from '@modelcontextprotocol/server';
import { serveStdio } from '@modelcontextprotocol/server/stdio';
import { registerGetOrder } from './tools/getOrder';
import { registerSearchPolicies } from './tools/searchPolicies.js'
import { registerCreateTicket } from './tools/createTicket.js'


const createServer = () => {
    const server = new McpServer({ name: 'beacon', version: '1.0.1' });
    registerGetOrder(server);
    registerSearchPolicies(server);
    registerCreateTicket(server)
    return server;
}

serveStdio(createServer);
console.error('beacon MCP server running on stdio')