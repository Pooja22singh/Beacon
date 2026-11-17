import { GoogleGenAI } from "@google/genai";

export const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY })
export const MODEL = 'gemini-3.1-flash-lite';

export const askModel = async (prompt: string): Promise<string> => {
    const response = await ai.models.generateContent({
        model: MODEL,
        contents: prompt
    });
    console.log("res", response.text);
    return response.text ?? "";
}