import { Presentation, SlideLayout, FilePart, InputMode } from "../types";

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
    slideCount: number = 7,
    files: FilePart[] = [],
    inputMode: InputMode = 'topic'
): Promise<Presentation> {
    const apiKey = getApiKey();
    const imageFiles = files.filter(f => f.mimeType.startsWith('image/'));
    const isVisionNeeded = imageFiles.length > 0;
    const modelName = import.meta.env.VITE_GROQ_MODEL || (isVisionNeeded ? "llama-3.2-11b-vision-instant" : "llama-3.3-70b-versatile");

    // Aggregate extracted text from documents
    const documentsText = files
        .filter(f => f.extractedText)
        .map(f => `Content from ${f.mimeType === 'application/pdf' ? 'PDF' : 'Word Document'}:\n${f.extractedText}`)
        .join('\n\n---\n\n');

    let promptText = "";
    if (inputMode === 'topic') {
        promptText = `Transform the provided input into a professional presentation with EXACTLY ${slideCount} slides. 
           Theme style requested: ${theme}
           User Topic: ${text || "Please extract content from the attached files."}`;
    } else if (inputMode === 'file') {
        promptText = `Generate a professional presentation with EXACTLY ${slideCount} slides based PRIMARILY on the content of the attached documents and images.
           Theme style requested: ${theme}
           Additional User Instructions: ${text || "None provided. Focus on the file content."}`;
    } else { // 'content' mode
        promptText = `Analyze the provided content and transform it into a professional presentation. 
           The slide count should be determined by the depth and length of the content provided (aim for completeness over a fixed count).
           Theme style requested: ${theme}
           User Content: ${text || (documentsText ? "Please use the content from the attached documents." : "Please extract content from the attached files.")}`;
    }

    if (documentsText) {
        promptText += `\n\nADDITIONAL CONTEXT FROM UPLOADED DOCUMENTS:\n${documentsText}`;
    }

    promptText += `\n\nRespond ONLY with the JSON object. No markdown, no filler.`;

    const userMessageContent = imageFiles.length > 0
        ? [
            { type: "text", text: promptText },
            ...imageFiles.map(f => ({
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
            You MUST generate EXACTLY the number of slides requested in the user prompt. 
            Each slide has "id" (string), "layout" (TITLE, CONTENT, TWO_COLUMN, QUOTE), and "content" (object).
            "content" MUST include:
            - "title": (string)
            - "subtitle": (string, optional)
            - "points": (string array, optional)
            - "leftColumn": (string array, optional)
            - "rightColumn": (string array, optional)
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
