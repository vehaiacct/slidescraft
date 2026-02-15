import React from 'react';
import { motion, AnimatePresence, Variants } from 'framer-motion';
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
    Check,
    Database,
    Send
} from 'lucide-react';
import { ThemePreset, InputMode } from '../types';
import { useUser } from '@clerk/clerk-react';
import { UserProfile } from '../services/supabase';

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
    userProfile: UserProfile | null;
    onOpenTransfer: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({
    inputText, setInputText,
    selectedFiles, handleFileChange, removeFile,
    theme, setTheme, onGenerate, isLoading,
    fileInputRef, isOpen, onClose,
    slideCount, setSlideCount,
    inputMode, setInputMode,
    userProfile,
    onOpenTransfer
}) => {
    const { user } = useUser();
    const themePresets: ThemePreset[] = [
        'modern', 'corporate', 'creative', 'minimal',
        'midnight', 'cyberpunk', 'school', 'custom'
    ];

    const sidebarVariants: Variants = {
        open: { x: 0, opacity: 1, transition: { type: 'spring', damping: 25, stiffness: 200 } },
        closed: { x: '-100%', opacity: 0, transition: { type: 'spring', damping: 25, stiffness: 200 } }
    };

    const containerVariants = {
        animate: { transition: { staggerChildren: 0.08, delayChildren: 0.1 } }
    };

    const itemVariants: Variants = {
        initial: { opacity: 0, y: 15 },
        animate: {
            opacity: 1,
            y: 0,
            transition: { duration: 0.4, ease: "easeOut" }
        }
    };

    return (
        <motion.aside
            initial={window.innerWidth < 1024 ? "closed" : "open"}
            animate="open"
            exit="closed"
            variants={sidebarVariants}
            className="fixed lg:sticky top-0 left-0 h-screen w-[85vw] sm:w-[380px] lg:w-[420px] 
                       bg-background/95 backdrop-blur-xl border-r border-white/5 z-50 
                       flex flex-col p-6 md:p-8 overflow-y-auto no-scrollbar shadow-glass-xl"
        >
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-primary to-secondary rounded-xl flex-center shadow-lg shadow-black/20 border border-white/10">
                        <Layout className="text-white" size={20} />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold tracking-tight text-white leading-none">SlideCraft<span className="text-accent">AI</span></h1>
                        <p className="text-[10px] text-accent/80 font-bold tracking-widest uppercase mt-1">Premium Deck Engine</p>
                    </div>
                </div>

                <button
                    onClick={onClose}
                    className="lg:hidden p-2 hover:bg-white/5 rounded-lg text-muted transition-colors"
                >
                    <X size={20} />
                </button>
            </div>

            <motion.div variants={containerVariants} initial="initial" animate="animate" className="flex-grow space-y-8">
                {/* Input Mode Selection */}
                <motion.section variants={itemVariants} className="space-y-4">
                    <div className="flex items-center justify-between">
                        <label className="text-xs font-bold text-muted uppercase tracking-widest flex items-center gap-2">
                            <FileText size={14} className="text-accent" /> Content Source
                        </label>
                        <div className="flex bg-surface p-1 rounded-lg border border-white/5">
                            {(['topic', 'content', 'file'] as const).map((mode) => (
                                <button
                                    key={mode}
                                    onClick={() => setInputMode(mode)}
                                    className={`px-3 py-1.5 rounded-md text-[10px] font-bold uppercase tracking-widest transition-all ${inputMode === mode
                                        ? 'bg-accent text-white shadow-lg shadow-accent/20'
                                        : 'text-muted hover:text-white'
                                        }`}
                                >
                                    {mode}
                                </button>
                            ))}
                        </div>
                    </div>

                    <AnimatePresence mode="wait">
                        {inputMode === 'file' ? (
                            <motion.div
                                key="file-mode"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className="space-y-4"
                            >
                                <div
                                    onClick={() => fileInputRef.current?.click()}
                                    className="group border border-dashed border-white/10 rounded-xl p-8 flex flex-col items-center justify-center 
                                               cursor-pointer hover:bg-white/5 hover:border-accent/30 transition-all bg-surface/50"
                                >
                                    <div className="w-12 h-12 bg-surface rounded-full flex items-center justify-center mb-3 group-hover:scale-110 transition-transform border border-white/5">
                                        <Upload size={20} className="text-muted group-hover:text-accent transition-colors" />
                                    </div>
                                    <p className="text-xs font-bold text-muted uppercase tracking-widest group-hover:text-white transition-colors">Upload Assets</p>
                                    <p className="text-[10px] text-muted/60 mt-1">PDF, DOCX, Images</p>
                                    <input
                                        type="file"
                                        ref={fileInputRef}
                                        className="hidden"
                                        multiple
                                        onChange={handleFileChange}
                                        accept=".pdf,.docx,image/*"
                                    />
                                </div>

                                <div className="space-y-2 max-h-48 overflow-y-auto no-scrollbar">
                                    {selectedFiles.map((file) => (
                                        <motion.div
                                            initial={{ opacity: 0, x: -10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            key={file.id}
                                            className="flex items-center justify-between p-3 bg-surface border border-white/5 rounded-lg group hover:border-white/10 transition-colors"
                                        >
                                            <div className="flex items-center gap-3 overflow-hidden">
                                                {file.mimeType.startsWith('image/') ? (
                                                    <div className="w-8 h-8 rounded-md overflow-hidden border border-white/10 flex-shrink-0">
                                                        <img src={`data:${file.mimeType};base64,${file.data}`} className="w-full h-full object-cover" alt="Preview" />
                                                    </div>
                                                ) : (
                                                    <div className="w-8 h-8 rounded-md bg-white/5 flex items-center justify-center flex-shrink-0">
                                                        <File size={14} className="text-accent" />
                                                    </div>
                                                )}
                                                <span className="text-xs font-medium text-slate-300 truncate">{file.name}</span>
                                            </div>
                                            <button
                                                onClick={() => removeFile(file.id)}
                                                className="p-1.5 hover:bg-white/10 rounded-md text-muted hover:text-red-400 transition-colors"
                                            >
                                                <X size={14} />
                                            </button>
                                        </motion.div>
                                    ))}
                                </div>
                            </motion.div>
                        ) : (
                            <motion.div
                                key="text-mode"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className="relative group"
                            >
                                <textarea
                                    className="input-field h-48 resize-none text-sm leading-relaxed"
                                    placeholder={inputMode === 'topic' ? "Enter your presentation topic..." : "Paste your content notes here..."}
                                    value={inputText}
                                    onChange={(e) => setInputText(e.target.value)}
                                />
                                <div className="absolute right-4 bottom-4 pointer-events-none">
                                    <Sparkles size={16} className="text-accent opacity-50 group-focus-within:opacity-100 transition-opacity" />
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </motion.section>

                {/* Slide Count */}
                <AnimatePresence>
                    {inputMode !== 'content' && (
                        <motion.section
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="space-y-4"
                        >
                            <label className="text-xs font-bold text-muted uppercase tracking-widest flex items-center gap-2">
                                <Monitor size={14} className="text-accent" /> Deck Size
                            </label>
                            <div className="flex items-center gap-4 bg-surface p-2 rounded-xl border border-white/5">
                                <button
                                    onClick={() => setSlideCount(Math.max(1, slideCount - 1))}
                                    className="w-10 h-10 rounded-lg hover:bg-white/5 flex items-center justify-center text-muted hover:text-white transition-colors"
                                >
                                    -
                                </button>
                                <div className="flex-grow text-center">
                                    <span className="text-xl font-bold text-white">{slideCount}</span>
                                    <span className="text-[10px] text-muted font-bold uppercase tracking-widest ml-2">Slides</span>
                                </div>
                                <button
                                    onClick={() => setSlideCount(Math.min(20, slideCount + 1))}
                                    className="w-10 h-10 rounded-lg hover:bg-white/5 flex items-center justify-center text-muted hover:text-white transition-colors"
                                >
                                    +
                                </button>
                            </div>
                        </motion.section>
                    )}
                </AnimatePresence>

                {/* Theme Selection */}
                <motion.section variants={itemVariants} className="space-y-4">
                    <label className="text-xs font-bold text-muted uppercase tracking-widest flex items-center gap-2">
                        <Palette size={14} className="text-accent" /> Visual Style
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                        {themePresets.map((t) => (
                            <button
                                key={t}
                                onClick={() => setTheme(t)}
                                className={`relative p-3 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all truncate border ${theme === t
                                    ? 'bg-accent text-white border-accent shadow-lg shadow-accent/20'
                                    : 'bg-surface text-muted border-white/5 hover:border-white/10 hover:text-white'
                                    }`}
                            >
                                {t}
                                {theme === t && (
                                    <Check size={10} className="absolute top-1.5 right-1.5" />
                                )}
                            </button>
                        ))}
                    </div>
                </motion.section>
            </motion.div>

            {/* Generate Button */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-8 pt-6 border-t border-white/5"
            >
                <button
                    onClick={onGenerate}
                    disabled={isLoading}
                    className="w-full btn-primary flex items-center justify-center gap-2 group disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {isLoading ? (
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                        <>
                            <span>Generate Deck</span>
                            <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
                        </>
                    )}
                </button>
            </motion.div>

            {/* Profile Footer */}
            {user && (
                <div className="mt-6 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="relative">
                            <img src={user.imageUrl} className="w-10 h-10 rounded-lg border border-white/10" alt="Profile" />
                            <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-emerald-500 border-2 border-background rounded-full" />
                        </div>
                        <div>
                            <p className="text-xs font-bold text-white">@{userProfile?.username || user.username}</p>
                            <div className="flex items-center gap-1.5 mt-0.5">
                                <Database size={10} className="text-accent" />
                                <p className="text-[10px] text-accent font-bold uppercase tracking-widest">
                                    {userProfile?.credits ?? 0} Credits
                                </p>
                            </div>
                        </div>
                    </div>
                    <button
                        onClick={onOpenTransfer}
                        className="p-2 hover:bg-white/5 rounded-lg text-muted hover:text-accent transition-colors"
                        title="Transfer Credits"
                    >
                        <Send size={16} />
                    </button>
                </div>
            )}
        </motion.aside>
    );
};

export default Sidebar;
