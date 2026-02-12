import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, User, Database, X, ChevronRight, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { transferCredits } from '../services/user';

interface TransferCreditsModalProps {
    isOpen: boolean;
    onClose: () => void;
    currentBalance: number;
    senderId: string;
    onSuccess: () => void;
}

const TransferCreditsModal: React.FC<TransferCreditsModalProps> = ({
    isOpen, onClose, currentBalance, senderId, onSuccess
}) => {
    const [receiverUsername, setReceiverUsername] = useState('');
    const [amount, setAmount] = useState<number>(0);
    const [isLoading, setIsLoading] = useState(false);
    const [status, setStatus] = useState<{ type: 'success' | 'error', message: string } | null>(null);

    const handleTransfer = async (e: React.FormEvent) => {
        e.preventDefault();
        if (amount <= 0) return;
        if (amount > currentBalance) {
            setStatus({ type: 'error', message: 'Insufficient balance.' });
            return;
        }

        setIsLoading(true);
        setStatus(null);

        try {
            const result = await transferCredits(senderId, receiverUsername, amount);
            if (result.success) {
                setStatus({ type: 'success', message: `Sent ${amount} credits to @${receiverUsername}!` });
                onSuccess();
                setTimeout(() => {
                    onClose();
                    setStatus(null);
                    setReceiverUsername('');
                    setAmount(0);
                }, 2000);
            } else {
                setStatus({ type: 'error', message: result.message });
            }
        } catch (err) {
            setStatus({ type: 'error', message: 'Transfer failed. Please try again.' });
        } finally {
            setIsLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex-center bg-slate-950/80 backdrop-blur-xl p-4">
            <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                className="w-full max-w-md bg-slate-900 border border-white/10 rounded-[2.5rem] p-8 shadow-2xl relative overflow-hidden"
            >
                {/* Decoration */}
                <div className="absolute -top-24 -right-24 w-48 h-48 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />

                <div className="flex justify-between items-center mb-8">
                    <div className="w-12 h-12 bg-indigo-600/20 rounded-2xl flex-center">
                        <Send className="text-indigo-400" size={24} />
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full text-slate-500 transition-colors">
                        <X size={24} />
                    </button>
                </div>

                <div className="mb-8">
                    <h2 className="text-2xl font-black text-white tracking-tight mb-2">Transfer Credits</h2>
                    <p className="text-slate-400 text-sm">Send your credits to another teacher by their username.</p>
                </div>

                <div className="bg-slate-800/50 rounded-2xl p-4 mb-8 border border-white/5 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Database className="text-indigo-400" size={16} />
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Available Balance</span>
                    </div>
                    <span className="text-xl font-black text-white">{currentBalance} <span className="text-indigo-400">CR</span></span>
                </div>

                <form onSubmit={handleTransfer} className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-2">Receiver Username</label>
                        <div className="relative">
                            <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                            <input
                                type="text"
                                value={receiverUsername}
                                onChange={(e) => setReceiverUsername(e.target.value.replace(/[^a-zA-Z0-9_]/g, ''))}
                                placeholder="Username (e.g. JoyTech)"
                                className="w-full bg-slate-950/50 border border-white/5 rounded-2xl py-4 pl-12 pr-6 text-white placeholder:text-slate-600 focus:border-indigo-500 transition-all outline-none"
                                required
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-2">Amount to Send</label>
                        <div className="relative">
                            <Database className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                            <input
                                type="number"
                                min="1"
                                max={currentBalance}
                                value={amount || ''}
                                onChange={(e) => setAmount(parseInt(e.target.value) || 0)}
                                placeholder="0"
                                className="w-full bg-slate-950/50 border border-white/5 rounded-2xl py-4 pl-12 pr-6 text-white placeholder:text-slate-600 focus:border-indigo-500 transition-all outline-none font-bold"
                                required
                            />
                        </div>
                    </div>

                    <AnimatePresence>
                        {status && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className={`p-4 rounded-xl flex items-center gap-3 ${status.type === 'success' ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'}`}
                            >
                                {status.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
                                <span className="text-xs font-semibold">{status.message}</span>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <button
                        type="submit"
                        disabled={isLoading || amount <= 0 || !receiverUsername}
                        className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-black text-sm tracking-widest uppercase transition-all shadow-lg shadow-indigo-600/30 disabled:opacity-50 disabled:cursor-not-allowed flex-center gap-3"
                    >
                        {isLoading ? (
                            <Loader2 className="animate-spin" size={20} />
                        ) : (
                            <>
                                <span>Confirm Transfer</span>
                                <ChevronRight size={18} />
                            </>
                        )}
                    </button>

                    <p className="text-center text-[10px] text-slate-600 font-bold uppercase tracking-[0.2em] pt-2">
                        All transfers are final and irreversible.
                    </p>
                </form>
            </motion.div>
        </div>
    );
};

export default TransferCreditsModal;
