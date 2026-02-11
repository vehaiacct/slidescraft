import { Presentation, SlideLayout, FilePart } from "../types";

const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";

const getApiKey = () => {
    const API_KEY = import.meta.env.VITE_GROQ_API_KEY;
    if (!API_KEY) {
        throw new Error("Groq API Key is missing. Please check your .env.local file and add VITE_GROQ_API_KEY.");
    }
    return API_KEY;
};

export async function generatePresentation(
    text: string,
    theme: string,
    files: FilePart[] = []
): Promise<Presentation> {
    const apiKey = getApiKey();
    const isVisionNeeded = files.length > 0;
    const modelName = import.meta.env.VITE_GROQ_MODEL || (isVisionNeeded ? "llama-3.2-11b-vision-preview" : "llama-3.3-70b-versatile");

    const promptText = `Transform the provided input into a professional presentation. 
                    Theme style requested: ${theme}
                    User Text: ${text || "Please extract content from the attached files."}
                    
                    Respond ONLY with the JSON object. No markdown, no filler.`;

    const userMessageContent = isVisionNeeded
        ? [
            { type: "text", text: promptText },
            ...files.map(f => ({
                type: "image_url",
                image_url: {
                    url: `data:${f.mimeType};base64,${f.data}`
                }
            }))
        ]
        : promptText;

    const messages: any[] = [
        {
            role: "system",
            content: `You are a professional presentation designer and content creator. 
            You must respond in valid JSON format.
            
            Theme-specific instructions:
            - If theme is 'school': Use simple, engaging, and child-friendly language suitable for elementary school students (ages 6-11). Focus on being educational, fun, and clear.
            - If theme is 'corporate': Use professional, punchy business language.
            - If theme is 'minimal': Use concise, high-impact text.
            
            Structure the response as a Presentation object with "title" (string) and "slides" (array).
            Each slide has "id" (string), "layout" (TITLE, CONTENT, TWO_COLUMN, QUOTE), and "content" (object).
            "content" MUST include:
            - "title": (string)
            - "subtitle": (string, optional)
            - "points": (string array, optional)
            - "leftColumn": (string array, optional)
            - "rightColumn": (string array, optional)
            - "speakerNotes": (string) A detailed script for the presenter (3-4 sentences).
            - "imagePrompt": (string) A highly descriptive prompt for a cinematic background image. Be specific about style, lighting, and elements (e.g. "aerial view of a lush rainforest at sunrise, hyper-realistic, 8k, soft lighting"). Avoid text in images.`
        },
        {
            role: "user",
            content: userMessageContent
        }
    ];

    const response = await fetch(GROQ_API_URL, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${apiKey}`
        },
        body: JSON.stringify({
            model: modelName,
            messages: messages,
            response_format: { type: "json_object" },
            temperature: 0.6
        })
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`Groq API Error: ${response.status} ${errorData.error?.message || response.statusText}`);
    }

    const result = await response.json();
    let presentation: Presentation;

    try {
        const content = result.choices[0].message.content;
        presentation = JSON.parse(content);
    } catch (e) {
        console.error("Error parsing Groq response:", e);
        throw new Error("The AI returned an invalid response format. Please try again.");
    }

    presentation.theme = theme as any;
    return presentation;
}
