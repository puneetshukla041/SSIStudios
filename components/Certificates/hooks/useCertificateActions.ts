import { useState } from 'react';
import * as XLSX from 'xlsx';
import { ICertificateClient, CertificateTableProps, initialNewCertificateState, NotificationType } from '../utils/constants';
import { getTodayDoi, sortCertificates } from '../utils/helpers';
import { generateCertificatePDF } from '../utils/pdfGenerator';

type GeneratePDFType = (
    certData: ICertificateClient,
    onAlert: (message: string, isError: boolean) => void,
    template: 'certificate1.pdf' | 'certificate2.pdf' | 'certificate3.pdf',
    setLoadingId: React.Dispatch<React.SetStateAction<string | null>> | React.Dispatch<React.SetStateAction<boolean>>,
    isBulk?: boolean
) => Promise<{ filename: string, blob: Blob } | null>;

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

export const useCertificateActions = ({
    certificates,
    selectedIds,
    setSelectedIds,
    fetchCertificates,
    fetchCertificatesForExport,
    showNotification,
    onAlert: oldOnAlert,
    setIsLoading,
}: UseCertificateActionsProps) => {
    
    // ✅ State: Row Actions only (Edit/Delete/PDF)
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editFormData, setEditFormData] = useState<Partial<ICertificateClient>>({});
    const [flashId, setFlashId] = useState<string | null>(null);
    const [deletingId, setDeletingId] = useState<string | null>(null);
    
    // PDF Generation States
    const [generatingPdfId, setGeneratingPdfId] = useState<string | null>(null);
    const [generatingPdfV1Id, setGeneratingPdfV1Id] = useState<string | null>(null);
    const [isBulkGeneratingV1, setIsBulkGeneratingV1] = useState(false);
    const [isBulkGeneratingV2, setIsBulkGeneratingV2] = useState(false);
    const [isBulkGeneratingV3, setIsBulkGeneratingV3] = useState(false); 

    const [showSuccessAnimation, setShowSuccessAnimation] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');

    const triggerSuccess = (msg: string) => {
        setSuccessMessage(msg);
        setShowSuccessAnimation(true);
        setTimeout(() => setShowSuccessAnimation(false), 2000);
    };

    const formatForFilename = (text: string | undefined | null) => {
        if (!text) return 'Unknown';
        const cleanText = text.replace(/[\\/:*?"<>|]/g, '').trim();
        if (!cleanText) return 'Unknown';
        return cleanText.replace(/\w\S*/g, (txt) => {
            return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
        });
    };

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

    // --- Selection & Delete Handlers ---
    const handleSelectOne = (id: string, checked: boolean) => {
        if (checked) setSelectedIds(prev => [...prev, id]);
        else setSelectedIds(prev => prev.filter(selectedId => selectedId !== id));
    };

    const handleSelectAll = (checked: boolean) => {
        if (checked) setSelectedIds(certificates.map(cert => cert._id));
        else setSelectedIds([]);
    };

    // Placeholder Logic for Deleting (Assuming you have this implemented similarly)
    const handleBulkDelete = async () => { 
        if(selectedIds.length === 0) return;
        // ... bulk delete implementation ...
        showNotification("Delete functionality placeholder", "info");
    };

    const handleDelete = async (id: string) => { 
        setDeletingId(id);
        // ... delete implementation ...
        showNotification("Delete functionality placeholder", "info");
        setDeletingId(null);
    };

    const handleEdit = (certificate: ICertificateClient) => { setEditingId(certificate._id); setEditFormData({ ...certificate }); };
    
    // Placeholder logic for saving edits
    const handleSave = async (id: string) => { 
        if(!editFormData) return;
        // ... save implementation ...
        setFlashId(id);
        setEditingId(null);
        showNotification("Edit saved successfully!", "success");
        fetchCertificates(false);
    };

    const handleChange = (field: keyof ICertificateClient, value: string) => { setEditFormData(prev => ({ ...prev, [field]: value })); };

    // --- PDF Generation Handlers ---

    const handleGeneratePDF_V2 = async (cert: ICertificateClient) => {
        if (generatingPdfId === cert._id) return;
        const result = await generateCertificatePDFTyped(cert, oldOnAlert, 'certificate2.pdf', setGeneratingPdfId, true);
        if (result && result.blob) triggerFileDownload(result.blob, `${formatForFilename(cert.name)}_${formatForFilename(cert.hospital)}.pdf`);
    };

    const handleGeneratePDF_V1 = async (cert: ICertificateClient) => {
        if (generatingPdfV1Id === cert._id) return;
        const result = await generateCertificatePDFTyped(cert, oldOnAlert, 'certificate1.pdf', setGeneratingPdfV1Id, true);
        if (result && result.blob) triggerFileDownload(result.blob, `${formatForFilename(cert.name)}_${formatForFilename(cert.hospital)}.pdf`);
    };

    const handleBulkGenerate = async (template: 'certificate1.pdf' | 'certificate2.pdf' | 'certificate3.pdf', setBulkState: React.Dispatch<React.SetStateAction<boolean>>, typeLabel: string) => {
        if (selectedIds.length === 0) {
            showNotification(`Select certificates for ${typeLabel} export.`, 'info');
            return;
        }

        setBulkState(true);
        showNotification(`Preparing ${selectedIds.length} ${typeLabel} certificates...`, 'info');

        try {
            let selectedCertificates = await fetchCertificatesForExport(true, selectedIds);
            selectedCertificates = selectedCertificates.filter(cert => selectedIds.includes(cert._id));

            if (selectedCertificates.length === 0) throw new Error(`Could not retrieve selected data for ${typeLabel} export.`);

            const pdfPromises = selectedCertificates.map(cert =>
                generateCertificatePDFTyped(cert, oldOnAlert, template, setBulkState as any, true)
            );

            const results = await Promise.all(pdfPromises);
            let successCount = 0;

            for (let i = 0; i < results.length; i++) {
                const result = results[i];
                if (result && result.blob) {
                    triggerFileDownload(result.blob, result.filename);
                    successCount++;
                    await new Promise(resolve => setTimeout(resolve, 500));
                }
            }

            if (successCount > 0) {
                triggerSuccess(`${successCount} Downloaded`);
                setSelectedIds([]);
            } else {
                showNotification('PDF generation failed.', 'error');
            }
        } catch (error: any) {
            showNotification(`Bulk Generation failed: ${error.message}`, 'error');
        } finally {
            setBulkState(false);
        }
    };

    // V1 Bulk
    const handleBulkGeneratePDF_V1 = () => handleBulkGenerate('certificate1.pdf', setIsBulkGeneratingV1, 'Proctorship');
    // V2 Bulk
    const handleBulkGeneratePDF_V2 = () => handleBulkGenerate('certificate2.pdf', setIsBulkGeneratingV2, 'Training');
    // V3 Bulk (Others 100+)
    const handleBulkGeneratePDF_V3 = () => handleBulkGenerate('certificate3.pdf', setIsBulkGeneratingV3, '100+ Others');

    // --- Export Handler ---
    const handleDownload = async (type: 'xlsx' | 'csv') => {
        showNotification('Fetching all filtered records for export, please wait...', 'info');
        const allCertificates = await fetchCertificatesForExport();
        if (allCertificates.length === 0) {
            showNotification('No data found.', 'info');
            return;
        }
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
            worksheet['!cols'] = [{ wch: 8 }, { wch: 18 }, { wch: 30 }, { wch: 55 }, { wch: 15 }];
        }
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Certificates');
        XLSX.writeFile(workbook, `certificates_export.${type}`);
        triggerSuccess('Export Complete');
    };

    return {
        editingId, editFormData, flashId, deletingId,
        generatingPdfId, generatingPdfV1Id,
        isBulkGeneratingV1, isBulkGeneratingV2, isBulkGeneratingV3,
        showSuccessAnimation, successMessage,
        setEditingId, setEditFormData, setFlashId, setShowSuccessAnimation,
        handleSelectOne, handleSelectAll, handleBulkDelete, handleEdit, handleSave, handleDelete, handleChange,
        handleDownload,
        handleGeneratePDF_V1, handleGeneratePDF_V2,
        handleBulkGeneratePDF_V1, handleBulkGeneratePDF_V2, handleBulkGeneratePDF_V3,
    };
};