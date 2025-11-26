import React from 'react';
import { Download, Filter, Plus, Trash2, Moon, Sun, Loader2 } from 'lucide-react';

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
}

const QuickActionBar: React.FC<Props> = ({
  isAddFormVisible,
  setIsAddFormVisible,
  designationFilter,
  setDesignationFilter,
  uniqueDesignations,
  selectedIds,
  handleBulkDelete,
  handleDownload,
  isGenerating
}) => {
  return (
    <div className="flex flex-col md:flex-row justify-between items-center gap-4 p-5 bg-white rounded-2xl border border-slate-200 shadow-sm">
      
      {/* Left: Add & Filter */}
      <div className="flex flex-col sm:flex-row w-full gap-4">
        <button
          onClick={() => setIsAddFormVisible(!isAddFormVisible)}
          className={`px-5 py-2.5 rounded-xl font-semibold transition flex items-center justify-center border ${
            isAddFormVisible 
              ? 'bg-slate-100 text-slate-700 border-slate-200' 
              : 'bg-blue-600 text-white border-blue-600 hover:bg-blue-700'
          }`}
        >
          <Plus className="w-4 h-4 mr-2" /> {isAddFormVisible ? 'Hide Form' : 'Add Card'}
        </button>

        <div className="relative w-full sm:w-64">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
          <select
            value={designationFilter}
            onChange={(e) => setDesignationFilter(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none appearance-none cursor-pointer text-slate-600 text-sm"
          >
            <option value="">All Designations</option>
            {uniqueDesignations.map(d => <option key={d} value={d}>{d}</option>)}
          </select>
        </div>
      </div>

      {/* Right: Actions */}
      <div className="flex gap-3 w-full sm:w-auto justify-end">
        {selectedIds.length > 0 && (
          <button 
            onClick={handleBulkDelete}
            disabled={isGenerating}
            className="px-5 py-2.5 rounded-xl bg-red-50 text-red-600 border border-red-100 hover:bg-red-100 font-medium transition flex items-center"
          >
            <Trash2 className="w-4 h-4 mr-2" /> Delete ({selectedIds.length})
          </button>
        )}
        
        <button 
          onClick={handleDownload}
          className="px-5 py-2.5 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 font-semibold transition flex items-center"
        >
          <Download className="w-4 h-4 mr-2" /> Excel
        </button>
      </div>
    </div>
  );
};

export default QuickActionBar;