'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { 
    ChevronLeft, 
    ChevronRight, 
    Inbox,
    Loader2
} from 'lucide-react';
import clsx from 'clsx';
import { motion, AnimatePresence } from 'framer-motion';

// Import Hooks and Utils
import { useCertificateData } from './hooks/useCertificateData';
import { useCertificateActions } from './hooks/useCertificateActions';
import { useMailCertificate } from './hooks/useMailCertificate'; 
import { CertificateTableProps, PAGE_LIMIT, NotificationState, NotificationType } from './utils/constants';

// Import UI Components
import QuickActionBar from './ui/QuickActionBar';
import TableHeader from './ui/TableHeader';
import TableRow from './ui/TableRow';
import MailComposer from './ui/MailComposer';
import FloatingNotification from './ui/FloatingNotification';
import SuccessAnimation from './ui/SuccessAnimation'; 

// --- Components ---

// 1. Modern Skeleton Loader
const SkeletonLoader = () => (
    <div className="w-full space-y-6">
        <div className="h-16 bg-slate-100/50 rounded-2xl border border-slate-200/60 animate-pulse" />
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="h-12 bg-slate-50 border-b border-slate-100" />
            <div className="divide-y divide-slate-50">
                {Array(6).fill(0).map((_, i) => (
                    <div key={i} className="h-20 flex items-center px-6 gap-6 animate-pulse">
                        <div className="w-5 h-5 rounded bg-slate-200" />
                        <div className="w-10 h-10 rounded-full bg-slate-200" />
                        <div className="space-y-2 flex-1">
                            <div className="w-1/4 h-4 rounded bg-slate-200" />
                            <div className="w-1/6 h-3 rounded bg-slate-100" />
                        </div>
                        <div className="w-24 h-8 rounded-lg bg-slate-100" />
                    </div>
                ))}
            </div>
        </div>
    </div>
);

// --- Extended Props Interface ---
interface CertificateTableExtendedProps extends CertificateTableProps {
    searchQuery: string;
    setSearchQuery: React.Dispatch<React.SetStateAction<string>>;
    hospitalFilter: string;
    setHospitalFilter: React.Dispatch<React.SetStateAction<string>>;
    isAddFormVisible: boolean;
    setIsAddFormVisible: React.Dispatch<React.SetStateAction<boolean>>;
    uniqueHospitals?: string[];
}

