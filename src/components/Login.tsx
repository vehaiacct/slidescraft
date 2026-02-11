import React, { useState } from 'react';
import { Mail, Lock, LogIn, Github, Presentation } from 'lucide-react';

interface LoginProps {
    onLogin: () => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Mock authentication
        if (email && password) {
            onLogin();
        }
    };

    return (
        <div className="min-h-screen w-full flex-center bg-slate-950 relative overflow-hidden">
            {/* Animated Background Elements */}
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-600/20 rounded-full blur-[120px] animate-pulse" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-600/20 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '2s' }} />

            <div className="w-full max-w-md px-6 z-10 animate-fade-in">
                <div className="text-center mb-10">
                    <div className="w-20 h-20 bg-indigo-600/10 rounded-[2rem] flex-center mx-auto border border-indigo-500/20 shadow-[0_0_50px_rgba(79,70,229,0.1)] mb-6">
                        <Presentation size={40} className="text-indigo-400" />
                    </div>
                    <h1 className="text-4xl font-black tracking-tight mb-2">
                        SlideCraft <span className="gradient-text">AI</span>
                    </h1>
                    <p className="text-slate-400 uppercase tracking-[0.2em] text-[10px] font-bold">
                        Elevate your presentations
                    </p>
                </div>

                <div className="glass premium-card p-10 space-y-8">
                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Email Address</label>
                            <div className="relative group">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-indigo-400 transition-colors" size={18} />
                                <input
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="name@company.com"
                                    className="w-full bg-slate-900/50 border border-slate-800 rounded-2xl py-4 pl-12 pr-4 text-sm focus:outline-none focus:border-indigo-500/50 focus:ring-4 focus:ring-indigo-500/10 transition-all placeholder:text-slate-600"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <div className="flex justify-between items-center px-1">
                                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Password</label>
                                <a href="#" className="text-[10px] font-bold text-indigo-400 hover:text-indigo-300 transition-colors uppercase tracking-wider">Forgot?</a>
                            </div>
                            <div className="relative group">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-indigo-400 transition-colors" size={18} />
                                <input
                                    type="password"
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    className="w-full bg-slate-900/50 border border-slate-800 rounded-2xl py-4 pl-12 pr-4 text-sm focus:outline-none focus:border-indigo-500/50 focus:ring-4 focus:ring-indigo-500/10 transition-all placeholder:text-slate-600"
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            className="w-full py-4 bg-white text-slate-950 rounded-2xl font-black text-sm tracking-widest uppercase hover:bg-indigo-50 transition-all shadow-xl shadow-white/5 flex-center gap-2 group"
                        >
                            <span>Sign In</span>
                            <LogIn size={18} className="group-hover:translate-x-1 transition-transform" />
                        </button>
                    </form>

                    <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-slate-800"></div>
                        </div>
                        <div className="relative flex justify-center text-[10px] uppercase font-bold tracking-[0.2em]">
                            <span className="bg-[#1e293b] px-4 text-slate-500">Or continue with</span>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <button className="flex-center gap-3 py-3 border border-slate-800 rounded-xl hover:bg-slate-900 transition-all text-xs font-bold text-slate-300">
                            <Github size={16} />
                            <span>Github</span>
                        </button>
                        <button className="flex-center gap-3 py-3 border border-slate-800 rounded-xl hover:bg-slate-900 transition-all text-xs font-bold text-slate-300">
                            <svg className="w-4 h-4" viewBox="0 0 24 24">
                                <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                                <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                            </svg>
                            <span>Google</span>
                        </button>
                    </div>

                    <p className="text-center text-slate-500 text-[10px] font-medium leading-relaxed">
                        By signing in, you agree to our <br />
                        <a href="#" className="text-slate-400 hover:text-indigo-400 transition-colors underline decoration-slate-800">Terms of Service</a> and <a href="#" className="text-slate-400 hover:text-indigo-400 transition-colors underline decoration-slate-800">Privacy Policy</a>.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Login;
