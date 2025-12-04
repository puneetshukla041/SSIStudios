import React, { useState, useRef, useEffect } from 'react';
import { initialNewCertificateState, ICertificateClient } from '../utils/constants';
import { doiToDateInput, dateInputToDoi } from '../utils/helpers';
import {
    Plus, Tag, User, Hospital, Calendar, Save, Loader2, Sparkles, Check, ChevronDown
} from 'lucide-react';

interface AddCertificateFormProps {
    newCertificateData: Omit<ICertificateClient, '_id'>;
    isAdding: boolean;
    uniqueHospitals?: string[]; 
    handleNewCertChange: (field: keyof Omit<ICertificateClient, '_id'>, value: string) => void;
    handleAddCertificate: () => Promise<void>;
    setIsAddFormVisible: React.Dispatch<React.SetStateAction<boolean>>;
    setNewCertificateData: React.Dispatch<React.SetStateAction<Omit<ICertificateClient, '_id'>>>;
}

const InputField = ({ 
    label, icon: Icon, placeholder, value, onChange, type = 'text', onFocus, onBlur, autoComplete
}: {
    label: string, icon: React.ElementType, placeholder: string, value: string,
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void, type?: string,
    onFocus?: () => void, onBlur?: () => void, autoComplete?: string
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
                className="w-full py-2.5 pl-10 pr-4 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 text-sm font-medium placeholder-slate-400 transition-all duration-200 ease-in-out focus:bg-white focus:border-sky-500 focus:ring-4 focus:ring-sky-500/10 outline-none shadow-sm"
            />
        </div>
    </div>
);

const AddCertificateForm: React.FC<AddCertificateFormProps> = ({
    newCertificateData, isAdding, uniqueHospitals = [], handleNewCertChange,
    handleAddCertificate, setIsAddFormVisible, setNewCertificateData,
}) => {
    
    const [showSuggestions, setShowSuggestions] = useState(false);
    const wrapperRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
                setShowSuggestions(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [wrapperRef]);

    const handleHospitalChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const rawValue = e.target.value;
        const capitalizedValue = rawValue.replace(/\b\w/g, (char) => char.toUpperCase());
        handleNewCertChange('hospital', capitalizedValue);
        setShowSuggestions(true);
    };

    const filteredHospitals = uniqueHospitals.filter(hospital => {
        if (!hospital) return false;
        const searchTerm = newCertificateData.hospital || '';
        if (searchTerm.trim() === '') return true;
        return hospital.toLowerCase().includes(searchTerm.toLowerCase());
    });

    const selectHospital = (hospital: string) => {
        handleNewCertChange('hospital', hospital);
        setShowSuggestions(false);
    };

    return (
        <div className="mb-8 animate-in fade-in slide-in-from-top-4 duration-500 relative z-50">
            <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/60 border border-slate-100 overflow-visible relative">
                
                {/* Header Section */}
                <div className="px-4 sm:px-6 py-5 border-b border-slate-100 bg-gradient-to-r from-slate-50/50 to-white flex justify-between items-center">
                    <div>
                        <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                            <div className="p-1.5 bg-sky-100 text-sky-600 rounded-lg shrink-0">
                                <Plus className="w-4 h-4" />
                            </div>
                            New Entry
                        </h3>
                        <p className="text-xs text-slate-500 mt-1 pl-11 hidden sm:block">
                            Enter details to archive a new certificate.
                        </p>
                    </div>
                    <Sparkles className="w-12 h-12 text-sky-100 opacity-50 hidden sm:block" />
                </div>

                {/* Form Content - Responsive Grid */}
                <div className="p-4 sm:p-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                        
                        <InputField
                            label="Certificate ID"
                            icon={Tag}
                            placeholder="CERT-XXXX"
                            value={newCertificateData.certificateNo}
                            onChange={(e) => handleNewCertChange('certificateNo', e.target.value)}
                        />

                        <InputField
                            label="Patient Name"
                            icon={User}
                            placeholder="Patient Name"
                            value={newCertificateData.name}
                            onChange={(e) => handleNewCertChange('name', e.target.value)}
                        />

                        {/* Hospital Dropdown */}
                        <div className="relative" ref={wrapperRef}>
                            <InputField
                                label="Medical Institution"
                                icon={Hospital}
                                placeholder="Select Hospital"
                                value={newCertificateData.hospital}
                                onChange={handleHospitalChange}
                                onFocus={() => setShowSuggestions(true)}
                                autoComplete="off"
                            />
                            
                            <div className="absolute right-3 top-[28px] pointer-events-none text-slate-400">
                                <ChevronDown className="w-4 h-4" />
                            </div>

                            {showSuggestions && filteredHospitals.length > 0 && (
                                <div className="absolute top-[calc(100%+4px)] left-0 right-0 bg-white rounded-xl shadow-xl border border-slate-100 z-[100] overflow-hidden animate-in fade-in zoom-in-95 duration-150 origin-top">
                                    <div className="px-3 py-2 bg-slate-50/50 border-b border-slate-100 flex justify-between items-center">
                                        <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Results</span>
                                        <span className="text-[10px] font-medium text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">{filteredHospitals.length}</span>
                                    </div>
                                    <div className="max-h-60 overflow-y-auto custom-scrollbar p-1">
                                        {filteredHospitals.map((hospital, idx) => (
                                            <button
                                                key={idx}
                                                onClick={() => selectHospital(hospital)}
                                                className={`w-full text-left px-3 py-2.5 rounded-lg text-sm transition-colors flex items-center justify-between group ${newCertificateData.hospital === hospital ? 'bg-sky-50 text-sky-700 font-medium' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}`}
                                            >
                                                <span className="truncate">{hospital}</span>
                                                {newCertificateData.hospital === hospital && <Check className="w-3.5 h-3.5 text-sky-500" />}
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

                {/* Footer Actions - Stack on mobile */}
                <div className="px-4 sm:px-6 py-4 bg-slate-50 border-t border-slate-100 flex flex-col-reverse sm:flex-row justify-end gap-3">
                    <button
                        onClick={() => {
                            setIsAddFormVisible(false);
                            setNewCertificateData(initialNewCertificateState);
                        }}
                        className="w-full sm:w-auto px-5 py-2.5 text-sm font-medium text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 focus:ring-2 focus:ring-slate-200 transition-all shadow-sm"
                        disabled={isAdding}
                    >
                        Cancel
                    </button>
                    
                    <button
                        onClick={handleAddCertificate}
                        disabled={isAdding}
                        className="w-full sm:w-auto px-6 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-500 hover:to-blue-500 rounded-lg shadow-lg shadow-sky-500/20 hover:shadow-sky-500/40 focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 disabled:opacity-70 disabled:cursor-not-allowed transition-all transform active:scale-95 flex items-center justify-center gap-2"
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