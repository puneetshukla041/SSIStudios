// D:\ssistudios\ssistudios\components\Certificates\ui\TableRow.tsx

import React from 'react';
import {
    Save,
    X,
    Edit,
    Trash2,
    Loader2,
    BadgeCheck,
    Square,
    FileText,
    FileCheck,
    Mail,
} from 'lucide-react';
import { ICertificateClient, PAGE_LIMIT } from '../utils/constants'; 
import { getHospitalColor, doiToDateInput, dateInputToDoi } from '../utils/helpers';

interface TableRowProps {
    cert: ICertificateClient;
    index: number; 
    currentPage: number; 
    isSelected: boolean;
    isEditing: boolean;
    isFlashing: boolean;
    isDeleting: boolean;
    generatingPdfId: string | null;
    generatingPdfV1Id: string | null;
    isAnyActionLoading: boolean; // Global disable flag
    editFormData: Partial<ICertificateClient>;
    handleSelectOne: (id: string, checked: boolean) => void;
    handleEdit: (certificate: ICertificateClient) => void;
    handleSave: (id: string) => Promise<void>;
    handleDelete: (id: string) => Promise<void>;
    handleChange: (field: keyof ICertificateClient, value: string) => void;
    setEditingId: React.Dispatch<React.SetStateAction<string | null>>;
    handleGeneratePDF_V1: (cert: ICertificateClient) => void;
    handleGeneratePDF_V2: (cert: ICertificateClient) => void;
    handleMailCertificate: (cert: ICertificateClient, template: 'certificate1.pdf' | 'certificate2.pdf') => void;
}

