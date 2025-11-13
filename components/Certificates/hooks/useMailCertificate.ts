// D:\ssistudios\ssistudios\components\Certificates\hooks\useMailCertificate.ts

import { useState, useCallback } from 'react';
import { ICertificateClient } from '../utils/constants';
// ⚠️ Mocked/Assumed Import: This PDF generator should handle the V1/V2 template logic 
// and return a Blob or File object for the mail composer.
import { generateCertificatePDF } from '../utils/pdfGenerator'; 
import { mockCertificateData, ICertificateClientWithEmail } from '../utils/mockData'; 

// Type for the internal state of the certificate being mailed
interface MailState {
    cert: ICertificateClient | null;
    pdfBlob: Blob | null;
    template: 'certificate1.pdf' | 'certificate2.pdf';
}

export const useMailCertificate = (onAlert: (message: string, isError: boolean) => void) => {
    const [mailState, setMailState] = useState<MailState>({ cert: null, pdfBlob: null, template: 'certificate1.pdf' });
    const [isMailComposerOpen, setIsMailComposerOpen] = useState(false);
    const [isPdfGenerating, setIsPdfGenerating] = useState(false);
    const [isSending, setIsSending] = useState(false);

    // 1. Initiate mail composer, generate PDF in the background (UNCHANGED)
    const handleOpenMailComposer = useCallback(async (cert: ICertificateClient, template: 'certificate1.pdf' | 'certificate2.pdf') => {
        setIsMailComposerOpen(true);
        setMailState({ cert, pdfBlob: null, template });
        setIsPdfGenerating(true);
        onAlert(`Generating PDF for ${cert.certificateNo}...`, false);
        
        // ⚠️ Mock PDF Generation: In a real app, this generates the file locally.
        try {
             // Assuming generateCertificatePDF is updated to return a Blob/File when the 5th argument is 'true'
             const dummySetLoading = (() => {}) as any; 
             const result = await generateCertificatePDF(cert, onAlert, template, dummySetLoading, true);

             if (result && result.blob) {
                 setMailState(prev => ({ ...prev, pdfBlob: result.blob }));
                 onAlert('PDF successfully attached.', false);
             } else {
                 throw new Error('PDF generation failed to return a blob.');
             }
        } catch (error: any) {
            onAlert(`PDF Generation Failed: ${error.message || 'Unknown error'}`, true);
            setIsMailComposerOpen(false); 
        } finally {
            setIsPdfGenerating(false);
        }
    }, [onAlert]);

    // 2. Mail Send Logic
    // 💡 UPDATED SIGNATURE: Accepts ccEmail as the second argument
    const handleSendMail = useCallback(async (recipientEmail: string, ccEmail: string, mailContent: string) => {
        if (!mailState.cert || !mailState.pdfBlob) {
            onAlert('Cannot send mail: Missing certificate data or PDF attachment.', true);
            return;
        }

        setIsSending(true);
        
        // MOCK DATA ACCESS for names/hospital
        const certWithDetails = mockCertificateData.find(c => c._id === mailState.cert?._id) || mailState.cert as ICertificateClientWithEmail;
        
        const { firstName, lastName, hospital: hospitalName, certificateNo } = certWithDetails; 
        
        try {
            // Convert Blob to File object for FormData
            const pdfFile = new File([mailState.pdfBlob], `${certificateNo}_certificate.pdf`, { type: 'application/pdf' });
            
            const formData = new FormData();
            formData.append('pdfFile', pdfFile);
            formData.append('firstName', firstName || 'Recipient');
            formData.append('lastName', lastName || '');
            formData.append('hospitalName', hospitalName);
            formData.append('recipientEmail', recipientEmail); 
            formData.append('ccEmail', ccEmail); // 💡 NEW: Append CC email (will be empty string if user left it blank)
            formData.append('mailContent', mailContent); 

            const response = await fetch('/api/send-certificate', {
                method: 'POST',
                body: formData,
            });

            const result = await response.json();

            if (response.ok && result.success) {
                onAlert(result.message, false);
                setIsMailComposerOpen(false);
                setMailState({ cert: null, pdfBlob: null, template: 'certificate1.pdf' });
            } else {
                throw new Error(result.error || 'Mail API failed without specific error message.');
            }
        } catch (error: any) {
            console.error("Mail Send Error:", error);
            onAlert(`Failed to send email: ${error.message || 'Network error'}`, true);
        } finally {
            setIsSending(false);
        }
    }, [mailState, onAlert]); 

    const handleCloseMailComposer = useCallback(() => {
        setIsMailComposerOpen(false);
        setMailState({ cert: null, pdfBlob: null, template: 'certificate1.pdf' });
    }, []);

    return {
        isMailComposerOpen,
        mailComposerCert: mailState.cert,
        mailComposerPdfBlob: mailState.pdfBlob,
        isSending,
        handleOpenMailComposer,
        handleSendMail,
        handleCloseMailComposer,
    };
};