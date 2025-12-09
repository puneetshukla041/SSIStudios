import React, { useState, useRef, useEffect } from 'react';
import { Download, Filter, Plus, Trash2, Loader2, X, Search, ChevronDown, Check, Mail, Shield, Award, Layers, Briefcase } from 'lucide-react';
import clsx from 'clsx';

interface QuickActionBarProps {
    isAddFormVisible: boolean;
    selectedIds: string[];
    uniqueHospitals: string[];
    hospitalFilter: string;
    isBulkGeneratingV1: boolean;
    isBulkGeneratingV2: boolean;
    isBulkGeneratingV3: boolean;
    // Cert Type Mode
    certTypeMode: string;
    setCertTypeMode: React.Dispatch<React.SetStateAction<string>>;
    
    setIsAddFormVisible: React.Dispatch<React.SetStateAction<boolean>>;
    setHospitalFilter: React.Dispatch<React.SetStateAction<string>>;
    handleBulkDelete: () => Promise<void>;
    handleDownload: (type: 'xlsx' | 'csv') => Promise<void>;
    handleBulkGeneratePDF_V1: () => Promise<void>;
    handleBulkGeneratePDF_V2: () => Promise<void>;
    handleBulkGeneratePDF_V3: () => Promise<void>;
    handleBulkMail_V1: () => void;
    handleBulkMail_V2: () => void;
    handleBulkMail_V3: () => void;
}

