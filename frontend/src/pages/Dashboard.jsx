import { useEffect, useState, useCallback, useRef } from 'react';
import axios from 'axios';
import { LayoutDashboard, FileText, Scale, TrendingUp, AlertTriangle, ShieldCheck, Activity, Zap, ChevronRight, Bell, CheckCircle2, Clock } from 'lucide-react';
import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { motion, AnimatePresence } from 'framer-motion';

ChartJS.register(ArcElement, Tooltip, Legend);

const Dashboard = () => {
    const [stats, setStats] = useState({ total: 0, critical: 0, pending: 0, chart: [0, 0, 0] });
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
            backgroundColor: ['#ef4444', '#f59e0b', '#10b981'],
            hoverBackgroundColor: ['#dc2626', '#d97706', '#059669'],
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
            className="p-10 max-w-7xl mx-auto relative"
        >
            {/* Background Decorations */}
            <div className="absolute top-0 right-0 -z-10 w-[500px] h-[500px] bg-blue-100/50 blur-[120px] rounded-full opacity-50 px-10"></div>
            <div className="absolute bottom-0 left-0 -z-10 w-[400px] h-[400px] bg-indigo-100/50 blur-[100px] rounded-full opacity-40"></div>

            <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 mb-16 px-2">
                <motion.div variants={itemVariants}>
                    <h1 className="text-5xl font-black text-slate-900 tracking-tight leading-tight">
                        Proactive <span className="text-gradient">Legal Insights</span>
                    </h1>
                    <div className="flex items-center gap-4 mt-4">
                        <div className="flex items-center gap-2 bg-slate-900 text-white px-4 py-1.5 rounded-full shadow-lg shadow-slate-900/10">
                            <ShieldCheck className="w-4 h-4 text-blue-400" />
                            <span className="text-[10px] font-bold uppercase tracking-widest">{user?.role} Access</span>
                        </div>
                        <span className="h-1 w-1 bg-slate-300 rounded-full"></span>
                        <p className="text-slate-500 text-xs font-semibold tracking-wide">Secure Instance: NYAYSETU-01</p>
                    </div>
                </motion.div>

                <motion.div variants={itemVariants} className="flex items-center gap-6">
                    <div className="relative">
                        <button
                            onClick={() => setShowNotifications(!showNotifications)}
                            className="p-4 bg-white rounded-2xl shadow-xl shadow-blue-900/5 border border-slate-100 hover:bg-slate-50 transition-all relative group"
                        >
                            <Bell className={`w-6 h-6 ${unreadCount > 0 ? 'text-blue-600 animate-pulse' : 'text-slate-400'}`} />
                            {unreadCount > 0 && (
                                <span className="absolute top-3 right-3 w-3 h-3 bg-red-500 border-2 border-white rounded-full"></span>
                            )}
                        </button>

                        <AnimatePresence>
                            {showNotifications && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                    className="absolute right-0 mt-4 w-96 bg-white rounded-[2.5rem] shadow-3xl border border-slate-100 z-[100] overflow-hidden"
                                >
                                    <div className="p-8 border-b border-slate-50 flex justify-between items-center bg-slate-50/50">
                                        <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Judicial Alerts</h4>
                                        <button onClick={markAllAsRead} className="text-[10px] font-black text-blue-600 uppercase tracking-widest hover:text-blue-700">Mark all read</button>
                                    </div>
                                    <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
                                        {notifications.length > 0 ? (
                                            notifications.map(n => (
                                                <div key={n.id} className={`p-6 border-b border-slate-50 hover:bg-slate-50 transition-colors flex gap-4 ${!n.read ? 'bg-blue-50/30' : ''}`}>
                                                    <div className={`mt-1 w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${!n.read ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-400'}`}>
                                                        <Activity className="w-4 h-4" />
                                                    </div>
                                                    <div>
                                                        <p className="text-xs font-bold text-slate-900 mb-1">{n.title}</p>
                                                        <p className="text-[11px] text-slate-500 leading-relaxed line-clamp-2 mb-2">{n.message}</p>
                                                        <div className="flex items-center gap-3">
                                                            <span className="text-[9px] font-bold text-slate-400 flex items-center gap-1.5">
                                                                <Clock className="w-3 h-3" /> {new Date(n.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                            </span>
                                                            {!n.read && <span className="w-1.5 h-1.5 bg-blue-600 rounded-full"></span>}
                                                        </div>
                                                    </div>
                                                </div>
                                            ))
                                        ) : (
                                            <div className="p-12 text-center">
                                                <ShieldCheck className="w-12 h-12 text-slate-100 mx-auto mb-4" />
                                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">No Active Alerts</p>
                                            </div>
                                        )}
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    <div className="glass px-6 py-4 rounded-[2rem] flex items-center gap-4 shadow-xl shadow-blue-900/5 border-white/50">
                        <div className="relative">
                            <div className="w-3 h-3 bg-green-500 rounded-full animate-ping absolute"></div>
                            <div className="w-3 h-3 bg-green-500 rounded-full relative"></div>
                        </div>
                        <div>
                            <span className="block text-[8px] font-black text-slate-400 uppercase tracking-widest mb-0.5 text-right">System Health</span>
                            <span className="text-xs font-bold text-slate-800 uppercase tracking-tighter">Core Engine Stable</span>
                        </div>
                    </div>
                </motion.div>
            </header>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
                <StatCard
                    variants={itemVariants}
                    title={user?.role === 'citizen' ? "Rights & Protections" : user?.role === 'lawyer' ? "Monitored Docket" : "Total Case Repository"}
                    val={stats.total.toLocaleString()}
                    icon={<Scale className="w-6 h-6 text-white" />}
                    iconBg="bg-blue-600 shadow-blue-200"
                    trend={user?.role === 'citizen' ? "Active Statutory Synchronicity" : "+12% Since Last Ingestion"}
                />
                <StatCard
                    variants={itemVariants}
                    title={user?.role === 'citizen' ? "Transparency Score" : user?.role === 'lawyer' ? "Priority Impact Alerts" : "Critical Action Items"}
                    val={user?.role === 'citizen' ? `${stats.critical}%` : stats.critical}
                    icon={<AlertTriangle className="w-6 h-6 text-white" />}
                    iconBg="bg-red-500 shadow-red-200"
                    trend={user?.role === 'citizen' ? "AI-Verified Judicial Fairness" : "Requires Immediate Review"}
                    color="text-red-600"
                />
                <StatCard
                    variants={itemVariants}
                    title={user?.role === 'citizen' ? "Scanned Repository" : user?.role === 'lawyer' ? "Impacted Case Load" : "Pending Classifications"}
                    val={stats.pending.toLocaleString()}
                    icon={<FileText className="w-6 h-6 text-white" />}
                    iconBg="bg-amber-500 shadow-amber-200"
                    trend={user?.role === 'citizen' ? "Total National Matters Analyzed" : "Awaiting Semantic Analysis"}
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                <motion.div variants={itemVariants} className="lg:col-span-12 glass rounded-[3rem] p-12 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-blue-500/10 to-transparent rounded-full -mr-32 -mt-32 blur-3xl group-hover:scale-110 transition-transform duration-700"></div>

                    <div className="flex flex-col md:flex-row items-center gap-16">
                        <div className="w-full md:w-1/2">
                            <h3 className="text-2xl font-black mb-4 flex items-center gap-4">
                                <Activity className="w-8 h-8 text-blue-600" />
                                Priority Semantic Mapping
                            </h3>
                            <p className="text-slate-500 text-sm font-medium mb-12 leading-relaxed max-w-md italic">
                                Real-time distribution of cases filtered through our advanced judicial classification engine.
                            </p>

                            <div className="space-y-6">
                                <InsightProgress label="High Priority" val={stats.chart[0]} max={stats.total} color="bg-red-500" />
                                <InsightProgress label="Moderate" val={stats.chart[1]} max={stats.total} color="bg-amber-500" />
                                <InsightProgress label="Standard" val={stats.chart[2]} max={stats.total} color="bg-emerald-500" />
                            </div>
                        </div>

                        <div className="w-full md:w-1/2 flex justify-center relative">
                            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                                <span className="text-4xl font-black text-slate-900">
                                    {stats.total > 0 ? (stats.chart.reduce((a, b) => a + b, 0) / stats.total * 100).toFixed(0) : 0}%
                                </span>
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Processed</span>
                            </div>
                            <div className="max-w-[18rem] w-full animate-float">
                                <Doughnut data={chartData} options={{
                                    cutout: '82%',
                                    plugins: {
                                        legend: { display: false }
                                    },
                                    animation: { animateRotate: true, duration: 2000 }
                                }} />
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>

            {/* Judicial Case Repository Section with Infinite Scroll */}
            <motion.div variants={itemVariants} className="mt-16 bg-white rounded-[3rem] p-12 shadow-2xl shadow-slate-900/5 border border-slate-100">
                <div className="flex justify-between items-center mb-10">
                    <div>
                        <h3 className="text-2xl font-black text-slate-900 flex items-center gap-4">
                            <Scale className="w-8 h-8 text-blue-600" />
                            Judicial Case Repository
                        </h3>
                        <p className="text-slate-400 text-[10px] font-bold uppercase tracking-[0.2em] mt-1 ml-12">Full System Matrix | Real-time Ingestion</p>
                    </div>
                </div>

                <div className="divide-y divide-slate-50">
                    {allCases.map((c, index) => {
                        if (allCases.length === index + 1) {
                            return (
                                <div ref={lastCaseElementRef} key={c.id} className="py-6 flex items-center justify-between group hover:bg-slate-50/50 transition-all rounded-2xl px-4">
                                    <CaseRowContent c={c} />
                                </div>
                            );
                        } else {
                            return (
                                <div key={c.id} className="py-6 flex items-center justify-between group hover:bg-slate-50/50 transition-all rounded-2xl px-4">
                                    <CaseRowContent c={c} />
                                </div>
                            );
                        }
                    })}

                    {loadingMore && (
                        <div className="py-10 text-center">
                            <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-4">Loading more cases...</p>
                        </div>
                    )}

                    {!hasMore && allCases.length > 0 && (
                        <div className="py-10 text-center text-slate-400 font-bold uppercase tracking-widest text-[10px]">End of Case Repository</div>
                    )}

                    {allCases.length === 0 && !loading && (
                        <div className="py-20 text-center text-slate-400 font-bold uppercase tracking-widest text-xs">No Judicial Matters Found</div>
                    )}
                </div>
            </motion.div>
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
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{c.case_number}</span>
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
