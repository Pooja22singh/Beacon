import { Client, StreamableHTTPClientTransport } from '@modelcontextprotocol/client'
import { requireEnv } from './env.js'

export const mcpClient = async () => {
    const client = new Client({ name: 'beacon-host', version: '1.0.0' })
    const token = requireEnv('MCP_TOKEN')
    const transport = new StreamableHTTPClientTransport(new URL(requireEnv('MCP_URL')), {
        authProvider: { token: async () => token },
    })
    await client.connect(transport)
    return client
}
