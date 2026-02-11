import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Slide, SlideLayout, ThemePreset, CustomThemeConfig, SlideContent } from '../types';
import { getImageUrl } from '../services/image';

interface SlidePreviewProps {
    slide: Slide;
    theme: ThemePreset;
    customThemeConfig?: CustomThemeConfig;
    isPreview?: boolean;
    onUpdate?: (updatedContent: Partial<SlideContent>) => void;
}

const SlidePreview: React.FC<SlidePreviewProps> = ({ slide, theme, customThemeConfig, isPreview = false, onUpdate }) => {
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
            case 'school':
                return {
                    background: '#fff9e6',
                    color: '#1e293b',
                    borderRadius: isPreview ? '12px' : '40px',
                    border: isPreview ? '3px solid #facc15' : '12px solid #facc15',
                    fontFamily: '"Quicksand", "Comic Neue", cursive',
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
    const [bgImage, setBgImage] = useState<string | null>(null);

    useEffect(() => {
        if (content.imagePrompt && !isPreview) {
            setBgImage(getImageUrl(content.imagePrompt));
        }
    }, [content.imagePrompt, isPreview]);

    const themeStyles = getThemeStyles();

    const slideVariants = {
        initial: { opacity: 0, scale: 0.98, x: 20 },
        animate: { opacity: 1, scale: 1, x: 0 },
        exit: { opacity: 0, scale: 1.02, x: -20 }
    };

    const staggerContainer = {
        animate: {
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    const itemFadeIn = {
        initial: { opacity: 0, y: 10 },
        animate: { opacity: 1, y: 0 }
    };

    return (
        <div
            className={`slide-aspect w-full rounded-2xl md:rounded-[2.5rem] shadow-2xl relative overflow-hidden transition-all duration-700 ease-out flex flex-col ${isPreview ? 'p-4' : 'p-8 md:p-16 lg:p-20'}`}
            style={{
                aspectRatio: '16/9',
                ...themeStyles,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
            }}
        >
            {/* Background Image Layer */}
            <AnimatePresence mode="wait">
                {bgImage && !isPreview && (
                    <motion.div
                        key={bgImage}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 1 }}
                        className="absolute inset-0 z-0"
                        style={{
                            backgroundImage: `url(${bgImage})`,
                            backgroundSize: 'cover',
                            backgroundPosition: 'center',
                        }}
                    >
                        {/* Glassmorphic Overlay for Readability */}
                        <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" />
                    </motion.div>
                )}
            </AnimatePresence>

            <AnimatePresence mode="wait">
                <motion.div
                    key={slide.id}
                    variants={slideVariants}
                    initial="initial"
                    animate="animate"
                    exit="exit"
                    transition={{ duration: 0.5, ease: "easeOut" }}
                    className={`flex-grow flex flex-col justify-center relative z-10 ${bgImage && !isPreview ? 'text-white drop-shadow-lg' : ''}`}
                >
                    {layout === SlideLayout.TITLE ? (
                        <div className="text-center">
                            <motion.h1
                                variants={itemFadeIn}
                                contentEditable={!isPreview}
                                suppressContentEditableWarning
                                onBlur={(e) => onUpdate?.({ title: e.currentTarget.textContent || '' })}
                                className={`${isPreview ? 'text-[10px]' : 'text-3xl md:text-5xl lg:text-7xl'} font-extrabold mb-4 lg:mb-6 tracking-tight leading-tight outline-none focus:ring-2 focus:ring-white/20 rounded-lg px-2`}
                            >
                                {content.title}
                            </motion.h1>
                            {content.subtitle && (
                                <motion.p
                                    variants={itemFadeIn}
                                    contentEditable={!isPreview}
                                    suppressContentEditableWarning
                                    onBlur={(e) => onUpdate?.({ subtitle: e.currentTarget.textContent || '' })}
                                    className={`${isPreview ? 'text-[6px]' : 'text-xs md:text-xl lg:text-3xl'} opacity-70 font-light outline-none focus:ring-2 focus:ring-white/20 rounded-lg px-2`}
                                >
                                    {content.subtitle}
                                </motion.p>
                            )}
                        </div>
                    ) : layout === SlideLayout.CONTENT ? (
                        <div className="h-full flex flex-col">
                            <motion.h2
                                variants={itemFadeIn}
                                contentEditable={!isPreview}
                                suppressContentEditableWarning
                                onBlur={(e) => onUpdate?.({ title: e.currentTarget.textContent || '' })}
                                className={`${isPreview ? 'text-[8px]' : 'text-lg md:text-3xl lg:text-5xl'} font-bold mb-4 md:mb-10 border-b border-current/10 pb-4 lg:pb-6 outline-none focus:ring-2 focus:ring-white/20 rounded-lg px-2`}
                            >
                                {content.title}
                            </motion.h2>
                            <motion.ul
                                variants={staggerContainer}
                                initial="initial"
                                animate="animate"
                                className="space-y-1 md:space-y-4 flex-grow overflow-hidden"
                            >
                                {content.points?.map((point, i) => (
                                    <motion.li
                                        key={i}
                                        variants={itemFadeIn}
                                        className={`${isPreview ? 'text-[5px]' : 'text-[10px] md:text-lg lg:text-2xl'} flex items-start gap-2 lg:gap-4`}
                                    >
                                        <span className="mt-1.5 lg:mt-2 block w-1 h-1 lg:w-2 lg:h-2 rounded-full bg-current flex-shrink-0 opacity-50" />
                                        <div
                                            contentEditable={!isPreview}
                                            suppressContentEditableWarning
                                            onBlur={(e) => {
                                                const newPoints = [...(content.points || [])];
                                                newPoints[i] = e.currentTarget.textContent || '';
                                                onUpdate?.({ points: newPoints });
                                            }}
                                            className="outline-none focus:ring-2 focus:ring-white/20 rounded-lg px-2 w-full"
                                        >
                                            {point}
                                        </div>
                                    </motion.li>
                                ))}
                            </motion.ul>
                        </div>
                    ) : layout === SlideLayout.TWO_COLUMN ? (
                        <div className="h-full flex flex-col">
                            <motion.h2
                                variants={itemFadeIn}
                                className={`${isPreview ? 'text-[8px]' : 'text-xl md:text-3xl lg:text-5xl'} font-bold mb-4 md:mb-10`}
                            >
                                {content.title}
                            </motion.h2>
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:grid-gap-12 flex-grow overflow-hidden">
                                <motion.div variants={staggerContainer} initial="initial" animate="animate" className="space-y-1 md:space-y-4">
                                    {content.leftColumn?.map((point, i) => (
                                        <motion.p key={i} variants={itemFadeIn} className={`${isPreview ? 'text-[4px]' : 'text-[8px] md:text-sm lg:text-xl'} opacity-80 leading-relaxed`}>{point}</motion.p>
                                    ))}
                                </motion.div>
                                <motion.div variants={staggerContainer} initial="initial" animate="animate" className="space-y-1 md:space-y-4">
                                    {content.rightColumn?.map((point, i) => (
                                        <motion.p key={i} variants={itemFadeIn} className={`${isPreview ? 'text-[4px]' : 'text-[8px] md:text-sm lg:text-xl'} opacity-80 leading-relaxed`}>{point}</motion.p>
                                    ))}
                                </motion.div>
                            </div>
                        </div>
                    ) : (
                        <div className="text-center py-10 opacity-50 italic">
                            {content.title}
                        </div>
                    )}
                </motion.div>
            </AnimatePresence>
        </div>
    );
};

export default SlidePreview;
