import React, { useState, useRef } from 'react';
import { Presentation, ThemePreset, CustomThemeConfig, FilePart } from './types';
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
    LogOut
} from 'lucide-react';
import Login from './components/Login';

interface SelectedFile extends FilePart {
    name: string;
    id: string;
}

const App: React.FC = () => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
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

    const handleExport = () => {
        if (presentation) {
            exportToPPTX(presentation);
        }
    };

    if (!isAuthenticated) {
        return <Login onLogin={() => setIsAuthenticated(true)} />;
    }

    return (
        <div className="min-h-screen flex bg-slate-950 text-slate-100 selection:bg-indigo-500/30">
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
            />

            <main className="flex-grow h-screen overflow-y-auto bg-[radial-gradient(circle_at_top_right,_var(--bg-sidebar),_transparent)] p-12 lg:p-20 relative">
                {/* Logout Button */}
                <button
                    onClick={() => setIsAuthenticated(false)}
                    className="absolute top-8 right-8 p-3 glass rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-all group"
                    title="Logout"
                >
                    <LogOut size={20} className="group-hover:-translate-x-1 transition-transform" />
                </button>

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

                            <div className="flex-grow flex-center relative px-20">
                                <button
                                    onClick={() => setCurrentSlideIndex(prev => Math.max(0, prev - 1))}
                                    disabled={currentSlideIndex === 0}
                                    className="absolute left-0 p-6 glass rounded-3xl text-slate-400 hover:text-white hover:bg-white/10 disabled:opacity-0 transition-all"
                                >
                                    <ChevronLeft size={32} />
                                </button>

                                <div className="w-full premium-card">
                                    <SlidePreview
                                        slide={presentation.slides[currentSlideIndex]}
                                        theme={theme}
                                        customThemeConfig={theme === 'custom' ? customTheme : undefined}
                                    />
                                </div>

                                <button
                                    onClick={() => setCurrentSlideIndex(prev => Math.min(presentation.slides.length - 1, prev + 1))}
                                    disabled={currentSlideIndex === presentation.slides.length - 1}
                                    className="absolute right-0 p-6 glass rounded-3xl text-slate-400 hover:text-white hover:bg-white/10 disabled:opacity-0 transition-all"
                                >
                                    <ChevronRight size={32} />
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
    );
};

export default App;
