import React, { useState, useRef, useEffect } from 'react';
import { Download, Filter, Plus, Trash2, FileCheck, FileText, Loader2, X, Search, ChevronDown, Check } from 'lucide-react';
import clsx from 'clsx';

interface QuickActionBarProps {
    isAddFormVisible: boolean;
    selectedIds: string[];
    uniqueHospitals: string[];
    hospitalFilter: string;
    isBulkGeneratingV1: boolean;
    isBulkGeneratingV2: boolean;
    setIsAddFormVisible: React.Dispatch<React.SetStateAction<boolean>>;
    setHospitalFilter: React.Dispatch<React.SetStateAction<string>>;
    handleBulkDelete: () => Promise<void>;
    handleDownload: (type: 'xlsx' | 'csv') => Promise<void>;
    handleBulkGeneratePDF_V1: () => Promise<void>;
    handleBulkGeneratePDF_V2: () => Promise<void>;
}

const QuickActionBar: React.FC<QuickActionBarProps> = ({
    isAddFormVisible, selectedIds, uniqueHospitals, hospitalFilter, isBulkGeneratingV1, isBulkGeneratingV2,
    setIsAddFormVisible, setHospitalFilter, handleBulkDelete, handleDownload, handleBulkGeneratePDF_V1, handleBulkGeneratePDF_V2,
}) => {
    
    const isGenerating = isBulkGeneratingV1 || isBulkGeneratingV2;
    const hasSelection = selectedIds.length > 0;
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const [filterSearchTerm, setFilterSearchTerm] = useState('');
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsFilterOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const filteredHospitals = uniqueHospitals.filter(hospital =>
        hospital.toLowerCase().includes(filterSearchTerm.toLowerCase())
    );

    return (
        <div className="sticky top-0 z-[2] mb-6 transition-all duration-300">
            <div className={clsx(
                "flex flex-col lg:flex-row items-stretch lg:items-center justify-between p-2 gap-3",
                "bg-white rounded-2xl border transition-all duration-300",
                hasSelection 
                    ? "border-indigo-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] ring-1 ring-indigo-500/10" 
                    : "border-slate-200 shadow-sm"
            )}>
                
                {/* --- LEFT SECTION: Primary Controls (Add & Filter) --- */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center w-full lg:w-auto gap-2 sm:gap-3">
                    
                    <button
                        onClick={() => setIsAddFormVisible(prev => !prev)}
                        className={clsx(
                            "flex items-center justify-center px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 shadow-sm whitespace-nowrap",
                            isAddFormVisible
                                ? "bg-slate-100 text-slate-600 hover:bg-slate-200"
                                : "bg-slate-900 text-white hover:bg-slate-800 hover:shadow-md active:scale-95"
                        )}
                    >
                        {isAddFormVisible ? (
                            <> <X className="w-4 h-4 mr-2" /> Cancel </>
                        ) : (
                            <> <Plus className="w-4 h-4 mr-2" /> New Entry </>
                        )}
                    </button>

                    <div className="hidden sm:block h-6 w-px bg-slate-200" />

                    {/* Filter Dropdown - Full width on mobile */}
                    <div className="relative flex-grow sm:flex-grow-0 sm:min-w-[240px]" ref={dropdownRef}>
                        <button
                            onClick={() => setIsFilterOpen(!isFilterOpen)}
                            className={clsx(
                                "relative w-full text-left pl-10 pr-10 py-2.5 rounded-xl border transition-all duration-200 text-sm font-medium focus:outline-none",
                                isFilterOpen 
                                    ? "bg-white border-indigo-500 ring-2 ring-indigo-500/10 text-slate-900" 
                                    : "bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100"
                            )}
                        >
                            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                                <Filter className="w-4 h-4" />
                            </div>
                            <span className="block truncate">
                                {hospitalFilter || "All Hospitals"}
                            </span>
                            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
                                <ChevronDown className={clsx("w-4 h-4 transition-transform duration-200", isFilterOpen && "rotate-180")} />
                            </div>
                        </button>

                        {isFilterOpen && (
                            <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-xl border border-slate-100 overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-200 origin-top">
                                <div className="p-2 border-b border-slate-100 bg-slate-50/50">
                                    <div className="relative">
                                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                                        <input
                                            type="text"
                                            placeholder="Search..."
                                            value={filterSearchTerm}
                                            onChange={(e) => setFilterSearchTerm(e.target.value)}
                                            className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-lg text-xs focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 placeholder-slate-400"
                                            autoFocus
                                        />
                                    </div>
                                </div>
                                <div className="max-h-60 overflow-y-auto custom-scrollbar p-1">
                                    <button
                                        onClick={() => {
                                            setHospitalFilter("");
                                            setIsFilterOpen(false);
                                            setFilterSearchTerm("");
                                        }}
                                        className={clsx(
                                            "w-full text-left px-3 py-2 rounded-lg text-sm flex items-center justify-between transition-colors",
                                            hospitalFilter === "" ? "bg-indigo-50 text-indigo-700 font-medium" : "text-slate-600 hover:bg-slate-50"
                                        )}
                                    >
                                        <span>All Hospitals</span>
                                        {hospitalFilter === "" && <Check className="w-3.5 h-3.5" />}
                                    </button>
                                    {filteredHospitals.map(hospital => (
                                        <button
                                            key={hospital}
                                            onClick={() => {
                                                setHospitalFilter(hospital);
                                                setIsFilterOpen(false);
                                                setFilterSearchTerm("");
                                            }}
                                            className={clsx(
                                                "w-full text-left px-3 py-2 rounded-lg text-sm flex items-center justify-between transition-colors mt-0.5",
                                                hospitalFilter === hospital ? "bg-indigo-50 text-indigo-700 font-medium" : "text-slate-600 hover:bg-slate-50"
                                            )}
                                        >
                                            <span className="truncate mr-2">{hospital}</span>
                                            {hospitalFilter === hospital && <Check className="w-3.5 h-3.5 flex-shrink-0" />}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* --- RIGHT SECTION: Actions --- */}
                <div className="flex items-center gap-2 w-full lg:w-auto justify-end overflow-x-auto pb-1 lg:pb-0">
                    {hasSelection ? (
                        <div className="flex items-center gap-2 animate-in fade-in slide-in-from-right-4 duration-300 w-full lg:w-auto justify-between lg:justify-end">
                            
                            <div className="flex items-center px-3 py-1 bg-indigo-50 text-indigo-700 rounded-lg text-xs font-bold uppercase tracking-wide border border-indigo-100 whitespace-nowrap">
                                {selectedIds.length} <span className="hidden sm:inline ml-1">Selected</span>
                            </div>

                            <div className="flex items-center gap-2">
                                <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200">
                                    <button
                                        onClick={handleBulkGeneratePDF_V1}
                                        disabled={isGenerating}
                                        className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-600 hover:text-indigo-600 hover:bg-white hover:shadow-sm disabled:opacity-50 transition-all flex items-center"
                                        title="Proctorship"
                                    >
                                        {isBulkGeneratingV1 ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <FileCheck className="w-3.5 h-3.5 sm:mr-1.5" />}
                                        <span className="hidden sm:inline">Proctorship</span>
                                    </button>
                                    <div className="w-px h-4 bg-slate-300 mx-1" />
                                    <button
                                        onClick={handleBulkGeneratePDF_V2}
                                        disabled={isGenerating}
                                        className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-600 hover:text-indigo-600 hover:bg-white hover:shadow-sm disabled:opacity-50 transition-all flex items-center"
                                        title="Training"
                                    >
                                        {isBulkGeneratingV2 ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <FileText className="w-3.5 h-3.5 sm:mr-1.5" />}
                                        <span className="hidden sm:inline">Training</span>
                                    </button>
                                </div>

                                <button
                                    onClick={handleBulkDelete}
                                    disabled={isGenerating}
                                    className="p-2.5 rounded-xl bg-white border border-rose-200 text-rose-600 hover:bg-rose-50 hover:border-rose-300 transition-all shadow-sm disabled:opacity-50"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="animate-in fade-in zoom-in-95 duration-200 w-full lg:w-auto">
                            <button
                                onClick={() => handleDownload('xlsx')}
                                disabled={isGenerating}
                                className="group flex items-center justify-center w-full lg:w-auto px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-600 hover:text-emerald-700 hover:border-emerald-200 hover:bg-emerald-50 transition-all duration-200 shadow-sm" 
                            >
                                <Download className="w-4 h-4 mr-2 text-slate-400 group-hover:text-emerald-600 transition-colors" />
                                Export Excel
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default QuickActionBar;