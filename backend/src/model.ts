import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
});

export const askModel = async (prompt: string): Promise<string> => {
    console.log("message", prompt);
    const response = await ai.models.generateContent({
        model: 'gemini-3.1-flash-lite',
        contents: prompt
    });
    console.log("res", response.text);
    return response.text ?? "";
}