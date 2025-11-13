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
} from 'lucide-react';
import { ICertificateClient } from '../utils/constants';
import { getHospitalColor, doiToDateInput, dateInputToDoi } from '../utils/helpers';

interface TableRowProps {
    cert: ICertificateClient;
    isSelected: boolean;
    isEditing: boolean;
    isFlashing: boolean;
    isDeleting: boolean;
    generatingPdfId: string | null;
    generatingPdfV1Id: string | null;
    editFormData: Partial<ICertificateClient>;
    handleSelectOne: (id: string, checked: boolean) => void;
    handleEdit: (certificate: ICertificateClient) => void;
    handleSave: (id: string) => Promise<void>;
    handleDelete: (id: string) => Promise<void>;
    handleChange: (field: keyof ICertificateClient, value: string) => void;
    setEditingId: React.Dispatch<React.SetStateAction<string | null>>;
    handleGeneratePDF_V1: (cert: ICertificateClient) => void;
    handleGeneratePDF_V2: (cert: ICertificateClient) => void;
}

const TableRow: React.FC<TableRowProps> = ({
    cert,
    isSelected,
    isEditing,
    isFlashing,
    isDeleting,
    generatingPdfId,
    generatingPdfV1Id,
    editFormData,
    handleSelectOne,
    handleEdit,
    handleSave,
    handleDelete,
    handleChange,
    setEditingId,
    handleGeneratePDF_V1,
    handleGeneratePDF_V2,
}) => {
    // Animation Classes
    const rowClasses = `
        transition-all duration-300 ease-in-out bg-white/80
        ${isDeleting ? 'opacity-0 transform translate-x-1/2 scale-x-95 pointer-events-none h-0' : ''}
        ${isFlashing ? 'bg-emerald-200/50 shadow-sm' : ''}
        hover:bg-white hover:shadow-sm
        ${isSelected && !isFlashing ? 'bg-sky-100/50' : ''}
    `;

    return (
        <tr
            key={cert._id}
            className={rowClasses}
            style={{ transitionProperty: 'opacity, transform, background-color, box-shadow' }}
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
                    />
                    {isSelected ? (
                        <BadgeCheck className="w-5 h-5 text-sky-600" />
                    ) : (
                        <Square className="w-5 h-5 text-gray-400" />
                    )}
                </label>
            </td>

            {/* Data Cells */}
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
                        <button
                            onClick={() => handleSave(cert._id)}
                            className="text-white bg-green-600/90 hover:bg-green-700 p-2 rounded-full w-8 h-8 flex items-center justify-center transition transform hover:scale-110 shadow-lg cursor-pointer"
                            title="Save"
                            aria-label="Save changes"
                        >
                            <Save className="w-4 h-4" />
                        </button>
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
                        {/* Generate PDF Button (Template V1 - Green) */}
                        <button
                            onClick={() => handleGeneratePDF_V1(cert)}
                            disabled={generatingPdfV1Id === cert._id}
                            className={`text-white p-2 rounded-full w-8 h-8 flex items-center justify-center transition transform hover:scale-110 cursor-pointer shadow-md hover:shadow-lg ${
                                generatingPdfV1Id === cert._id ? 'bg-yellow-500/70' : 'bg-emerald-600/90 hover:bg-emerald-700'
                            }`}
                            title="Generate PDF (V1)"
                            aria-label="Generate and download PDF certificate (Version 1)"
                        >
                            {generatingPdfV1Id === cert._id ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                                <FileCheck className="w-4 h-4" />
                            )}
                        </button>

                        {/* Generate PDF Button (Template V2 - Original Purple) */}
                        <button
                            onClick={() => handleGeneratePDF_V2(cert)}
                            disabled={generatingPdfId === cert._id}
                            className={`text-white p-2 rounded-full w-8 h-8 flex items-center justify-center transition transform hover:scale-110 cursor-pointer shadow-md hover:shadow-lg ${
                                generatingPdfId === cert._id ? 'bg-yellow-500/70' : 'bg-purple-600/90 hover:bg-purple-700'
                            }`}
                            title="Generate PDF (V2)"
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
                            className="text-sky-700 hover:text-white bg-sky-100/70 hover:bg-sky-600 p-2 rounded-full w-8 h-8 flex items-center justify-center transition transform hover:scale-110 cursor-pointer shadow-md hover:shadow-lg"
                            title="Edit"
                            aria-label="Edit certificate"
                        >
                            <Edit className="w-4 h-4" />
                        </button>

                        {/* Delete Button */}
                        <button
                            onClick={() => handleDelete(cert._id)}
                            className="text-red-600 hover:text-white bg-red-100/70 hover:bg-red-600 p-2 rounded-full w-8 h-8 flex items-center justify-center transition transform hover:scale-110 cursor-pointer shadow-md hover:shadow-lg"
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