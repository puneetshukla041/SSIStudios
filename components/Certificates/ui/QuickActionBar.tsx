import React from 'react';
import {
    Download,
    Filter,
    Plus,
    Trash2,
    FileCheck, // For V1 PDF
    FileText,  // For V2 PDF
    Loader2,   // For loading state
} from 'lucide-react';

// Assuming imports from constants/types needed by this component exist
// Example: import { DateFilterOption, DATE_FILTER_OPTIONS } from '../utils/constants'; 

interface QuickActionBarProps {
    // 💡 FIX: Include isAddFormVisible and setIsAddFormVisible
    isAddFormVisible: boolean; 
    selectedIds: string[];
    uniqueHospitals: string[];
    // searchQuery: string; // REMOVED
    hospitalFilter: string;
    isBulkGeneratingV1: boolean; 
    isBulkGeneratingV2: boolean; 
    setIsAddFormVisible: React.Dispatch<React.SetStateAction<boolean>>; // 💡 FIX: Included
    // setSearchQuery: React.Dispatch<React.SetStateAction<string>>; // REMOVED
    setHospitalFilter: React.Dispatch<React.SetStateAction<string>>;
    handleBulkDelete: () => Promise<void>;
    handleDownload: (type: 'xlsx' | 'csv') => Promise<void>;
    handleBulkGeneratePDF_V1: () => Promise<void>; 
    handleBulkGeneratePDF_V2: () => Promise<void>; 
}

