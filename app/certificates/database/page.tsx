'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { FiCheckCircle, FiAlertTriangle, FiRefreshCw } from 'react-icons/fi';
import UploadButton from '@/components/UploadButton';
import CertificateTable, { ICertificateClient } from '@/components/CertificateTable';

const CertificateDatabasePage: React.FC = () => {
    const [refreshKey, setRefreshKey] = useState(0);
    const [alert, setAlert] = useState<{ message: string; isError: boolean } | null>(null);
    const [certificateData, setCertificateData] = useState<ICertificateClient[]>([]);
    const [isRefreshing, setIsRefreshing] = useState(false);

    // Clear alerts automatically
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

    // Effect to manage the 'isRefreshing' state (using a heuristic timeout)
    useEffect(() => {
        if (isRefreshing) {
            const timeout = setTimeout(() => {
                setIsRefreshing(false);
            }, 1000); 
            return () => clearTimeout(timeout);
        }
    }, [isRefreshing]);

    // Upload handlers
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

    const handleTableDataUpdate = useCallback((data: ICertificateClient[]) => {
        setCertificateData(data);
        setIsRefreshing(false);
        if (alert?.message === 'Refreshing table data...') {
             handleAlert('Table data synchronized.', false);
        }
    }, [alert, handleAlert]);

    return (
        // Reduced horizontal padding on container (px-4 sm:px-8 to px-3 sm:px-6)
        <div className="min-h-screen bg-gray-50 p-3 py-5 px-3 sm:px-6"> 
            {/* Added max-w-screen-2xl (1536px) to limit the width but make it wider than 7xl (1280px) */}
            <main className="max-w-screen-2xl mx-auto space-y-3"> 
                
                {/* 🚀 COMBINED HEADER ROW: Total Records and Controls 🚀 */}
                <div className="flex items-center justify-between py-2">
                    
                    {/* 1. Total Records (Left side) */}
                    <div className="flex-shrink-0">
                        <p className="text-base font-semibold text-gray-700"> 
                            Total Records: <strong className="text-indigo-600">{certificateData.length}</strong>
                        </p>
                    </div>

                    {/* 2. Main Controls (Right side group) */}
                    <div className="flex space-x-3 items-center">
                        
                        {/* Upload Component */}
                        <UploadButton
                            onUploadSuccess={handleUploadSuccess}
                            onUploadError={handleUploadError}
                        />
                        
                        {/* Refresh Button with Loading Spinner Animation */}
                        <button
                            onClick={handleRefresh}
                            disabled={isRefreshing}
                            className={`
                                flex items-center justify-center px-3 py-1.5 text-sm font-semibold rounded-lg shadow-md 
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
                <div className="bg-white rounded-xl shadow-xl border border-gray-100 p-4"> 
                    <CertificateTable
                        refreshKey={refreshKey}
                        onRefresh={handleTableDataUpdate}
                        onAlert={handleAlert}
                    />
                </div>
            </main>
        </div>
    );
};

export default CertificateDatabasePage;