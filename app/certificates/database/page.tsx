'use client';

import React, { useState, useCallback, useEffect } from 'react';
import UploadButton from '@/components/UploadButton';
import CertificateTable, { ICertificateClient } from '@/components/CertificateTable';
import { FiCheckCircle, FiAlertTriangle, FiRefreshCw } from 'react-icons/fi';

const CertificateDatabasePage: React.FC = () => {
  const [refreshKey, setRefreshKey] = useState(0);
  const [alert, setAlert] = useState<{ message: string, isError: boolean } | null>(null);
  const [certificateData, setCertificateData] = useState<ICertificateClient[]>([]);

  // Clear alert after 5 seconds
  const clearAlert = useCallback(() => {
    setTimeout(() => setAlert(null), 5000);
  }, []);

  const handleAlert = useCallback((message: string, isError: boolean) => {
    setAlert({ message, isError });
    clearAlert();
  }, [clearAlert]);

  const handleUploadSuccess = (message: string) => {
    handleAlert(message, false);
    setRefreshKey(prev => prev + 1);
  };

  const handleUploadError = (message: string) => {
    if (message) handleAlert(message, true);
  };

  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1);
    handleAlert('Table data refreshed.', false);
  };

  const handleTableDataUpdate = useCallback((data: ICertificateClient[]) => {
    setCertificateData(data);
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 p-4 sm:p-8">
      <main className="max-w-7xl mx-auto space-y-8">
        {/* Alert Notification */}
        {alert && (
          <div
            className={`p-4 rounded-xl shadow-lg transition-opacity duration-300 ${
              alert.isError
                ? 'bg-red-500 text-white border-red-700'
                : 'bg-green-500 text-white border-green-700'
            }`}
          >
            <p className="font-medium flex items-center">
              {alert.isError ? <FiAlertTriangle className="mr-3" /> : <FiCheckCircle className="mr-3" />}
              {alert.message}
            </p>
          </div>
        )}

        {/* Controls Section */}
        <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4 items-center justify-start">
          <UploadButton
            onUploadSuccess={handleUploadSuccess}
            onUploadError={handleUploadError}
          />
          <button
            onClick={handleRefresh}
            className="px-4 py-2 text-sm font-semibold rounded-lg shadow-md transition-all duration-200
                bg-blue-600 hover:bg-blue-700 text-white hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 w-full sm:w-auto flex items-center"
          >
            <FiRefreshCw className="mr-2" />
            Refresh Table
          </button>
        </div>

        {/* Certificate Table */}
        <CertificateTable
          refreshKey={refreshKey}
          onRefresh={handleTableDataUpdate}
          onAlert={handleAlert}
        />
      </main>
    </div>
  );
};

export default CertificateDatabasePage;
