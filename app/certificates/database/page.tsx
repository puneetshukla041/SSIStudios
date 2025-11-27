'use client';

import React, { useState, useCallback, useEffect } from 'react';
import Image from 'next/image'; // Added for the logo
import { FiRefreshCw, FiSearch, FiHelpCircle } from 'react-icons/fi';
import { AnimatePresence, motion } from 'framer-motion';

// --- IMPORTS ---
import HelpCard from '@/components/Certificates/ui/HelpCard'; 
import UploadButton from '@/components/UploadButton';
import CertificateTable from '@/components/Certificates/CertificateTable';
import { ICertificateClient } from '@/components/Certificates/utils/constants';
import HospitalPieChart from '@/components/Certificates/analysis/HospitalPieChart';

// =======================================================================
// MAIN COMPONENT: CertificateDatabasePage
// =======================================================================

const CertificateDatabasePage: React.FC = () => {
  const [refreshKey, setRefreshKey] = useState(0);
  const [certificateData, setCertificateData] = useState<ICertificateClient[]>([]);
  const [totalRecords, setTotalRecords] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  // State for unique hospitals
  const [uniqueHospitals, setUniqueHospitals] = useState<string[]>([]);

  // --- State for Search and Filter ---
  const [inputQuery, setInputQuery] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [hospitalFilter, setHospitalFilter] = useState('');
  const [isAddFormVisible, setIsAddFormVisible] = useState(false);
  
  // State for the help card visibility
  const [isHelpCardVisible, setIsHelpCardVisible] = useState(false); 

  // --- State for Animated Count ---
  const [animatedTotalRecords, setAnimatedTotalRecords] = useState(0);

  // --- Debounce Logic ---
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      setSearchQuery(inputQuery);
    }, 500);
    return () => clearTimeout(delayDebounceFn);
  }, [inputQuery]);

  // --- Animation Effect for Total Records ---
  useEffect(() => {
    if (totalRecords === animatedTotalRecords) return;

    let start = animatedTotalRecords;
    const end = totalRecords;
    const duration = 2000;
    const steps = 50;
    const stepTime = duration / steps;
    const increment = (end - start) / steps; 

    let currentStep = 0;
    const timer = setInterval(() => {
      currentStep++;
      if (currentStep <= steps) {
        start += increment;
        setAnimatedTotalRecords(Math.round(start));
      } else {
        setAnimatedTotalRecords(end);
        clearInterval(timer);
      }
    }, stepTime);

    return () => clearInterval(timer);
  }, [totalRecords]); 

  // --- Alerts ---
  const handleAlert = useCallback(
    (message: string, isError: boolean) => {
       if (isError) {
         console.error("Alert (ERROR):", message);
       } else {
         console.log("Alert (INFO):", message);
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

  const handleTableDataUpdate = useCallback(
    (data: ICertificateClient[], totalCount: number, uniqueHospitalsList: string[]) => {
       setCertificateData(data);
       setTotalRecords(totalCount);
       setUniqueHospitals(uniqueHospitalsList); 
       setIsRefreshing(false);
    },
    []
  );

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-800 font-sans selection:bg-indigo-500/10 selection:text-indigo-700">
      
      {/* Help Card Modal Overlay */}
      <AnimatePresence>
        {isHelpCardVisible && <HelpCard onClose={() => setIsHelpCardVisible(false)} />}
      </AnimatePresence>

      <main className="mx-auto w-full max-w-[1600px] px-6 py-10 space-y-8">
        
        {/* --- HEADER SECTION: Title & Search --- */}
        <header className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between border-b border-slate-200 pb-8">
          <div className="space-y-1">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
              Certificate Database
            </h1>
            <p className="text-sm text-slate-500 font-medium max-w-2xl">
              Centralized repository for managing and tracking digital certification records.
            </p>
          </div>

          {/* Professional Search Bar */}
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

        {/* --- DASHBOARD CONTROLS & STATS --- */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* LEFT: Total Records Widget (Updated with Logo) */}
          <div className="lg:col-span-4 xl:col-span-3">
            <motion.div 
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              className="
                relative h-full flex items-center justify-between p-5
                bg-white rounded-xl shadow-sm border border-slate-200
                hover:border-slate-300 transition-colors duration-300
              "
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
              
              {/* Logo Implementation */}
              <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-slate-50 border border-slate-100 p-1">
                <Image
                  src="/logos/ssilogo.png"
                  alt="SSI Logo"
                  fill
                  className="object-contain p-0.5 opacity-90 grayscale-[0.2] hover:grayscale-0 transition-all duration-300"
                />
              </div>
            </motion.div>
          </div>

          {/* RIGHT: Action Toolbar */}
          <div className="lg:col-span-8 xl:col-span-9 flex flex-col sm:flex-row items-center justify-end gap-3">
              
            {/* 1. Upload Button */}
            <div className="w-full sm:w-auto">
              <UploadButton
                onUploadSuccess={handleUploadSuccess}
                onUploadError={handleUploadError}
              />
            </div>

            {/* 2. Refresh Button */}
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

            {/* 3. Help Button */}
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
             {/* Header for the section could go here if needed */}
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
            />
          </div>
        </div>

      </main>
    </div>
  );
};

export default CertificateDatabasePage;