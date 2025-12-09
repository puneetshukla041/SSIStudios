import React, { useState, useRef, useEffect } from 'react';
import { Download, Filter, Plus, Trash2, FileCheck, FileText, Loader2, X, Search, ChevronDown, Check, Mail, Shield, Award } from 'lucide-react';
import clsx from 'clsx';

interface QuickActionBarProps {
    isAddFormVisible: boolean;
    selectedIds: string[];
    uniqueHospitals: string[];
    hospitalFilter: string;
    isBulkGeneratingV1: boolean;
    isBulkGeneratingV2: boolean;
    // New Props for Cert Type Mode
    certTypeMode: string;
    setCertTypeMode: React.Dispatch<React.SetStateAction<string>>;
    
    setIsAddFormVisible: React.Dispatch<React.SetStateAction<boolean>>;
    setHospitalFilter: React.Dispatch<React.SetStateAction<string>>;
    handleBulkDelete: () => Promise<void>;
    handleDownload: (type: 'xlsx' | 'csv') => Promise<void>;
    handleBulkGeneratePDF_V1: () => Promise<void>;
    handleBulkGeneratePDF_V2: () => Promise<void>;
    handleBulkMail_V1: () => void;
    handleBulkMail_V2: () => void;
}

const QuickActionBar: React.FC<QuickActionBarProps> = ({
    isAddFormVisible, selectedIds, uniqueHospitals, hospitalFilter, 
    isBulkGeneratingV1, isBulkGeneratingV2,
    certTypeMode, setCertTypeMode,
    setIsAddFormVisible, setHospitalFilter, handleBulkDelete, handleDownload, 
    handleBulkGeneratePDF_V1, handleBulkGeneratePDF_V2,
    handleBulkMail_V1, handleBulkMail_V2
}) => {
    
    const isGenerating = isBulkGeneratingV1 || isBulkGeneratingV2;
    const hasSelection = selectedIds.length > 0;
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const [filterSearchTerm, setFilterSearchTerm] = useState('');
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Is Internal Mode?
    const isInternal = certTypeMode === 'internal';

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
                "flex flex-col xl:flex-row items-stretch xl:items-center justify-between p-2 gap-3",
                "bg-white rounded-2xl border transition-all duration-300",
                hasSelection 
                    ? "border-indigo-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] ring-1 ring-indigo-500/10" 
                    : "border-slate-200 shadow-sm"
            )}>
                
                {/* --- LEFT SECTION: Primary Controls (Add & Filter) --- */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center w-full xl:w-auto gap-2 sm:gap-3">
                    
                    <button
                        type="button"
                        onClick={() => setIsAddFormVisible(prev => !prev)}
                        className={clsx(
                            "flex items-center justify-center px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 shadow-sm whitespace-nowrap cursor-pointer",
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

                    {/* Filter Dropdown */}
                    <div className="relative flex-grow sm:flex-grow-0 sm:min-w-[240px]" ref={dropdownRef}>
                        <button
                            type="button"
                            onClick={() => setIsFilterOpen(!isFilterOpen)}
                            className={clsx(
                                "relative w-full text-left pl-10 pr-10 py-2.5 rounded-xl border transition-all duration-200 text-sm font-medium focus:outline-none cursor-pointer",
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
                            <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-xl border border-slate-100 overflow-hidden z-[100] animate-in fade-in zoom-in-95 duration-200 origin-top">
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
                                        type="button"
                                        onClick={() => {
                                            setHospitalFilter("");
                                            setIsFilterOpen(false);
                                            setFilterSearchTerm("");
                                        }}
                                        className={clsx(
                                            "w-full text-left px-3 py-2 rounded-lg text-sm flex items-center justify-between transition-colors cursor-pointer",
                                            hospitalFilter === "" ? "bg-indigo-50 text-indigo-700 font-medium" : "text-slate-600 hover:bg-slate-50"
                                        )}
                                    >
                                        <span>All Hospitals</span>
                                        {hospitalFilter === "" && <Check className="w-3.5 h-3.5" />}
                                    </button>
                                    {filteredHospitals.map(hospital => (
                                        <button
                                            type="button"
                                            key={hospital}
                                            onClick={() => {
                                                setHospitalFilter(hospital);
                                                setIsFilterOpen(false);
                                                setFilterSearchTerm("");
                                            }}
                                            className={clsx(
                                                "w-full text-left px-3 py-2 rounded-lg text-sm flex items-center justify-between transition-colors mt-0.5 cursor-pointer",
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
                <div className="flex items-center gap-3 w-full xl:w-auto justify-end overflow-x-auto pb-1 xl:pb-0">
                    {hasSelection ? (
                        <div className="flex flex-col sm:flex-row items-center gap-3 animate-in fade-in slide-in-from-right-4 duration-300 w-full xl:w-auto">
                            
                            <div className="flex items-center gap-3 w-full sm:w-auto justify-between">
                                {/* Selection Counter */}
                                <div className="flex items-center px-3 py-1.5 bg-indigo-50 text-indigo-700 rounded-lg text-xs font-bold uppercase tracking-wide border border-indigo-100 whitespace-nowrap">
                                    {selectedIds.length} <span className="hidden sm:inline ml-1">Selected</span>
                                </div>

                                {/* Certificate Type Mode Selector */}
                                <div className="relative min-w-[140px]">
                                    <select
                                        value={certTypeMode}
                                        onChange={(e) => setCertTypeMode(e.target.value)}
                                        className="appearance-none w-full bg-white border border-slate-200 text-slate-700 text-sm rounded-xl px-3 py-2 pr-8 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 cursor-pointer shadow-sm font-medium"
                                    >
                                        <option value="external">External</option>
                                        <option value="internal">Internal</option>
                                    </select>
                                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                                </div>
                            </div>

                            {/* Action Buttons Group */}
                            <div className="flex items-center gap-2">
                                {/* Group 1: Download Buttons */}
                                <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200">
                                    {/* Download Proctorship */}
                                    <button
                                        type="button"
                                        onClick={handleBulkGeneratePDF_V1}
                                        disabled={isGenerating || isInternal}
                                        className={clsx(
                                            "px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center cursor-pointer",
                                            isInternal 
                                                ? "opacity-40 cursor-not-allowed text-slate-400"
                                                : "text-blue-700 bg-blue-50 hover:bg-blue-100 border border-transparent hover:border-blue-200"
                                        )}
                                        title={isInternal ? "No Template" : "Download Proctorship"}
                                    >
                                        {isBulkGeneratingV1 ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Shield className="w-3.5 h-3.5 sm:mr-1.5" />}
                                        <span className="hidden sm:inline">Proc.</span>
                                        <Download className="w-3 h-3 ml-1.5 opacity-50" />
                                    </button>
                                    
                                    <div className="w-px h-4 bg-slate-300 mx-1" />
                                    
                                    {/* Download Training */}
                                    <button
                                        type="button"
                                        onClick={handleBulkGeneratePDF_V2}
                                        disabled={isGenerating || isInternal}
                                        className={clsx(
                                            "px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center cursor-pointer",
                                            isInternal 
                                                ? "opacity-40 cursor-not-allowed text-slate-400"
                                                : "text-teal-700 bg-teal-50 hover:bg-teal-100 border border-transparent hover:border-teal-200"
                                        )}
                                        title={isInternal ? "No Template" : "Download Training"}
                                    >
                                        {isBulkGeneratingV2 ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Award className="w-3.5 h-3.5 sm:mr-1.5" />}
                                        <span className="hidden sm:inline">Train.</span>
                                        <Download className="w-3 h-3 ml-1.5 opacity-50" />
                                    </button>
                                </div>

                                {/* Group 2: Mail Buttons */}
                                <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200">
                                    {/* Mail Proctorship */}
                                    <button
                                        type="button"
                                        onClick={handleBulkMail_V1}
                                        disabled={isGenerating || isInternal}
                                        className={clsx(
                                            "px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center cursor-pointer",
                                            isInternal 
                                                ? "opacity-40 cursor-not-allowed text-slate-400"
                                                : "text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-transparent hover:border-indigo-200"
                                        )}
                                        title={isInternal ? "No Template" : "Mail Proctorship"}
                                    >
                                        <Mail className="w-3.5 h-3.5 sm:mr-1.5" />
                                        <span className="hidden sm:inline">Proc.</span>
                                    </button>

                                    <div className="w-px h-4 bg-slate-300 mx-1" />

                                    {/* Mail Training */}
                                    <button
                                        type="button"
                                        onClick={handleBulkMail_V2}
                                        disabled={isGenerating || isInternal}
                                        className={clsx(
                                            "px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center cursor-pointer",
                                            isInternal 
                                                ? "opacity-40 cursor-not-allowed text-slate-400"
                                                : "text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-transparent hover:border-emerald-200"
                                        )}
                                        title={isInternal ? "No Template" : "Mail Training"}
                                    >
                                        <Mail className="w-3.5 h-3.5 sm:mr-1.5" />
                                        <span className="hidden sm:inline">Train.</span>
                                    </button>
                                </div>

                                {/* Delete Button */}
                                <button
                                    type="button"
                                    onClick={handleBulkDelete}
                                    disabled={isGenerating}
                                    className="p-2.5 rounded-xl bg-white border border-rose-200 text-rose-600 hover:bg-rose-50 hover:border-rose-300 transition-all shadow-sm disabled:opacity-50 cursor-pointer"
                                    title="Delete Selected"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="animate-in fade-in zoom-in-95 duration-200 w-full xl:w-auto">
                            <button
                                type="button"
                                onClick={() => handleDownload('xlsx')}
                                disabled={isGenerating}
                                className="group flex items-center justify-center w-full xl:w-auto px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-600 hover:text-emerald-700 hover:border-emerald-200 hover:bg-emerald-50 transition-all duration-200 shadow-sm cursor-pointer" 
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