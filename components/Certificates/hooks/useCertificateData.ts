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
    isCreating: boolean;
    totalItems: number;
    currentPage: number;
    totalPages: number;
    uniqueHospitals: string[];
    sortConfig: SortConfig | null;
    selectedIds: string[];
    fetchCertificates: (resetPage?: boolean) => Promise<void>;
    fetchCertificatesForExport: (isBulkPdfExport?: boolean, idsToFetch?: string[]) => Promise<ICertificateClient[]>;
    createCertificate: (data: Omit<ICertificateClient, '_id'>) => Promise<boolean>;
    deleteCertificate: (id: string) => Promise<boolean>;
    updateCertificate: (id: string, data: Partial<ICertificateClient>) => Promise<boolean>; // <--- Added Type
    setCurrentPage: React.Dispatch<React.SetStateAction<number>>;
    setSelectedIds: React.Dispatch<React.SetStateAction<string[]>>;
    requestSort: (key: SortKey) => void;
    sortedCertificates: ICertificateClient[];
    setIsLoading: React.Dispatch<React.SetStateAction<boolean>>;
}

export const useCertificateData = (
    refreshKey: number,
    onRefresh: (data: ICertificateClient[], totalCount: number, uniqueHospitalsList: string[]) => void,
    showNotification: (message: string, type: NotificationType) => void,
    searchQuery: string,
    hospitalFilter: string,
    setSearchQuery: React.Dispatch<React.SetStateAction<string>>,
    setHospitalFilter: React.Dispatch<React.SetStateAction<string>>
): UseCertificateDataResult => {
    // Data State
    const [certificates, setCertificates] = useState<ICertificateClient[]>([]);
    const [totalItems, setTotalItems] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [uniqueHospitals, setUniqueHospitals] = useState<string[]>([]);
    
    // UI State
    const [isLoading, setIsLoading] = useState(true);
    const [isCreating, setIsCreating] = useState(false);
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [sortConfig, setSortConfig] = useState<SortConfig | null>({ key: '_id', direction: 'desc' });

    // --- 1. Fetch Data Logic ---
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
            if (hospitalFilter) params.append('hospital', hospitalFilter);

            const response = await fetch(`/api/certificates?${params.toString()}`);
            const result: FetchResponse & { success: boolean, message?: string } = await response.json();

            if (response.ok && result.success) {
                setCertificates(result.data);
                setTotalItems(result.total);
                setTotalPages(result.totalPages);
                setUniqueHospitals(result.filters.hospitals);
                onRefresh(result.data, result.total, result.filters.hospitals);
            } else {
                showNotification(result.message || 'Failed to fetch certificates.', 'error');
                onRefresh([], 0, []); 
            }
        } catch (error) {
            console.error('Fetch error:', error);
            showNotification('Network error while fetching data.', 'error');
            onRefresh([], 0, []);
        } finally {
            const duration = Date.now() - start;
            setTimeout(() => setIsLoading(false), Math.max(100 - duration, 0));
        }
    }, [currentPage, searchQuery, hospitalFilter, onRefresh, showNotification]);

    // --- 2. CREATE Logic ---
    const createCertificate = useCallback(async (newData: Omit<ICertificateClient, '_id'>): Promise<boolean> => {
        setIsCreating(true);
        try {
            const response = await fetch('/api/certificates', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newData),
            });
            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.message || "Failed to add certificate");
            }

            showNotification("Certificate added successfully!", "success");
            await fetchCertificates(false); 
            return true;
        } catch (error: any) {
            console.error("Create error:", error);
            showNotification(error.message || "Failed to create certificate", "error");
            return false;
        } finally {
            setIsCreating(false);
        }
    }, [fetchCertificates, showNotification]);

    // --- 3. UPDATE Logic (NEW) ---
    const updateCertificate = useCallback(async (id: string, data: Partial<ICertificateClient>): Promise<boolean> => {
        // We don't set global isLoading to true to prevent full table flicker, 
        // the row handles its own loading state via the actions hook
        try {
            const response = await fetch(`/api/certificates/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });
            
            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.message || "Failed to update certificate");
            }

            return true;
        } catch (error: any) {
            console.error("Update error:", error);
            showNotification(error.message || "Failed to update certificate", "error");
            return false;
        }
    }, [showNotification]);

    // --- 4. DELETE Logic ---
    const deleteCertificate = useCallback(async (id: string): Promise<boolean> => {
        try {
            const response = await fetch(`/api/certificates/${id}`, {
                method: 'DELETE',
            });
            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.message || "Failed to delete certificate");
            }
            return true;
        } catch (error: any) {
            console.error("Delete error:", error);
            showNotification(error.message || "Failed to delete certificate", "error");
            return false;
        }
    }, [showNotification]);

    // --- 5. Export Logic ---
    const fetchCertificatesForExport = useCallback(async (isBulkPdfExport = false, idsToFetch: string[] = []) => {
        try {
            const params = new URLSearchParams({ q: searchQuery, all: 'true' });
            if (hospitalFilter) params.append('hospital', hospitalFilter);
            if (isBulkPdfExport && idsToFetch.length > 0) {
                params.append('ids', idsToFetch.join(','));
                params.delete('q');
            }
            const response = await fetch(`/api/certificates?${params.toString()}`);
            const result = await response.json();
            return response.ok && result.success ? result.data : [];
        } catch (error) {
            console.error('Export error:', error);
            return [];
        }
    }, [searchQuery, hospitalFilter]);

    // --- Effects ---
    useEffect(() => {
        fetchCertificates();
        setSelectedIds([]);
    }, [fetchCertificates, refreshKey]);

    useEffect(() => {
        setSelectedIds([]);
        if (currentPage !== 1) setCurrentPage(1);
    }, [searchQuery, hospitalFilter]);

    // --- Sorting ---
    const sortedCertificates = useMemo(() => sortCertificates(certificates, sortConfig), [certificates, sortConfig]);
    const requestSort = (key: SortKey) => {
        let direction: 'asc' | 'desc' = 'asc';
        if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') direction = 'desc';
        setSortConfig({ key, direction });
    };

    return {
        certificates,
        isLoading,
        isCreating,
        createCertificate,
        deleteCertificate,
        updateCertificate, // <--- Exported here
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