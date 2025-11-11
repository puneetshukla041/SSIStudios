// components/ui/LoadingSpinner.tsx
import React from 'react';

const LoadingSpinner: React.FC = () => (
  <div className="flex justify-center items-center py-4">
    <div className="w-8 h-8 border-4 border-t-4 border-t-indigo-500 border-indigo-200 rounded-full animate-spin"></div>
  </div>
);

export default LoadingSpinner;