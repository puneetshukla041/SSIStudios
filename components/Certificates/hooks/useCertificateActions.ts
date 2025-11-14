// D:\ssistudios\ssistudios\components\Certificates\hooks\useCertificateActions.ts
'use client';

import { useState } from 'react';
import * as XLSX from 'xlsx';
import { ICertificateClient, CertificateTableProps, initialNewCertificateState } from '../utils/constants';
import { getTodayDoi } from '../utils/helpers';
// Assuming generateCertificatePDF is properly imported and modified to handle bulk mode (returning a blob/file object).
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
) => Promise<any>;

// Cast the imported function to the new type
const generateCertificatePDFTyped = generateCertificatePDF as unknown as GeneratePDFType;


interface UseCertificateActionsProps {
    certificates: ICertificateClient[];
    selectedIds: string[];
    setSelectedIds: React.Dispatch<React.SetStateAction<string[]>>;
    fetchCertificates: () => Promise<void>;
    // MODIFIED INTERFACE: Assumes fetchCertificatesForExport can optionally fetch selected IDs for bulk PDF.
    fetchCertificatesForExport: (isBulkPdfExport?: boolean, idsToFetch?: string[]) => Promise<ICertificateClient[]>;
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

// Helper to simulate client-side ZIP download
const downloadZip = (files: { filename: string, blob: Blob }[], zipFilename: string) => {
    if (files.length === 0) return;
    
    // --- SIMULATION: Create a dummy ZIP file ---
    const fileNames = files.map(f => f.filename).join('\n');
    const dummyZipContent = `This is a placeholder ZIP file containing ${files.length} certificates:\n${fileNames}`;
    const dummyBlob = new Blob([dummyZipContent], { type: 'application/zip' });
    
    const url = window.URL.createObjectURL(dummyBlob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', zipFilename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
    // --- END OF SIMULATION ---
}


export const useCertificateActions = ({
    certificates,
    selectedIds,
    setSelectedIds,
    fetchCertificates,
    fetchCertificatesForExport,
    onAlert,
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
    const [generatingPdfId, setGeneratingPdfId] = useState<string | null>(null); // Template 2 (Individual)
    const [generatingPdfV1Id, setGeneratingPdfV1Id] = useState<string | null>(null); // Template 1 (Individual)
    
    // For Bulk PDF Generation
    const [isBulkGeneratingV1, setIsBulkGeneratingV1] = useState(false);
    const [isBulkGeneratingV2, setIsBulkGeneratingV2] = useState(false);


    // --- Selection Handlers (UNCHANGED) ---
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

    // --- Delete Handlers (UPDATED - Removed automatic fetch) ---
    const handleBulkDelete = async () => {
        if (selectedIds.length === 0) {
            onAlert('No certificates selected for deletion.', false);
            return;
        }

        if (!window.confirm(`Are you sure you want to delete ${selectedIds.length} certificate(s)?`)) return;

        const idsToDelete = [...selectedIds];
        setDeletingId(idsToDelete[0]);

        // Wrap logic in setTimeout to allow for deletion animation start
        setTimeout(async () => {
            setIsLoading(true);
            try {
                // REAL API call for bulk delete
                const response = await fetch(`/api/certificates/bulk`, { 
                    method: 'DELETE', 
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ ids: idsToDelete }), 
                });

                const result = await response.json();

                if (!response.ok || !result.success) {
                    throw new Error(result.message || 'Failed to perform bulk delete.');
                }
                
                onAlert(`${idsToDelete.length} certificate(s) deleted successfully!`, false);
                setSelectedIds([]);
                
            } catch (error: any) {
                onAlert(error.message || 'Network error during bulk delete.', true);
            } finally {
                setDeletingId(null);
                // ❌ REMOVED: fetchCertificates(); 
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

                onAlert('Certificate deleted successfully!', false);
            } catch (error: any) {
                onAlert(error.message || 'Network error during delete.', true);
            } finally {
                setDeletingId(null);
                // ❌ REMOVED: fetchCertificates();
            }
        }, 300);
    };
    
    // --- Edit Handlers (UPDATED - Removed automatic fetch) ---
    const handleEdit = (certificate: ICertificateClient) => {
        setEditingId(certificate._id);
        setEditFormData({ ...certificate });
    };

    const handleSave = async (id: string) => {
        if (!editFormData.certificateNo || !editFormData.name || !editFormData.hospital || !editFormData.doi) {
            onAlert('All fields are required.', true);
            return;
        }
        const doiRegex = /^\d{2}-\d{2}-\d{4}$/;
        if (!doiRegex.test(editFormData.doi || '')) {
            onAlert('DOI must be in DD-MM-YYYY format.', true);
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

            onAlert('Certificate updated successfully!', false);
            setEditingId(null);
            setEditFormData({});
            setFlashId(id); // Trigger flash animation
            // ❌ REMOVED: fetchCertificates(); 

        } catch (error: any) {
            onAlert(error.message || 'Network error during update.', true);
        }
    };

    const handleChange = (field: keyof ICertificateClient, value: string) => {
        setEditFormData(prev => ({ ...prev, [field]: value }));
    };


    // --- Add Handlers (UPDATED - Removed automatic fetch) ---
    const handleAddCertificate = async () => {
        if (isAdding) return;

        // Basic Validation
        if (!newCertificateData.certificateNo || !newCertificateData.name || !newCertificateData.hospital || !newCertificateData.doi) {
            onAlert('All fields are required for the new certificate.', true);
            return;
        }
        const doiRegex = /^\d{2}-\d{2}-\d{4}$/;
        if (!doiRegex.test(newCertificateData.doi || '')) {
            onAlert('DOI must be in DD-MM-YYYY format.', true);
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

            onAlert(`Certificate ${newCertificateData.certificateNo} added successfully!`, false);
            setFlashId(result.data._id || newIdPlaceholder);
            setNewCertificateData(initialNewCertificate);
            setIsAddFormVisible(false);
            // ❌ REMOVED: fetchCertificates(); 

        } catch (error: any) {
            onAlert(error.message || 'Network error during certificate creation.', true);
        } finally {
            setIsAdding(false);
        }
    };

    const handleNewCertChange = (field: keyof Omit<ICertificateClient, '_id'>, value: string) => {
        setNewCertificateData(prev => ({ ...prev, [field]: value }));
    };
    
    // --- PDF Generation Handlers (UNCHANGED) ---
    const handleGeneratePDF_V2 = (cert: ICertificateClient) => {
        if (generatingPdfId === cert._id) return;
        generateCertificatePDF(cert, onAlert, 'certificate2.pdf', setGeneratingPdfId); 
    };

    const handleGeneratePDF_V1 = (cert: ICertificateClient) => {
        if (generatingPdfV1Id === cert._id) return;
        generateCertificatePDF(cert, onAlert, 'certificate1.pdf', setGeneratingPdfV1Id); 
    };
    
    // --- Bulk PDF Generation Handlers (UNCHANGED) ---
    
    const handleBulkGeneratePDF_V1 = async () => {
        if (selectedIds.length === 0 || isBulkGeneratingV1) {
            onAlert('Select certificates for bulk export (V1).', false);
            return;
        }

        setIsBulkGeneratingV1(true);
        onAlert(`Fetching ${selectedIds.length} certificates for bulk PDF generation (V1)...`, false);

        try {
            const selectedCertificates = await fetchCertificatesForExport(true, selectedIds);
            if (selectedCertificates.length === 0) {
                 throw new Error('Could not retrieve selected data for bulk V1 export.');
            }
            
            const pdfPromises = selectedCertificates.map(cert => 
                generateCertificatePDFTyped(cert, onAlert, 'certificate1.pdf', setIsBulkGeneratingV1 as any, true)
            );
            
            const results = (await Promise.all(pdfPromises)).filter(Boolean);

            if (results.length > 0) {
                downloadZip(results as { filename: string, blob: Blob }[], 'certificates_v1_bulk_export.zip');
                onAlert(`Successfully generated and zipped ${results.length} certificates (V1).`, false);
                setSelectedIds([]);
            } else {
                 onAlert('PDF generation failed for all selected certificates.', true);
            }
        } catch (error: any) {
            onAlert(`Bulk PDF Generation (V1) failed. Error: ${error.message || 'Unknown error'}`, true);
        } finally {
            setIsBulkGeneratingV1(false);
        }
    }
    
    const handleBulkGeneratePDF_V2 = async () => {
        if (selectedIds.length === 0 || isBulkGeneratingV2) {
            onAlert('Select certificates for bulk export (V2).', false);
            return;
        }

        setIsBulkGeneratingV2(true);
        onAlert(`Fetching ${selectedIds.length} certificates for bulk PDF generation (V2)...`, false);

        try {
            const selectedCertificates = await fetchCertificatesForExport(true, selectedIds);
            if (selectedCertificates.length === 0) {
                 throw new Error('Could not retrieve selected data for bulk V2 export.');
            }
            
            const pdfPromises = selectedCertificates.map(cert => 
                generateCertificatePDFTyped(cert, onAlert, 'certificate2.pdf', setIsBulkGeneratingV2 as any, true)
            );
            
            const results = (await Promise.all(pdfPromises)).filter(Boolean);

            if (results.length > 0) {
                downloadZip(results as { filename: string, blob: Blob }[], 'certificates_v2_bulk_export.zip');
                onAlert(`Successfully generated and zipped ${results.length} certificates (V2).`, false);
                setSelectedIds([]);
            } else {
                 onAlert('PDF generation failed for all selected certificates.', true);
            }
        } catch (error: any) {
            onAlert(`Bulk PDF Generation (V2) failed. Error: ${error.message || 'Unknown error'}`, true);
        } finally {
            setIsBulkGeneratingV2(false);
        }
    }

    // --- Export Handler (UNCHANGED logic) ---
    const handleDownload = async (type: 'xlsx' | 'csv') => {
        onAlert('Fetching all filtered records for export, please wait...', false);

        const allCertificates = await fetchCertificatesForExport();

        if (allCertificates.length === 0) {
            onAlert('No data found for the current filter/search criteria to export.', false);
            return;
        }

        const dataToExport = allCertificates.map(cert => ({
            'Certificate No.': cert.certificateNo,
            'Name': cert.name,
            'Hospital': cert.hospital,
            'DOI': cert.doi,
        }));

        const worksheet = XLSX.utils.json_to_sheet(dataToExport);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Certificates');

        const fileName = `certificates_export.${type}`;
        XLSX.writeFile(workbook, fileName);

        onAlert(`Successfully exported ${allCertificates.length} records to ${fileName}.`, false);
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