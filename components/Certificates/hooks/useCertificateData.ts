// D:\ssistudios\ssistudios\components\Certificates\hooks\useCertificateData.ts
'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import {
    ICertificateClient,
    FetchResponse,
    CertificateTableProps,
    SortConfig,
    SortKey,
    PAGE_LIMIT,
    DateFilterOption, // 💡 IMPORT NEW TYPE
} from '../utils/constants';
import { sortCertificates, getDateFilterStart } from '../utils/helpers'; // 💡 IMPORT NEW HELPER

interface UseCertificateDataResult {
    certificates: ICertificateClient[];
    isLoading: boolean;
    totalItems: number;
    currentPage: number;
    totalPages: number;
    searchQuery: string;
    hospitalFilter: string;
    dateFilter: DateFilterOption; // 💡 NEW STATE
    uniqueHospitals: string[];
    sortConfig: SortConfig | null;
    selectedIds: string[];
    fetchCertificates: () => Promise<void>;
    fetchCertificatesForExport: (isBulkPdfExport?: boolean, idsToFetch?: string[]) => Promise<ICertificateClient[]>; // MODIFIED
    setCurrentPage: React.Dispatch<React.SetStateAction<number>>;
    setSearchQuery: React.Dispatch<React.SetStateAction<string>>;
    setHospitalFilter: React.Dispatch<React.SetStateAction<string>>;
    setDateFilter: React.Dispatch<React.SetStateAction<DateFilterOption>>; // 💡 NEW SETTER
    setSelectedIds: React.Dispatch<React.SetStateAction<string[]>>;
    requestSort: (key: SortKey) => void;
    sortedCertificates: ICertificateClient[];
    setIsLoading: React.Dispatch<React.SetStateAction<boolean>>;
}

export const useCertificateData = (
    refreshKey: number,
    onRefresh: CertificateTableProps['onRefresh'],
    onAlert: CertificateTableProps['onAlert']
): UseCertificateDataResult => {
    const [certificates, setCertificates] = useState<ICertificateClient[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [totalItems, setTotalItems] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [searchQuery, setSearchQuery] = useState('');
    const [hospitalFilter, setHospitalFilter] = useState('');
    const [dateFilter, setDateFilter] = useState<DateFilterOption>('All Time'); // 💡 NEW STATE: Default to 'All Time'
    const [uniqueHospitals, setUniqueHospitals] = useState<string[]>([]);
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [sortConfig, setSortConfig] = useState<SortConfig | null>(null);

    // --- Fetch Data Logic (Paginated & Filtered) ---
    const fetchCertificates = useCallback(async () => {
        setIsLoading(true);
        const start = Date.now();
        const startDateParam = getDateFilterStart(dateFilter); // 💡 GET START DATE

        try {
            const params = new URLSearchParams({
                page: currentPage.toString(),
                limit: PAGE_LIMIT.toString(),
                q: searchQuery,
            });

            if (hospitalFilter) {
                params.append('hospital', hospitalFilter);
            }
            
            if (startDateParam) { // 💡 ADD DATE FILTER PARAM
                params.append('dateStart', startDateParam);
            }

            const response = await fetch(`/api/certificates?${params.toString()}`);
            const result: FetchResponse & { success: boolean, message?: string } = await response.json();

            if (response.ok && result.success) {
                setCertificates(result.data);
                setTotalItems(result.total);
                setTotalPages(result.totalPages);
                setUniqueHospitals(result.filters.hospitals);
                onRefresh(result.data, result.total);
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
    }, [currentPage, searchQuery, hospitalFilter, dateFilter, onRefresh, onAlert]); // 💡 ADD dateFilter DEPENDENCY

    // --- Fetch ALL Data Logic (For Export) ---
    const fetchCertificatesForExport = useCallback(async (isBulkPdfExport = false, idsToFetch: string[] = []) => { // MODIFIED SIGNATURE
        try {
            const startDateParam = getDateFilterStart(dateFilter); // 💡 GET START DATE
            
            const params = new URLSearchParams({
                q: searchQuery,
                all: 'true'
            });

            if (hospitalFilter) {
                params.append('hospital', hospitalFilter);
            }
            
            if (startDateParam) { // 💡 ADD DATE FILTER PARAM
                params.append('dateStart', startDateParam);
            }
            
            // Handle bulk export: only fetch selected IDs
            if (isBulkPdfExport && idsToFetch.length > 0) {
                 params.append('ids', idsToFetch.join(','));
                 params.delete('all'); // Do not fetch all, only fetch by IDs
                 params.delete('q'); // Search query is irrelevant if IDs are specified
            }


            const response = await fetch(`/api/certificates?${params.toString()}`);
            const result: FetchResponse & { success: boolean, message?: string } = await response.json();

            if (response.ok && result.success) {
                return result.data;
            } else {
                onAlert(result.message || 'Failed to fetch all certificates for export.', true);
                return [];
            }
        } catch (error) {
            console.error('Export fetch error:', error);
            onAlert('Network error while fetching data for export.', true);
            return [];
        }
    }, [searchQuery, hospitalFilter, dateFilter, onAlert]); // 💡 ADD dateFilter DEPENDENCY

    // Effect to fetch data on dependency changes
    useEffect(() => {
        fetchCertificates();
        // Clear selection when data is re-fetched due to filter/pagination changes
        setSelectedIds([]);
    }, [fetchCertificates, refreshKey]);

    // Effect to reset page when search/filter changes
    useEffect(() => {
        setCurrentPage(1);
    }, [searchQuery, hospitalFilter, dateFilter]); // 💡 ADD dateFilter

    // --- Sort Functionality (UNCHANGED) ---
    const sortedCertificates = useMemo(() => {
        return sortCertificates(certificates, sortConfig);
    }, [certificates, sortConfig]);

    const requestSort = (key: SortKey) => {
        let direction: 'asc' | 'desc' = 'asc';
        if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });
    };

    return {
        certificates,
        isLoading,
        totalItems,
        currentPage,
        totalPages,
        searchQuery,
        hospitalFilter,
        dateFilter, // 💡 EXPORT NEW STATE
        uniqueHospitals,
        sortConfig,
        selectedIds,
        fetchCertificates,
        fetchCertificatesForExport,
        setCurrentPage,
        setSearchQuery,
        setHospitalFilter,
        setDateFilter, // 💡 EXPORT NEW SETTER
        setSelectedIds,
        requestSort,
        sortedCertificates,
        setIsLoading,
    };
};