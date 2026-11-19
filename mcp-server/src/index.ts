import { serveStdio } from '@modelcontextprotocol/server/stdio'
import { createServer } from './createServer.js'

serveStdio(createServer)
console.error('beacon MCP server running on stdio')