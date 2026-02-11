import React from 'react';
import {
    FileText,
    Upload,
    Palette,
    Sparkles,
    X,
    File,
    ChevronRight,
    Monitor
} from 'lucide-react';
import { ThemePreset } from '../types';

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
}

const Sidebar: React.FC<SidebarProps> = ({
    inputText, setInputText,
    selectedFiles, handleFileChange, removeFile,
    theme, setTheme, onGenerate, isLoading,
    fileInputRef
}) => {
    const themePresets: ThemePreset[] = [
        'modern', 'corporate', 'creative', 'minimal',
        'midnight', 'cyberpunk', 'custom'
    ];

    return (
        <aside className="w-full lg:w-[450px] glass h-screen sticky top-0 flex flex-col p-8 z-30 overflow-y-auto">
            <div className="flex items-center gap-4 mb-12">
                <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex-center shadow-lg shadow-indigo-500/30">
                    <Monitor className="text-white" size={24} />
                </div>
                <div>
                    <h1 className="text-2xl font-black tracking-tighter gradient-text">SLIDECRAFT AI</h1>
                    <p className="text-[10px] text-indigo-400 font-bold tracking-[0.2em] uppercase">Premium Deck Engine</p>
                </div>
            </div>

            <div className="flex-grow space-y-10">
                <section className="space-y-4">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                        <FileText size={14} className="text-indigo-400" /> Content Source
                    </label>
                    <textarea
                        className="w-full h-40 bg-slate-900/50 border border-slate-700 rounded-2xl p-6 text-sm text-slate-100 focus:border-indigo-500 transition-all resize-none"
                        placeholder="Paste your notes here..."
                        value={inputText}
                        onChange={(e) => setInputText(e.target.value)}
                    />
                </section>

                <section className="space-y-4">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                        <Upload size={14} className="text-indigo-400" /> Documents
                    </label>
                    <div
                        onClick={() => fileInputRef.current?.click()}
                        className="border-2 border-dashed border-slate-700 rounded-2xl p-8 flex-center flex-col cursor-pointer hover:bg-indigo-500/5 transition-all"
                    >
                        <Upload size={20} className="text-slate-400 mb-2" />
                        <p className="text-sm font-medium text-slate-400">Click to Upload</p>
                        <input type="file" ref={fileInputRef} className="hidden" multiple onChange={handleFileChange} />
                    </div>

                    {selectedFiles.map((file) => (
                        <div key={file.id} className="flex items-center justify-between p-3 bg-slate-800/40 rounded-xl">
                            <span className="text-xs truncate">{file.name}</span>
                            <button onClick={() => removeFile(file.id)} className="text-slate-500 hover:text-red-400"><X size={14} /></button>
                        </div>
                    ))}
                </section>

                <section className="space-y-4">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                        <Palette size={14} className="text-indigo-400" /> Visuals
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                        {themePresets.map((t) => (
                            <button
                                key={t}
                                onClick={() => setTheme(t)}
                                className={`py-3 rounded-xl text-xs font-bold ${theme === t ? 'bg-indigo-600' : 'bg-slate-800'}`}
                            >
                                {t}
                            </button>
                        ))}
                    </div>
                </section>
            </div>

            <button
                onClick={onGenerate}
                disabled={isLoading}
                className="w-full py-5 bg-indigo-600 rounded-2xl font-black text-sm tracking-widest uppercase flex-center gap-3 mt-12 hover:bg-indigo-500 transition-all"
            >
                {isLoading ? "Generating..." : "Generate Deck"}
                {!isLoading && <ChevronRight size={16} />}
            </button>
        </aside>
    );
};

export default Sidebar;
