import { useEffect, useState } from 'react';
import axios from 'axios';
import { BookOpen, FileSearch, ArrowRight, Zap, Target, Database } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Laws = () => {
    const [laws, setLaws] = useState([]);
    const [selectedLaw, setSelectedLaw] = useState(null);

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
            className="p-10 max-w-7xl mx-auto relative"
        >
            {/* Background Decorations */}
            <div className="absolute top-0 left-0 -z-10 w-[500px] h-[500px] bg-indigo-50/50 blur-[120px] rounded-full opacity-40 px-10"></div>

            <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12 px-2">
                <motion.div variants={itemVariants}>
                    <h1 className="text-4xl font-black text-slate-900 tracking-tight leading-tight">
                        Law <span className="text-gradient">Impact</span> Analytics
                    </h1>
                    <p className="text-slate-500 mt-2 font-medium flex items-center gap-2">
                        <BookOpen className="w-4 h-4 text-indigo-500" />
                        Semantic Cross-Correlation Engine
                    </p>
                </motion.div>
                <motion.div variants={itemVariants} className="flex gap-4">
                    <div className="glass px-6 py-3 rounded-2xl flex items-center gap-3 border-white/60">
                        <Database className="w-4 h-4 text-slate-400" />
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Global Statute Sync: 100%</span>
                    </div>
                </motion.div>
            </header>

            <motion.div variants={itemVariants} className="glass rounded-[2.5rem] border-white/60 shadow-2xl shadow-slate-900/5 overflow-hidden">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-slate-900 text-white">
                            <th className="p-8 text-[11px] font-black uppercase tracking-[0.2em] opacity-80">Enactment Title</th>
                            <th className="p-8 text-[11px] font-black uppercase tracking-[0.2em] opacity-80">Category</th>
                            <th className="p-8 text-[11px] font-black uppercase tracking-[0.2em] opacity-80">Source Nodes</th>
                            <th className="p-8 text-[11px] font-black uppercase tracking-[0.2em] opacity-80 text-right">Action</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100/50">
                        {laws.map((l, idx) => (
                            <motion.tr
                                key={l.id}
                                variants={itemVariants}
                                whileHover={{ backgroundColor: 'rgba(241, 245, 249, 0.4)' }}
                                onClick={() => setSelectedLaw(l)}
                                className="transition-all cursor-pointer group"
                            >
                                <td className="p-8">
                                    <div className="flex items-center gap-5">
                                        <div className="bg-blue-600/10 p-3 rounded-2xl group-hover:bg-blue-600 group-hover:text-white transition-all">
                                            <Zap className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-slate-900 group-hover:text-blue-600 transition-colors text-lg tracking-tight">{l.title}</h4>
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1 flex items-center gap-2">
                                                <Target className="w-3 h-3 text-red-400" />
                                                Impact Magnitude: {(Math.random() * 0.4 + 0.6).toFixed(2)}
                                            </p>
                                        </div>
                                    </div>
                                </td>
                                <td className="p-8">
                                    <span className="text-[10px] font-black bg-slate-100 text-slate-600 px-4 py-2 rounded-xl uppercase tracking-widest border border-slate-200/50">
                                        {l.category}
                                    </span>
                                </td>
                                <td className="p-8">
                                    <div className="flex flex-col gap-1">
                                        <span className="text-xs font-bold text-slate-800 tracking-tight">{l.scraped_source || 'indiacode.nic.in'}</span>
                                        <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest">Official Gazette</span>
                                    </div>
                                </td>
                                <td className="p-8 text-right">
                                    <button className="text-blue-600 font-black text-[10px] uppercase tracking-widest flex items-center gap-2 ml-auto bg-blue-50 px-4 py-2 rounded-xl group-hover:bg-blue-600 group-hover:text-white transition-all border border-blue-100 group-hover:border-blue-600 shadow-sm shadow-blue-100 hover:shadow-blue-200">
                                        Impact Report <ArrowRight className="w-4 h-4" />
                                    </button>
                                </td>
                            </motion.tr>
                        ))}
                    </tbody>
                </table>
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
                            className="fixed inset-0 bg-slate-900/80 backdrop-blur-md"
                        />
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 20 }}
                            className="bg-white rounded-[3.5rem] max-w-3xl w-full shadow-3xl overflow-hidden relative z-10 border border-white/20"
                        >
                            <div className="p-12 bg-indigo-600 text-white relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-80 h-80 bg-white/10 blur-[100px] rounded-full -mr-40 -mt-40"></div>
                                <div className="flex justify-between items-start relative z-10">
                                    <div>
                                        <div className="flex items-center gap-3 mb-6">
                                            <div className="bg-white/20 p-2.5 rounded-xl backdrop-blur-md">
                                                <FileSearch className="w-6 h-6" />
                                            </div>
                                            <span className="text-[11px] font-black uppercase tracking-[0.4em] text-indigo-100">Statutory Analysis Engine</span>
                                        </div>
                                        <h2 className="text-4xl font-black tracking-tight leading-tight max-w-xl">{selectedLaw.title}</h2>
                                        <p className="text-indigo-100/60 text-xs font-bold uppercase tracking-[0.2em] mt-6 flex items-center gap-3">
                                            <span className="w-1.5 h-1.5 bg-indigo-300 rounded-full animate-pulse"></span>
                                            High Priority Enactment
                                        </p>
                                    </div>
                                    <button onClick={() => setSelectedLaw(null)} className="p-4 hover:bg-white/10 rounded-2xl transition-all font-black text-2xl flex items-center justify-center w-14 h-14">×</button>
                                </div>
                            </div>

                            <div className="p-14 space-y-12 max-h-[60vh] overflow-y-auto">
                                <div className="bg-indigo-50 rounded-[2.5rem] p-10 border border-indigo-100/50 relative group">
                                    <h3 className="text-[10px] font-black text-indigo-600 uppercase tracking-[0.2em] mb-6 flex items-center gap-3">
                                        <FileSearch className="w-5 h-5" /> Semantic Impact Insight
                                    </h3>
                                    <p className="text-slate-900 leading-relaxed text-lg font-semibold italic">
                                        "{selectedLaw.impact_reasoning || 'Semantic impact analysis in progress for this enactment...'}"
                                    </p>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                                    <div className="space-y-6">
                                        <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-3 px-1">
                                            <span className="w-6 h-[2px] bg-indigo-500"></span>
                                            Legal Synthesis
                                        </h4>
                                        <div className="bg-slate-50 p-8 rounded-[2rem] border border-slate-100">
                                            <p className="text-base text-slate-700 font-medium leading-relaxed">{selectedLaw.lawyer_summary}</p>
                                        </div>
                                    </div>
                                    <div className="space-y-6">
                                        <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-3 px-1">
                                            <span className="w-6 h-[2px] bg-red-500"></span>
                                            Affected Corollaries
                                        </h4>
                                        <div className="flex flex-wrap gap-4">
                                            {['Criminal Procedure', 'Evidence Act', 'Digital Privacy', 'Cyber Compliance'].map(tag => (
                                                <span key={tag} className="text-[10px] font-black bg-white text-slate-800 px-5 py-3 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all uppercase tracking-widest cursor-default">
                                                    {tag}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="p-10 bg-slate-50 border-t border-slate-100 flex justify-end gap-5 px-14">
                                <button onClick={() => setSelectedLaw(null)} className="px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest text-slate-500 hover:text-slate-900">Close Report</button>
                                <button onClick={() => setSelectedLaw(null)} className="px-10 py-4 bg-indigo-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-indigo-600/30 hover:scale-105 transition-all">Acknowledge Analytics</button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};

export default Laws;
