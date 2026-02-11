import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import { ClerkProvider } from '@clerk/clerk-react';

const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

if (!PUBLISHABLE_KEY || !PUBLISHABLE_KEY.startsWith('pk_')) {
    ReactDOM.createRoot(document.getElementById('root')!).render(
        <React.StrictMode>
            <div className="min-h-screen bg-slate-950 flex flex-center p-6 text-center">
                <div className="max-w-md glass p-10 rounded-3xl border border-red-500/20">
                    <h1 className="text-2xl font-bold text-red-400 mb-4">Configuration Missing</h1>
                    <p className="text-slate-400 leading-relaxed mb-6">
                        The <strong>Clerk Publishable Key</strong> is either missing or invalid.
                        Please ensure <code>VITE_CLERK_PUBLISHABLE_KEY</code> starts with <code>pk_</code> in your Vercel settings.
                    </p>
                    <div className="text-xs text-slate-500 font-mono bg-black/20 p-4 rounded-xl text-left border border-white/5">
                        1. Go to Vercel Settings<br />
                        2. Environment Variables<br />
                        3. Add: VITE_CLERK_PUBLISHABLE_KEY<br />
                        4. Value: pk_test_...
                    </div>
                </div>
            </div>
        </React.StrictMode>
    );
} else {
    ReactDOM.createRoot(document.getElementById('root')!).render(
        <React.StrictMode>
            <ClerkProvider publishableKey={PUBLISHABLE_KEY}>
                <App />
            </ClerkProvider>
        </React.StrictMode>,
    );
}
