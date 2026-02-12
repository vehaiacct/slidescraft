import { useState } from 'react';
import { motion } from 'framer-motion';
import { User, Check, AlertCircle, Loader2 } from 'lucide-react';
import { isUsernameAvailable, createUserProfile } from '../services/user';

interface OnboardingProps {
    userId: string;
    email: string;
    onComplete: (profile: any) => void;
}

const Onboarding: React.FC<OnboardingProps> = ({ userId, email, onComplete }) => {
    const [username, setUsername] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!username || username.length < 3) {
            setError('Username must be at least 3 characters.');
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            const available = await isUsernameAvailable(username);
            if (!available) {
                setError('Username is already taken.');
                setIsLoading(false);
                return;
            }

            const profile = await createUserProfile(userId, email, username.toLowerCase());
            if (profile) {
                onComplete(profile);
            } else {
                setError('Failed to create profile. Please check if Supabase is connected.');
            }
        } catch (err) {
            setError('An error occurred. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex-center bg-slate-950/90 backdrop-blur-xl p-4">
            <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                className="w-full max-w-md bg-slate-900 border border-white/10 rounded-[2rem] p-8 md:p-10 shadow-2xl"
            >
                <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-indigo-600 rounded-2xl flex-center mx-auto mb-6 shadow-lg shadow-indigo-500/20">
                        <User className="text-white" size={32} />
                    </div>
                    <h2 className="text-3xl font-black text-white tracking-tight mb-2">Claim Your Identity</h2>
                    <p className="text-slate-400 text-sm">Choose a unique username to start creating and sharing credits with colleagues.</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-2">
                        <div className="relative group">
                            <input
                                type="text"
                                value={username}
                                onChange={(e) => setUsername(e.target.value.replace(/[^a-zA-Z0-9_]/g, ''))}
                                placeholder="Enter username (e.g. TeacherJoy)"
                                className="w-full bg-slate-800/50 border border-white/5 rounded-2xl py-4 px-6 text-white placeholder:text-slate-500 focus:border-indigo-500 focus:bg-slate-800 transition-all outline-none"
                                disabled={isLoading}
                            />
                        </div>
                        {error && (
                            <div className="flex items-center gap-2 text-red-400 text-xs px-2 animate-shake">
                                <AlertCircle size={14} />
                                <span>{error}</span>
                            </div>
                        )}
                        <p className="text-[10px] text-slate-500 px-2 uppercase tracking-widest font-bold">A-Z, 0-9, and underscores only</p>
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading || !username}
                        className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-black text-sm tracking-widest uppercase transition-all shadow-lg shadow-indigo-600/30 disabled:opacity-50 disabled:cursor-not-allowed flex-center gap-3"
                    >
                        {isLoading ? (
                            <Loader2 className="animate-spin" size={20} />
                        ) : (
                            <>
                                <span>Start Generation</span>
                                <Check size={18} />
                            </>
                        )}
                    </button>

                    <p className="text-center text-[10px] text-slate-600 font-bold uppercase tracking-[0.2em] pt-4">
                        New users receive <span className="text-indigo-400">5 FREE CREDITS</span>
                    </p>
                </form>
            </motion.div>
        </div>
    );
};

export default Onboarding;
