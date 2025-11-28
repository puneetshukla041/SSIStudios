'use client'
import React, { useState, useCallback } from 'react';
import { 
  ShieldAlert, Send, Star, Loader2, ChevronDown, 
  MessageSquare, Bug, ThumbsUp, Activity, Lock, 
  Image as ImageIcon, CheckCircle, AlertCircle, Paperclip 
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext'; 
import { Plus_Jakarta_Sans, Inter } from 'next/font/google';
import clsx from 'clsx';

// --- Professional Typography ---
const fontHeading = Plus_Jakarta_Sans({ 
  subsets: ['latin'], 
  weight: ['500', '600', '700'],
  display: 'swap',
});

const fontBody = Inter({ 
  subsets: ['latin'], 
  weight: ['400', '500'],
  display: 'swap',
});

// --- Feedback Type Options ---
const FEEDBACK_TYPES = [
    { value: 'Bug', label: 'Bug Report', icon: Bug, color: 'text-red-600', bg: 'bg-red-50', border: 'border-red-100', hoverBg: 'hover:bg-red-50' },
    { value: 'Suggestion', label: 'Feature Request', icon: MessageSquare, color: 'text-purple-600', bg: 'bg-purple-50', border: 'border-purple-100', hoverBg: 'hover:bg-purple-50' },
    { value: 'Performance', label: 'Performance Issue', icon: Activity, color: 'text-orange-600', bg: 'bg-orange-50', border: 'border-orange-100', hoverBg: 'hover:bg-orange-50' },
    { value: 'Security', label: 'Security Concern', icon: Lock, color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-100', hoverBg: 'hover:bg-blue-50' },
    { value: 'General', label: 'General Feedback', icon: ThumbsUp, color: 'text-green-600', bg: 'bg-green-50', border: 'border-green-100', hoverBg: 'hover:bg-green-50' },
];

// --- CONTENT PRESETS (Same as before) ---
const CONTENT_PRESETS: Record<string, { summaries: string[] }> = {
    Bug: {
        summaries: [
            'Select a common issue...', 
            '[UI] Layout elements overlapping on mobile',
            '[Functionality] Configuration settings failed to save',
            '[Data] Synchronization failure',
            '[Integration] API connection error',
            '[Validation] Form submission error'
        ],
    },
    Suggestion: {
        summaries: [
            'Select a suggestion...', 
            'Feature: CSV/Excel export',
            'UX: Simplify onboarding process',
            'Content: Add contextual help tooltips',
            'Integration: Connect with external service',
        ],
    },
    Performance: {
        summaries: [
            'Select an observation...', 
            'High Latency: Dashboard load time >10s',
            'UI Freeze: navigating Reports section',
            'API Timeout: Slow response',
        ],
    },
    Security: {
        summaries: [
            'Select a concern...',
            'Vulnerability: Potential XSS detected',
            'Access Control: Permission mismatch',
            'Compliance: Data handling concern',
        ],
    },
    General: {
        summaries: [
            'Select a topic...',
            'Feedback: Positive experience',
            'Inquiry: Roadmap question',
            'Issue: Notification delivery',
        ],
    },
};

const SATISFACTION_OPTIONS = [
    { value: 1, label: 'Critical' },
    { value: 2, label: 'Poor' },
    { value: 3, label: 'Average' },
    { value: 4, label: 'Very Good' },
    { value: 5, label: 'Excellent' },
];

const BugReportApp: React.FC = () => {
    const { user, isLoading: authLoading } = useAuth();
    const DEFAULT_SATISFACTION = 0; 
    
    const [feedbackType, setFeedbackType] = useState(FEEDBACK_TYPES[0].value);
    const [title, setTitle] = useState(CONTENT_PRESETS.Bug.summaries[0]);
    const [customTitle, setCustomTitle] = useState(''); 
    const [description, setDescription] = useState(''); 
    const [imageFile, setImageFile] = useState<File | null>(null); 
    
    const [satisfaction, setSatisfaction] = useState(DEFAULT_SATISFACTION); 
    const [hoverSatisfaction, setHoverSatisfaction] = useState(0); 
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [message, setMessage] = useState<{ text: string, type: 'success' | 'error' } | null>(null);
    
    const handleFeedbackTypeChange = (newType: string) => {
        setFeedbackType(newType);
        setTitle(CONTENT_PRESETS[newType].summaries[0]); 
        setDescription(''); 
    };
    
    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            setImageFile(e.target.files[0]);
        } else {
            setImageFile(null);
        }
    };

    const handleSubmit = useCallback(async (e: React.FormEvent) => {
        e.preventDefault();

        if (!user) {
             setMessage({ text: 'Authentication required.', type: 'error' });
             return;
        }

        if (satisfaction === 0) {
             setMessage({ text: 'Please provide a satisfaction rating.', type: 'error' });
             return;
        }
        
        let finalTitle = title;
        if (title === CONTENT_PRESETS[feedbackType].summaries[0] || title === "Custom Summary") {
            if (title === "Custom Summary" && !customTitle.trim()) {
                 setMessage({ text: 'Please enter a summary title.', type: 'error' });
                 return;
            } else if (title === CONTENT_PRESETS[feedbackType].summaries[0] && !description.trim()) {
                setMessage({ text: 'Please specify the issue in the description.', type: 'error' });
                return;
            }
            if (title === "Custom Summary") finalTitle = customTitle.trim();
        }
        
        const finalDescription = description.trim() || `No detailed description provided. Type: ${feedbackType}.`;

        setIsSubmitting(true);
        setMessage(null);

        try {
            const response = await fetch('/api/bug-report', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId: user.username, 
                    title: finalTitle,
                    description: finalDescription,
                    rating: satisfaction, 
                    feedbackType: feedbackType,
                }),
            });

            const data = await response.json();

            if (!response.ok) throw new Error(data.error || 'Submission failed');

            setMessage({ text: 'Report submitted successfully.', type: 'success' });
            
            handleFeedbackTypeChange(FEEDBACK_TYPES[0].value);
            setCustomTitle('');
            setDescription('');
            setSatisfaction(DEFAULT_SATISFACTION);
            setImageFile(null);
            
        } catch (error: any) {
            setMessage({ text: 'Unable to submit report.', type: 'error' });
        } finally {
            setIsSubmitting(false);
        }
    }, [satisfaction, feedbackType, title, customTitle, description, user, imageFile]); 

    // --- Loading State ---
    if (authLoading || !user) {
        return (
            <div className={`min-h-[60vh] flex items-center justify-center ${fontBody.className}`}>
                <div className="flex flex-col items-center gap-3 text-gray-500">
                    <Loader2 className="w-6 h-6 animate-spin text-gray-900" />
                    <p className="text-sm font-medium">Authenticating...</p>
                </div>
            </div>
        );
    }

    return (
        <div className={`w-full max-w-6xl mx-auto py-8 px-4 sm:px-6 ${fontBody.className} h-full flex flex-col justify-center`}>
            
            {/* Main Rectangular Card */}
            <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden flex flex-col lg:flex-row min-h-[600px]">
                
                {/* --- LEFT SIDEBAR (Context & Selection) --- */}
                <div className="lg:w-[35%] bg-gray-50/80 p-6 lg:p-8 border-b lg:border-b-0 lg:border-r border-gray-100 flex flex-col gap-6">
                    
                    {/* Header */}
                    <div>
                        <h1 className={`text-2xl font-bold text-gray-900 tracking-tight ${fontHeading.className}`}>
                            Submit Feedback
                        </h1>
                        <p className="text-gray-500 text-sm mt-1">
                            We value your input. Please fill out the details.
                        </p>
                    </div>

                    {/* Reporter Info Card */}
                    <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex items-center gap-3 hover:shadow-md transition-shadow duration-300">
                         <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-800 to-black flex items-center justify-center text-xs font-bold text-white shadow-inner">
                            {user.username.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-bold text-gray-900 truncate">{user.username}</p>
                            <p className="text-xs text-gray-500 font-mono truncate">ID: {user.id}</p>
                        </div>
                        <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" title="Session Active" />
                    </div>

                    {/* Feedback Type Selection (Vertical List) */}
                    <div className="flex-1 flex flex-col gap-2">
                         <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Feedback Type</label>
                         <div className="flex-1 space-y-2 overflow-y-auto pr-1 custom-scrollbar">
                            {FEEDBACK_TYPES.map((type) => {
                                const Icon = type.icon;
                                const isSelected = feedbackType === type.value;
                                return (
                                    <button
                                        key={type.value}
                                        type="button"
                                        onClick={() => handleFeedbackTypeChange(type.value)}
                                        className={clsx(
                                            "w-full flex items-center gap-3 p-3 rounded-lg border text-left transition-all duration-200 group relative overflow-hidden cursor-pointer", // Added cursor-pointer
                                            isSelected 
                                                ? "bg-white border-gray-900 ring-1 ring-gray-900 shadow-md" 
                                                : "bg-white border-gray-200 hover:border-gray-400 hover:shadow-sm"
                                        )}
                                    >
                                        <div className={clsx(
                                            "p-2 rounded-md transition-colors",
                                            isSelected ? type.bg : "bg-gray-100 group-hover:bg-gray-200"
                                        )}>
                                            <Icon className={clsx("w-4 h-4", type.color)} />
                                        </div>
                                        <div>
                                            <p className={clsx("text-sm font-semibold", isSelected ? "text-gray-900" : "text-gray-600")}>{type.label}</p>
                                        </div>
                                        {isSelected && (
                                            <div className="absolute right-0 top-0 bottom-0 w-1 bg-gray-900" />
                                        )}
                                    </button>
                                );
                            })}
                         </div>
                    </div>
                </div>

                {/* --- RIGHT CONTENT (Form) --- */}
                <div className="lg:w-[65%] p-6 lg:p-8 flex flex-col relative bg-white">
                    
                    {/* Floating Status Message */}
                    {message && (
                        <div className={clsx(
                            "absolute top-0 left-0 right-0 py-2 px-4 text-center text-xs font-semibold animate-in slide-in-from-top-2",
                            message.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        )}>
                            {message.text}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="flex-1 flex flex-col gap-5 h-full">
                        
                        {/* 1. Summary */}
                        <div className="space-y-1.5">
                            <label className="text-sm font-semibold text-gray-900">Summary</label>
                            <div className="relative group">
                                <select
                                    value={title}
                                    onChange={(e) => {
                                        setTitle(e.target.value);
                                        if(e.target.value !== "Custom Summary") setCustomTitle('');
                                    }}
                                    className="w-full appearance-none pl-4 pr-10 py-3 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-900 focus:outline-none focus:bg-white focus:ring-2 focus:ring-gray-900/10 focus:border-gray-900 transition-all cursor-pointer hover:bg-gray-100"
                                >
                                    {CONTENT_PRESETS[feedbackType].summaries.map((s, i) => (
                                        <option key={i} value={s} disabled={i === 0}>{s}</option>
                                    ))}
                                    <option value="Custom Summary">Other (Custom Summary)</option>
                                </select>
                                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none group-hover:text-gray-600 transition-colors" />
                            </div>
                            
                            {title === "Custom Summary" && (
                                <input 
                                    type="text"
                                    value={customTitle}
                                    onChange={(e) => setCustomTitle(e.target.value)}
                                    placeholder="Enter a brief summary..."
                                    className="mt-2 w-full px-4 py-3 bg-white border border-gray-200 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-900 transition-all animate-in fade-in slide-in-from-top-1"
                                    autoFocus
                                />
                            )}
                        </div>

                        {/* 2. Description */}
                        <div className="space-y-1.5 flex-1 min-h-[120px]">
                            <label className="text-sm font-semibold text-gray-900 flex justify-between">
                                Description
                                <span className="text-xs font-normal text-gray-400">Be specific</span>
                            </label>
                            <textarea
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder="Steps to reproduce, expected behavior, details..."
                                className="w-full h-full min-h-[120px] px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-900 resize-none focus:outline-none focus:bg-white focus:ring-2 focus:ring-gray-900/10 focus:border-gray-900 transition-all placeholder:text-gray-400"
                            />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mt-auto pt-4 border-t border-gray-100">
                             {/* 3. Attachment */}
                             <div className="space-y-1.5">
                                <label className="text-sm font-semibold text-gray-900">Attachment</label>
                                <div className="relative group">
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleImageChange}
                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                    />
                                    <div className={clsx(
                                        "w-full px-4 py-2.5 rounded-lg border border-dashed flex items-center gap-2 transition-all duration-200 cursor-pointer", // Added cursor-pointer
                                        imageFile 
                                            ? "bg-blue-50 border-blue-200 text-blue-700" 
                                            : "bg-white border-gray-300 text-gray-500 group-hover:border-gray-400 group-hover:bg-gray-50"
                                    )}>
                                        {imageFile ? <CheckCircle className="w-4 h-4" /> : <Paperclip className="w-4 h-4" />}
                                        <span className="text-xs font-medium truncate">
                                            {imageFile ? imageFile.name : "Click to upload screenshot"}
                                        </span>
                                    </div>
                                </div>
                             </div>

                             {/* 4. Rating */}
                             <div className="space-y-1.5">
                                <label className="text-sm font-semibold text-gray-900 flex justify-between">
                                    Satisfaction
                                    <span className="text-xs font-normal text-gray-400">
                                        {(hoverSatisfaction || satisfaction) > 0 
                                            ? SATISFACTION_OPTIONS.find(o => o.value === (hoverSatisfaction || satisfaction))?.label 
                                            : 'Required'}
                                    </span>
                                </label>
                                <div className="flex items-center justify-between bg-gray-50 px-3 py-2 rounded-lg border border-gray-200 hover:border-gray-300 transition-colors">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <button
                                            key={star}
                                            type="button"
                                            onClick={() => setSatisfaction(star)}
                                            onMouseEnter={() => setHoverSatisfaction(star)}
                                            onMouseLeave={() => setHoverSatisfaction(0)}
                                            className="p-1 focus:outline-none transition-transform hover:scale-125 active:scale-95 cursor-pointer" // Added cursor-pointer
                                        >
                                            <Star 
                                                className={clsx(
                                                    "w-5 h-5 transition-all duration-200", 
                                                    (hoverSatisfaction || satisfaction) >= star 
                                                        ? "fill-amber-400 text-amber-400 drop-shadow-sm" 
                                                        : "fill-gray-200 text-gray-200"
                                                )} 
                                            />
                                        </button>
                                    ))}
                                </div>
                             </div>
                        </div>

                        {/* 5. Submit Button */}
                        <div className="mt-2">
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className={clsx(
                                    "w-full flex justify-center items-center gap-2 px-6 py-4 rounded-xl text-sm font-bold text-white transition-all duration-300 shadow-lg shadow-gray-200",
                                    isSubmitting 
                                        ? "bg-gray-400 cursor-not-allowed" 
                                        : "bg-gray-900 hover:bg-black hover:scale-[1.01] hover:shadow-xl active:scale-[0.99] cursor-pointer" // Added cursor-pointer
                                )}
                            >
                                {isSubmitting ? (
                                    <>
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        <span>Submitting...</span>
                                    </>
                                ) : (
                                    <>
                                        <Send className="w-4 h-4" />
                                        <span>Submit Report</span>
                                    </>
                                )}
                            </button>
                        </div>

                    </form>
                </div>
            </div>
            
            {/* Footer */}
            <div className="mt-4 text-center">
                 <p className="text-[10px] text-gray-400 flex items-center justify-center gap-1.5">
                    <ShieldAlert className="w-3 h-3" />
                    Encrypted End-to-End • Secure Feedback System
                </p>
            </div>
        </div>
    );
};

export default BugReportApp;