import React from 'react';
import {
    FiHelpCircle, FiSearch, FiUpload, FiRefreshCw, FiFilter, FiPieChart,
    FiEdit, FiTrash2, FiCheckSquare, FiUsers, FiActivity,
    FiDownload, FiFileText, FiPackage, FiMail, FiBell, FiGlobe, FiLoader, FiX, FiBarChart2
} from 'react-icons/fi';
import { motion, AnimatePresence, Variants } from 'framer-motion';

interface HelpCardProps {
    onClose: () => void;
}

const HelpCard: React.FC<HelpCardProps> = ({ onClose }) => {
    
    // Animation Variants
    const backdropVariants: Variants = {
        hidden: { opacity: 0 },
        visible: { opacity: 1 },
        exit: { opacity: 0 }
    };

    const modalVariants: Variants = {
        hidden: { opacity: 0, scale: 0.95, y: 20 },
        visible: { 
            opacity: 1, 
            scale: 1, 
            y: 0,
            transition: { type: "spring", bounce: 0.3, duration: 0.5 }
        },
        exit: { 
            opacity: 0, 
            scale: 0.95, 
            y: 10, 
            transition: { duration: 0.2 } 
        }
    };

    const containerVariants: Variants = {
        visible: { transition: { staggerChildren: 0.05, delayChildren: 0.1 } }
    };

    const itemVariants: Variants = {
        hidden: { opacity: 0, y: 10 },
        visible: { opacity: 1, y: 0 }
    };

    return (
        <AnimatePresence>
            {/* Backdrop with Glassmorphism */}
            <motion.div
                variants={backdropVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                className="fixed inset-0 z-[1100] flex items-center justify-center bg-gray-900/40 backdrop-blur-sm p-4 sm:p-6"
                onClick={onClose}
            >
                {/* Modal Container */}
                <motion.div
                    variants={modalVariants}
                    className="relative w-full max-w-6xl max-h-[90vh] flex flex-col overflow-hidden rounded-3xl bg-white shadow-2xl ring-1 ring-black/5"
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* --- Header Section --- */}
                    <div className="flex-none border-b border-gray-100 bg-white/80 px-8 py-6 backdrop-blur-md sticky top-0 z-20">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 ring-1 ring-indigo-100">
                                    <FiHelpCircle className="h-6 w-6" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold text-gray-900">Platform Features Guide</h2>
                                    <p className="text-sm font-medium text-gray-500">Comprehensive overview of database capabilities</p>
                                </div>
                            </div>
                            
                            <button
                                onClick={onClose}
                                className="group rounded-full border border-gray-200 p-2 text-gray-400 transition-colors hover:bg-gray-50 hover:text-gray-900"
                            >
                                <FiX className="h-5 w-5 transition-transform group-hover:rotate-90" />
                            </button>
                        </div>
                    </div>

                    {/* --- Scrollable Content --- */}
                    <div className="flex-1 overflow-y-auto bg-gray-50/50 px-8 py-8">
                        <motion.div 
                            variants={containerVariants}
                            initial="hidden"
                            animate="visible"
                            className="grid grid-cols-1 gap-6 lg:grid-cols-3"
                        >

                            {/* --- Section 1: Analytics & Insights (New!) --- */}
                            <motion.div variants={itemVariants} className="flex flex-col gap-6 lg:col-span-2">
                                <SectionCard title="Analytics & Insights">
                                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                        <FeatureItem 
                                            icon={<FiBarChart2 />} label="Live Counters" 
                                            desc="Real-time tracking of Total Certificates, Active Hospitals, Doctors, and Staff." color="indigo" 
                                        />
                                        <FeatureItem 
                                            icon={<FiPieChart />} label="Hospital Distribution" 
                                            desc="Interactive pie charts visualizing certificate density across different hospitals." color="purple" 
                                        />
                                        <FeatureItem 
                                            icon={<FiUsers />} label="Smart Role Detection" 
                                            desc="Automatically classifies records as 'Doctor' or 'Staff' based on name prefixes." color="blue" 
                                        />
                                        <FeatureItem 
                                            icon={<FiActivity />} label="Database Health" 
                                            desc="Monitors total database records vs currently displayed page records." color="cyan" 
                                        />
                                    </div>
                                </SectionCard>

                                <SectionCard title="Database Management">
                                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                         <FeatureItem 
                                            icon={<FiUpload />} label="Batch Upload" 
                                            desc="Bulk import spreadsheet data. Triggers automatic dashboard updates." color="emerald" 
                                        />
                                         <FeatureItem 
                                            icon={<FiRefreshCw />} label="Global Sync" 
                                            desc="One-click synchronization to fetch the absolute latest data from the server." color="orange" 
                                        />
                                        <FeatureItem 
                                            icon={<FiSearch />} label="Deep Search" 
                                            desc="Instant filtering across Names, IDs, and Hospital fields." color="pink" 
                                        />
                                        <FeatureItem 
                                            icon={<FiFilter />} label="Hospital Filters" 
                                            desc="Isolate specific hospital branches for targeted reporting." color="rose" 
                                        />
                                    </div>
                                </SectionCard>
                            </motion.div>

                            {/* --- Section 2: Actions & Deliverables (Side Column) --- */}
                            <motion.div variants={itemVariants} className="flex flex-col gap-6">
                                
                                {/* Quick Actions Grid */}
                                <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-900/5">
                                    <h3 className="mb-4 flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-slate-600">
                                        <FiCheckSquare className="h-4 w-4" /> Quick Actions
                                    </h3>
                                    <div className="grid grid-cols-2 gap-3">
                                        <MiniFeature icon={<FiEdit />} label="Edit" />
                                        <MiniFeature icon={<FiTrash2 />} label="Delete" />
                                        <MiniFeature icon={<FiFileText />} label="PDF View" />
                                        <MiniFeature icon={<FiMail />} label="Email" />
                                    </div>
                                </div>

                                {/* Deliverables */}
                                <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-900/5">
                                    <h3 className="mb-4 flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-emerald-600">
                                        <FiPackage className="h-4 w-4" /> Export Options
                                    </h3>
                                    <ul className="space-y-4">
                                        {/* UPDATED: Removed V1/V2 labels */}
                                        <ListItem 
                                            icon={<FiFileText className="text-emerald-500" />} 
                                            title="Certificate PDF" 
                                            desc="Proctorship & Training formats." 
                                        />
                                        <ListItem icon={<FiPackage className="text-emerald-500" />} title="Bulk ZIP Download" desc="Download complete sets at once." />
                                        <ListItem icon={<FiDownload className="text-teal-500" />} title="CSV Export" desc="Raw data export for Excel analysis." />
                                        <ListItem icon={<FiGlobe className="text-sky-500" />} title="Public Verification" desc="QR code compatible links." />
                                    </ul>
                                </div>

                                {/* System Feedback */}
                                <div className="rounded-2xl bg-gradient-to-br from-slate-800 to-gray-900 p-6 text-white shadow-lg">
                                    <h3 className="mb-4 flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-gray-400">
                                        <FiBell className="h-4 w-4" /> System Status
                                    </h3>
                                    <div className="space-y-4 text-sm text-gray-300">
                                        <div className="flex items-start gap-3">
                                            <FiLoader className="mt-1 h-4 w-4 text-indigo-400 animate-spin-slow" />
                                            <span><strong className="text-white">Live Sync:</strong> Dashboard updates automatically on upload.</span>
                                        </div>
                                        <div className="flex items-start gap-3">
                                            <FiUsers className="mt-1 h-4 w-4 text-emerald-400" />
                                            <span><strong className="text-white">Staff Sorting:</strong> Auto-separates Medical vs Non-Medical staff.</span>
                                        </div>
                                    </div>
                                </div>

                            </motion.div>

                        </motion.div>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};

// --- Sub-Components ---

const SectionCard = ({ title, children }: { title: string, children: React.ReactNode }) => (
    <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-900/5 transition-shadow hover:shadow-md h-full">
        <h3 className={`mb-5 text-lg font-bold text-gray-900 flex items-center gap-2`}>
           {title}
        </h3>
        {children}
    </div>
);

const FeatureItem = ({ icon, label, desc, color }: { icon: React.ReactNode, label: string, desc: string, color: string }) => {
    const colorClasses: Record<string, string> = {
        indigo: "bg-indigo-50 text-indigo-600",
        purple: "bg-purple-50 text-purple-600",
        blue: "bg-blue-50 text-blue-600",
        cyan: "bg-cyan-50 text-cyan-600",
        emerald: "bg-emerald-50 text-emerald-600",
        orange: "bg-orange-50 text-orange-600",
        pink: "bg-pink-50 text-pink-600",
        rose: "bg-rose-50 text-rose-600",
    };
    
    return (
        <div className="group flex items-start gap-4 rounded-xl border border-gray-100 p-3 transition-colors hover:border-gray-200 hover:bg-gray-50/50">
            <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${colorClasses[color] || 'bg-gray-100 text-gray-600'}`}>
                {React.cloneElement(icon as React.ReactElement<{ className?: string }>, { className: "h-5 w-5" })}
            </div>
            <div>
                <h4 className="font-semibold text-gray-900">{label}</h4>
                <p className="text-xs leading-relaxed text-gray-500">{desc}</p>
            </div>
        </div>
    );
};

const MiniFeature = ({ icon, label }: { icon: React.ReactNode, label: string }) => (
    <div className="flex items-center gap-3 rounded-lg bg-gray-50 px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100 hover:text-gray-900">
        <span className="text-gray-400">
            {React.cloneElement(icon as React.ReactElement<{ className?: string }>, { className: "h-4 w-4" })}
        </span>
        {label}
    </div>
);

const ListItem = ({ icon, title, desc }: { icon: React.ReactNode, title: string, desc: string }) => (
    <li className="flex items-start gap-3">
        <div className="mt-1 shrink-0 rounded-full bg-gray-50 p-1.5 ring-1 ring-gray-100">
            {React.cloneElement(icon as React.ReactElement<{ className?: string }>, { className: "h-3.5 w-3.5" })}
        </div>
        <div>
            <span className="block text-sm font-semibold text-gray-900">{title}</span>
            <span className="block text-xs text-gray-500">{desc}</span>
        </div>
    </li>
);

export default HelpCard;