'use client';

import React, { useRef, useState } from 'react';
import { FiUpload, FiLoader } from 'react-icons/fi'; // Using react-icons for consistency

interface UploadButtonProps {
  // Updated signature to accept the list of IDs
  onUploadSuccess: (message: string, uploadedIds?: string[]) => void;
  onUploadError: (message: string) => void;
}

const UploadButton: React.FC<UploadButtonProps> = ({ onUploadSuccess, onUploadError }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    // Basic file validation
    const validExtensions = ['.xlsx', '.xls'];
    const fileExtension = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();

    if (!validExtensions.includes(fileExtension)) {
      onUploadError('Invalid file type. Please upload only .xlsx or .xls files.');
      return;
    }

    setIsUploading(true);
    onUploadError(''); 

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (response.ok && result.success) {
        // ✅ CRITICAL CHANGE: Passing result.ids (or result.data) to the parent
        // Ensure your API returns the key "ids" or "data" containing the array of new ObjectIds
        const newIds = result.ids || result.data || [];
        onUploadSuccess(result.message || 'File uploaded successfully!', newIds);
      } else {
        onUploadError(result.message || 'An unknown error occurred during upload.');
      }
    } catch (error) {
      console.error('Upload failed:', error);
      onUploadError('Network error or server connection failed.');
    } finally {
      setIsUploading(false);
      // Reset file input to allow uploading the same file again
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => fileInputRef.current?.click()}
        disabled={isUploading}
        className={`
          flex items-center justify-center gap-2 px-4 py-2.5 
          text-sm font-semibold rounded-lg shadow-sm transition-all duration-200 
          ${isUploading
            ? 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200'
            : 'bg-indigo-600 hover:bg-indigo-700 text-white hover:shadow-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2'
          }
        `}
      >
        {isUploading ? (
          <>
            <FiLoader className="animate-spin w-4 h-4" />
            <span>Uploading...</span>
          </>
        ) : (
          <>
            <FiUpload className="w-4 h-4" />
            <span>Upload Excel</span>
          </>
        )}
      </button>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept=".xlsx, .xls"
        className="hidden"
      />
    </div>
  );
};

export default UploadButton;