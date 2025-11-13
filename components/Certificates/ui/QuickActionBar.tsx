// D:\ssistudios\ssistudios\components\Certificates\ui\QuickActionBar.tsx

import React from 'react';
import {
    Download,
    Search,
    Filter,
    Plus,
    Trash2,
    FileCheck, // For V1 PDF
    FileText,  // For V2 PDF
    Loader2,   // For loading state
} from 'lucide-react';

interface QuickActionBarProps {
    isAddFormVisible: boolean;
    selectedIds: string[];
    uniqueHospitals: string[];
    searchQuery: string;
    hospitalFilter: string;
    isBulkGeneratingV1: boolean; // NEW
    isBulkGeneratingV2: boolean; // NEW
    setIsAddFormVisible: React.Dispatch<React.SetStateAction<boolean>>;
    setSearchQuery: React.Dispatch<React.SetStateAction<string>>;
    setHospitalFilter: React.Dispatch<React.SetStateAction<string>>;
    handleBulkDelete: () => Promise<void>;
    handleDownload: (type: 'xlsx' | 'csv') => Promise<void>;
    handleBulkGeneratePDF_V1: () => Promise<void>; // NEW
    handleBulkGeneratePDF_V2: () => Promise<void>; // NEW
}

const QuickActionBar: React.FC<QuickActionBarProps> = ({
    isAddFormVisible,
    selectedIds,
    uniqueHospitals,
    searchQuery,
    hospitalFilter,
    isBulkGeneratingV1,
    isBulkGeneratingV2,
    setIsAddFormVisible,
    setSearchQuery,
    setHospitalFilter,
    handleBulkDelete,
    handleDownload,
    handleBulkGeneratePDF_V1,
    handleBulkGeneratePDF_V2,
}) => {
    
    // Combine loading states to disable all relevant buttons
    const isGenerating = isBulkGeneratingV1 || isBulkGeneratingV2;
    
    return (
        <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0 md:space-x-4 p-4 sm:p-5 bg-white/80 rounded-xl border border-gray-200 backdrop-blur-sm">

            {/* Left Side: Add, Search, Filter */}
            <div className="flex flex-col sm:flex-row w-full space-y-3 sm:space-y-0 sm:space-x-4">
                <button
                    onClick={() => setIsAddFormVisible(prev => !prev)}
                    className="w-full sm:w-auto px-5 py-2 text-sm font-semibold rounded-full bg-blue-600/90 text-white hover:bg-blue-700 transition duration-300 shadow-lg flex items-center justify-center transform hover:scale-[1.05] cursor-pointer"
                >
                    <Plus className="w-4 h-4 mr-2" />
                    {isAddFormVisible ? 'Hide Form' : 'Add New Data'}
                </button>

                <div className="relative w-full sm:w-64">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search Certificate, Name..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-xl bg-white/90 focus:ring-sky-500 focus:border-sky-500 transition duration-300 outline-none shadow-sm"
                    />
                </div>

                <div className="relative w-full sm:w-48">
                    <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                    <select
                        value={hospitalFilter}
                        onChange={(e) => setHospitalFilter(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-xl bg-white/90 focus:ring-sky-500 focus:border-sky-500 transition duration-300 appearance-none outline-none cursor-pointer shadow-sm"
                    >
                        <option value="">All Hospitals (Filter)</option>
                        {uniqueHospitals.map(hospital => (
                            <option key={hospital} value={hospital}>{hospital}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Right Side: Bulk Actions & Export */}
            <div className="flex space-x-3 w-full sm:w-auto justify-start sm:justify-end flex-wrap gap-2 sm:gap-3">
                
                {/* 💡 Bulk PDF Export V1 Button */}
                {selectedIds.length > 0 && (
                    <button
                        onClick={handleBulkGeneratePDF_V1}
                        disabled={isGenerating}
                        className={`px-5 py-2 text-sm font-semibold rounded-full text-white transition duration-300 shadow-lg flex items-center transform hover:scale-[1.05] cursor-pointer ${
                            isBulkGeneratingV1 
                                ? 'bg-yellow-500/70 cursor-wait' 
                                : 'bg-emerald-600/90 hover:bg-emerald-700'
                        }`}
                        title="Export Selected V1 PDFs (ZIP)"
                    >
                        {isBulkGeneratingV1 ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <FileCheck className="w-4 h-4 mr-2" />} 
                        Export {selectedIds.length} V1
                    </button>
                )}
                
                {/* 💡 Bulk PDF Export V2 Button */}
                {selectedIds.length > 0 && (
                    <button
                        onClick={handleBulkGeneratePDF_V2}
                        disabled={isGenerating}
                        className={`px-5 py-2 text-sm font-semibold rounded-full text-white transition duration-300 shadow-lg flex items-center transform hover:scale-[1.05] cursor-pointer ${
                            isBulkGeneratingV2
                                ? 'bg-yellow-500/70 cursor-wait' 
                                : 'bg-purple-600/90 hover:bg-purple-700'
                        }`}
                        title="Export Selected V2 PDFs (ZIP)"
                    >
                        {isBulkGeneratingV2 ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <FileText className="w-4 h-4 mr-2" />} 
                        Export {selectedIds.length} V2
                    </button>
                )}
                
                {/* Bulk Delete Button */}
                {selectedIds.length > 0 && (
                    <button
                        onClick={handleBulkDelete}
                        disabled={isGenerating} // Disable delete during PDF export
                        className="px-5 py-2 text-sm font-semibold rounded-full bg-red-600/90 text-white hover:bg-red-700 transition duration-300 shadow-lg flex items-center transform hover:scale-[1.05] cursor-pointer"
                    >
                        <Trash2 className="w-4 h-4 mr-2" /> Delete {selectedIds.length}
                    </button>
                )}

                {/* Export Button (Excel) */}
                <button
                    onClick={() => handleDownload('xlsx')}
                    disabled={isGenerating} // Disable excel export during PDF export
                    className="px-5 py-2 text-sm font-semibold rounded-full bg-teal-600/90 text-white hover:bg-teal-700 transition duration-300 shadow-lg flex items-center transform hover:scale-[1.05] cursor-pointer"
                >
                    <Download className="w-4 h-4 mr-2" /> Export Excel
                </button>
            </div>
        </div>
    );
};

export default QuickActionBar;