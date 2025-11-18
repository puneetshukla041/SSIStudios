// analysis/page.tsx
'use client';

import { useState, useEffect, useMemo } from 'react';
import { 
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, 
    AreaChart, Area
} from 'recharts';
import { TrendingUp, Users, ClipboardCheck, Clock } from 'lucide-react'; 

// --- 1. Interface Definitions (Unchanged) ---
interface AnalysisData {
    totalCertificates: number;
    byHospital: { hospital: string; count: number }[];
    byTime: { label: string; count: number }[];
    byInitial: { initial: string; count: number }[]; // Keeping interface intact, though chart is removed
}

// --- 2. Light Theme Color Palette (Unchanged) ---
const PRIMARY_ACCENT = '#1e40af'; 
const BACKGROUND_COLOR = '#ffffff'; 
const CARD_BACKGROUND = '#f9fafb';
const TEXT_COLOR = '#1f2937'; 
const GRID_COLOR = '#e5e7eb'; 

const CHART_COLORS = [
    '#3b82f6', // Blue (Primary Area)
    '#10b981', // Emerald (Bar)
    '#f59e0b', // Amber (for Metric Card)
    '#ef4444', // Red (Trend)
    '#8b5cf6', // Violet
    '#ec4899', // Pink
    '#06b6d4', // Cyan
];

// --- 3. Reusable Components & Logic Refinements (Unchanged) ---

interface MetricCardProps {
    title: string;
    value: number | string;
    icon: React.ReactNode;
    color: string;
}

const MetricCard: React.FC<MetricCardProps> = ({ title, value, icon, color }) => (
    <div className="bg-white p-6 rounded-xl shadow-lg border-b-4 border-l-4 transition-shadow duration-300 hover:shadow-xl" 
         style={{ borderColor: color, backgroundColor: CARD_BACKGROUND }}>
        
        <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider">{title}</p>
            <div className="p-3 rounded-lg bg-opacity-10" style={{ backgroundColor: color + '22', color: color }}>
                {icon}
            </div>
        </div>
        
        <p className="text-4xl font-extrabold mt-2" style={{ color: TEXT_COLOR }}>{value}</p>
    </div>
);


// --- 4. Main Component with Subtle Centering and Chart Removal ---

