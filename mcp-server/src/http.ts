import { createServer as createHttpServer } from 'node:http'
import { timingSafeEqual } from 'node:crypto'
import { createMcpHandler } from '@modelcontextprotocol/server'
import { toNodeHandler } from '@modelcontextprotocol/node'
import { createServer } from './createServer.js'

const token = process.env.MCP_TOKEN
if (!token) throw new Error('MCP_TOKEN is required')
const expected = Buffer.from(token)

const nodeHandler = toNodeHandler(createMcpHandler(createServer))

function isAuthorized(header: string | undefined): boolean {
    if (!header?.startsWith('Bearer ')) return false
    const given = Buffer.from(header.slice(7))
    return given.length === expected.length && timingSafeEqual(given, expected)
}

const PORT = Number(process.env.PORT ?? 4000)

createHttpServer((req, res) => {
    const path = (req.url ?? '').split('?')[0]

    if (path === '/health') {
        res.writeHead(200, { 'Content-Type': 'application/json' })
        res.end('{"status":"ok"}')
        return
    }
    if (path !== '/mcp') {
        res.writeHead(404)
        res.end()
        return
    }
    if (!isAuthorized(req.headers.authorization)) {
        res.writeHead(401, { 'WWW-Authenticate': 'Bearer' })
        res.end()
        return
    }
    void nodeHandler(req, res)
}).listen(PORT, () => {
    console.error('beacon MCP server (http) on port', PORT)
})