// D:\ssistudios\ssistudios\components\Certificates\hooks\useCertificateData.ts
'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import {
    ICertificateClient,
    FetchResponse,
    CertificateTableProps as BaseTableProps,
    SortConfig,
    SortKey,
    PAGE_LIMIT,
} from '../utils/constants';
import { sortCertificates } from '../utils/helpers';

// 💡 FIX: Define a dedicated interface for the onRefresh callback to send back uniqueHospitals
interface DataHookRefreshProps extends BaseTableProps {
    onRefresh: (data: ICertificateClient[], totalCount: number, hospitals: string[]) => void;
}

interface UseCertificateDataResult {
    certificates: ICertificateClient[];
    isLoading: boolean;
    totalItems: number;
    currentPage: number;
    totalPages: number;
    uniqueHospitals: string[];
    sortConfig: SortConfig | null;
    selectedIds: string[];
    fetchCertificates: () => Promise<void>;
    fetchCertificatesForExport: (isBulkPdfExport?: boolean, idsToFetch?: string[]) => Promise<ICertificateClient[]>;
    setCurrentPage: React.Dispatch<React.SetStateAction<number>>;
    setSelectedIds: React.Dispatch<React.SetStateAction<string[]>>;
    requestSort: (key: SortKey) => void;
    sortedCertificates: ICertificateClient[];
    setIsLoading: React.Dispatch<React.SetStateAction<boolean>>;
    // 💡 FIX: Remove internal state/setters from this result interface
}

export const useCertificateData = (
    refreshKey: number,
    onRefresh: DataHookRefreshProps['onRefresh'], // Use the 3-argument version
    onAlert: BaseTableProps['onAlert'],
    // 💡 NEW ARGS: Accept external control state for filtering
    searchQuery: string,
    hospitalFilter: string,
): UseCertificateDataResult => {
    const [certificates, setCertificates] = useState<ICertificateClient[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [totalItems, setTotalItems] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [uniqueHospitals, setUniqueHospitals] = useState<string[]>([]);
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [sortConfig, setSortConfig] = useState<SortConfig | null>(null);

    // --- Fetch Data Logic (Paginated & Filtered) ---
    const fetchCertificates = useCallback(async () => {
        setIsLoading(true);
        const start = Date.now();

        try {
            const params = new URLSearchParams({
                page: currentPage.toString(),
                limit: PAGE_LIMIT.toString(),
                q: searchQuery, // 💡 Use argument
            });

            if (hospitalFilter) { // 💡 Use argument
                params.append('hospital', hospitalFilter);
            }

            const response = await fetch(`/api/certificates?${params.toString()}`);
            const result: FetchResponse & { success: boolean, message?: string } = await response.json();

            if (response.ok && result.success) {
                setCertificates(result.data);
                setTotalItems(result.total);
                setTotalPages(result.totalPages);
                const hospitals = result.filters.hospitals || [];
                setUniqueHospitals(hospitals);
                // 💡 Pass uniqueHospitals back to the parent page component via onRefresh
                onRefresh(result.data, result.total, hospitals);
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

    // --- Fetch ALL Data Logic (For Export) ---
    const fetchCertificatesForExport = useCallback(async (isBulkPdfExport = false, idsToFetch: string[] = []) => {
        try {
            const params = new URLSearchParams({
                q: searchQuery, // 💡 Use argument
                all: 'true'
            });

            if (hospitalFilter) { // 💡 Use argument
                params.append('hospital', hospitalFilter);
            }

            if (isBulkPdfExport && idsToFetch.length > 0) {
                params.append('ids', idsToFetch.join(','));
                params.delete('all');
                params.delete('q');
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
    }, [searchQuery, hospitalFilter, onAlert]);

    // Effect to fetch data on dependency changes
    useEffect(() => {
        fetchCertificates();
        setSelectedIds([]);
    }, [fetchCertificates, refreshKey]);

    // Effect to reset page when search/filter changes
    useEffect(() => {
        setCurrentPage(1);
    }, [searchQuery, hospitalFilter]);

    // --- Sort Functionality ---
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
        uniqueHospitals,
        sortConfig,
        selectedIds,
        fetchCertificates,
        fetchCertificatesForExport,
        setCurrentPage,
        setSelectedIds,
        requestSort,
        sortedCertificates,
        setIsLoading,
        // 💡 FIX: Return dummy placeholders to satisfy the public UseCertificateDataResult interface 
        // which still expects them for compatibility with useCertificateActions.
        searchQuery: '', 
        hospitalFilter: '',
        setSearchQuery: () => {}, 
        setHospitalFilter: () => {},
    };
};