export default function AnalysisPage() {
    const [data, setData] = useState<AnalysisData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Fetch data logic (Unchanged)
    useEffect(() => {
        // ... (fetchData logic as before)
        async function fetchData() {
            try {
                const response = await fetch('/api/analysis');
                if (!response.ok) {
                    throw new Error('Failed to fetch analysis data');
                }
                const result = await response.json();
                if (result.success) {
                    setData(result.data);
                } else {
                    setError(result.message);
                }
            } catch (e: any) {
                setError(e.message);
            } finally {
                setIsLoading(false);
            }
        }
        fetchData();
    }, []);

    // Memoized trend calculation (Unchanged logic)
    const issuanceTrend = useMemo(() => {
        if (!data || data.byTime.length < 2) return { value: 'N/A', color: TEXT_COLOR, icon: <Clock className="w-4 h-4 mr-1" /> };
        
        const lastMonthCount = data.byTime.slice(-1)[0].count;
        const prevMonthCount = data.byTime.slice(-2)[0].count;
        const difference = lastMonthCount - prevMonthCount;
        const percentage = (difference / prevMonthCount) * 100;

        let value, color, icon;

        if (difference > 0) {
            value = `+${percentage.toFixed(1)}%`;
            color = CHART_COLORS[1]; // Green
            icon = <TrendingUp className="w-4 h-4 mr-1" />;
        } else if (difference < 0) {
            value = `${percentage.toFixed(1)}%`;
            color = CHART_COLORS[3]; // Red
            icon = <TrendingUp className="w-4 h-4 mr-1 transform rotate-180" />; // Down arrow
        } else {
            value = '0.0%';
            color = TEXT_COLOR;
            icon = <Clock className="w-4 h-4 mr-1" />; // Neutral icon
        }
        return { value, color, icon };
    }, [data]);

    if (isLoading) return <div className="p-16 text-center text-xl text-blue-600 bg-white min-h-screen">Loading Analytics...</div>;
    if (error) return <div className="p-16 text-red-600 text-center text-xl bg-white min-h-screen">Error: {error}</div>;
    if (!data) return <div className="p-16 text-center text-xl text-gray-500 bg-white min-h-screen">No data available for analysis.</div>;

    // Recharts styling props for light theme
    const chartProps = {
        stroke: GRID_COLOR, 
        tick: { fill: TEXT_COLOR, fontSize: 12 },
    };

    return (
        // Adjusted main container for full vertical padding and standard responsive horizontal padding
        <div className="py-4 md:py-10 min-h-screen px-4" style={{ backgroundColor: CARD_BACKGROUND }}>
            
            {/* --- Main Subtly Centered Container --- */}
            {/* max-w-screen-2xl is wider than 7xl, providing subtle centering */}
            <div className="max-w-screen-2xl mx-auto"> 
                
                <header className="mb-10 border-b border-gray-200 pb-4">
                    <h1 className="text-3xl md:text-4xl font-extrabold flex items-center" style={{ color: PRIMARY_ACCENT }}>
                        <TrendingUp className="w-6 h-6 md:w-8 md:h-8 mr-3" />
                        Certificate Issuance Dashboard
                    </h1>
                    <p className="text-sm md:text-lg text-gray-600 mt-2">Key performance indicators and detailed issuance trends.</p>
                </header>
                
                {/* --- 1. Metric Cards Section --- */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-10">
                    <MetricCard 
                        title="Total Certificates" 
                        value={data.totalCertificates.toLocaleString()} 
                        icon={<ClipboardCheck />}
                        color={CHART_COLORS[0]}
                    />
                    <MetricCard 
                        title="Unique Hospitals" 
                        value={data.byHospital.length} 
                        icon={<Users />}
                        color={CHART_COLORS[1]}
                    />
                    <MetricCard 
                        title="Data Points (Months)" 
                        value={data.byTime.length} 
                        icon={<Clock />}
                        color={CHART_COLORS[2]}
                    />
                    
                    {/* Trend Card: Using trend logic for visual feedback */}
                    <div className="bg-white p-6 rounded-xl shadow-lg border-b-4 border-l-4 transition-shadow duration-300 hover:shadow-xl" 
                        style={{ borderColor: issuanceTrend.color, backgroundColor: CARD_BACKGROUND }}>
                        
                        <div className="flex items-center justify-between">
                            <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider">MoM Trend</p>
                            <div className="p-3 rounded-lg bg-opacity-10" style={{ backgroundColor: issuanceTrend.color + '22', color: issuanceTrend.color }}>
                                {issuanceTrend.icon}
                            </div>
                        </div>
                        
                        <p className="text-4xl font-extrabold mt-2" style={{ color: issuanceTrend.color }}>{issuanceTrend.value}</p>
                        
                        <div className="mt-2 text-sm font-medium text-gray-400">
                            {issuanceTrend.value === 'N/A' ? 'Not enough data' : 'vs. Previous Month'}
                        </div>
                    </div>
                </div>

                {/* --- 2. Chart Section with Fixed Heights (Adjusted to 2 columns) --- */}
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 md:gap-8">
                    
                    {/* Chart 2: Issuance Trend Over Time (Area Chart) - Occupies one column/full width on mobile */}
                    <div className="bg-white p-6 rounded-xl shadow-2xl border border-gray-200 xl:col-span-1">
                        <h2 className="text-lg md:text-2xl font-semibold mb-6" style={{ color: TEXT_COLOR }}>Issuance Volume Trend (Monthly)</h2>
                        <div style={{ width: '100%', height: '350px' }}> 
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={data.byTime} margin={{ top: 10, right: 10, left: 0, bottom: 5 }}>
                                    <defs>
                                        <linearGradient id="colorCountLight" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor={CHART_COLORS[0]} stopOpacity={0.5}/>
                                            <stop offset="95%" stopColor={CHART_COLORS[0]} stopOpacity={0.05}/>
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke={chartProps.stroke} vertical={false} />
                                    <XAxis 
                                        dataKey="label" 
                                        angle={-30} 
                                        textAnchor="end" 
                                        height={70} 
                                        stroke={TEXT_COLOR} 
                                        interval="preserveStartEnd"
                                        tick={chartProps.tick}
                                    />
                                    <YAxis stroke={TEXT_COLOR} tick={chartProps.tick} />
                                    <Tooltip 
                                        contentStyle={{ backgroundColor: BACKGROUND_COLOR, border: `1px solid ${CHART_COLORS[0]}`, color: TEXT_COLOR, borderRadius: '6px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} 
                                        labelStyle={{ fontWeight: 'bold', color: CHART_COLORS[0] }}
                                    />
                                    <Area type="monotone" dataKey="count" stroke={CHART_COLORS[0]} fillOpacity={1} fill="url(#colorCountLight)" strokeWidth={3} name="Count" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                    
                    {/* Chart 1: Certificates by Hospital (Top N) - Occupies one column/full width on mobile */}
                    <div className="bg-white p-6 rounded-xl shadow-xl border border-gray-200 xl:col-span-1">
                        <h2 className="text-lg md:text-2xl font-semibold mb-6" style={{ color: TEXT_COLOR }}>Top Issuing Hospitals (Count)</h2>
                        <div style={{ width: '100%', height: '350px' }}> 
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={data.byHospital} layout="vertical" margin={{ top: 10, right: 30, left: 5, bottom: 5 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke={chartProps.stroke} />
                                    <XAxis type="number" stroke={TEXT_COLOR} tick={chartProps.tick} />
                                    <YAxis dataKey="hospital" type="category" width={120} stroke={TEXT_COLOR} tick={chartProps.tick} style={{ fontSize: '10px' }} /> 
                                    <Tooltip 
                                        contentStyle={{ backgroundColor: BACKGROUND_COLOR, border: `1px solid ${CHART_COLORS[1]}`, color: TEXT_COLOR, borderRadius: '6px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} 
                                        labelStyle={{ fontWeight: 'bold', color: CHART_COLORS[1] }}
                                    />
                                    <Bar dataKey="count" fill={CHART_COLORS[1]} name="Certificates Issued" radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>
                
            </div>
            
        </div>
    );
}