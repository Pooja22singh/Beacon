import { Client } from '@modelcontextprotocol/client'
import { StdioClientTransport } from '@modelcontextprotocol/client/stdio'

export const mcpClient = async () => {
    const client = new Client({ name: 'beacon-host', version: '1.0.0' })
    const transport = new StdioClientTransport({
        command: "pnpm",
        args: ['--dir', '../mcp-server', 'exec', 'tsx', '--env-file=.env', 'src/index.ts'],
    });
    await client.connect(transport);
    return client;
}