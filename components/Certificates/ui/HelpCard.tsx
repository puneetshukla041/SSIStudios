import React from 'react';
import {
    FiHelpCircle, FiSearch, FiUpload, FiRefreshCw, FiFilter, FiPieChart,
    FiEdit, FiTrash2, FiCheckSquare, FiColumns, FiChevronsRight,
    FiDownload, FiFileText, FiPackage, FiMail, FiBell, FiGlobe, FiLoader, FiX
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
                    className="relative w-full max-w-5xl max-h-[90vh] flex flex-col overflow-hidden rounded-3xl bg-white shadow-2xl ring-1 ring-black/5"
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
                                    <h2 className="text-xl font-bold text-gray-900">Database Guide</h2>
                                    <p className="text-sm font-medium text-gray-500">Master the certificate management system</p>
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
                            className="grid grid-cols-1 gap-6 lg:grid-cols-2 xl:grid-cols-3"
                        >

                            {/* --- Section 1: Core Management (Detailed) --- */}
                            <motion.div variants={itemVariants} className="flex flex-col gap-6 xl:col-span-2">
                                <SectionCard title="Core Management">
                                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                        <FeatureItem 
                                            icon={<FiSearch />} label="Smart Search" 
                                            desc="Instantly find certificates by name or ID." color="indigo" 
                                        />
                                        <FeatureItem 
                                            icon={<FiFilter />} label="Hospital Filtering" 
                                            desc="Isolate records by specific hospital or branch." color="purple" 
                                        />
                                        <FeatureItem 
                                            icon={<FiUpload />} label="Batch Upload" 
                                            desc="Import spreadsheets. Triggers auto-sync." color="blue" 
                                        />
                                        <FeatureItem 
                                            icon={<FiRefreshCw />} label="Live Sync" 
                                            desc="Fetch the absolute latest data from the server." color="cyan" 
                                        />
                                    </div>
                                </SectionCard>

                                <SectionCard title="Record Operations">
                                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                                        <MiniFeature icon={<FiEdit />} label="Edit Details" />
                                        <MiniFeature icon={<FiTrash2 />} label="Single Delete" />
                                        <MiniFeature icon={<FiCheckSquare />} label="Bulk Actions" />
                                        <MiniFeature icon={<FiColumns />} label="Sort Columns" />
                                        <MiniFeature icon={<FiChevronsRight />} label="Pagination" />
                                        <MiniFeature icon={<FiPieChart />} label="Data Analytics" />
                                    </div>
                                </SectionCard>
                            </motion.div>

                            {/* --- Section 2: Output & System (Side Column) --- */}
                            <motion.div variants={itemVariants} className="flex flex-col gap-6">
                                
                                {/* Deliverables */}
                                <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-900/5">
                                    <h3 className="mb-4 flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-emerald-600">
                                        <FiPackage className="h-4 w-4" /> Deliverables
                                    </h3>
                                    <ul className="space-y-4">
                                        <ListItem icon={<FiFileText className="text-emerald-500" />} title="Generate PDF" desc="Create V1/V2 certificates." />
                                        <ListItem icon={<FiPackage className="text-emerald-500" />} title="Bulk ZIP" desc="Download multiple PDFs at once." />
                                        <ListItem icon={<FiDownload className="text-teal-500" />} title="Export CSV" desc="Get raw data for Excel." />
                                        <ListItem icon={<FiMail className="text-sky-500" />} title="Email Client" desc="Send directly to recipients." />
                                    </ul>
                                </div>

                                {/* System Feedback */}
                                <div className="rounded-2xl bg-gradient-to-br from-slate-800 to-gray-900 p-6 text-white shadow-lg">
                                    <h3 className="mb-4 flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-gray-400">
                                        <FiBell className="h-4 w-4" /> System Feedback
                                    </h3>
                                    <div className="space-y-4 text-sm text-gray-300">
                                        <div className="flex items-start gap-3">
                                            <FiGlobe className="mt-1 h-4 w-4 text-blue-400" />
                                            <span><strong className="text-white">Live Highlights:</strong> Recently updated rows glow briefly.</span>
                                        </div>
                                        <div className="flex items-start gap-3">
                                            <FiLoader className="mt-1 h-4 w-4 text-yellow-400" />
                                            <span><strong className="text-white">Status Indicators:</strong> Spinners show active sync/delete processes.</span>
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

// --- Sub-Components for Clean Code ---

const SectionCard = ({ title, children }: { title: string, children: React.ReactNode }) => (
    <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-900/5 transition-shadow hover:shadow-md">
        <h3 className={`mb-5 text-lg font-bold text-gray-900 flex items-center gap-2`}>
           {title}
        </h3>
        {children}
    </div>
);

const FeatureItem = ({ icon, label, desc, color }: { icon: React.ReactNode, label: string, desc: string, color: string }) => {
    // Map colors to Tailwind classes dynamically or static for now
    const colorClasses: Record<string, string> = {
        indigo: "bg-indigo-50 text-indigo-600",
        purple: "bg-purple-50 text-purple-600",
        blue: "bg-blue-50 text-blue-600",
        cyan: "bg-cyan-50 text-cyan-600",
    };
    
    return (
        <div className="group flex items-start gap-4 rounded-xl border border-gray-100 p-3 transition-colors hover:border-gray-200 hover:bg-gray-50/50">
            <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${colorClasses[color] || 'bg-gray-100 text-gray-600'}`}>
                {/* 💡 FIX: Explicitly cast to ReactElement<{ className?: string }> */}
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
        <span className="text-gray-400">{icon}</span>
        {label}
    </div>
);

const ListItem = ({ icon, title, desc }: { icon: React.ReactNode, title: string, desc: string }) => (
    <li className="flex items-start gap-3">
        <div className="mt-1 shrink-0 rounded-full bg-gray-50 p-1.5 ring-1 ring-gray-100">
            {/* 💡 FIX: Explicitly cast to ReactElement<{ className?: string }> */}
            {React.cloneElement(icon as React.ReactElement<{ className?: string }>, { className: "h-3.5 w-3.5" })}
        </div>
        <div>
            <span className="block text-sm font-semibold text-gray-900">{title}</span>
            <span className="block text-xs text-gray-500">{desc}</span>
        </div>
    </li>
);

export default HelpCard;