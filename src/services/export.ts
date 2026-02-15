import pptxgen from "pptxgenjs";
import { Presentation, SlideLayout, ThemePreset } from "../types";

export function exportToPPTX(presentation: Presentation) {
    const pres = new pptxgen();
    pres.title = presentation.title;

    const getThemeColors = (theme: ThemePreset) => {
        if (theme === 'custom' && presentation.customThemeConfig) {
            return {
                bg: presentation.customThemeConfig.primaryColor,
                text: '#ffffff',
                accent: presentation.customThemeConfig.secondaryColor
            };
        }

        switch (theme) {
            case 'corporate':
                return { bg: '#ffffff', text: '#1e293b', accent: '#2563eb' };
            case 'creative':
                return { bg: '#f472b6', text: '#ffffff', accent: '#fb923c' };
            case 'minimal':
                return { bg: '#f8fafc', text: '#0f172a', accent: '#6366f1' };
            case 'midnight':
                return { bg: '#020617', text: '#f1f5f9', accent: '#38bdf8' };
            case 'cyberpunk':
                return { bg: '#050505', text: '#00ffcc', accent: '#ff00ff' };
            case 'school':
                return { bg: '#fff9e6', text: '#1e293b', accent: '#facc15' };
            case 'modern':
            default:
                return { bg: '#1e1b4b', text: '#ffffff', accent: '#6366f1' };
        }
    };

    const colors = getThemeColors(presentation.theme);

    presentation.slides.forEach((slide) => {
        const pptSlide = pres.addSlide();
        pptSlide.background = { fill: colors.bg };

        const { layout, content } = slide;
        const textOptions = { color: colors.text };

        switch (layout) {
            case SlideLayout.TITLE:
                pptSlide.addText(content.title, {
                    x: 1, y: 2, w: 8, h: 1.5,
                    fontSize: 44, bold: true, align: 'center',
                    color: colors.text
                } as any);
                if (content.subtitle) {
                    pptSlide.addText(content.subtitle, {
                        x: 1, y: 3.5, w: 8, h: 1,
                        fontSize: 24, align: 'center',
                        color: colors.text, transparency: 30
                    } as any);
                }
                break;

            case SlideLayout.CONTENT:
                pptSlide.addText(content.title, {
                    x: 0.5, y: 0.5, w: 9, h: 1,
                    fontSize: 32, bold: true,
                    color: colors.text,
                    background: { fill: colors.accent }
                } as any);
                if (content.points) {
                    pptSlide.addText(content.points.join('\n'), {
                        x: 0.5, y: 1.5, w: 9, h: 4,
                        fontSize: 18, bullet: true,
                        color: colors.text
                    } as any);
                }
                break;

            case SlideLayout.TWO_COLUMN:
                pptSlide.addText(content.title, {
                    x: 0.5, y: 0.5, w: 9, h: 1,
                    fontSize: 32, bold: true,
                    color: colors.text
                } as any);
                if (content.leftColumn) {
                    pptSlide.addText(content.leftColumn.join('\n'), {
                        x: 0.5, y: 1.5, w: 4.25, h: 4,
                        fontSize: 16, bullet: true,
                        color: colors.text
                    } as any);
                }
                if (content.rightColumn) {
                    pptSlide.addText(content.rightColumn.join('\n'), {
                        x: 5.25, y: 1.5, w: 4.25, h: 4,
                        fontSize: 16, bullet: true,
                        color: colors.text
                    } as any);
                }
                break;

            case SlideLayout.QUOTE:
                pptSlide.addText(`"${content.title}"`, {
                    x: 1, y: 2, w: 8, h: 2,
                    fontSize: 36, italic: true, align: 'center',
                    color: colors.text
                } as any);
                if (content.subtitle) {
                    pptSlide.addText(`— ${content.subtitle}`, {
                        x: 1, y: 4, w: 8, h: 0.5,
                        fontSize: 20, align: 'right',
                        color: colors.text
                    } as any);
                }
                break;
        }
    });

    pres.writeFile({ fileName: `${presentation.title.replace(/\s+/g, '_')}.pptx` });
}
