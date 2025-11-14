// D:\ssistudios\ssistudios\components\CertificateDatabasePage.tsx

'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { FiCheckCircle, FiAlertTriangle, FiRefreshCw } from 'react-icons/fi';
import UploadButton from '@/components/UploadButton';
import CertificateTable from '@/components/Certificates/CertificateTable';

// 💡 FIX: Import ICertificateClient from the constants file.
// Assuming constants.ts is one level up and then down into the Certificates folder structure
import { ICertificateClient } from '@/components/Certificates/utils/constants'; 
// NOTE: The exact path might vary depending on your setup, adjust '@/components/...' accordingly.


const CertificateDatabasePage: React.FC = () => {
    const [refreshKey, setRefreshKey] = useState(0);
    const [alert, setAlert] = useState<{ message: string; isError: boolean } | null>(null);
    const [certificateData, setCertificateData] = useState<ICertificateClient[]>([]);
    // 💡 NEW STATE: To hold the true total count from the database
    const [totalRecords, setTotalRecords] = useState(0); 
    const [isRefreshing, setIsRefreshing] = useState(false);

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

    // 💡 MODIFIED: handleTableDataUpdate must now accept the full FetchResponse payload
    // to extract the 'total' count.
    const handleTableDataUpdate = useCallback(
        (data: ICertificateClient[], totalCount: number) => {
            setCertificateData(data);
            setTotalRecords(totalCount); // 💡 UPDATE totalRecords state
            setIsRefreshing(false);
            if (alert?.message === 'Refreshing table data...') {
                handleAlert('Table data synchronized.', false);
            }
        },
        [alert, handleAlert]
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

                        {/* Right group: Export Excel */}
                        <div className="flex justify-center sm:justify-end">
                            {/* Keep your existing Export Excel button here */}
                        </div>
                    </div>
                </div>

                {/* Alert Notification */}
                {alert && (
                    <div
                        className={`flex items-center gap-2 p-3 rounded-xl shadow-lg transition-all duration-500 ease-in-out ${
                            alert.isError ? 'bg-red-600 text-white' : 'bg-green-600 text-white'
                        }`}
                    >
                        {alert.isError ? (
                            <FiAlertTriangle className="w-5 h-5 flex-shrink-0" />
                        ) : (
                            <FiCheckCircle className="w-5 h-5 flex-shrink-0" />
                        )}
                        <span className="text-sm font-medium">{alert.message}</span>
                    </div>
                )}

                {/* Certificate Table */}
                <div className="bg-white rounded-xl shadow-xl border border-gray-100 p-3 sm:p-4 overflow-x-auto">
                    <CertificateTable
                        refreshKey={refreshKey}
                        onRefresh={handleTableDataUpdate} // Now expects two arguments
                        onAlert={handleAlert}
                    />
                </div>
            </main>
        </div>
    );
};

export default CertificateDatabasePage;