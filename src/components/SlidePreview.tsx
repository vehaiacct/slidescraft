import React from 'react';
import { Slide, SlideLayout, ThemePreset, CustomThemeConfig } from '../types';

interface SlidePreviewProps {
    slide: Slide;
    theme: ThemePreset;
    customThemeConfig?: CustomThemeConfig;
    isPreview?: boolean;
}

const SlidePreview: React.FC<SlidePreviewProps> = ({ slide, theme, customThemeConfig, isPreview = false }) => {
    const getThemeStyles = (): React.CSSProperties => {
        if (theme === 'custom' && customThemeConfig) {
            return {
                background: `linear-gradient(135deg, ${customThemeConfig.primaryColor}, ${customThemeConfig.secondaryColor})`,
                color: '#ffffff',
                fontFamily: `"${customThemeConfig.fontFamily}", sans-serif`,
            };
        }

        switch (theme) {
            case 'corporate':
                return { backgroundColor: '#ffffff', color: '#1e293b', borderLeft: isPreview ? '10px solid #2563eb' : '40px solid #2563eb' };
            case 'creative':
                return { background: 'linear-gradient(to bottom right, #f472b6, #fb923c)', color: '#ffffff' };
            case 'minimal':
                return { backgroundColor: '#f8fafc', color: '#0f172a' };
            case 'midnight':
                return { backgroundColor: '#020617', color: '#f1f5f9', borderBottom: isPreview ? '8px solid #38bdf8' : '30px solid #38bdf8' };
            case 'cyberpunk':
                return {
                    backgroundColor: '#050505',
                    color: '#00ffcc',
                    border: '1px solid #ff00ff',
                    fontFamily: '"Space Grotesk", sans-serif',
                    textShadow: '0 0 8px rgba(0, 255, 204, 0.8)'
                };
            case 'modern':
            default:
                return {
                    background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 100%)',
                    color: '#ffffff',
                    boxShadow: 'inset 0 0 100px rgba(0,0,0,0.2)'
                };
        }
    };

    const { layout, content } = slide;

    return (
        <div
            className={`slide-aspect w-full rounded-2xl shadow-2xl relative overflow-hidden transition-all duration-700 ease-out flex flex-col ${isPreview ? 'p-4' : 'p-12 lg:p-20'}`}
            style={{
                aspectRatio: '16/9',
                ...getThemeStyles()
            }}
        >
            <div className="flex-grow flex flex-col justify-center">
                {layout === SlideLayout.TITLE ? (
                    <div className="text-center animate-fade-in">
                        <h1 className={`${isPreview ? 'text-[10px]' : 'text-5xl lg:text-7xl'} font-extrabold mb-6 tracking-tight leading-tight`}>
                            {content.title}
                        </h1>
                        {content.subtitle && (
                            <p className={`${isPreview ? 'text-[6px]' : 'text-xl lg:text-3xl'} opacity-70 font-light`}>
                                {content.subtitle}
                            </p>
                        )}
                    </div>
                ) : layout === SlideLayout.CONTENT ? (
                    <div className="animate-fade-in h-full flex flex-col">
                        <h2 className={`${isPreview ? 'text-[8px]' : 'text-3xl lg:text-5xl'} font-bold mb-10 border-b border-current/10 pb-6`}>
                            {content.title}
                        </h2>
                        <ul className="space-y-4 flex-grow">
                            {content.points?.map((point, i) => (
                                <li key={i} className={`${isPreview ? 'text-[5px]' : 'text-lg lg:text-2xl'} flex items-start gap-4`}>
                                    <span className="mt-2 block w-2 h-2 rounded-full bg-current flex-shrink-0 opacity-50" />
                                    {point}
                                </li>
                            ))}
                        </ul>
                    </div>
                ) : layout === SlideLayout.TWO_COLUMN ? (
                    <div className="animate-fade-in h-full flex flex-col">
                        <h2 className={`${isPreview ? 'text-[8px]' : 'text-3xl lg:text-5xl'} font-bold mb-10`}>
                            {content.title}
                        </h2>
                        <div className="grid grid-cols-2 gap-12 flex-grow">
                            <div className="space-y-4">
                                {content.leftColumn?.map((point, i) => (
                                    <p key={i} className={`${isPreview ? 'text-[4px]' : 'text-sm lg:text-xl'} opacity-80 leading-relaxed`}>{point}</p>
                                ))}
                            </div>
                            <div className="space-y-4">
                                {content.rightColumn?.map((point, i) => (
                                    <p key={i} className={`${isPreview ? 'text-[4px]' : 'text-sm lg:text-xl'} opacity-80 leading-relaxed`}>{point}</p>
                                ))}
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="text-center py-10 opacity-50 italic">
                        {content.title}
                    </div>
                )}
            </div>
        </div>
    );
};

export default SlidePreview;
