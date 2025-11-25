// D:\ssistudios\ssistudios\app\reportbug\page.tsx

'use client'
import React, { useState, useEffect, useCallback } from 'react';
import { ShieldAlert, Send, Star, Loader2, ChevronDown, MessageSquare, Bug, ThumbsUp, Activity, Lock, Image, CheckCircle } from 'lucide-react';
// IMPORT useAuth HOOK
import { useAuth } from '@/contexts/AuthContext'; 

// --- Feedback Type Options ---
const FEEDBACK_TYPES = [
    { value: 'Bug', label: 'Bug Report', icon: Bug },
    { value: 'Suggestion', label: 'Feature Request', icon: MessageSquare },
    { value: 'Performance', label: 'Performance Issue', icon: Activity },
    { value: 'Security', label: 'Security Concern', icon: Lock },
    { value: 'General', label: 'General Feedback', icon: ThumbsUp },
];

// --- CONTENT PRESETS ---
const CONTENT_PRESETS: Record<string, { summaries: string[] }> = {
    Bug: {
        summaries: [
            'Please select a summary...', 
            '[UI] Layout elements are overlapping on mobile',
            '[Functionality] Failed to save configuration settings',
            '[Data Integrity] Data synchronization failure leading to loss',
            '[Integration] Third-party API connection is failing',
            '[Validation] Form accepts invalid input without error'
        ],
    },
    Suggestion: {
        summaries: [
            'Please select a summary...', 
            'Request for a CSV/Excel export feature',
            'Suggestion for a simplified onboarding process',
            'Idea to add contextual help links',
            'Request: Integrate with external service X',
            'Improve filter options in data tables'
        ],
    },
    Performance: {
        summaries: [
            'Please select a summary...', 
            'Dashboard takes >10 seconds to load',
            'Application freezes when navigating to the Reports section',
            'Slow response time on API calls',
            'Excessive CPU/Memory usage during operation'
        ],
    },
    Security: {
        summaries: [
            'Please select a summary...',
            'Potential cross-site scripting (XSS) vulnerability found',
            'Insecure direct object reference (IDOR) possibility',
            'Misconfiguration in user permission access',
            'Vulnerable library detected'
        ],
    },
    General: {
        summaries: [
            'Please select a summary...',
            'General praise for the application',
            'Inquiry regarding future roadmap or updates',
            'Problem with receiving email notifications',
            'Comments on the recent update'
        ],
    },
};

// --- SATISFACTION Options ---
const SATISFACTION_OPTIONS = [
    { value: 5, stars: 5, label: 'Excellent', description: 'Exceptional experience. I love using this application!' },
    { value: 4, stars: 4, label: 'Very Good', description: 'Solid experience. Just a few minor things to iron out.' },
    { value: 3, stars: 3, label: 'Average', description: 'It works, but the experience is neutral or mixed.' },
    { value: 2, stars: 2, label: 'Needs Improvement', description: 'Frustrating or difficult to use. Needs attention.' },
    { value: 1, stars: 1, label: 'Poor', description: 'Very poor experience. Difficult or impossible to complete tasks.' },
    { value: 0, stars: 0, label: 'Not Rated', description: 'Please click on a star to provide a satisfaction rating.' },
];

