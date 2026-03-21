import { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { BookOpen, FileSearch, ArrowRight, Zap, Target, Database, Bell, ExternalLink } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Laws = () => {
    const navigate = useNavigate();
    const [laws, setLaws] = useState([]);
    const [selectedLaw, setSelectedLaw] = useState(null);
    const [emailLoading, setEmailLoading] = useState(false);
    const user = JSON.parse(localStorage.getItem('user'));

    useEffect(() => {
        const fetchLaws = async () => {
            try {
                const { data } = await axios.get('/api/laws', {
                    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
                });
                setLaws(data);
            } catch (err) {
                console.error(err);
            }
        };
        fetchLaws();
    }, []);

    const handleEmailReport = async (lawId) => {
        try {
            setEmailLoading(true);
            const config = { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } };
            await axios.post(`/api/laws/${lawId}/email`, {}, config);
            alert("✅ Judicial report dispatched to your verified email.");
        } catch (err) {
            console.error(err);
            alert("❌ Dispatch failed. Please verify your connection.");
        } finally {
            setEmailLoading(false);
        }
    };

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
    };

    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: { y: 0, opacity: 1 }
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
                        Judicary <span className="text-primary italic">Law Impact Analysis</span>
                    </h1>
                    <p className="text-slate-500 mt-1 text-sm italic flex items-center gap-2">
                        <span className="material-symbols-outlined text-primary text-sm">history_edu</span>
                        Law Impact Intelligence Dashboard
                    </p>
                </motion.div>
                <motion.div variants={itemVariants} className="flex gap-4">
                    <div className="bg-white dark:bg-slate-900 px-4 py-2 rounded-lg flex items-center gap-3 border border-slate-200 dark:border-slate-800 shadow-sm">
                        <span className="material-symbols-outlined text-slate-400 text-sm">database</span>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Act Sync: 100%</span>
                    </div>
                </motion.div>
            </header>

            <motion.div variants={itemVariants} className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden">
                <div className="px-8 py-6 border-b border-slate-100 dark:border-slate-800 bg-cream/30 flex flex-col md:flex-row justify-between items-center gap-6">
                    <div className="flex items-center gap-4">
                        <div className="bg-navy-deep p-2 rounded-lg">
                            <span className="material-symbols-outlined text-primary">gavel</span>
                        </div>
                        <h3 className="font-serif text-lg font-bold text-navy-deep dark:text-white">
                            Law Impact Analysis
                        </h3>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="text-[10px] uppercase tracking-widest text-slate-500 bg-slate-50 dark:bg-slate-800/50 font-bold">
                                <th className="px-8 py-4 border-b border-slate-100 dark:border-slate-800">Enactment Title</th>
                                <th className="px-8 py-4 border-b border-slate-100 dark:border-slate-800">Category</th>
                                <th className="px-8 py-4 border-b border-slate-100 dark:border-slate-800 text-center">Affected Cases</th>
                                <th className="px-8 py-4 border-b border-slate-100 dark:border-slate-800">Legal Source</th>
                                <th className="px-8 py-4 border-b border-slate-100 dark:border-slate-800 text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                            {laws.map((l, idx) => (
                                <tr
                                    key={l.id}
                                    onClick={async () => {
                                        try {
                                            const { data } = await axios.get(`/api/laws/${l.id}`, {
                                                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
                                            });
                                            setSelectedLaw(data);
                                        } catch (err) {
                                            console.error(err);
                                            setSelectedLaw(l); // Fallback to list data
                                        }
                                    }}
                                    className={`hover:bg-cream/40 dark:hover:bg-slate-800/40 transition-colors cursor-pointer group ${idx % 2 === 1 ? 'bg-cream/20 dark:bg-slate-800/10' : ''}`}
                                >
                                    <td className="px-8 py-6">
                                        <div className="flex items-center gap-5">
                                            <div className="bg-primary/10 p-2.5 rounded-lg text-primary group-hover:bg-primary group-hover:text-white transition-all">
                                                <span className="material-symbols-outlined">menu_book</span>
                                            </div>
                                            <div>
                                                <p className="font-bold text-slate-900 dark:text-slate-100 text-sm group-hover:text-primary transition-colors">{l.title}</p>
                                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1 italic">
                                                    Section 4A Compliance Check
                                                </p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <span className="text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 px-3 py-1 rounded uppercase tracking-widest border border-slate-200 dark:border-slate-700">
                                            {l.category}
                                        </span>
                                    </td>
                                    <td className="px-8 py-6 text-center">
                                        <div className="flex flex-col items-center">
                                            <span className="text-sm font-black text-primary bg-primary/5 px-3 py-1 rounded-full border border-primary/10">
                                                {l.affected_count || 0}
                                            </span>
                                            <span className="text-[8px] font-bold text-slate-400 uppercase tracking-tighter mt-1">Pending Matters</span>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <div className="flex flex-col gap-0.5">
                                            <span className="text-xs font-bold text-slate-800 dark:text-slate-200">{l.scraped_source || 'Government Gazette'}</span>
                                            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Verified Repository</span>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6 text-right">
                                        <button onClick={() => setSelectedLaw(l)} className="text-primary font-bold text-[10px] uppercase tracking-widest flex items-center gap-2 ml-auto bg-primary/10 px-4 py-2 rounded-lg group-hover:bg-primary group-hover:text-white transition-all border border-primary/20 hover:shadow-lg">
                                            Impact Detail <span className="material-symbols-outlined text-sm">arrow_forward</span>
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </motion.div>

            {/* Law Impact Modal */}
            <AnimatePresence>
                {selectedLaw && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setSelectedLaw(null)}
                            className="fixed inset-0 bg-navy-deep/60 backdrop-blur-md"
                        />
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.95, opacity: 0, y: 20 }}
                            className="bg-white dark:bg-slate-900 rounded-xl max-w-5xl w-full max-h-[90vh] shadow-3xl overflow-hidden relative z-10 border border-slate-200 dark:border-slate-700 flex flex-col"
                        >
                            <div className="p-8 bg-navy-deep text-white relative flex-shrink-0">
                                <div className="absolute top-0 right-0 w-80 h-80 bg-primary/10 blur-[100px] rounded-full -mr-40 -mt-40"></div>
                                <div className="flex justify-between items-start relative z-10">
                                    <div>
                                        <div className="flex items-center gap-3 mb-2">
                                            <span className="material-symbols-outlined text-primary">auto_awesome</span>
                                            <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-primary">Statutory Analysis Engine</span>
                                        </div>
                                        <h2 className="font-serif text-2xl font-bold tracking-tight">{selectedLaw.title}</h2>
                                        <p className="text-primary/70 text-[10px] font-bold uppercase tracking-widest mt-2">Active Amendment: 2024 V.1</p>
                                    </div>
                                    <button onClick={() => setSelectedLaw(null)} className="p-2 hover:bg-white/10 rounded-lg transition-all text-white/50 hover:text-white">
                                        <span className="material-symbols-outlined">close</span>
                                    </button>
                                </div>
                            </div>

                            <div className="p-10 space-y-8 overflow-y-auto custom-scrollbar flex-grow bg-cream/30 dark:bg-slate-900">
                                <div className="space-y-4 font-serif text-slate-800 dark:text-slate-200 leading-relaxed italic border-l-2 border-primary/30 pl-8 bg-white dark:bg-slate-800/80 p-8 rounded-xl shadow-sm">
                                    <h3 className="text-[10px] font-bold text-primary uppercase tracking-[0.2em] mb-2 flex items-center gap-2">
                                        <span className="material-symbols-outlined text-sm">verified</span> JUDICIAL IMPACT TRANSPARENCY
                                    </h3>
                                    <p className="text-base">
                                        "{selectedLaw.impact_reasoning || 'This enactment dictates strict procedural adherence to digital evidence protocols as per the Latest Judicial Guidelines.'}"
                                    </p>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div className="space-y-4">
                                        <h4 className="text-[10px] uppercase font-bold tracking-widest text-slate-500 flex items-center gap-2">
                                            <span className="material-symbols-outlined text-sm text-primary">description</span>
                                            {user?.role === 'citizen' ? 'Plain English Summary' : 'Legal Synthesis'}
                                        </h4>
                                        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-100 dark:border-slate-700 shadow-sm font-medium text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                                            <p>{user?.role === 'citizen' ? selectedLaw.citizen_summary : selectedLaw.lawyer_summary}</p>
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <h4 className="text-[10px] uppercase font-bold tracking-widest text-slate-500 flex items-center gap-2">
                                            <span className="material-symbols-outlined text-sm text-primary">tags</span>
                                            Regulatory Corollaries
                                        </h4>
                                        <div className="flex flex-wrap gap-2">
                                            {['Procedural Equity', 'Evidence Standards', 'Trial Efficiency', 'Digital Records'].map(tag => (
                                                <span key={tag} className="text-[9px] font-bold bg-white dark:bg-slate-800 text-navy-deep dark:text-primary px-3 py-2 rounded border border-slate-200 dark:border-slate-700 shadow-sm uppercase tracking-widest">
                                                    {tag}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                {selectedLaw.affecting_cases && selectedLaw.affecting_cases.length > 0 && (
                                    <div className="space-y-6">
                                        <h4 className="text-[10px] uppercase font-bold tracking-widest text-slate-500 flex items-center gap-2 px-1">
                                            <span className="material-symbols-outlined text-sm text-primary">hub</span>
                                            AI-Validated Jurisprudential Impact ({selectedLaw.affecting_cases.length})
                                        </h4>
                                        <div className="space-y-4">
                                            {selectedLaw.affecting_cases.map(caseItem => (
                                                <div
                                                    key={caseItem.id}
                                                    onClick={() => navigate('/cases')}
                                                    className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-100 dark:border-slate-700 shadow-sm hover:shadow-lg transition-all flex flex-col cursor-pointer group/card"
                                                >
                                                    <div className="flex items-center justify-between mb-4">
                                                        <div>
                                                            <div className="flex items-center gap-2 mb-1">
                                                                <span className="text-[9px] font-bold text-primary uppercase tracking-widest bg-primary/10 px-2 py-0.5 rounded">
                                                                    {caseItem.case_number}
                                                                </span>
                                                                <span className="text-[9px] font-bold text-emerald-500 uppercase tracking-widest flex items-center gap-1">
                                                                    <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
                                                                    Linked • Score: {caseItem.raw_score || 'N/A'}
                                                                </span>
                                                            </div>
                                                            <div className="flex gap-2 mb-2">
                                                                {caseItem.section_matches?.map(sec => (
                                                                    <span key={sec} className="text-[8px] font-bold bg-primary/20 text-primary px-1.5 py-0.5 rounded border border-primary/30 uppercase">
                                                                        {sec}
                                                                    </span>
                                                                ))}
                                                            </div>
                                                            <h5 className="text-sm font-bold text-slate-900 dark:text-white group-hover/card:text-primary transition-colors">
                                                                {caseItem.title}
                                                            </h5>
                                                        </div>
                                                        <span className="material-symbols-outlined text-slate-300 group-hover/card:text-primary transition-colors">open_in_new</span>
                                                    </div>
                                                    <div className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-lg border border-slate-50 dark:border-slate-800 italic text-xs text-slate-600 dark:text-slate-400 leading-relaxed font-serif">
                                                        "{caseItem.how_it_affects || 'Semantic analysis identifies direct correlation between this statute and the pending case vectors.'}"
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="p-8 bg-slate-50 dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 flex justify-end gap-3">
                                <button
                                    onClick={() => handleEmailReport(selectedLaw.id)}
                                    disabled={emailLoading}
                                    className="px-6 py-2.5 rounded-lg font-bold text-[10px] uppercase tracking-widest bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-primary hover:bg-primary/5 transition-all flex items-center gap-2 shadow-sm disabled:opacity-50"
                                >
                                    <span className="material-symbols-outlined text-sm">mail</span>
                                    {emailLoading ? 'Dispatching...' : 'Export Intelligence Report'}
                                </button>
                                <button onClick={() => setSelectedLaw(null)} className="px-6 py-2.5 bg-navy-deep text-white rounded-lg font-bold text-[10px] uppercase tracking-widest hover:bg-navy-deep/90 transition-all shadow-lg shadow-navy-deep/20 flex items-center gap-2">
                                    <span className="material-symbols-outlined text-sm">check_circle</span>
                                    Acknowledge
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};

export default Laws;
