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
  Building2, 
  Calendar, 
  Users, 
  RefreshCcw, 
  AlertCircle,
  FileText,
  TrendingUp,
  BarChart3,
  PieChart
} from 'lucide-react';

// --- COMPONENTS ---

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white/95 backdrop-blur-sm p-3 border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.12)] rounded-xl min-w-[150px]">
        <p className="text-xs font-medium text-gray-400 mb-1 uppercase tracking-wider">{label}</p>
        <div className="flex items-center gap-2">
            <span className="w-2 h-8 rounded-full bg-indigo-500" />
            <div>
              <p className="text-sm text-gray-500 font-medium">Count</p>
              <p className="text-xl font-bold text-gray-900">{payload[0].value.toLocaleString()}</p>
            </div>
        </div>
      </div>
    );
  }
  return null;
};

const SkeletonCard = ({ className }: { className?: string }) => (
  <div className={`bg-gray-50 rounded-2xl animate-pulse ${className}`}>
    <div className="h-full w-full bg-gray-200/50 rounded-2xl" />
  </div>
);

const DashboardSkeleton = () => (
  <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8 min-h-screen bg-white">
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <SkeletonCard className="h-40" />
      <SkeletonCard className="h-40" />
      <SkeletonCard className="h-40" />
    </div>
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <SkeletonCard className="h-96 lg:col-span-2" />
      <SkeletonCard className="h-96" />
    </div>
    <SkeletonCard className="h-96" />
  </div>
);

// --- MAIN PAGE ---

