'use client';

import React, { useState, useCallback, useEffect } from 'react';
import Image from 'next/image'; 
import { FiRefreshCw, FiSearch, FiHelpCircle, FiGrid, FiUserCheck, FiUsers, FiDownload, FiCheckCircle, FiX } from 'react-icons/fi';
import { AnimatePresence, motion } from 'framer-motion';

// --- IMPORTS ---
import HelpCard from '@/components/Certificates/ui/HelpCard'; 
import UploadButton from '@/components/UploadButton'; 
import CertificateTable from '@/components/Certificates/CertificateTable';
import HospitalPieChart from '@/components/Certificates/analysis/HospitalPieChart';
import AddCertificateForm from '@/components/Certificates/ui/AddCertificateForm';
import { useCertificateActions } from '@/components/Certificates/hooks/useCertificateActions';

// Import Constants
import { 
  ICertificateClient, 
  initialNewCertificateState 
} from '@/components/Certificates/utils/constants';

const CertificateDatabasePage: React.FC = () => {
  // --- Global State ---
  const [refreshKey, setRefreshKey] = useState(0);
  const [certificateData, setCertificateData] = useState<ICertificateClient[]>([]);
  const [totalRecords, setTotalRecords] = useState(0); 
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [uniqueHospitals, setUniqueHospitals] = useState<string[]>([]);
    
  // --- NEW: Batch Upload State (With Persistence) ---
  const [newBatchIds, setNewBatchIds] = useState<string[]>([]);
  const [isBatchLoaded, setIsBatchLoaded] = useState(false);

  // Load Batch IDs from LocalStorage on mount
  useEffect(() => {
    let mounted = true;
    try {
        if (typeof window !== 'undefined') {
            const saved = localStorage.getItem('cert_db_new_batch');
            if (saved && mounted) {
                const parsed = JSON.parse(saved);
                if (Array.isArray(parsed)) {
                    setNewBatchIds(parsed);
                }
            }
        }
    } catch (e) {
        console.error("Failed to load saved batch", e);
    } finally {
        if (mounted) setIsBatchLoaded(true);
    }
    return () => { mounted = false; };
  }, []);

  // Save Batch IDs to LocalStorage whenever they change
  useEffect(() => {
    if (!isBatchLoaded) return; 

    if (newBatchIds.length > 0) {
        localStorage.setItem('cert_db_new_batch', JSON.stringify(newBatchIds));
    } else {
        localStorage.removeItem('cert_db_new_batch');
    }
  }, [newBatchIds, isBatchLoaded]);

  // --- Stats State ---
  const [dbTotalRecords, setDbTotalRecords] = useState(0); 
  const [doctorsCount, setDoctorsCount] = useState(0);
  const [staffCount, setStaffCount] = useState(0);

  // --- Search & UI State ---
  const [inputQuery, setInputQuery] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [hospitalFilter, setHospitalFilter] = useState('');
  const [isHelpCardVisible, setIsHelpCardVisible] = useState(false); 
  const [dummyLoading, setDummyLoading] = useState(false);

  // --- ADD FORM STATE ---
  const [isAddFormVisible, setIsAddFormVisible] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [newCertificateData, setNewCertificateData] = useState<Omit<ICertificateClient, '_id'>>(initialNewCertificateState);

  // --- Animated Counts State ---
  const [animatedTotalRecords, setAnimatedTotalRecords] = useState(0);
  const [animatedHospitalCount, setAnimatedHospitalCount] = useState(0);
  const [animatedDoctors, setAnimatedDoctors] = useState(0);
  const [animatedStaff, setAnimatedStaff] = useState(0);

  // --- Debounce Logic ---
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      setSearchQuery(inputQuery);
    }, 500);
    return () => clearTimeout(delayDebounceFn);
  }, [inputQuery]);

  // --- Fetch Global Stats ---
  useEffect(() => {
    const fetchGlobalStats = async () => {
      try {
        const res = await fetch('/api/analytics/stats');
        if (res.ok) {
          const data = await res.json();
          setDoctorsCount(data.doctorsCount || 0);
          setStaffCount(data.staffCount || 0);
          setDbTotalRecords(data.totalRecords || 0);
        }
      } catch (error) {
        console.error("Failed to fetch global stats:", error);
      }
    };
    fetchGlobalStats();
  }, [refreshKey]);

  // --- Helper: Number Animation ---
  const useCounterAnimation = (targetValue: number, setter: React.Dispatch<React.SetStateAction<number>>, duration = 2000) => {
    useEffect(() => {
      let start = 0; 
      const end = targetValue;
      if (start === end) return;
      const steps = 50;
      const stepTime = duration / steps;
      const increment = (end - start) / steps; 
      let currentStep = 0;
      const timer = setInterval(() => {
        currentStep++;
        if (currentStep <= steps) {
          start += increment;
          setter(Math.round(start));
        } else {
          setter(end);
          clearInterval(timer);
        }
      }, stepTime);
      return () => clearInterval(timer);
    }, [targetValue, duration, setter]);
  };

  useCounterAnimation(dbTotalRecords, setAnimatedTotalRecords);
  useCounterAnimation(uniqueHospitals.length, setAnimatedHospitalCount);
  useCounterAnimation(doctorsCount, setAnimatedDoctors, 1500);
  useCounterAnimation(staffCount, setAnimatedStaff, 1500);

  // --- Alerts & Refresh Logic ---
  const handleAlert = useCallback(
    (message: string, isError: boolean) => {
       if (isError) console.error("Alert (ERROR):", message);
       else console.log("Alert (INFO):", message);
    },
    []
  );

  const handleRefresh = useCallback(() => {
    setRefreshKey((prev) => prev + 1);
    setIsRefreshing(true);
  }, []);

  // Safety timeout for refresh spinner
  useEffect(() => {
    if (isRefreshing) {
      const timeout = setTimeout(() => {
        setIsRefreshing(false);
      }, 2000); 
      return () => clearTimeout(timeout);
    }
  }, [isRefreshing]);

  // --- Fetch Function for Actions Hook (Page Level) ---
  const fetchCertificatesForExportPageSide = useCallback(async (isBulkPdfExport = false, idsToFetch: string[] = []) => {
      try {
          const params = new URLSearchParams({ all: 'true' });
          if (isBulkPdfExport && idsToFetch.length > 0) {
              params.append('ids', idsToFetch.join(','));
          }
          const response = await fetch(`/api/certificates?${params.toString()}`);
          const result = await response.json();
          return response.ok && result.success ? result.data : [];
      } catch (error) {
          console.error('Export error:', error);
          return [];
      }
  }, []);

  // --- Dummies for Hook ---
  const [dummySelectedIds, setDummySelectedIds] = useState<string[]>([]);
    
  // ✅ DELETE Function
  const deleteCertificate = useCallback(async (id: string): Promise<boolean> => {
      try {
          const response = await fetch(`/api/certificates/${id}`, {
              method: 'DELETE',
          });
            
          const result = await response.json();

          if (!response.ok) {
              throw new Error(result.message || "Failed to delete certificate");
          }
          return true;
      } catch (error: any) {
          console.error("Delete error:", error);
          handleAlert(error.message || "Failed to delete certificate", true);
          return false;
      }
  }, [handleAlert]);

  // ✅ UPDATE Function (Required by Hook, even if only used for bulk actions here)
  const updateCertificate = useCallback(async (id: string, data: Partial<ICertificateClient>): Promise<boolean> => {
    try {
        const response = await fetch(`/api/certificates/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });
        
        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.message || "Failed to update certificate");
        }

        return true;
    } catch (error: any) {
        console.error("Update error:", error);
        handleAlert(error.message || "Failed to update certificate", true);
        return false;
    }
  }, [handleAlert]);

  // --- Initialize Actions Hook ---
  const { 
    handleBulkGeneratePDF_V1, 
    handleBulkGeneratePDF_V2,
    isBulkGeneratingV1, 
    isBulkGeneratingV2
  } = useCertificateActions({
    certificates: certificateData,
    selectedIds: dummySelectedIds,
    setSelectedIds: setDummySelectedIds,
    fetchCertificates: async () => { handleRefresh(); },
    deleteCertificate, 
    updateCertificate, // <--- ✅ ADDED THIS TO FIX THE ERROR
    fetchCertificatesForExport: fetchCertificatesForExportPageSide,
    showNotification: (msg, type) => handleAlert(msg, type === 'error'),
    onAlert: handleAlert,
    setIsLoading: setDummyLoading,
  });

  // --- Upload Handlers ---
  
  // ✅ Fixed Upload Success Handler to capture IDs
  const handleUploadSuccess = useCallback((message: string, uploadedIds?: string[]) => {
    handleAlert(message, false);
    handleRefresh();
    
    // Check if we received the IDs of the new batch
    if (uploadedIds && Array.isArray(uploadedIds) && uploadedIds.length > 0) {
        console.log("New Batch Detected:", uploadedIds.length);
        setNewBatchIds(uploadedIds);
    } else {
        console.warn("Upload succeeded but no IDs were returned to client.");
    }
  }, [handleAlert, handleRefresh]);

  const handleUploadError = useCallback((message: string) => {
    if (message) handleAlert(message, true);
  }, [handleAlert]);

  const handleClearBatch = () => {
    setNewBatchIds([]);
  };

  const handleTableDataUpdate = useCallback(
    (data: ICertificateClient[], totalCount: number, uniqueHospitalsList: string[]) => {
       setCertificateData(data);
       setTotalRecords(totalCount);
       setUniqueHospitals(uniqueHospitalsList); 
       setIsRefreshing(false);
    },
    []
  );

  const handleNewCertChange = (field: keyof Omit<ICertificateClient, '_id'>, value: string) => {
    setNewCertificateData(prev => ({
        ...prev,
        [field]: value
    }));
  };

  const handleAddCertificate = async (): Promise<boolean> => {
    try {
        if (!newCertificateData.certificateNo || !newCertificateData.name || !newCertificateData.hospital || !newCertificateData.doi) {
            alert("Please fill in all fields.");
            return false;
        }

        setIsAdding(true);

        const response = await fetch('/api/certificates', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(newCertificateData),
        });

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.message || "Failed to add certificate");
        }

        handleAlert("Certificate saved successfully!", false);
        setRefreshKey(prev => prev + 1); 
        return true; 

    } catch (error: any) {
        console.error("Error saving:", error);
        handleAlert(error.message, true);
        alert(error.message); 
        return false;
    } finally {
        setIsAdding(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-800 font-sans selection:bg-indigo-500/10 selection:text-indigo-700">
        
      <AnimatePresence>
        {isHelpCardVisible && <HelpCard onClose={() => setIsHelpCardVisible(false)} />}
        
        {isAddFormVisible && (
            <AddCertificateForm 
                newCertificateData={newCertificateData}
                isAdding={isAdding}
                uniqueHospitals={uniqueHospitals}
                handleNewCertChange={handleNewCertChange}
                handleAddCertificate={handleAddCertificate}
                setIsAddFormVisible={setIsAddFormVisible}
                setNewCertificateData={setNewCertificateData}
            />
        )}
      </AnimatePresence>

      <main className="mx-auto w-full max-w-[1600px] px-6 py-10 space-y-8">
        
        {/* --- HEADER SECTION --- */}
        <header className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between border-b border-slate-200 pb-8">
          <div className="space-y-1">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
              Certificate Database
            </h1>
            <p className="text-sm text-slate-500 font-medium max-w-2xl">
              Centralized repository for managing and tracking digital certification records.
            </p>
          </div>

          <div className="relative w-full lg:w-96 group">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FiSearch className="h-4 w-4 text-slate-400 group-focus-within:text-slate-600 transition-colors" />
            </div>
            <input
              type="text"
              placeholder="Search database..."
              value={inputQuery}
              onChange={(e) => setInputQuery(e.target.value)}
              className="
                block w-full rounded-lg border border-slate-200 bg-white py-2.5 pl-10 pr-4 
                text-sm text-slate-900 placeholder:text-slate-400 
                focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-none
                transition-all duration-200 shadow-sm
              "
            />
          </div>
        </header>

        {/* --- DASHBOARD STATS GRID --- */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* 1. TOTAL CERTIFICATES */}
          <motion.div 
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative flex items-center justify-between p-5 bg-white rounded-xl shadow-sm border border-slate-200 hover:border-emerald-200 transition-colors duration-300 group"
          >
            <div className="flex flex-col justify-center">
              <div className="flex items-center gap-2 mb-1">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                  Total Certificates
                </p>
                <span className="flex h-2 w-2 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-bold text-slate-900 tracking-tight">
                  {animatedTotalRecords.toLocaleString()}
                </span>
                <span className="text-sm font-medium text-slate-400">entries</span>
              </div>
            </div>
            <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-emerald-5 border border-emerald-100 p-1">
              <Image
                src="/logos/ssilogo.png"
                alt="SSI Logo"
                fill
                className="object-contain p-0.5 opacity-90 grayscale-[0.2] group-hover:grayscale-0 transition-all duration-300"
              />
            </div>
          </motion.div>

          {/* 2. TOTAL HOSPITALS */}
          <motion.div 
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="relative flex items-center justify-between p-5 bg-white rounded-xl shadow-sm border border-slate-200 hover:border-blue-200 transition-colors duration-300"
          >
            <div className="flex flex-col justify-center">
              <div className="flex items-center gap-2 mb-1">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                  Total Hospitals
                </p>
                <span className="flex h-2 w-2 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                </span>
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-bold text-slate-900 tracking-tight">
                  {animatedHospitalCount.toLocaleString()}
                </span>
                <span className="text-sm font-medium text-slate-400">active</span>
              </div>
            </div>
            <div className="relative h-12 w-12 shrink-0 flex items-center justify-center rounded-lg bg-blue-50 border border-blue-100 p-1">
                <FiGrid className="w-6 h-6 text-blue-500" />
            </div>
          </motion.div>

          {/* 3. TOTAL DOCTORS */}
          <motion.div 
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="relative flex items-center justify-between p-5 bg-white rounded-xl shadow-sm border border-slate-200 hover:border-violet-200 transition-colors duration-300"
          >
            <div className="flex flex-col justify-center">
              <div className="flex items-center gap-2 mb-1">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                  Doctors
                </p>
                <span className="flex h-2 w-2 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-violet-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-violet-500"></span>
                </span>
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-bold text-slate-900 tracking-tight">
                  {animatedDoctors.toLocaleString()}
                </span>
                <span className="text-sm font-medium text-slate-400">identified</span>
              </div>
            </div>
            <div className="relative h-12 w-12 shrink-0 flex items-center justify-center rounded-lg bg-violet-50 border border-violet-100 p-1">
                <FiUserCheck className="w-6 h-6 text-violet-500" />
            </div>
          </motion.div>

          {/* 4. TOTAL STAFF */}
          <motion.div 
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="relative flex items-center justify-between p-5 bg-white rounded-xl shadow-sm border border-slate-200 hover:border-amber-200 transition-colors duration-300"
          >
            <div className="flex flex-col justify-center">
              <div className="flex items-center gap-2 mb-1">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                  Staff Members
                </p>
                <span className="flex h-2 w-2 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
                </span>
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-bold text-slate-900 tracking-tight">
                  {animatedStaff.toLocaleString()}
                </span>
                <span className="text-sm font-medium text-slate-400">others</span>
              </div>
            </div>
            <div className="relative h-12 w-12 shrink-0 flex items-center justify-center rounded-lg bg-amber-50 border border-amber-100 p-1">
                <FiUsers className="w-6 h-6 text-amber-500" />
            </div>
          </motion.div>
        </div>

        {/* --- ACTION TOOLBAR --- */}
        <div className="flex flex-col gap-4 pb-2">
            <div className="flex flex-col sm:flex-row items-center justify-end gap-3">
                
                {/* ✅ NEW BATCH ACTIONS - Appears Left of Upload Button */}
                <AnimatePresence mode='wait'>
                    {newBatchIds.length > 0 && isBatchLoaded && (
                        <motion.div
                            key="new-batch-actions"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            className="flex flex-col sm:flex-row items-center gap-2 w-full sm:w-auto mr-auto sm:mr-0 p-1 pr-2 bg-indigo-50 border border-indigo-100 rounded-xl"
                        >
                            <span className="text-xs font-bold text-indigo-700 uppercase tracking-wider px-2 hidden lg:inline-block">
                                New Batch ({newBatchIds.length})
                            </span>
                            
                            <button
                                onClick={() => handleBulkGeneratePDF_V2(newBatchIds)}
                                disabled={isBulkGeneratingV2}
                                title="Download New Training Certificates"
                                className="flex items-center gap-2 px-3 py-1.5 bg-indigo-600 text-white text-xs font-medium rounded-lg hover:bg-indigo-700 transition-colors shadow-sm whitespace-nowrap"
                            >
                                {isBulkGeneratingV2 ? <FiRefreshCw className="animate-spin" /> : <FiDownload />}
                                <span>Training</span>
                            </button>
                            
                            <button
                                onClick={() => handleBulkGeneratePDF_V1(newBatchIds)}
                                disabled={isBulkGeneratingV1}
                                title="Download New Proctoring Certificates"
                                className="flex items-center gap-2 px-3 py-1.5 bg-white text-indigo-700 border border-indigo-200 text-xs font-medium rounded-lg hover:bg-indigo-50 transition-colors shadow-sm whitespace-nowrap"
                            >
                                {isBulkGeneratingV1 ? <FiRefreshCw className="animate-spin" /> : <FiDownload />}
                                <span>Proctoring</span>
                            </button>

                            <button 
                                onClick={handleClearBatch}
                                className="ml-1 p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors"
                                title="Clear Batch Selection"
                            >
                                <FiX className="w-3.5 h-3.5" />
                            </button>
                        </motion.div>
                    )}
                </AnimatePresence>

                <div className="w-full sm:w-auto">
                    <UploadButton
                        onUploadSuccess={handleUploadSuccess}
                        onUploadError={handleUploadError}
                    />
                </div>

                <button
                    onClick={handleRefresh}
                    disabled={isRefreshing}
                    className={`
                        w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2.5 
                        rounded-lg text-sm font-medium border transition-all duration-200
                        ${isRefreshing 
                        ? 'bg-slate-50 text-slate-400 border-slate-200 cursor-not-allowed' 
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50 hover:text-slate-900 shadow-sm'
                        }
                    `}
                >
                    <FiRefreshCw 
                        className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} 
                    />
                    <span>Sync</span>
                </button>

                <button
                    onClick={() => setIsHelpCardVisible(true)}
                    className="
                        w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2.5 
                        rounded-lg text-sm font-medium border border-transparent
                        bg-slate-800 text-white shadow-sm hover:bg-slate-900 
                        transition-all duration-200 focus:ring-2 focus:ring-slate-500 focus:ring-offset-2
                    "
                >
                    <FiHelpCircle className="w-4 h-4" />
                    <span>Guide</span>
                </button>
            </div>
        </div>

        {/* --- CONTENT AREA: Charts & Table --- */}
        <div className="grid grid-cols-1 gap-6">
          
          {/* Analytics Section */}
          <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
            <HospitalPieChart
              uniqueHospitals={uniqueHospitals}
              totalRecords={totalRecords}
              certificates={certificateData} 
            />
          </div>
          
          {/* Data Table Section */}
          <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden min-h-[500px]">
            <CertificateTable
              refreshKey={refreshKey}
              onRefresh={handleTableDataUpdate as any} 
              onAlert={handleAlert}
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery} 
              hospitalFilter={hospitalFilter}
              setHospitalFilter={setHospitalFilter}
              isAddFormVisible={isAddFormVisible}
              setIsAddFormVisible={setIsAddFormVisible}
              uniqueHospitals={uniqueHospitals} 
            />
          </div>
        </div>
      </main>
    </div>
  );
};

export default CertificateDatabasePage;