const QuickActionBar: React.FC<QuickActionBarProps> = ({
    isAddFormVisible, selectedIds, uniqueHospitals, hospitalFilter, 
    isBulkGeneratingV1, isBulkGeneratingV2, isBulkGeneratingV3,
    certTypeMode, setCertTypeMode,
    setIsAddFormVisible, setHospitalFilter, handleBulkDelete, handleDownload, 
    handleBulkGeneratePDF_V1, handleBulkGeneratePDF_V2, handleBulkGeneratePDF_V3,
    handleBulkMail_V1, handleBulkMail_V2, handleBulkMail_V3
}) => {
    
    const isGenerating = isBulkGeneratingV1 || isBulkGeneratingV2 || isBulkGeneratingV3;
    const hasSelection = selectedIds.length > 0;
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const [filterSearchTerm, setFilterSearchTerm] = useState('');
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Is Internal Mode?
    const isInternal = certTypeMode === 'external';
    const isOthers100 = certTypeMode === 'others_100';

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
        <div className="sticky top-2 z-[20] mb-6 px-1">
            <div className={clsx(
                "flex flex-col lg:flex-row items-stretch lg:items-center justify-between p-3 gap-4",
                "bg-white/95 backdrop-blur-sm rounded-2xl border transition-all duration-300",
                hasSelection 
                    ? "border-indigo-200 shadow-[0_8px_30px_rgb(99,102,241,0.12)] ring-1 ring-indigo-500/20" 
                    : "border-slate-200 shadow-sm hover:shadow-md"
            )}>
                
                {/* --- LEFT SECTION: Primary Controls (Add & Filter) --- */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center w-full lg:w-auto gap-3">
                    
                    {/* Add Button */}
                    <button
                        type="button"
                        onClick={() => setIsAddFormVisible(prev => !prev)}
                        className={clsx(
                            "flex items-center justify-center px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 shadow-sm whitespace-nowrap active:scale-95 border",
                            isAddFormVisible
                                ? "bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200"
                                : "bg-slate-900 text-white border-transparent hover:bg-slate-800 hover:shadow-lg hover:shadow-slate-900/20"
                        )}
                    >
                        {isAddFormVisible ? (
                            <> <X className="w-4 h-4 mr-2" /> Cancel </>
                        ) : (
                            <> <Plus className="w-4 h-4 mr-2" /> New Entry </>
                        )}
                    </button>

                    <div className="hidden sm:block h-8 w-px bg-slate-200/60" />

                    {/* Filter Dropdown */}
                    <div className="relative flex-grow sm:flex-grow-0 sm:min-w-[260px]" ref={dropdownRef}>
                        <button
                            type="button"
                            onClick={() => setIsFilterOpen(!isFilterOpen)}
                            className={clsx(
                                "relative w-full text-left pl-10 pr-10 py-2.5 rounded-xl border transition-all duration-200 text-sm font-medium focus:outline-none cursor-pointer",
                                isFilterOpen 
                                    ? "bg-white border-indigo-500 ring-4 ring-indigo-500/10 text-slate-900" 
                                    : "bg-slate-50 border-slate-200 text-slate-700 hover:bg-white hover:border-slate-300"
                            )}
                        >
                            <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                                <Filter className="w-4 h-4" />
                            </div>
                            <span className="block truncate">
                                {hospitalFilter || "Filter by Hospital"}
                            </span>
                            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
                                <ChevronDown className={clsx("w-4 h-4 transition-transform duration-200", isFilterOpen && "rotate-180")} />
                            </div>
                        </button>

                        {isFilterOpen && (
                            <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-2xl border border-slate-100 overflow-hidden z-[100] animate-in fade-in zoom-in-95 duration-200 origin-top">
                                <div className="p-3 border-b border-slate-100 bg-slate-50/50">
                                    <div className="relative">
                                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                                        <input
                                            type="text"
                                            placeholder="Find hospital..."
                                            value={filterSearchTerm}
                                            onChange={(e) => setFilterSearchTerm(e.target.value)}
                                            className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-lg text-xs focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 placeholder-slate-400 transition-all"
                                            autoFocus
                                        />
                                    </div>
                                </div>
                                <div className="max-h-60 overflow-y-auto custom-scrollbar p-1.5 space-y-0.5">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setHospitalFilter("");
                                            setIsFilterOpen(false);
                                            setFilterSearchTerm("");
                                        }}
                                        className={clsx(
                                            "w-full text-left px-3 py-2.5 rounded-lg text-sm flex items-center justify-between transition-colors cursor-pointer",
                                            hospitalFilter === "" ? "bg-indigo-50 text-indigo-700 font-semibold" : "text-slate-600 hover:bg-slate-50"
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
                                                "w-full text-left px-3 py-2.5 rounded-lg text-sm flex items-center justify-between transition-colors cursor-pointer",
                                                hospitalFilter === hospital ? "bg-indigo-50 text-indigo-700 font-semibold" : "text-slate-600 hover:bg-slate-50"
                                            )}
                                        >
                                            <span className="truncate mr-2">{hospital}</span>
                                            {hospitalFilter === hospital && <Check className="w-3.5 h-3.5 flex-shrink-0" />}
                                        </button>
                                    ))}
                                    {filteredHospitals.length === 0 && (
                                        <div className="px-3 py-4 text-center text-xs text-slate-400 italic">
                                            No hospitals found
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* --- RIGHT SECTION: Actions --- */}
                <div className="flex items-center w-full lg:w-auto justify-between lg:justify-end gap-3">
                    {hasSelection ? (
                        <div className="flex flex-col sm:flex-row items-center gap-3 w-full animate-in fade-in slide-in-from-right-4 duration-300">
                            
                            <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-start">
                                {/* Selection Counter */}
                                <div className="flex items-center px-3 py-1.5 bg-indigo-50 text-indigo-700 rounded-lg text-xs font-bold uppercase tracking-wide border border-indigo-100 whitespace-nowrap shadow-sm">
                                    {selectedIds.length} <span className="hidden sm:inline ml-1">Selected</span>
                                </div>

                                {/* Certificate Type Mode Selector */}
                                <div className="relative min-w-[150px]">
                                    <select
                                        value={certTypeMode}
                                        onChange={(e) => setCertTypeMode(e.target.value)}
                                        className="appearance-none w-full bg-white border border-slate-200 text-slate-700 text-sm rounded-xl px-3.5 py-2 pr-9 focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 cursor-pointer shadow-sm font-medium transition-all"
                                    >
                                        <option value="external">External (Surgeons)</option>
                                        <option value="internal">Internal (Staff)</option>
                                        <option value="others_100">Others (Fortis)</option>
                                    </select>
                                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                                </div>
                            </div>

                            {/* Action Buttons Group */}
                            <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0 no-scrollbar">
                                {/* ✅ CASE 1: OTHERS 100+ SELECTED */}
                                {isOthers100 ? (
                                    <>
                                        <div className="flex items-center bg-rose-50 p-1 rounded-xl border border-rose-100">
                                            <button
                                                type="button"
                                                onClick={handleBulkGeneratePDF_V3}
                                                disabled={isGenerating}
                                                className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center cursor-pointer text-rose-700 hover:bg-white hover:shadow-sm disabled:opacity-50"
                                                title="Download Certificate (100+)"
                                            >
                                                {isBulkGeneratingV3 ? <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" /> : <Briefcase className="w-3.5 h-3.5 mr-1.5" />}
                                                <span>Download</span>
                                            </button>
                                            
                                            <div className="w-px h-4 bg-rose-200 mx-1" />

                                            <button
                                                type="button"
                                                onClick={handleBulkMail_V3}
                                                disabled={isGenerating}
                                                className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center cursor-pointer text-rose-700 hover:bg-white hover:shadow-sm disabled:opacity-50"
                                                title="Mail Certificate (100+)"
                                            >
                                                <Mail className="w-3.5 h-3.5 mr-1.5" />
                                                <span>Mail</span>
                                            </button>
                                        </div>
                                    </>
                                ) : (
                                    /* ✅ CASE 2: NORMAL EXTERNAL / INTERNAL LOGIC */
                                    <>
                                        {/* Download Buttons Group */}
                                        <div className="flex items-center bg-slate-50 p-1 rounded-xl border border-slate-200">
                                            {/* Proctorship */}
                                            <button
                                                type="button"
                                                onClick={handleBulkGeneratePDF_V1}
                                                disabled={isGenerating || isInternal}
                                                className={clsx(
                                                    "px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed",
                                                    !isInternal && "text-blue-700 hover:bg-white hover:shadow-sm"
                                                )}
                                                title={isInternal ? "No Template" : "Download Proctorship"}
                                            >
                                                {isBulkGeneratingV1 ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Shield className="w-3.5 h-3.5 sm:mr-1.5" />}
                                                <span className="hidden xl:inline">Proc.</span>
                                                <Download className="w-3 h-3 ml-1.5 opacity-50" />
                                            </button>
                                            
                                            <div className="w-px h-4 bg-slate-300 mx-1" />
                                            
                                            {/* Training */}
                                            <button
                                                type="button"
                                                onClick={handleBulkGeneratePDF_V2}
                                                disabled={isGenerating || isInternal}
                                                className={clsx(
                                                    "px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed",
                                                    !isInternal && "text-teal-700 hover:bg-white hover:shadow-sm"
                                                )}
                                                title={isInternal ? "No Template" : "Download Training"}
                                            >
                                                {isBulkGeneratingV2 ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Award className="w-3.5 h-3.5 sm:mr-1.5" />}
                                                <span className="hidden xl:inline">Train.</span>
                                                <Download className="w-3 h-3 ml-1.5 opacity-50" />
                                            </button>
                                        </div>

                                        {/* Mail Buttons Group */}
                                        <div className="flex items-center bg-slate-50 p-1 rounded-xl border border-slate-200">
                                            <button
                                                type="button"
                                                onClick={handleBulkMail_V1}
                                                disabled={isGenerating || isInternal}
                                                className={clsx(
                                                    "px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed",
                                                    !isInternal && "text-indigo-700 hover:bg-white hover:shadow-sm"
                                                )}
                                                title={isInternal ? "No Template" : "Mail Proctorship"}
                                            >
                                                <Mail className="w-3.5 h-3.5 sm:mr-1.5" />
                                                <span className="hidden xl:inline">Proc.</span>
                                            </button>

                                            <div className="w-px h-4 bg-slate-300 mx-1" />

                                            <button
                                                type="button"
                                                onClick={handleBulkMail_V2}
                                                disabled={isGenerating || isInternal}
                                                className={clsx(
                                                    "px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed",
                                                    !isInternal && "text-emerald-700 hover:bg-white hover:shadow-sm"
                                                )}
                                                title={isInternal ? "No Template" : "Mail Training"}
                                            >
                                                <Mail className="w-3.5 h-3.5 sm:mr-1.5" />
                                                <span className="hidden xl:inline">Train.</span>
                                            </button>
                                        </div>
                                    </>
                                )}

                                {/* Delete Button */}
                                <button
                                    type="button"
                                    onClick={handleBulkDelete}
                                    disabled={isGenerating}
                                    className="p-2.5 rounded-xl bg-white border border-rose-200 text-rose-600 hover:bg-rose-50 hover:border-rose-300 transition-all shadow-sm disabled:opacity-50 cursor-pointer ml-auto sm:ml-0"
                                    title="Delete Selected"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="animate-in fade-in zoom-in-95 duration-200 w-full lg:w-auto">
                            <button
                                type="button"
                                onClick={() => handleDownload('xlsx')}
                                disabled={isGenerating}
                                className="group flex items-center justify-center w-full lg:w-auto px-5 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-600 hover:text-emerald-700 hover:border-emerald-200 hover:bg-emerald-50 transition-all duration-200 shadow-sm hover:shadow-md cursor-pointer" 
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