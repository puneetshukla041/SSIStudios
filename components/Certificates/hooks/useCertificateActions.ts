import { useState } from 'react';
import * as XLSX from 'xlsx';
import { ICertificateClient, CertificateTableProps, initialNewCertificateState, NotificationType } from '../utils/constants';
import { getTodayDoi, sortCertificates } from '../utils/helpers';
import { generateCertificatePDF } from '../utils/pdfGenerator';

// Set today's date for the initial new certificate state
const initialNewCertificate = {
    ...initialNewCertificateState,
    doi: getTodayDoi(),
};

// Define the required type for the imported PDF generation function
type GeneratePDFType = (
    certData: ICertificateClient,
    onAlert: (message: string, isError: boolean) => void,
    template: 'certificate1.pdf' | 'certificate2.pdf',
    setLoadingId: React.Dispatch<React.SetStateAction<string | null>> | React.Dispatch<React.SetStateAction<boolean>>,
    isBulk?: boolean
) => Promise<{ filename: string, blob: Blob } | null>;

// Cast the imported function to the new type
const generateCertificatePDFTyped = generateCertificatePDF as unknown as GeneratePDFType;

interface UseCertificateActionsProps {
    certificates: ICertificateClient[];
    selectedIds: string[];
    setSelectedIds: React.Dispatch<React.SetStateAction<string[]>>;
    fetchCertificates: (resetPage?: boolean) => Promise<void>;
    fetchCertificatesForExport: (isBulkPdfExport?: boolean, idsToFetch?: string[]) => Promise<ICertificateClient[]>;
    showNotification: (message: string, type: NotificationType) => void;
    onAlert: CertificateTableProps['onAlert'];
    setIsLoading: React.Dispatch<React.SetStateAction<boolean>>;
}

interface UseCertificateActionsResult {
    editingId: string | null;
    editFormData: Partial<ICertificateClient>;
    isAddFormVisible: boolean;
    newCertificateData: Omit<ICertificateClient, '_id'>;
    isAdding: boolean;
    flashId: string | null;
    deletingId: string | null;
    generatingPdfId: string | null;
    generatingPdfV1Id: string | null;
    isBulkGeneratingV1: boolean;
    isBulkGeneratingV2: boolean;
    setEditingId: React.Dispatch<React.SetStateAction<string | null>>;
    setEditFormData: React.Dispatch<React.SetStateAction<Partial<ICertificateClient>>>;
    setIsAddFormVisible: React.Dispatch<React.SetStateAction<boolean>>;
    setNewCertificateData: React.Dispatch<React.SetStateAction<Omit<ICertificateClient, '_id'>>>;
    setFlashId: React.Dispatch<React.SetStateAction<string | null>>;
    handleSelectOne: (id: string, checked: boolean) => void;
    handleSelectAll: (checked: boolean) => void;
    handleBulkDelete: () => Promise<void>;
    handleEdit: (certificate: ICertificateClient) => void;
    handleSave: (id: string) => Promise<void>;
    handleDelete: (id: string) => Promise<void>;
    handleChange: (field: keyof ICertificateClient, value: string) => void;
    handleAddCertificate: () => Promise<void>;
    handleNewCertChange: (field: keyof Omit<ICertificateClient, '_id'>, value: string) => void;
    handleDownload: (type: 'xlsx' | 'csv') => Promise<void>;
    handleGeneratePDF_V1: (cert: ICertificateClient) => void;
    handleGeneratePDF_V2: (cert: ICertificateClient) => void;
    handleBulkGeneratePDF_V1: () => Promise<void>;
    handleBulkGeneratePDF_V2: () => Promise<void>;
}

// --- Helper: Sanitize Filename ---
// Removes special characters to prevent file system errors
const sanitizeFilename = (name: string) => {
    return name.replace(/[^a-z0-9]/gi, '_').replace(/_{2,}/g, '_').toLowerCase();
};

// --- Helper: Individual File Download ---
const triggerFileDownload = (blob: Blob, filename: string) => {
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
};

