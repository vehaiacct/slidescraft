import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { SignedIn, SignedOut, SignIn, SignUp, UserButton, useUser } from '@clerk/clerk-react';
import { Presentation, ThemePreset, CustomThemeConfig, FilePart, SlideContent, InputMode } from './types';
import { generatePresentation } from './services/groq';
import { exportToPPTX } from './services/export';
import { extractTextFromPDF, extractTextFromDocx } from './services/document';
import Sidebar from './components/Sidebar';
import SlidePreview from './components/SlidePreview';
import {
    Download,
    ChevronLeft,
    ChevronRight,
    RefreshCw,
    Layout,
    Presentation as PresentationIcon,
    LogOut,
    MessageSquare,
    Menu,
    X,
    Sparkles,
    Trash2,
    Database,
    Shield
} from 'lucide-react';
import { getUserProfile } from './services/user';
import Onboarding from './components/Onboarding';
import TransferCreditsModal from './components/TransferCreditsModal';
import AdminDashboard from './components/AdminDashboard';
import CreditConfirmationModal from './components/CreditConfirmationModal';
import { UserProfile } from './services/supabase';

interface SelectedFile extends FilePart {
    name: string;
    id: string;
}

const App: React.FC = () => {
    const { isLoaded, isSignedIn, user } = useUser();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [inputText, setInputText] = useState('');
    const [selectedFiles, setSelectedFiles] = useState<SelectedFile[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [presentation, setPresentation] = useState<Presentation | null>(null);
    const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
    const [theme, setTheme] = useState<ThemePreset>('modern');
    const [slideCount, setSlideCount] = useState(7);
    const [inputMode, setInputMode] = useState<InputMode>('topic');
    const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
    const [isFetchingProfile, setIsFetchingProfile] = useState(false);
    const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
    const [isAdminDashboardOpen, setIsAdminDashboardOpen] = useState(false);
    const [isCreditConfirmOpen, setIsCreditConfirmOpen] = useState(false);
    const [customTheme] = useState<CustomThemeConfig>({
        primaryColor: '#6366f1',
        secondaryColor: '#4f46e5',
        fontFamily: 'Inter'
    });

    const fileInputRef = useRef<HTMLInputElement>(null);

    const refreshProfile = async () => {
        if (user?.id) {
            const profile = await getUserProfile(user.id);
            setUserProfile(profile);
        }
    };

    React.useEffect(() => {
        const fetchProfile = async () => {
            if (user?.id) {
                setIsFetchingProfile(true);
                const profile = await getUserProfile(user.id);
                setUserProfile(profile);
                setIsFetchingProfile(false);
            }
        };
        fetchProfile();
    }, [user?.id]);

    const fileToBase64 = (file: File): Promise<string> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => {
                const base64String = (reader.result as string).split(',')[1];
                resolve(base64String);
            };
            reader.onerror = error => reject(error);
        });
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files) return;

        setIsLoading(true); // Show loading while parsing
        const newFiles: SelectedFile[] = [];
        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            if (file.size > 10 * 1024 * 1024) continue;

            try {
                let extractedText = undefined;
                const fileName = file.name.toLowerCase();
                const mimeType = file.type;

                console.log(`Processing file: ${file.name}, MIME: ${mimeType}`);

                if (mimeType === 'application/pdf' || fileName.endsWith('.pdf')) {
                    console.log('Detected PDF, extracting...');
                    extractedText = await extractTextFromPDF(file);
                } else if (
                    mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
                    fileName.endsWith('.docx')
                ) {
                    console.log('Detected DOCX, extracting...');
                    extractedText = await extractTextFromDocx(file);
                }

                const base64 = await fileToBase64(file);
                newFiles.push({
                    id: Math.random().toString(36).substr(2, 9),
                    name: file.name,
                    mimeType: mimeType || (fileName.endsWith('.pdf') ? 'application/pdf' : 'application/octet-stream'),
                    data: base64,
                    extractedText
                });
            } catch (error: any) {
                console.error(`Detailed error for ${file.name}:`, error);
                alert(`Error processing "${file.name}": ${error.message || "Unknown error"}. Check console for details.`);
            }
        }
        setSelectedFiles(prev => [...prev, ...newFiles]);
        setIsLoading(false);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const removeFile = (id: string) => {
        setSelectedFiles(prev => prev.filter(f => f.id !== id));
    };

    const handleGenerateClick = () => {
        if (!inputText.trim() && selectedFiles.length === 0) return;
        // Show confirmation modal
        setIsCreditConfirmOpen(true);
    };

    const handleGenerate = async () => {
        setIsCreditConfirmOpen(false);
        setIsLoading(true);
        if (window.innerWidth < 1024) setIsSidebarOpen(false);

        try {
            const fileParts: FilePart[] = selectedFiles.map(f => ({
                data: f.data,
                mimeType: f.mimeType
            }));

            const result = await generatePresentation(inputText, theme, slideCount, fileParts, inputMode);
            setPresentation(result);
            setCurrentSlideIndex(0);

            // Deduct credits in DB
            if (userProfile && user?.id) {
                const { supabase } = await import('./services/supabase');
                await supabase.from('profiles').update({ credits: userProfile.credits - result.slides.length }).eq('id', user.id);
                await supabase.from('transactions').insert([{ sender_id: user.id, amount: result.slides.length, type: 'generation' }]);
                refreshProfile();
            }
        } catch (error: any) {
            console.error("Failed to generate:", error);
            alert(`AI generation failed: ${error.message || "Unknown error"}`);
        } finally {
            setIsLoading(false);
        }
    };

    const handleUpdateSlide = (updatedContent: Partial<SlideContent>) => {
        if (!presentation) return;

        const newSlides = [...presentation.slides];
        newSlides[currentSlideIndex] = {
            ...newSlides[currentSlideIndex],
            content: {
                ...newSlides[currentSlideIndex].content,
                ...updatedContent
            }
        };

        setPresentation({
            ...presentation,
            slides: newSlides
        });
    };

    const handleExport = () => {
        if (presentation) {
            const finalPresentation = {
                ...presentation,
                theme: theme,
                customThemeConfig: theme === 'custom' ? customTheme : undefined
            };
            exportToPPTX(finalPresentation);
        }
    };

    const handleDeleteSlide = () => {
        if (!presentation) return;

        const newSlides = presentation.slides.filter((_, i) => i !== currentSlideIndex);
        if (newSlides.length === 0) {
            setPresentation(null);
            return;
        }

        setPresentation({
            ...presentation,
            slides: newSlides
        });

        // Safe index update
        if (currentSlideIndex >= newSlides.length) {
            setCurrentSlideIndex(newSlides.length - 1);
        }
    };

    if (!isLoaded) {
        return (
            <div className="min-h-screen bg-slate-950 flex flex-center">
                <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="w-12 h-12 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin"
                />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-950 text-slate-100 selection:bg-indigo-500/40 selection:text-white overflow-hidden font-sans">
            <SignedIn>
                <div className="flex h-screen overflow-hidden">
                    <AnimatePresence mode="wait">
                        {(isSidebarOpen || window.innerWidth >= 1024) && (
                            <Sidebar
                                inputText={inputText}
                                setInputText={setInputText}
                                selectedFiles={selectedFiles}
                                handleFileChange={handleFileChange}
                                removeFile={removeFile}
                                theme={theme}
                                setTheme={setTheme}
                                onGenerate={handleGenerate}
                                isLoading={isLoading}
                                fileInputRef={fileInputRef}
                                isOpen={isSidebarOpen}
                                onClose={() => setIsSidebarOpen(false)}
                                slideCount={slideCount}
                                setSlideCount={setSlideCount}
                                inputMode={inputMode}
                                setInputMode={setInputMode}
                                userProfile={userProfile}
                                onOpenTransfer={() => setIsTransferModalOpen(true)}
                            />
                        )}
                    </AnimatePresence>

                    <TransferCreditsModal
                        isOpen={isTransferModalOpen}
                        onClose={() => setIsTransferModalOpen(false)}
                        currentBalance={userProfile?.credits || 0}
                        senderId={user?.id || ''}
                        onSuccess={refreshProfile}
                    />

                    <AdminDashboard
                        isOpen={isAdminDashboardOpen}
                        onClose={() => setIsAdminDashboardOpen(false)}
                    />

                    <CreditConfirmationModal
                        isOpen={isCreditConfirmOpen}
                        onClose={() => setIsCreditConfirmOpen(false)}
                        onConfirm={handleGenerate}
                        slideCount={slideCount}
                        currentBalance={userProfile?.credits || 0}
                    />

                    {/* Mobile Backdrop */}
                    <AnimatePresence>
                        {isSidebarOpen && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                onClick={() => setIsSidebarOpen(false)}
                                className="fixed inset-0 bg-black/60 backdrop-blur-md z-40 lg:hidden"
                            />
                        )}
                    </AnimatePresence>

                    <main className="flex-grow flex flex-col h-screen relative bg-[radial-gradient(circle_at_top_right,_var(--bg-sidebar),_transparent)] overflow-hidden">
                        {isSignedIn && !userProfile && !isFetchingProfile && (
                            <Onboarding
                                userId={user.id}
                                email={user.primaryEmailAddress?.emailAddress || ''}
                                onComplete={(profile) => setUserProfile(profile)}
                            />
                        )}

                        <header className="h-20 md:h-24 px-6 md:px-10 flex items-center justify-between glass border-b border-white/5 sticky top-0 z-40 backdrop-blur-3xl shrink-0">
                            <div className="flex items-center gap-4">
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => setIsSidebarOpen(true)}
                                    className="lg:hidden p-3 glass rounded-2xl text-slate-400 hover:text-white"
                                >
                                    <Menu size={20} />
                                </motion.button>
                                <div className="flex items-center gap-2">
                                    <div className="w-8 h-8 md:w-10 md:h-10 bg-indigo-600 rounded-xl flex-center shadow-lg shadow-indigo-500/20">
                                        <Sparkles size={18} className="text-white md:w-5 md:h-5" />
                                    </div>
                                    <span className="text-lg md:text-xl font-black tracking-tight hidden sm:block">SlideCraft<span className="text-indigo-400">AI</span></span>
                                </div>
                                {/* Mobile credit badge */}
                                {userProfile && (
                                    <div className="md:hidden flex items-center gap-1.5 px-2.5 py-1.5 bg-indigo-500/10 rounded-lg border border-indigo-500/20">
                                        <Database size={12} className="text-indigo-400" />
                                        <span className="text-xs font-bold text-white">{userProfile.credits}</span>
                                    </div>
                                )}
                            </div>

                            <div className="flex items-center gap-4">
                                {userProfile && (
                                    <div className="hidden md:flex items-center gap-3 px-4 py-2 bg-white/5 rounded-xl border border-white/10">
                                        <Database size={16} className="text-indigo-400" />
                                        <div className="text-right">
                                            <p className="text-xs font-bold text-white leading-none">{userProfile.credits} Credits</p>
                                            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest leading-none mt-1">@{userProfile.username}</p>
                                        </div>
                                    </div>
                                )}
                                {userProfile?.is_admin && (
                                    <motion.button
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={() => setIsAdminDashboardOpen(true)}
                                        className="p-3 bg-indigo-500/10 text-indigo-400 rounded-2xl hover:bg-indigo-500/20 transition-all border border-indigo-500/20"
                                        title="Admin Console"
                                    >
                                        <Shield size={20} />
                                    </motion.button>
                                )}
                                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                    <UserButton afterSignOutUrl="/" appearance={{ elements: { userButtonAvatarBox: 'w-9 h-9 md:w-11 md:h-11 border-2 border-white/5 hover:border-indigo-500/50 transition-colors' } }} />
                                </motion.div>
                            </div>
                        </header>

                        <div className="flex-grow overflow-y-auto px-4 md:px-12 lg:px-20 pb-20">
                            <div className="max-w-6xl mx-auto h-full flex flex-col">
                                <AnimatePresence mode="wait">
                                    {!presentation ? (
                                        <motion.div
                                            key="empty"
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: -20 }}
                                            className="flex-grow flex-center"
                                        >
                                            <div className="text-center space-y-10 max-w-lg">
                                                <motion.div
                                                    animate={{ y: [0, -10, 0] }}
                                                    transition={{ repeat: Infinity, duration: 4 }}
                                                    className="w-24 h-24 md:w-32 md:h-32 bg-indigo-600/10 rounded-[2.5rem] md:rounded-[3rem] flex-center mx-auto border border-indigo-500/20 shadow-[0_0_60px_rgba(79,70,229,0.1)]"
                                                >
                                                    <PresentationIcon size={56} className="text-indigo-400 md:w-16 md:h-16" />
                                                </motion.div>
                                                <div className="space-y-4">
                                                    <h2 className="text-4xl md:text-6xl font-black tracking-tighter leading-none">
                                                        Your story, <br />
                                                        <span className="gradient-text">beautifully told.</span>
                                                    </h2>
                                                    <p className="text-slate-400 text-base md:text-xl leading-relaxed">
                                                        From raw thoughts to high-impact slides. <br className="hidden md:block" />
                                                        Powered by next-gen AI.
                                                    </p>
                                                </div>
                                            </div>
                                        </motion.div>
                                    ) : (
                                        <motion.div
                                            key="presentation"
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            className="flex-grow flex flex-col space-y-8 md:space-y-12"
                                        >
                                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                                                <div>
                                                    <h2 className="text-2xl md:text-4xl font-black tracking-tight truncate max-w-xl">{presentation.title}</h2>
                                                    <div className="flex items-center gap-2 mt-2">
                                                        <span className="px-2 py-1 bg-indigo-500/10 text-indigo-400 rounded-md text-[10px] font-bold uppercase tracking-widest leading-none">
                                                            {presentation.slides.length} SLIDES
                                                        </span>
                                                        <span className="px-2 py-1 bg-white/5 text-slate-400 rounded-md text-[10px] font-bold uppercase tracking-widest leading-none">
                                                            {theme} THEME
                                                        </span>
                                                    </div>
                                                </div>
                                                <div className="flex gap-3">
                                                    <motion.button
                                                        whileHover={{ scale: 1.05 }}
                                                        whileTap={{ scale: 0.95 }}
                                                        onClick={handleDeleteSlide}
                                                        className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl hover:bg-red-500/20 transition-all text-red-400"
                                                        title="Omit Slide"
                                                    >
                                                        <Trash2 size={20} />
                                                    </motion.button>
                                                    <motion.button
                                                        whileHover={{ scale: 1.05 }}
                                                        whileTap={{ scale: 0.95 }}
                                                        onClick={handleGenerate}
                                                        className="p-4 bg-slate-900 border border-slate-800 rounded-2xl hover:bg-slate-800 transition-all text-slate-400"
                                                    >
                                                        <RefreshCw size={20} />
                                                    </motion.button>
                                                    <motion.button
                                                        whileHover={{ scale: 1.02, y: -2 }}
                                                        whileTap={{ scale: 0.98 }}
                                                        onClick={handleExport}
                                                        className="flex-grow md:flex-none flex items-center justify-center gap-3 px-8 py-4 bg-white text-slate-950 rounded-2xl font-black text-sm tracking-widest uppercase hover:bg-indigo-50 transition-all shadow-xl shadow-white/5"
                                                    >
                                                        <Download size={18} />
                                                        <span>Export PPTX</span>
                                                    </motion.button>
                                                </div>
                                            </div>

                                            <div className="flex-grow flex flex-col lg:flex-row gap-8 items-start relative pb-10">
                                                {/* Desktop Nav Controls */}
                                                <div className="hidden lg:block absolute -left-20 top-1/2 -translate-y-1/2">
                                                    <motion.button
                                                        whileHover={{ scale: 1.1, x: -5 }}
                                                        whileTap={{ scale: 0.9 }}
                                                        onClick={() => setCurrentSlideIndex(prev => Math.max(0, prev - 1))}
                                                        disabled={currentSlideIndex === 0}
                                                        className="p-6 glass rounded-full text-slate-400 hover:text-white hover:bg-white/10 disabled:opacity-0 transition-all"
                                                    >
                                                        <ChevronLeft size={32} />
                                                    </motion.button>
                                                </div>

                                                <div className="flex-grow space-y-6 md:space-y-10 w-full">
                                                    <div className="premium-card overflow-hidden w-full max-w-5xl mx-auto shadow-2xl">
                                                        <SlidePreview
                                                            slide={presentation.slides[currentSlideIndex]}
                                                            theme={theme}
                                                            customThemeConfig={theme === 'custom' ? customTheme : undefined}
                                                            onUpdate={handleUpdateSlide}
                                                        />
                                                    </div>

                                                    <div className="max-w-5xl mx-auto w-full">
                                                        <div className="glass premium-card p-6 md:p-10">
                                                            <div className="flex items-center gap-3 mb-6">
                                                                <div className="w-10 h-10 bg-indigo-600/20 rounded-xl flex-center">
                                                                    <MessageSquare size={18} className="text-indigo-400" />
                                                                </div>
                                                                <div>
                                                                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Presenter Script</h3>
                                                                    <p className="text-[10px] text-slate-600 font-medium">AI generated guide for your delivery</p>
                                                                </div>
                                                            </div>
                                                            <div
                                                                contentEditable
                                                                suppressContentEditableWarning
                                                                onBlur={(e) => handleUpdateSlide({ speakerNotes: e.currentTarget.textContent || '' })}
                                                                className="text-slate-300 leading-relaxed text-sm md:text-lg outline-none focus:ring-1 focus:ring-indigo-500/30 rounded-xl p-4 transition-all min-h-[100px] bg-black/20 border border-white/5"
                                                            >
                                                                {presentation.slides[currentSlideIndex].content.speakerNotes || "Click here to add notes for this slide..."}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="hidden lg:block absolute -right-20 top-1/2 -translate-y-1/2">
                                                    <motion.button
                                                        whileHover={{ scale: 1.1, x: 5 }}
                                                        whileTap={{ scale: 0.9 }}
                                                        onClick={() => setCurrentSlideIndex(prev => Math.min(presentation.slides.length - 1, prev + 1))}
                                                        disabled={currentSlideIndex === presentation.slides.length - 1}
                                                        className="p-6 glass rounded-full text-slate-400 hover:text-white hover:bg-white/10 disabled:opacity-0 transition-all"
                                                    >
                                                        <ChevronRight size={32} />
                                                    </motion.button>
                                                </div>

                                                {/* Mobile Nav Controls */}
                                                <div className="lg:hidden flex items-center justify-between w-full gap-4 mt-6">
                                                    <motion.button
                                                        whileTap={{ scale: 0.9 }}
                                                        onClick={() => setCurrentSlideIndex(prev => Math.max(0, prev - 1))}
                                                        disabled={currentSlideIndex === 0}
                                                        className="flex-grow p-4 glass rounded-2xl text-slate-400 flex-center disabled:opacity-30"
                                                    >
                                                        <ChevronLeft size={24} />
                                                    </motion.button>
                                                    <div className="px-6 py-4 glass rounded-2xl text-xs font-bold tracking-widest">
                                                        {currentSlideIndex + 1} / {presentation.slides.length}
                                                    </div>
                                                    <motion.button
                                                        whileTap={{ scale: 0.9 }}
                                                        onClick={() => setCurrentSlideIndex(prev => Math.min(presentation.slides.length - 1, prev + 1))}
                                                        disabled={currentSlideIndex === presentation.slides.length - 1}
                                                        className="flex-grow p-4 glass rounded-2xl text-slate-400 flex-center disabled:opacity-30"
                                                    >
                                                        <ChevronRight size={24} />
                                                    </motion.button>
                                                </div>
                                            </div>

                                            {/* Scroll Progress Indicators */}
                                            <footer className="flex justify-center gap-3 md:gap-4 overflow-x-auto py-8 no-scrollbar">
                                                {presentation.slides.map((_, idx) => (
                                                    <motion.button
                                                        key={idx}
                                                        initial={false}
                                                        animate={{
                                                            width: currentSlideIndex === idx ? 48 : 12,
                                                            height: 8,
                                                            backgroundColor: currentSlideIndex === idx ? 'var(--primary)' : 'rgba(255, 255, 255, 0.1)',
                                                            boxShadow: currentSlideIndex === idx ? '0 0 20px var(--primary-glow)' : 'none'
                                                        }}
                                                        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                                                        onClick={() => setCurrentSlideIndex(idx)}
                                                        className="rounded-full cursor-pointer hover:bg-white/20 transition-colors"
                                                    />
                                                ))}
                                            </footer>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        </div>
                    </main>
                </div>
            </SignedIn>

            <SignedOut>
                <div className="min-h-screen bg-[#020617] flex flex-center p-6 relative overflow-hidden">
                    <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-[120px] pointer-events-none" />
                    <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-[120px] pointer-events-none" />

                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="max-w-md w-full glass p-10 md:p-14 rounded-[3rem] border border-white/10 relative z-10"
                    >
                        <div className="text-center space-y-8 mb-12">
                            <motion.div
                                animate={{ rotate: [12, 15, 12] }}
                                transition={{ repeat: Infinity, duration: 3 }}
                                className="w-24 h-24 bg-indigo-600 rounded-[2rem] flex-center mx-auto shadow-2xl shadow-indigo-500/40"
                            >
                                <Layout size={48} className="text-white" />
                            </motion.div>
                            <div className="space-y-4">
                                <h1 className="text-5xl font-black tracking-tight gradient-text">Welcome</h1>
                                <p className="text-slate-400 text-lg">Your next masterpiece starts here.</p>
                            </div>
                        </div>
                        <SignIn
                            appearance={{
                                elements: {
                                    card: 'bg-transparent shadow-none p-0 w-full',
                                    headerTitle: 'hidden',
                                    headerSubtitle: 'hidden',
                                    socialButtonsBlockButton: 'glass border-white/10 hover:bg-white/5 transition-all py-4 text-slate-100 rounded-2xl mb-4',
                                    formButtonPrimary: 'bg-indigo-600 hover:bg-indigo-500 transition-all py-4 rounded-2xl font-bold tracking-widest uppercase shadow-lg shadow-indigo-600/30',
                                    footer: 'hidden',
                                    dividerRow: 'hidden',
                                    formFieldInput: 'bg-slate-900/50 border-white/5 rounded-2xl p-4 text-white focus:ring-indigo-500/50 transition-all',
                                    formFieldLabel: 'text-[10px] font-bold uppercase tracking-widest text-slate-500 ml-1 mb-2'
                                }
                            }}
                        />
                    </motion.div>
                </div>
            </SignedOut>
        </div>
    );
};

export default App;
