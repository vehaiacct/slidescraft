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
}

const Sidebar: React.FC<SidebarProps> = ({
    inputText, setInputText,
    selectedFiles, handleFileChange, removeFile,
    theme, setTheme, onGenerate, isLoading,
    fileInputRef, isOpen, onClose
}) => {
    const { user } = useUser();
    const themePresets: ThemePreset[] = [
        'modern', 'corporate', 'creative', 'minimal',
        'midnight', 'cyberpunk', 'school', 'custom'
    ];

    return (
        <aside className={`
            fixed lg:sticky top-0 left-0 h-screen glass z-50 p-8 flex flex-col overflow-y-auto transition-transform duration-300 ease-in-out
            w-[85vw] sm:w-[400px] lg:w-[450px]
            ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}>
            <div className="flex items-center justify-between mb-12">
                <div className="flex items-center gap-4">
                    <div className="w-10 h-10 lg:w-12 lg:h-12 bg-indigo-600 rounded-2xl flex-center shadow-lg shadow-indigo-500/30">
                        <Monitor className="text-white" size={20} />
                    </div>
                    <div>
                        <h1 className="text-xl lg:text-2xl font-black tracking-tighter gradient-text leading-none">SLIDECRAFT AI</h1>
                        <p className="text-[8px] lg:text-[10px] text-indigo-400 font-bold tracking-[0.2em] uppercase">Premium Deck Engine</p>
                    </div>
                </div>

                {/* Mobile Close Button */}
                <button
                    onClick={onClose}
                    className="lg:hidden p-2 hover:bg-white/5 rounded-xl text-slate-400"
                >
                    <X size={24} />
                </button>
            </div>

            <div className="flex-grow space-y-8 lg:space-y-10">
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
                className="w-full py-5 bg-indigo-600 rounded-2xl font-black text-sm tracking-widest uppercase flex-center gap-3 mt-12 hover:bg-indigo-500 transition-all mb-8"
            >
                {isLoading ? "Generating..." : "Generate Deck"}
                {!isLoading && <ChevronRight size={16} />}
            </button>

            {user && (
                <div className="mt-auto pt-8 border-t border-white/5 flex items-center gap-4">
                    <img src={user.imageUrl} className="w-10 h-10 rounded-xl border border-white/10" alt="Avatar" />
                    <div>
                        <p className="text-sm font-bold white-space-nowrap">{user.fullName || user.username}</p>
                        <p className="text-[10px] text-indigo-400 font-bold uppercase tracking-widest">Premium User</p>
                    </div>
                </div>
            )}
        </aside>
    );
};

export default Sidebar;