export const useCertificateActions = ({
    certificates,
    selectedIds,
    setSelectedIds,
    fetchCertificates,
    fetchCertificatesForExport,
    showNotification,
    onAlert: oldOnAlert,
    setIsLoading,
}: UseCertificateActionsProps): UseCertificateActionsResult => {
    // Edit States
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editFormData, setEditFormData] = useState<Partial<ICertificateClient>>({});

    // Add States
    const [isAddFormVisible, setIsAddFormVisible] = useState(false);
    const [newCertificateData, setNewCertificateData] = useState(initialNewCertificate);
    const [isAdding, setIsAdding] = useState(false);

    // UI/Animation States
    const [flashId, setFlashId] = useState<string | null>(null);
    const [deletingId, setDeletingId] = useState<string | null>(null);
    const [generatingPdfId, setGeneratingPdfId] = useState<string | null>(null);
    const [generatingPdfV1Id, setGeneratingPdfV1Id] = useState<string | null>(null);

    // For Bulk PDF Generation
    const [isBulkGeneratingV1, setIsBulkGeneratingV1] = useState(false);
    const [isBulkGeneratingV2, setIsBulkGeneratingV2] = useState(false);


    // --- Selection Handlers ---
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

    // --- Delete Handlers ---
    const handleBulkDelete = async () => {
        if (selectedIds.length === 0) {
            showNotification('No certificates selected for deletion.', 'info');
            return;
        }

        if (!window.confirm(`Are you sure you want to delete ${selectedIds.length} certificate(s)?`)) return;

        const idsToDelete = [...selectedIds];
        setDeletingId(idsToDelete[0]);

        setTimeout(async () => {
            setIsLoading(true);
            try {
                const response = await fetch(`/api/certificates/bulk`, {
                    method: 'DELETE',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ ids: idsToDelete }),
                });

                const result = await response.json();

                if (!response.ok || !result.success) {
                    throw new Error(result.message || 'Failed to perform bulk delete.');
                }

                showNotification(`${idsToDelete.length} certificate(s) deleted successfully!`, 'success');
                setSelectedIds([]);

            } catch (error: any) {
                showNotification(error.message || 'Network error during bulk delete.', 'error');
            } finally {
                setDeletingId(null);
                fetchCertificates();
                setIsLoading(false);
            }
        }, 300);
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm('Are you sure you want to delete this certificate?')) return;

        setDeletingId(id);

        setTimeout(async () => {
            try {
                const response = await fetch(`/api/certificates/${id}`, { method: 'DELETE' });
                const result = await response.json();

                if (!response.ok || !result.success) {
                    throw new Error(result.message || 'Failed to delete certificate.');
                }

                showNotification('Certificate deleted successfully!', 'success');
            } catch (error: any) {
                showNotification(error.message || 'Network error during delete.', 'error');
            } finally {
                setDeletingId(null);
                fetchCertificates();
            }
        }, 300);
    };

    // --- Edit Handlers ---
    const handleEdit = (certificate: ICertificateClient) => {
        setEditingId(certificate._id);
        setEditFormData({ ...certificate });
    };

    const handleSave = async (id: string) => {
        if (!editFormData.certificateNo || !editFormData.name || !editFormData.hospital || !editFormData.doi) {
            showNotification('All fields are required.', 'error');
            return;
        }

        try {
            const response = await fetch(`/api/certificates/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(editFormData),
            });

            const result = await response.json();

            if (!response.ok || !result.success) {
                throw new Error(result.message || 'Failed to update certificate.');
            }

            showNotification('Certificate updated successfully!', 'success');
            setEditingId(null);
            setEditFormData({});
            setFlashId(id);
            fetchCertificates();

        } catch (error: any) {
            showNotification(error.message || 'Network error during update.', 'error');
        }
    };

    const handleChange = (field: keyof ICertificateClient, value: string) => {
        setEditFormData(prev => ({ ...prev, [field]: value }));
    };


    // --- Add Handlers ---
    const handleAddCertificate = async () => {
        if (isAdding) return;

        if (!newCertificateData.certificateNo || !newCertificateData.name || !newCertificateData.hospital || !newCertificateData.doi) {
            showNotification('All fields are required for the new certificate.', 'error');
            return;
        }

        setIsAdding(true);
        const newIdPlaceholder = `temp-${Date.now()}`;

        try {
            const response = await fetch(`/api/certificates`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newCertificateData),
            });

            const result = await response.json();

            if (!response.ok || !result.success) {
                throw new Error(result.message || 'Failed to create certificate.');
            }

            showNotification(`Certificate ${newCertificateData.certificateNo} added successfully!`, 'success');
            setFlashId(result.data._id || newIdPlaceholder);
            setNewCertificateData(initialNewCertificate);
            setIsAddFormVisible(false);
            fetchCertificates(true);

        } catch (error: any) {
            showNotification(error.message || 'Network error during certificate creation.', 'error');
        } finally {
            setIsAdding(false);
        }
    };

    const handleNewCertChange = (field: keyof Omit<ICertificateClient, '_id'>, value: string) => {
        setNewCertificateData(prev => ({ ...prev, [field]: value }));
    };

    // --- PDF Generation Handlers ---
    const handleGeneratePDF_V2 = (cert: ICertificateClient) => {
        if (generatingPdfId === cert._id) return;
        generateCertificatePDF(cert, oldOnAlert, 'certificate2.pdf', setGeneratingPdfId);
    };

    const handleGeneratePDF_V1 = (cert: ICertificateClient) => {
        if (generatingPdfV1Id === cert._id) return;
        generateCertificatePDF(cert, oldOnAlert, 'certificate1.pdf', setGeneratingPdfV1Id);
    };

    // --- UPDATED: Bulk PDF Generation (V1) - Individual Files ---
    const handleBulkGeneratePDF_V1 = async () => {
        if (selectedIds.length === 0 || isBulkGeneratingV1) {
            showNotification('Select certificates for bulk export (V1).', 'info');
            return;
        }

        setIsBulkGeneratingV1(true);
        showNotification(`Preparing ${selectedIds.length} Proctorship certificates...`, 'info');

        try {
            let selectedCertificates = await fetchCertificatesForExport(true, selectedIds);
            
            // FAIL-SAFE: Filter again client-side to ensure we ONLY have what was selected.
            // This prevents the issue where the fetch might return ALL records if passing IDs fails.
            selectedCertificates = selectedCertificates.filter(cert => selectedIds.includes(cert._id));

            if (selectedCertificates.length === 0) {
                throw new Error('Could not retrieve selected data for bulk V1 export.');
            }

            // Generate Blobs
            const pdfPromises = selectedCertificates.map(cert =>
                generateCertificatePDFTyped(cert, oldOnAlert, 'certificate1.pdf', setIsBulkGeneratingV1 as any, true)
            );

            const results = await Promise.all(pdfPromises);
            let successCount = 0;

            // Sequential Download Loop to avoid browser blocking
            for (let i = 0; i < results.length; i++) {
                const result = results[i];
                // Match result to the original certificate to get correct name data
                const certData = selectedCertificates[i]; 

                if (result && result.blob) {
                    // FORMAT: name_hospitalname.pdf
                    const safeName = sanitizeFilename(certData.name);
                    const safeHospital = sanitizeFilename(certData.hospital);
                    const filename = `${safeName}_${safeHospital}.pdf`;

                    triggerFileDownload(result.blob, filename);
                    successCount++;

                    // Small delay between downloads to prevent browser from blocking multiple popups
                    await new Promise(resolve => setTimeout(resolve, 500));
                }
            }

            if (successCount > 0) {
                showNotification(`Downloaded ${successCount} certificates individually.`, 'success');
                setSelectedIds([]);
            } else {
                showNotification('PDF generation failed.', 'error');
            }

        } catch (error: any) {
            showNotification(`Bulk Generation failed: ${error.message}`, 'error');
        } finally {
            setIsBulkGeneratingV1(false);
        }
    };

    // --- UPDATED: Bulk PDF Generation (V2) - Individual Files ---
    const handleBulkGeneratePDF_V2 = async () => {
        if (selectedIds.length === 0 || isBulkGeneratingV2) {
            showNotification('Select certificates for bulk export (V2).', 'info');
            return;
        }

        setIsBulkGeneratingV2(true);
        showNotification(`Preparing ${selectedIds.length} Training certificates...`, 'info');

        try {
            let selectedCertificates = await fetchCertificatesForExport(true, selectedIds);
            
            // FAIL-SAFE: Filter again client-side to ensure we ONLY have what was selected.
            selectedCertificates = selectedCertificates.filter(cert => selectedIds.includes(cert._id));

            if (selectedCertificates.length === 0) {
                throw new Error('Could not retrieve selected data for bulk V2 export.');
            }

            // Generate Blobs
            const pdfPromises = selectedCertificates.map(cert =>
                generateCertificatePDFTyped(cert, oldOnAlert, 'certificate2.pdf', setIsBulkGeneratingV2 as any, true)
            );

            const results = await Promise.all(pdfPromises);
            let successCount = 0;

            // Sequential Download Loop
            for (let i = 0; i < results.length; i++) {
                const result = results[i];
                const certData = selectedCertificates[i];

                if (result && result.blob) {
                    // FORMAT: name_hospitalname.pdf
                    const safeName = sanitizeFilename(certData.name);
                    const safeHospital = sanitizeFilename(certData.hospital);
                    const filename = `${safeName}_${safeHospital}.pdf`;

                    triggerFileDownload(result.blob, filename);
                    successCount++;

                    // Small delay between downloads
                    await new Promise(resolve => setTimeout(resolve, 500));
                }
            }

            if (successCount > 0) {
                showNotification(`Downloaded ${successCount} certificates individually.`, 'success');
                setSelectedIds([]);
            } else {
                showNotification('PDF generation failed.', 'error');
            }

        } catch (error: any) {
            showNotification(`Bulk Generation failed: ${error.message}`, 'error');
        } finally {
            setIsBulkGeneratingV2(false);
        }
    };

    // --- Export Handler ---
    const handleDownload = async (type: 'xlsx' | 'csv') => {
        showNotification('Fetching all filtered records for export, please wait...', 'info');

        const allCertificates = await fetchCertificatesForExport();

        if (allCertificates.length === 0) {
            showNotification('No data found for the current filter/search criteria to export.', 'info');
            return;
        }

        // Sort by Newest First
        const sortedExportData = sortCertificates(allCertificates, { key: '_id', direction: 'desc' });

        const dataToExport = sortedExportData.map((cert, index) => ({
            'S. No.': index + 1,
            'Certificate No.': cert.certificateNo,
            'Name': cert.name,
            'Hospital': cert.hospital,
            'DOI': cert.doi,
        }));

        const worksheet = XLSX.utils.json_to_sheet(dataToExport);

        if (type === 'xlsx') {
            const exportColumnConfig = [
                { wch: 8 },   // S. No.
                { wch: 18 }, // Certificate No.
                { wch: 30 }, // Name
                { wch: 55 }, // Hospital
                { wch: 15 }, // DOI
            ];
            worksheet['!cols'] = exportColumnConfig;
        }

        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Certificates');

        const fileName = `certificates_export.${type}`;
        XLSX.writeFile(workbook, fileName);

        showNotification(`Successfully exported ${allCertificates.length} records to ${fileName}.`, 'success');
    };


    return {
        editingId,
        editFormData,
        isAddFormVisible,
        newCertificateData,
        isAdding,
        flashId,
        deletingId,
        generatingPdfId,
        generatingPdfV1Id,
        isBulkGeneratingV1,
        isBulkGeneratingV2,
        setEditingId,
        setEditFormData,
        setIsAddFormVisible,
        setNewCertificateData,
        setFlashId,
        handleSelectOne,
        handleSelectAll,
        handleBulkDelete,
        handleEdit,
        handleSave,
        handleDelete,
        handleChange,
        handleAddCertificate,
        handleNewCertChange,
        handleDownload,
        handleGeneratePDF_V1,
        handleGeneratePDF_V2,
        handleBulkGeneratePDF_V1,
        handleBulkGeneratePDF_V2,
    };
};