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
    onRefresh: (data: ICertificateClient[], totalCount: number, uniqueHospitalsList: string[]) => void;
    onAlert: (message: string, isError: boolean) => void;
}

export type SortKey = keyof ICertificateClient;

export interface SortConfig {
    key: SortKey;
    direction: 'asc' | 'desc';
}

export type NotificationType = "success" | "error" | "info";
export interface NotificationState {
    message: string;
    type: NotificationType;
    active: boolean;
}

// --- Constants ---

export const PAGE_LIMIT = 10;

export const initialNewCertificateState: Omit<ICertificateClient, '_id'> = {
    certificateNo: '',
    name: '',
    hospital: '',
    doi: '',
};

// --- Dropdown Options for Certificate Actions ---

export const CERTIFICATE_TYPES = [
    { label: 'External', value: 'external' },
    { label: 'Internal', value: 'internal' },
    { label: 'Others (100+)', value: 'others_100' }, // ✅ Added New Option
];

export const CERTIFICATE_TEMPLATES = {
    external: [
        { label: 'Proctorship', value: 'proctorship', color: 'blue' },
        { label: 'Training', value: 'training', color: 'teal' },
    ],
    internal: [
        { label: 'Employee of Month', value: 'eom', color: 'purple' },
        { label: 'Others', value: 'others', color: 'amber' },
    ],
    others_100: [
        { label: 'Standard 100+', value: 'standard_100', color: 'rose' } // ✅ Added Config
    ]
};