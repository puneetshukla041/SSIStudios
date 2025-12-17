import React from 'react';
import {
    Save,
    X,
    Edit3,
    Trash2,
    Check,
    FileText,
    Calendar,
    Building2,
    User,
} from 'lucide-react';
import { ICertificateClient, PAGE_LIMIT } from '../utils/constants';
import { getHospitalColor, doiToDateInput, dateInputToDoi, formatName } from '../utils/helpers'; // ✅ Import formatName
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
}) => {

    const serialNumber = (currentPage - 1) * PAGE_LIMIT + index + 1;
    const isPdfGenerating = generatingPdfId === cert._id || generatingPdfV1Id === cert._id;
    const isDisabled = isPdfGenerating || isAnyActionLoading || (isEditing && !editFormData);

    const MobileLabel = ({ children }: { children: React.ReactNode }) => (
        <span className="md:hidden text-[10px] font-bold text-slate-400 uppercase tracking-wider mr-2 min-w-[80px]">
            {children}
        </span>
    );

    return (
        <tr
            className={clsx(
                "block md:table-row mb-4 md:mb-0 bg-white md:bg-transparent rounded-xl md:rounded-none shadow-[0_2px_8px_-2px_rgba(0,0,0,0.1)] md:shadow-none border border-slate-200 md:border-0 md:border-b md:border-slate-100",
                isSelected ? "md:bg-indigo-50/60 ring-1 ring-indigo-500 md:ring-0" : "hover:bg-slate-50",
                isDeleting && "opacity-0 -translate-x-4 pointer-events-none transition-all duration-300",
                isEditing && "bg-amber-50/50"
            )}
            style={isFlashing ? { backgroundColor: 'rgba(240, 253, 244, 1)', transition: 'background-color 0.5s ease' } : {}}                                                                 
        >
            {/* CHECKBOX */}
            <td className="flex md:table-cell items-center justify-between p-3 md:px-4 md:py-4 border-b border-slate-100 md:border-0">
                <MobileLabel>Select</MobileLabel>
                <div className="flex items-center justify-center md:justify-center w-full md:w-auto">
                    <label className={clsx(
                        "relative flex items-center justify-center w-8 h-8 rounded-full transition-colors hover:bg-slate-100",
                        isDisabled ? "cursor-not-allowed" : "cursor-pointer"
                    )}>
                        <input
                            type="checkbox"
                            className={clsx(
                                "peer appearance-none w-5 h-5 border-2 border-slate-300 rounded-md checked:bg-indigo-600 checked:border-indigo-600 transition-all duration-200",
                                isDisabled ? "cursor-not-allowed" : "cursor-pointer"
                            )}
                            checked={isSelected}
                            onChange={(e) => handleSelectOne(cert._id, e.target.checked)}
                            disabled={isDisabled}
                        />
                        <Check className="absolute w-3.5 h-3.5 text-white opacity-0 peer-checked:opacity-100 pointer-events-none transition-opacity duration-200 scale-0 peer-checked:scale-100" strokeWidth={3} />
                    </label>
                </div>
            </td>

            {/* SERIAL NUMBER */}
            <td className="hidden md:table-cell px-4 py-4 text-center">
                <span className="text-xs font-medium text-slate-400 font-mono">
                    {String(serialNumber).padStart(2, '0')}
                </span>
            </td>

            {/* Certificate No */}
            <td className="flex md:table-cell items-center justify-between p-3 md:px-4 md:py-4 border-b border-slate-100 md:border-0">
                <MobileLabel>Cert No.</MobileLabel>
                <div className="w-full md:w-auto text-right md:text-left">
                    {isEditing ? (
                        <input
                            type="text"
                            value={editFormData.certificateNo || ''}
                            onChange={(e) => handleChange('certificateNo', e.target.value)}
                            className="w-full md:w-auto px-3 py-1.5 text-sm bg-white border border-amber-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500/30 shadow-sm cursor-text text-right md:text-left"
                            placeholder="Cert No."
                        />
                    ) : (
                        <div className="flex items-center justify-end md:justify-start gap-2">
                            <div className="p-1.5 rounded-md bg-slate-50 text-slate-400 hidden md:block">
                                <FileText className="w-3.5 h-3.5" />
                            </div>
                            <span className="text-sm font-bold text-slate-700 font-mono tracking-tight break-all">
                                {cert.certificateNo}
                            </span>
                        </div>
                    )}
                </div>
            </td>

            {/* Name - ✅ Using formatName here */}
            <td className="flex md:table-cell items-center justify-between p-3 md:px-4 md:py-4 border-b border-slate-100 md:border-0">
                <MobileLabel>Name</MobileLabel>
                <div className="w-full md:w-auto text-right md:text-left">
                    {isEditing ? (
                        <input
                            type="text"
                            value={editFormData.name || ''}
                            onChange={(e) => handleChange('name', e.target.value)}
                            className="w-full md:w-auto px-3 py-1.5 text-sm bg-white border border-amber-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500/30 shadow-sm cursor-text text-right md:text-left"
                            placeholder="Name"
                        />
                    ) : (
                        <div className="flex items-center justify-end md:justify-start gap-2.5">
                            <div className="w-8 h-8 rounded-full bg-slate-100 hidden md:flex items-center justify-center text-slate-400 shrink-0">
                                <User className="w-4 h-4" />
                            </div>
                            <span className="text-sm font-semibold text-slate-900 line-clamp-1">
                                {formatName(cert.name)} {/* Formatted for display */}
                            </span>
                        </div>
                    )}
                </div>
            </td>

            {/* Hospital */}
            <td className="flex md:table-cell items-center justify-between p-3 md:px-4 md:py-4 border-b border-slate-100 md:border-0">
                <MobileLabel>Hospital</MobileLabel>
                <div className="w-full md:w-auto text-right md:text-left">
                    {isEditing ? (
                        <input
                            type="text"
                            value={editFormData.hospital || ''}
                            onChange={(e) => handleChange('hospital', e.target.value)}
                            className="w-full md:w-auto px-3 py-1.5 text-sm bg-white border border-amber-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500/30 shadow-sm cursor-text text-right md:text-left"
                            placeholder="Hospital"
                        />
                    ) : (
                        <span className={clsx(
                            "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border shadow-sm cursor-default",
                            getHospitalColor(cert.hospital)
                        )}>
                            <Building2 className="w-3 h-3" />
                            {cert.hospital}
                        </span>
                    )}
                </div>
            </td>

            {/* Date of Issue */}
            <td className="flex md:table-cell items-center justify-between p-3 md:px-4 md:py-4 border-b border-slate-100 md:border-0">
                <MobileLabel>Date</MobileLabel>
                <div className="w-full md:w-auto text-right md:text-left">
                    {isEditing ? (
                        <input
                            type="date"
                            value={doiToDateInput(editFormData.doi || '')}
                            onChange={(e) => handleChange('doi', dateInputToDoi(e.target.value))}
                            className="w-full md:w-auto px-3 py-1.5 text-sm bg-white border border-amber-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500/30 shadow-sm cursor-pointer"
                        />
                    ) : (
                        <div className="flex items-center justify-end md:justify-start gap-2 text-slate-500">
                            <Calendar className="w-3.5 h-3.5 hidden md:block" />
                            <span className="text-sm">
                                {cert.doi}
                            </span>
                        </div>
                    )}
                </div>
            </td>

            {/* ACTION BUTTONS */}
            <td className="block md:table-cell p-3 md:px-4 md:py-4 bg-slate-50 md:bg-transparent rounded-b-xl md:rounded-none border-t border-slate-200 md:border-0">
                <div className="w-full md:w-auto relative">
                    {isEditing ? (
                        <div className="flex items-center gap-2 animate-in fade-in zoom-in duration-200 w-full justify-end">
                            <button
                                onClick={() => handleSave(cert._id)}
                                className="flex-1 md:flex-none justify-center flex items-center gap-1.5 px-3 py-2 md:py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium rounded-md shadow-sm transition-all cursor-pointer active:scale-95"
                            >
                                <Save className="w-3.5 h-3.5" />
                                Save
                            </button>
                            <button
                                onClick={() => setEditingId(null)}
                                className="flex-1 md:flex-none justify-center flex items-center gap-1.5 px-3 py-2 md:py-1.5 bg-white border border-slate-200 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200 text-slate-600 text-xs font-medium rounded-md shadow-sm transition-all cursor-pointer active:scale-95"
                            >
                                <X className="w-3.5 h-3.5" />
                                Cancel
                            </button>
                        </div>
                    ) : (
                        <div className="flex items-center justify-end gap-2">
                            <button
                                onClick={() => handleEdit(cert)}
                                disabled={isDisabled}
                                className={clsx(
                                    "p-2.5 md:p-2 rounded-lg transition-all duration-200 flex items-center justify-center",
                                    isDisabled
                                        ? "text-slate-300 cursor-not-allowed bg-slate-100"
                                        : "text-slate-500 hover:text-amber-600 hover:bg-amber-50 cursor-pointer active:scale-90 bg-white md:bg-transparent border border-slate-200 md:border-0 shadow-sm md:shadow-none"
                                )}
                                title="Edit Record"
                            >
                                <Edit3 className="w-4 h-4" />
                            </button>

                            <button
                                onClick={() => handleDelete(cert._id)}
                                disabled={isDisabled}
                                className={clsx(
                                    "p-2.5 md:p-2 rounded-lg transition-all duration-200 flex items-center justify-center",
                                    isDisabled
                                        ? "text-slate-300 cursor-not-allowed bg-slate-100"
                                        : "text-slate-500 hover:text-rose-600 hover:bg-rose-50 cursor-pointer active:scale-90 bg-white md:bg-transparent border border-slate-200 md:border-0 shadow-sm md:shadow-none"
                                )}
                                title="Delete Record"
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>
                        </div>
                    )}
                </div>
            </td>
        </tr>
    );
};

export default TableRow;