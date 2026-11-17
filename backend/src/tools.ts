import type { Tool } from '@modelcontextprotocol/client'

const HOST_ONLY_ARGS = ['userId']

export function toGeminiTools(tools: Tool[]) {
    const functionDeclarations = tools.map((tool) => {
        const { $schema, ...schema } = tool.inputSchema as Record<string, any>

        const properties = { ...schema.properties }
        for (const key of HOST_ONLY_ARGS) delete properties[key]

        const required = (schema.required ?? []).filter(
            (k: string) => !HOST_ONLY_ARGS.includes(k)
        )

        return {
            name: tool.name,
            description: tool.description,
            parametersJsonSchema: { ...schema, properties, required },
        }
    })

    return [{ functionDeclarations }]
}