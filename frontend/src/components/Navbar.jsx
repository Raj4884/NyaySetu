import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Shield, Home, Briefcase, Book, LogOut, User as UserIcon } from 'lucide-react';
import { motion } from 'framer-motion';

const Navbar = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const user = JSON.parse(localStorage.getItem('user'));

    const handleLogout = () => {
        localStorage.clear();
        navigate('/login');
    };

    const NavLink = ({ to, icon: Icon, label }) => {
        const active = location.pathname === to;
        return (
            <Link to={to} className="relative group">
                <div className={`flex items-center gap-2.5 px-6 py-2.5 rounded-2xl transition-all duration-300 ${active ? 'text-white' : 'text-slate-500 hover:text-slate-900'
                    }`}>
                    {active && (
                        <motion.div
                            layoutId="activeNav"
                            className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl shadow-lg shadow-blue-600/30 -z-10"
                        />
                    )}
                    <Icon className={`w-4 h-4 ${active ? 'text-white' : 'text-slate-400 group-hover:text-blue-600'}`} />
                    <span className="text-[11px] font-black uppercase tracking-[0.1em]">{label}</span>
                </div>
            </Link>
        );
    };

    return (
        <motion.nav
            initial={{ y: -100, x: '-50%' }}
            animate={{ y: 0, x: '-50%' }}
            className="fixed top-8 left-1/2 z-50 w-full max-w-6xl px-6"
        >
            <div className="glass rounded-[2.5rem] flex items-center justify-between p-3 px-8 border-white/60 shadow-2xl shadow-slate-900/5">
                <div className="flex items-center gap-4">
                    <div className="bg-gradient-to-br from-blue-600 to-indigo-700 p-2.5 rounded-2xl shadow-lg shadow-blue-600/20">
                        <Shield className="w-6 h-6 text-white" />
                    </div>
                    <span className="font-black text-2xl tracking-tighter text-slate-900">Nyay<span className="text-blue-600">Setu</span></span>
                </div>

                <div className="hidden lg:flex items-center gap-3 bg-slate-50/50 p-1.5 rounded-[2rem] border border-slate-100">
                    <NavLink to="/" icon={Home} label="Dashboard" />
                    <NavLink to="/cases" icon={Briefcase} label="Cases" />
                    <NavLink to="/laws" icon={Book} label="Statutes" />
                </div>

                <div className="flex items-center gap-5">
                    <div className="flex items-center gap-3 border-r border-slate-200 pr-5 mr-1 hidden sm:flex">
                        <div className="text-right">
                            <p className="text-[11px] font-black text-slate-900 leading-none">{user?.full_name?.split(' ')[0] || 'Justice'}</p>
                            <p className="text-[8px] font-black text-blue-600 uppercase tracking-widest mt-1 opacity-70">Admin Node</p>
                        </div>
                        <div className="bg-slate-100 p-2 rounded-xl">
                            <UserIcon className="w-4 h-4 text-slate-500" />
                        </div>
                    </div>
                    <button onClick={handleLogout} className="p-3 rounded-2xl text-slate-400 hover:bg-red-50 hover:text-red-500 transition-all active:scale-90">
                        <LogOut className="w-5 h-5" />
                    </button>
                </div>
            </div>
        </motion.nav>
    );
};

export default Navbar;
