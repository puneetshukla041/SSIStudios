import React, { useState, useRef, useEffect } from 'react';
import { initialNewCertificateState, ICertificateClient } from '../utils/constants';
import { doiToDateInput, dateInputToDoi } from '../utils/helpers';
import {
    Plus,
    Tag,
    User,
    Hospital,
    Calendar,
    Save,
    Loader2,
    Sparkles,
    Check
} from 'lucide-react';

interface AddCertificateFormProps {
    newCertificateData: Omit<ICertificateClient, '_id'>;
    isAdding: boolean;
    uniqueHospitals?: string[]; // Received from parent for autocomplete
    handleNewCertChange: (field: keyof Omit<ICertificateClient, '_id'>, value: string) => void;
    handleAddCertificate: () => Promise<void>;
    setIsAddFormVisible: React.Dispatch<React.SetStateAction<boolean>>;
    setNewCertificateData: React.Dispatch<React.SetStateAction<Omit<ICertificateClient, '_id'>>>;
}

// Helper component
const InputField = ({ 
    label,
    icon: Icon, 
    placeholder, 
    value, 
    onChange, 
    type = 'text',
    onFocus,
    onBlur,
    autoComplete
}: {
    label: string,
    icon: React.ElementType,
    placeholder: string,
    value: string,
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void,
    type?: string,
    onFocus?: () => void,
    onBlur?: () => void,
    autoComplete?: string
}) => (
    <div className="space-y-1.5 group w-full">
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
                onFocus={onFocus}
                onBlur={onBlur}
                autoComplete={autoComplete}
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
    uniqueHospitals = [], 
    handleNewCertChange,
    handleAddCertificate,
    setIsAddFormVisible,
    setNewCertificateData,
}) => {
    
    // --- State for Hospital Autocomplete ---
    const [showSuggestions, setShowSuggestions] = useState(false);
    const wrapperRef = useRef<HTMLDivElement>(null);

    // Handle click outside to close suggestions
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
                setShowSuggestions(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [wrapperRef]);

    // Handle Hospital Input Change (Auto-Capitalization + Search)
    const handleHospitalChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const rawValue = e.target.value;
        // Logic: Capitalize the first letter of every word
        const capitalizedValue = rawValue.replace(/\b\w/g, (char) => char.toUpperCase());
        
        handleNewCertChange('hospital', capitalizedValue);
        setShowSuggestions(true);
    };

    // Filter suggestions based on input (case insensitive)
    const filteredHospitals = uniqueHospitals.filter(hospital => 
        hospital && newCertificateData.hospital &&
        hospital.toLowerCase().includes(newCertificateData.hospital.toLowerCase()) &&
        hospital !== newCertificateData.hospital // Don't show exact match if already selected
    ).slice(0, 5); // Limit to top 5 suggestions

    const selectHospital = (hospital: string) => {
        handleNewCertChange('hospital', hospital);
        setShowSuggestions(false);
    };

    return (
        <div className="mb-8 animate-in fade-in slide-in-from-top-4 duration-500 relative z-50">
            {/* Main Card */}
            <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/60 border border-slate-100 overflow-visible relative">
                
                {/* Header Section */}
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

                        {/* --- Hospital Input with Smart Dropdown --- */}
                        <div className="relative" ref={wrapperRef}>
                            <InputField
                                label="Medical Institution"
                                icon={Hospital}
                                placeholder="Start typing to search..."
                                value={newCertificateData.hospital}
                                onChange={handleHospitalChange}
                                onFocus={() => setShowSuggestions(true)}
                                autoComplete="off"
                            />
                            
                            {/* Suggestions Dropdown */}
                            {showSuggestions && newCertificateData.hospital && filteredHospitals.length > 0 && (
                                <div className="absolute top-[calc(100%+4px)] left-0 right-0 bg-white rounded-xl shadow-xl border border-slate-100 z-[100] overflow-hidden animate-in fade-in zoom-in-95 duration-150 origin-top">
                                    <div className="px-3 py-2 bg-slate-50/50 border-b border-slate-100 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                                        Suggested Hospitals
                                    </div>
                                    <div className="max-h-48 overflow-y-auto custom-scrollbar p-1">
                                        {filteredHospitals.map((hospital, idx) => (
                                            <button
                                                key={idx}
                                                onClick={() => selectHospital(hospital)}
                                                className="w-full text-left px-3 py-2.5 rounded-lg text-sm text-slate-600 hover:bg-sky-50 hover:text-sky-700 transition-colors flex items-center justify-between group"
                                            >
                                                <span className="truncate">{hospital}</span>
                                                <Check className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity text-sky-500" />
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

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

                {/* Footer / Actions */}
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