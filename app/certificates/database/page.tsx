'use client';

import React, { useState, useCallback, useEffect } from 'react';

import { FiRefreshCw, FiSearch } from 'react-icons/fi'; // Import FiSearch

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
        // Base padding (px-4) handles small screens, py-3 provides vertical margin
<div className="
    min-h-screen 
    bg-gray-white
    px-0 
    py-3
    md:px-6
    lg:pl-24 lg:pr-0      /* More left padding + small right space */
    2xl:px-0
">

    <main className="
    mx-auto 
    space-y-4 
    w-full 
    max-w-screen-2xl 
    lg:scale-[0.96]      /* Slightly smaller on laptops */
    lg:origin-top-left   /* Align scaling anchor */
">





                {/* Header Row */}
                {/* Responsive layout shift: column on xs, row on sm+ */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 md:gap-4 py-2">
                    
                    {/* Total Records and Search Input (Combined Left Group) */}
                    {/* flex-col on xs, flex-row on sm+, gap-3 or gap-4 for tighter grouping */}
                    <div className="flex flex-col sm:flex-row sm:items-center gap-3 md:gap-4 flex-shrink-0 w-full sm:w-auto">
                        <p className="text-sm sm:text-base font-semibold text-gray-700 text-center sm:text-left whitespace-nowrap">
                            Total Records:{' '}
                            <strong className="text-indigo-600 text-lg sm:text-xl">{totalRecords}</strong> {/* Responsive font size for record count */}
                        </p>
                        
                        {/* 💡 MOVED SEARCH INPUT FIELD */}
                        {/* w-full on xs, w-48 to w-64 on sm+ */}
                        <div className="relative w-full sm:w-56 md:w-64">
                            <input
                                type="text"
                                placeholder="Search records..."
                                value={inputQuery} // Binds to INSTANT inputQuery
                                onChange={(e) => setInputQuery(e.target.value)} // Updates INSTANT inputQuery
                                className="block w-full rounded-lg border-0 py-1.5 pl-10 pr-4 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 text-sm sm:text-base sm:leading-6" // Text size adjusted
                            />
                            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                                <FiSearch className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400" aria-hidden="true" /> {/* Icon size adjusted */}
                            </div>
                        </div>
                    </div>

                    {/* Controls (Right Group: Upload + Sync) */}
                    <div className="flex flex-wrap justify-center sm:justify-end items-center gap-2 sm:gap-3 md:gap-4 w-full sm:w-auto">
                        
                        {/* Left group of controls: Upload + Sync */}
                        {/* Added w-full to buttons on mobile for stacking, sm:w-auto to revert on desktop */}
                        <div className="flex flex-wrap justify-center sm:justify-start items-center gap-2 sm:gap-3 md:gap-4 w-full sm:w-auto">
                            <UploadButton
                                onUploadSuccess={handleUploadSuccess}
                                onUploadError={handleUploadError}
                            />

                            <button
                                onClick={handleRefresh}
                                disabled={isRefreshing}
                                className={`
                                    w-full sm:w-auto flex items-center justify-center px-4 py-1.5 sm:py-2 text-sm sm:text-base font-semibold rounded-lg shadow-md 
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

                        {/* Right group: Export Excel (Placeholder) - Assuming this is empty or handled by QuickActionBar */}
                        <div className="hidden sm:flex justify-end">
                            {/* Placeholder for potential Export button */}
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
                    // 💡 FIX: Pass setSearchQuery (which updates the debounced state) back to the table
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