// D:\ssistudios\ssistudios\components\TrainingDashboard.tsx (Renamed for clarity)
'use client';

import { motion } from "framer-motion";
import React, { useState, useMemo, useCallback } from "react";
import { Loader2 } from 'lucide-react'; // Assuming lucide-react is the source for Loader2

// --- Assuming Icon/Modal components are exported from a utilities file ---

// Card Component (Defined in snippet)
interface CardProps {
    icon: React.ReactNode;
    title: string;
    value: number;
    description: string;
    delay?: number;
}
export const Card = ({ icon, title, value, description, delay = 0 }: CardProps) => { /* ... Card Implementation ... */ return (<motion.div initial={{ opacity: 0, y: 30, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} whileHover={{ scale: 1.05, rotate: 0.5 }} transition={{ duration: 0.6, delay, ease: "easeOut" }} className="relative p-6 rounded-3xl bg-gradient-to-br from-white/70 to-white/30 backdrop-blur-xl shadow-lg border border-white/20 flex flex-col justify-between overflow-hidden group">
    <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-blue-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition duration-500"></div>
    <div className="flex items-center mb-4 relative z-10">
        <div className="p-3 bg-gradient-to-tr from-blue-100 to-purple-100 rounded-2xl text-blue-600 shadow-inner"> {icon} </div>
        <div className="ml-4">
            <p className="text-sm font-medium text-gray-600">{title}</p>
            <motion.p className="text-3xl font-extrabold text-gray-900 tracking-tight" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: delay + 0.3 }} > {value.toLocaleString()} </motion.p>
        </div>
    </div>
    <p className="text-sm text-gray-600 mt-2 relative z-10">{description}</p>
</motion.div>)};

