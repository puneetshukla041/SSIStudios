'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { FiCheckCircle, FiAlertTriangle, FiRefreshCw } from 'react-icons/fi';
import UploadButton from '@/components/UploadButton';
import CertificateTable from '@/components/Certificates/CertificateTable';
import QuickActionBar from '@/components/Certificates/ui/QuickActionBar'; 
import AddCertificateForm from '@/components/Certificates/ui/AddCertificateForm'; // Included for structure

import { ICertificateClient } from '@/components/Certificates/utils/constants';

const CertificateDatabasePage: React.FC = () => {
    const [refreshKey, setRefreshKey] = useState(0);
    const [alert, setAlert] = useState<{ message: string; isError: boolean } | null>(null);
    const [certificateData, setCertificateData] = useState<ICertificateClient[]>([]);
    const [totalRecords, setTotalRecords] = useState(0);
    const [isRefreshing, setIsRefreshing] = useState(false);

    // --- GLOBAL STATE LIFTED UP ---
    const [searchQuery, setSearchQuery] = useState('');
    const [hospitalFilter, setHospitalFilter] = useState('');
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [isAddFormVisible, setIsAddFormVisible] = useState(false);
    const [isBulkGeneratingV1, setIsBulkGeneratingV1] = useState(false);
    const [isBulkGeneratingV2, setIsBulkGeneratingV2] = useState(false);
    const [uniqueHospitals, setUniqueHospitals] = useState<string[]>([]); // Captures hospitals from table data hook
    // --- Add Form State (Needs full implementation if the form is fully functional) ---
    const [newCertificateData, setNewCertificateData] = useState<any>({}); 
    const [isAdding, setIsAdding] = useState(false);
    // ------------------------------------------------


    const clearAlert = useCallback(() => {
        setTimeout(() => setAlert(null), 4000);
    }, []);

    const handleAlert = useCallback(
        (message: string, isError: boolean) => {
            setAlert({ message, isError });
            clearAlert();
        },
        [clearAlert]
    );

    useEffect(() => {
        if (isRefreshing) {
            const timeout = setTimeout(() => {
                setIsRefreshing(false);
            }, 1000);
            return () => clearTimeout(timeout);
        }
    }, [isRefreshing]);

    const handleUploadSuccess = (message: string) => {
        handleAlert(message, false);
        setRefreshKey((prev) => prev + 1);
        setIsRefreshing(true);
    };

    const handleUploadError = (message: string) => {
        if (message) handleAlert(message, true);
    };

    const handleRefresh = () => {
        setRefreshKey((prev) => prev + 1);
        setIsRefreshing(true);
        handleAlert('Refreshing table data...', false);
    };

    // 💡 FIX: Updated signature to match useCertificateData's new onRefresh callback
    const handleTableDataUpdate = useCallback(
        (data: ICertificateClient[], totalCount: number, hospitals: string[]) => {
            setCertificateData(data);
            setTotalRecords(totalCount);
            setUniqueHospitals(hospitals); // Capture unique hospitals
            setIsRefreshing(false);
            if (alert?.message === 'Refreshing table data...') {
                handleAlert('Table data synchronized.', false);
            }
        },
        [alert, handleAlert]
    );
    
    // --- ASYNC DUMMY ACTION HANDLERS ---
    // These satisfy the Promise<void> requirement for QuickActionBar props.
    const dummyAction = async (message: string) => {
        handleAlert(message, false);
        setRefreshKey((prev) => prev + 1);
    }

    const handleQuickActionDelete = () => dummyAction('Bulk Delete triggered! (Needs implementation binding)');
    const handleQuickActionDownload = (type: 'xlsx' | 'csv' = 'xlsx') => dummyAction(`Download ${type} triggered! (Needs implementation binding)`);
    const handleQuickActionBulkV1 = () => dummyAction('Bulk V1 PDF triggered! (Needs implementation binding)');
    const handleQuickActionBulkV2 = () => dummyAction('Bulk V2 PDF triggered! (Needs implementation binding)');
    
    // Placeholder for Add Certificate handlers (to avoid errors in AddCertificateForm UI slot)
    const handleAddCertChange = (field: string, value: string) => setNewCertificateData(prev => ({ ...prev, [field]: value }));
    const handleAddCert = async () => dummyAction('Add Certificate submitted!');


    return (
        <div className="min-h-screen bg-gray-50 px-4 sm:px-6 py-3">
            <main className="mx-auto space-y-3 w-full max-w-[1200px] lg:max-w-[1100px] xl:max-w-[1280px] 2xl:max-w-screen-2xl">
                
                {/* Header Row (Upload, Sync, Total Records) */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 py-2">
                    <div className="flex-shrink-0">
                        <p className="text-sm sm:text-base font-semibold text-gray-700 text-center sm:text-left">
                            Total Records:{' '}
                            <strong className="text-indigo-600">{totalRecords}</strong>
                        </p>
                    </div>

                    <div className="flex flex-wrap justify-center sm:justify-end items-center gap-2 sm:gap-3">
                        <div className="flex flex-wrap justify-center sm:justify-start items-center gap-2">
                            <UploadButton onUploadSuccess={handleUploadSuccess} onUploadError={handleUploadError} />
                            <button
                                onClick={handleRefresh}
                                disabled={isRefreshing}
                                className={`flex items-center justify-center px-3 sm:px-4 py-1.5 sm:py-2 text-sm sm:text-base font-semibold rounded-lg shadow-md transition-all duration-300 bg-indigo-600 hover:bg-indigo-700 text-white focus:outline-none focus:ring-4 focus:ring-indigo-500 focus:ring-opacity-50 disabled:bg-indigo-400 disabled:cursor-wait`}
                            >
                                <FiRefreshCw className={`mr-2 h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                                {isRefreshing ? 'Syncing...' : 'Sync Data'}
                            </button>
                        </div>
                        <div className="flex justify-center sm:justify-end">
                            {/* Export Excel placeholder */}
                        </div>
                    </div>
                </div>
                
                {/* Alert Notification (UNCHANGED) */}
                {alert && (
                    <div
                        className={`flex items-center gap-2 p-3 rounded-xl shadow-lg transition-all duration-500 ease-in-out ${
                            alert.isError ? 'bg-red-600 text-white' : 'bg-green-600 text-white'
                        }`}
                    >
                        {alert.isError ? (<FiAlertTriangle className="w-5 h-5 flex-shrink-0" />) : (<FiCheckCircle className="w-5 h-5 flex-shrink-0" />)}
                        <span className="text-sm font-medium">{alert.message}</span>
                    </div>
                )}
                
                {/* --- CARD 1: Quick Action Bar (MOVED HERE) --- */}
                <div className="bg-white rounded-xl shadow-xl border border-gray-100 p-1 sm:p-2">
                    <QuickActionBar
                        isAddFormVisible={isAddFormVisible}
                        selectedIds={selectedIds}
                        uniqueHospitals={uniqueHospitals} // 💡 Passed unique hospitals
                        searchQuery={searchQuery}
                        hospitalFilter={hospitalFilter}
                        setIsAddFormVisible={setIsAddFormVisible}
                        setSearchQuery={setSearchQuery}
                        setHospitalFilter={setHospitalFilter}
                        
                        isBulkGeneratingV1={isBulkGeneratingV1}
                        isBulkGeneratingV2={isBulkGeneratingV2}
                        handleBulkDelete={handleQuickActionDelete} 
                        handleDownload={() => handleQuickActionDownload('xlsx')} 
                        handleBulkGeneratePDF_V1={handleQuickActionBulkV1}
                        handleBulkGeneratePDF_V2={handleQuickActionBulkV2}
                    />
                </div>
                
                {/* Conditional Add Certificate Form (Rendered based on action bar button) */}
                {isAddFormVisible && (
                    <div className="bg-white rounded-xl shadow-xl border border-gray-100">
                        {/* 💡 FIX: Pass dummy handlers to the actual AddCertificateForm component */}
                        <AddCertificateForm 
                            newCertificateData={newCertificateData}
                            isAdding={isAdding}
                            handleNewCertChange={handleAddCertChange as any} // Cast for simplicity
                            handleAddCertificate={handleAddCert}
                            setIsAddFormVisible={setIsAddFormVisible}
                            setNewCertificateData={setNewCertificateData}
                        />
                    </div>
                )}
                
                {/* --- CARD 2: Certificate Table --- */}
                <div className="bg-white rounded-xl shadow-xl border border-gray-100 p-3 sm:p-4 overflow-x-auto">
                    <CertificateTable
                        refreshKey={refreshKey}
                        // 💡 Pass the 3-arg update function
                        onRefresh={handleTableDataUpdate as any} 
                        onAlert={handleAlert}
                        
                        // State Props
                        searchQuery={searchQuery}
                        hospitalFilter={hospitalFilter}
                        selectedIds={selectedIds}
                        isAddFormVisible={isAddFormVisible}
                        isBulkGeneratingV1={isBulkGeneratingV1}
                        isBulkGeneratingV2={isBulkGeneratingV2}
                        
                        // Setters/Control Props
                        setSearchQuery={setSearchQuery}
                        setHospitalFilter={setHospitalFilter}
                        setSelectedIds={setSelectedIds}
                        setIsAddFormVisible={setIsAddFormVisible}
                        setIsBulkGeneratingV1={setIsBulkGeneratingV1}
                        setIsBulkGeneratingV2={setIsBulkGeneratingV2}
                        
                        // NOTE: These handlers are still required by the CertificateTable's interface,
                        // even though their actions are triggered in the QuickActionBar on the parent page.
                        handleBulkDelete={handleQuickActionDelete} 
                        handleDownload={handleQuickActionDownload}
                        handleBulkGeneratePDF_V1={handleQuickActionBulkV1}
                        handleBulkGeneratePDF_V2={handleQuickActionBulkV2}
                    />
                </div>
            </main>
        </div>
    );
};

export default CertificateDatabasePage;