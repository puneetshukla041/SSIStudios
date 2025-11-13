// D:\ssistudios\ssistudios\components\Certificates\ui\TableHeader.tsx (ASSUMED FILE)

import React from 'react';
import { ChevronUp, ChevronDown, Square, BadgeCheck } from 'lucide-react';
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
    // Check if all displayed certificates are selected
    const allSelected = certificates.length > 0 && certificates.every(cert => selectedIds.includes(cert._id));
    
    // Toggle state for select all/none
    const toggleSelectAll = () => {
        handleSelectAll(!allSelected);
    };

    const getSortIcon = (key: SortKey) => {
        if (!sortConfig || sortConfig.key !== key) return null;
        return sortConfig.direction === 'asc' ? <ChevronUp className="w-3 h-3 ml-1" /> : <ChevronDown className="w-3 h-3 ml-1" />;
    };

    const headerItems: { label: string; key: SortKey | null; sortable: boolean }[] = [
        { label: 'S. No.', key: null, sortable: false }, // 💡 NEW: Serial No. column
        { label: 'Certificate No.', key: 'certificateNo', sortable: true },
        { label: 'Name', key: 'name', sortable: true },
        { label: 'Hospital', key: 'hospital', sortable: true },
        { label: 'DOI', key: 'doi', sortable: true },
    ];

    return (
        <thead className="bg-gray-50 border-b border-gray-300">
            <tr>
                {/* Checkbox Header */}
                <th scope="col" className="px-3 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-12 border-r border-gray-300">
                    <label className="cursor-pointer flex items-center justify-center">
                        <input
                            type="checkbox"
                            className="hidden"
                            checked={allSelected}
                            onChange={toggleSelectAll}
                            aria-label="Select all certificates"
                        />
                        {allSelected && certificates.length > 0 ? (
                            <BadgeCheck className="w-5 h-5 text-sky-600" />
                        ) : (
                            <Square className="w-5 h-5 text-gray-400" />
                        )}
                    </label>
                </th>

                {/* Data Headers */}
                {headerItems.map(item => (
                    <th
                        key={item.label}
                        scope="col"
                        className={`px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider ${item.key ? 'cursor-pointer hover:bg-gray-100 transition-colors' : ''} border-r border-gray-300 last:border-r-0`}
                        onClick={item.sortable ? () => requestSort(item.key as SortKey) : undefined}
                    >
                        <div className="flex items-center">
                            {item.label}
                            {item.sortable && getSortIcon(item.key as SortKey)}
                        </div>
                    </th>
                ))}

                {/* Actions Header */}
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-40">
                    Actions
                </th>
            </tr>
        </thead>
    );
};

export default TableHeader;