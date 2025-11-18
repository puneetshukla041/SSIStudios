// analysis/page.tsx
'use client';

import { useState, useEffect, useMemo } from 'react';
import { 
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
    AreaChart, Area
} from 'recharts';
import { TrendingUp, ClipboardCheck, Clock, Users, Trophy } from 'lucide-react'; 
// Users is kept for the Top Hospitals chart/list, Trophy is used for the top hospitals icon

// --- 1. Interface Definitions ---
interface AnalysisData {
    totalCertificates: number;
    byHospital: { hospital: string; count: number }[];
    byTime: { label: string; count: number }[];
    byInitial: { initial: string; count: number }[];
}

// --- 2. Color Palette & Styling ---
const PRIMARY_ACCENT = '#1e40af'; // Primary blue
const BACKGROUND_COLOR = '#ffffff'; 
const CARD_BACKGROUND = '#f9fafb';
const TEXT_COLOR = '#1f2937'; // Dark text
const GRID_COLOR = '#e5e7eb'; // Light grey grid

const CHART_COLORS = [
    '#3b82f6', // Blue (Primary Area)
    '#10b981', // Emerald (Bar/Card - Positive Trend)
    '#f59e0b', // Amber (Card - Secondary Metric)
    '#ef4444', // Red (Trend - Negative Trend)
    '#8b5cf6', // Violet (Certificates by Initial)
];

// --- 3. Custom Date Formatter Function (Kept as is) ---
/**
 * Converts a string date label from "YYYY-MM" to a human-readable format like "May '24".
 * Used for XAxis ticks and Tooltip labels on the monthly trend chart.
 * @param tick The date string in "YYYY-MM" format.
 * @returns Formatted date string.
 */
const dateFormatter = (tick: string): string => {
    if (!tick || tick.length !== 7 || tick[4] !== '-') return tick; 

    const [year, month] = tick.split('-');
    
    // Create Date object (month is 0-indexed in Date constructor, so subtract 1)
    const date = new Date(parseInt(year), parseInt(month) - 1, 1);
    
    // Format to "MMM 'YY" (e.g., "May '24")
    const monthFormatter = new Intl.DateTimeFormat('en-US', { month: 'short', year: '2-digit' });
    
    return monthFormatter.format(date).replace(' ', "'"); 
};


// --- 4. Reusable Metric Card Component (Kept as is) ---
interface MetricCardProps {
    title: string;
    value: number | string;
    icon: React.ReactNode;
    color: string;
    subtitle?: string; // Added subtitle for MoM card 
}

const MetricCard: React.FC<MetricCardProps> = ({ title, value, icon, color, subtitle }) => (
    <div className="bg-white p-6 rounded-xl shadow-lg border-b-4 border-l-4 transition-shadow duration-300 hover:shadow-xl" 
         style={{ borderColor: color, backgroundColor: CARD_BACKGROUND }}>
        
        <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider">{title}</p>
            <div className="p-3 rounded-lg bg-opacity-10" style={{ backgroundColor: color + '22', color: color }}>
                {icon}
            </div>
        </div>
        
        <p className="text-4xl font-extrabold mt-2" style={{ color: TEXT_COLOR }}>{value}</p>
        {subtitle && (
            <div className="mt-2 text-sm font-medium text-gray-400">
                {subtitle}
            </div>
        )}
    </div>
);


// --- 5. Main Analysis Page Component ---