const TableRow: React.FC<TableRowProps> = ({
    cert,
    index, 
    currentPage, 
    isSelected,
    isEditing,
    isFlashing,
    isDeleting,
    generatingPdfId,
    generatingPdfV1Id,
    isAnyActionLoading, 
    editFormData,
    handleSelectOne,
    handleEdit,
    handleSave,
    handleDelete,
    handleChange,
    setEditingId,
    handleGeneratePDF_V1,
    handleGeneratePDF_V2,
    handleMailCertificate,
}) => {
    // Animation Classes
    const rowClasses = `
        transition-all duration-300 ease-in-out bg-white/80
        ${isDeleting ? 'opacity-0 transform translate-x-1/2 scale-x-95 pointer-events-none h-0' : ''}
        hover:bg-white hover:shadow-sm
        ${isSelected ? 'bg-sky-100/50' : ''}
    `;
    
    // FIX: Apply the flashing background color directly via style for smoothness
    const flashingStyle = {
        backgroundColor: isFlashing ? 'rgba(167, 243, 208, 0.5)' : undefined, 
        boxShadow: isFlashing ? '0 0 10px rgba(16, 185, 129, 0.5)' : undefined,
    };

    const serialNumber = (currentPage - 1) * PAGE_LIMIT + index + 1;

    const isPdfGenerating = generatingPdfId === cert._id || generatingPdfV1Id === cert._id;
    const isDisabled = isPdfGenerating || isAnyActionLoading || isEditing; 

    return (
        <tr
            key={cert._id}
            className={rowClasses}
            // FIX: Explicitly set transition property and merge flashing style
            style={{ 
                transitionProperty: 'opacity, transform, background-color, box-shadow',
                ...flashingStyle,
            }}
        >
            {/* Checkbox for individual selection */}
            <td className="px-3 py-3 text-center whitespace-nowrap w-12 border-r border-gray-200">
                <label className="cursor-pointer flex items-center justify-center">
                    <input
                        type="checkbox"
                        className="hidden"
                        checked={isSelected}
                        onChange={(e) => handleSelectOne(cert._id, e.target.checked)}
                        aria-label={`Select certificate ${cert.certificateNo}`}
                        disabled={isDisabled}
                    />
                    {isSelected ? (
                        <BadgeCheck className="w-5 h-5 text-sky-600" />
                    ) : (
                        <Square className="w-5 h-5 text-gray-400" />
                    )}
                </label>
            </td>
            
            {/* SERIAL NUMBER COLUMN */}
            <td className="px-4 py-2 whitespace-nowrap text-sm font-semibold text-gray-600 border-r border-gray-200 w-16 text-center">
                {serialNumber}
            </td>

            {/* Data Cells (UNCHANGED) */}
            {(['certificateNo', 'name', 'hospital', 'doi'] as (keyof ICertificateClient)[]).map((field) => {
                 const displayValue = field === 'hospital' 
                    ? <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${getHospitalColor(cert.hospital)}`}>
                        {cert.hospital}
                      </span>
                    : cert[field];

                const editInput = field === 'doi' 
                    ? <input
                        type="date"
                        value={doiToDateInput(editFormData[field] as string || '')}
                        onChange={(e) => handleChange(field, dateInputToDoi(e.target.value))}
                        className="w-full p-1 border border-sky-300 rounded-md focus:ring-1 focus:ring-sky-500 transition duration-150 shadow-inner bg-white/90 text-gray-800 outline-none"
                        aria-label={`Edit ${field}`}
                      />
                    : <input
                        type="text"
                        value={editFormData[field] as string || ''}
                        onChange={(e) => handleChange(field, e.target.value)}
                        className="w-full p-1 border border-sky-300 rounded-md focus:ring-1 focus:ring-sky-500 transition duration-150 shadow-inner bg-white/90 text-gray-800 outline-none"
                        aria-label={`Edit ${field}`}
                      />;

                return (
                    <td key={field} className="px-4 py-2 whitespace-nowrap text-sm text-gray-800 border-r border-gray-200">
                        {isEditing ? editInput : displayValue}
                    </td>
                );
            })}

            {/* Action Buttons */}
            <td className="px-4 py-2 whitespace-nowrap text-sm font-medium">
                {isEditing ? (
                    <div className="flex space-x-2">
                        {/* Save Button */}
                        <button
                            onClick={() => handleSave(cert._id)}
                            className="text-white bg-green-600/90 hover:bg-green-700 p-2 rounded-full w-8 h-8 flex items-center justify-center transition transform hover:scale-110 shadow-lg cursor-pointer"
                            title="Save"
                            aria-label="Save changes"
                        >
                            <Save className="w-4 h-4" />
                        </button>
                        {/* Cancel Button */}
                        <button
                            onClick={() => setEditingId(null)}
                            className="text-white bg-gray-500/90 hover:bg-gray-600 p-2 rounded-full w-8 h-8 flex items-center justify-center transition transform hover:scale-110 shadow-lg cursor-pointer"
                            title="Cancel"
                            aria-label="Cancel editing"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                ) : (
                    <div className="flex space-x-2">
                        {/* Send Mail Button (V1) */}
                        <button
                            onClick={() => handleMailCertificate(cert, 'certificate1.pdf')}
                            disabled={isDisabled}
                            className={`text-white p-2 rounded-full w-8 h-8 flex items-center justify-center transition transform hover:scale-110 cursor-pointer shadow-md hover:shadow-lg ${
                                isDisabled 
                                    ? 'bg-gray-400/90 cursor-not-allowed shadow-inner'
                                    : 'bg-orange-600/90 hover:bg-orange-700'
                            }`}
                            title="Email Certificate (V1)"
                            aria-label="Email V1 certificate"
                        >
                            {isPdfGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Mail className="w-4 h-4" />}
                        </button>
                        
                        {/* Send Mail Button (V2) */}
                        <button
                            onClick={() => handleMailCertificate(cert, 'certificate2.pdf')}
                            disabled={isDisabled}
                            className={`text-white p-2 rounded-full w-8 h-8 flex items-center justify-center transition transform hover:scale-110 cursor-pointer shadow-md hover:shadow-lg ${
                                isDisabled 
                                    ? 'bg-gray-400/90 cursor-not-allowed shadow-inner'
                                    : 'bg-red-600/90 hover:bg-red-700'
                            }`}
                            title="Email Certificate (V2)"
                            aria-label="Email V2 certificate"
                        >
                            {isPdfGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Mail className="w-4 h-4" />}
                        </button>

                        {/* Generate PDF Button (Template V1) */}
                        <button
                            onClick={() => handleGeneratePDF_V1(cert)}
                            disabled={isDisabled}
                            className={`text-white p-2 rounded-full w-8 h-8 flex items-center justify-center transition transform hover:scale-110 cursor-pointer shadow-md hover:shadow-lg ${
                                generatingPdfV1Id === cert._id 
                                    ? 'bg-yellow-500/70 shadow-inner' 
                                    : 'bg-emerald-600/90 hover:bg-emerald-700'
                            }`}
                            title="Download PDF (V1)"
                            aria-label="Generate and download PDF certificate (Version 1)"
                        >
                            {generatingPdfV1Id === cert._id ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                                <FileCheck className="w-4 h-4" />
                            )}
                        </button>

                        {/* Generate PDF Button (Template V2) */}
                        <button
                            onClick={() => handleGeneratePDF_V2(cert)}
                            disabled={isDisabled}
                            className={`text-white p-2 rounded-full w-8 h-8 flex items-center justify-center transition transform hover:scale-110 cursor-pointer shadow-md hover:shadow-lg ${
                                generatingPdfId === cert._id 
                                    ? 'bg-yellow-500/70 shadow-inner' 
                                    : 'bg-purple-600/90 hover:bg-purple-700'
                            }`}
                            title="Download PDF (V2)"
                            aria-label="Generate and download PDF certificate (Version 2)"
                        >
                            {generatingPdfId === cert._id ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                                <FileText className="w-4 h-4" />
                            )}
                        </button>

                        {/* Edit Button */}
                        <button
                            onClick={() => handleEdit(cert)}
                            disabled={isDisabled}
                            className={`p-2 rounded-full w-8 h-8 flex items-center justify-center transition transform hover:scale-110 cursor-pointer shadow-md hover:shadow-lg ${
                                isDisabled 
                                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed' 
                                    : 'text-sky-700 hover:text-white bg-sky-100/70 hover:bg-sky-600'
                            }`}
                            title="Edit"
                            aria-label="Edit certificate"
                        >
                            <Edit className="w-4 h-4" />
                        </button>

                        {/* Delete Button */}
                        <button
                            onClick={() => handleDelete(cert._id)}
                            disabled={isDisabled}
                            className={`p-2 rounded-full w-8 h-8 flex items-center justify-center transition transform hover:scale-110 cursor-pointer shadow-md hover:shadow-lg ${
                                isDisabled 
                                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                    : 'text-red-600 hover:text-white bg-red-100/70 hover:bg-red-600'
                            }`}
                            title="Delete"
                            aria-label="Delete certificate"
                        >
                            <Trash2 className="w-4 h-4" />
                        </button>
                    </div>
                )}
            </td>
        </tr>
    );
};

export default TableRow;