import React, { useState, useRef } from 'react';
import { SignedIn, SignedOut, SignIn, SignUp, UserButton, useUser } from '@clerk/clerk-react';
import { Presentation, ThemePreset, CustomThemeConfig, FilePart, SlideContent } from './types';
import { generatePresentation } from './services/groq';
import { exportToPPTX } from './services/export';
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
    MessageSquare
} from 'lucide-react';

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
    const [customTheme] = useState<CustomThemeConfig>({
        primaryColor: '#6366f1',
        secondaryColor: '#4f46e5',
        fontFamily: 'Inter'
    });

    const fileInputRef = useRef<HTMLInputElement>(null);

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

        const newFiles: SelectedFile[] = [];
        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            if (file.size > 10 * 1024 * 1024) continue;

            const base64 = await fileToBase64(file);
            newFiles.push({
                id: Math.random().toString(36).substr(2, 9),
                name: file.name,
                mimeType: file.type,
                data: base64
            });
        }
        setSelectedFiles(prev => [...prev, ...newFiles]);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const removeFile = (id: string) => {
        setSelectedFiles(prev => prev.filter(f => f.id !== id));
    };

    const handleGenerate = async () => {
        if (!inputText.trim() && selectedFiles.length === 0) return;
        setIsLoading(true);
        try {
            const fileParts: FilePart[] = selectedFiles.map(f => ({
                data: f.data,
                mimeType: f.mimeType
            }));

            const result = await generatePresentation(inputText, theme, fileParts);
            setPresentation(result);
            setCurrentSlideIndex(0);
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
            exportToPPTX(presentation);
        }
    };

    if (!isLoaded) {
        return (
            <div className="min-h-screen bg-slate-950 flex-center">
                <div className="w-12 h-12 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <>
            <SignedIn>
                <div className="min-h-screen flex flex-col lg:flex-row bg-slate-950 text-slate-100 selection:bg-indigo-500/30 overflow-x-hidden">
                    {/* Mobile Overlay */}
                    {isSidebarOpen && (
                        <div
                            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden animate-fade-in"
                            onClick={() => setIsSidebarOpen(false)}
                        />
                    )}

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
                    />

                    <main className="flex-grow h-screen overflow-y-auto bg-[radial-gradient(circle_at_top_right,_var(--bg-sidebar),_transparent)] p-6 md:p-12 lg:p-20 relative">
                        {/* Mobile Header */}
                        <header className="lg:hidden flex items-center justify-between mb-8">
                            <button
                                onClick={() => setIsSidebarOpen(true)}
                                className="p-3 glass rounded-xl text-slate-400"
                            >
                                <Layout size={24} />
                            </button>
                            <div className="flex items-center gap-4">
                                <UserButton afterSignOutUrl="/" appearance={{ elements: { userButtonAvatarBox: 'w-10 h-10 border border-white/10' } }} />
                            </div>
                        </header>

                        {/* Desktop User Button */}
                        <div className="hidden lg:block absolute top-8 right-8 z-50">
                            <UserButton afterSignOutUrl="/" appearance={{ elements: { userButtonAvatarBox: 'w-10 h-10 border border-white/10' } }} />
                        </div>

                        <div className="max-w-6xl mx-auto h-full flex flex-col">
                            {!presentation ? (
                                <div className="flex-grow flex-center animate-fade-in">
                                    <div className="text-center space-y-8 max-w-lg">
                                        <div className="w-24 h-24 bg-indigo-600/10 rounded-[2.5rem] flex-center mx-auto border border-indigo-500/20 shadow-[0_0_50px_rgba(79,70,229,0.1)]">
                                            <PresentationIcon size={48} className="text-indigo-400" />
                                        </div>
                                        <div className="space-y-4">
                                            <h2 className="text-4xl lg:text-5xl font-black tracking-tight">Your story, <br /><span className="gradient-text">beautifully told.</span></h2>
                                            <p className="text-slate-400 text-lg leading-relaxed">
                                                Input your raw thoughts or upload a document. Our AI will craft a high-impact presentation in seconds.
                                            </p>
                                        </div>
                                        <div className="grid grid-cols-3 gap-6 pt-4">
                                            {[
                                                { icon: Layout, label: "AI Structure" },
                                                { icon: Download, label: "PPTX Export" },
                                                { icon: RefreshCw, label: "Live Preview" }
                                            ].map((item, i) => (
                                                <div key={i} className="space-y-2 opacity-50">
                                                    <div className="w-12 h-12 rounded-2xl bg-slate-900 border border-slate-800 flex-center mx-auto">
                                                        <item.icon size={20} />
                                                    </div>
                                                    <span className="text-[10px] font-bold uppercase tracking-widest">{item.label}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex-grow flex flex-col space-y-12 animate-fade-in">
                                    <header className="flex items-center justify-between">
                                        <div>
                                            <h2 className="text-3xl font-black tracking-tight truncate max-w-md">{presentation.title}</h2>
                                            <p className="text-indigo-400 font-bold text-xs uppercase tracking-widest mt-1">
                                                {presentation.slides.length} SLIDES · {theme} THEME
                                            </p>
                                        </div>
                                        <div className="flex gap-4">
                                            <button onClick={handleGenerate} className="p-4 bg-slate-900 border border-slate-800 rounded-2xl hover:bg-slate-800 transition-all text-slate-400">
                                                <RefreshCw size={20} />
                                            </button>
                                            <button
                                                onClick={handleExport}
                                                className="flex items-center gap-3 px-8 py-4 bg-white text-slate-950 rounded-2xl font-black text-sm tracking-widest uppercase hover:bg-indigo-50 transition-all shadow-xl shadow-white/5"
                                            >
                                                <Download size={18} />
                                                <span>Export PPTX</span>
                                            </button>
                                        </div>
                                    </header>

                                    <div className="flex-grow flex flex-col lg:flex-row gap-8 items-start relative px-4 md:px-20">
                                        <button
                                            onClick={() => setCurrentSlideIndex(prev => Math.max(0, prev - 1))}
                                            disabled={currentSlideIndex === 0}
                                            className="absolute left-0 top-1/2 -translate-y-1/2 p-4 md:p-6 glass rounded-2xl md:rounded-3xl text-slate-400 hover:text-white hover:bg-white/10 disabled:opacity-0 transition-all z-10"
                                        >
                                            <ChevronLeft size={24} className="md:w-8 md:h-8" />
                                        </button>

                                        <div className="flex-grow space-y-8 w-full">
                                            <div className="premium-card overflow-hidden">
                                                <SlidePreview
                                                    slide={presentation.slides[currentSlideIndex]}
                                                    theme={theme}
                                                    customThemeConfig={theme === 'custom' ? customTheme : undefined}
                                                    onUpdate={handleUpdateSlide}
                                                />
                                            </div>

                                            {/* Speaker Notes Section */}
                                            <div className="glass premium-card p-6 md:p-8 animate-slide-in-right" style={{ animationDelay: '0.2s' }}>
                                                <div className="flex items-center gap-3 mb-4">
                                                    <div className="w-8 h-8 bg-indigo-600/20 rounded-lg flex-center">
                                                        <MessageSquare size={16} className="text-indigo-400" />
                                                    </div>
                                                    <h3 className="text-[10px] md:text-xs font-bold text-slate-400 uppercase tracking-widest">Presenter Script</h3>
                                                </div>
                                                <div
                                                    contentEditable
                                                    suppressContentEditableWarning
                                                    onBlur={(e) => handleUpdateSlide({ speakerNotes: e.currentTarget.textContent || '' })}
                                                    className="text-slate-300 leading-relaxed text-sm outline-none focus:ring-1 focus:ring-indigo-500/30 rounded-lg p-2 transition-all min-h-[60px]"
                                                >
                                                    {presentation.slides[currentSlideIndex].content.speakerNotes || "Click here to add notes for this slide..."}
                                                </div>
                                            </div>
                                        </div>

                                        <button
                                            onClick={() => setCurrentSlideIndex(prev => Math.min(presentation.slides.length - 1, prev + 1))}
                                            disabled={currentSlideIndex === presentation.slides.length - 1}
                                            className="absolute right-0 top-1/2 -translate-y-1/2 p-4 md:p-6 glass rounded-2xl md:rounded-3xl text-slate-400 hover:text-white hover:bg-white/10 disabled:opacity-0 transition-all z-10"
                                        >
                                            <ChevronRight size={24} className="md:w-8 md:h-8" />
                                        </button>
                                    </div>

                                    <footer className="flex justify-center gap-3 overflow-x-auto py-4 px-2 no-scrollbar">
                                        {presentation.slides.map((_, idx) => (
                                            <button
                                                key={idx}
                                                onClick={() => setCurrentSlideIndex(idx)}
                                                className={`flex-shrink-0 h-1 rounded-full transition-all duration-500 ${currentSlideIndex === idx ? 'w-12 bg-indigo-500' : 'w-4 bg-slate-800 hover:bg-slate-600'
                                                    }`}
                                            />
                                        ))}
                                    </footer>
                                </div>
                            )}
                        </div>
                    </main>
                </div>
            </SignedIn>
            <SignedOut>
                <div className="min-h-screen bg-slate-950 flex-center p-6">
                    <div className="max-w-md w-full glass p-8 rounded-[2.5rem] border border-white/10">
                        <div className="text-center space-y-6 mb-12">
                            <div className="w-20 h-20 bg-indigo-600 rounded-3xl flex-center mx-auto shadow-2xl shadow-indigo-500/40 rotate-12">
                                <Layout size={40} className="text-white -rotate-12" />
                            </div>
                            <h1 className="text-4xl font-black gradient-text">Welcome Back</h1>
                            <p className="text-slate-400">Sign in to continue your Slidecraft journey</p>
                        </div>
                        <SignIn
                            appearance={{
                                elements: {
                                    card: 'bg-transparent shadow-none p-0',
                                    headerTitle: 'hidden',
                                    headerSubtitle: 'hidden',
                                    socialButtonsBlockButton: 'glass border-white/10 hover:bg-white/5 transition-all py-4 text-slate-100',
                                    formButtonPrimary: 'bg-indigo-600 hover:bg-indigo-500 transition-all py-4 rounded-xl font-bold tracking-widest uppercase',
                                    footer: 'hidden',
                                    dividerRow: 'hidden',
                                    formFieldInput: 'bg-slate-900 border-slate-700 rounded-xl p-4 text-white',
                                    formFieldLabel: 'text-xs font-bold uppercase tracking-widest text-slate-400'
                                }
                            }}
                        />
                    </div>
                </div>
            </SignedOut>
        </>
    );
};

export default App;
