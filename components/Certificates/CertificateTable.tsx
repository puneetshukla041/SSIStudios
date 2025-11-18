'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { BadgeCheck, Loader2, Square, ChevronLeft, ChevronRight, Check, Info, AlertCircle } from 'lucide-react'; 

// Import Hooks and Utils
import { useCertificateData } from './hooks/useCertificateData';
import { useCertificateActions } from './hooks/useCertificateActions';
import { useMailCertificate } from './hooks/useMailCertificate'; 
import { ICertificateClient, CertificateTableProps, PAGE_LIMIT, NotificationState, NotificationType } from './utils/constants';

// Import UI Components
import AddCertificateForm from './ui/AddCertificateForm';
import QuickActionBar from './ui/QuickActionBar'; // Still imported for use in JSX
import TableHeader from './ui/TableHeader';
import TableRow from './ui/TableRow';
import MailComposer from './ui/MailComposer'; 


// --- Skeleton Loader Component (UNCHANGED) ---
const SkeletonLoader = () => (
    <div className="animate-pulse space-y-4 p-6 rounded-xl shadow-lg border border-gray-200 bg-white">
        <div className="flex justify-between items-center space-x-4">
            <div className="h-10 bg-gray-200 rounded-lg w-1/3"></div>
            <div className="h-10 bg-gray-200 rounded-lg w-1/4"></div>
            <div className="flex space-x-2">
                <div className="h-10 bg-gray-200 rounded-lg w-24"></div>
                <div className="h-10 bg-gray-200 rounded-lg w-24"></div>
            </div>
        </div>

        <div className="h-10 bg-gray-100 rounded-lg"></div>

        {Array(PAGE_LIMIT).fill(0).map((_, index) => (
            <div key={index} className="grid grid-cols-5 gap-4 py-3 border-b border-gray-100 last:border-b-0">
                <div className="h-4 bg-gray-200 rounded col-span-1"></div>
                <div className="h-4 bg-gray-200 rounded col-span-1"></div>
                <div className="h-4 bg-gray-200 rounded col-span-1"></div>
                <div className="h-4 bg-gray-200 rounded col-span-1"></div>
                <div className="h-4 bg-gray-200 rounded col-span-1"></div>
            </div>
        ))}
        <div className="flex justify-between items-center pt-4">
            <div className="h-4 bg-gray-200 rounded w-48"></div>
            <div className="flex space-x-2">
                <div className="h-8 w-16 bg-gray-200 rounded-md"></div>
                <div className="h-8 w-10 bg-slate-700 rounded-md"></div>
                <div className="h-8 w-16 bg-gray-200 rounded-md"></div>
            </div>
        </div>
    </div>
);


// 💡 FIXED PROPS INTERFACE: Restoring setSearchQuery as hook requires 7 args
interface CertificateTableExtendedProps extends CertificateTableProps {
    searchQuery: string;
    setSearchQuery: React.Dispatch<React.SetStateAction<string>>; // <-- RESTORED
    hospitalFilter: string;
    setHospitalFilter: React.Dispatch<React.SetStateAction<string>>;
    isAddFormVisible: boolean;
    setIsAddFormVisible: React.Dispatch<React.SetStateAction<boolean>>;
}


