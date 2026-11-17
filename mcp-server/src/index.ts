import { McpServer } from '@modelcontextprotocol/server';
import { serveStdio } from '@modelcontextprotocol/server/stdio';
import * as z from 'zod/v4'

const server = new McpServer({ name: 'beacon', version: '1.0.1' });
serveStdio(() => server);
