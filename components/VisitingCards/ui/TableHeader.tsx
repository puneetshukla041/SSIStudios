import React from 'react';
import { ArrowUpDown } from 'lucide-react';
import { SortConfig, SortKey } from '../utils/constants';

interface Props {
  onSort: (key: SortKey) => void;
  sortConfig: SortConfig | null;
  onSelectAll: (checked: boolean) => void;
  allSelected: boolean;
}

const TableHeader: React.FC<Props> = ({ onSort, sortConfig, onSelectAll, allSelected }) => {
  const headers: { key: SortKey, label: string }[] = [
    { key: 'firstName', label: 'First Name' },
    { key: 'lastName', label: 'Last Name' },
    { key: 'designation', label: 'Designation' },
    { key: 'phone', label: 'Phone' },
    { key: 'email', label: 'Email' },
  ];

  return (
    <thead className="bg-slate-50 border-b border-slate-200">
      <tr>
        <th className="px-6 py-4 w-16 text-center">
          <input 
            type="checkbox" 
            checked={allSelected}
            onChange={(e) => onSelectAll(e.target.checked)}
            className="w-5 h-5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer shadow-sm transition-all"
          />
        </th>
        {headers.map(({ key, label }) => (
          <th 
            key={key}
            onClick={() => onSort(key)}
            className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider cursor-pointer hover:bg-slate-100 hover:text-indigo-600 transition-colors select-none group"
          >
            <div className="flex items-center gap-2">
              {label}
              <ArrowUpDown className={`w-3.5 h-3.5 transition-colors ${sortConfig?.key === key ? 'text-indigo-600' : 'text-slate-300 group-hover:text-indigo-400'}`} />
            </div>
          </th>
        ))}
        <th className="px-6 py-4 text-right text-xs font-bold text-slate-500 uppercase tracking-wider">
          Actions
        </th>
      </tr>
    </thead>
  );
};

export default TableHeader;