import React, { useState, useEffect } from 'react';
import { Send, X, Paperclip, Loader2, AtSign, Users, FileText, Info } from 'lucide-react';
import { ICertificateClient } from '../utils/constants';
import clsx from 'clsx';

interface MailComposerProps {
    certData: ICertificateClient;
    pdfBlob: Blob | null;
    isSending: boolean;
    onClose: () => void;
    onSend: (recipientEmail: string, ccEmail: string, emailContent: string) => Promise<void>;
    onAlert: (message: string, isError: boolean) => void;
}

const validateEmails = (emails: string): boolean => {
    if (!emails.trim()) return true;
    const emailArray = emails.split(',').map(email => email.trim()).filter(Boolean);
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailArray.every(email => emailRegex.test(email));
};

const MailComposer: React.FC<MailComposerProps> = ({
    certData, pdfBlob, isSending, onClose, onSend, onAlert,
}) => {
    // @ts-ignore
    const mockData = certData as any;
    const hospitalName = certData.hospital;

    const initialContent = `
Hello ${mockData.firstName || certData.name.split(' ')[0] || 'User'},

Congratulations! Here is your training certificate from ${hospitalName}.

Best regards,
The SSI Innovations Team

---
This is a system-generated email. Please do not reply.
    `.trim();

    const [recipientEmail, setRecipientEmail] = useState('');
    const [ccEmail, setCcEmail] = useState('');
    const [mailContent, setMailContent] = useState(initialContent);

    useEffect(() => {
        setMailContent(initialContent);
        setRecipientEmail('');
        setCcEmail('');
    }, [certData._id]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!recipientEmail.trim() || !validateEmails(recipientEmail) || recipientEmail.includes(',')) {
            onAlert('Please enter a single, valid recipient (To) email address.', true);
            return;
        }
        if (ccEmail.trim() && !validateEmails(ccEmail)) {
            onAlert('Please ensure all Carbon Copy (CC) emails are valid and separated by commas.', true);
            return;
        }
        if (!mailContent.trim()) {
            onAlert('Email body cannot be empty.', true);
            return;
        }
        await onSend(recipientEmail, ccEmail, mailContent);
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div 
                className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity duration-300"
                onClick={!isSending ? onClose : undefined}
            />
            
            <div className="relative w-full max-w-[95vw] sm:max-w-2xl bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 fade-in duration-300 border border-slate-100">
                
                {/* Header */}
                <div className="px-4 sm:px-6 py-4 bg-white border-b border-slate-100 flex items-center justify-between z-10 sticky top-0">
                    <div className="flex-1 min-w-0 pr-4">
                        <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2 truncate">
                            Compose Email
                            <span className="hidden sm:inline-flex px-2 py-0.5 rounded-full bg-slate-100 text-[10px] font-semibold text-slate-500 uppercase tracking-wide">
                                {certData.certificateNo}
                            </span>
                        </h3>
                        <p className="text-xs text-slate-500 mt-0.5 truncate">
                            Sending to: {certData.name}
                        </p>
                    </div>
                    <button
                        onClick={onClose} disabled={isSending}
                        className="p-2 rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors duration-200 outline-none focus:ring-2 focus:ring-slate-200 shrink-0"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto custom-scrollbar bg-white p-4 sm:p-6 space-y-4 sm:space-y-5">
                    
                    <div className="group relative">
                        <div className="absolute left-3 top-3 text-slate-400 group-focus-within:text-sky-500 transition-colors">
                            <AtSign className="w-4 h-4" />
                        </div>
                        <input
                            type="email" value={recipientEmail} onChange={(e) => setRecipientEmail(e.target.value)}
                            placeholder="recipient@example.com" disabled={isSending}
                            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-800 placeholder:text-slate-400 focus:bg-white focus:border-sky-500 focus:ring-4 focus:ring-sky-500/10 outline-none transition-all duration-200"
                        />
                        <label className="absolute -top-2 left-3 px-1 bg-white text-[10px] font-bold text-slate-400 uppercase tracking-wide group-focus-within:text-sky-600 transition-colors">To</label>
                    </div>

                    <div className="group relative">
                        <div className="absolute left-3 top-3 text-slate-400 group-focus-within:text-sky-500 transition-colors">
                            <Users className="w-4 h-4" />
                        </div>
                        <input
                            type="text" value={ccEmail} onChange={(e) => setCcEmail(e.target.value)}
                            placeholder="CC (Optional)" disabled={isSending}
                            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-800 placeholder:text-slate-400 focus:bg-white focus:border-sky-500 focus:ring-4 focus:ring-sky-500/10 outline-none transition-all duration-200"
                        />
                         <label className="absolute -top-2 left-3 px-1 bg-white text-[10px] font-bold text-slate-400 uppercase tracking-wide group-focus-within:text-sky-600 transition-colors">CC</label>
                    </div>

                    <div className="px-3 py-3 bg-slate-50/50 border border-slate-100 rounded-lg flex gap-3">
                        <Info className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
                        <div className="flex flex-col min-w-0">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Subject</span>
                            <span className="text-sm font-medium text-slate-700 truncate">Your SSI Certificate for {mockData.firstName || certData.name}</span>
                        </div>
                    </div>

                    <div className="relative group">
                        <label className="absolute -top-2 left-3 px-1 bg-white text-[10px] font-bold text-slate-400 uppercase tracking-wide group-focus-within:text-sky-600 transition-colors z-10">Message</label>
                        <textarea
                            value={mailContent} onChange={(e) => setMailContent(e.target.value)} disabled={isSending}
                            className="w-full min-h-[150px] sm:min-h-[240px] p-4 text-sm text-slate-700 leading-relaxed bg-white border border-slate-200 rounded-lg resize-none focus:border-sky-500 focus:ring-4 focus:ring-sky-500/10 outline-none transition-all duration-200 custom-scrollbar"
                            placeholder="Write your email content here..."
                        />
                    </div>
                </div>

                {/* Footer */}
                <div className="px-4 sm:px-6 py-4 bg-slate-50/80 border-t border-slate-100 backdrop-blur-sm flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-4">
                    <div className="flex items-center gap-3">
                        {pdfBlob ? (
                            <div className="flex items-center gap-3 px-3 py-2 bg-white border border-slate-200 rounded-lg shadow-sm hover:border-slate-300 transition-colors group cursor-default w-full sm:w-auto">
                                <div className="p-1.5 bg-rose-50 rounded-md shrink-0">
                                    <FileText className="w-4 h-4 text-rose-500" />
                                </div>
                                <div className="flex flex-col min-w-0">
                                    <span className="text-xs font-semibold text-slate-700 group-hover:text-slate-900 truncate max-w-[150px] sm:max-w-[200px]">certificate.pdf</span>
                                    <span className="text-[10px] text-slate-400">{(pdfBlob.size / 1024).toFixed(0)} KB • PDF</span>
                                </div>
                            </div>
                        ) : (
                            <div className="flex items-center gap-2 text-xs font-medium text-slate-400 animate-pulse px-2">
                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                <span>Generating attachment...</span>
                            </div>
                        )}
                    </div>

                    <button
                        onClick={handleSubmit} disabled={isSending || !pdfBlob}
                        className={clsx(
                            "w-full sm:w-auto px-6 py-2.5 rounded-lg text-sm font-semibold text-white shadow-lg transition-all duration-200 flex items-center justify-center gap-2",
                            (isSending || !pdfBlob) ? "bg-slate-300 cursor-not-allowed shadow-none" : "bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-500 hover:to-blue-500 shadow-sky-500/20 active:scale-95"
                        )}
                    >
                        {isSending ? <><Loader2 className="w-4 h-4 animate-spin" /> Sending...</> : <><Send className="w-4 h-4" /> Send Email</>}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default MailComposer;