import React from 'react';
import { initialNewCertificateState, ICertificateClient } from '../utils/constants';
import { doiToDateInput, dateInputToDoi } from '../utils/helpers';
import {
    Plus,
    Tag,
    User,
    Hospital,
    Calendar,
    X,
    Save,
    Loader2,
    Sparkles
} from 'lucide-react';

interface AddCertificateFormProps {
    newCertificateData: Omit<ICertificateClient, '_id'>;
    isAdding: boolean;
    handleNewCertChange: (field: keyof Omit<ICertificateClient, '_id'>, value: string) => void;
    handleAddCertificate: () => Promise<void>;
    setIsAddFormVisible: React.Dispatch<React.SetStateAction<boolean>>;
    setNewCertificateData: React.Dispatch<React.SetStateAction<Omit<ICertificateClient, '_id'>>>;
}

// Helper component with modern styling and label support
const InputField = ({ 
    label,
    icon: Icon, 
    placeholder, 
    value, 
    onChange, 
    type = 'text' 
}: {
    label: string,
    icon: React.ElementType,
    placeholder: string,
    value: string,
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void,
    type?: string
}) => (
    <div className="space-y-1.5 group">
        <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider ml-1 group-focus-within:text-sky-600 transition-colors duration-200">
            {label}
        </label>
        <div className="relative relative-group">
            <div className="absolute left-0 top-0 bottom-0 w-10 flex items-center justify-center pointer-events-none">
                <Icon className="w-4 h-4 text-slate-400 group-focus-within:text-sky-500 transition-colors duration-200" />
            </div>
            <input
                type={type}
                placeholder={placeholder}
                value={value}
                onChange={onChange}
                className="
                    w-full py-2.5 pl-10 pr-4
                    bg-slate-50 border border-slate-200
                    rounded-lg
                    text-slate-800 text-sm font-medium
                    placeholder-slate-400
                    transition-all duration-200 ease-in-out
                    focus:bg-white focus:border-sky-500 focus:ring-4 focus:ring-sky-500/10
                    outline-none
                    shadow-sm
                "
            />
        </div>
    </div>
);

const AddCertificateForm: React.FC<AddCertificateFormProps> = ({
    newCertificateData,
    isAdding,
    handleNewCertChange,
    handleAddCertificate,
    setIsAddFormVisible,
    setNewCertificateData,
}) => {
    return (
        <div className="mb-8 animate-in fade-in slide-in-from-top-4 duration-500">
            {/* Main Card */}
            <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/60 border border-slate-100 overflow-hidden">
                
                {/* Header Section with subtle gradient background */}
                <div className="px-6 py-5 border-b border-slate-100 bg-gradient-to-r from-slate-50/50 to-white flex justify-between items-center">
                    <div>
                        <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                            <div className="p-1.5 bg-sky-100 text-sky-600 rounded-lg">
                                <Plus className="w-4 h-4" />
                            </div>
                            New Certificate Entry
                        </h3>
                        <p className="text-xs text-slate-500 mt-1 pl-11">
                            Enter the details below to digitally archive a new medical certificate.
                        </p>
                    </div>
                    {/* Visual decoration */}
                    <Sparkles className="w-12 h-12 text-sky-100 opacity-50 hidden sm:block" />
                </div>

                {/* Form Content */}
                <div className="p-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        
                        <InputField
                            label="Certificate ID"
                            icon={Tag}
                            placeholder="e.g. CERT-2024-001"
                            value={newCertificateData.certificateNo}
                            onChange={(e) => handleNewCertChange('certificateNo', e.target.value)}
                        />

                        <InputField
                            label="Patient / Holder Name"
                            icon={User}
                            placeholder="e.g. John Doe"
                            value={newCertificateData.name}
                            onChange={(e) => handleNewCertChange('name', e.target.value)}
                        />

                        <InputField
                            label="Medical Institution"
                            icon={Hospital}
                            placeholder="e.g. General Hospital"
                            value={newCertificateData.hospital}
                            onChange={(e) => handleNewCertChange('hospital', e.target.value)}
                        />

                        <InputField
                            label="Date of Issue"
                            icon={Calendar}
                            type="date"
                            placeholder="Select date"
                            value={doiToDateInput(newCertificateData.doi)}
                            onChange={(e) => handleNewCertChange('doi', dateInputToDoi(e.target.value))}
                        />
                    </div>
                </div>

                {/* Footer / Actions - Distinct section */}
                <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex flex-col-reverse sm:flex-row justify-end gap-3">
                    <button
                        onClick={() => {
                            setIsAddFormVisible(false);
                            setNewCertificateData(initialNewCertificateState);
                        }}
                        className="
                            w-full sm:w-auto px-5 py-2.5
                            text-sm font-medium text-slate-600
                            bg-white border border-slate-200 rounded-lg
                            hover:bg-slate-50 hover:text-slate-800 hover:border-slate-300
                            focus:ring-2 focus:ring-slate-200 focus:outline-none
                            transition-all duration-200
                            shadow-sm
                        "
                        disabled={isAdding}
                    >
                        Cancel
                    </button>
                    
                    <button
                        onClick={handleAddCertificate}
                        disabled={isAdding}
                        className="
                            w-full sm:w-auto px-6 py-2.5
                            text-sm font-semibold text-white
                            bg-gradient-to-r from-sky-600 to-blue-600
                            hover:from-sky-500 hover:to-blue-500
                            border border-transparent
                            rounded-lg
                            shadow-lg shadow-sky-500/20 hover:shadow-sky-500/40
                            focus:ring-2 focus:ring-offset-2 focus:ring-sky-500
                            disabled:opacity-70 disabled:cursor-not-allowed
                            transition-all duration-200 transform active:scale-95
                            flex items-center justify-center gap-2
                        "
                    >
                        {isAdding ? (
                            <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                <span>Processing...</span>
                            </>
                        ) : (
                            <>
                                <Save className="w-4 h-4" />
                                <span>Save Certificate</span>
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AddCertificateForm;