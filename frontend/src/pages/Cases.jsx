import { useEffect, useState } from 'react';
import axios from 'axios';
import { Scale, Plus, Search, ChevronRight, Filter, Download, FileText, BarChart3 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend
);

const Cases = () => {
    const [cases, setCases] = useState([]);
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [selectedCase, setSelectedCase] = useState(null);

    const fetchCases = async (pageNum = 1, shouldAppend = false) => {
        try {
            if (shouldAppend) setLoadingMore(true);
            else setLoading(true);

            const { data } = await axios.get(`/api/cases?limit=10`, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });

            setCases(data);
            setHasMore(false);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
            setLoadingMore(false);
        }
    };

    useEffect(() => {
        fetchCases(1, false);
    }, []);

    const loadMore = () => {
        const nextPage = page + 1;
        setPage(nextPage);
        fetchCases(nextPage, true);
    };

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { staggerChildren: 0.05 } }
    };

    const itemVariants = {
        hidden: { x: -20, opacity: 0 },
        visible: { x: 0, opacity: 1 }
    };

    return (
        <motion.div
            initial="hidden"
            animate="visible"
            variants={containerVariants}
            className="p-10 max-w-7xl mx-auto relative"
        >
            {/* Background Decorations */}
            <div className="absolute top-0 right-0 -z-10 w-[400px] h-[400px] bg-blue-50/50 blur-[100px] rounded-full opacity-50 px-10"></div>

            <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12 px-2">
                <motion.div variants={itemVariants}>
                    <h1 className="text-4xl font-black text-slate-900 tracking-tight leading-tight">
                        Top 10 High <span className="text-gradient">Priority Identifications</span>
                    </h1>
                    <p className="text-slate-500 mt-2 font-medium flex items-center gap-2">
                        <Scale className="w-4 h-4 text-blue-500" />
                        AI-Augmented Judicial Pipeline
                    </p>
                </motion.div>
                <motion.div variants={itemVariants} className="flex gap-4">
                    <button className="px-6 py-3 rounded-2xl bg-white border border-slate-200 text-slate-600 font-bold text-xs uppercase tracking-widest hover:bg-slate-50 transition-all flex items-center gap-2 shadow-sm">
                        <Download className="w-4 h-4" /> Export
                    </button>
                    <button className="btn-primary flex items-center gap-2">
                        <Plus className="w-5 h-5 transition-transform group-hover:rotate-90" />
                        File New Case
                    </button>
                </motion.div>
            </header>

            <motion.div variants={itemVariants} className="glass rounded-[2.5rem] border-white/60 shadow-2xl shadow-slate-900/5 overflow-hidden">
                <div className="p-8 border-b border-slate-100/50 bg-white/30 backdrop-blur-sm flex flex-col md:flex-row justify-between items-center gap-6">
                    <div className="flex items-center gap-4">
                        <div className="bg-blue-600/10 p-2.5 rounded-xl">
                            <Filter className="w-5 h-5 text-blue-600" />
                        </div>
                        <h3 className="font-black text-slate-800 uppercase tracking-widest text-[10px]">
                            Advanced AI Ranking: Highest Priority Matters
                        </h3>
                    </div>
                    <div className="relative w-full md:w-96">
                        <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input className="w-full bg-slate-50/50 border border-slate-200 rounded-2xl pl-11 pr-4 py-3 text-sm outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-medium" placeholder="Search CNR, Petitioner or Respondent..." />
                    </div>
                </div>

                <div className="divide-y divide-slate-100/50">
                    {loading && page === 1 ? (
                        <div className="p-32 text-center">
                            <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
                            <div className="text-[10px] font-black text-slate-400 animate-pulse tracking-[0.3em] uppercase">Hydrating Data Grid...</div>
                        </div>
                    ) : (
                        <>
                            {cases.map((c, idx) => (
                                <motion.div
                                    key={c.id}
                                    variants={itemVariants}
                                    whileHover={{ backgroundColor: 'rgba(241, 245, 249, 0.5)' }}
                                    onClick={() => setSelectedCase(c)}
                                    className="p-8 flex flex-col md:flex-row items-center justify-between group cursor-pointer transition-all gap-8"
                                >
                                    <div className="flex items-center gap-8 w-full md:w-auto">
                                        <div className="relative">
                                            <div className={`w-4 h-4 rounded-full ${c.predicted_priority === 'High' ? 'bg-red-500 ring-8 ring-red-500/10' :
                                                c.predicted_priority === 'Medium' ? 'bg-amber-500 ring-8 ring-amber-500/10' :
                                                    'bg-emerald-500 ring-8 ring-emerald-500/10'
                                                }`}></div>
                                            <div className="absolute top-full left-1/2 -translate-x-1/2 w-px h-8 bg-slate-100 mt-2"></div>
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-slate-900 group-hover:text-blue-600 transition-colors text-lg tracking-tight">{c.title}</h4>
                                            <div className="flex items-center gap-3 mt-2">
                                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{c.case_number}</span>
                                                <span className="w-1 h-1 bg-slate-200 rounded-full"></span>
                                                <span className="text-[10px] font-bold text-blue-600 uppercase tracking-widest bg-blue-50 px-2 py-0.5 rounded-md">{c.case_type}</span>
                                                <span className="w-1 h-1 bg-slate-200 rounded-full"></span>
                                                <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest bg-indigo-50 px-2 py-0.5 rounded-md">E: {c.number_of_evidence || 0}</span>
                                                <span className="w-1 h-1 bg-slate-200 rounded-full"></span>
                                                <span className="text-[10px] font-bold text-amber-600 uppercase tracking-widest bg-amber-50 px-2 py-0.5 rounded-md">H: {c.hearing_count || 0}</span>
                                                <span className="w-1 h-1 bg-slate-200 rounded-full"></span>
                                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Filed {new Date(c.filing_date).toLocaleDateString()}</span>
                                            </div>
                                            <p className="mt-3 text-xs text-slate-500 font-medium italic line-clamp-1 max-w-xl">
                                                "Reason: {c.priority_reasoning || 'Semantic analysis in progress...'}"
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-10 w-full md:w-auto justify-between md:justify-end">
                                        <div className="text-right flex flex-col items-end max-w-[200px]">
                                            <div className="flex flex-wrap gap-1 justify-end">
                                                {c.impact_reports && c.impact_reports.length > 0 ? (
                                                    c.impact_reports.slice(0, 2).map((l, i) => (
                                                        <span key={i} className="text-[8px] font-black uppercase px-2 py-1 rounded bg-blue-50 text-blue-600 border border-blue-100 whitespace-nowrap overflow-hidden text-ellipsis max-w-[120px]">
                                                            {l.title}
                                                        </span>
                                                    ))
                                                ) : (
                                                    <span className="text-[8px] font-black uppercase px-2 py-1 rounded bg-slate-50 text-slate-400 border border-slate-100 italic">
                                                        No Direct Impact
                                                    </span>
                                                )}
                                                {c.impact_reports && c.impact_reports.length > 2 && (
                                                    <span className="text-[8px] font-bold text-slate-400">+{c.impact_reports.length - 2} more</span>
                                                )}
                                            </div>
                                            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter mt-1">Law Impact Matrix</span>
                                        </div>
                                        <div className="p-3 bg-slate-50 rounded-2xl group-hover:bg-blue-600 group-hover:text-white transition-all shadow-sm">
                                            <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                            {/* Load more removed as per Top 10 requirement */}
                        </>
                    )}
                </div>
            </motion.div>

            {/* Reasoning Modal */}
            <AnimatePresence>
                {selectedCase && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setSelectedCase(null)}
                            className="fixed inset-0 bg-slate-900/80 backdrop-blur-md"
                        />
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 20 }}
                            className="bg-white rounded-[3.5rem] max-w-2xl w-full max-h-[90vh] shadow-3xl overflow-hidden relative z-10 border border-white/20 flex flex-col"
                        >
                            <div className="p-10 bg-slate-900 text-white relative flex-shrink-0">
                                <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/20 blur-[100px] rounded-full -mr-32 -mt-32"></div>
                                <div className="flex justify-between items-start relative z-10">
                                    <div>
                                        <div className="flex items-center gap-3 mb-4">
                                            <div className="bg-blue-600 p-2 rounded-xl">
                                                <Scale className="w-5 h-5" />
                                            </div>
                                            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-400">Judicial Insight Report</span>
                                        </div>
                                        <h2 className="text-3xl font-black tracking-tight leading-tight">{selectedCase.title}</h2>
                                        <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-4 flex items-center gap-2">
                                            <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                                            {selectedCase.case_number}
                                        </p>
                                    </div>
                                    <button onClick={() => setSelectedCase(null)} className="p-3 hover:bg-white/10 rounded-2xl transition-all font-black text-2xl flex items-center justify-center w-12 h-12">×</button>
                                </div>
                            </div>
                            <div className="p-12 space-y-10 overflow-y-auto custom-scrollbar flex-grow">
                                <div className="bg-blue-600/5 border border-blue-600/10 p-8 rounded-[2.5rem] relative overflow-hidden">
                                    <div className="absolute top-0 right-0 p-4 opacity-10">
                                        <Scale className="w-20 h-20 text-blue-600" />
                                    </div>
                                    <div className="flex items-center gap-2 mb-4">
                                        <h3 className="text-[10px] font-black text-blue-600 uppercase tracking-[0.2em] flex items-center gap-2">
                                            <Scale className="w-4 h-4" /> Why is this case prioritized?
                                        </h3>
                                        <span className="bg-blue-600 text-[8px] text-white px-2 py-0.5 rounded-full font-black uppercase tracking-widest">Judicial Analysis</span>
                                    </div>
                                    <p className="text-slate-900 leading-relaxed text-base font-semibold italic relative z-10">
                                        "{selectedCase.priority_reasoning || 'AI is calculating prioritization weights based on evidence density and case category...'}"
                                    </p>
                                </div>

                                <div className="space-y-8">
                                    <div className="bg-slate-50 border border-slate-200/50 p-8 rounded-[2.5rem]">
                                        <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2 mb-4">
                                            <FileText className="w-4 h-4 text-blue-600" /> Case Description
                                        </h3>
                                        <p className="text-slate-600 text-sm leading-relaxed font-medium">
                                            {selectedCase.description || 'No detailed description provided for this judicial record.'}
                                        </p>
                                    </div>

                                    {selectedCase.impact_reports && selectedCase.impact_reports.length > 0 ? (
                                        <div className="space-y-6">
                                            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2 px-4">
                                                <Scale className="w-4 h-4 text-emerald-600" /> Legislative Impact Insights (Explainable AI)
                                            </h3>
                                            {selectedCase.impact_reports.map((impact, idx) => (
                                                <div key={idx} className="bg-emerald-50/50 border border-emerald-100 p-8 rounded-[2.5rem] relative overflow-hidden group hover:bg-emerald-50 transition-colors">
                                                    <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                                                        <FileText className="w-16 h-16 text-emerald-600" />
                                                    </div>
                                                    <div className="flex justify-between items-start mb-4">
                                                        <h4 className="font-black text-slate-900 text-lg uppercase tracking-tight">{impact.title}</h4>
                                                        <span className="bg-emerald-600 text-[8px] text-white px-2 py-1 rounded-full font-black uppercase tracking-widest leading-none">High Relevance</span>
                                                    </div>
                                                    <p className="text-slate-700 text-sm leading-relaxed font-semibold italic border-l-4 border-emerald-500 pl-4 py-2 bg-white/50 rounded-r-xl">
                                                        "{impact.explanation}"
                                                    </p>
                                                    <div className="mt-4 flex items-center gap-2 text-[9px] font-black text-emerald-600 uppercase tracking-widest">
                                                        <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
                                                        AI-Generated Judicial Analysis
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="bg-amber-50/50 border border-amber-100 p-8 rounded-[2.5rem] text-center">
                                            <p className="text-amber-700 text-xs font-bold uppercase tracking-widest">
                                                No new legislative impacts detected for this case.
                                            </p>
                                        </div>
                                    )}

                                    <div className="bg-white border border-slate-100 p-8 rounded-[2.5rem] shadow-sm">
                                        <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2 mb-6">
                                            <BarChart3 className="w-4 h-4 text-indigo-600" /> Priority Metrics Visualization
                                        </h3>
                                        <div className="h-64">
                                            <Bar
                                                data={{
                                                    labels: ['Statutory Weight', 'Evidence Density', 'Procedural History'],
                                                    datasets: [{
                                                        label: 'Priority Score Contribution',
                                                        data: [
                                                            selectedCase.case_type?.toUpperCase().includes('CRIMINAL') || selectedCase.case_type?.toUpperCase().includes('BAIL') ? 0.5 : 0.3,
                                                            (selectedCase.number_of_evidence || 0) * 0.05,
                                                            (selectedCase.hearing_count || 0) * 0.03
                                                        ],
                                                        backgroundColor: [
                                                            'rgba(59, 130, 246, 0.6)',
                                                            'rgba(99, 102, 241, 0.6)',
                                                            'rgba(245, 158, 11, 0.6)'
                                                        ],
                                                        borderRadius: 12,
                                                    }]
                                                }}
                                                options={{
                                                    responsive: true,
                                                    maintainAspectRatio: false,
                                                    plugins: {
                                                        legend: { display: false }
                                                    },
                                                    scales: {
                                                        y: { beginAtZero: true, max: 1.0, ticks: { font: { size: 10, weight: '900' } } },
                                                        x: { ticks: { font: { size: 10, weight: '900' } } }
                                                    }
                                                }}
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-3 gap-8">
                                    <DetailBox label="Metric score" val={(selectedCase.priority_score || 0).toFixed(2)} iconBg="bg-blue-50" color="text-blue-600" />
                                    <DetailBox label="Evidence count" val={selectedCase.number_of_evidence || 0} iconBg="bg-indigo-50" color="text-indigo-600" />
                                    <DetailBox label="Hearing count" val={selectedCase.hearing_count || 0} iconBg="bg-amber-50" color="text-amber-600" />
                                </div>
                            </div>
                            <div className="p-10 bg-slate-50 border-t border-slate-100 flex justify-end gap-4">
                                <button onClick={() => setSelectedCase(null)} className="px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest text-slate-500 hover:text-slate-900">Close</button>
                                <button onClick={() => setSelectedCase(null)} className="btn-primary">Acknowledge</button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};

const DetailBox = ({ label, val, iconBg, color }) => (
    <div className={`${iconBg} p-6 rounded-[2rem] border border-white/50 shadow-sm flex flex-col items-center gap-2`}>
        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">{label}</p>
        <p className={`text-2xl font-black ${color} tracking-tighter`}>{val}</p>
    </div>
);

export default Cases;
