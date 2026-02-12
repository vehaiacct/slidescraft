import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    FileText,
    Upload,
    Palette,
    Sparkles,
    X,
    File,
    ChevronRight,
    Monitor,
    Layout,
    Check
} from 'lucide-react';
import { ThemePreset, InputMode } from '../types';
import { useUser } from '@clerk/clerk-react';

interface SidebarProps {
    inputText: string;
    setInputText: (text: string) => void;
    selectedFiles: any[];
    handleFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    removeFile: (id: string) => void;
    theme: ThemePreset;
    setTheme: (theme: ThemePreset) => void;
    onGenerate: () => void;
    isLoading: boolean;
    fileInputRef: React.RefObject<HTMLInputElement | null>;
    isOpen?: boolean;
    onClose?: () => void;
    slideCount: number;
    setSlideCount: (count: number) => void;
    inputMode: InputMode;
    setInputMode: (mode: InputMode) => void;
}

const Sidebar: React.FC<SidebarProps> = ({
    inputText, setInputText,
    selectedFiles, handleFileChange, removeFile,
    theme, setTheme, onGenerate, isLoading,
    fileInputRef, isOpen, onClose,
    slideCount, setSlideCount,
    inputMode, setInputMode
}) => {
    const { user } = useUser();
    const themePresets: ThemePreset[] = [
        'modern', 'corporate', 'creative', 'minimal',
        'midnight', 'cyberpunk', 'school', 'custom'
    ];

    const sidebarVariants = {
        open: { x: 0, opacity: 1, transition: { type: 'spring' as const, damping: 25, stiffness: 200 } },
        closed: { x: '-100%', opacity: 0, transition: { type: 'spring' as const, damping: 25, stiffness: 200 } }
    };

    const containerVariants = {
        animate: { transition: { staggerChildren: 0.08, delayChildren: 0.1 } }
    };

    const itemVariants = {
        initial: { opacity: 0, y: 15, filter: 'blur(4px)' } as any,
        animate: {
            opacity: 1,
            y: 0,
            filter: 'blur(0px)',
            transition: { duration: 0.4, ease: "easeOut" }
        } as any
    };

    return (
        <motion.aside
            initial={window.innerWidth < 1024 ? "closed" : "open"}
            animate="open"
            exit="closed"
            variants={sidebarVariants}
            className="fixed lg:sticky top-0 left-0 h-screen glass z-50 p-6 md:p-8 flex flex-col overflow-y-auto no-scrollbar w-[85vw] sm:w-[380px] lg:w-[420px] transition-all bg-slate-950/80 border-r border-white/5"
        >
            <div className="flex items-center justify-between mb-10 md:mb-12">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 md:w-12 md:h-12 bg-indigo-600 rounded-[1.25rem] flex-center shadow-lg shadow-indigo-500/30">
                        <Layout className="text-white" size={20} />
                    </div>
                    <div>
                        <h1 className="text-xl md:text-2xl font-black tracking-tighter gradient-text leading-none">SlideCraft<span className="text-indigo-400">AI</span></h1>
                        <p className="text-[8px] md:text-[10px] text-indigo-400 font-bold tracking-[0.2em] uppercase">Premium Deck Engine</p>
                    </div>
                </div>

                <motion.button
                    whileTap={{ scale: 0.9 }}
                    onClick={onClose}
                    className="lg:hidden p-3 hover:bg-white/5 rounded-2xl text-slate-400"
                >
                    <X size={24} />
                </motion.button>
            </div>

            <motion.div variants={containerVariants} initial="initial" animate="animate" className="flex-grow space-y-8 md:space-y-10">
                <motion.section variants={itemVariants} className="space-y-4">
                    <div className="flex items-center justify-between px-1">
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] flex items-center gap-2">
                            <FileText size={12} className="text-indigo-500" /> Content Logic
                        </label>
                        <div className="flex bg-slate-900/50 p-1 rounded-xl border border-white/5">
                            {(['topic', 'content'] as const).map((mode) => (
                                <button
                                    key={mode}
                                    onClick={() => setInputMode(mode)}
                                    className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${inputMode === mode
                                        ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20'
                                        : 'text-slate-500 hover:text-slate-300'
                                        }`}
                                >
                                    {mode}
                                </button>
                            ))}
                        </div>
                    </div>
                    <div className="relative group">
                        <textarea
                            className="w-full h-36 md:h-44 bg-slate-900/30 border border-white/5 rounded-2xl p-5 text-sm md:text-base text-slate-100 placeholder:text-slate-600 focus:border-indigo-500/50 focus:bg-slate-900/50 transition-all resize-none shadow-inner"
                            placeholder={inputMode === 'topic' ? "Enter your presentation topic..." : "Paste your detailed content/notes here..."}
                            value={inputText}
                            onChange={(e) => setInputText(e.target.value)}
                        />
                        <div className="absolute right-4 bottom-4 opacity-30 group-focus-within:opacity-100 transition-opacity">
                            <Sparkles size={16} className="text-indigo-400" />
                        </div>
                    </div>
                </motion.section>

                <AnimatePresence mode="wait">
                    {inputMode === 'topic' && (
                        <motion.section
                            key="slide-count"
                            initial={{ opacity: 0, height: 0, marginTop: 0, filter: 'blur(4px)' }}
                            animate={{ opacity: 1, height: 'auto', marginTop: 32, filter: 'blur(0px)' }}
                            exit={{ opacity: 0, height: 0, marginTop: 0, filter: 'blur(4px)' }}
                            transition={{ duration: 0.4, ease: "easeOut" }}
                            className="space-y-4 overflow-hidden"
                        >
                            <label className="px-1 text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] flex items-center gap-2">
                                <Monitor size={12} className="text-indigo-500" /> Deck Magnitude
                            </label>
                            <div className="flex items-center gap-4 bg-slate-900/30 border border-white/5 rounded-2xl p-4">
                                <motion.button
                                    whileTap={{ scale: 0.9 }}
                                    onClick={() => setSlideCount(Math.max(1, slideCount - 1))}
                                    className="w-10 h-10 bg-white/5 hover:bg-white/10 rounded-xl flex-center text-slate-400 hover:text-white transition-colors"
                                >
                                    -
                                </motion.button>
                                <div className="flex-grow text-center">
                                    <span className="text-2xl font-black text-white">{slideCount}</span>
                                    <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest ml-2">Slides</span>
                                </div>
                                <motion.button
                                    whileTap={{ scale: 0.9 }}
                                    onClick={() => setSlideCount(Math.min(20, slideCount + 1))}
                                    className="w-10 h-10 bg-white/5 hover:bg-white/10 rounded-xl flex-center text-slate-400 hover:text-white transition-colors"
                                >
                                    +
                                </motion.button>
                            </div>
                        </motion.section>
                    )}
                </AnimatePresence>

                <motion.section variants={itemVariants} className="space-y-4">
                    <label className="px-1 text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] flex items-center gap-2">
                        <Upload size={12} className="text-indigo-500" /> Source Files
                    </label>
                    <div
                        onClick={() => fileInputRef.current?.click()}
                        className="group border border-dashed border-white/10 rounded-2xl p-6 md:p-8 flex-center flex-col cursor-pointer hover:bg-indigo-500/5 hover:border-indigo-500/30 transition-all bg-black/20"
                    >
                        <div className="w-10 h-10 bg-slate-800 rounded-full flex-center mb-3 group-hover:scale-110 transition-transform">
                            <Upload size={18} className="text-slate-400" />
                        </div>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Upload Assets</p>
                        <p className="text-[10px] text-slate-600 mt-1">PDF, DOCX, or Images</p>
                        <input
                            type="file"
                            ref={fileInputRef}
                            className="hidden"
                            multiple
                            onChange={handleFileChange}
                            accept=".pdf,.docx,image/*,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                        />
                    </div>

                    <div className="space-y-2">
                        {selectedFiles.map((file) => (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                key={file.id}
                                className="flex items-center justify-between p-3 bg-white/5 border border-white/5 rounded-xl group"
                            >
                                <div className="flex items-center gap-3">
                                    <File size={14} className="text-indigo-400" />
                                    <span className="text-xs font-medium truncate max-w-[150px]">{file.name}</span>
                                </div>
                                <button onClick={() => removeFile(file.id)} className="p-1 hover:bg-white/10 rounded-md text-slate-500 hover:text-red-400 transition-colors">
                                    <X size={14} />
                                </button>
                            </motion.div>
                        ))}
                    </div>
                </motion.section>

                <motion.section variants={itemVariants} className="space-y-4">
                    <label className="px-1 text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] flex items-center gap-2">
                        <Palette size={12} className="text-indigo-500" /> Visual Identity
                    </label>
                    <div className="grid grid-cols-2 gap-2 md:gap-3">
                        {themePresets.map((t) => (
                            <motion.button
                                key={t}
                                whileHover={{ scale: 1.05, translateY: -2, boxShadow: '0 8px 15px -8px rgba(99, 102, 241, 0.4)' }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => setTheme(t)}
                                className={`relative p-3 md:p-4 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all duration-200 truncate ${theme === t
                                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30 border-transparent'
                                    : 'bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white border border-white/5'
                                    }`}
                            >
                                {t}
                                {theme === t && (
                                    <div className="absolute top-1 right-1">
                                        <Check size={8} className="text-white" />
                                    </div>
                                )}
                            </motion.button>
                        ))}
                    </div>
                </motion.section>
            </motion.div>

            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="mt-10"
            >
                <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={onGenerate}
                    disabled={isLoading}
                    className="w-full py-4 md:py-5 bg-indigo-600 rounded-2xl md:rounded-[1.25rem] font-black text-sm tracking-widest uppercase flex-center gap-3 hover:bg-indigo-500 transition-all shadow-xl shadow-indigo-600/30 disabled:opacity-50"
                >
                    {isLoading ? (
                        <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                    ) : (
                        <>
                            <span>Project Launch</span>
                            <ChevronRight size={18} />
                        </>
                    )}
                </motion.button>
            </motion.div>

            {user && (
                <div className="mt-auto pt-8 border-t border-white/5 flex items-center gap-4">
                    <div className="relative">
                        <img src={user.imageUrl} className="w-10 h-10 md:w-11 md:h-11 rounded-1.25rem md:rounded-xl border border-white/10" alt="Avatar" />
                        <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-slate-950 rounded-full" />
                    </div>
                    <div>
                        <p className="text-xs md:text-sm font-black white-space-nowrap">{user.fullName || user.username}</p>
                        <p className="text-[10px] text-indigo-400 font-bold uppercase tracking-widest">Premium Active</p>
                    </div>
                </div>
            )}
        </motion.aside>
    );
};

export default Sidebar;