const CertificateTable: React.FC<CertificateTableExtendedProps> = ({ 
    refreshKey, 
    onRefresh, 
    onAlert: legacyOnAlert,
    // Destructure new props from parent
    searchQuery,
    setSearchQuery, // <-- RESTORED FOR HOOK
    hospitalFilter,
    setHospitalFilter,
    isAddFormVisible,
    setIsAddFormVisible,
}) => {
    
    // 💡 NEW: Notification State
    const [notification, setNotification] = useState<NotificationState | null>(null);

    // 💡 NEW: showNotification function (as requested)
    const showNotification = useCallback((message: string, type: NotificationType) => {
        setNotification({ message, type, active: true });
        
        // Hide animation: 3000ms duration + 300ms transition time
        setTimeout(() => {
            setNotification(prev => prev ? { ...prev, active: false } : null);
        }, 3000);
        
        // Remove from DOM after transition
        setTimeout(() => {
            setNotification(null);
        }, 3300);
    }, []);

    // 💡 FIX: Proxy function to intercept and SILENCE successful legacy alerts, 
    const pdfOnAlert = useCallback((message: string, isError: boolean) => {
        
        if (!isError && (message.includes('synchronized') || message.includes('loaded'))) {
            return;
        }

        const type: NotificationType = isError ? 'error' : 'info';
        showNotification(message, type);
    }, [showNotification]);


    // 1. Data and State Management (Fetching, Pagination, Sorting)
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
        setCurrentPage,
        setSelectedIds,
        requestSort,
        sortedCertificates,
        setIsLoading,
    // 💡 FIXED: Passing 7 arguments to satisfy the hook's required signature.
    } = useCertificateData(refreshKey, onRefresh, showNotification, searchQuery, hospitalFilter, setSearchQuery, setHospitalFilter); 

    // 2. Action Management (CRUD, Bulk Actions, PDF, Download)
    const {
        editingId,
        editFormData,
        // isAddFormVisible is now passed via props
        newCertificateData,
        isAdding,
        flashId,
        deletingId,
        generatingPdfId,
        generatingPdfV1Id,
        isBulkGeneratingV1, 
        isBulkGeneratingV2, 
        setEditingId,
        setEditFormData,
        // setIsAddFormVisible is now passed via props
        setNewCertificateData,
        setFlashId,
        handleSelectOne,
        handleSelectAll,
        handleBulkDelete,
        handleEdit,
        handleSave,
        handleDelete,
        handleChange,
        handleAddCertificate,
        handleNewCertChange,
        handleDownload,
        handleGeneratePDF_V1,
        handleGeneratePDF_V2,
        handleBulkGeneratePDF_V1, 
        handleBulkGeneratePDF_V2, 
    } = useCertificateActions({
        certificates,
        selectedIds,
        setSelectedIds,
        fetchCertificates,
        fetchCertificatesForExport,
        showNotification, 
        onAlert: pdfOnAlert, 
        setIsLoading,
    });
    
    // 3. Mail Action Management
    const {
        isMailComposerOpen,
        mailComposerCert,
        mailComposerPdfBlob,
        isSending,
        handleOpenMailComposer,
        handleSendMail,
        handleCloseMailComposer,
    } = useMailCertificate(pdfOnAlert); 

    // Combined loading state: Disable individual row buttons when any action is running
    const isAnyActionLoading = isMailComposerOpen || isSending || isBulkGeneratingV1 || isBulkGeneratingV2;

    // Effect to handle the flash animation duration 
    useEffect(() => {
        if (flashId) {
            const timer = setTimeout(() => {
                setFlashId(null);
            }, 1000); 
            return () => clearTimeout(timer);
        }
    }, [flashId, setFlashId]);


    // --- Pagination Component (UNCHANGED) ---
    const Pagination = () => (
        <div className="flex flex-col sm:flex-row justify-end items-center mt-4 p-2 w-full">
            <div className="flex space-x-1 border border-gray-200 rounded-full p-1 shadow-inner bg-white/70 backdrop-blur-sm">
                <button
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                    className="px-3 py-1 text-sm font-medium rounded-full bg-white/80 text-slate-700 hover:bg-slate-200 disabled:text-gray-400 disabled:hover:bg-white transition duration-300 flex items-center shadow-md hover:shadow-lg"
                    aria-label="Previous Page"
                >
                    <ChevronLeft className="w-4 h-4 mr-1" />
                    Previous
                </button>
                {/* Render page numbers */}
                {Array.from({ length: totalPages }, (_, i) => i + 1)
                    .filter(page => page === 1 || page === totalPages || (page >= currentPage - 1 && page <= currentPage + 1))
                    .map(page => (
                        <button
                            key={page}
                            onClick={() => setCurrentPage(page)}
                            className={`px-3 py-1 text-sm font-medium rounded-full transition duration-300 shadow-md ${
                                page === currentPage
                                    ? 'bg-sky-600 text-white shadow-lg'
                                    : 'bg-white/80 text-gray-700 hover:bg-slate-200'
                            }`}
                        >
                            {page}
                        </button>
                    ))
                }
                {totalPages > 3 && currentPage < totalPages - 1 && (
                    <span className="px-3 py-1 text-sm text-gray-500">...</span>
                )}
                <button
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages || totalPages === 0}
                    className="px-3 py-1 text-sm font-medium rounded-full bg-white/80 text-slate-700 hover:bg-slate-200 disabled:text-gray-400 disabled:hover:bg-white transition duration-300 flex items-center shadow-md hover:shadow-lg"
                    aria-label="Next Page"
                >
                    Next
                    <ChevronRight className="w-4 h-4 ml-1" />
                </button>
            </div>
        </div>
    );

    // --- Main Render ---

    if (isLoading) {
        return <SkeletonLoader />;
    }

    return (
        <>
            {/* 💡 DYNAMIC ISLAND STYLE TOAST NOTIFICATION (UNCHANGED) */}
            {notification && (
                <div
                    className={`
                        fixed top-4 left-1/2 transform -translate-x-1/2 z-[1000] h-12 px-5 py-3
                        rounded-full shadow-2xl flex items-center gap-3 bg-white border
                        text-base font-medium whitespace-nowrap overflow-hidden w-max min-w-[36px] md:max-w-[360px]
                        transition-transform duration-300 ease-out 
                        ${notification.active ? 'translate-y-0 opacity-100' : '-translate-y-20 opacity-0'}
                        ${notification.type === "success" ? "border-green-300" : ""}
                        ${notification.type === "info" ? "border-sky-300" : ""}
                        ${notification.type === "error" ? "border-red-300" : ""}
                    `}
                >
                    <div className={`flex-shrink-0 text-xl`}>
                        {notification.type === "success" && <Check className="w-5 h-5 text-green-600" />}
                        {notification.type === "info" && <Info className="w-5 h-5 text-sky-600" />}
                        {notification.type === "error" && <AlertCircle className="w-5 h-5 text-red-600" />}
                    </div>
                    <span className={`flex-grow text-center truncate text-gray-700 text-sm`}>
                        {notification.message}
                    </span>
                </div>
            )}
            
            <div className="space-y-6 w-full p-3 md:p-0">

                {/* 💡 Quick Action Bar: Only receives filter props, not search input props */}
                <QuickActionBar
                    isAddFormVisible={isAddFormVisible}
                    selectedIds={selectedIds}
                    uniqueHospitals={uniqueHospitals}
                    hospitalFilter={hospitalFilter}
                    setIsAddFormVisible={setIsAddFormVisible}
                    setHospitalFilter={setHospitalFilter}
                    handleBulkDelete={handleBulkDelete}
                    handleDownload={handleDownload}
                    isBulkGeneratingV1={isBulkGeneratingV1}
                    isBulkGeneratingV2={isBulkGeneratingV2}
                    handleBulkGeneratePDF_V1={handleBulkGeneratePDF_V1}
                    handleBulkGeneratePDF_V2={handleBulkGeneratePDF_V2}
                />

                {/* Conditional Add Certificate Form (UNCHANGED) */}
                {isAddFormVisible && (
                    <AddCertificateForm
                        newCertificateData={newCertificateData}
                        isAdding={isAdding}
                        handleNewCertChange={handleNewCertChange}
                        handleAddCertificate={handleAddCertificate}
                        setIsAddFormVisible={setIsAddFormVisible}
                        setNewCertificateData={setNewCertificateData}
                    />
                )}

                {sortedCertificates.length === 0 ? (
                    // Empty state (UNCHANGED)
                    <div className="text-center p-12 bg-white/70 rounded-xl shadow-lg border-2 border-dashed border-gray-300 backdrop-blur-sm">
                        <p className="text-gray-500 text-xl font-medium">
                            No certificates found.
                        </p>
                        <p className="text-gray-400 mt-2">
                            Try adjusting your search criteria or adding new data.
                        </p>
                    </div>
                ) : (
                    <>
                        {/* TABLE Container (UNCHANGED) */}
                        <div className="overflow-x-auto rounded-xl shadow-lg border border-gray-300 bg-white/70 backdrop-blur-md">
                            <table
                                className="min-w-full divide-y divide-gray-300"
                                style={{ borderCollapse: 'collapse' }}
                            >
                                <TableHeader
                                    certificates={certificates}
                                    selectedIds={selectedIds}
                                    sortConfig={sortConfig}
                                    requestSort={requestSort}
                                    handleSelectAll={handleSelectAll}
                                />
                                <tbody className="divide-y divide-gray-200">
                                    {sortedCertificates.map((cert: ICertificateClient, index: number) => ( 
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
                        <Pagination />
                    </>
                )}
            </div>
            
            {/* Mail Composer Modal (UNCHANGED) */}
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
        </>
    );
};

export default CertificateTable;