const AnalysisPage = () => {
  const [data, setData] = useState<any>(null); 
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/analysis');
      if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
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
      setTimeout(() => setLoading(false), 500);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const kpiData = useMemo(() => {
    if (!data) return null;

    const topHospital = data.byHospital && data.byHospital.length > 0 
      ? data.byHospital[0] 
      : { hospital: 'N/A', count: 0 };
    
    const peakMonth = data.byTime && data.byTime.length > 0
      ? data.byTime.reduce((max: any, current: any) => (current.count > max.count) ? current : max, { count: 0, label: 'N/A' })
      : { count: 0, label: 'N/A' };

    return { topHospital, peakMonth };
  }, [data]);

  const COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#f43f5e', '#f59e0b', '#10b981', '#06b6d4', '#3b82f6'];

  if (loading) return <DashboardSkeleton />;

  if (error) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center p-4">
        <div className="bg-red-50 p-8 rounded-2xl max-w-md w-full text-center border border-red-100 shadow-lg">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-red-500" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Analysis Unavailable</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button 
            onClick={fetchData}
            className="bg-red-600 text-white px-6 py-2.5 rounded-xl font-medium hover:bg-red-700 transition-all shadow-md hover:shadow-lg active:scale-95"
          >
            Retry Connection
          </button>
        </div>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="min-h-screen bg-gray-50/50 text-gray-800 font-sans selection:bg-indigo-100 pb-12">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-20 shadow-sm backdrop-blur-md bg-white/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex items-center space-x-3">
            
            {/* --- LOGO SECTION START --- */}
            <div className="w-12 h-12 relative flex items-center justify-center">
              <img 
                src="/logos/ssilogo.png" 
                alt="SSI Logo" 
                className="w-full h-full object-contain"
              />
            </div>
            {/* --- LOGO SECTION END --- */}

            <div>
              <h1 className="text-xl font-bold text-gray-900 tracking-tight">Analytics Dashboard</h1>
              <p className="text-xs font-medium text-gray-500 flex items-center mt-0.5">
                <span className="w-2 h-2 rounded-full bg-green-500 mr-2 animate-pulse"></span>
                System Operational
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <div className="hidden sm:flex flex-col items-end mr-2">
              <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Last Sync</span>
              <span className="text-xs font-medium text-gray-700 font-mono">
                {lastUpdated?.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
            <button 
              onClick={fetchData}
              className="p-2.5 text-gray-500 bg-white border border-gray-200 hover:border-indigo-300 hover:text-indigo-600 rounded-xl transition-all shadow-sm hover:shadow active:scale-95"
              title="Refresh Data"
            >
              <RefreshCcw className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-6">
        
        {/* KPI Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Total Card */}
          <div className="group bg-white rounded-2xl p-6 border border-gray-100 shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] hover:shadow-xl transition-all duration-300 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-full blur-3xl -mr-16 -mt-16 transition-opacity opacity-50 group-hover:opacity-100"></div>
            <div className="relative">
              <div className="flex justify-between items-start mb-6">
                <div className="p-3 bg-blue-50/80 rounded-xl border border-blue-100">
                  <FileText className="w-6 h-6 text-blue-600" />
                </div>
                <div className="px-2.5 py-1 bg-green-50 rounded-lg border border-green-100 flex items-center">
                  <TrendingUp className="w-3 h-3 text-green-600 mr-1.5" />
                  <span className="text-xs font-bold text-green-700">Total</span>
                </div>
              </div>
              <p className="text-gray-500 text-sm font-medium tracking-wide">Issued Certificates</p>
              <h3 className="text-3xl font-bold text-gray-900 mt-1 tracking-tight">
                {data.totalCertificates?.toLocaleString() || 0}
              </h3>
            </div>
          </div>

          {/* Top Hospital Card */}
          <div className="group bg-white rounded-2xl p-6 border border-gray-100 shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] hover:shadow-xl transition-all duration-300 relative overflow-hidden">
             <div className="absolute top-0 right-0 w-32 h-32 bg-purple-50 rounded-full blur-3xl -mr-16 -mt-16 transition-opacity opacity-50 group-hover:opacity-100"></div>
             <div className="relative">
              <div className="flex justify-between items-start mb-6">
                <div className="p-3 bg-purple-50/80 rounded-xl border border-purple-100">
                  <Building2 className="w-6 h-6 text-purple-600" />
                </div>
              </div>
              <p className="text-gray-500 text-sm font-medium tracking-wide">Top Issuer</p>
              <h3 className="text-xl font-bold text-gray-900 mt-1 truncate pr-2" title={kpiData?.topHospital.hospital}>
                {kpiData?.topHospital.hospital}
              </h3>
              <div className="flex items-center mt-2">
                <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden max-w-[100px]">
                  <div className="h-full bg-purple-500 rounded-full w-3/4"></div>
                </div>
                <p className="text-xs text-gray-400 ml-2 font-medium">
                  {kpiData?.topHospital.count.toLocaleString()} issued
                </p>
              </div>
            </div>
          </div>

          {/* Peak Time Card */}
          <div className="group bg-white rounded-2xl p-6 border border-gray-100 shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] hover:shadow-xl transition-all duration-300 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-amber-50 rounded-full blur-3xl -mr-16 -mt-16 transition-opacity opacity-50 group-hover:opacity-100"></div>
            <div className="relative">
              <div className="flex justify-between items-start mb-6">
                <div className="p-3 bg-amber-50/80 rounded-xl border border-amber-100">
                  <Calendar className="w-6 h-6 text-amber-600" />
                </div>
              </div>
              <p className="text-gray-500 text-sm font-medium tracking-wide">Peak Month</p>
              <h3 className="text-3xl font-bold text-gray-900 mt-1 tracking-tight">
                {kpiData?.peakMonth.label}
              </h3>
               <p className="text-xs text-gray-400 mt-2 font-medium">
                  {kpiData?.peakMonth.count.toLocaleString()} issued in 30 days
                </p>
            </div>
          </div>
        </div>

        {/* Charts Section 1 */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Timeline Chart */}
          <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm p-6 relative overflow-hidden">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-indigo-500" />
                  Issuance Trends
                </h2>
                <p className="text-sm text-gray-500 mt-1">Monthly certificate volume over time</p>
              </div>
            </div>
            
            <div className="h-80 w-full relative z-10">
              {data.byTime && data.byTime.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={data.byTime} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <XAxis 
                      dataKey="label" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 500 }}
                      dy={10}
                      padding={{ left: 10, right: 10 }}
                    />
                    <YAxis 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 500 }}
                      dx={-10}
                    />
                    <CartesianGrid vertical={false} stroke="#f1f5f9" strokeDasharray="4 4" />
                    <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#6366f1', strokeWidth: 1, strokeDasharray: '5 5' }} />
                    <Area 
                      type="monotone" 
                      dataKey="count" 
                      stroke="#6366f1" 
                      strokeWidth={3}
                      fillOpacity={1} 
                      fill="url(#colorCount)" 
                      animationDuration={1500}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-gray-400">
                  <BarChart3 className="w-12 h-12 mb-2 opacity-20" />
                  <p>No timeline data available</p>
                </div>
              )}
            </div>
          </div>

          {/* Demographics Chart */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 relative">
             <div className="mb-8">
              <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <PieChart className="w-5 h-5 text-pink-500" />
                Demographics
              </h2>
              <p className="text-sm text-gray-500 mt-1">Distribution by name initial</p>
            </div>
             <div className="h-80 w-full relative z-10">
               {data.byInitial && data.byInitial.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data.byInitial} layout="vertical" margin={{ top: 0, right: 20, left: 0, bottom: 0 }}>
                    <XAxis type="number" hide />
                    <YAxis 
                      dataKey="initial" 
                      type="category" 
                      axisLine={false} 
                      tickLine={false}
                      tick={{ fill: '#64748b', fontWeight: 700, fontSize: 14 }}
                      width={30}
                    />
                    <Tooltip cursor={{ fill: '#f8fafc' }} content={<CustomTooltip />} />
                    <Bar dataKey="count" barSize={16} radius={[0, 4, 4, 0]} animationDuration={1500}>
                      {data.byInitial?.map((entry: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
               ) : (
                <div className="h-full flex flex-col items-center justify-center text-gray-400">
                   <p>No demographic data</p>
                </div>
               )}
            </div>
          </div>
        </div>

        {/* Top Hospitals Chart */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 relative">
          <div className="mb-8 flex flex-col sm:flex-row justify-between sm:items-end gap-2">
            <div>
              <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <Building2 className="w-5 h-5 text-blue-500" />
                Hospital Leaderboard
              </h2>
              <p className="text-sm text-gray-500 mt-1">Top 10 institutions by volume</p>
            </div>
            <div className="hidden sm:flex items-center text-xs font-medium text-gray-400 bg-gray-50 px-3 py-1 rounded-full">
               <Users className="w-3 h-3 mr-1.5" />
               Live Data
            </div>
          </div>
          <div className="h-80 w-full relative z-10">
            {data.byHospital && data.byHospital.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.byHospital} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis 
                    dataKey="hospital" 
                    axisLine={false} 
                    tickLine={false}
                    tick={{ fill: '#64748b', fontSize: 11, fontWeight: 500 }}
                    interval={0}
                    tickFormatter={(value) => value.length > 15 ? value.substring(0, 15) + '...' : value}
                    dy={12}
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false}
                    tick={{ fill: '#94a3b8', fontSize: 12 }}
                    dx={-10}
                  />
                  <Tooltip cursor={{ fill: '#f8fafc' }} content={<CustomTooltip />} />
                  <Bar dataKey="count" fill="#3b82f6" radius={[6, 6, 0, 0]} barSize={40} animationDuration={1500}>
                    {data.byHospital.map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={index === 0 ? '#4f46e5' : '#3b82f6'} fillOpacity={index === 0 ? 1 : 0.7} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
               <div className="h-full flex flex-col items-center justify-center text-gray-400">
                  <p>No hospital data available</p>
               </div>
            )}
          </div>
        </div>

      </main>
    </div>
  );
};

export default AnalysisPage;