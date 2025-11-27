'use client';

import React, { useState, useCallback, useEffect } from 'react';
import Image from 'next/image'; 
import { FiRefreshCw, FiSearch, FiHelpCircle, FiGrid, FiUserCheck, FiUsers } from 'react-icons/fi';
import { AnimatePresence, motion } from 'framer-motion';

// --- IMPORTS ---
import HelpCard from '@/components/Certificates/ui/HelpCard'; 
import UploadButton from '@/components/UploadButton';
import CertificateTable from '@/components/Certificates/CertificateTable';
import { ICertificateClient } from '@/components/Certificates/utils/constants';
import HospitalPieChart from '@/components/Certificates/analysis/HospitalPieChart';

const CertificateDatabasePage: React.FC = () => {
  const [refreshKey, setRefreshKey] = useState(0);
  const [certificateData, setCertificateData] = useState<ICertificateClient[]>([]);
  const [totalRecords, setTotalRecords] = useState(0); // From Table (for pagination)
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  // State for unique hospitals
  const [uniqueHospitals, setUniqueHospitals] = useState<string[]>([]);

  // State for Database-wide Stats
  const [dbTotalRecords, setDbTotalRecords] = useState(0); // Total in DB
  const [doctorsCount, setDoctorsCount] = useState(0);
  const [staffCount, setStaffCount] = useState(0);

  // --- State for Search and Filter ---
  const [inputQuery, setInputQuery] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [hospitalFilter, setHospitalFilter] = useState('');
  const [isAddFormVisible, setIsAddFormVisible] = useState(false);
  const [isHelpCardVisible, setIsHelpCardVisible] = useState(false); 

  // --- State for Animated Counts ---
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


  // --- NEW LOGIC: Fetch Whole Database Stats ---
  // We fetch this separately so it counts everything in MongoDB, 
  // not just what is currently shown in the table.
  useEffect(() => {
    const fetchGlobalStats = async () => {
      try {
        const res = await fetch('/api/analytics/stats'); // Calls the API created in Step 1
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
  }, [refreshKey]); // Refetch when user clicks "Sync"


  // --- Helper: Number Animation Hook ---
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

  // Apply animations (Use dbTotalRecords instead of totalRecords for the card)
  useCounterAnimation(dbTotalRecords, setAnimatedTotalRecords);
  useCounterAnimation(uniqueHospitals.length, setAnimatedHospitalCount);
  useCounterAnimation(doctorsCount, setAnimatedDoctors, 1500);
  useCounterAnimation(staffCount, setAnimatedStaff, 1500);


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
       setTotalRecords(totalCount); // This handles table pagination
       setUniqueHospitals(uniqueHospitalsList); 
       setIsRefreshing(false);
    },
    []
  );

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-800 font-sans selection:bg-indigo-500/10 selection:text-indigo-700">
      
      <AnimatePresence>
        {isHelpCardVisible && <HelpCard onClose={() => setIsHelpCardVisible(false)} />}
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
                  {/* Using Animated DB Total */}
                  {animatedTotalRecords.toLocaleString()}
                </span>
                <span className="text-sm font-medium text-slate-400">entries</span>
              </div>
            </div>
            <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-emerald-50 border border-emerald-100 p-1">
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
                  {/* Using Animated DB Doctors */}
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
                  {/* Using Animated DB Staff */}
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
        <div className="flex flex-col sm:flex-row items-center justify-end gap-3 pb-2">
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