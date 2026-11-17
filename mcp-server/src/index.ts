import { McpServer } from '@modelcontextprotocol/server';
import { serveStdio } from '@modelcontextprotocol/server/stdio';
import * as z from 'zod/v4'
import { orders } from './orders';
import { registerGetOrder } from './tools/getOrder';

const createServer = () => {
    const server = new McpServer({ name: 'beacon', version: '1.0.1' });
    registerGetOrder(server);
    return server;
}

serveStdio(createServer);
console.error('beacon MCP server running on stdio')