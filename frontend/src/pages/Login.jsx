import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import { Shield, Gavel, Briefcase, User as UserIcon, Lock, AtSign, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

const Login = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState('lawyer');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const { data } = await api.post('/api/auth/login', { username, password });
            localStorage.setItem('token', data.access_token);
            localStorage.setItem('user', JSON.stringify(data.user));

            navigate('/');
        } catch (err) {
            alert(err.response?.data?.message || 'Authentication Failed. Please check your credentials.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-6 bg-cream/30 dark:bg-slate-950 relative overflow-hidden font-['Public_Sans']">
            {/* Background Texture */}
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/notebook.png')] opacity-20 pointer-events-none"></div>

            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                className="w-full max-w-[1400px] flex flex-col md:flex-row bg-white dark:bg-slate-900 rounded-2xl shadow-3xl overflow-hidden border border-slate-200 dark:border-slate-800 relative z-10"
            >
                {/* Brand Side (Navy/Gold) */}
                <div className="w-full md:w-5/12 bg-navy-deep p-16 text-white relative overflow-hidden flex flex-col justify-between">
                    <div className="absolute top-0 right-0 w-80 h-80 bg-primary/10 blur-[100px] rounded-full -mr-40 -mt-40"></div>
                    <div className="absolute bottom-0 left-0 w-64 h-64 bg-primary/5 blur-[80px] rounded-full -ml-32 -mb-32"></div>

                    <div className="relative z-10">
                        <div className="flex items-center gap-3 mb-10">
                            <div className="bg-primary/30 p-3 rounded-lg border-2 border-primary">
                                <span className="material-symbols-outlined text-primary text-4xl">gavel</span>
                            </div>
                            <h1 className="font-serif text-3xl font-bold tracking-tight">Nyay<span className="text-primary italic">Setu</span></h1>
                        </div>

                        <h2 className="font-serif text-4xl font-bold leading-tight mb-6">
                            Justice <br />
                            <span className="text-primary italic">Synchronized</span>
                        </h2>

                        <p className="text-slate-400 font-serif italic text-lg leading-relaxed max-w-xs border-l border-primary/30 pl-6">
                            "Empowering the judiciary with semantic intelligence and case prioritization for a swifter tomorrow."
                        </p>
                    </div>

                    <div className="relative z-10 mt-12 space-y-8">
                        <div className="space-y-4">
                            <div className="flex items-center gap-4 group cursor-default">
                                <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center border border-white/10 group-hover:border-primary/50 transition-colors">
                                    <span className="material-symbols-outlined text-sm text-primary">priority_high</span>
                                </div>
                                <div>
                                    <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-300">Intelligent Prioritization</p>
                                    <p className="text-[9px] text-slate-500 font-serif italic">Semantic Case Ranking Engine</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-4 group cursor-default">
                                <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center border border-white/10 group-hover:border-primary/50 transition-colors">
                                    <span className="material-symbols-outlined text-sm text-primary">analytics</span>
                                </div>
                                <div>
                                    <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-300">Statutory Sync</p>
                                    <p className="text-[9px] text-slate-500 font-serif italic">Real-time Law Impact Analysis</p>
                                </div>
                            </div>
                        </div>

                        <div className="pt-8 border-t border-white/5 flex items-center gap-3 opacity-60">
                            <span className="material-symbols-outlined text-xs">verified_user</span>
                            <p className="text-[9px] font-bold text-slate-500 uppercase tracking-[0.3em]">Judiciary Grade Authorization</p>
                        </div>
                    </div>
                </div>

                {/* Form and Status Side */}
                <div className="w-full md:w-7/12 flex flex-col md:flex-row">
                    {/* Form Section */}
                    <div className="w-full p-12 md:p-20 flex flex-col justify-center bg-cream/20 dark:bg-slate-900 border-l border-slate-100 dark:border-slate-800">
                    <div className="mb-12">
                        <h3 className="font-serif text-3xl font-bold text-navy-deep dark:text-white mb-2">System Authorization</h3>
                        <p className="text-slate-500 text-lg font-serif italic">Specify your jurisdictional role to initialize the session.</p>
                    </div>

                    <form onSubmit={handleLogin} className="space-y-8">
                        <div className="grid grid-cols-3 gap-4">
                            <RoleTab active={role === 'judge'} onClick={() => setRole('judge')} icon="gavel" label="Judge" />
                            <RoleTab active={role === 'lawyer'} onClick={() => setRole('lawyer')} icon="work" label="Lawyer" />
                            <RoleTab active={role === 'citizen'} onClick={() => setRole('citizen')} icon="person" label="Citizen" />
                        </div>

                        <div className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1 block">Central Identification Number</label>
                                <div className="relative group">
                                    <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors text-xl">badge</span>
                                    <input
                                        type="text"
                                        value={username}
                                        onChange={e => setUsername(e.target.value)}
                                        className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg pl-12 pr-4 py-4 text-sm outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all font-serif dark:text-white"
                                        placeholder="Enter Registered ID..."
                                        required
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1 block">Cryptographic Secure Token</label>
                                <div className="relative group">
                                    <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors text-xl">key</span>
                                    <input
                                        type="password"
                                        value={password}
                                        onChange={e => setPassword(e.target.value)}
                                        className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg pl-12 pr-4 py-4 text-sm outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all font-serif dark:text-white"
                                        placeholder="••••••••"
                                        required
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-col gap-6">
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-navy-deep h-14 rounded-lg flex items-center justify-center gap-3 text-white font-bold text-[11px] uppercase tracking-[0.2em] shadow-xl hover:bg-slate-800 hover:shadow-primary/10 transition-all active:scale-[0.98] disabled:opacity-50 border border-primary/20"
                            >
                                {loading ? (
                                    <div className="w-5 h-5 border-2 border-primary/30 border-t-primary rounded-full animate-spin"></div>
                                ) : (
                                    <>
                                        Establish Link <span className="material-symbols-outlined text-sm">arrow_forward</span>
                                    </>
                                )}
                            </button>

                            <div className="flex items-center justify-center gap-4 text-[11px] font-bold uppercase tracking-widest text-slate-400 px-4">
                                <div className="h-[1px] bg-slate-200 dark:bg-slate-800 flex-grow"></div>
                                <span>OR</span>
                                <div className="h-[1px] bg-slate-200 dark:bg-slate-800 flex-grow"></div>
                            </div>

                            <Link
                                to="/register"
                                className="w-full h-14 rounded-lg flex items-center justify-center gap-3 text-navy-deep dark:text-primary font-bold text-[11px] uppercase tracking-[0.2em] border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all"
                            >
                                Register New Profile <span className="material-symbols-outlined text-sm">person_add</span>
                            </Link>
                        </div>
                    </form>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

const RoleTab = ({ active, onClick, icon, label }) => (
    <button
        type="button"
        onClick={onClick}
        className={`p-4 rounded-lg border transition-all flex flex-col items-center gap-3 group relative overflow-hidden ${active
                ? 'border-primary bg-primary/5 shadow-inner'
                : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 hover:border-primary/50'
            }`}
    >
        <div className={`transition-all ${active ? 'text-primary' : 'text-slate-400 group-hover:text-primary'}`}>
            <span className="material-symbols-outlined text-2xl">{icon}</span>
        </div>
        <span className={`text-[9px] font-bold uppercase tracking-widest ${active ? 'text-primary' : 'text-slate-400 group-hover:text-slate-600'}`}>
            {label}
        </span>
    </button>
);

export default Login;