const QuickActionBar: React.FC<QuickActionBarProps> = ({
    isAddFormVisible, // Destructured here
    selectedIds,
    uniqueHospitals,
    // searchQuery, // REMOVED
    hospitalFilter,
    isBulkGeneratingV1,
    isBulkGeneratingV2,
    setIsAddFormVisible, // Destructured here
    // setSearchQuery, // REMOVED
    setHospitalFilter,
    handleBulkDelete,
    handleDownload,
    handleBulkGeneratePDF_V1,
    handleBulkGeneratePDF_V2,
}) => {
    
    // Combine loading states to disable all relevant buttons
    const isGenerating = isBulkGeneratingV1 || isBulkGeneratingV2;

    const isExporting = isGenerating; 

    return (
        <div 
            // 🔵 BLUE BORDER: Changed 'border-black' to 'border-blue-500'.
            className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0 md:space-x-4 p-4 sm:p-5 
                       bg-white/70 rounded-2xl border border-blue-300 backdrop-blur-md 
                       shadow-xl shadow-gray-400/20 shadow-inner" 
        >

            {/* Left Side: Add, Filters */}
            <div className="flex flex-col sm:flex-row w-full space-y-3 sm:space-y-0 sm:space-x-4">
                <button
                    onClick={() => setIsAddFormVisible(prev => !prev)}
                    className="w-full sm:w-auto px-5 py-2 text-sm font-semibold rounded-full bg-blue-600/90 text-white hover:bg-blue-700 transition duration-300 shadow-lg flex items-center justify-center transform hover:scale-[1.05] cursor-pointer"
                >
                    <Plus className="w-4 h-4 mr-2" />
                    {isAddFormVisible ? 'Hide Form' : 'Add New Data'}
                </button>

                {/* Hospital Filter */}
                <div className="relative w-full sm:w-68">
                    <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
                    <select
                        value={hospitalFilter}
                        onChange={(e) => setHospitalFilter(e.target.value)}
                        // Filter Border: Changed from border-white/70 to border-gray-400/70 for better contrast against the new blue container border
                        className="w-full pl-10 pr-4 py-2 border border-gray-400/70 rounded-xl bg-white/50 
                                     focus:ring-sky-500 focus:border-sky-500 transition duration-300 
                                     appearance-none outline-none cursor-pointer shadow-md text-gray-800"
                    >
                        <option value="">All Hospitals (Filter)</option>
                        {uniqueHospitals.map(hospital => (
                            <option key={hospital} value={hospital}>{hospital}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Right Side: Bulk Actions & Export */}
            <div className="flex flex-wrap justify-center md:justify-end items-center gap-2 sm:gap-3 flex-shrink-0">
                
                {/* 💡 Bulk PDF Export V1 Button - Updated for multiple downloads */}
                {selectedIds.length > 0 && (
                    <button
                        onClick={handleBulkGeneratePDF_V1}
                        disabled={isGenerating}
                        className={`px-3 sm:px-5 py-2 text-xs sm:text-sm font-semibold rounded-full text-white transition duration-300 shadow-lg flex items-center transform hover:scale-[1.05] cursor-pointer whitespace-nowrap ${
                            isBulkGeneratingV1 
                                ? 'bg-yellow-500/70 cursor-wait shadow-inner' 
                                : 'bg-emerald-600/90 hover:bg-emerald-700'
                        }`}
                        // 💡 UPDATED Title: No longer mentions ZIP
                        title="Export Selected V1 PDFs (Multiple Downloads)"
                    >
                        {isBulkGeneratingV1 ? (
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        ) : (
                            <FileCheck className="w-4 h-4 mr-2" />
                        )} 
                        {/* 💡 UPDATED Text */}
                        {isBulkGeneratingV1 ? 'Generating...' : `Export ${selectedIds.length} V1 PDFs`}
                    </button>
                )}
                
                {/* 💡 Bulk PDF Export V2 Button - Updated for multiple downloads */}
                {selectedIds.length > 0 && (
                    <button
                        onClick={handleBulkGeneratePDF_V2}
                        disabled={isGenerating}
                        className={`px-3 sm:px-5 py-2 text-xs sm:text-sm font-semibold rounded-full text-white transition duration-300 shadow-lg flex items-center transform hover:scale-[1.05] cursor-pointer whitespace-nowrap ${
                            isBulkGeneratingV2
                                ? 'bg-yellow-500/70 cursor-wait shadow-inner' 
                                : 'bg-purple-600/90 hover:bg-purple-700'
                        }`}
                        // 💡 UPDATED Title: No longer mentions ZIP
                        title="Export Selected V2 PDFs (Multiple Downloads)"
                    >
                        {isBulkGeneratingV2 ? (
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        ) : (
                            <FileText className="w-4 h-4 mr-2" />
                        )} 
                        {/* 💡 UPDATED Text */}
                        {isBulkGeneratingV2 ? 'Generating...' : `Export ${selectedIds.length} V2 PDFs`}
                    </button>
                )}
                
                {/* Bulk Delete Button */}
                {selectedIds.length > 0 && (
                    <button
                        onClick={handleBulkDelete}
                        disabled={isGenerating} 
                        className={`px-3 sm:px-5 py-2 text-xs sm:text-sm font-semibold rounded-full text-white transition duration-300 shadow-lg flex items-center transform hover:scale-[1.05] cursor-pointer whitespace-nowrap ${
                            isGenerating ? 'bg-red-400/90 cursor-not-allowed' : 'bg-red-600/90 hover:bg-red-700'
                        }`}
                    >
                        <Trash2 className="w-4 h-4 mr-2" /> Delete {selectedIds.length}
                    </button>
                )}

                {/* 💡 Export Button (Excel) */}
                <button
                    onClick={() => handleDownload('xlsx')}
                    disabled={isExporting} 
                    className={`px-3 sm:px-6 py-2 text-xs sm:text-sm font-semibold rounded-full text-white transition duration-300 shadow-lg flex items-center justify-center transform hover:scale-[1.05] cursor-pointer whitespace-nowrap ${
                        isExporting
                            ? 'bg-gray-400/90 cursor-not-allowed shadow-inner' 
                            : 'bg-teal-600/90 hover:bg-teal-700'
                    }`}
                >
                    <Download className="w-4 h-4 mr-2" /> Export Excel
                </button>

            </div>
        </div>
    );
};

export default QuickActionBar;