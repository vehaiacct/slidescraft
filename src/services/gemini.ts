/// <reference types="vite/client" />
import { GoogleGenAI, Type } from "@google/genai";
import { Presentation, SlideLayout, FilePart } from "../types";

const getAI = () => {
    const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
    if (!API_KEY) {
        throw new Error("Gemini API Key is missing. Please check your .env.local file.");
    }
    // Note: @google/genai constructor takes an object
    return new GoogleGenAI({ apiKey: API_KEY });
};

export async function generatePresentation(
    text: string,
    theme: string,
    files: FilePart[] = []
): Promise<Presentation> {
    const client = getAI();

    const fileParts = files.map(f => ({
        inlineData: {
            data: f.data,
            mimeType: f.mimeType
        }
    }));

    const prompt = `Transform the provided input into a professional presentation. 
    The input includes text and potentially images or documents (PDFs). 
    Extract the key information and structure it logically into slides. 
    The first slide MUST be a TITLE slide. 
    Use a variety of layouts: TITLE, CONTENT, TWO_COLUMN, QUOTE.
    
    Theme style requested: ${theme}
    User Text: ${text || "Please extract content from the attached files."}`;

    // Note: @google/genai uses models.generateContent
    const modelName = import.meta.env.VITE_GEMINI_MODEL || "gemini-1.5-flash";
    const result = await client.models.generateContent({
        model: modelName,
        contents: [{ role: 'user', parts: [{ text: prompt }, ...fileParts] }],
        config: {
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    title: { type: Type.STRING },
                    slides: {
                        type: Type.ARRAY,
                        items: {
                            type: Type.OBJECT,
                            properties: {
                                id: { type: Type.STRING },
                                layout: {
                                    type: Type.STRING,
                                    enum: Object.values(SlideLayout)
                                },
                                content: {
                                    type: Type.OBJECT,
                                    properties: {
                                        title: { type: Type.STRING },
                                        subtitle: { type: Type.STRING },
                                        points: { type: Type.ARRAY, items: { type: Type.STRING } },
                                        leftColumn: { type: Type.ARRAY, items: { type: Type.STRING } },
                                        rightColumn: { type: Type.ARRAY, items: { type: Type.STRING } },
                                        imageDescription: { type: Type.STRING }
                                    },
                                    required: ["title"]
                                }
                            },
                            required: ["id", "layout", "content"]
                        }
                    }
                },
                required: ["title", "slides"]
            }
        }
    });

    // For @google/genai, we use result.value if JSON is requested, 
    // but we'll add a fallback in case the SDK version differs.
    let presentation: Presentation;
    try {
        presentation = (result as any).value || JSON.parse((result as any).response.text());
    } catch (e) {
        console.error("Error parsing AI response:", e);
        throw new Error("The AI returned an invalid response format. Please try again.");
    }

    presentation.theme = theme as any;
    return presentation;
}
