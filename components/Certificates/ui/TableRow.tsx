import React from 'react';
import {
    Save,
    X,
    Edit3,
    Trash2,
    Loader2,
    Check,
    FileText,
    FileCheck,
    Mail,
    Calendar,
    Building2,
    User
} from 'lucide-react';
import { ICertificateClient, PAGE_LIMIT } from '../utils/constants';
import { getHospitalColor, doiToDateInput, dateInputToDoi } from '../utils/helpers';
import clsx from 'clsx';

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
    isAnyActionLoading: boolean;
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

// Reusable Action Button Component for consistency
const ActionButton = ({ 
    onClick, 
    disabled, 
    icon: Icon, 
    isLoading, 
    variant = 'default',
    title 
}: { 
    onClick: () => void; 
    disabled: boolean; 
    icon: React.ElementType; 
    isLoading?: boolean; 
    variant?: 'default' | 'primary' | 'danger' | 'success' | 'indigo' | 'sky' | 'warning';
    title: string;
}) => {
    
    const variants = {
        default: "text-slate-400 hover:text-slate-600 hover:bg-slate-100",
        primary: "text-indigo-500 hover:text-indigo-600 hover:bg-indigo-50",
        danger: "text-slate-400 hover:text-rose-600 hover:bg-rose-50",
        success: "text-emerald-500 hover:text-emerald-600 hover:bg-emerald-50",
        indigo: "text-slate-400 hover:text-indigo-600 hover:bg-indigo-50",
        sky: "text-slate-400 hover:text-sky-600 hover:bg-sky-50",
        warning: "text-slate-400 hover:text-amber-600 hover:bg-amber-50",
    };

    return (
        <button
            onClick={onClick}
            disabled={disabled || isLoading}
            title={title}
            className={clsx(
                "p-2 rounded-lg transition-all duration-200 outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/20",
                variants[variant],
                (disabled || isLoading) && "opacity-50 cursor-not-allowed pointer-events-none"
            )}
        >
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Icon className="w-4 h-4" />}
        </button>
    );
};

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
    
    const serialNumber = (currentPage - 1) * PAGE_LIMIT + index + 1;
    const isPdfGenerating = generatingPdfId === cert._id || generatingPdfV1Id === cert._id;
    const isDisabled = isPdfGenerating || isAnyActionLoading || (isEditing && !editFormData);

    return (
        <tr
            className={clsx(
                "group border-b border-slate-100 last:border-0 transition-all duration-500",
                isSelected ? "bg-indigo-50/40" : "bg-white hover:bg-slate-50/60",
                isDeleting && "opacity-0 -translate-x-4 pointer-events-none",
                isEditing && "bg-amber-50/30"
            )}
            style={isFlashing ? { backgroundColor: 'rgba(240, 253, 244, 1)', transition: 'background-color 0.5s ease' } : {}}
        >
            {/* CHECKBOX */}
            <td className="px-4 py-4 w-12">
                <div className="flex items-center justify-center">
                    <label className="relative flex items-center justify-center w-5 h-5 cursor-pointer">
                        <input
                            type="checkbox"
                            className="peer appearance-none w-5 h-5 border-2 border-slate-300 rounded-md checked:bg-indigo-600 checked:border-indigo-600 transition-all duration-200"
                            checked={isSelected}
                            onChange={(e) => handleSelectOne(cert._id, e.target.checked)}
                            disabled={isDisabled}
                        />
                        <Check className="absolute w-3.5 h-3.5 text-white opacity-0 peer-checked:opacity-100 pointer-events-none transition-opacity duration-200" strokeWidth={3} />
                    </label>
                </div>
            </td>

            {/* SERIAL NUMBER */}
            <td className="px-4 py-4 text-center">
                <span className="text-xs font-medium text-slate-400 font-mono">
                    {String(serialNumber).padStart(2, '0')}
                </span>
            </td>

            {/* DATA COLUMNS */}
            {/* Certificate No */}
            <td className="px-4 py-4">
                {isEditing ? (
                    <input
                        type="text"
                        value={editFormData.certificateNo || ''}
                        onChange={(e) => handleChange('certificateNo', e.target.value)}
                        className="w-full px-3 py-1.5 text-sm bg-white border border-amber-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500/20 shadow-sm"
                        placeholder="Cert No."
                    />
                ) : (
                    <div className="flex items-center gap-2">
                        <div className="p-1 rounded bg-slate-100 text-slate-400">
                            <FileText className="w-3 h-3" />
                        </div>
                        <span className="text-sm font-semibold text-slate-700 font-mono tracking-tight">
                            {cert.certificateNo}
                        </span>
                    </div>
                )}
            </td>

            {/* Name */}
            <td className="px-4 py-4">
                {isEditing ? (
                    <input
                        type="text"
                        value={editFormData.name || ''}
                        onChange={(e) => handleChange('name', e.target.value)}
                        className="w-full px-3 py-1.5 text-sm bg-white border border-amber-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500/20 shadow-sm"
                        placeholder="Name"
                    />
                ) : (
                    <div className="flex items-center gap-2">
                        <User className="w-3.5 h-3.5 text-slate-400" />
                        <span className="text-sm font-medium text-slate-900">
                            {cert.name}
                        </span>
                    </div>
                )}
            </td>

            {/* Hospital */}
            <td className="px-4 py-4">
                {isEditing ? (
                    <input
                        type="text"
                        value={editFormData.hospital || ''}
                        onChange={(e) => handleChange('hospital', e.target.value)}
                        className="w-full px-3 py-1.5 text-sm bg-white border border-amber-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500/20 shadow-sm"
                        placeholder="Hospital"
                    />
                ) : (
                    <div className="flex items-center gap-2">
                        <span className={clsx(
                            "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border",
                            // This helper should ideally return bg/text/border classes
                            // Assuming helper returns standard tailwind color names, we wrap them:
                            getHospitalColor(cert.hospital) 
                        )}>
                            <Building2 className="w-3 h-3" />
                            {cert.hospital}
                        </span>
                    </div>
                )}
            </td>

            {/* Date of Issue */}
            <td className="px-4 py-4">
                {isEditing ? (
                    <input
                        type="date"
                        value={doiToDateInput(editFormData.doi || '')}
                        onChange={(e) => handleChange('doi', dateInputToDoi(e.target.value))}
                        className="w-full px-3 py-1.5 text-sm bg-white border border-amber-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500/20 shadow-sm"
                    />
                ) : (
                    <div className="flex items-center gap-2 text-slate-500">
                        <Calendar className="w-3.5 h-3.5" />
                        <span className="text-sm">
                            {cert.doi}
                        </span>
                    </div>
                )}
            </td>

            {/* ACTION BUTTONS */}
            <td className="px-4 py-4 w-48">
                <div className="flex items-center justify-end gap-1">
                    {isEditing ? (
                        <div className="flex items-center gap-2 animate-in fade-in zoom-in duration-200">
                            <button
                                onClick={() => handleSave(cert._id)}
                                className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium rounded-md shadow-sm transition-colors"
                            >
                                <Save className="w-3.5 h-3.5" />
                                Save
                            </button>
                            <button
                                onClick={() => setEditingId(null)}
                                className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 text-xs font-medium rounded-md shadow-sm transition-colors"
                            >
                                <X className="w-3.5 h-3.5" />
                                Cancel
                            </button>
                        </div>
                    ) : (
                        <div className="flex items-center gap-0.5 opacity-80 group-hover:opacity-100 transition-opacity">
                            {/* Group: Email Actions */}
                            <div className="flex items-center mr-1">
                                <ActionButton
                                    onClick={() => handleMailCertificate(cert, 'certificate1.pdf')}
                                    disabled={isDisabled}
                                    icon={Mail}
                                    variant="sky"
                                    title="Email V1 Certificate"
                                />
                                <ActionButton
                                    onClick={() => handleMailCertificate(cert, 'certificate2.pdf')}
                                    disabled={isDisabled}
                                    icon={Mail}
                                    variant="indigo"
                                    title="Email V2 Certificate"
                                />
                            </div>

                            <div className="w-px h-4 bg-slate-200 mx-1" />

                            {/* Group: Download Actions */}
                            <div className="flex items-center mr-1">
                                <ActionButton
                                    onClick={() => handleGeneratePDF_V1(cert)}
                                    disabled={isDisabled}
                                    isLoading={generatingPdfV1Id === cert._id}
                                    icon={FileCheck}
                                    variant="sky"
                                    title="Download V1 PDF"
                                />
                                <ActionButton
                                    onClick={() => handleGeneratePDF_V2(cert)}
                                    disabled={isDisabled}
                                    isLoading={generatingPdfId === cert._id}
                                    icon={FileText}
                                    variant="indigo"
                                    title="Download V2 PDF"
                                />
                            </div>

                            <div className="w-px h-4 bg-slate-200 mx-1" />

                            {/* Group: Edit/Delete */}
                            <ActionButton
                                onClick={() => handleEdit(cert)}
                                disabled={isDisabled}
                                icon={Edit3}
                                variant="warning"
                                title="Edit Record"
                            />
                            <ActionButton
                                onClick={() => handleDelete(cert._id)}
                                disabled={isDisabled}
                                icon={Trash2}
                                variant="danger"
                                title="Delete Record"
                            />
                        </div>
                    )}
                </div>
            </td>
        </tr>
    );
};

export default TableRow;