import { Client, StreamableHTTPClientTransport } from '@modelcontextprotocol/client'

const requireEnv = (name: string): string => {
    const value = process.env[name]
    if (!value) throw new Error(`${name} is required`)
    return value
}

export const mcpClient = async () => {
    const client = new Client({ name: 'beacon-host', version: '1.0.0' })
    const token = requireEnv('MCP_TOKEN')
    const transport = new StreamableHTTPClientTransport(new URL(requireEnv('MCP_URL')), {
        authProvider: { token: async () => token },
    })
    await client.connect(transport)
    return client
}
