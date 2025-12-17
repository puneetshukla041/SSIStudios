// D:\ssistudios\ssistudios\components\Certificates\utils\helpers.ts

import { ICertificateClient, SortKey, SortConfig } from './constants';

// --- NEW: Name Formatting Algorithm ---
export const formatName = (name: string): string => {
    if (!name) return '';
    return name
        .toLowerCase() // Normalize to lowercase first
        .replace(/(?:^|[\s.])\w/g, (match) => match.toUpperCase()); 
        // Logic: Find character at (Start OR Space OR Dot) AND ensure it is a word char, then uppercase it.
};

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

/**
 * 💡 NEW HELPER: Defines the required column widths for Excel export.
 * Assumes the order: Certificate No., Name, Hospital, DOI.
 */
export const getCertificateColumnConfig = () => {
    return [
        { wch: 14 },
        { wch: 30 },
        { wch: 55 },
        { wch: 15 },
    ];
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