'use client'
import React, { useState, useEffect, useCallback } from 'react';
import { ShieldAlert, Send, Star } from 'lucide-react';

const BugReportApp: React.FC = () => {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [rating, setRating] = useState(5);
    const [userId, setUserId] = useState<string>('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [message, setMessage] = useState<{ text: string, type: 'success' | 'error' | 'info' } | null>(null);

    useEffect(() => {
        // You can replace this with your actual auth later
        setUserId(crypto.randomUUID());
    }, []);

    const handleSubmit = useCallback(async (e: React.FormEvent) => {
        e.preventDefault();

        if (!title.trim() || !description.trim()) {
            setMessage({ text: 'Please fill in both title and description.', type: 'error' });
            return;
        }

        setIsSubmitting(true);
        setMessage(null);

        try {
            const res = await fetch('/api/bug-report', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId,
                    title,
                    description,
                    rating
                })
            });

            const data = await res.json();

            if (!res.ok) throw new Error(data.error || "Unknown error");

            setMessage({ text: 'Bug report submitted successfully!', type: 'success' });
            setTitle('');
            setDescription('');
            setRating(5);
        } catch (error: any) {
            setMessage({ text: error.message, type: 'error' });
        } finally {
            setIsSubmitting(false);
        }
    }, [userId, title, description, rating]);

    const renderStars = (currentRating: number) => {
        const stars = [];
        for (let i = 1; i <= 5; i++) {
            stars.push(
                <Star 
                    key={i} 
                    className={`w-6 h-6 ${i <= currentRating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`} 
                />
            );
        }
        return stars;
    };

    return (
        <div className="min-h-screen bg-gray-50 p-4 sm:p-8 flex justify-center items-start">
            <div className="w-full max-w-2xl bg-white shadow-xl rounded-2xl p-6 sm:p-10 border border-red-200">

                <header className="flex items-center space-x-3 mb-8 border-b pb-4">
                    <ShieldAlert className="w-8 h-8 text-red-600" />
                    <h1 className="text-3xl font-extrabold text-gray-900">Report a Bug</h1>
                </header>

                <div className="mb-4 p-3 bg-red-50 border border-red-300 text-red-800 rounded-lg text-sm">
                    <p className="font-medium">User ID:</p>
                    <p className="break-all font-mono text-xs mt-1 bg-red-100 p-1 rounded">
                        {userId}
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Bug Title
                        </label>
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="w-full px-4 py-2 border rounded-lg"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Detailed Description
                        </label>
                        <textarea
                            rows={4}
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            className="w-full px-4 py-2 border rounded-lg"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Frustration Level
                        </label>
                        <div className="flex items-center space-x-4">
                            <input
                                type="range"
                                min="1"
                                max="5"
                                value={rating}
                                onChange={(e) => setRating(Number(e.target.value))}
                                className="flex-1"
                            />
                            <div className="flex space-x-1">
                                {renderStars(rating)}
                            </div>
                        </div>
                    </div>

                    {message && (
                        <div className={`p-4 rounded-lg border ${
                            message.type === 'success' ? 'bg-green-100 text-green-800' :
                            message.type === 'error' ? 'bg-red-100 text-red-800' :
                            'bg-blue-100 text-blue-800'
                        }`}>
                            {message.text}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className={`w-full flex justify-center items-center space-x-2 px-4 py-3 rounded-xl ${
                            isSubmitting ? 'bg-gray-400' : 'bg-red-600 text-white hover:bg-red-700'
                        }`}
                    >
                        {isSubmitting ? "Submitting..." : <><Send className="w-5 h-5" /> Submit Report</>}
                    </button>

                </form>

            </div>
        </div>
    );
};

export default BugReportApp;
