import React from 'react';
import { ArrowUp, ArrowDown, ArrowUpDown, CheckSquare, Minus } from 'lucide-react';
import { ICertificateClient, SortConfig, SortKey } from '../utils/constants';

interface TableHeaderProps {
    certificates: ICertificateClient[];
    selectedIds: string[];
    sortConfig: SortConfig | null;
    requestSort: (key: SortKey) => void;
    handleSelectAll: (checked: boolean) => void;
}

const TableHeader: React.FC<TableHeaderProps> = ({
    certificates, selectedIds, sortConfig, requestSort, handleSelectAll,
}) => {
    const isAllSelected = certificates.length > 0 && certificates.every(cert => selectedIds.includes(cert._id));
    const isIndeterminate = selectedIds.length > 0 && !isAllSelected;

    const toggleSelectAll = () => { handleSelectAll(!isAllSelected); };

    const headerItems: { label: string; key: SortKey | null; sortable: boolean; align?: string }[] = [
        { label: 'S. No.', key: null, sortable: false, align: 'center' },
        { label: 'Certificate No.', key: 'certificateNo', sortable: true },
        { label: 'Name', key: 'name', sortable: true },
        { label: 'Hospital', key: 'hospital', sortable: true },
        { label: 'DOI', key: 'doi', sortable: true },
    ];

    return (
        // HIDDEN ON MOBILE: Use 'hidden md:table-header-group'
        <thead className="hidden md:table-header-group bg-gray-50/50 backdrop-blur-sm sticky top-0 z-[1]">
            <tr>
                {/* Select All */}
                <th scope="col" className="w-14 px-4 py-3.5 border-b border-gray-200/80">
                    <div className="flex items-center justify-center">
                        <button
                            onClick={toggleSelectAll}
                            className={`group relative flex h-5 w-5 items-center justify-center rounded-[5px] border transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 ${
                                isAllSelected || isIndeterminate ? 'bg-blue-600 border-blue-600 shadow-sm' : 'bg-white border-gray-300 hover:border-blue-400'
                            }`}
                        >
                            {isAllSelected && <CheckSquare className="h-3.5 w-3.5 text-white" strokeWidth={3} />}
                            {isIndeterminate && <Minus className="h-3.5 w-3.5 text-white" strokeWidth={4} />}
                        </button>
                    </div>
                </th>

                {/* Columns */}
                {headerItems.map((item) => {
                    const isSorted = sortConfig?.key === item.key;
                    const sortDirection = sortConfig?.direction;

                    return (
                        <th
                            key={item.label}
                            scope="col"
                            onClick={item.sortable ? () => requestSort(item.key as SortKey) : undefined}
                            className={`px-4 py-3.5 text-xs font-semibold uppercase tracking-wider text-gray-500 border-b border-gray-200/80 select-none ${
                                item.sortable ? 'cursor-pointer group hover:bg-gray-100/50 transition-colors' : 'cursor-default'
                            }`}
                        >
                            <div className={`flex items-center gap-2 ${item.align === 'center' ? 'justify-center' : 'justify-start'}`}>
                                <span className={`${isSorted ? 'text-blue-700 font-bold' : 'group-hover:text-gray-700'}`}>
                                    {item.label}
                                </span>
                                {item.sortable && (
                                    <span className="flex items-center">
                                        {isSorted ? (
                                            sortDirection === 'asc' ? <ArrowUp className="h-3.5 w-3.5 text-blue-600" /> : <ArrowDown className="h-3.5 w-3.5 text-blue-600" />
                                        ) : (
                                            <ArrowUpDown className="h-3.5 w-3.5 text-gray-300 opacity-0 transition-opacity group-hover:opacity-100" />
                                        )}
                                    </span>
                                )}
                            </div>
                        </th>
                    );
                })}
                {/* Reduced Width for cleaner look */}
                <th scope="col" className="px-4 py-3.5 text-right text-xs font-semibold uppercase tracking-wider text-gray-500 border-b border-gray-200/80 w-24">
                    Actions
                </th>
            </tr>
        </thead>
    );
};

export default TableHeader;