'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { FiRefreshCw, FiSearch, FiHelpCircle } from 'react-icons/fi';
import { AnimatePresence } from 'framer-motion';

// --- NEW IMPORT ---
import HelpCard from '@/components/Certificates/ui/HelpCard'; 
// ------------------

import UploadButton from '@/components/UploadButton';
import CertificateTable from '@/components/Certificates/CertificateTable';
import { ICertificateClient, NotificationType } from '@/components/Certificates/utils/constants';
import HospitalPieChart from '@/components/Certificates/analysis/HospitalPieChart';


// =======================================================================
// MAIN COMPONENT: CertificateDatabasePage
// =======================================================================

const CertificateDatabasePage: React.FC = () => {
    const [refreshKey, setRefreshKey] = useState(0);
    const [certificateData, setCertificateData] = useState<ICertificateClient[]>([]);
    const [totalRecords, setTotalRecords] = useState(0);
    const [isRefreshing, setIsRefreshing] = useState(false);
    
    // State for unique hospitals (fetched from API via CertificateTable)
    const [uniqueHospitals, setUniqueHospitals] = useState<string[]>([]);

    // --- State for Search and Filter ---
    const [inputQuery, setInputQuery] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [hospitalFilter, setHospitalFilter] = useState('');
    const [isAddFormVisible, setIsAddFormVisible] = useState(false);
    
    // State for the help card visibility
    const [isHelpCardVisible, setIsHelpCardVisible] = useState(false); 

    // --- NEW: State for Animated Count ---
    const [animatedTotalRecords, setAnimatedTotalRecords] = useState(0);


    // --- Debounce Logic ---
    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            setSearchQuery(inputQuery);
        }, 500);
        return () => clearTimeout(delayDebounceFn);
    }, [inputQuery]);


    // --- NEW: Animation Effect for Total Records ---
    useEffect(() => {
        // Only run if the new totalRecords is different from the current displayed count
        if (totalRecords === animatedTotalRecords) return;

        let start = animatedTotalRecords;
        const end = totalRecords;
        const duration = 2000; // 1 second animation
        const steps = 50;
        const stepTime = duration / steps;
        // Calculate the increment required per step
        const increment = (end - start) / steps; 

        let currentStep = 0;

        const timer = setInterval(() => {
            currentStep++;
            if (currentStep <= steps) {
                // Calculate the new value based on linear interpolation
                start += increment;
                setAnimatedTotalRecords(Math.round(start));
            } else {
                // Ensure the final value is exactly the target
                setAnimatedTotalRecords(end);
                clearInterval(timer);
            }
        }, stepTime);

        // Cleanup function to clear the interval if the component unmounts or state changes again
        return () => clearInterval(timer);
    }, [totalRecords]); // Dependency on the actual fetched count


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
             setTotalRecords(totalCount); // This triggers the animation useEffect
             setUniqueHospitals(uniqueHospitalsList); // Update unique hospitals list
             setIsRefreshing(false);
        },
        []
    );

    return (
        <div className="
             min-h-screen 
             bg-gray-white
             px-0 
             py-3
             md:px-6
             lg:pl-24 lg:pr-0
             2xl:px-0
         ">
            
            {/* Help Card Integration: Show the modal if state is true */}
            <AnimatePresence>
                {isHelpCardVisible && <HelpCard onClose={() => setIsHelpCardVisible(false)} />}
            </AnimatePresence>

            <main className="
                 mx-auto 
                 space-y-4 
                 w-full 
                 max-w-screen-2xl 
                 lg:scale-[0.96]
                 lg:origin-top-left
             ">
                                                
                {/* Search Bar Container (Centered) */}
                <div className="flex justify-center w-full mb-4">
                    <div className="relative w-full px-4 sm:w-80 md:w-96">
                        <input
                            type="text"
                            placeholder="Search records..."
                            value={inputQuery} // Binds to INSTANT inputQuery
                            onChange={(e) => setInputQuery(e.target.value)} // Updates INSTANT inputQuery
                            className="block w-full rounded-full border-0 py-1.5 pl-10 pr-4 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 text-sm sm:text-base sm:leading-6"
                        />
                        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-7 sm:pl-7">
                            <FiSearch className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400" aria-hidden="true" />
                        </div>
                    </div>
                </div>

                {/* Header Row (Total Records and Controls) */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 md:gap-4 py-2">
                    
                    {/* Total Records (Left Group: Glassmorphism Card) */}
                    <div className="flex flex-col sm:flex-row sm:items-center gap-3 md:gap-4 flex-shrink-0 w-full sm:w-auto px-4 md:px-0">
                        
                        {/* Glassmorphism Card for Total Records */}
                        <div className="
                            p-4 rounded-xl shadow-lg 
                            backdrop-blur-sm bg-white/20 
                            border border-white/50 
                            transition-all duration-300 hover:shadow-xl
                            flex items-center justify-center
                            w-full sm:w-auto
                        ">
                            <p className="text-sm sm:text-base font-semibold text-gray-800 whitespace-nowrap">
                                Total Records:
                            </p>
                            <strong className="
                                text-indigo-700 text-xl sm:text-2xl ml-2 
                                font-extrabold tracking-tight 
                                transition-colors duration-500
                            ">
                                {animatedTotalRecords.toLocaleString()} 
                                {/* .toLocaleString() for thousands separator */}
                            </strong>
                        </div>

                    </div>

                    {/* Controls (Right Group: Upload + Sync + Help Icon) */}
                    <div className="flex flex-wrap justify-center sm:justify-end items-center gap-2 sm:gap-3 md:gap-4 w-full sm:w-auto px-4 md:px-0">
                        
                        {/* Left group of controls: Upload + Sync + Help Icon */}
                        <div className="flex flex-wrap justify-center sm:justify-end items-center gap-2 sm:gap-3 md:gap-4 w-full sm:w-auto">
                            <UploadButton
                                onUploadSuccess={handleUploadSuccess}
                                onUploadError={handleUploadError}
                                // Note: UploadButton requires cursor-pointer applied internally or via a prop if available.
                            />

                            {/* Sync Data Button (with cursor-pointer fix) */}
                            <button
                                onClick={handleRefresh}
                                disabled={isRefreshing}
                                className={`
                                    w-full sm:w-auto flex items-center justify-center px-4 py-1.5 sm:py-2 text-sm sm:text-base font-semibold rounded-lg shadow-md 
                                    transition-all duration-300 bg-indigo-600 hover:bg-indigo-700 text-white cursor-pointer
                                    focus:outline-none focus:ring-4 focus:ring-indigo-500 focus:ring-opacity-50 
                                    disabled:bg-indigo-400 disabled:cursor-wait
                                `}
                            >
                                <FiRefreshCw
                                    className={`mr-2 h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`}
                                />
                                {isRefreshing ? 'Syncing...' : 'Sync Data'}
                            </button>
                            
                            {/* Help Icon Button (with cursor-pointer fix) */}
                            <button
                                onClick={() => setIsHelpCardVisible(true)}
                                aria-label="Open Help Guide"
                                className="
                                    flex items-center justify-center h-9 w-9 sm:h-10 sm:w-10 rounded-full 
                                    bg-gray-100 hover:bg-gray-200 text-indigo-600 hover:text-indigo-700 
                                    transition-colors duration-200 shadow-md flex-shrink-0 cursor-pointer
                                "
                            >
                                <FiHelpCircle className="h-5 w-5 sm:h-6 sm:w-6" />
                            </button>
                        </div>

                        {/* Right group: Export Excel (Placeholder) */}
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
                    // Pass setSearchQuery (which updates the debounced state) back to the table
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