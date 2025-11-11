// components/UploadButton.tsx
'use client';

import React, { useRef, useState } from 'react';
import LoadingSpinner from './ui/LoadingSpinner';

interface UploadButtonProps {
  onUploadSuccess: (message: string) => void;
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
    onUploadError(''); // Clear previous error

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (response.ok && result.success) {
        onUploadSuccess(result.message || 'File uploaded successfully!');
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
        className={`px-4 py-2 text-sm font-semibold rounded-lg shadow-md transition-all duration-200 
          ${isUploading
            ? 'bg-gray-400 text-gray-700 cursor-not-allowed'
            : 'bg-indigo-600 hover:bg-indigo-700 text-white hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2'
          }`}
      >
        {isUploading ? (
          <div className="flex items-center space-x-2">
            <LoadingSpinner />
            <span>Uploading...</span>
          </div>
        ) : (
          <>
            <i className="lucide-upload mr-2"></i>
            Upload Excel Sheet
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