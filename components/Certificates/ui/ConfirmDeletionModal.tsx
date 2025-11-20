// D:\ssistudios\ssistudios\components\Certificates\ui\ConfirmDeletionModal.tsx

import React from 'react';
import { AlertCircle, Loader2 } from 'lucide-react';

interface ConfirmDeletionModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => Promise<void>;
    isDeleting: boolean;
    count: number;
    itemName: string; // e.g., 'certificate' or 'certificate(s)'
}

const ConfirmDeletionModal: React.FC<ConfirmDeletionModalProps> = ({
    isOpen,
    onClose,
    onConfirm,
    isDeleting,
    count,
    itemName,
}) => {
    if (!isOpen) return null;

    // Determine the message based on single or bulk deletion
    const displayItemName = count > 1 ? itemName.replace(/\(s\)$/, 's') : itemName.replace(/\(s\)$/, '');
    const message = count > 1 
        ? `Are you sure you want to delete these ${count} ${displayItemName}?`
        : `Are you sure you want to delete this ${displayItemName}?`;

    return (
        // Backdrop
        <div className="fixed inset-0 z-[1001] bg-gray-900 bg-opacity-50 flex items-center justify-center p-4" onClick={onClose}>
            
            {/* Modal Card */}
            <div 
                className="bg-white rounded-xl p-8 max-w-sm w-full mx-auto shadow-2xl transition-all duration-300 transform scale-100 opacity-100"
                onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside the modal
            >
                
                <div className="flex flex-col items-center space-y-4">
                    {/* Icon - Styled like the image */}
                    <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                        <AlertCircle className="w-8 h-8 text-red-600" />
                    </div>

                    {/* Title */}
                    <h3 className="text-xl font-bold text-gray-900 mt-2">
                        Confirm Deletion
                    </h3>

                    {/* Message */}
                    <p className="text-sm text-gray-500 text-center">
                        {message} This action cannot be undone.
                    </p>

                    {/* Action Buttons */}
                    <div className="flex w-full space-x-3 pt-4">
                        <button
                            onClick={onClose}
                            disabled={isDeleting}
                            className="flex-1 px-4 py-2 text-sm font-semibold rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 transition duration-150 disabled:opacity-50 disabled:cursor-wait"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={onConfirm}
                            disabled={isDeleting}
                            className={`flex-1 px-4 py-2 text-sm font-semibold rounded-lg text-white transition duration-150 shadow-md flex items-center justify-center ${
                                isDeleting 
                                    ? 'bg-red-400 cursor-wait' 
                                    : 'bg-red-600 hover:bg-red-700'
                            }`}
                        >
                            {isDeleting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                            Delete
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ConfirmDeletionModal;