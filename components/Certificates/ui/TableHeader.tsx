// D:\ssistudios\ssistudios\components\Certificates\ui\TableHeader.tsx

import React from 'react';
import {
    ArrowUpDown,
    BadgeCheck,
    Square,
} from 'lucide-react';
import { ICertificateClient, SortConfig, SortKey } from '../utils/constants';

interface TableHeaderProps {
    certificates: ICertificateClient[];
    selectedIds: string[];
    sortConfig: SortConfig | null;
    requestSort: (key: SortKey) => void;
    handleSelectAll: (checked: boolean) => void;
}

const TableHeader: React.FC<TableHeaderProps> = ({
    certificates,
    selectedIds,
    sortConfig,
    requestSort,
    handleSelectAll,
}) => {
    const getSortIndicator = (key: SortKey) => {
        if (!sortConfig || sortConfig.key !== key) {
            return <ArrowUpDown className="w-4 h-4 ml-1 text-gray-400" />;
        }
        return (
            <span className="ml-1 text-slate-700">
                {sortConfig.direction === 'asc' ? '↑' : '↓'}
            </span>
        );
    };

    return (
        <thead className="bg-gray-50/80">
            <tr>
                {/* Checkbox Header for Select All: Fixed narrow width */}
                <th className="px-3 py-3 text-center text-xs font-bold text-gray-700 uppercase tracking-wider w-12 border-b border-r border-gray-300">
                    <label className="cursor-pointer flex items-center justify-center">
                        <input
                            type="checkbox"
                            className="hidden"
                            checked={selectedIds.length === certificates.length && certificates.length > 0}
                            onChange={(e) => handleSelectAll(e.target.checked)}
                            aria-label="Select All"
                        />
                        {selectedIds.length === certificates.length && certificates.length > 0 ? (
                            <BadgeCheck className="w-5 h-5 text-sky-600" />
                        ) : (
                            <Square className="w-5 h-5 text-gray-400" />
                        )}
                    </label>
                </th>
                {/* Table Headers with Sorting */}
                {(['certificateNo', 'name', 'hospital', 'doi'] as SortKey[]).map((fieldKey) => (
                    <th
                        key={fieldKey}
                        onClick={() => requestSort(fieldKey)}
                        className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-100/90 transition duration-150 whitespace-nowrap border-b border-r border-gray-300 min-w-[120px]"
                    >
                        <div className="flex items-center">
                            {fieldKey === 'doi' ? 'Date of Issue' : fieldKey.charAt(0).toUpperCase() + fieldKey.slice(1).replace(/([A-Z])/g, ' $1')}
                            {getSortIndicator(fieldKey)}
                        </div>
                    </th>
                ))}
                <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider border-b border-gray-300 min-w-[250px]">
                    Actions
                </th>
            </tr>
        </thead>
    );
};

export default TableHeader;