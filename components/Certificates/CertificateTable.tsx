// D:\ssistudios\ssistudios\components\Certificates\CertificateTable.tsx

'use client';

import React, { useEffect, useMemo } from 'react';
import { BadgeCheck, ChevronLeft, ChevronRight } from 'lucide-react';

// Import Hooks and Utils
import { useCertificateData } from './hooks/useCertificateData';
import { useCertificateActions } from './hooks/useCertificateActions';
import { useMailCertificate } from './hooks/useMailCertificate';
import { ICertificateClient, CertificateTableProps as BaseTableProps, PAGE_LIMIT } from './utils/constants';

// Import UI Components
import TableHeader from './ui/TableHeader';
import TableRow from './ui/TableRow';
import MailComposer from './ui/MailComposer';

// --- NEW PROPS INTERFACE for CertificateTable ---
interface CertificateTableProps extends BaseTableProps {
    searchQuery: string;
    hospitalFilter: string;
    selectedIds: string[];
    isAddFormVisible: boolean;
    isBulkGeneratingV1: boolean;
    isBulkGeneratingV2: boolean;
    setSearchQuery: React.Dispatch<React.SetStateAction<string>>;
    setHospitalFilter: React.Dispatch<React.SetStateAction<string>>;
    setSelectedIds: React.Dispatch<React.SetStateAction<string[]>>;
    setIsAddFormVisible: React.Dispatch<React.SetStateAction<boolean>>;
    setIsBulkGeneratingV1: React.Dispatch<React.SetStateAction<boolean>>;
    setIsBulkGeneratingV2: React.Dispatch<React.SetStateAction<boolean>>;
    // Action Handlers passed down from the page (needed for useCertificateActions compatibility)
    handleBulkDelete: () => Promise<void>;
    handleDownload: (type: 'xlsx' | 'csv') => Promise<void>;
    handleBulkGeneratePDF_V1: () => Promise<void>;
    handleBulkGeneratePDF_V2: () => Promise<void>;
}
// --------------------------------------------------

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


const CertificateTable: React.FC<CertificateTableProps> = ({ 
    refreshKey, 
    onRefresh, 
    onAlert,
    searchQuery, 
    hospitalFilter,
    selectedIds,
    isBulkGeneratingV1,
    isBulkGeneratingV2,
    setSelectedIds,
    setIsAddFormVisible, 
    setIsBulkGeneratingV1, 
    setIsBulkGeneratingV2,
}) => {
    // 1. Data and State Management: Use external state for fetching logic
    const {
        certificates,
        isLoading,
        currentPage,
        totalPages,
        uniqueHospitals,
        sortConfig,
        fetchCertificates,
        fetchCertificatesForExport,
        setCurrentPage,
        requestSort,
        sortedCertificates,
        setIsLoading,
    } = useCertificateData(
        refreshKey, 
        // 💡 UPDATED: Pass the custom onRefresh that accepts hospitals
        (data, totalCount, hospitals) => onRefresh(data, totalCount, hospitals), 
        onAlert, 
        searchQuery, 
        hospitalFilter,
    );

    // 2. Action Management: Use external setters for bulk actions/selection
    const {
        editingId,
        editFormData,
        newCertificateData,
        isAdding,
        flashId,
        deletingId,
        generatingPdfId,
        generatingPdfV1Id,
        setEditingId,
        setEditFormData,
        setNewCertificateData,
        setFlashId,
        handleSelectOne,
        handleSelectAll,
        handleEdit,
        handleSave,
        handleDelete,
        handleChange,
        handleAddCertificate,
        handleNewCertChange,
        handleGeneratePDF_V1,
        handleGeneratePDF_V2,
        // The rest of the action handlers are used internally but their loading states are managed externally.
    } = useCertificateActions({
        certificates,
        selectedIds,
        setSelectedIds,
        fetchCertificates,
        fetchCertificatesForExport,
        onAlert,
        setIsLoading,
        // 💡 Pass bulk state setters to the actions hook so it can signal loading status externally
        setIsBulkGeneratingV1, 
        setIsBulkGeneratingV2, 
        // 💡 Pass isAddFormVisible setter to the actions hook so it can hide the form after adding
        setIsAddFormVisible,
    });
    
    // 3. Mail Action Management (UNCHANGED)
    const {
        isMailComposerOpen,
        mailComposerCert,
        mailComposerPdfBlob,
        isSending,
        handleOpenMailComposer,
        handleSendMail,
        handleCloseMailComposer,
    } = useMailCertificate(onAlert);

    // Combined loading state: Disable individual row buttons when any action is running
    const isAnyActionLoading = useMemo(() => 
        isMailComposerOpen || isSending || isBulkGeneratingV1 || isBulkGeneratingV2 || isAdding
    , [isMailComposerOpen, isSending, isBulkGeneratingV1, isBulkGeneratingV2, isAdding]);

    // Effect to handle the flash animation duration (UNCHANGED)
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
            <div className="space-y-6 w-full">

                {/* Selection Summary Notification (UNCHANGED) */}
                {selectedIds.length > 0 && (
                    <div className="p-3 bg-sky-100/50 border-l-4 border-sky-600 text-slate-800 rounded-xl shadow-lg flex items-center justify-between transition duration-300 backdrop-blur-sm">
                        <div className="flex items-center">
                            <BadgeCheck className="w-5 h-5 mr-3 flex-shrink-0 text-sky-600" />
                            <span className="font-medium text-sm sm:text-base">
                                {selectedIds.length} certificates selected for action.
                            </span>
                        </div>
                    </div>
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
                        <div className="overflow-x-auto">
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
                    onAlert={onAlert}
                />
            )}
        </>
    );
};

export default CertificateTable;