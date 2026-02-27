import { motion, AnimatePresence } from 'framer-motion';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { User, LogOut } from 'lucide-react';

const Layout = ({ children }) => {
    const location = useLocation();
    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem('user'));
    const [showUserMenu, setShowUserMenu] = useState(false);

    const handleLogout = () => {
        localStorage.clear();
        navigate('/login');
    };

    const navLinks = [
        { label: 'Dashboard', path: '/' },
        { label: 'Case prioritization', path: '/cases' },
        { label: 'Statutes', path: '/laws' },
    ];

    return (
        <div className="relative flex min-h-screen w-full flex-col overflow-x-hidden bg-background-light dark:bg-background-dark font-display text-slate-900 dark:text-slate-100">
            {/* Top Navigation Bar */}
            <header className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 bg-navy-deep px-8 py-4 text-white z-50">
                <div className="flex items-center gap-8">
                    <Link to="/" className="flex items-center gap-4 hover:opacity-80 transition-opacity">
                        <div className="size-10 text-primary">
                            <svg fill="none" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
                                <path clipRule="evenodd" d="M24 0.757355L47.2426 24L24 47.2426L0.757355 24L24 0.757355ZM21 35.7574V12.2426L9.24264 24L21 35.7574Z" fill="currentColor" fillRule="evenodd"></path>
                            </svg>
                        </div>
                        <div>
                            <h2 className="font-serif text-xl font-bold leading-tight tracking-widest uppercase">NyaySetu</h2>
                            <p className="text-[10px] uppercase tracking-[0.2em] text-primary/80">Supreme Court of India • Judicial Portal</p>
                        </div>
                    </Link>
                    <nav className="hidden lg:flex items-center gap-6 ml-10 border-l border-white/20 pl-10">
                        {navLinks.map((link) => (
                            <Link
                                key={link.path}
                                to={link.path}
                                className={`text-xs font-bold uppercase tracking-widest transition-colors ${location.pathname === link.path ? 'text-primary' : 'text-white/70 hover:text-white'}`}
                            >
                                {link.label}
                            </Link>
                        ))}
                    </nav>
                </div>

                <div className="flex items-center gap-6">
                    <div className="relative hidden md:block">
                        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">search</span>
                        <input
                            className="bg-white/10 border-none rounded-lg pl-10 pr-4 py-2 text-sm focus:ring-1 focus:ring-primary w-64 placeholder:text-slate-400 text-white outline-none"
                            placeholder="Search Case ID or Party Name"
                            type="text"
                        />
                    </div>
                    <div className="flex items-center gap-3">
                        <button className="flex items-center justify-center rounded-full bg-white/10 p-2 hover:bg-white/20 transition-colors">
                            <span className="material-symbols-outlined text-xl">notifications</span>
                        </button>
                    </div>

                    {/* User Menu */}
                    <div className="relative">
                        <button
                            onClick={() => setShowUserMenu(!showUserMenu)}
                            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors text-white"
                        >
                            <div className="w-6 h-6 bg-primary/30 rounded-full flex items-center justify-center">
                                <User className="w-3.5 h-3.5 text-primary" />
                            </div>
                            <div className="text-left hidden sm:block">
                                <p className="text-xs font-bold">{user?.username || 'User'}</p>
                                <p className="text-[9px] text-slate-300 capitalize">{user?.role || 'guest'}</p>
                            </div>
                            <span className="material-symbols-outlined text-sm">expand_more</span>
                        </button>

                        {/* User Menu Dropdown */}
                        {showUserMenu && (
                            <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className="absolute right-0 mt-2 w-56 bg-white dark:bg-slate-900 rounded-lg shadow-xl border border-slate-200 dark:border-slate-800 overflow-hidden z-50"
                                onMouseLeave={() => setShowUserMenu(false)}
                            >
                                {/* User Info */}
                                <div className="px-4 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
                                    <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Logged In As</p>
                                    <p className="text-sm font-bold text-navy-deep dark:text-white">{user?.username || 'User'}</p>
                                    <p className="text-xs text-slate-500 dark:text-slate-400 capitalize mt-1">Role: {user?.role || 'guest'}</p>
                                </div>

                                {/* Menu Options */}
                                <div className="p-2 space-y-1">
                                    <button className="w-full px-3 py-2 text-left text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded transition-all flex items-center gap-3">
                                        <span className="material-symbols-outlined text-sm">settings</span>
                                        Account Settings
                                    </button>
                                    <button className="w-full px-3 py-2 text-left text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded transition-all flex items-center gap-3">
                                        <span className="material-symbols-outlined text-sm">lock</span>
                                        Change Password
                                    </button>
                                </div>

                                {/* Logout Button */}
                                <div className="px-2 py-2 border-t border-slate-100 dark:border-slate-800">
                                    <button
                                        onClick={handleLogout}
                                        className="w-full px-3 py-2 text-left text-sm font-bold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-all flex items-center gap-3"
                                    >
                                        <span className="material-symbols-outlined text-sm">logout</span>
                                        Sign Out
                                    </button>
                                </div>
                            </motion.div>
                        )}
                    </div>
                </div>
            </header>

            {/* Main Content Area */}
            <main className="flex-1 px-8 py-8 flex flex-col gap-8 max-w-[1600px] mx-auto w-full min-h-[calc(100vh-140px)]">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={location.pathname}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.3 }}
                        className="w-full flex-1"
                    >
                        {children}
                    </motion.div>
                </AnimatePresence>
            </main>

            {/* Footer */}
            <footer className="bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 px-8 py-6 mt-12 w-full">
                <div className="max-w-[1600px] mx-auto flex flex-col md:flex-row justify-between items-center gap-4 text-slate-400">
                    <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-sm">copyright</span>
                        <p className="text-[10px] font-bold uppercase tracking-widest">2026 Supreme Court of India • NyaySetu Digital Division</p>
                    </div>
                    <div className="flex items-center gap-6">
                        <a className="text-[10px] font-bold uppercase tracking-widest text-slate-500 hover:text-primary transition-colors" href="#">Privacy Policy</a>
                        <a className="text-[10px] font-bold uppercase tracking-widest text-slate-500 hover:text-primary transition-colors" href="#">Usage Guidelines</a>
                        <a className="text-[10px] font-bold uppercase tracking-widest text-slate-500 hover:text-primary transition-colors" href="#">Contact Registrar</a>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default Layout;
