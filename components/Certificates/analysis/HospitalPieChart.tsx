// D:\ssistudios\ssistudios\components\Certificates\analysis\HospitalPieChart.tsx

import React, { useMemo } from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Hospital, LayoutDashboard } from 'lucide-react';
import { getHospitalColor } from '../utils/helpers';
import { ICertificateClient } from '../utils/constants';

// Define the structure for the chart data
interface HospitalData {
    name: string;
    value: number;
    colorClass: string;
    [key: string]: any;
}

interface HospitalPieChartProps {
    uniqueHospitals: string[]; // List of all unique hospitals from the API response's filter data
    totalRecords: number; // Total count across ALL filters/pages
    certificates: ICertificateClient[]; // Current page/view data (used for counting)
}

// FIX: CustomTooltip now accepts 'chartTotal' as a prop
const CustomTooltip = ({ active, payload, chartTotal }: any) => {
    if (active && payload && payload.length && chartTotal > 0) {
        const data = payload[0].payload;
        
        // FIX: The calculation now uses the correct total count of all slices in the chart.
        const percentage = ((payload[0].value / chartTotal) * 100).toFixed(1);

        return (
            <div className="p-3 bg-white/90 backdrop-blur-sm border border-gray-200 rounded-lg shadow-xl text-sm font-semibold text-gray-800">
                <p className="font-bold text-sky-600">{data.name}</p>
                <p className="mt-1">Count: <span className="text-gray-900">{payload[0].value}</span></p>
                <p>Percentage: <span className="text-gray-900">{percentage}%</span></p>
            </div>
        );
    }
    return null;
};

const getColorHex = (tailwindClass: string): string => {
    // Crude way to map Tailwind text color classes to a hex value for Recharts
    if (tailwindClass.includes('sky')) return '#0ea5e9';
    if (tailwindClass.includes('emerald')) return '#10b981';
    if (tailwindClass.includes('indigo')) return '#4f46e5';
    if (tailwindClass.includes('amber')) return '#f59e0b';
    if (tailwindClass.includes('fuchsia')) return '#e879f9';
    if (tailwindClass.includes('rose')) return '#f43f5e';
    if (tailwindClass.includes('cyan')) return '#06b6d4';
    if (tailwindClass.includes('orange')) return '#f97316';
    return '#6b7280';
};


const HospitalPieChart: React.FC<HospitalPieChartProps> = ({ uniqueHospitals, totalRecords, certificates }) => {

    // 1. Count certificates by hospital based ONLY on the currently displayed 'certificates' prop
    const hospitalCounts = useMemo(() => {
        const counts: { [key: string]: number } = {};
        certificates.forEach(cert => {
            counts[cert.hospital] = (counts[cert.hospital] || 0) + 1;
        });
        return counts;
    }, [certificates]);

    // 2. Map the counts to the chart data structure, using the unique list for keys
    const pieData: HospitalData[] = useMemo(() => {
        return uniqueHospitals
            .map(hospital => ({
                name: hospital,
                value: hospitalCounts[hospital] || 0, // Gets count from live data
                colorClass: getHospitalColor(hospital),
            }))
            .filter(data => data.value > 0);
    }, [uniqueHospitals, hospitalCounts]);

    const chartTotal = pieData.reduce((sum, item) => sum + item.value, 0);

    return (
        <div className="p-4 sm:p-6 bg-white/70 rounded-2xl border border-gray-300 backdrop-blur-sm shadow-2xl shadow-sky-400/10 transition-all duration-500 ease-in-out">
            <h3 className="text-xl font-extrabold text-sky-700 mb-5 flex items-center border-b pb-2 border-sky-300/40">
                <LayoutDashboard className="w-5 h-5 mr-2 text-sky-600" /> Hospital Distribution Analysis
            </h3>

            {pieData.length > 0 ? (
                // Use a column layout by default, then switch to row on large screens
                <div className="flex flex-col lg:flex-row items-start justify-between">
                    {/* The chart container width is full on small screens, and 3/5 on large screens */}
                    <div className="w-full lg:w-3/5 h-72 md:h-80">
                        <ResponsiveContainer width="100%" height="100%">
                            {/* Adjusted margins to provide better clearance for the chart */}
                            <PieChart margin={{ top: 10, right: 10, bottom: 10, left: 10 }}>
                                <Pie
                                    data={pieData}
                                    dataKey="value"
                                    nameKey="name"
                                    cx="50%"
                                    cy="50%"
                                    // Reduced outerRadius to 100 for better fit within vertical/horizontal legend configurations
                                    outerRadius={100}
                                    fill="#8884d8"
                                    labelLine={false}
                                    animationBegin={300}
                                    animationDuration={1500}
                                >
                                    {pieData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={getColorHex(entry.colorClass)} />
                                    ))}
                                </Pie>
                                {/* FIX: Pass the chartTotal to the CustomTooltip */}
                                <Tooltip content={<CustomTooltip chartTotal={chartTotal} />} />
                                {/* Legend for responsiveness: 
                                1. Horizontal/Bottom for all sizes to save horizontal space.
                                2. Removed fixed padding style. */}
                                <Legend
                                    layout="horizontal"
                                    verticalAlign="bottom"
                                    align="center"
                                    iconType="circle"
                                    wrapperStyle={{ paddingTop: '10px' }}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>

                    {/* Summary box now serves as a detailed list/legend. 
                    Added items-start to the parent container's class to better align the summary on large screens. */}
                    <div className="w-full lg:w-2/5 mt-4 lg:mt-0 lg:ml-6 p-4 bg-sky-50 rounded-xl border border-sky-200 shadow-inner">
                        <p className="text-xl font-bold text-gray-700 mb-2 border-b pb-1">Summary</p>
                        <p className="text-sm text-gray-600 flex justify-between">
                            Total Records (in View): <span className="font-bold text-indigo-600">{chartTotal}</span>
                        </p>
                        <p className="text-sm text-gray-600 flex justify-between mt-1">
                            Unique Hospitals (in View): <span className="font-bold text-indigo-600">{pieData.length}</span>
                        </p>
                        <ul className="mt-4 space-y-2 max-h-40 overflow-y-auto pr-2">
                            {pieData.map((data, index) => (
                                <li key={index} className="flex justify-between items-center text-sm">
                                    <span className={`flex items-center font-medium ${data.colorClass.includes('text-') ? data.colorClass.split(' ')[1] : 'text-gray-700'}`}>
                                        <span className="w-2 h-2 rounded-full mr-2" style={{ backgroundColor: getColorHex(data.colorClass) }}></span>
                                        {data.name}
                                    </span>
                                    <span className="font-bold text-gray-900">{data.value} ({((data.value / chartTotal) * 100).toFixed(1)}%)</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            ) : (
                <div className="text-center p-8 text-gray-500">
                    <Hospital className="w-10 h-10 mx-auto text-sky-400 mb-3" />
                    <p>No hospital data available to display the chart.</p>
                </div>
            )}
        </div>
    );
};

export default HospitalPieChart;