const BugReportApp: React.FC = () => {
    const { user, isLoading: authLoading } = useAuth(); // Destructure user and loading state
    const DEFAULT_SATISFACTION = 0; 
    
    const [feedbackType, setFeedbackType] = useState(FEEDBACK_TYPES[0].value);
    const [title, setTitle] = useState(CONTENT_PRESETS.Bug.summaries[0]);
    const [customTitle, setCustomTitle] = useState(''); 
    const [description, setDescription] = useState(''); 
    const [imageFile, setImageFile] = useState<File | null>(null); 
    
    const [satisfaction, setSatisfaction] = useState(DEFAULT_SATISFACTION); 
    const [hoverSatisfaction, setHoverSatisfaction] = useState(0); 
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [message, setMessage] = useState<{ text: string, type: 'success' | 'error' | 'info' } | null>(null);
    
    // NOTE: userId state removed. We use user.username and user.id directly.

    const selectedSatisfaction = SATISFACTION_OPTIONS.find(opt => opt.value === satisfaction) || SATISFACTION_OPTIONS[5];

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
             setMessage({ text: 'Error: User authentication data is missing.', type: 'error' });
             return;
        }

        // 1. Mandatory Checks
        if (satisfaction === 0) {
             setMessage({ text: 'The Overall Satisfaction Rating is required.', type: 'error' });
             return;
        }
        
        // 2. Determine Final Title
        let finalTitle = title;
        if (title === "Custom Summary") {
            if (!customTitle.trim()) {
                 setMessage({ text: 'Please enter a custom summary or select an option.', type: 'error' });
                 return;
            }
            finalTitle = customTitle.trim();
        } else if (title === CONTENT_PRESETS[feedbackType].summaries[0]) {
             if (!description.trim()) {
                setMessage({ text: 'Please provide a Summary or a Detailed Description.', type: 'error' });
                return;
             }
        }
        
        // Use default description if empty
        const finalDescription = description.trim() || `No detailed description provided. Type: ${feedbackType}.`;

        setIsSubmitting(true);
        setMessage(null);

        try {
            // **CRITICAL FIX: Sending user.username (as userId) and user.id (as actual mongo _id) to the server**
            const response = await fetch('/api/bug-report', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    // Send the username for the server-side lookup
                    userId: user.username, 
                    title: finalTitle,
                    description: finalDescription,
                    rating: satisfaction, 
                    feedbackType: feedbackType,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || `Submission failed with status: ${response.status}`);
            }

            // Mock image upload if file exists
            if (imageFile) {
                console.log(`Simulating upload of image: ${imageFile.name}`);
            }

            setMessage({ text: 'Report submitted successfully! Thank you for your rating and feedback.', type: 'success' });
            
            // Reset form state (keep submittedUser logic removed)
            handleFeedbackTypeChange(FEEDBACK_TYPES[0].value);
            setCustomTitle('');
            setDescription('');
            setSatisfaction(DEFAULT_SATISFACTION);
            setImageFile(null);
            
        } catch (error: any) {
            console.error("Submission Error:", error);
            setMessage({ text: error.message || 'Failed to submit report. Please try again.', type: 'error' });
        } finally {
            setIsSubmitting(false);
        }
    }, [satisfaction, feedbackType, title, customTitle, description, user, imageFile]); 

    // Renders the golden stars 
    const renderStars = () => {
        const stars = [];
        const starsToFill = hoverSatisfaction || satisfaction; 

        for (let i = 1; i <= 5; i++) {
            const isFilled = i <= starsToFill; 
            const starColor = isFilled ? 'text-amber-400 fill-amber-400' : 'text-blue-200/50 fill-blue-50/50';

            stars.push(
                <Star 
                    key={i} 
                    className={`w-5 h-5 transition-colors duration-150 ${starColor} cursor-pointer hover:scale-110`} 
                    onClick={() => setSatisfaction(i)} 
                    onMouseEnter={() => setHoverSatisfaction(i)} 
                    onMouseLeave={() => setHoverSatisfaction(0)}
                />
            );
        }
        return stars;
    };

    // Get the description text for the hover effect
    const getSatisfactionDescription = () => {
        const currentRating = hoverSatisfaction || satisfaction;
        const option = SATISFACTION_OPTIONS.find(opt => opt.value === currentRating);
        
        if (currentRating === 0) {
            return SATISFACTION_OPTIONS.find(opt => opt.value === 0)?.description || 'Select a star rating.';
        }

        return option ? `${option.label}: ${option.description}` : 'Select a star rating.';
    }
    
    const getFeedbackIcon = () => {
        const type = FEEDBACK_TYPES.find(t => t.value === feedbackType);
        return type ? type.icon : Bug;
    }

    // --- POSITIVE & PROFESSIONAL COLOR PALETTE ---
    const messageStyles = {
        success: 'bg-green-50 border-green-300 text-green-800',
        error: 'bg-red-50 border-red-300 text-red-800',
        info: 'bg-blue-50 border-blue-300 text-blue-800',
    };
    
    const IconComponent = getFeedbackIcon();

    // Show a loading or empty state if auth is not ready
    if (authLoading || !user) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center text-gray-700">
                    <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-indigo-600" />
                    <p className="text-base font-medium">Loading user session...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen p-4 sm:p-8 flex justify-center items-start font-sans bg-white">
            <div className="w-full max-w-xl bg-gradient-to-br from-white-200 to-indigo-100 shadow-xl rounded-xl p-5 sm:p-6 border border-gray-300">

                <header className="flex flex-col items-center mb-5 pb-3 border-b border-gray-100">
                    <div className="p-2 bg-blue-600 rounded-full mb-3 shadow-md">
                        <CheckCircle className="w-6 h-6 text-white" /> 
                    </div>
                    <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">Feedback Submission</h1>
                    <p className="text-sm text-gray-500 mt-1 text-center">Your input drives our improvements. Rating is mandatory.</p>
                </header>

                <form onSubmit={handleSubmit} className="space-y-4"> 

                    {/* FIXED: AUTOMATICALLY FETCHED USERNAME/ID DISPLAY */}
                    <div>
                        <label htmlFor="submitted-user" className="flex items-center text-sm font-semibold text-gray-700 mb-1">
                            <ShieldAlert className="w-4 h-4 mr-1 text-green-600" /> Logged In User/ID 
                        </label>
                        <div className="flex items-center space-x-2">
                             <input
                                type="text"
                                value={user.username} // Displaying the logged-in username
                                readOnly
                                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 cursor-default text-sm font-bold text-green-700"
                            />
                            <div className="px-3 py-2 text-xs font-mono text-gray-600 bg-gray-100 border border-gray-300 rounded-lg select-all">
                                ID: {user.id.substring(0, 8)}...
                            </div>
                        </div>
                    </div>
                    
                    {/* 1. Feedback Type Dropdown (Optional) */}
                    <div>
                        <label htmlFor="feedback-type" className="flex items-center text-sm font-semibold text-gray-700 mb-1">
                            <IconComponent className="w-4 h-4 mr-1 text-blue-600" /> 1. Type of Feedback (Optional)
                        </label>
                        <div className="relative">
                            <select
                                id="feedback-type"
                                value={feedbackType}
                                onChange={(e) => handleFeedbackTypeChange(e.target.value)}
                                className="w-full appearance-none px-3 py-2 border border-gray-300 rounded-lg bg-white focus:ring-blue-500 focus:border-blue-500 transition shadow-sm cursor-pointer pr-8 text-sm text-gray-800 font-medium"
                                disabled={isSubmitting}
                            >
                                {FEEDBACK_TYPES.map((type) => (
                                    <option key={type.value} value={type.value}>
                                        {type.label}
                                    </option>
                                ))}
                                <option disabled value="">Select Type</option> 
                            </select>
                            <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                        </div>
                    </div>
                    
                    {/* 2. Short Summary Dropdown (Optional) */}
                    <div>
                        <label htmlFor="bug-title" className="block text-sm font-semibold text-gray-700 mb-1">
                            2. Short Summary (Optional)
                        </label>
                        <div className="relative">
                            <select
                                id="bug-title"
                                value={title}
                                onChange={(e) => {
                                    setTitle(e.target.value);
                                    if(e.target.value !== "Custom Summary") {
                                        setCustomTitle('');
                                    }
                                }}
                                className="w-full appearance-none px-3 py-2 border border-gray-300 rounded-lg bg-white focus:ring-blue-500 focus:border-blue-500 transition shadow-sm cursor-pointer pr-8 text-sm text-gray-800"
                                disabled={isSubmitting}
                            >
                                {CONTENT_PRESETS[feedbackType].summaries.map((summary, index) => (
                                    <option 
                                        key={index} 
                                        value={summary}
                                        className={index === 0 ? 'text-gray-400' : 'text-gray-800'}
                                    >
                                        {summary}
                                    </option>
                                ))}
                                <option value="Custom Summary">-- Custom Summary --</option>
                            </select>
                            <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                        </div>
                        {/* Custom entry if selected */}
                        {title === "Custom Summary" && (
                            <input
                                type="text"
                                value={customTitle}
                                onChange={(e) => setCustomTitle(e.target.value)}
                                placeholder="Enter your custom summary here"
                                className="w-full mt-2 px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition shadow-sm text-sm"
                                disabled={isSubmitting}
                                maxLength={100} 
                            />
                        )}
                    </div>

                    {/* 3. Detailed Description (Optional) */}
                    <div>
                        <label htmlFor="description" className="block text-sm font-semibold text-gray-700 mb-1">
                            3. Detailed Description (Optional)
                        </label>
                        <textarea
                            id="description"
                            rows={4} 
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Please provide any relevant details, steps, or suggestions here."
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition shadow-sm resize-none text-sm"
                            disabled={isSubmitting}
                        />
                    </div>
                    
                    {/* 4. Attached Image (Optional) */}
                    <div>
                        <label htmlFor="image-attachment" className="flex items-center text-sm font-semibold text-gray-700 mb-1">
                            <Image className="w-4 h-4 mr-1 text-blue-600" /> 4. Attached Image (Optional)
                        </label>
                        <input
                            id="image-attachment"
                            type="file"
                            accept="image/*"
                            onChange={handleImageChange}
                            className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-gray-100 file:text-gray-700 hover:file:bg-gray-200"
                            disabled={isSubmitting}
                        />
                        {imageFile && (
                            <p className="mt-1 text-xs text-gray-500">
                                Attached: {imageFile.name} ({(imageFile.size / 1024).toFixed(1)} KB)
                            </p>
                        )}
                    </div>


                    {/* 5. Satisfaction Stars (Mandatory) */}
                    <div className={`pt-3 p-4 rounded-xl shadow-inner transition-all duration-300 ${satisfaction === 0 ? 'bg-green-50 border border-blue-400' : 'bg-blue-50 border border-blue-300'}`}>
                        <label className="block text-sm font-extrabold text-gray-700 mb-3 uppercase tracking-wide">
                            5. Overall Satisfaction Rating <span className="text-red-600">*</span>
                        </label>
                        <div className="flex flex-col space-y-2">
                            
                            <div className="flex items-center space-x-2">
                                <div className="flex space-x-0.5">
                                    {renderStars()}
                                </div>
                                <span className="text-xs font-bold text-gray-700">
                                    {satisfaction > 0 ? `(${selectedSatisfaction.value}/5 Stars - ${selectedSatisfaction.label})` : <span className="text-red-600 font-bold"></span>}
                                </span>
                            </div>

                            <p className={`text-xs font-medium ${satisfaction === 0 ? 'text-green-800' : 'text-gray-700'}`}>
                                <span className="transition-colors duration-150">
                                    {getSatisfactionDescription()}
                                </span>
                            </p>
                        </div>
                    </div>

                    {/* Message Display */}
                    {message && (
                        <div className={`p-3 rounded-lg border-l-4 font-medium shadow-md ${messageStyles[message.type]}`}>
                            {message.text}
                        </div>
                    )}

                    {/* Submit Button */}
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className={`w-full flex justify-center items-center space-x-2 px-3 py-2.5 text-base font-bold rounded-lg transition-all duration-300 ease-in-out backdrop-blur-md 
                            ${isSubmitting 
                                ? 'bg-blue-400/50 text-white cursor-not-allowed border border-blue-300/50' 
                                : 'bg-white/30 text-blue-800 border border-blue-300/50 shadow-lg shadow-blue-500/20 hover:bg-white/50 hover:shadow-xl hover:shadow-blue-500/30'
                            }
                        `}
                    >
                        {isSubmitting ? (
                            <>
                                <Loader2 className="w-4 h-4 animate-spin" /> 
                                <span>Submitting...</span>
                            </>
                        ) : (
                            <>
                                <Send className="w-4 h-4 -rotate-45" /> 
                                <span>Submit {feedbackType}</span>
                            </>
                        )}
                    </button>

                </form>

            </div>
        </div>
    );
};

export default BugReportApp;