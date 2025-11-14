'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import {
    ICertificateClient,
    FetchResponse,
    CertificateTableProps,
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
    // searchQuery, hospitalFilter, setSearchQuery, setHospitalFilter are removed from this result type
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

export const useCertificateData = (
    refreshKey: number,
    onRefresh: (data: ICertificateClient[], totalCount: number) => void,
    showNotification: (message: string, type: NotificationType) => void,
    // 💡 NEW PROPS: Received from the parent (CertificateDatabasePage)
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
    // ❌ REMOVED: [searchQuery, setSearchQuery]
    // ❌ REMOVED: [hospitalFilter, setHospitalFilter]
    const [uniqueHospitals, setUniqueHospitals] = useState<string[]>([]);
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [sortConfig, setSortConfig] = useState<SortConfig | null>(null);

    // --- Fetch Data Logic (Paginated & Filtered) ---
    const fetchCertificates = useCallback(async (resetPage: boolean = false) => {
        setIsLoading(true);
        
        // 💡 FIX: Resetting page only if the query/filter has changed, not just if fetch is called
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
                onRefresh(result.data, result.total);
                
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
    }, [currentPage, searchQuery, hospitalFilter, onRefresh, showNotification]); // searchQuery and hospitalFilter are dependencies

    // --- Fetch ALL Data Logic (For Export) ---
    const fetchCertificatesForExport = useCallback(async (isBulkPdfExport = false, idsToFetch: string[] = []) => {
        try {
            const params = new URLSearchParams({
                q: searchQuery, // Use external searchQuery
                all: 'true'
            });

            if (hospitalFilter) { // Use external hospitalFilter
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

    // 💡 MODIFIED Effect: Only reset page when search/filter CHANGES, then fetch data
    useEffect(() => {
        setSelectedIds([]);
        if (currentPage !== 1) {
            // When search/filter changes, reset to page 1 which triggers a fetch via the first useEffect's dependency on currentPage.
            setCurrentPage(1); 
        } else {
            // If already on page 1, manually trigger fetch
            fetchCertificates();
        }
    }, [searchQuery, hospitalFilter]); 


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