// SVG Icon Components (Re-exported from snippet)
export const IconSort = (props: React.SVGProps<SVGSVGElement>) => (/* ... SVG ... */ <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M7 4h10" /><path d="M10 12l4-4l-4-4" /><path d="M17 20h-10" /><path d="M14 12l-4 4l4 4" /></svg>);
export const IconSortUp = (props: React.SVGProps<SVGSVGElement>) => (/* ... SVG ... */ <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M12 5v14" /><path d="M19 12l-7-7-7 7" /></svg>);
export const IconSortDown = (props: React.SVGProps<SVGSVGElement>) => (/* ... SVG ... */ <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M12 5v14" /><path d="M5 12l7 7l7-7" /></svg>);
export const IconUsers = (props: React.SVGProps<SVGSVGElement>) => (/* ... SVG ... */ <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>);
export const IconCheckCircle = (props: React.SVGProps<SVGSVGElement>) => (/* ... SVG ... */ <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M22 11.08V12a10 10 0 1 1-5.93-8.62" /><path d="M22 4L12 14.01l-3-3" /></svg>);
export const IconChartLine = (props: React.SVGProps<SVGSVGElement>) => (/* ... SVG ... */ <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M3 3v18h18" /><path d="M18 17l-9-9l-5 5" /><path d="M14 7l4-4l4 4" /></svg>);
export const IconSpinner = (props: React.SVGProps<SVGSVGElement>) => (/* ... SVG ... */ <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M12 2v4" /><path d="M12 18v4" /><path d="M4.93 4.93l2.83 2.83" /><path d="M16.24 16.24l2.83 2.83" /><path d="M2 12h4" /><path d="M18 12h4" /><path d="M4.93 19.07l2.83-2.83" /><path d="M16.24 7.76l2.83-2.83" /></svg>);
export const IconDownload = (props: React.SVGProps<SVGSVGElement>) => (/* ... SVG ... */ <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" /></svg>);
export const IconFilter = (props: React.SVGProps<SVGSVGElement>) => (/* ... SVG ... */ <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" /></svg>);


// --- MOCK DATA and LOGIC ---

interface TrainingRegistration {
    id: string;
    name: string;
    status: 'upcoming' | 'pending' | 'completed';
    registrationDate: Date;
}

const MOCK_REGISTRATIONS: TrainingRegistration[] = [
    { id: 'R001', name: 'Alice', status: 'completed', registrationDate: new Date('2024-10-20') },
    { id: 'R002', name: 'Bob', status: 'upcoming', registrationDate: new Date('2024-11-01') },
    { id: 'R003', name: 'Charlie', status: 'pending', registrationDate: new Date('2024-11-10') },
    { id: 'R004', name: 'David', status: 'completed', registrationDate: new Date('2024-09-05') },
    { id: 'R005', name: 'Eve', status: 'completed', registrationDate: new Date('2024-11-13') },
    // Add more mock data for realistic metrics/graphs
    { id: 'R006', name: 'Frank', status: 'completed', registrationDate: new Date('2024-10-25') },
    { id: 'R007', name: 'Grace', status: 'upcoming', registrationDate: new Date('2024-11-14') },
];

type FilterStatus = 'all' | 'upcoming' | 'pending' | 'completed';
type DatePreset = 'all' | 'today' | 'last7days' | 'last30days';

const calculateMetrics = (data: TrainingRegistration[]) => {
    return {
        totalRegistrationsCount: data.length,
        upcomingRegistrationsCount: data.filter(r => r.status === 'upcoming').length,
        pendingRegistrationsCount: data.filter(r => r.status === 'pending').length,
        completedRegistrationsCount: data.filter(r => r.status === 'completed').length,
    };
};

// --- DATA VISUALIZATION COMPONENT (Placeholder for Charts) ---

interface VisualizationProps {
    metrics: ReturnType<typeof calculateMetrics>;
    registrations: TrainingRegistration[];
}

const DataVisualizations: React.FC<VisualizationProps> = ({ metrics }) => {
    // Data processed for a Pie chart (Status breakdown)
    const statusData = [
        { name: 'Upcoming', value: metrics.upcomingRegistrationsCount, color: 'text-yellow-500' },
        { name: 'Pending', value: metrics.pendingRegistrationsCount, color: 'text-red-500' },
        { name: 'Completed', value: metrics.completedRegistrationsCount, color: 'text-green-500' },
    ];

    return (
        <section className="bg-white p-6 rounded-2xl shadow-xl ring-1 ring-gray-200">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Data Visualization Dashboard 📈</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                
                {/* Graph 1: Status Distribution (Pie Chart Placeholder) */}
                <div className="p-4 border border-gray-200 rounded-xl h-72 flex flex-col items-center justify-center bg-gray-50">
                    <h3 className="text-lg font-semibold text-gray-700 mb-4">Registration Status Breakdown</h3>
                    <ul className="text-sm font-medium">
                        {statusData.map(d => (
                            <li key={d.name} className={`flex items-center ${d.color}`}>
                                <span className="text-2xl mr-2">•</span> {d.name}: **{d.value}**
                            </li>
                        ))}
                    </ul>
                    <p className="text-blue-500 mt-4">[Placeholder for Pie/Bar Chart]</p>
                </div>
                
                {/* Graph 2: Registrations Over Time (Line Chart Placeholder) */}
                <div className="p-4 border border-gray-200 rounded-xl h-72 flex items-center justify-center bg-gray-50">
                    <p className="text-gray-500 font-medium">Graph Placeholder: Registrations Trend (Line Chart)</p>
                </div>
            </div>
        </section>
    );
};


// --- MAIN TRAINING DASHBOARD COMPONENT ---

const TrainingDashboard: React.FC = () => {
    // States for the Table/Filters section
    const [search, setSearch] = useState('');
    const [filterStatus, setFilterStatus] = useState<FilterStatus>('all');
    const [dateRangePreset, setDateRangePreset] = useState<DatePreset>('all');
    const [currentPage, setCurrentPage] = useState(1);
    const [isUpdating, setIsUpdating] = useState(false); 
    
    // --- Data Hooks ---
    const filteredRegistrations = useMemo(() => {
        // Mock filtering logic for the table display
        return MOCK_REGISTRATIONS; 
    }, [search, filterStatus, dateRangePreset]);

    const metrics = useMemo(() => calculateMetrics(MOCK_REGISTRATIONS), []);
    
    const handleDatePreset = useCallback((preset: DatePreset) => {
        setDateRangePreset(preset);
        setCurrentPage(1);
        setIsUpdating(true);
        setTimeout(() => setIsUpdating(false), 500);
    }, []);

    const handleExport = () => {
        alert('Exporting filtered registration data to Excel...');
    };


    return (
        <div className="min-h-screen bg-gray-50 p-4 md:p-8">
            <main className="max-w-7xl mx-auto space-y-8">
                <h1 className="text-3xl font-extrabold text-gray-900 border-b pb-2">Training Management Dashboard 📊</h1>
                
                {/* 1. Key Metrics Section (ALL DATA CARD) */}
                <section>
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">Key Training Metrics</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        <Card
                            icon={<IconUsers className="h-7 w-7" />}
                            title="Total Registrations"
                            value={metrics.totalRegistrationsCount}
                            description="All-time count of registered users."
                            delay={0}
                        />
                        <Card
                            icon={<IconChartLine className="h-7 w-7" />}
                            title="Upcoming Trainings"
                            value={metrics.upcomingRegistrationsCount}
                            description="Trainings scheduled for the future."
                            delay={0.1}
                        />
                        <Card
                            icon={<IconSpinner className="h-7 w-7" />}
                            title="Pending Trainings"
                            value={metrics.pendingRegistrationsCount}
                            description="Trainings awaiting review or action."
                            delay={0.2}
                        />
                        <Card
                            icon={<IconCheckCircle className="h-7 w-7" />}
                            title="Completed Trainings"
                            value={metrics.completedRegistrationsCount}
                            description="Trainings that have been successfully finalized."
                            delay={0.3}
                        />
                    </div>
                </section>
                
                <hr className="border-gray-200" />
                
                {/* 2. Data Visualization Section (GRAPHS CARD) */}
                <DataVisualizations metrics={metrics} registrations={MOCK_REGISTRATIONS} />

                <hr className="border-gray-200" />

                {/* 3. Registration Data Table Section (Table & Filters) */}
                <section className="bg-white p-6 rounded-2xl shadow-xl ring-1 ring-gray-200 relative">
                    {isUpdating && (
                        <div className="absolute inset-0 bg-white bg-opacity-80 backdrop-blur-sm flex items-center justify-center z-50 rounded-2xl">
                            <motion.div
                                animate={{ rotate: 360 }}
                                transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
                                className="text-blue-600"
                            >
                                <Loader2 className="h-10 w-10" />
                            </motion.div>
                        </div>
                    )}
                    
                    <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6">
                        <h2 className="text-2xl font-bold text-gray-900 mb-4 md:mb-0">Training Registration Database</h2>
                        <button
                            onClick={handleExport}
                            className="flex items-center px-4 py-2 text-sm font-semibold rounded-full bg-teal-600/90 text-white hover:bg-teal-700 transition duration-300 shadow-lg"
                        >
                            <IconDownload className="w-4 h-4 mr-2" /> Export Excel
                        </button>
                    </div>
                    
                    {/* Inline Filters and Search */}
                    <div className="mb-6 flex flex-wrap items-center justify-start gap-4">
                        <div className="relative w-full sm:w-64">
                            <input
                                type="text"
                                placeholder="Search by name, email, or profession..."
                                value={search}
                                onChange={(e) => {
                                    setSearch(e.target.value);
                                    setCurrentPage(1);
                                }}
                                className="w-full pl-12 pr-4 py-2 border border-gray-300 rounded-xl bg-white text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all duration-200"
                            />
                            <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400">
                                <IconFilter className="h-4 w-4 fill-current" /> 
                            </div>
                        </div>
                        
                        <div className="flex flex-wrap items-center gap-2">
                            <span className="text-sm font-medium text-gray-700">Filter Status:</span>
                            {(['all', 'upcoming', 'pending', 'completed'] as const).map((status) => (
                                <button
                                    key={status}
                                    onClick={() => setFilterStatus(status)}
                                    className={`py-2 px-4 rounded-full text-xs font-semibold transition-colors cursor-pointer ${filterStatus === status ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-800 hover:bg-gray-200'}`}
                                >
                                    {status.charAt(0).toUpperCase() + status.slice(1)}
                                </button>
                            ))}
                        </div>
                        
                        <div className="flex flex-wrap items-center gap-2">
                            <span className="text-sm font-medium text-gray-700">Filter Date:</span>
                            {(['all', 'today', 'last7days', 'last30days'] as const).map((preset) => (
                                <button
                                    key={preset}
                                    onClick={() => handleDatePreset(preset)}
                                    className={`py-2 px-4 rounded-full text-xs font-medium transition-colors cursor-pointer ${dateRangePreset === preset ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-800 hover:bg-gray-200'}`}
                                >
                                    {preset === 'all' ? 'All Time' : preset === 'today' ? 'Today' : preset === 'last7days' ? 'Last 7 Days' : 'Last 30 Days'}
                                </button>
                            ))}
                        </div>
                    </div>
                    
                    {/* Placeholder for the actual table content */}
                    <div className="p-8 border-2 border-dashed border-gray-300 rounded-xl h-96 flex items-center justify-center">
                        <p className="text-gray-500">Registration Data Table Displaying {filteredRegistrations.length} Records</p>
                    </div>
                </section>
            </main>
        </div>
    );
};

export default TrainingDashboard;