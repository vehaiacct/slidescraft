import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Users, Search, Edit3, Save, X, Database, Shield, ArrowUpDown } from 'lucide-react';
import { supabase, UserProfile } from '../services/supabase';

interface AdminDashboardProps {
    isOpen: boolean;
    onClose: () => void;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ isOpen, onClose }) => {
    const [users, setUsers] = useState<UserProfile[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [editingUserId, setEditingUserId] = useState<string | null>(null);
    const [editValue, setEditValue] = useState<number>(0);

    const fetchUsers = async () => {
        setIsLoading(true);
        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .order('credits', { ascending: false });

        if (data) setUsers(data);
        setIsLoading(false);
    };

    useEffect(() => {
        if (isOpen) fetchUsers();
    }, [isOpen]);

    const handleUpdateCredits = async (userId: string) => {
        const { error } = await supabase
            .from('profiles')
            .update({ credits: editValue })
            .eq('id', userId);

        if (!error) {
            setUsers(prev => prev.map(u => u.id === userId ? { ...u, credits: editValue } : u));
            setEditingUserId(null);
        }
    };

    if (!isOpen) return null;

    const filteredUsers = users.filter(u =>
        u.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.email.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="fixed inset-0 z-[110] flex flex-col bg-slate-950/95 backdrop-blur-2xl">
            <header className="h-20 border-b border-white/5 flex items-center justify-between px-8 md:px-12">
                <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-indigo-600 rounded-xl flex-center shadow-lg shadow-indigo-600/20">
                        <Shield className="text-white" size={20} />
                    </div>
                    <div>
                        <h2 className="text-xl font-black text-white tracking-tight">Admin Console</h2>
                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest leading-none mt-1">Manage Users & Credits</p>
                    </div>
                </div>

                <div className="flex items-center gap-6">
                    <div className="relative hidden md:block">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                        <input
                            type="text"
                            placeholder="Find user..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="bg-white/5 border border-white/10 rounded-xl py-2 pl-12 pr-6 text-sm text-white placeholder:text-slate-600 outline-none focus:border-indigo-500 transition-all w-64"
                        />
                    </div>
                    <button onClick={onClose} className="p-3 hover:bg-white/5 rounded-2xl text-slate-400">
                        <X size={24} />
                    </button>
                </div>
            </header>

            <main className="flex-grow overflow-y-auto p-8 md:p-12">
                <div className="max-w-6xl mx-auto">
                    <div className="glass rounded-[2rem] border border-white/5 overflow-hidden shadow-2xl">
                        <table className="w-full text-left">
                            <thead className="bg-white/[0.02] border-b border-white/5">
                                <tr>
                                    <th className="px-8 py-5 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Username</th>
                                    <th className="px-8 py-5 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Email</th>
                                    <th className="px-8 py-5 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                                        <div className="flex items-center gap-2 cursor-pointer hover:text-indigo-400 transition-colors">
                                            Credits <ArrowUpDown size={12} />
                                        </div>
                                    </th>
                                    <th className="px-8 py-5 text-[10px] font-bold text-slate-500 uppercase tracking-widest text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {isLoading ? (
                                    <tr>
                                        <td colSpan={4} className="px-8 py-20 text-center">
                                            <div className="w-8 h-8 border-3 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin mx-auto" />
                                        </td>
                                    </tr>
                                ) : filteredUsers.length === 0 ? (
                                    <tr>
                                        <td colSpan={4} className="px-8 py-20 text-center text-slate-500 font-medium italic">
                                            No users found matching your search.
                                        </td>
                                    </tr>
                                ) : filteredUsers.map((user) => (
                                    <motion.tr
                                        key={user.id}
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        className="hover:bg-white/[0.01] transition-colors group"
                                    >
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 bg-indigo-500/10 text-indigo-400 rounded-lg flex-center font-black text-xs">
                                                    {user.username.charAt(0).toUpperCase()}
                                                </div>
                                                <span className="font-bold text-white tracking-tight">@{user.username}</span>
                                                {user.is_admin && <Shield size={12} className="text-green-400" />}
                                            </div>
                                        </td>
                                        <td className="px-8 py-6 text-sm text-slate-400">{user.email}</td>
                                        <td className="px-8 py-6">
                                            {editingUserId === user.id ? (
                                                <div className="flex items-center gap-2">
                                                    <input
                                                        type="number"
                                                        value={editValue}
                                                        onChange={(e) => setEditValue(parseInt(e.target.value) || 0)}
                                                        className="w-20 bg-slate-950 border border-indigo-500 rounded-lg py-1 px-3 text-white text-sm outline-none"
                                                        autoFocus
                                                    />
                                                    <button onClick={() => handleUpdateCredits(user.id)} className="p-1 hover:text-green-400 transition-colors">
                                                        <Save size={16} />
                                                    </button>
                                                </div>
                                            ) : (
                                                <div className="flex items-center gap-3">
                                                    <span className="font-black text-lg text-white">{user.credits}</span>
                                                    <Database size={14} className="text-indigo-500/50" />
                                                </div>
                                            )}
                                        </td>
                                        <td className="px-8 py-6 text-right">
                                            <button
                                                onClick={() => {
                                                    setEditingUserId(user.id);
                                                    setEditValue(user.credits);
                                                }}
                                                className="p-2 hover:bg-indigo-500/10 rounded-lg text-slate-500 hover:text-indigo-400 transition-all opacity-0 group-hover:opacity-100"
                                            >
                                                <Edit3 size={18} />
                                            </button>
                                        </td>
                                    </motion.tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <div className="mt-8 flex justify-between items-center text-[10px] font-bold text-slate-600 uppercase tracking-widest px-4">
                        <p>Total users: {users.length}</p>
                        <p>Philippine Standard Time: {new Date().toLocaleTimeString()}</p>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default AdminDashboard;
