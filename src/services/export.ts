import pptxgen from "pptxgenjs";
import { Presentation, SlideLayout } from "../types";

export function exportToPPTX(presentation: Presentation) {
    const pres = new pptxgen();
    pres.title = presentation.title;

    presentation.slides.forEach((slide) => {
        const pptSlide = pres.addSlide();
        const { layout, content } = slide;

        switch (layout) {
            case SlideLayout.TITLE:
                pptSlide.addText(content.title, { x: 1, y: 2, w: 8, h: 1.5, fontSize: 44, bold: true, align: 'center' });
                if (content.subtitle) pptSlide.addText(content.subtitle, { x: 1, y: 3.5, w: 8, h: 1, fontSize: 24, align: 'center' });
                break;

            case SlideLayout.CONTENT:
                pptSlide.addText(content.title, { x: 0.5, y: 0.5, w: 9, h: 1, fontSize: 32, bold: true });
                if (content.points) pptSlide.addText(content.points.join('\n'), { x: 0.5, y: 1.5, w: 9, h: 4, fontSize: 18, bullet: true });
                break;

            case SlideLayout.TWO_COLUMN:
                pptSlide.addText(content.title, { x: 0.5, y: 0.5, w: 9, h: 1, fontSize: 32, bold: true });
                if (content.leftColumn) pptSlide.addText(content.leftColumn.join('\n'), { x: 0.5, y: 1.5, w: 4.25, h: 4, fontSize: 16, bullet: true });
                if (content.rightColumn) pptSlide.addText(content.rightColumn.join('\n'), { x: 5.25, y: 1.5, w: 4.25, h: 4, fontSize: 16, bullet: true });
                break;

            case SlideLayout.QUOTE:
                pptSlide.addText(`"${content.title}"`, { x: 1, y: 2, w: 8, h: 2, fontSize: 36, italic: true, align: 'center' });
                if (content.subtitle) pptSlide.addText(`— ${content.subtitle}`, { x: 1, y: 4, w: 8, h: 0.5, fontSize: 20, align: 'right' });
                break;
        }
    });

    pres.writeFile({ fileName: `${presentation.title.replace(/\s+/g, '_')}.pptx` });
}
