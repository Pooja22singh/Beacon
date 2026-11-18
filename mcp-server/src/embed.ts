import { GoogleGenAI } from '@google/genai'

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY })
const EMBEDDING_MODEL = process.env.EMBEDDING_MODEL ?? 'gemini-embedding-001'

export async function embed(
    texts: string[],
    taskType: 'RETRIEVAL_DOCUMENT' | 'RETRIEVAL_QUERY'
) {
    const response = await ai.models.embedContent({
        model: EMBEDDING_MODEL,
        contents: texts,
        config: { taskType, outputDimensionality: 768 },
    })
    return response.embeddings!.map((e) => e.values!)
}