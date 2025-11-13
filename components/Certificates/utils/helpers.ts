// D:\ssistudios\ssistudios\components\Certificates\utils\helpers.ts

import { ICertificateClient, SortKey, SortConfig, DateFilterOption } from './constants'; // 💡 Import DateFilterOption

// Helper to convert DD-MM-YYYY to YYYY-MM-DD for date input type
export const doiToDateInput = (doi: string): string => {
    const parts = doi.split('-');
    return parts.length === 3 ? `${parts[2]}-${parts.length === 3 && parts[1].length === 2 ? parts[1] : '01'}-${parts[0]}` : '';
};

// Helper to convert YYYY-MM-DD from date input back to DD-MM-YYYY
export const dateInputToDoi = (dateInput: string): string => {
    const parts = dateInput.split('-');
    return parts.length === 3 ? `${parts[2]}-${parts[1]}-${parts[0]}` : '';
};

// Helper to get today's date in DD-MM-YYYY format
export const getTodayDoi = (): string => {
    return dateInputToDoi(new Date().toISOString().slice(0, 10));
};

// 💡 NEW HELPER: Calculates the start date (YYYY-MM-DD) for a given date filter option
export const getDateFilterStart = (filter: DateFilterOption): string | null => {
    if (filter === 'All Time') {
        return null;
    }
    
    // Use the start of today for consistent range calculation
    const today = new Date();
    today.setHours(0, 0, 0, 0); 
    
    let startDate = new Date(today.getTime());

    if (filter === 'Last 7 Days') {
        // Subtract 6 days to include today (7-day range: today + 6 previous days)
        startDate.setDate(today.getDate() - 6); 
    } else if (filter === 'Last 30 Days') {
        // Subtract 29 days
        startDate.setDate(today.getDate() - 29);
    } else if (filter === 'Last 90 Days') {
        // Subtract 89 days
        startDate.setDate(today.getDate() - 89);
    } else if (filter === 'Last 365 Days') {
        // Subtract 364 days
        startDate.setDate(today.getDate() - 364);
    } 
    // If filter is 'Today', startDate remains 'today'

    // Convert the start date to YYYY-MM-DD format for API consumption
    return startDate.toISOString().split('T')[0];
};

// Helper to generate a consistent, PROFESSIONAL color hash for hospital names (Badges)
export const getHospitalColor = (hospital: string): string => {
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

// Helper for sorting
export const sortCertificates = (
    certificates: ICertificateClient[],
    sortConfig: SortConfig | null
): ICertificateClient[] => {
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
};