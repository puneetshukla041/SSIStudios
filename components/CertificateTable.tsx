'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import LoadingSpinner from './ui/LoadingSpinner'; 
import * as XLSX from 'xlsx';

// 1. Import new Lucide React Icons
import {
    Download,
    Save,
    X,
    Edit,
    Trash2,
    Search,
    Filter,
    ArrowUpDown, 
    BadgeCheck, 
    Square, 
    ChevronLeft, // New for professional pagination
    ChevronRight, // New for professional pagination
} from 'lucide-react';

// Extend the DB interface with the Mongoose _id for client-side use
export interface ICertificateClient {
    _id: string;
    certificateNo: string;
    name: string;
    hospital: string;
    doi: string; // DD-MM-YYYY
}

interface FetchResponse {
    data: ICertificateClient[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    filters: { hospitals: string[] };
}

interface CertificateTableProps {
    refreshKey: number; // Used to manually trigger refresh
    onRefresh: (data: ICertificateClient[]) => void;
    onAlert: (message: string, isError: boolean) => void;
}

// Helper to convert DD-MM-YYYY to YYYY-MM-DD for date input type
const doiToDateInput = (doi: string): string => {
    const parts = doi.split('-');
    return parts.length === 3 ? `${parts[2]}-${parts.length === 3 && parts[1].length === 2 ? parts[1] : '01'}-${parts[0]}` : '';
};

// Helper to convert YYYY-MM-DD from date input back to DD-MM-YYYY
const dateInputToDoi = (dateInput: string): string => {
    const parts = dateInput.split('-');
    return parts.length === 3 ? `${parts[2]}-${parts[1]}-${parts[0]}` : '';
};

// Helper to generate a consistent, PROFESSIONAL color hash for hospital names (Badges)
const getHospitalColor = (hospital: string) => {
    const colors = [
        'bg-sky-100 text-sky-800', 
        'bg-emerald-100 text-emerald-800', 
        'bg-indigo-100 text-indigo-800', 
        'bg-amber-100 text-amber-800', 
        'bg-fuchsia-100 text-fuchsia-800', 
        'bg-rose-100 text-rose-800',
        'bg-cyan-100 text-cyan-800',
        'bg-orange-100 text-orange-800',
    ];
    let hash = 0;
    for (let i = 0; i < hospital.length; i++) {
        hash = hospital.charCodeAt(i) + ((hash << 5) - hash);
    }
    const index = Math.abs(hash) % colors.length;
    return colors[index];
};


const CertificateTable: React.FC<CertificateTableProps> = ({ refreshKey, onRefresh, onAlert }) => {
    const [certificates, setCertificates] = useState<ICertificateClient[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [totalItems, setTotalItems] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [searchQuery, setSearchQuery] = useState('');
    const [hospitalFilter, setHospitalFilter] = useState('');
    const [uniqueHospitals, setUniqueHospitals] = useState<string[]>([]);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editFormData, setEditFormData] = useState<Partial<ICertificateClient>>({});
    const [selectedIds, setSelectedIds] = useState<string[]>([]); 
    const [sortConfig, setSortConfig] = useState<{ key: keyof ICertificateClient; direction: 'asc' | 'desc' } | null>(null); 
    
    // NEW State for Animation
    const [flashId, setFlashId] = useState<string | null>(null);
    const [deletingId, setDeletingId] = useState<string | null>(null);

    const limit = 10; // Fixed items per page

    const fetchCertificates = useCallback(async () => {
        setIsLoading(true);
        const start = Date.now(); 

        try {
            // NOTE: API fetch logic is mocked/assumed to be correct for context
            const params = new URLSearchParams({
                page: currentPage.toString(),
                limit: limit.toString(),
                q: searchQuery,
            });

            if (hospitalFilter) {
                params.append('hospital', hospitalFilter);
            }

            const response = await fetch(`/api/certificates?${params.toString()}`);
            const result: FetchResponse & { success: boolean, message?: string } = await response.json();

            if (response.ok && result.success) {
                setCertificates(result.data);
                setTotalItems(result.total);
                setTotalPages(result.totalPages);
                setUniqueHospitals(result.filters.hospitals);
                onRefresh(result.data);
            } else {
                onAlert(result.message || 'Failed to fetch certificates.', true);
            }
        } catch (error) {
            console.error('Fetch error:', error);
            onAlert('Network error while fetching data.', true);
        } finally {
            const duration = Date.now() - start;
            setTimeout(() => setIsLoading(false), Math.max(500 - duration, 0));
        }
    }, [currentPage, searchQuery, hospitalFilter, onRefresh, onAlert]);

    // Effect to fetch data on initial load, refreshKey change, or pagination/filter/search changes
    useEffect(() => {
        fetchCertificates();
    }, [fetchCertificates, refreshKey]);

    // Effect to reset page when search/filter changes
    useEffect(() => {
        setCurrentPage(1);
    }, [searchQuery, hospitalFilter]);

    // Effect to handle the flash animation duration
    useEffect(() => {
        if (flashId) {
            const timer = setTimeout(() => {
                setFlashId(null);
            }, 1000); // Flash for 1 second
            return () => clearTimeout(timer);
        }
    }, [flashId]);


    // --- Sort Functionality ---
    const sortedCertificates = useMemo(() => {
        let sortableItems = [...certificates];
        if (sortConfig !== null) {
            sortableItems.sort((a, b) => {
                const aValue = a[sortConfig.key];
                const bValue = b[sortConfig.key];

                if (aValue < bValue) {
                    return sortConfig.direction === 'asc' ? -1 : 1;
                }
                if (aValue > bValue) {
                    return sortConfig.direction === 'asc' ? 1 : -1;
                }
                return 0;
            });
        }
        return sortableItems;
    }, [certificates, sortConfig]);

    const requestSort = (key: keyof ICertificateClient) => {
        let direction: 'asc' | 'desc' = 'asc';
        if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });
    };

    // --- Bulk Selection & Deletion ---
    const handleSelectOne = (id: string, checked: boolean) => {
        if (checked) {
            setSelectedIds(prev => [...prev, id]);
        } else {
            setSelectedIds(prev => prev.filter(selectedId => selectedId !== id));
        }
    };

    const handleSelectAll = (checked: boolean) => {
        if (checked) {
            setSelectedIds(certificates.map(cert => cert._id));
        } else {
            setSelectedIds([]);
        }
    };

    const handleBulkDelete = async () => {
        if (selectedIds.length === 0) {
            onAlert('No certificates selected for deletion.', false);
            return;
        }

        if (!window.confirm(`Are you sure you want to delete ${selectedIds.length} certificate(s)?`)) return;

        const idsToDelete = [...selectedIds];
        setDeletingId(idsToDelete[0]); 
        
        setTimeout(async () => {
            setIsLoading(true);
            try {
                // Mocking API call
                // const response = await fetch(`/api/certificates/bulk`, { method: 'DELETE', body: JSON.stringify({ ids: idsToDelete }), });
                
                // Assuming success for demo purposes
                await new Promise(resolve => setTimeout(resolve, 500)); 

                onAlert(`${idsToDelete.length} certificate(s) deleted successfully!`, false);
                setSelectedIds([]);
                fetchCertificates();
                
            } catch (error) {
                onAlert('Network error during bulk delete.', true);
            } finally {
                setIsLoading(false);
                setDeletingId(null);
            }
        }, 300); 
    };


    // --- CRUD Operations ---

    const handleEdit = (certificate: ICertificateClient) => {
        setEditingId(certificate._id);
        setEditFormData({ ...certificate });
    };

    const handleSave = async (id: string) => {
        // Validation (simplified)
        if (!editFormData.certificateNo || !editFormData.name || !editFormData.hospital || !editFormData.doi) {
            onAlert('All fields are required.', true);
            return;
        }
        const doiRegex = /^\d{2}-\d{2}-\d{4}$/;
        if (!doiRegex.test(editFormData.doi || '')) {
            onAlert('DOI must be in DD-MM-YYYY format.', true);
            return;
        }

        try {
            // Mocking API call
            // const response = await fetch(`/api/certificates/${id}`, { method: 'PUT', body: JSON.stringify(editFormData), });
            
            // Assuming success for demo purposes
            await new Promise(resolve => setTimeout(resolve, 300));

            onAlert('Certificate updated successfully!', false);
            setEditingId(null);
            setEditFormData({});
            setFlashId(id); // Trigger flash animation
            fetchCertificates(); 
            
        } catch (error) {
            onAlert('Network error during update.', true);
        }
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm('Are you sure you want to delete this certificate?')) return;

        setDeletingId(id); // Trigger fade animation
        
        setTimeout(async () => {
            try {
                // Mocking API call
                // const response = await fetch(`/api/certificates/${id}`, { method: 'DELETE', });
                
                // Assuming success for demo purposes
                await new Promise(resolve => setTimeout(resolve, 500)); 

                onAlert('Certificate deleted successfully!', false);
                fetchCertificates(); 
                
            } catch (error) {
                onAlert('Network error during delete.', true);
            } finally {
                setDeletingId(null);
            }
        }, 300);
    };

    const handleChange = (field: keyof ICertificateClient, value: string) => {
        setEditFormData(prev => ({ ...prev, [field]: value }));
    };

    // --- Download Functionality ---
    const handleDownload = useMemo(() => {
        return (type: 'xlsx' | 'csv') => {
            if (certificates.length === 0) {
                onAlert('No data to download.', false);
                return;
            }
            
            const dataToExport = certificates.map(cert => ({
                'Certificate No.': cert.certificateNo,
                'Name': cert.name,
                'Hospital': cert.hospital,
                'DOI': cert.doi,
            }));

            const worksheet = XLSX.utils.json_to_sheet(dataToExport);
            const workbook = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(workbook, worksheet, 'Certificates');
            
            const fileName = `certificates_export.${type}`;
            XLSX.writeFile(workbook, fileName);
        };
    }, [certificates, onAlert]);


    // --- Skeleton Loader Component ---
    const SkeletonLoader = () => (
        <div className="animate-pulse space-y-4 p-6 rounded-xl shadow-lg border border-gray-200 bg-white">
            {/* Search/Filter Skeletons */}
            <div className="flex justify-between items-center space-x-4">
                <div className="h-10 bg-gray-200 rounded-lg w-1/3"></div>
                <div className="h-10 bg-gray-200 rounded-lg w-1/4"></div>
                <div className="flex space-x-2">
                    <div className="h-10 bg-gray-200 rounded-lg w-24"></div>
                    <div className="h-10 bg-gray-200 rounded-lg w-24"></div>
                </div>
            </div>
            
            {/* Table Header Skeleton */}
            <div className="h-10 bg-gray-100 rounded-lg"></div>
            
            {/* Table Body Skeletons */}
            {Array(limit).fill(0).map((_, index) => (
                <div key={index} className="grid grid-cols-5 gap-4 py-3 border-b border-gray-100 last:border-b-0">
                    <div className="h-4 bg-gray-200 rounded col-span-1"></div>
                    <div className="h-4 bg-gray-200 rounded col-span-1"></div>
                    <div className="h-4 bg-gray-200 rounded col-span-1"></div>
                    <div className="h-4 bg-gray-200 rounded col-span-1"></div>
                    <div className="h-4 bg-gray-200 rounded col-span-1"></div>
                </div>
            ))}
            {/* Pagination Skeleton */}
            <div className="flex justify-between items-center pt-4">
                <div className="h-4 bg-gray-200 rounded w-48"></div>
                <div className="flex space-x-2">
                    <div className="h-8 w-16 bg-gray-200 rounded-md"></div>
                    <div className="h-8 w-10 bg-slate-700 rounded-md"></div>
                    <div className="h-8 w-16 bg-gray-200 rounded-md"></div>
                </div>
            </div>
        </div>
    );


    // --- Render Logic ---

    if (isLoading) {
        return <SkeletonLoader />;
    }

    const Pagination = () => (
        <div className="flex flex-col sm:flex-row justify-end items-center mt-4 p-2">
            {/* REMOVED: Showing **1** to **10** of **19** entries */}
            <div className="flex space-x-1 border border-gray-200 rounded-lg p-1 shadow-inner bg-gray-50">
                <button
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                    className="p-2 text-sm font-medium rounded-lg bg-white text-slate-700 hover:bg-gray-100 disabled:text-gray-400 disabled:hover:bg-white transition cursor-pointer flex items-center"
                    aria-label="Previous Page"
                >
                    <ChevronLeft className="w-4 h-4 mr-1" />
                    Previous
                </button>
                {/* Render a few page numbers for better navigation */}
                {Array.from({ length: totalPages }, (_, i) => i + 1)
                    .filter(page => page === 1 || page === totalPages || (page >= currentPage - 1 && page <= currentPage + 1))
                    .map(page => (
                        <button
                            key={page}
                            onClick={() => setCurrentPage(page)}
                            className={`px-3 py-1 text-sm font-medium rounded-lg transition cursor-pointer ${
                                page === currentPage
                                    ? 'bg-slate-700 text-white shadow-md'
                                    : 'bg-white text-gray-700 hover:bg-gray-100'
                            }`}
                        >
                            {page}
                        </button>
                    ))
                }
                {totalPages > 3 && currentPage < totalPages - 1 && (
                    <span className="px-3 py-1 text-sm text-gray-500">...</span>
                )}
                <button
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages || totalPages === 0}
                    className="p-2 text-sm font-medium rounded-lg bg-white text-slate-700 hover:bg-gray-100 disabled:text-gray-400 disabled:hover:bg-white transition cursor-pointer flex items-center"
                    aria-label="Next Page"
                >
                    Next 
                    <ChevronRight className="w-4 h-4 ml-1" />
                </button>
            </div>
        </div>
    );

    const getSortIndicator = (key: keyof ICertificateClient) => {
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
        <div className="space-y-6">
            
            {/* Search, Filter, and Bulk Actions Controls */}
            <div className="flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0 sm:space-x-4 p-5 bg-white rounded-xl shadow-lg border border-gray-100">
                
                <div className="relative w-full sm:w-1/3">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search Certificate, Name, Hospital..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg bg-white focus:ring-slate-500 focus:border-slate-500 transition duration-200 outline-none hover:border-slate-400 shadow-sm"
                    />
                </div>

                <div className="relative w-full sm:w-1/4">
                    <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                    <select
                        value={hospitalFilter}
                        onChange={(e) => setHospitalFilter(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg bg-white focus:ring-slate-500 focus:border-slate-500 transition duration-200 appearance-none outline-none hover:border-slate-400 cursor-pointer shadow-sm"
                    >
                        <option value="">All Hospitals (Filter)</option>
                        {uniqueHospitals.map(hospital => (
                            <option key={hospital} value={hospital}>{hospital}</option>
                        ))}
                    </select>
                </div>
                
                <div className="flex space-x-3">
                    {/* Bulk Delete Button - Retained red for danger action */}
                    {selectedIds.length > 0 && (
                        <button
                            onClick={handleBulkDelete}
                            className="px-4 py-2 text-sm font-semibold rounded-lg bg-red-600 text-white hover:bg-red-700 transition duration-200 shadow-md flex items-center transform hover:scale-[1.02] cursor-pointer"
                        >
                            <Trash2 className="w-4 h-4 mr-2" /> Delete {selectedIds.length}
                        </button>
                    )}

                    {/* Export Buttons - Changed to professional slate/teal colors */}
                    <button
                        onClick={() => handleDownload('xlsx')}
                        className="px-4 py-2 text-sm font-semibold rounded-lg bg-teal-600 text-white hover:bg-teal-700 transition duration-200 shadow-md flex items-center transform hover:scale-[1.02] cursor-pointer"
                    >
                        <Download className="w-4 h-4 mr-2" /> Export Excel
                    </button>
                    <button
                        onClick={() => handleDownload('csv')}
                        className="px-4 py-2 text-sm font-semibold rounded-lg bg-sky-600 text-white hover:bg-sky-700 transition duration-200 shadow-md flex items-center transform hover:scale-[1.02] cursor-pointer"
                    >
                        <Download className="w-4 h-4 mr-2" /> Export CSV
                    </button>
                </div>
            </div>

            {/* Selection Summary Notification - Updated color to professional slate */}
            {selectedIds.length > 0 && (
                <div className="p-3 bg-slate-100 border-l-4 border-slate-700 text-slate-800 rounded-lg shadow-md flex items-center justify-between transition duration-300">
                    <div className="flex items-center">
                        <BadgeCheck className="w-5 h-5 mr-3 flex-shrink-0 text-slate-700" />
                        <span className="font-medium">
                            **{selectedIds.length}** certificates selected for action.
                        </span>
                    </div>
                </div>
            )}


            {sortedCertificates.length === 0 ? (
                <div className="text-center p-12 bg-white rounded-xl shadow-lg border-2 border-dashed border-gray-300">
                    <p className="text-gray-500 text-xl font-medium">
                        No certificates found.
                    </p>
                    <p className="text-gray-400 mt-2">
                        Try adjusting your search criteria or uploading new data to the system.
                    </p>
                </div>
            ) : (
                <>
                    {/* ENHANCED TABLE LOOK - Excel style with clear lines and subtle shadow */}
                    <div className="overflow-x-auto rounded-xl shadow-xl border border-gray-300">
                        <table 
                            className="min-w-full bg-white"
                            style={{ borderCollapse: 'collapse' }} 
                        >
                            <thead className="bg-gray-50"> 
                                <tr>
                                    {/* Checkbox Header for Select All */}
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
                                                <BadgeCheck className="w-5 h-5 text-slate-700" />
                                            ) : (
                                                <Square className="w-5 h-5 text-gray-400" />
                                            )}
                                        </label>
                                    </th>
                                    {/* Table Headers with Sorting */}
                                    {(['certificateNo', 'name', 'hospital', 'doi'] as (keyof ICertificateClient)[]).map((fieldKey) => (
                                        <th
                                            key={fieldKey}
                                            onClick={() => requestSort(fieldKey)}
                                            className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition duration-150 whitespace-nowrap border-b border-r border-gray-300"
                                        >
                                            <div className="flex items-center">
                                                {fieldKey === 'doi' ? 'Date of Issue' : fieldKey.charAt(0).toUpperCase() + fieldKey.slice(1).replace(/([A-Z])/g, ' $1')}
                                                {getSortIndicator(fieldKey)}
                                            </div>
                                        </th>
                                    ))}
                                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider border-b border-gray-300">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200"> 
                                {sortedCertificates.map((cert) => {
                                    const isSelected = selectedIds.includes(cert._id);
                                    const isEditing = editingId === cert._id;
                                    
                                    // Animation Classes
                                    const isFlashing = flashId === cert._id;
                                    const isDeleting = deletingId === cert._id || (deletingId && isSelected); 

                                    // Flat white background, relying on hover/selection for feedback
                                    const rowClasses = `
                                        transition-all duration-300 ease-in-out bg-white
                                        ${isDeleting ? 'opacity-0 transform translate-x-1/2 scale-x-95 pointer-events-none h-0' : ''}
                                        ${isFlashing ? 'bg-emerald-50/70 shadow-lg' : ''} 
                                        hover:bg-gray-50 hover:shadow-sm
                                        ${isSelected && !isFlashing ? 'bg-slate-50' : ''}
                                    `;

                                    return (
                                        <tr 
                                            key={cert._id} 
                                            className={rowClasses}
                                            style={{ transitionProperty: 'opacity, transform, background-color, box-shadow' }} 
                                        >
                                            {/* Checkbox for individual selection */}
                                            <td className="px-3 py-3 text-center whitespace-nowrap w-12 border-r border-gray-200">
                                                <label className="cursor-pointer flex items-center justify-center">
                                                    <input
                                                        type="checkbox"
                                                        className="hidden"
                                                        checked={isSelected}
                                                        onChange={(e) => handleSelectOne(cert._id, e.target.checked)}
                                                        aria-label={`Select certificate ${cert.certificateNo}`}
                                                    />
                                                    {isSelected ? (
                                                        <BadgeCheck className="w-5 h-5 text-slate-700" />
                                                    ) : (
                                                        <Square className="w-5 h-5 text-gray-400" />
                                                    )}
                                                </label>
                                            </td>
                                            
                                            {/* Data Cells */}
                                            {['certificateNo', 'name', 'hospital', 'doi'].map((fieldKey) => {
                                                const field = fieldKey as keyof ICertificateClient;
                                                
                                                return (
                                                    <td key={field} className="px-6 py-3 whitespace-nowrap text-sm text-gray-800 border-r border-gray-200">
                                                        {isEditing ? (
                                                            <input
                                                                type={field === 'doi' ? 'date' : 'text'}
                                                                value={field === 'doi' ? doiToDateInput(editFormData[field] as string || '') : editFormData[field] as string}
                                                                onChange={(e) => handleChange(field, field === 'doi' ? dateInputToDoi(e.target.value) : e.target.value)}
                                                                // Streamlined edit field for cleaner look
                                                                className="w-full p-1 border border-sky-300 rounded-md focus:ring-1 focus:ring-sky-500 transition duration-150 shadow-inner bg-white text-gray-800"
                                                                aria-label={`Edit ${fieldKey}`}
                                                            />
                                                        ) : field === 'hospital' ? (
                                                            // Hospital Badge using professional colors
                                                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${getHospitalColor(cert.hospital)}`}>
                                                                {cert.hospital}
                                                            </span>
                                                        ) : (
                                                            // @ts-ignore
                                                            cert[field]
                                                        )}
                                                    </td>
                                                );
                                            })}

                                            {/* Action Buttons */}
                                            <td className="px-6 py-3 whitespace-nowrap text-sm font-medium">
                                                {isEditing ? (
                                                    <div className="flex space-x-2">
                                                        <button
                                                            onClick={() => handleSave(cert._id)}
                                                            className="text-white bg-green-600 hover:bg-green-700 p-2 rounded-full w-9 h-9 flex items-center justify-center transition transform hover:scale-110 shadow-md cursor-pointer" 
                                                            title="Save"
                                                            aria-label="Save changes"
                                                        >
                                                            <Save className="w-5 h-5" />
                                                        </button>
                                                        <button
                                                            onClick={() => setEditingId(null)}
                                                            className="text-white bg-gray-500 hover:bg-gray-600 p-2 rounded-full w-9 h-9 flex items-center justify-center transition transform hover:scale-110 shadow-md cursor-pointer" 
                                                            title="Cancel"
                                                            aria-label="Cancel editing"
                                                        >
                                                            <X className="w-5 h-5" />
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <div className="flex space-x-2">
                                                        <button
                                                            onClick={() => handleEdit(cert)}
                                                            className="text-slate-700 hover:text-white bg-slate-100 hover:bg-slate-700 p-2 rounded-full w-9 h-9 flex items-center justify-center transition transform hover:scale-110 cursor-pointer" 
                                                            title="Edit"
                                                            aria-label="Edit certificate"
                                                        >
                                                            <Edit className="w-5 h-5" />
                                                        </button>
                                                        <button
                                                            onClick={() => handleDelete(cert._id)}
                                                            className="text-red-600 hover:text-white bg-red-100 hover:bg-red-600 p-2 rounded-full w-9 h-9 flex items-center justify-center transition transform hover:scale-110 cursor-pointer" 
                                                            title="Delete"
                                                            aria-label="Delete certificate"
                                                        >
                                                            <Trash2 className="w-5 h-5" />
                                                        </button>
                                                    </div>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                    <Pagination />
                </>
            )}
        </div>
    );
};

export default CertificateTable;