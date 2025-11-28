import React from 'react';
import { Download, Filter, Plus, Trash2, Search, X } from 'lucide-react';

interface Props {
  isAddFormVisible: boolean;
  setIsAddFormVisible: (v: boolean) => void;
  designationFilter: string;
  setDesignationFilter: (v: string) => void;
  uniqueDesignations: string[];
  selectedIds: string[];
  handleBulkDelete: () => void;
  handleDownload: () => void;
  isGenerating: boolean;
  searchQuery: string;
  setSearchQuery: (v: string) => void;
}

const QuickActionBar: React.FC<Props> = ({
  isAddFormVisible, setIsAddFormVisible, designationFilter, setDesignationFilter,
  uniqueDesignations, selectedIds, handleBulkDelete, handleDownload, isGenerating,
  searchQuery, setSearchQuery
}) => {
  return (
    <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-sm flex flex-col xl:flex-row gap-4 sticky top-4 z-20">
      
      {/* 1. Search Area */}
      <div className="relative flex-1 group">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-slate-400 group-focus-within:text-indigo-600 transition-colors duration-200" />
        </div>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="block w-full h-12 pl-12 pr-10 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-700 placeholder-slate-400 focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all outline-none"
          placeholder="Search by name, email, or phone..."
        />
        {searchQuery && (
          <button 
            onClick={() => setSearchQuery('')} 
            className="absolute inset-y-0 right-3 flex items-center text-slate-400 hover:text-rose-500 cursor-pointer transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* 2. Filters & Actions */}
      <div className="flex flex-col sm:flex-row gap-3 xl:w-auto w-full">
        
        {/* Filter Dropdown */}
        <div className="relative min-w-[200px]">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
            <Filter className="h-4 w-4 text-slate-500" />
          </div>
          <select
            value={designationFilter}
            onChange={(e) => setDesignationFilter(e.target.value)}
            className="block w-full h-12 pl-10 pr-10 bg-white border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 hover:border-indigo-300 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none appearance-none cursor-pointer transition-all hover:bg-slate-50 shadow-sm"
          >
            <option value="">All Roles</option>
            {uniqueDesignations.map(d => <option key={d} value={d}>{d}</option>)}
          </select>
          {/* Custom Arrow */}
          <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none">
            <svg className="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
          </div>
        </div>

        <div className="w-px h-12 bg-slate-200 hidden xl:block mx-1"></div>

        {/* Action Buttons */}
        <div className="flex gap-2">
           {selectedIds.length > 0 && (
            <button 
              onClick={handleBulkDelete}
              disabled={isGenerating}
              className="h-12 px-5 rounded-xl bg-rose-50 text-rose-600 border border-rose-200 hover:bg-rose-100 hover:border-rose-300 hover:shadow-md font-bold transition-all active:scale-95 flex items-center justify-center whitespace-nowrap cursor-pointer"
            >
              <Trash2 className="w-4 h-4 mr-2" /> Delete ({selectedIds.length})
            </button>
          )}

          <button 
            onClick={handleDownload}
            className="h-12 px-5 rounded-xl bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 hover:border-slate-300 hover:text-indigo-600 hover:shadow-md font-semibold transition-all active:scale-95 flex items-center justify-center whitespace-nowrap cursor-pointer"
          >
            <Download className="w-4 h-4 mr-2" /> Export
          </button>

          <button
            onClick={() => setIsAddFormVisible(!isAddFormVisible)}
            className={`h-12 px-6 rounded-xl font-bold transition-all duration-200 active:scale-95 flex items-center justify-center shadow-lg whitespace-nowrap border cursor-pointer ${
              isAddFormVisible 
                ? 'bg-slate-800 text-white border-slate-800 hover:bg-slate-900 shadow-slate-900/20' 
                : 'bg-indigo-600 text-white border-indigo-600 hover:bg-indigo-700 shadow-indigo-500/30 hover:shadow-indigo-500/50'
            }`}
          >
            <Plus className={`w-5 h-5 mr-2 transition-transform duration-300 ${isAddFormVisible ? 'rotate-45' : ''}`} /> 
            {isAddFormVisible ? 'Close' : 'Add New'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default QuickActionBar;