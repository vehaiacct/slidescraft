export enum SlideLayout {
    TITLE = 'TITLE',
    CONTENT = 'CONTENT',
    TWO_COLUMN = 'TWO_COLUMN',
    QUOTE = 'QUOTE',
    BIG_IMAGE = 'BIG_IMAGE'
}

export interface SlideContent {
    title: string;
    points?: string[];
    subtitle?: string;
    imageDescription?: string;
    leftColumn?: string[];
    rightColumn?: string[];
    speakerNotes?: string;
    imagePrompt?: string;
}

export interface Slide {
    id: string;
    layout: SlideLayout;
    content: SlideContent;
}

export interface CustomThemeConfig {
    primaryColor: string;
    secondaryColor: string;
    fontFamily: string;
}

export type ThemePreset = 'modern' | 'corporate' | 'creative' | 'minimal' | 'midnight' | 'nature' | 'sunset' | 'cyberpunk' | 'academic' | 'school' | 'custom';

export interface Presentation {
    title: string;
    slides: Slide[];
    theme: ThemePreset;
    customThemeConfig?: CustomThemeConfig;
}

export interface FilePart {
    data: string;
    mimeType: string;
}
