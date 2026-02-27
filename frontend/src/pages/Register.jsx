import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { Shield, Gavel, Briefcase, User as UserIcon, Lock, AtSign, ArrowRight, UserPlus, Mail } from 'lucide-react';
import { motion } from 'framer-motion';

const Register = () => {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [fullName, setFullName] = useState('');
    const [role, setRole] = useState('citizen');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleRegister = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await axios.post('/api/auth/register', {
                username,
                email,
                password,
                role,
                full_name: fullName
            });
            alert('Registration Successful! Please login.');
            navigate('/login');
        } catch (err) {
            alert(err.response?.data?.message || 'Registration Failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-6 bg-cream/30 dark:bg-slate-950 relative overflow-hidden font-['Public_Sans']">
            {/* Background Texture */}
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/notebook.png')] opacity-20 pointer-events-none"></div>

            <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6 }}
                className="w-full max-w-[1100px] flex flex-col md:flex-row bg-white dark:bg-slate-900 rounded-2xl shadow-3xl overflow-hidden border border-slate-200 dark:border-slate-800 relative z-10"
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
                            Join the <br />
                            <span className="text-primary italic">Digital Bench</span>
                        </h2>

                        <p className="text-slate-400 font-serif italic text-base leading-relaxed max-w-xs border-l border-primary/30 pl-6">
                            "Secure your place in the future of judicial management. Specialized access for every legal stakeholder."
                        </p>
                    </div>

                    <div className="relative z-10 mt-12 space-y-8">
                        <div className="space-y-4">
                            <div className="flex items-center gap-4 group cursor-default">
                                <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center border border-white/10 group-hover:border-primary/50 transition-colors">
                                    <span className="material-symbols-outlined text-sm text-primary">how_to_reg</span>
                                </div>
                                <div>
                                    <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-300">Identity Verification</p>
                                    <p className="text-[9px] text-slate-500 font-serif italic">Secure Jurisdictional Enrollment</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-4 group cursor-default">
                                <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center border border-white/10 group-hover:border-primary/50 transition-colors">
                                    <span className="material-symbols-outlined text-sm text-primary">security</span>
                                </div>
                                <div>
                                    <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-300">Data Integrity</p>
                                    <p className="text-[9px] text-slate-500 font-serif italic">End-to-End Encrypted Sessions</p>
                                </div>
                            </div>
                        </div>

                        <div className="pt-8 border-t border-white/5 flex items-center gap-3 opacity-60">
                            <span className="material-symbols-outlined text-xs">verified_user</span>
                            <p className="text-[9px] font-bold text-slate-500 uppercase tracking-[0.3em]">Institutional Grade Security</p>
                        </div>
                    </div>
                </div>

                {/* Form Side */}
                <div className="w-full md:w-7/12 p-12 md:p-16 flex flex-col justify-center bg-cream/20 dark:bg-slate-900 border-l border-slate-100 dark:border-slate-800">
                    <div className="mb-8">
                        <h3 className="font-serif text-3xl font-bold text-navy-deep dark:text-white mb-2">Create Profile</h3>
                        <p className="text-slate-500 text-base font-serif italic">Enroll in the decentralized legal infrastructure.</p>
                    </div>

                    <form onSubmit={handleRegister} className="space-y-6">
                        <div className="grid grid-cols-3 gap-4">
                            <RoleTab active={role === 'judge'} onClick={() => setRole('judge')} icon="gavel" label="Judge" />
                            <RoleTab active={role === 'lawyer'} onClick={() => setRole('lawyer')} icon="work" label="Lawyer" />
                            <RoleTab active={role === 'citizen'} onClick={() => setRole('citizen')} icon="person" label="Citizen" />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <InputField
                                label="Full Legal Name"
                                icon="person"
                                value={fullName}
                                onChange={e => setFullName(e.target.value)}
                                placeholder="Enter full name..."
                            />
                            <InputField
                                label="System identifier"
                                icon="badge"
                                value={username}
                                onChange={e => setUsername(e.target.value)}
                                placeholder="Unique ID..."
                            />
                        </div>

                        <InputField
                            label="Institutional Email"
                            icon="mail"
                            type="email"
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            placeholder="verified@email.gov"
                        />

                        <InputField
                            label="Secure passphrase"
                            icon="key"
                            type="password"
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            placeholder="••••••••"
                        />

                        <div className="flex flex-col gap-6 pt-4">
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-navy-deep h-14 rounded-lg flex items-center justify-center gap-3 text-white font-bold text-[11px] uppercase tracking-[0.2em] shadow-xl hover:bg-slate-800 hover:shadow-primary/10 transition-all active:scale-[0.98] disabled:opacity-50 border border-primary/20"
                            >
                                {loading ? (
                                    <div className="w-5 h-5 border-2 border-primary/30 border-t-primary rounded-full animate-spin"></div>
                                ) : (
                                    <>
                                        Initialize Account <span className="material-symbols-outlined text-sm">person_add</span>
                                    </>
                                )}
                            </button>

                            <div className="flex items-center justify-center gap-4 text-[11px] font-bold uppercase tracking-widest text-slate-400 px-4">
                                <div className="h-[1px] bg-slate-200 dark:bg-slate-800 flex-grow"></div>
                                <span>OR</span>
                                <div className="h-[1px] bg-slate-200 dark:bg-slate-800 flex-grow"></div>
                            </div>

                            <Link
                                to="/login"
                                className="w-full h-14 rounded-lg flex items-center justify-center gap-3 text-navy-deep dark:text-primary font-bold text-[11px] uppercase tracking-[0.2em] border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all"
                            >
                                Existing Profile Login <span className="material-symbols-outlined text-sm">login</span>
                            </Link>
                        </div>
                    </form>
                </div>
            </motion.div>
        </div>
    );
};

const InputField = ({ label, icon, value, onChange, placeholder, type = "text" }) => (
    <div className="space-y-2 relative group">
        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1 block">{label}</label>
        <div className="relative">
            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors text-xl">
                {icon}
            </span>
            <input
                type={type}
                value={value}
                onChange={onChange}
                className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg pl-12 pr-4 py-3.5 text-sm outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all font-serif dark:text-white"
                placeholder={placeholder}
                required
            />
        </div>
    </div>
);

const RoleTab = ({ active, onClick, icon, label }) => (
    <button
        type="button"
        onClick={onClick}
        className={`p-4 rounded-lg border transition-all flex flex-col items-center gap-2 group relative overflow-hidden ${active
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

export default Register;
