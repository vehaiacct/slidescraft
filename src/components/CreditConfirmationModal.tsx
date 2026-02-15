import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, X, AlertCircle } from 'lucide-react';

interface CreditConfirmationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    slideCount: number;
    currentBalance: number;
}

const CreditConfirmationModal: React.FC<CreditConfirmationModalProps> = ({
    isOpen,
    onClose,
    onConfirm,
    slideCount,
    currentBalance
}) => {
    const cost = slideCount; // 1 credit per slide
    const hasEnoughCredits = currentBalance >= cost;

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                    />

                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 10 }}
                        className="relative w-full max-w-sm glass p-6 rounded-2xl shadow-xl border border-white/10"
                    >
                        <div className="flex items-center justify-between mb-6">
                            <div className="w-10 h-10 bg-indigo-600/20 rounded-xl flex items-center justify-center text-indigo-400">
                                <Sparkles size={20} />
                            </div>
                            <button
                                onClick={onClose}
                                className="p-2 hover:bg-white/10 rounded-lg text-slate-400 transition-colors"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <h3 className="text-xl font-bold text-white mb-2">Generate Presentation?</h3>
                        <p className="text-slate-400 text-sm leading-relaxed mb-6">
                            This action will use <strong className="text-white">{cost} credits</strong> from your balance to generate {slideCount} slides.
                        </p>

                        <div className="bg-white/5 rounded-xl p-4 mb-6 border border-white/5">
                            <div className="flex justify-between items-center text-sm mb-2">
                                <span className="text-slate-400">Available Balance</span>
                                <span className="font-bold text-white">{currentBalance}</span>
                            </div>
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-slate-400">Cost</span>
                                <span className="font-bold text-indigo-400">-{cost}</span>
                            </div>
                            <div className="my-2 border-t border-white/5" />
                            <div className="flex justify-between items-center text-sm font-bold">
                                <span className="text-white">Remaining</span>
                                <span className={`${hasEnoughCredits ? 'text-emerald-400' : 'text-red-400'}`}>
                                    {currentBalance - cost}
                                </span>
                            </div>
                        </div>

                        {!hasEnoughCredits && (
                            <div className="flex items-start gap-2 text-red-400 text-xs bg-red-500/10 p-3 rounded-lg border border-red-500/20 mb-4">
                                <AlertCircle size={14} className="mt-0.5" />
                                <span>Insufficient credits. Please top up your balance to continue.</span>
                            </div>
                        )}

                        <div className="flex gap-3">
                            <button
                                onClick={onClose}
                                className="flex-1 px-4 py-3 bg-white/5 hover:bg-white/10 text-white rounded-xl font-bold text-sm transition-colors border border-white/5"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={onConfirm}
                                disabled={!hasEnoughCredits}
                                className="flex-1 px-4 py-3 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl font-bold text-sm transition-all shadow-lg shadow-indigo-600/20"
                            >
                                Confirm
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default CreditConfirmationModal;
