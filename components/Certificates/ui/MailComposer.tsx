// D:\ssistudios\ssistudios\components\Certificates\ui\MailComposer.tsx (UPDATED)

import React, { useState, useEffect } from 'react';
import { Send, X, Paperclip, Loader2 } from 'lucide-react';
import { ICertificateClient } from '../utils/constants';

interface MailComposerProps {
    certData: ICertificateClient;
    pdfBlob: Blob | null; // The generated PDF blob
    isSending: boolean;
    onClose: () => void;
    onSend: (recipientEmail: string, emailContent: string) => Promise<void>; // 💡 UPDATED: Now passes recipientEmail
    onAlert: (message: string, isError: boolean) => void;
}

const MailComposer: React.FC<MailComposerProps> = ({
    certData,
    pdfBlob,
    isSending,
    onClose,
    onSend,
    onAlert,
}) => {
    // ⚠️ MOCK: Accessing mock data for names/hospital to populate the subject/body.
    const mockData = certData as any; // Cast for mock data access 
    const hospitalName = certData.hospital;

    // Default mail content (editable by user)
    const initialContent = `
Hello ${mockData.firstName || 'User'} ${mockData.lastName || ''},

Congratulations! Here is your training certificate from ${hospitalName}.

Best regards,
The SSI Innovations Team

---
This is a system-generated email. Please do not reply.
    `.trim();

    // 💡 CHANGE 1: Initialize recipientEmail to an empty string.
    const [recipientEmail, setRecipientEmail] = useState(''); 
    const [mailContent, setMailContent] = useState(initialContent);

    // Ensure content and recipient resets if the component re-opens for a different certificate
    useEffect(() => {
        setMailContent(initialContent);
        setRecipientEmail(''); // Ensure recipient is empty on new compose instance
    }, [certData._id]); 

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Basic validation for recipient email
        if (!recipientEmail.trim() || !recipientEmail.includes('@')) {
            onAlert('Please enter a valid recipient email address.', true);
            return;
        }

        if (!mailContent.trim()) {
            onAlert('Email body cannot be empty.', true);
            return;
        }

        // 💡 CHANGE 2: Pass the user-entered email to the onSend handler
        await onSend(recipientEmail, mailContent);
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
                
                {/* To Field - Editable by User */}
                <div className="p-2 border-b border-gray-200 flex items-center">
                    <span className="text-sm text-gray-600 font-medium mr-2 flex-shrink-0">To:</span>
                    <input
                        type="email"
                        value={recipientEmail}
                        onChange={(e) => setRecipientEmail(e.target.value)} // 💡 CHANGE 3: Make it editable
                        placeholder="Recipient's email address" // 💡 CHANGE 4: Placeholder added
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
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Sending...
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