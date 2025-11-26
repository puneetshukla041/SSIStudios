'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  AreaChart, 
  Area,
  Cell
} from 'recharts';
import { 
  Activity, 
  Building2, 
  Calendar, 
  Users, 
  RefreshCcw, 
  AlertCircle,
  FileText,
  TrendingUp
} from 'lucide-react';

const AnalysisPage = () => {
  // State for data, loading, and errors
  // Fix: Explicitly type the state to allow null or the expected data type
  const [data, setData] = useState<any>(null); 
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  // --- CONFIGURATION ---
  // SET THIS TO FALSE TO USE YOUR REAL API
  const DEMO_MODE = false; 

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      // Real API Call
      const response = await fetch('/api/analysis');
      
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const result = await response.json();

      if (result.success) {
        setData(result.data);
        setLastUpdated(new Date());
      } else {
        throw new Error(result.message || 'Failed to fetch analysis data');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred');
      console.error("Fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // --- DERIVED METRICS ---
  const kpiData = useMemo(() => {
    if (!data) return null;

    const topHospital = data.byHospital && data.byHospital.length > 0 
      ? data.byHospital[0] 
      : { hospital: 'N/A', count: 0 };
    
    // Find peak month
    const peakMonth = data.byTime && data.byTime.length > 0
      ? data.byTime.reduce((max: any, current: any) => (current.count > max.count) ? current : max, { count: 0, label: 'N/A' })
      : { count: 0, label: 'N/A' };

    return {
      topHospital,
      peakMonth
    };
  }, [data]);

  // --- RENDER HELPERS ---
  const COLORS = ['#4f46e5', '#0ea5e9', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444'];

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center space-y-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        <p className="text-gray-500 font-medium">Analyzing Certificate Data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center p-4">
        <div className="bg-red-50 p-6 rounded-lg max-w-md w-full text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-800 mb-2">Analysis Failed</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button 
            onClick={fetchData}
            className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // If data is null after loading (shouldn't happen with success check, but for safety)
  if (!data) return null;

  return (
    <div className="min-h-screen bg-white text-gray-800 font-sans selection:bg-indigo-100">
      {/* Header */}
      <header className="border-b border-gray-100 sticky top-0 bg-white/80 backdrop-blur-md z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-indigo-50 rounded-lg">
              <Activity className="w-6 h-6 text-indigo-600" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Certificate Analytics</h1>
              <p className="text-xs text-gray-500">
                Live MongoDB Analysis • <span className="text-green-600 font-medium">Connected</span>
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-xs text-gray-400 hidden sm:inline">
              Last updated: {lastUpdated?.toLocaleTimeString()}
            </span>
            <button 
              onClick={fetchData}
              className="p-2 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-full transition-all"
              title="Refresh Data"
            >
              <RefreshCcw className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8">
        
        {/* KPI Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Total Card */}
          <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-4">
              <div className="p-2 bg-blue-50 rounded-lg">
                <FileText className="w-6 h-6 text-blue-600" />
              </div>
              <span className="text-xs font-semibold text-green-600 bg-green-50 px-2 py-1 rounded-full flex items-center">
                <TrendingUp className="w-3 h-3 mr-1" /> Live
              </span>
            </div>
            <p className="text-gray-500 text-sm font-medium">Total Certificates</p>
            <h3 className="text-3xl font-bold text-gray-900 mt-1">
              {data.totalCertificates?.toLocaleString() || 0}
            </h3>
          </div>

          {/* Top Hospital Card */}
          <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-4">
              <div className="p-2 bg-purple-50 rounded-lg">
                <Building2 className="w-6 h-6 text-purple-600" />
              </div>
            </div>
            <p className="text-gray-500 text-sm font-medium">Leading Hospital</p>
            <h3 className="text-xl font-bold text-gray-900 mt-1 truncate" title={kpiData?.topHospital.hospital}>
              {kpiData?.topHospital.hospital}
            </h3>
            <p className="text-xs text-gray-400 mt-1">
              {kpiData?.topHospital.count.toLocaleString()} certificates issued
            </p>
          </div>

          {/* Peak Time Card */}
          <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-4">
              <div className="p-2 bg-amber-50 rounded-lg">
                <Calendar className="w-6 h-6 text-amber-600" />
              </div>
            </div>
            <p className="text-gray-500 text-sm font-medium">Peak Activity</p>
            <h3 className="text-3xl font-bold text-gray-900 mt-1">
              {kpiData?.peakMonth.label}
            </h3>
            <p className="text-xs text-gray-400 mt-1">
              {kpiData?.peakMonth.count.toLocaleString()} issued in one month
            </p>
          </div>
        </div>

        {/* Charts Section 1: Timeline & Hospitals */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Timeline Chart (Takes up 2 columns) */}
          <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <div className="mb-6">
              <h2 className="text-lg font-bold text-gray-900">Issuance Timeline</h2>
              <p className="text-sm text-gray-500">Volume of certificates processed over time</p>
            </div>
            <div className="h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data.byTime || []} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis 
                    dataKey="label" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: '#9ca3af', fontSize: 12 }}
                    dy={10}
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: '#9ca3af', fontSize: 12 }}
                  />
                  <CartesianGrid vertical={false} stroke="#f3f4f6" />
                  <Tooltip 
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    itemStyle={{ color: '#4f46e5', fontWeight: 600 }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="count" 
                    stroke="#4f46e5" 
                    strokeWidth={3}
                    fillOpacity={1} 
                    fill="url(#colorCount)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Name Distribution (Initial) */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
             <div className="mb-6">
              <h2 className="text-lg font-bold text-gray-900">Name Demographics</h2>
              <p className="text-sm text-gray-500">Distribution by first letter of name</p>
            </div>
             <div className="h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.byInitial || []} layout="vertical" margin={{ top: 0, right: 30, left: 0, bottom: 0 }}>
                  <XAxis type="number" hide />
                  <YAxis 
                    dataKey="initial" 
                    type="category" 
                    axisLine={false} 
                    tickLine={false}
                    tick={{ fill: '#6b7280', fontWeight: 'bold' }}
                    width={20}
                  />
                  <Tooltip 
                     cursor={{fill: 'transparent'}}
                     contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  />
                  <Bar dataKey="count" barSize={12} radius={[0, 4, 4, 0]}>
                    {data.byInitial?.map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Charts Section 2: Top Hospitals Detail */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <div className="mb-6 flex flex-col sm:flex-row justify-between sm:items-end gap-2">
            <div>
              <h2 className="text-lg font-bold text-gray-900">Top 10 Hospitals</h2>
              <p className="text-sm text-gray-500">Institutions with the highest certificate volume</p>
            </div>
            <div className="flex items-center text-xs text-gray-400">
               <Users className="w-4 h-4 mr-1" />
               Sorted by total issued
            </div>
          </div>
          <div className="h-96 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.byHospital || []} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                <XAxis 
                  dataKey="hospital" 
                  axisLine={false} 
                  tickLine={false}
                  tick={{ fill: '#6b7280', fontSize: 11 }}
                  interval={0}
                  // Truncate long names on mobile
                  tickFormatter={(value) => value.length > 15 ? value.substring(0, 15) + '...' : value}
                  dy={10}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false}
                  tick={{ fill: '#9ca3af', fontSize: 12 }}
                />
                <Tooltip 
                  cursor={{ fill: '#f9fafb' }}
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                />
                <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={50} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </main>
    </div>
  );
};

export default AnalysisPage;