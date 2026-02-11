export function getImageUrl(prompt: string, width: number = 1280, height: number = 720): string {
    const cleanPrompt = encodeURIComponent(prompt.trim());
    const seed = Math.floor(Math.random() * 1000000);
    return `https://image.pollinations.ai/prompt/${cleanPrompt}?width=${width}&height=${height}&nologo=true&seed=${seed}`;
}
