// D:\ssistudios\ssistudios\components\Certificates\hooks\useCertificateData.ts

import { useState, useEffect, useCallback, useMemo } from 'react';
import {
    ICertificateClient,
    FetchResponse,
    SortConfig,
    SortKey,
    PAGE_LIMIT,
    NotificationType,
} from '../utils/constants';
import { sortCertificates } from '../utils/helpers';

interface UseCertificateDataResult {
    certificates: ICertificateClient[];
    isLoading: boolean;
    totalItems: number;
    currentPage: number;
    totalPages: number;
    uniqueHospitals: string[];
    sortConfig: SortConfig | null;
    selectedIds: string[];
    fetchCertificates: (resetPage?: boolean) => Promise<void>;
    fetchCertificatesForExport: (isBulkPdfExport?: boolean, idsToFetch?: string[]) => Promise<ICertificateClient[]>;
    setCurrentPage: React.Dispatch<React.SetStateAction<number>>;
    setSelectedIds: React.Dispatch<React.SetStateAction<string[]>>;
    requestSort: (key: SortKey) => void;
    sortedCertificates: ICertificateClient[];
    setIsLoading: React.Dispatch<React.SetStateAction<boolean>>;
}

// FIX: onRefresh signature updated to include uniqueHospitalsList
export const useCertificateData = (
    refreshKey: number,
    onRefresh: (data: ICertificateClient[], totalCount: number, uniqueHospitalsList: string[]) => void,
    showNotification: (message: string, type: NotificationType) => void,
    // PROPS: Received from the parent (CertificateDatabasePage)
    searchQuery: string,
    hospitalFilter: string,
    setSearchQuery: React.Dispatch<React.SetStateAction<string>>,
    setHospitalFilter: React.Dispatch<React.SetStateAction<string>>
): UseCertificateDataResult => {
    const [certificates, setCertificates] = useState<ICertificateClient[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [totalItems, setTotalItems] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [uniqueHospitals, setUniqueHospitals] = useState<string[]>([]);
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    // 🚀 FIX 1: Set default sort to '_id' in 'desc' order (Newest First)
    const [sortConfig, setSortConfig] = useState<SortConfig | null>({ key: '_id', direction: 'desc' });

    // --- Fetch Data Logic (Paginated & Filtered) ---
    const fetchCertificates = useCallback(async (resetPage: boolean = false) => {
        setIsLoading(true);

        let pageToFetch = currentPage;
        if (resetPage) {
            setCurrentPage(1);
            pageToFetch = 1;
        }

        const start = Date.now();

        try {
            const params = new URLSearchParams({
                page: pageToFetch.toString(),
                limit: PAGE_LIMIT.toString(),
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
                // FIX: Pass uniqueHospitals to onRefresh callback
                onRefresh(result.data, result.total, result.filters.hospitals);

                const message = `Data synced. Showing ${result.data.length} of ${result.total} items.`;
                showNotification(message, 'success');
            } else {
                showNotification(result.message || 'Failed to fetch certificates.', 'error');
            }
        } catch (error) {
            console.error('Fetch error:', error);
            showNotification('Network error while fetching data.', 'error');
        } finally {
            const duration = Date.now() - start;
            setTimeout(() => setIsLoading(false), Math.max(100 - duration, 0));
        }
    }, [currentPage, searchQuery, hospitalFilter, onRefresh, showNotification]);

    // --- Fetch ALL Data Logic (For Export) ---
    const fetchCertificatesForExport = useCallback(async (isBulkPdfExport = false, idsToFetch: string[] = []) => {
        try {
            const params = new URLSearchParams({
                q: searchQuery,
                all: 'true'
            });

            if (hospitalFilter) {
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
                showNotification(result.message || 'Failed to fetch all certificates for export.', 'error');
                return [];
            }
        } catch (error) {
            console.error('Export fetch error:', error);
            showNotification('Network error while fetching data for export.', 'error');
            return [];
        }
    }, [searchQuery, hospitalFilter, showNotification]);

    // Effect to fetch data on initial load, page change, or refreshKey change
    useEffect(() => {
        fetchCertificates();
        setSelectedIds([]);
    }, [fetchCertificates, refreshKey]);

    // MODIFIED Effect: Only reset page when search/filter CHANGES, then fetch data
    useEffect(() => {
        setSelectedIds([]);
        if (currentPage !== 1) {
            setCurrentPage(1);
        } else {
            fetchCertificates();
        }
    }, [searchQuery, hospitalFilter]);


    // --- Sort Functionality (UNCHANGED) ---
    const sortedCertificates = useMemo(() => {
        // This will now use the default sortConfig: { key: '_id', direction: 'desc' }
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
    };
};