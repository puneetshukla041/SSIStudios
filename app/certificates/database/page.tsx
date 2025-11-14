'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { FiRefreshCw } from 'react-icons/fi';
import UploadButton from '@/components/UploadButton';
import CertificateTable from '@/components/Certificates/CertificateTable';
import QuickActionBar from '@/components/Certificates/ui/QuickActionBar'; // Import QuickActionBar
import { ICertificateClient, NotificationType } from '@/components/Certificates/utils/constants';

const CertificateDatabasePage: React.FC = () => {
    const [refreshKey, setRefreshKey] = useState(0);
    const [certificateData, setCertificateData] = useState<ICertificateClient[]>([]);
    const [totalRecords, setTotalRecords] = useState(0);
    const [isRefreshing, setIsRefreshing] = useState(false);
    
    // 💡 NEW STATE: For Search and Filter (Moved here from useCertificateData for persistent state)
    const [searchQuery, setSearchQuery] = useState('');
    const [hospitalFilter, setHospitalFilter] = useState('');
    const [isAddFormVisible, setIsAddFormVisible] = useState(false); // Add form state moved here

    // --- Placeholder Alert (To satisfy UploadButton/Child props, redirecting to console) ---
    const handleAlert = useCallback(
        (message: string, isError: boolean) => {
             if (isError) {
                 console.error("Legacy Alert (ERROR):", message);
             } else {
                 console.log("Legacy Alert (INFO):", message);
             }
        },
        []
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
    };

    // 💡 MODIFIED: Callback to update data and total count from the table fetch
    const handleTableDataUpdate = useCallback(
        (data: ICertificateClient[], totalCount: number) => {
             setCertificateData(data);
             setTotalRecords(totalCount);
             setIsRefreshing(false);
        },
        []
    );

    return (
        <div className="min-h-screen bg-gray-50 px-4 sm:px-6 py-3">
            <main className="mx-auto space-y-3 w-full max-w-[1200px] lg:max-w-[1100px] xl:max-w-[1280px] 2xl:max-w-screen-2xl">
                
                {/* Header Row */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 py-2">
                    
                    {/* Total Records - 💡 USING totalRecords STATE */}
                    <div className="flex-shrink-0">
                        <p className="text-sm sm:text-base font-semibold text-gray-700 text-center sm:text-left">
                            Total Records:{' '}
                            <strong className="text-indigo-600">{totalRecords}</strong>
                        </p>
                    </div>

                    {/* Controls */}
                    <div className="flex flex-wrap justify-center sm:justify-end items-center gap-2 sm:gap-3">
                        
                        {/* Left group: Upload + Sync */}
                        <div className="flex flex-wrap justify-center sm:justify-start items-center gap-2">
                            <UploadButton
                                onUploadSuccess={handleUploadSuccess}
                                onUploadError={handleUploadError}
                            />

                            <button
                                onClick={handleRefresh}
                                disabled={isRefreshing}
                                className={`
                                    flex items-center justify-center px-3 sm:px-4 py-1.5 sm:py-2 text-sm sm:text-base font-semibold rounded-lg shadow-md 
                                    transition-all duration-300 bg-indigo-600 hover:bg-indigo-700 text-white 
                                    focus:outline-none focus:ring-4 focus:ring-indigo-500 focus:ring-opacity-50 
                                    disabled:bg-indigo-400 disabled:cursor-wait
                                `}
                            >
                                <FiRefreshCw
                                    className={`mr-2 h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`}
                                />
                                {isRefreshing ? 'Syncing...' : 'Sync Data'}
                            </button>
                        </div>

                        {/* Right group: Export Excel (Placeholder) */}
                        <div className="flex justify-center sm:justify-end">
                            {/* Keep your existing Export Excel button here (or move it to QuickActionBar) */}
                        </div>
                    </div>
                </div>

                {/* 💡 NEW: Quick Action Bar is now here, passing state down */}
                {/* Note: useCertificateActions props (like handleBulkDelete) will be passed via CertificateTable */}
                <CertificateTable
                    refreshKey={refreshKey}
                    onRefresh={handleTableDataUpdate}
                    onAlert={handleAlert}
                    // Pass search/filter state and setters
                    searchQuery={searchQuery}
                    setSearchQuery={setSearchQuery}
                    hospitalFilter={hospitalFilter}
                    setHospitalFilter={setHospitalFilter}
                    isAddFormVisible={isAddFormVisible}
                    setIsAddFormVisible={setIsAddFormVisible}
                />
            </main>
        </div>
    );
};

export default CertificateDatabasePage;