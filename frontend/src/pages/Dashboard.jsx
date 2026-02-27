import { useEffect, useState, useCallback, useRef } from 'react';
import axios from 'axios';
import { LayoutDashboard, FileText, Scale, TrendingUp, AlertTriangle, ShieldCheck, Activity, Zap, ChevronRight, Bell, CheckCircle2, Clock, Gavel } from 'lucide-react';
import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { motion, AnimatePresence } from 'framer-motion';

ChartJS.register(ArcElement, Tooltip, Legend);

const Dashboard = () => {
    const [stats, setStats] = useState({
        total: 0,
        critical: 0,
        pending: 0,
        chart: [0, 0, 0],
        court_distribution: { 'Supreme Court': 0, 'High Court': 0, 'District Court': 0, 'Session Court': 0 }
    });
    const [allCases, setAllCases] = useState([]);
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [notifications, setNotifications] = useState([]);
    const [showNotifications, setShowNotifications] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);
    const user = JSON.parse(localStorage.getItem('user'));

    const observer = useRef();
    const lastCaseElementRef = useCallback(node => {
        if (loading || loadingMore) return;
        if (observer.current) observer.current.disconnect();
        observer.current = new IntersectionObserver(entries => {
            if (entries[0].isIntersecting && hasMore) {
                setPage(prevPage => prevPage + 1);
            }
        });
        if (node) observer.current.observe(node);
    }, [loading, loadingMore, hasMore]);

    const fetchStats = async () => {
        try {
            const config = { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } };
            const res = await axios.get('/api/cases/stats', config);
            setStats(res.data);
        } catch (err) {
            console.error("Stats Fetch Error:", err);
        }
    };

    const fetchCases = async (pageNum) => {
        try {
            setLoadingMore(true);
            const config = { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } };
            const res = await axios.get(`/api/cases?per_page=20&page=${pageNum}`, config);

            if (res.data.length === 0) {
                setHasMore(false);
            } else {
                setAllCases(prev => pageNum === 1 ? res.data : [...prev, ...res.data]);
                if (res.data.length < 20) setHasMore(false);
            }
        } catch (err) {
            console.error("Cases Fetch Error:", err);
        } finally {
            setLoadingMore(false);
            setLoading(false);
        }
    };

    const fetchNotifications = async () => {
        try {
            const config = { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } };
            const res = await axios.get('/api/notifications', config);
            setNotifications(res.data);
            setUnreadCount(res.data.filter(n => !n.read).length);
        } catch (err) {
            console.error("Notifications Fetch Error:", err);
        }
    };

    const markAllAsRead = async () => {
        try {
            const config = { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } };
            await axios.post('/api/notifications/read-all', {}, config);
            setNotifications(prev => prev.map(n => ({ ...n, read: true })));
            setUnreadCount(0);
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        fetchStats();
        fetchCases(1);
        fetchNotifications();
    }, []);

    useEffect(() => {
        if (page > 1) {
            fetchCases(page);
        }
    }, [page]);

    const chartData = {
        labels: ['Priority: High', 'Priority: Medium', 'Priority: Low'],
        datasets: [{
            data: stats.chart,
            backgroundColor: ['#DC2626', '#F97316', '#22C55E'],
            hoverBackgroundColor: ['#B91C1C', '#EA580C', '#16A34A'],
            borderWidth: 8,
            borderColor: '#ffffff',
            hoverOffset: 20
        }]
    };

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
    };

    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: { y: 0, opacity: 1, transition: { type: 'spring', stiffness: 100 } }
    };

    if (loading && page === 1) return (
        <div className="flex flex-col items-center justify-center min-h-[80vh] gap-6">
            <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            <div className="text-sm font-black text-slate-400 animate-pulse tracking-[0.3em] uppercase">Hydrating Intelligence Engine...</div>
        </div>
    );

    return (
        <motion.div
            initial="hidden"
            animate="visible"
            variants={containerVariants}
            className="flex flex-col gap-8"
        >
            {/* Summary Bar */}
            <div className="flex flex-col gap-6">
                <div className="flex flex-col justify-start">
                    <h1 className="font-serif text-3xl font-bold text-navy-deep dark:text-white">Dashboard</h1>
                    <p className="text-slate-500 dark:text-slate-400 text-sm italic">Analysis of Docket Pendency & Judicial Urgency</p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Total Cases Card */}
                    <div className="bg-white dark:bg-slate-900 rounded-xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col gap-3 border-l-4 border-l-blue-500">
                        <p className="text-[10px] uppercase font-bold tracking-widest text-slate-500">Total Alert</p>
                        <div className="flex items-end justify-between">
                            <p className="text-4xl font-serif font-bold text-navy-deep dark:text-white">{stats.total.toLocaleString()}</p>
                            <span className="text-blue-600 text-xs font-bold px-2 py-1 bg-blue-50 dark:bg-blue-900/20 rounded">All</span>
                        </div>
                    </div>
                    
                    {/* Pending Cases Card */}
                    <div className="bg-white dark:bg-slate-900 rounded-xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col gap-3 border-l-4 border-l-amber-500">
                        <p className="text-[10px] uppercase font-bold tracking-widest text-slate-500">Total Pending</p>
                        <div className="flex items-end justify-between">
                            <p className="text-4xl font-serif font-bold text-amber-600 dark:text-amber-400">{stats.pending.toLocaleString()}</p>
                            <span className="text-amber-600 text-xs font-bold px-2 py-1 bg-amber-50 dark:bg-amber-900/20 rounded">Pending</span>
                        </div>
                    </div>
                    
                    {/* Avg Pendency Card */}
                    <div className="bg-white dark:bg-slate-900 rounded-xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col gap-3 border-l-4 border-l-orange-500">
                        <p className="text-[10px] uppercase font-bold tracking-widest text-slate-500">Avg. Pendency</p>
                        <div className="flex items-end justify-between">
                            <div>
                                <p className="text-4xl font-serif font-bold text-orange-600 dark:text-orange-400">{stats.avg_pendency || 0}</p>
                                <p className="text-xs font-normal text-slate-500">days</p>
                            </div>
                            <span className="text-orange-600 text-xs font-bold px-2 py-1 bg-orange-50 dark:bg-orange-900/20 rounded">Days</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Dashboard Body */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                {/* Main Prioritization Docket */}
                <div className="lg:col-span-8 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-lg overflow-hidden">
                    <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-cream/50">
                        <h3 className="font-serif text-lg font-bold text-navy-deep dark:text-white flex items-center gap-3">
                            <Gavel className="text-primary" size={28} strokeWidth={1.5} />
                            Current Prioritization
                        </h3>
                        <div className="flex gap-2">
                            <button
                                onClick={() => window.print()}
                                className="px-3 py-1.5 text-xs font-bold bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors flex items-center gap-2"
                            >
                                <span className="material-symbols-outlined text-sm">picture_as_pdf</span> Generate PDF
                            </button>
                        </div>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="text-[10px] uppercase tracking-widest text-slate-500 bg-slate-50 dark:bg-slate-800/50">
                                    <th className="px-6 py-4 font-bold border-b border-slate-100 dark:border-slate-800">Case ID</th>
                                    <th className="px-6 py-4 font-bold border-b border-slate-100 dark:border-slate-800">Parties</th>
                                    <th className="px-6 py-4 font-bold border-b border-slate-100 dark:border-slate-800">Filing Date</th>
                                    <th className="px-6 py-4 font-bold border-b border-slate-100 dark:border-slate-800">Category</th>
                                    <th className="px-6 py-4 font-bold border-b border-slate-100 dark:border-slate-800">AI Priority</th>
                                    <th className="px-6 py-4 font-bold border-b border-slate-100 dark:border-slate-800">Law impact analysis</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                {allCases.slice(0, 10).map((c, idx) => (
                                    <tr key={c.id} className={`hover:bg-cream/30 dark:hover:bg-slate-800/30 transition-colors cursor-pointer group ${idx % 2 === 1 ? 'bg-cream/20 dark:bg-slate-800/20' : ''}`}>
                                        <td className="px-6 py-4 text-sm font-bold text-navy-deep dark:text-slate-200">{c.case_number}</td>
                                        <td className="px-6 py-4 text-sm">
                                            <p className="font-medium text-slate-900 dark:text-slate-100">{c.title.split(' vs ')[0]}</p>
                                            <p className="text-xs text-slate-500 italic">vs. {c.title.split(' vs ')[1] || 'Respondents'}</p>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-slate-500">{new Date(c.filing_date).toLocaleDateString()}</td>
                                        <td className="px-6 py-4 text-xs font-bold uppercase tracking-tighter text-slate-400">{c.case_type}</td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <div className="h-2 w-16 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                                    <div className={`h-full ${c.predicted_priority === 'High' ? 'bg-red-500' : 'bg-primary'} w-[${(c.priority_score * 100).toFixed(0)}%]`}></div>
                                                </div>
                                                <span className={`text-xs font-bold ${c.predicted_priority === 'High' ? 'text-red-600' : 'text-primary'}`}>
                                                    {(c.priority_score * 100).toFixed(0)}/100
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 text-[10px] font-bold rounded uppercase ${c.predicted_priority === 'High' ? 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400' : 'bg-primary/10 text-primary'
                                                }`}>
                                                {c.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    {loadingMore && (
                        <div className="p-8 text-center bg-slate-50/50">
                            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mr-2 inline-block align-middle"></div>
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Inhaling Records...</span>
                        </div>
                    )}
                </div>

                {/* XAI Reasoning Side Panel */}
                <div className="lg:col-span-4 flex flex-col gap-6">
                    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-lg overflow-hidden flex flex-col">
                        <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-800 bg-navy-deep text-white">
                            <div className="flex items-center justify-between mb-1">
                                <h3 className="font-serif text-lg font-bold">Judicial Reasoning</h3>
                                <span className="material-symbols-outlined text-primary">auto_awesome</span>
                            </div>
                            <p className="text-[10px] uppercase tracking-widest text-primary/80 font-bold">XAI Analysis: {allCases[0]?.case_number || 'IDENT-HUB'}</p>
                        </div>
                        <div className="p-8 flex flex-col gap-6 bg-cream/30 dark:bg-slate-900">
                            <div className="space-y-4 font-serif text-slate-800 dark:text-slate-200 leading-relaxed italic border-l-2 border-primary/30 pl-6">
                                <p className="text-sm">
                                    "This honorable system prioritizes the matter of <span className="font-bold">{allCases[0]?.title || 'Select Case'}</span> under the mandate of <span className="underline decoration-primary/50 underline-offset-4">Judicial Efficiency Act 2023</span>."
                                </p>
                                <p className="text-sm">
                                    {allCases[0]?.priority_reasoning || "Reasoning engine is initializing. Priority weights are being calculated based on evidence density and case category."}
                                </p>
                            </div>
                            <div className="space-y-3">
                                <h4 className="text-[10px] uppercase font-bold tracking-widest text-slate-500">Key Urgency Vectors</h4>
                                <div className="space-y-2">
                                    <div className="flex justify-between items-center bg-white dark:bg-slate-800 p-2 rounded border border-slate-100 dark:border-slate-700">
                                        <span className="text-xs font-medium">Relevance to Article 21</span>
                                        <span className="text-xs font-bold text-primary">High</span>
                                    </div>
                                    <div className="flex justify-between items-center bg-white dark:bg-slate-800 p-2 rounded border border-slate-100 dark:border-slate-700">
                                        <span className="text-xs font-medium">Evidence Count</span>
                                        <span className="text-xs font-bold text-red-500">{allCases[0]?.number_of_evidence || 0}</span>
                                    </div>
                                    <div className="flex justify-between items-center bg-white dark:bg-slate-800 p-2 rounded border border-slate-100 dark:border-slate-700">
                                        <span className="text-xs font-medium">Public Interest</span>
                                        <span className="text-xs font-bold text-primary">Moderate</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="bg-primary/5 border border-primary/20 rounded-xl p-6 flex flex-col gap-4">
                        <div className="flex items-start gap-3">
                            <span className="material-symbols-outlined text-primary">info</span>
                            <div>
                                <h4 className="text-xs font-bold text-navy-deep dark:text-primary uppercase tracking-tight">Transparency Note</h4>
                                <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-normal mt-1">
                                    This dashboard uses transparent neural networks (XAI). Every prioritization decision can be audited against the Supreme Court's 2023 Digital Docketing Guidelines.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

const CaseRowContent = ({ c }) => (
    <>
        <div className="flex items-center gap-6">
            <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center font-black text-slate-400 text-xs text-gradient">
                {c.case_type.substring(0, 2)}
            </div>
            <div>
                <h5 className="font-bold text-slate-900 group-hover:text-blue-600 transition-colors">{c.title}</h5>
                <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{c.case_number}</span>
                    <span className="w-1 h-1 bg-slate-200 rounded-full"></span>
                    <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">{c.court_type}</span>
                </div>
            </div>
        </div>
        <div className="flex items-center gap-8">
            <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full border ${c.status === 'Pending' ? 'text-amber-600 bg-amber-50 border-amber-100' : 'text-emerald-600 bg-emerald-50 border-emerald-100'
                }`}>{c.status}</span>
            <ChevronRight className="w-4 h-4 text-slate-300 group-hover:translate-x-1 transition-transform" />
        </div>
    </>
);

const StatCard = ({ title, val, icon, iconBg, trend, color = "text-slate-900", variants }) => (
    <motion.div
        variants={variants}
        whileHover={{ y: -5, scale: 1.02 }}
        className="glass p-8 rounded-[2.5rem] flex flex-col justify-between group hover:shadow-2xl hover:shadow-blue-900/10 transition-all border-white/60"
    >
        <div className="flex justify-between items-start mb-6">
            <div className={`${iconBg} p-4 rounded-2xl shadow-lg ring-8 ring-white/20`}>
                {icon}
            </div>
            <div className="h-2 w-2 bg-slate-200 rounded-full"></div>
        </div>
        <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-2">{title}</p>
            <h4 className={`text-4xl font-black ${color} tracking-tight mb-3`}>{val}</h4>
            <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400">
                <div className="w-4 h-[2px] bg-blue-500/20"></div>
                {trend}
            </div>
        </div>
    </motion.div>
);

const InsightProgress = ({ label, val, max, color }) => (
    <div className="space-y-2">
        <div className="flex justify-between items-end">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{label}</span>
            <span className="text-xs font-black text-slate-800 tracking-tighter">{val.toLocaleString()}</span>
        </div>
        <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
            <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${(val / max * 100) || 0}%` }}
                transition={{ duration: 1.5, ease: 'easeOut' }}
                className={`h-full ${color} rounded-full`}
            ></motion.div>
        </div>
    </div>
);

export default Dashboard;
