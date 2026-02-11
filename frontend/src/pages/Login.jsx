import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
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
            const { data } = await axios.post('/api/auth/login', { username, password });
            localStorage.setItem('token', data.access_token);
            localStorage.setItem('user', JSON.stringify(data.user));
            navigate('/');
        } catch (err) {
            alert('Authentication Failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-6 bg-[#F8FAFC] relative overflow-hidden font-['Outfit']">
            {/* Background Mesh */}
            <div className="absolute top-0 right-0 -z-10 w-[600px] h-[600px] bg-blue-100/50 blur-[130px] rounded-full opacity-60"></div>
            <div className="absolute bottom-0 left-0 -z-10 w-[500px] h-[500px] bg-indigo-100/50 blur-[120px] rounded-full opacity-50"></div>

            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="w-full max-w-[1000px] flex flex-col md:flex-row bg-white rounded-[3rem] shadow-3xl overflow-hidden border border-white/20 relative z-10"
            >
                {/* Brand Side */}
                <div className="w-full md:w-5/12 bg-slate-900 p-12 text-white relative overflow-hidden flex flex-col justify-between">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/20 blur-[100px] rounded-full -mr-32 -mt-32"></div>

                    <div className="relative z-10">
                        <div className="bg-blue-600 w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-600/30 mb-8">
                            <Shield className="w-8 h-8 text-white" />
                        </div>
                        <h1 className="text-4xl font-black tracking-tight leading-tight">Nyay<span className="text-blue-500">Setu</span></h1>
                        <p className="text-slate-400 mt-4 font-medium text-sm leading-relaxed max-w-xs">
                            Unified Judicial Support Infrastructure powered by Proactive Legal Intelligence.
                        </p>
                    </div>

                    <div className="relative z-10 mt-20">
                        <div className="space-y-6">
                            <div className="flex items-center gap-4">
                                <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center border border-white/10 uppercase text-[10px] font-black text-blue-400">01</div>
                                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-300">Neural Case Correlation</p>
                            </div>
                            <div className="flex items-center gap-4">
                                <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center border border-white/10 uppercase text-[10px] font-black text-blue-400">02</div>
                                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-300">Statutory Impact Sync</p>
                            </div>
                        </div>
                        <div className="mt-12 pt-12 border-t border-white/5">
                            <p className="text-[9px] font-bold text-slate-500 uppercase tracking-[0.3em]">Institutional Secure Access</p>
                        </div>
                    </div>
                </div>

                {/* Form Side */}
                <div className="w-full md:w-7/12 p-12 md:p-16">
                    <div className="mb-10">
                        <h2 className="text-3xl font-black text-slate-900 tracking-tight">System Authorization</h2>
                        <p className="text-slate-500 text-sm mt-2 font-medium italic">Please select your access tier to initialize session.</p>
                    </div>

                    <form onSubmit={handleLogin} className="space-y-8">
                        <div className="grid grid-cols-3 gap-4">
                            <RoleTab active={role === 'judge'} onClick={() => setRole('judge')} icon={<Gavel className="w-5 h-5" />} label="Judge" />
                            <RoleTab active={role === 'lawyer'} onClick={() => setRole('lawyer')} icon={<Briefcase className="w-5 h-5" />} label="Lawyer" />
                            <RoleTab active={role === 'citizen'} onClick={() => setRole('citizen')} icon={<UserIcon className="w-5 h-5" />} label="Citizen" />
                        </div>

                        <div className="space-y-6">
                            <div className="relative group">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-2 block">Central Identifier</label>
                                <div className="relative">
                                    <AtSign className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
                                    <input
                                        type="text"
                                        value={username}
                                        onChange={e => setUsername(e.target.value)}
                                        className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-12 pr-4 py-4 text-sm outline-none focus:ring-4 focus:ring-blue-600/5 focus:border-blue-600 transition-all font-medium"
                                        placeholder="Enter registered ID..."
                                        required
                                    />
                                </div>
                            </div>
                            <div className="relative group">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-2 block">Secure Token</label>
                                <div className="relative">
                                    <Lock className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
                                    <input
                                        type="password"
                                        value={password}
                                        onChange={e => setPassword(e.target.value)}
                                        className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-12 pr-4 py-4 text-sm outline-none focus:ring-4 focus:ring-blue-600/5 focus:border-blue-600 transition-all font-medium"
                                        placeholder="••••••••"
                                        required
                                    />
                                </div>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-gradient-to-r from-blue-600 to-indigo-700 h-16 rounded-[1.5rem] flex items-center justify-center gap-3 text-white font-black text-sm uppercase tracking-widest shadow-2xl shadow-blue-600/30 hover:shadow-indigo-600/40 hover:-translate-y-1 transition-all active:scale-95 disabled:opacity-50"
                        >
                            {loading ? (
                                <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                            ) : (
                                <>
                                    Establish Link <ArrowRight className="w-5 h-5" />
                                </>
                            )}
                        </button>
                    </form>
                </div>
            </motion.div>
        </div>
    );
};

const RoleTab = ({ active, onClick, icon, label }) => (
    <button
        type="button"
        onClick={onClick}
        className={`p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-3 group relative overflow-hidden ${active ? 'border-blue-600 bg-blue-50/50 shadow-inner' : 'border-slate-100 bg-white hover:border-slate-200'
            }`}
    >
        {active && <motion.div layoutId="roleGlow" className="absolute inset-0 bg-blue-400/5 blur-xl -z-10" />}
        <div className={`p-2.5 rounded-xl transition-all ${active ? 'bg-blue-600 text-white shadow-lg' : 'bg-slate-50 text-slate-400 group-hover:text-slate-600'}`}>
            {icon}
        </div>
        <span className={`text-[10px] font-black uppercase tracking-widest ${active ? 'text-blue-700' : 'text-slate-400'}`}>{label}</span>
    </button>
);

export default Login;