const CertificateTable: React.FC<CertificateTableExtendedProps> = ({ 
    refreshKey, 
    onRefresh, 
    searchQuery,
    setSearchQuery,
    hospitalFilter,
    setHospitalFilter,
    isAddFormVisible,
    setIsAddFormVisible,
    uniqueHospitals: _propUniqueHospitals 
}) => {
    
    // ✅ State for Certificate Type Mode (External/Internal/Others)
    const [certTypeMode, setCertTypeMode] = useState('internal');

    // --- Notification State Management ---
    const [notification, setNotification] = useState<NotificationState | null>(null);

    const showNotification = useCallback((message: string, type: NotificationType) => {
        setNotification({ message, type, active: true });
        setTimeout(() => {
            setNotification(prev => prev ? { ...prev, active: false } : null);
        }, 3000);
        setTimeout(() => {
            setNotification(null);
        }, 3500);
    }, []);

    const pdfOnAlert = useCallback((message: string, isError: boolean) => {
        if (!isError && (message.includes('synchronized') || message.includes('loaded'))) {
            return;
        }
        showNotification(message, isError ? 'error' : 'info');
    }, [showNotification]);


    // --- Data Hooks ---
    const {
        certificates,
        isLoading,
        totalItems,
        currentPage,
        totalPages,
        uniqueHospitals, 
        sortConfig,
        selectedIds,
        fetchCertificates,
        fetchCertificatesForExport,
        deleteCertificate,
        updateCertificate, // <--- Destructured here
        setCurrentPage,
        setSelectedIds,
        requestSort,
        sortedCertificates,
        setIsLoading,
    } = useCertificateData(
        refreshKey, 
        onRefresh, 
        showNotification, 
        searchQuery, 
        hospitalFilter, 
        setSearchQuery, 
        setHospitalFilter
    ); 

    // --- Action Hooks ---
    const {
        editingId,
        editFormData,
        flashId,
        deletingId,
        generatingPdfId,
        generatingPdfV1Id,
        isBulkGeneratingV1, 
        isBulkGeneratingV2,
        isBulkGeneratingV3,
        showSuccessAnimation,
        successMessage,
        setEditingId,
        setEditFormData,
        setFlashId,
        handleSelectOne,
        handleSelectAll,
        handleBulkDelete,
        handleEdit,
        handleSave,
        handleDelete,
        handleChange,
        handleDownload,
        handleGeneratePDF_V1,
        handleGeneratePDF_V2,
        handleBulkGeneratePDF_V1, 
        handleBulkGeneratePDF_V2, 
        handleBulkGeneratePDF_V3,
    } = useCertificateActions({
        certificates,
        selectedIds,
        setSelectedIds,
        fetchCertificates,
        fetchCertificatesForExport,
        deleteCertificate,
        updateCertificate, // <--- Passed here
        showNotification, 
        onAlert: pdfOnAlert, 
        setIsLoading,
    });
    
    // --- Mail Hooks ---
    const {
        isMailComposerOpen,
        mailComposerCert,
        mailComposerPdfBlob,
        isSending,
        handleOpenMailComposer,
        handleSendMail,
        handleCloseMailComposer,
    } = useMailCertificate(pdfOnAlert); 

    const isAnyActionLoading = isMailComposerOpen || isSending || isBulkGeneratingV1 || isBulkGeneratingV2 || isBulkGeneratingV3;

    useEffect(() => {
        if (flashId) {
            const timer = setTimeout(() => setFlashId(null), 1000); 
            return () => clearTimeout(timer);
        }
    }, [flashId, setFlashId]);

    // ✅ Bulk Mail Handlers (Placeholders)
    const handleBulkMail_V1 = () => showNotification("Bulk Mail (Proctorship) feature coming soon!", "info");
    const handleBulkMail_V2 = () => showNotification("Bulk Mail (Training) feature coming soon!", "info");
    const handleBulkMail_V3 = () => showNotification("Bulk Mail (100+) feature coming soon!", "info");


    // --- Render Logic ---

    if (isLoading) {
        return <SkeletonLoader />;
    }

    return (
        <div className="relative flex flex-col gap-6 font-sans">
            
            {/* Global Overlays */}
            <FloatingNotification 
                message={notification?.message || ''}
                type={notification?.type || 'info'}
                isVisible={!!notification?.active}
                onClose={() => setNotification(prev => prev ? { ...prev, active: false } : null)}
            />

            <SuccessAnimation 
                isVisible={showSuccessAnimation} 
                message={successMessage} 
            />
            
            {/* Action Bar */}
            <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
            >
                <QuickActionBar
                    isAddFormVisible={isAddFormVisible}
                    selectedIds={selectedIds}
                    uniqueHospitals={uniqueHospitals}
                    hospitalFilter={hospitalFilter}
                    setIsAddFormVisible={setIsAddFormVisible} 
                    setHospitalFilter={setHospitalFilter}
                    handleBulkDelete={handleBulkDelete}
                    handleDownload={handleDownload}
                    
                    // ✅ State & Handlers
                    certTypeMode={certTypeMode}
                    setCertTypeMode={setCertTypeMode}
                    
                    isBulkGeneratingV1={isBulkGeneratingV1}
                    isBulkGeneratingV2={isBulkGeneratingV2}
                    isBulkGeneratingV3={isBulkGeneratingV3}
                    
                    handleBulkGeneratePDF_V1={handleBulkGeneratePDF_V1}
                    handleBulkGeneratePDF_V2={handleBulkGeneratePDF_V2}
                    handleBulkGeneratePDF_V3={handleBulkGeneratePDF_V3}

                    handleBulkMail_V1={handleBulkMail_V1}
                    handleBulkMail_V2={handleBulkMail_V2}
                    handleBulkMail_V3={handleBulkMail_V3}
                />
            </motion.div>

            {/* Main Content Area */}
            <motion.div 
                className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col flex-grow relative"
                initial={{ opacity: 0, scale: 0.99 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: 0.1 }}
            >
                {isAnyActionLoading && (
                    <div className="absolute inset-0 bg-white/60 backdrop-blur-[1px] z-50 flex items-center justify-center">
                        <div className="bg-white p-4 rounded-xl shadow-xl border border-slate-100 flex items-center gap-3">
                            <Loader2 className="w-5 h-5 text-indigo-600 animate-spin" />
                            <span className="text-sm font-medium text-slate-700">Processing request...</span>
                        </div>
                    </div>
                )}

                {sortedCertificates.length === 0 ? (
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex flex-col items-center justify-center py-24 px-4 text-center"
                    >
                        <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mb-6 ring-[12px] ring-slate-50/50">
                            <Inbox className="w-10 h-10 text-slate-300" strokeWidth={1.5} />
                        </div>
                        <h3 className="text-xl font-semibold text-slate-900 mb-2">No certificates found</h3>
                        <p className="text-slate-500 max-w-sm mx-auto mb-8 leading-relaxed">
                            We couldn't find any records matching your active filters. Try adjusting your search query or add a new entry.
                        </p>
                        <button 
                            onClick={() => setIsAddFormVisible(true)}
                            className="group relative inline-flex items-center justify-center px-6 py-2.5 text-sm font-medium text-white transition-all duration-200 bg-indigo-600 rounded-lg hover:bg-indigo-700 hover:shadow-md hover:shadow-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 cursor-pointer active:scale-95"
                        >
                            <span>Add New Certificate</span>
                        </button>
                    </motion.div>
                ) : (
                    <>
                        <div className="overflow-x-auto custom-scrollbar">
                            <table className="w-full text-left border-collapse">
                                <TableHeader
                                    certificates={certificates}
                                    selectedIds={selectedIds}
                                    sortConfig={sortConfig}
                                    requestSort={requestSort}
                                    handleSelectAll={handleSelectAll}
                                />
                                <tbody className="divide-y divide-slate-100/80 bg-white">
                                    {sortedCertificates.map((cert, index) => ( 
                                        <TableRow
                                            key={cert._id}
                                            cert={cert}
                                            index={index} 
                                            currentPage={currentPage} 
                                            isSelected={selectedIds.includes(cert._id)}
                                            isEditing={editingId === cert._id}
                                            isFlashing={flashId === cert._id}
                                            isDeleting={deletingId === cert._id || (deletingId !== null && selectedIds.includes(cert._id))}
                                            generatingPdfId={generatingPdfId}
                                            generatingPdfV1Id={generatingPdfV1Id}
                                            editFormData={editFormData}
                                            handleSelectOne={handleSelectOne}
                                            handleEdit={handleEdit}
                                            handleSave={handleSave}
                                            handleDelete={handleDelete}
                                            handleChange={handleChange}
                                            setEditingId={setEditingId}
                                            handleGeneratePDF_V1={handleGeneratePDF_V1}
                                            handleGeneratePDF_V2={handleGeneratePDF_V2}
                                            handleMailCertificate={handleOpenMailComposer}
                                            isAnyActionLoading={isAnyActionLoading}
                                        />
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* --- Modern Floating Pagination --- */}
                        <div className="border-t border-slate-100 bg-slate-50/40 p-4 flex flex-col sm:flex-row justify-between items-center gap-4">
                            <div className="text-xs text-slate-500 font-medium tracking-wide">
                                Showing <span className="text-slate-900 font-bold">{((currentPage - 1) * PAGE_LIMIT) + 1}</span> to <span className="text-slate-900 font-bold">{Math.min(currentPage * PAGE_LIMIT, totalItems)}</span> of <span className="text-slate-900 font-bold">{totalItems}</span> results
                            </div>
                            
                            <div className="flex items-center gap-1.5 p-1 bg-white rounded-xl shadow-sm border border-slate-200/80">
                                <button
                                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                                    disabled={currentPage === 1}
                                    className="p-2 rounded-lg text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-slate-500 transition-all cursor-pointer active:scale-95"
                                >
                                    <ChevronLeft className="w-4 h-4" />
                                </button>
                                
                                <div className="flex items-center gap-1 px-2">
                                    {Array.from({ length: totalPages }, (_, i) => i + 1)
                                        .filter(page => page === 1 || page === totalPages || (page >= currentPage - 1 && page <= currentPage + 1))
                                        .map((page, index, array) => (
                                            <React.Fragment key={page}>
                                                {index > 0 && array[index - 1] !== page - 1 && (
                                                    <span className="text-xs text-slate-400 px-1 select-none">...</span>
                                                )}
                                                <button
                                                    onClick={() => setCurrentPage(page)}
                                                    className={clsx(
                                                        "w-8 h-8 flex items-center justify-center rounded-lg text-xs font-semibold transition-all duration-200 cursor-pointer active:scale-95",
                                                        page === currentPage
                                                            ? "bg-indigo-600 text-white shadow-md shadow-indigo-200 scale-105"
                                                            : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                                                    )}
                                                >
                                                    {page}
                                                </button>
                                            </React.Fragment>
                                    ))}
                                </div>

                                <button
                                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                                    disabled={currentPage === totalPages || totalPages === 0}
                                    className="p-2 rounded-lg text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-slate-500 transition-all cursor-pointer active:scale-95"
                                >
                                    <ChevronRight className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    </>
                )}
            </motion.div>
            
            {/* Mail Composer Modal */}
            <AnimatePresence>
                {isMailComposerOpen && mailComposerCert && (
                    <MailComposer
                        certData={mailComposerCert}
                        pdfBlob={mailComposerPdfBlob}
                        isSending={isSending}
                        onClose={handleCloseMailComposer}
                        onSend={handleSendMail}
                        onAlert={pdfOnAlert} 
                    />
                )}
            </AnimatePresence>
        </div>
    );
};

export default CertificateTable;