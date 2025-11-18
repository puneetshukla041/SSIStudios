'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { FiRefreshCw } from 'react-icons/fi';
import UploadButton from '@/components/UploadButton';
import CertificateTable from '@/components/Certificates/CertificateTable';
import QuickActionBar from '@/components/Certificates/ui/QuickActionBar'; 
import { ICertificateClient, NotificationType } from '@/components/Certificates/utils/constants';
import HospitalPieChart from '@/components/Certificates/analysis/HospitalPieChart'; 

const CertificateDatabasePage: React.FC = () => {
    const [refreshKey, setRefreshKey] = useState(0);
    const [certificateData, setCertificateData] = useState<ICertificateClient[]>([]);
    const [totalRecords, setTotalRecords] = useState(0);
    const [isRefreshing, setIsRefreshing] = useState(false);
    
    // State for unique hospitals (fetched from API via CertificateTable)
    const [uniqueHospitals, setUniqueHospitals] = useState<string[]>([]);

    // --- State for Search and Filter ---
    // 1. New state for instant input value (used by the <input>)
    const [inputQuery, setInputQuery] = useState('');
    // 2. Original state for filtering (used by useCertificateData, updated after debounce)
    const [searchQuery, setSearchQuery] = useState(''); 
    const [hospitalFilter, setHospitalFilter] = useState('');
    const [isAddFormVisible, setIsAddFormVisible] = useState(false);

    // --- Debounce Logic (NEW) ---
    useEffect(() => {
        // Set a timer to update the actual search query state (searchQuery) 500ms after the user stops typing (inputQuery changes).
        const delayDebounceFn = setTimeout(() => {
            setSearchQuery(inputQuery);
        }, 500);

        // Cleanup: If the user types again, clear the old timer.
        return () => clearTimeout(delayDebounceFn);
    }, [inputQuery]); // Run this effect ONLY when the *input* changes.


    // --- Placeholder Alert (for UploadButton/Child props) ---
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

    // Callback now accepts the list of unique hospitals
    const handleTableDataUpdate = useCallback(
        (data: ICertificateClient[], totalCount: number, uniqueHospitalsList: string[]) => {
             setCertificateData(data);
             setTotalRecords(totalCount);
             setUniqueHospitals(uniqueHospitalsList); // Update unique hospitals list
             setIsRefreshing(false);
        },
        []
    );

    return (
        <div className="min-h-screen bg-gray-50 px-4 sm:px-6 py-3">
            <main className="mx-auto space-y-3 w-full max-w-[1200px] lg:max-w-[1100px] xl:max-w-[1280px] 2xl:max-w-screen-2xl">
                
                {/* Header Row */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 py-2">
                    
                    {/* Total Records */}
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

                {/* Hospital Pie Chart (Receiving live data) */}
                <HospitalPieChart
                    uniqueHospitals={uniqueHospitals}
                    totalRecords={totalRecords}
                    certificates={certificateData} 
                />
                
                {/* Certificate Table */}
                <CertificateTable
                    refreshKey={refreshKey}
                    onRefresh={handleTableDataUpdate as any} 
                    onAlert={handleAlert}
                    // Pass DEBOUNCED searchQuery to the table's data hook (useCertificateData)
                    searchQuery={searchQuery}
                    // Pass the INSTANT inputQuery SETTER to the table's QuickActionBar via props tunneling
                    setSearchQuery={setInputQuery} 
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