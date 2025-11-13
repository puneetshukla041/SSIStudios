// D:\ssistudios\ssistudios\components\Certificates\ui\MailComposer.tsx

import React, { useState, useEffect } from 'react';
import { Send, X, Paperclip, Loader2 } from 'lucide-react';
import { ICertificateClient } from '../utils/constants';

interface MailComposerProps {
    certData: ICertificateClient;
    pdfBlob: Blob | null; // The generated PDF blob
    isSending: boolean;
    onClose: () => void;
    // UPDATED: onSend expects recipientEmail, ccEmail (comma-separated string), and emailContent
    onSend: (recipientEmail: string, ccEmail: string, emailContent: string) => Promise<void>; 
    onAlert: (message: string, isError: boolean) => void;
}

// Helper to validate a comma-separated list of emails
const validateEmails = (emails: string): boolean => {
    if (!emails.trim()) return true; // Empty is valid
    const emailArray = emails.split(',').map(email => email.trim()).filter(Boolean);
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailArray.every(email => emailRegex.test(email));
};

const MailComposer: React.FC<MailComposerProps> = ({
    certData,
    pdfBlob,
    isSending,
    onClose,
    onSend,
    onAlert,
}) => {
    // MOCK: Accessing mock data for names/hospital to populate the subject/body.
    const mockData = certData as any; 
    const hospitalName = certData.hospital;

    // Default mail content 
    const initialContent = `
Hello ${mockData.firstName || 'User'} ${mockData.lastName || ''},

Congratulations! Here is your training certificate from ${hospitalName}.

Best regards,
The SSI Innovations Team

---
This is a system-generated email. Please do not reply.
    `.trim();

    const [recipientEmail, setRecipientEmail] = useState(''); 
    const [ccEmail, setCcEmail] = useState(''); 
    const [mailContent, setMailContent] = useState(initialContent);

    // Reset fields on component re-open
    useEffect(() => {
        setMailContent(initialContent);
        setRecipientEmail('');
        setCcEmail(''); 
    }, [certData._id]); 

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // 1. Validate 'To' email
        if (!recipientEmail.trim() || !validateEmails(recipientEmail)) {
            onAlert('Please enter a single, valid recipient (To) email address.', true);
            return;
        }

        // 2. Validate 'CC' emails (multiple allowed)
        if (ccEmail.trim() && !validateEmails(ccEmail)) {
             onAlert('Please ensure all Carbon Copy (CC) emails are valid and separated by commas.', true);
            return;
        }

        if (!mailContent.trim()) {
            onAlert('Email body cannot be empty.', true);
            return;
        }

        // Pass the comma-separated string to the handler
        await onSend(recipientEmail, ccEmail, mailContent);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/50 backdrop-blur-sm">
            <div className="bg-white rounded-lg shadow-2xl w-[95%] max-w-lg flex flex-col h-auto max-h-[90vh]">
                
                {/* Header (Title Bar) */}
                <div className="flex justify-between items-center bg-gray-100 p-3 rounded-t-lg border-b border-gray-200">
                    <h3 className="text-base font-semibold text-gray-700">Compose Mail: {certData.certificateNo}</h3>
                    <button onClick={onClose} className="p-1 rounded-full text-gray-500 hover:bg-gray-200 transition duration-150">
                        <X className="w-5 h-5" />
                    </button>
                </div>
                
                {/* To Field (Single Recipient) */}
                <div className="p-2 border-b border-gray-200 flex items-center">
                    <span className="text-sm text-gray-600 font-medium mr-2 flex-shrink-0">To:</span>
                    <input
                        type="email"
                        value={recipientEmail}
                        onChange={(e) => setRecipientEmail(e.target.value)}
                        placeholder="Recipient's email address"
                        className="flex-1 text-sm text-gray-800 bg-transparent outline-none p-1 border border-transparent focus:border-sky-400 rounded transition duration-150"
                        disabled={isSending}
                    />
                </div>

                {/* CC Field (Multiple Recipients via Comma) */}
                <div className="p-2 border-b border-gray-200 flex items-center">
                    <span className="text-sm text-gray-600 font-medium mr-2 flex-shrink-0">CC:</span>
                    <input
                        type="text" // Changed to text to better support comma-separated list
                        value={ccEmail}
                        onChange={(e) => setCcEmail(e.target.value)}
                        placeholder="Multiple CC emails, separated by commas (optional)"
                        className="flex-1 text-sm text-gray-800 bg-transparent outline-none p-1 border border-transparent focus:border-sky-400 rounded transition duration-150"
                        disabled={isSending}
                    />
                </div>
                
                {/* Subject Field (UNCHANGED) */}
                <div className="p-2 border-b border-gray-200">
                    <span className="text-sm text-gray-600 font-medium">Subject: </span>
                    <span className="text-sm text-gray-800">Your SSI Certificate for {mockData.firstName} {mockData.lastName}</span>
                </div>

                {/* Body Content Area (UNCHANGED) */}
                <div className="flex-1 p-3 overflow-y-auto">
                    <textarea
                        value={mailContent}
                        onChange={(e) => setMailContent(e.target.value)}
                        className="w-full h-full min-h-40 text-sm text-gray-800 border-none resize-none focus:ring-0 focus:outline-none"
                        placeholder="Write your email content here..."
                        disabled={isSending}
                    />
                </div>

                {/* Footer (Actions) (UNCHANGED) */}
                <div className="p-3 flex justify-between items-center bg-gray-100 rounded-b-lg border-t border-gray-200">
                    <button
                        onClick={handleSubmit}
                        disabled={isSending || !pdfBlob}
                        className={`px-4 py-2 text-sm font-semibold rounded-full flex items-center transition duration-300 shadow-md ${
                            isSending
                                ? 'bg-blue-400 cursor-wait'
                                : 'bg-blue-600 text-white hover:bg-blue-700'
                        }`}
                    >
                        {isSending ? (
                            <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Send
                            </>
                        ) : (
                            <>
                                <Send className="w-4 h-4 mr-2" /> Send
                            </>
                        )}
                    </button>

                    {/* Attachment Indicator */}
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <Paperclip className="w-4 h-4" />
                        <span>{pdfBlob ? 'certificate.pdf (Attached)' : 'Generating PDF...'}</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MailComposer;