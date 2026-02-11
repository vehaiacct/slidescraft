import { Presentation, SlideLayout, FilePart } from "../types";

const XAI_API_URL = "https://api.x.ai/v1/chat/completions";

const getApiKey = () => {
    const API_KEY = import.meta.env.VITE_XAI_API_KEY;
    if (!API_KEY) {
        throw new Error("xAI API Key is missing. Please check your .env.local file and add VITE_XAI_API_KEY.");
    }
    return API_KEY;
};

export async function generatePresentation(
    text: string,
    theme: string,
    files: FilePart[] = []
): Promise<Presentation> {
    const apiKey = getApiKey();
    const modelName = import.meta.env.VITE_XAI_MODEL || "grok-2-vision-1212";

    const messages: any[] = [
        {
            role: "system",
            content: "You are a professional presentation designer. You always respond in valid JSON format matching the requested schema."
        },
        {
            role: "user",
            content: [
                {
                    type: "text",
                    text: `Transform the provided input into a professional presentation. 
                    The input includes text and potentially images. 
                    Extract the key information and structure it logically into slides. 
                    The first slide MUST be a TITLE slide. 
                    Use a variety of layouts: TITLE, CONTENT, TWO_COLUMN, QUOTE.
                    
                    Theme style requested: ${theme}
                    User Text: ${text || "Please extract content from the attached files."}
                    
                    Respond ONLY with a JSON object that has:
                    {
                        "title": "string",
                        "slides": [
                            {
                                "id": "string",
                                "layout": "TITLE" | "CONTENT" | "TWO_COLUMN" | "QUOTE",
                                "content": {
                                    "title": "string",
                                    "subtitle": "string (optional)",
                                    "points": ["string"] (optional),
                                    "leftColumn": ["string"] (optional),
                                    "rightColumn": ["string"] (optional),
                                    "imageDescription": "string (optional)"
                                }
                            }
                        ]
                    }`
                },
                ...files.map(f => ({
                    type: "image_url",
                    image_url: {
                        url: `data:${f.mimeType};base64,${f.data}`
                    }
                }))
            ]
        }
    ];

    const response = await fetch(XAI_API_URL, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${apiKey}`
        },
        body: JSON.stringify({
            model: modelName,
            messages: messages,
            response_format: { type: "json_object" },
            temperature: 0.7
        })
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`xAI API Error: ${response.status} ${errorData.error?.message || response.statusText}`);
    }

    const result = await response.json();
    let presentation: Presentation;

    try {
        const content = result.choices[0].message.content;
        presentation = JSON.parse(content);
    } catch (e) {
        console.error("Error parsing xAI response:", e);
        throw new Error("The AI returned an invalid response format. Please try again.");
    }

    presentation.theme = theme as any;
    return presentation;
}
