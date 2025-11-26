import React from 'react';
import { ArrowUpDown } from 'lucide-react';
import { IVisitingCardClient, SortConfig, SortKey } from '../utils/constants';

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
    <thead className="bg-slate-50/80 border-b border-slate-200">
      <tr>
        <th className="px-4 py-4 w-12 text-center">
          <input 
            type="checkbox" 
            checked={allSelected}
            onChange={(e) => onSelectAll(e.target.checked)}
            className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
          />
        </th>
        {headers.map(({ key, label }) => (
          <th 
            key={key}
            onClick={() => onSort(key)}
            className="px-4 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider cursor-pointer hover:bg-slate-100 transition select-none"
          >
            <div className="flex items-center">
              {label}
              <ArrowUpDown className={`w-3 h-3 ml-1.5 ${sortConfig?.key === key ? 'text-blue-600' : 'text-slate-300'}`} />
            </div>
          </th>
        ))}
        <th className="px-4 py-4 text-right text-xs font-bold text-slate-500 uppercase tracking-wider">Actions</th>
      </tr>
    </thead>
  );
};

export default TableHeader;