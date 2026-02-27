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
    const [statusFilter, setStatusFilter] = useState(''); // New status filter state
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [formLoading, setFormLoading] = useState(false);
    const [formData, setFormData] = useState({
        case_number: '',
        case_type: 'Civil',
        title: '',
        description: '',
        filing_date: new Date().toISOString().split('T')[0],
        court_type: 'District Court',
        court_name: '',
        urgency: 'Medium',
        number_of_evidence: 0
    });

    const fetchCases = async (pageNum = 1, shouldAppend = false, status = '') => {
        try {
            if (shouldAppend) setLoadingMore(true);
            else setLoading(true);

            const params = new URLSearchParams('?limit=10');
            if (status) params.append('status', status);

            const { data } = await axios.get(`/api/cases?${params.toString()}`, {
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

    const handleStatusFilterChange = (status) => {
        setStatusFilter(status);
        setPage(1);
        fetchCases(1, false, status);
    };

    const handleExport = () => {
        if (cases.length === 0) return;

        const headers = ["Case Number", "Title", "Type", "Filing Date", "Court Type", "Court Name", "Priority Score", "Predicted Priority"];
        const csvRows = [
            headers.join(','),
            ...cases.map(c => [
                `"${c.case_number}"`,
                `"${c.title}"`,
                `"${c.case_type}"`,
                `"${new Date(c.filing_date).toLocaleDateString()}"`,
                `"${c.court_type}"`,
                `"${c.court_name || ''}"`,
                `"${(c.priority_score * 100).toFixed(0)}"`,
                `"${c.predicted_priority}"`
            ].join(','))
        ];

        const csvContent = csvRows.join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.setAttribute('hidden', '');
        a.setAttribute('href', url);
        a.setAttribute('download', `judicial_cases_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    };

    const handleCreateCase = async (e) => {
        e.preventDefault();
        try {
            setFormLoading(true);
            const config = { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } };
            await axios.post('/api/cases', formData, config);
            setShowCreateModal(false);
            setFormData({
                case_number: '',
                case_type: 'Civil',
                title: '',
                description: '',
                filing_date: new Date().toISOString().split('T')[0],
                court_type: 'District Court',
                court_name: '',
                urgency: 'Medium',
                number_of_evidence: 0
            });
            fetchCases(1, false, statusFilter);
        } catch (err) {
            console.error("Create Case Error:", err);
            alert("Failed to file new case. Please check your permissions.");
        } finally {
            setFormLoading(false);
        }
    };

    useEffect(() => {
        fetchCases(1, false, statusFilter);
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
            className="flex flex-col gap-8"
        >
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 px-2">
                <motion.div variants={itemVariants}>
                    <h1 className="font-serif text-3xl font-bold text-navy-deep dark:text-white">
                        Judicial <span className="text-primary italic">Case Priotization</span>
                    </h1>
                    <p className="text-slate-500 mt-1 text-sm italic flex items-center gap-2">
                        <span className="material-symbols-outlined text-primary text-sm">analytics</span>
                        AI-Augmented Ranking: Highest Priority Matters
                    </p>
                </motion.div>
                <motion.div variants={itemVariants} className="flex gap-4">
                    <button
                        onClick={handleExport}
                        className="px-4 py-2 rounded-lg bg-white border border-slate-200 text-slate-600 font-bold text-[10px] uppercase tracking-widest hover:bg-slate-50 transition-all flex items-center gap-2 shadow-sm"
                    >
                        <Download className="w-4 h-4" /> Export
                    </button>
                    <button
                        onClick={() => setShowCreateModal(true)}
                        className="px-5 py-2.5 bg-primary text-white rounded-lg font-bold text-[10px] uppercase tracking-widest hover:bg-primary/90 transition-all flex items-center gap-2 shadow-lg shadow-primary/20"
                    >
                        <Plus className="w-5 h-5" /> File New Case
                    </button>
                </motion.div>
            </header>

            <motion.div variants={itemVariants} className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden">
                <div className="px-8 py-6 border-b border-slate-100 dark:border-slate-800 bg-cream/30 flex flex-col gap-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="bg-navy-deep p-2 rounded-lg">
                                <span className="material-symbols-outlined text-primary">filter_list</span>
                            </div>
                            <h3 className="font-serif text-lg font-bold text-navy-deep dark:text-white">
                                Master Priority Matrix
                            </h3>
                        </div>
                        <div className="flex gap-2">
                            <button
                                onClick={() => handleStatusFilterChange('')}
                                className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-widest transition-all ${statusFilter === ''
                                    ? 'bg-primary text-white'
                                    : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                                    }`}
                            >
                                All Cases
                            </button>
                            <button
                                onClick={() => handleStatusFilterChange('Pending')}
                                className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-widest transition-all ${statusFilter === 'Pending'
                                    ? 'bg-amber-500 text-white'
                                    : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                                    }`}
                            >
                                Pending
                            </button>
                            <button
                                onClick={() => handleStatusFilterChange('Processed')}
                                className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-widest transition-all ${statusFilter === 'Processed'
                                    ? 'bg-green-500 text-white'
                                    : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                                    }`}
                            >
                                Processed
                            </button>
                        </div>
                    </div>
                    <div className="relative w-full">
                        <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm">search</span>
                        <input className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-11 pr-4 py-3 text-sm outline-none focus:ring-1 focus:ring-primary transition-all font-medium" placeholder="Search CNR, Title or Court..." />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="text-[10px] uppercase tracking-widest text-slate-500 bg-slate-50 dark:bg-slate-800/50 font-bold">
                                <th className="px-8 py-4 border-b border-slate-100 dark:border-slate-800">Case ID</th>
                                <th className="px-8 py-4 border-b border-slate-100 dark:border-slate-800">Description</th>
                                <th className="px-8 py-4 border-b border-slate-100 dark:border-slate-800">Filing Date</th>
                                <th className="px-8 py-4 border-b border-slate-100 dark:border-slate-800">Category</th>
                                <th className="px-8 py-4 border-b border-slate-100 dark:border-slate-800">AI Priority</th>
                                <th className="px-8 py-4 border-b border-slate-100 dark:border-slate-800">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                            {loading ? (
                                <tr>
                                    <td colSpan="6" className="p-20 text-center">
                                        <div className="w-10 h-10 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
                                        <div className="text-[10px] font-black text-slate-400 animate-pulse tracking-[0.3em] uppercase">Synchronizing Judicial Dockets...</div>
                                    </td>
                                </tr>
                            ) : (
                                cases.map((c, idx) => (
                                    <tr
                                        key={c.id}
                                        onClick={() => setSelectedCase(c)}
                                        className={`hover:bg-cream/40 dark:hover:bg-slate-800/40 transition-colors cursor-pointer group ${idx % 2 === 1 ? 'bg-cream/20 dark:bg-slate-800/10' : ''}`}
                                    >
                                        <td className="px-8 py-6 text-sm font-bold text-navy-deep dark:text-slate-200">{c.case_number}</td>
                                        <td className="px-8 py-6">
                                            <p className="font-bold text-slate-900 dark:text-slate-100 text-sm group-hover:text-primary transition-colors">{c.title}</p>
                                            <div className="flex items-center gap-2 mt-1">
                                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{c.court_type}</span>
                                                {c.court_name && (
                                                    <span className="text-[9px] font-medium text-slate-400 italic">• {c.court_name}</span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-8 py-6 text-sm text-slate-500 font-medium">
                                            {new Date(c.filing_date).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })}
                                        </td>
                                        <td className="px-8 py-6">
                                            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded">
                                                {c.case_type}
                                            </span>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-3">
                                                <div className="h-1.5 w-16 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                                    <div className={`h-full ${c.predicted_priority === 'High' ? 'bg-red-500' : 'bg-primary'} w-[${(c.priority_score * 100).toFixed(0)}%]`}></div>
                                                </div>
                                                <span className={`text-xs font-black ${c.predicted_priority === 'High' ? 'text-red-600' : 'text-primary'}`}>
                                                    {(c.priority_score * 100).toFixed(0)}/100
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <span className={`px-2.5 py-1 text-[10px] font-bold rounded uppercase border ${c.predicted_priority === 'High' ? 'bg-red-50 text-red-700 border-red-100' : 'bg-primary/10 text-primary border-primary/20'
                                                }`}>
                                                {c.predicted_priority === 'High' ? 'Urgent' : 'Selected'}
                                            </span>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                <div className="px-8 py-5 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                    <p className="text-[10px] text-slate-500 font-bold tracking-widest italic uppercase">Master Judicial Index | High Definition AI Priority Ranking</p>
                    <div className="flex gap-2">
                        <button className="h-9 w-9 rounded-lg border border-slate-200 dark:border-slate-700 font-bold bg-white dark:bg-slate-800 text-slate-700 hover:bg-slate-50">1</button>
                    </div>
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
                            className="fixed inset-0 bg-navy-deep/60 backdrop-blur-md"
                        />
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.95, opacity: 0, y: 20 }}
                            className="bg-white dark:bg-slate-900 rounded-xl max-w-5xl w-full max-h-[90vh] shadow-3xl overflow-hidden relative z-10 border border-slate-200 dark:border-slate-700 flex flex-col"
                        >
                            <div className="p-8 bg-navy-deep text-white relative flex-shrink-0">
                                <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 blur-[100px] rounded-full -mr-32 -mt-32"></div>
                                <div className="flex justify-between items-start relative z-10">
                                    <div>
                                        <div className="flex items-center gap-3 mb-2">
                                            <span className="material-symbols-outlined text-primary">auto_awesome</span>
                                            <span className="text-sm font-bold uppercase tracking-[0.3em] text-primary">Judicial Reasoning Report</span>
                                        </div>
                                        <h2 className="font-serif text-4xl font-bold tracking-tight">{selectedCase.title}</h2>
                                        <p className="text-primary/70 text-sm font-bold uppercase tracking-widest mt-2">{selectedCase.case_number}</p>
                                    </div>
                                    <button onClick={() => setSelectedCase(null)} className="p-2 hover:bg-white/10 rounded-lg transition-all text-white/50 hover:text-white">
                                        <span className="material-symbols-outlined">close</span>
                                    </button>
                                </div>
                            </div>

                            <div className="p-10 space-y-8 overflow-y-auto custom-scrollbar flex-grow bg-cream/30 dark:bg-slate-900">
                                <div className="space-y-4 font-serif text-slate-800 dark:text-slate-200 leading-relaxed italic border-l-2 border-primary/30 pl-8 bg-white dark:bg-slate-800/80 p-8 rounded-xl shadow-sm">
                                    <p className="text-lg">
                                        "{selectedCase.priority_reasoning || 'Calculating specific priority vectors based on Section 4(b) Urgency Criteria and pendency weightage...'}"
                                    </p>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-100 dark:border-slate-700">
                                        <h4 className="text-sm uppercase font-bold tracking-widest text-slate-500 mb-4 flex items-center gap-2">
                                            <span className="material-symbols-outlined text-sm text-primary">balance</span>
                                            Judicial Jurisdiction
                                        </h4>
                                        <div className="space-y-3">
                                            <div className="flex justify-between items-center">
                                                <span className="text-sm font-medium text-slate-500">Court Type</span>
                                                <span className="text-sm font-bold text-navy-deep dark:text-primary uppercase">{selectedCase.court_type || 'Master'}</span>
                                            </div>
                                            <div className="flex justify-between items-center">
                                                <span className="text-sm font-medium text-slate-500">Seat of Authority</span>
                                                <span className="text-sm font-bold text-slate-900 dark:text-white text-right ml-4">{selectedCase.court_name || 'General'}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-100 dark:border-slate-700">
                                        <h4 className="text-sm uppercase font-bold tracking-widest text-slate-500 mb-4 flex items-center gap-2">
                                            <span className="material-symbols-outlined text-sm text-primary">analytics</span>
                                            Priority Distribution
                                        </h4>
                                        <div className="h-32">
                                            <Bar
                                                data={{
                                                    labels: ['Pending Days', 'No Evidence', 'Hearing'],
                                                    datasets: [{
                                                        data: [0.8, 0.4, 0.6],
                                                        backgroundColor: ['#3B82F6', '#F97316', '#10B981'],
                                                        borderRadius: 6
                                                    }]
                                                }}
                                                options={{
                                                    responsive: true,
                                                    maintainAspectRatio: false,
                                                    plugins: { legend: { display: false } },
                                                    scales: { x: { ticks: { font: { size: 12, weight: 'bold' }, color: '#64748b' }, grid: { display: false } }, y: { display: false, grid: { display: false } } }
                                                }}
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-white dark:bg-slate-800 p-8 rounded-xl border border-slate-100 dark:border-slate-700">
                                    <h4 className="text-sm uppercase font-bold tracking-widest text-slate-500 mb-4 flex items-center gap-2">
                                        <span className="material-symbols-outlined text-sm text-primary">description</span>
                                        Case Abstract
                                    </h4>
                                    <p className="text-base text-slate-600 dark:text-slate-400 leading-relaxed font-medium">
                                        {selectedCase.description || 'No detailed abstract recorded for this judicial matter. Preliminary AI scanning suggests standard procedural compliance.'}
                                    </p>
                                </div>
                            </div>

                            <div className="p-8 bg-slate-50 dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 flex justify-end gap-3">
                                <button onClick={() => setSelectedCase(null)} className="px-6 py-2.5 rounded-lg font-bold text-xs uppercase tracking-widest text-slate-500 hover:text-navy-deep transition-colors">Close Docket</button>
                                <button onClick={() => setSelectedCase(null)} className="px-6 py-2.5 bg-navy-deep text-white rounded-lg font-bold text-xs uppercase tracking-widest hover:bg-navy-deep/90 transition-all shadow-lg shadow-navy-deep/20 flex items-center gap-2">
                                    <span className="material-symbols-outlined text-sm">check_circle</span>
                                    Acknowledge Priority
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Create Case Modal */}
            <AnimatePresence>
                {showCreateModal && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => !formLoading && setShowCreateModal(false)}
                            className="fixed inset-0 bg-navy-deep/60 backdrop-blur-md"
                        />
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.95, opacity: 0, y: 20 }}
                            className="bg-white dark:bg-slate-900 rounded-xl max-w-4xl w-full max-h-[90vh] shadow-3xl overflow-hidden relative z-10 border border-slate-200 dark:border-slate-700 flex flex-col"
                        >
                            <div className="p-8 bg-navy-deep text-white relative flex-shrink-0">
                                <div className="flex justify-between items-start relative z-10">
                                    <div>
                                        <div className="flex items-center gap-3 mb-2">
                                            <span className="material-symbols-outlined text-primary">add_circle</span>
                                            <span className="text-sm font-bold uppercase tracking-[0.3em] text-primary">New Judicial Filing</span>
                                        </div>
                                        <h2 className="font-serif text-3xl font-bold tracking-tight">Initiate Case Docket</h2>
                                    </div>
                                    <button onClick={() => setShowCreateModal(false)} className="p-2 hover:bg-white/10 rounded-lg transition-all text-white/50 hover:text-white">
                                        <span className="material-symbols-outlined">close</span>
                                    </button>
                                </div>
                            </div>

                            <form onSubmit={handleCreateCase} className="p-10 space-y-6 overflow-y-auto custom-scrollbar flex-grow bg-cream/30 dark:bg-slate-900">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-1">Case Number / CNR</label>
                                        <input
                                            required
                                            value={formData.case_number}
                                            onChange={e => setFormData({ ...formData, case_number: e.target.value })}
                                            className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-primary outline-none transition-all"
                                            placeholder="e.g. DL-678-2024"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-1">Case Category</label>
                                        <select
                                            value={formData.case_type}
                                            onChange={e => setFormData({ ...formData, case_type: e.target.value })}
                                            className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-primary outline-none transition-all"
                                        >
                                            <option>Civil</option>
                                            <option>Criminal</option>
                                            <option>Family</option>
                                            <option>Constitutional</option>
                                            <option>Commercial</option>
                                        </select>
                                    </div>
                                    <div className="md:col-span-2 space-y-2">
                                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-1">Case Title (Parties)</label>
                                        <input
                                            required
                                            value={formData.title}
                                            onChange={e => setFormData({ ...formData, title: e.target.value })}
                                            className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-primary outline-none transition-all"
                                            placeholder="e.g. State vs. John Doe"
                                        />
                                    </div>
                                    <div className="md:col-span-2 space-y-2">
                                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-1">Matter Description</label>
                                        <textarea
                                            value={formData.description}
                                            onChange={e => setFormData({ ...formData, description: e.target.value })}
                                            className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-primary outline-none transition-all h-32 resize-none"
                                            placeholder="Brief overview of the legal matter..."
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-1">Filing Date</label>
                                        <input
                                            type="date"
                                            required
                                            value={formData.filing_date}
                                            onChange={e => setFormData({ ...formData, filing_date: e.target.value })}
                                            className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-primary outline-none transition-all"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-1">Judicial Jurisdiction</label>
                                        <select
                                            value={formData.court_type}
                                            onChange={e => setFormData({ ...formData, court_type: e.target.value })}
                                            className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-primary outline-none transition-all"
                                        >
                                            <option>Supreme Court</option>
                                            <option>High Court</option>
                                            <option>District Court</option>
                                            <option>Session Court</option>
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-1">Urgency Level</label>
                                        <select
                                            value={formData.urgency}
                                            onChange={e => setFormData({ ...formData, urgency: e.target.value })}
                                            className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-primary outline-none transition-all"
                                        >
                                            <option>Low</option>
                                            <option>Medium</option>
                                            <option>High</option>
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-1">Evidence Count</label>
                                        <input
                                            type="number"
                                            value={formData.number_of_evidence}
                                            onChange={e => setFormData({ ...formData, number_of_evidence: parseInt(e.target.value) || 0 })}
                                            className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-primary outline-none transition-all"
                                        />
                                    </div>
                                </div>
                                <div className="p-6 bg-primary/5 border border-primary/20 rounded-xl flex items-start gap-3">
                                    <span className="material-symbols-outlined text-primary">info</span>
                                    <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-normal">
                                        Filing a new case will trigger the AI Prioritization Engine. Demographic data, case complexity, and evidence count will be analyzed to assign a priority score.
                                    </p>
                                </div>
                                <div className="flex justify-end gap-4 pt-4">
                                    <button
                                        type="button"
                                        onClick={() => setShowCreateModal(false)}
                                        className="px-6 py-2.5 rounded-lg font-bold text-xs uppercase tracking-widest text-slate-500 hover:text-navy-deep transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={formLoading}
                                        className="px-8 py-2.5 bg-navy-deep text-white rounded-lg font-bold text-xs uppercase tracking-widest hover:bg-navy-deep/90 transition-all shadow-lg shadow-navy-deep/20 flex items-center gap-2 disabled:opacity-50"
                                    >
                                        {formLoading ? (
                                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                        ) : (
                                            <span className="material-symbols-outlined text-sm">send</span>
                                        )}
                                        File Case Docket
                                    </button>
                                </div>
                            </form>
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