export default function AnalysisPage() {
    const [data, setData] = useState<AnalysisData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Fetch data logic (Kept as is)
    useEffect(() => {
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

    // Memoized trend calculation (MoM change) (Kept as is)
    const issuanceTrend = useMemo(() => {
        if (!data || data.byTime.length < 2) return { value: 'N/A', color: TEXT_COLOR, icon: <Clock className="w-4 h-4 mr-1" />, subtitle: 'Not enough data' };
        
        const lastMonthCount = data.byTime.slice(-1)[0].count;
        const prevMonthCount = data.byTime.slice(-2)[0].count;
        const difference = lastMonthCount - prevMonthCount;
        // Handle division by zero for percentage calculation
        const percentage = (prevMonthCount === 0 ? (difference > 0 ? 100 : 0) : (difference / prevMonthCount) * 100);

        let value, color, icon, subtitle;

        if (difference > 0) {
            value = `+${percentage.toFixed(1)}%`;
            color = CHART_COLORS[1]; // Green
            icon = <TrendingUp className="w-4 h-4 mr-1" />;
            subtitle = 'Increase vs. Previous Month';
        } else if (difference < 0) {
            value = `${percentage.toFixed(1)}%`;
            color = CHART_COLORS[3]; // Red
            icon = <TrendingUp className="w-4 h-4 mr-1 transform rotate-180" />; // Down arrow
            subtitle = 'Decrease vs. Previous Month';
        } else {
            value = '0.0%';
            color = TEXT_COLOR;
            icon = <Clock className="w-4 h-4 mr-1" />; // Neutral icon
            subtitle = 'No change vs. Previous Month';
        }
        return { value, color, icon, subtitle };
    }, [data]);
    
    // Memoized data for Certificates by Initial, sorted alphabetically (Kept as is)
    const chartByInitial = useMemo(() => {
        return data?.byInitial.sort((a, b) => a.initial.localeCompare(b.initial)) || [];
    }, [data]);

    // **NEW** Memoized data for Top 5 Hospitals
    const topHospitals = useMemo(() => {
        return data?.byHospital.sort((a, b) => b.count - a.count).slice(0, 5) || [];
    }, [data]);


    if (isLoading) return <div className="p-16 text-center text-xl text-blue-600 bg-white min-h-screen">Loading Analytics...</div>;
    if (error) return <div className="p-16 text-red-600 text-center text-xl bg-white min-h-screen">Error: {error}</div>;
    if (!data) return <div className="p-16 text-center text-xl text-gray-500 bg-white min-h-screen">No data available for analysis.</div>;

    // Recharts styling props for light theme (Kept as is)
    const chartProps = {
        stroke: GRID_COLOR, 
        tick: { fill: TEXT_COLOR, fontSize: 12 },
    };

    return (
        <div className="py-4 md:py-10 min-h-screen px-4" style={{ backgroundColor: CARD_BACKGROUND }}>
            <div className="max-w-screen-2xl mx-auto"> 
                
                <header className="mb-10 border-b border-gray-200 pb-4">
                    <h1 className="text-3xl md:text-4xl font-extrabold flex items-center" style={{ color: PRIMARY_ACCENT }}>
                        <TrendingUp className="w-6 h-6 md:w-8 md:h-8 mr-3" />
                        Key Issuance Analytics
                    </h1>
                    <p className="text-sm md:text-lg text-gray-600 mt-2">Focused dashboard for trend analysis and performance metrics.</p>
                </header>
                
                {/* --- 1. Key Metric Cards Section (2 Cards Only) --- */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 mb-10">
                    <MetricCard 
                        title="Total Certificates Issued" 
                        value={data.totalCertificates.toLocaleString()} 
                        icon={<ClipboardCheck />}
                        color={CHART_COLORS[0]}
                    />
                    {/* MoM Trend Card - Now using the subtitle prop */}
                    <MetricCard 
                        title="Issuance Month-over-Month" 
                        value={issuanceTrend.value} 
                        icon={issuanceTrend.icon}
                        color={issuanceTrend.color}
                        subtitle={issuanceTrend.subtitle}
                    />
                </div>

                {/* --- 2. Chart Section (Primary Focus: Trend) --- */}
                <div className="mb-10 p-6 rounded-xl shadow-2xl border border-gray-200" style={{ backgroundColor: BACKGROUND_COLOR }}>
                    <h2 className="text-lg md:text-2xl font-semibold mb-6" style={{ color: TEXT_COLOR }}>Monthly Issuance Volume Trend (Area Chart)</h2>
                    <div style={{ width: '100%', height: '400px' }}> 
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
                                    tickFormatter={dateFormatter} 
                                />
                                <YAxis stroke={TEXT_COLOR} tick={chartProps.tick} />
                                <Tooltip 
                                    contentStyle={{ backgroundColor: BACKGROUND_COLOR, border: `1px solid ${CHART_COLORS[0]}`, color: TEXT_COLOR, borderRadius: '6px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} 
                                    labelStyle={{ fontWeight: 'bold', color: CHART_COLORS[0] }}
                                    labelFormatter={dateFormatter}
                                />
                                <Area type="monotone" dataKey="count" stroke={CHART_COLORS[0]} fillOpacity={1} fill="url(#colorCountLight)" strokeWidth={3} name="Issuance Count" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* --- 3. Secondary Insights (2x1 Grid) --- */}
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 md:gap-8">
                    
                    {/* Chart 2: Top 5 Issuing Hospitals (Focused List View) */}
                    <div className="bg-white p-6 rounded-xl shadow-xl border border-gray-200">
                        <h2 className="text-lg md:text-2xl font-semibold mb-6" style={{ color: TEXT_COLOR }}>Top 5 Issuing Hospitals (Lifetime)</h2>
                        <div style={{ width: '100%', height: '350px' }}> 
                            <ul className="space-y-3 p-4 border border-gray-200 rounded-lg" style={{backgroundColor: CARD_BACKGROUND}}>
                                {topHospitals.map((item, index) => (
                                    <li key={item.hospital} className="flex justify-between items-center py-3 border-b border-gray-100 last:border-b-0">
                                        <div className="flex items-center">
                                            <span className={`text-xl font-extrabold mr-3 ${index === 0 ? 'text-yellow-500' : index === 1 ? 'text-gray-400' : index === 2 ? 'text-amber-700' : 'text-gray-300'}`}>
                                                {index + 1}.
                                            </span>
                                            <span className="font-medium text-base truncate" style={{color: TEXT_COLOR}}>{item.hospital}</span>
                                        </div>
                                        <span className="font-bold text-xl" style={{color: CHART_COLORS[1]}}>{item.count.toLocaleString()}</span>
                                    </li>
                                ))}
                                {topHospitals.length === 0 && <p className="text-center text-gray-500">No hospital data available.</p>}
                            </ul>
                            <p className="text-sm text-gray-500 mt-3">These hospitals represent the highest volume of certificates issued.</p>
                        </div>
                    </div>

                    {/* Chart 3: Certificates by Name Initial (Bar Chart) (Kept as is) */}
                    <div className="bg-white p-6 rounded-xl shadow-xl border border-gray-200">
                        <h2 className="text-lg md:text-2xl font-semibold mb-6" style={{ color: TEXT_COLOR }}>Certificates by Name Initial Distribution</h2>
                        <div style={{ width: '100%', height: '350px' }}> 
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={chartByInitial} margin={{ top: 10, right: 10, left: 0, bottom: 5 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke={chartProps.stroke} vertical={false} />
                                    <XAxis dataKey="initial" stroke={TEXT_COLOR} tick={chartProps.tick} />
                                    <YAxis stroke={TEXT_COLOR} tick={chartProps.tick} />
                                    <Tooltip 
                                        contentStyle={{ backgroundColor: BACKGROUND_COLOR, border: `1px solid ${CHART_COLORS[4]}`, color: TEXT_COLOR, borderRadius: '6px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} 
                                        labelStyle={{ fontWeight: 'bold', color: CHART_COLORS[4] }}
                                    />
                                    <Bar dataKey="count" fill={CHART_COLORS[4]} name="Count" radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>
                
            </div>
        </div>
    );
}