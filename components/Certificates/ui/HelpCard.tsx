// components/Certificates/ui/HelpCard.tsx

import React from 'react';
import {
    FiHelpCircle,
    FiSearch,
    FiUpload,
    FiRefreshCw,
    FiFilter,
    FiPieChart,
    FiEdit,
    FiTrash2,
    FiCheckSquare,
    FiColumns,
    FiChevronsRight,
    FiDownload,
    FiFileText,
    FiPackage,
    FiMail,
    FiBell,
    FiGlobe,
    FiLoader,
    FiX,
} from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';

interface HelpCardProps {
    onClose: () => void;
}

const HelpCard: React.FC<HelpCardProps> = ({ onClose }) => {
    return (
        <AnimatePresence>
            {/* FULL SCREEN OVERLAY BACKDROP */}
            <motion.div
                // ANIMATION 1: Backdrop fade in/out
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }} // Fast transition for the backdrop
                className="fixed inset-0 z-40 bg-gray-100 flex justify-center items-start" 
                onClick={onClose} 
            >
                {/* HELP CARD CONTENT */}
                <motion.div
                    // Opening Animation (Spring for a nice pop-in)
                    initial={{ opacity: 0, scale: 0.9, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    // --- UPDATED CLOSING ANIMATION ---
                    // Using a smooth, fast 'tween' transition to exit quickly and gracefully.
                    exit={{ opacity: 0, scale: 0.95, y: -20 }}
                    transition={{ 
                        type: 'tween', // Changed type to tween for smoother exit
                        duration: 0.25, // Quick closing duration
                        ease: 'easeOut'
                    }} 
                    className="mx-auto mt-4 mb-8 
                                w-[95%] max-w-7xl max-h-[90vh] overflow-y-auto p-6 rounded-xl 
                                bg-white shadow-2xl ring-1 ring-gray-900/5 
                                text-gray-800 font-sans 
                                flex flex-col text-sm" 
                    onClick={(e) => e.stopPropagation()} 
                >
                    {/* Header */}
                    <div className="flex justify-between items-start border-b border-gray-100 pb-3 mb-4 sticky top-0 bg-white z-10">
                        <h2 className="text-xl font-bold text-indigo-700 flex items-center">
                            <FiHelpCircle className="mr-2 h-6 w-6 text-indigo-500" />
                            Database Guide
                        </h2>
                        <button
                            onClick={onClose}
                            className="text-gray-400 hover:text-gray-700 transition-colors p-1 -mt-1 -mr-1 cursor-pointer"
                            aria-label="Close"
                        >
                            <FiX className="h-5 w-5" />
                        </button>
                    </div>

                    <div className="flex flex-col md:flex-row gap-6 text-xs sm:text-sm"> 

                        {/* Left Column */}
                        <div className="md:w-2/3 space-y-6">
                            <section>
                                <h3 className="font-semibold text-lg text-gray-800 mb-2">Core Functions</h3>
                                <p className="text-gray-600 mb-4 leading-normal">
                                    Manage, filter, edit, and export certificate records using the following tools.
                                </p>
                                <ul className="list-none space-y-3 pl-0 text-gray-700">
                                    <li className="flex items-start">
                                        <FiSearch className="mr-3 h-4 w-4 text-green-500 flex-shrink-0 mt-0.5" />
                                        <p>
                                            <strong className="font-semibold text-gray-800">Search:</strong> Find certificates by name or number. Results update instantly.
                                        </p>
                                    </li>
                                    <li className="flex items-start">
                                        <FiUpload className="mr-3 h-4 w-4 text-indigo-500 flex-shrink-0 mt-0.5" />
                                        <p>
                                            <strong className="font-semibold text-gray-800">Upload:</strong> Import new records from a spreadsheet (triggers auto-sync).
                                        </p>
                                    </li>
                                    <li className="flex items-start">
                                        <FiRefreshCw className="mr-3 h-4 w-4 text-blue-500 flex-shrink-0 mt-0.5" />
                                        <p>
                                            <strong className="font-semibold text-gray-800">Sync:</strong> Fetch latest records from the server (updates table and chart).
                                        </p>
                                    </li>
                                    <li className="flex items-start">
                                        <FiFilter className="mr-3 h-4 w-4 text-purple-500 flex-shrink-0 mt-0.5" />
                                        <p>
                                            <strong className="font-semibold text-gray-800">Filter:</strong> Display records based on the selected hospital.
                                        </p>
                                    </li>
                                    <li className="flex items-start">
                                        <FiPieChart className="mr-3 h-4 w-4 text-pink-500 flex-shrink-0 mt-0.5" />
                                        <p>
                                            <strong className="font-semibold text-gray-800">Distribution Chart:</strong> Visual breakdown of record counts per hospital.
                                        </p>
                                    </li>
                                </ul>
                            </section>

                            <hr className="border-gray-100" />

                            <section>
                                <h3 className="font-semibold text-lg text-gray-800 mb-2">Table Operations</h3>
                                <ul className="list-none pl-0 text-gray-700 space-y-3">
                                    <li className="flex items-start">
                                        <FiEdit className="mr-3 h-4 w-4 text-yellow-500 flex-shrink-0 mt-0.5" />
                                        <p>
                                            <strong className="font-semibold text-gray-800">Edit:</strong> Update certificate details by clicking the edit icon on any row.
                                        </p>
                                    </li>
                                    <li className="flex items-start">
                                        <FiTrash2 className="mr-3 h-4 w-4 text-red-500 flex-shrink-0 mt-0.5" />
                                        <p>
                                            <strong className="font-semibold text-gray-800">Delete:</strong> Remove a single certificate record.
                                        </p>
                                    </li>
                                    <li className="flex items-start">
                                        <FiCheckSquare className="mr-3 h-4 w-4 text-red-500 flex-shrink-0 mt-0.5" />
                                        <p>
                                            <strong className="font-semibold text-gray-800">Bulk Delete:</strong> Select multiple records for combined deletion.
                                        </p>
                                    </li>
                                    <li className="flex items-start">
                                        <FiColumns className="mr-3 h-4 w-4 text-gray-500 flex-shrink-0 mt-0.5" />
                                        <p>
                                            <strong className="font-semibold text-gray-800">Sorting:</strong> Click any column header to sort records.
                                        </p>
                                    </li>
                                    <li className="flex items-start">
                                        <FiChevronsRight className="mr-3 h-4 w-4 text-gray-500 flex-shrink-0 mt-0.5" />
                                        <p>
                                            <strong className="font-semibold text-gray-800">Pagination:</strong> Navigate between pages (10 records/page).
                                        </p>
                                    </li>
                                </ul>
                            </section>

                            <hr className="border-gray-100" />

                            <section>
                                <h3 className="font-semibold text-lg text-gray-800 mb-2">Visual Feedback</h3>
                                <ul className="list-none pl-0 text-gray-700 space-y-3">
                                    <li className="flex items-start">
                                        <FiBell className="mr-3 h-4 w-4 text-indigo-500 flex-shrink-0 mt-0.5" />
                                        <p>
                                            <strong className="font-semibold text-gray-800">Notifications:</strong> Success/error messages for all actions.
                                        </p>
                                    </li>
                                    <li className="flex items-start">
                                        <FiGlobe className="mr-3 h-4 w-4 text-yellow-500 flex-shrink-0 mt-0.5" />
                                        <p>
                                            <strong className="font-semibold text-gray-800">Highlighting:</strong> Recently updated records briefly highlight.
                                        </p>
                                    </li>
                                    <li className="flex items-start">
                                        <FiLoader className="mr-3 h-4 w-4 text-gray-500 flex-shrink-0 mt-0.5" />
                                        <p>
                                            <strong className="font-semibold text-gray-800">Loading:</strong> Spinners appear during data operations (sync/delete/generate).
                                        </p>
                                    </li>
                                </ul>
                            </section>
                        </div>

                        {/* Right Column */}
                        <div className="md:w-1/3 space-y-6 border-t md:border-t-0 md:border-l pt-4 md:pt-0 md:pl-6 border-gray-100">
                            <section>
                                <h3 className="font-semibold text-lg text-gray-800 mb-2">Output Actions</h3>
                                <ul className="list-none pl-0 text-gray-700 space-y-3">
                                    <li className="flex items-start">
                                        <FiDownload className="mr-3 h-4 w-4 text-teal-500 flex-shrink-0 mt-0.5" />
                                        <p>
                                            <strong className="font-semibold text-gray-800">Export:</strong> Download filtered results as Excel/CSV.
                                        </p>
                                    </li>
                                    <li className="flex items-start">
                                        <FiFileText className="mr-3 h-4 w-4 text-orange-500 flex-shrink-0 mt-0.5" />
                                        <p>
                                            <strong className="font-semibold text-gray-800">Generate PDF:</strong> Create a certificate PDF (Template V1/V2).
                                        </p>
                                    </li>
                                    <li className="flex items-start">
                                        <FiPackage className="mr-3 h-4 w-4 text-red-500 flex-shrink-0 mt-0.5" />
                                        <p>
                                            <strong className="font-semibold text-gray-800">Bulk PDF:</strong> Generate PDFs for selected records (ZIP file download).
                                        </p>
                                    </li>
                                    <li className="flex items-start">
                                        <FiMail className="mr-3 h-4 w-4 text-blue-500 flex-shrink-0 mt-0.5" />
                                        <p>
                                            <strong className="font-semibold text-gray-800">Email:</strong> Send a certificate PDF via the integrated mail composer.
                                        </p>
                                    </li>
                                </ul>
                            </section>

                            <hr className="border-gray-100" />

                            <section>
                                <h3 className="font-semibold text-lg text-gray-800 mb-2">Visual Feedback</h3>
                                <ul className="list-none pl-0 text-gray-700 space-y-3">
                                    <li className="flex items-start">
                                        <FiBell className="mr-3 h-4 w-4 text-indigo-500 flex-shrink-0 mt-0.5" />
                                        <p>
                                            <strong className="font-semibold text-gray-800">Notifications:</strong> Success/error messages for all actions.
                                        </p>
                                    </li>
                                    <li className="flex items-start">
                                        <FiGlobe className="mr-3 h-4 w-4 text-yellow-500 flex-shrink-0 mt-0.5" />
                                        <p>
                                            <strong className="font-semibold text-gray-800">Highlighting:</strong> Recently updated records briefly highlight.
                                        </p>
                                    </li>
                                    <li className="flex items-start">
                                        <FiLoader className="mr-3 h-4 w-4 text-gray-500 flex-shrink-0 mt-0.5" />
                                        <p>
                                            <strong className="font-semibold text-gray-800">Loading:</strong> Spinners appear during data operations (sync/delete/generate).
                                        </p>
                                    </li>
                                </ul>
                            </section>
                        </div>

                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};

export default HelpCard;
