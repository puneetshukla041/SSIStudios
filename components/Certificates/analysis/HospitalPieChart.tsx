import React, { useMemo } from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import { PieChart as PieChartIcon, Activity } from 'lucide-react';
import { ICertificateClient } from '../utils/constants';
import clsx from 'clsx';

// --- Types ---
interface HospitalData {
    name: string;
    value: number;
    color: string;
    // 💡 FIX: Added index signature to satisfy Recharts type requirements
    [key: string]: any;
}

interface HospitalPieChartProps {
    uniqueHospitals: string[];
    totalRecords: number;
    certificates: ICertificateClient[];
}

// --- Constants ---
// A professional, balanced palette for data visualization
const CHART_COLORS = [
    '#6366f1', // Indigo 500
    '#10b981', // Emerald 500
    '#f59e0b', // Amber 500
    '#f43f5e', // Rose 500
    '#06b6d4', // Cyan 500
    '#8b5cf6', // Violet 500
    '#ec4899', // Pink 500
    '#84cc16', // Lime 500
];

// --- Custom Components ---

const CustomTooltip = ({ active, payload, chartTotal }: any) => {
    if (active && payload && payload.length && chartTotal > 0) {
        const data = payload[0].payload;
        const percentage = ((payload[0].value / chartTotal) * 100).toFixed(1);

        return (
            <div className="bg-slate-900/95 backdrop-blur-md border border-slate-700/50 p-3 rounded-xl shadow-2xl text-xs">
                <div className="flex items-center gap-2 mb-1">
                    <div 
                        className="w-2 h-2 rounded-full" 
                        style={{ backgroundColor: data.color }}
                    />
                    <span className="font-semibold text-slate-200">{data.name}</span>
                </div>
                <div className="flex items-center justify-between gap-4 text-slate-400">
                    <span>Records: <b className="text-white">{data.value}</b></span>
                    <span>Share: <b className="text-white">{percentage}%</b></span>
                </div>
            </div>
        );
    }
    return null;
};

const EmptyState = () => (
    <div className="flex flex-col items-center justify-center h-full py-10 text-slate-400">
        <div className="w-24 h-24 rounded-full border-4 border-slate-100 border-dashed flex items-center justify-center mb-3">
            <PieChartIcon className="w-8 h-8 opacity-50" />
        </div>
        <p className="text-sm font-medium">No data to display</p>
    </div>
);

const HospitalPieChart: React.FC<HospitalPieChartProps> = ({ uniqueHospitals, certificates }) => {

    // 1. Calculate Data
    const { pieData, chartTotal } = useMemo(() => {
        // Count certificates per hospital
        const counts: { [key: string]: number } = {};
        certificates.forEach(cert => {
            counts[cert.hospital] = (counts[cert.hospital] || 0) + 1;
        });

        // Map to chart format
        const data: HospitalData[] = uniqueHospitals
            .map((hospital, index) => ({
                name: hospital,
                value: counts[hospital] || 0,
                // Assign color cyclically based on index
                color: CHART_COLORS[index % CHART_COLORS.length],
            }))
            .filter(data => data.value > 0)
            .sort((a, b) => b.value - a.value); // Sort descending for better visual flow

        const total = data.reduce((sum, item) => sum + item.value, 0);

        return { pieData: data, chartTotal: total };
    }, [uniqueHospitals, certificates]);

    return (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col h-full animate-in fade-in duration-700">
            
            {/* Header */}
            <div className="px-6 py-5 border-b border-slate-100 bg-gradient-to-r from-slate-50/50 to-white flex items-center justify-between">
                <div>
                    <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
                        <Activity className="w-4 h-4 text-indigo-500" />
                        Distribution Analysis
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                        Breakdown of certificates issued by institution.
                    </p>
                </div>
            </div>

            {/* Content */}
            <div className="p-6 flex-1">
                {pieData.length > 0 ? (
                    <div className="flex flex-col md:flex-row items-center gap-8">
                        
                        {/* CHART SECTION (Donut) */}
                        <div className="relative w-full md:w-1/2 h-64 flex-shrink-0">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={pieData}
                                        dataKey="value"
                                        nameKey="name"
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={85}
                                        paddingAngle={4}
                                        cornerRadius={4}
                                        stroke="none"
                                    >
                                        {pieData.map((entry, index) => (
                                            <Cell 
                                                key={`cell-${index}`} 
                                                fill={entry.color} 
                                                className="outline-none focus:outline-none hover:opacity-80 transition-opacity cursor-pointer"
                                            />
                                        ))}
                                    </Pie>
                                    <Tooltip 
                                        content={<CustomTooltip chartTotal={chartTotal} />} 
                                        cursor={{ fill: 'transparent' }}
                                    />
                                </PieChart>
                            </ResponsiveContainer>
                            
                            {/* Central Label for Donut */}
                            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                                <span className="text-3xl font-bold text-slate-800 tracking-tight">
                                    {chartTotal}
                                </span>
                                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                                    Total
                                </span>
                            </div>
                        </div>

                        {/* LEGEND / STATS SECTION */}
                        <div className="w-full md:w-1/2 flex flex-col gap-4 max-h-72 overflow-y-auto custom-scrollbar pr-2">
                            {pieData.map((item, index) => {
                                const percent = ((item.value / chartTotal) * 100).toFixed(1);
                                return (
                                    <div key={item.name} className="group flex flex-col gap-1.5">
                                        <div className="flex items-center justify-between text-sm">
                                            <div className="flex items-center gap-2">
                                                <span 
                                                    className="w-2.5 h-2.5 rounded-full shadow-sm"
                                                    style={{ backgroundColor: item.color }} 
                                                />
                                                <span className="font-medium text-slate-700 truncate max-w-[140px]" title={item.name}>
                                                    {item.name}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <span className="font-semibold text-slate-900">{item.value}</span>
                                                <span className="text-xs text-slate-400 w-10 text-right">{percent}%</span>
                                            </div>
                                        </div>
                                        
                                        {/* Visual Progress Bar */}
                                        <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                                            <div 
                                                className="h-full rounded-full transition-all duration-1000 ease-out"
                                                style={{ 
                                                    width: `${percent}%`, 
                                                    backgroundColor: item.color,
                                                    opacity: 0.8
                                                }} 
                                            />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                ) : (
                    <EmptyState />
                )}
            </div>
        </div>
    );
};

export default HospitalPieChart;