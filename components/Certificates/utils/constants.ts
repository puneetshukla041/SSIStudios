// D:\ssistudios\ssistudios\components\Certificates\utils\constants.ts
// --- Interfaces & Types ---

export interface ICertificateClient {
    _id: string;
    certificateNo: string;
    name: string;
    hospital: string;
    doi: string; // DD-MM-YYYY
}

export interface FetchResponse {
    data: ICertificateClient[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    filters: { hospitals: string[] };
}

export interface CertificateTableProps {
    refreshKey: number;
    onRefresh: (data: ICertificateClient[], totalCount: number) => void;
    onAlert: (message: string, isError: boolean) => void; // Kept for legacy compatibility (pdfGenerator)
}

export type SortKey = keyof ICertificateClient;

export interface SortConfig {
    key: SortKey;
    direction: 'asc' | 'desc';
}

// 💡 NEW: Notification Types
export type NotificationType = "success" | "error" | "info";
export interface NotificationState {
    message: string;
    type: NotificationType;
    active: boolean;
}


// --- Constants ---

// Default limit for pagination
export const PAGE_LIMIT = 10;

// Initial State for New Certificate Form
export const initialNewCertificateState: Omit<ICertificateClient, '_id'> = {
    certificateNo: '',
    name: '',
    hospital: '',
    doi: '', // Will be set to today's date in helpers
};