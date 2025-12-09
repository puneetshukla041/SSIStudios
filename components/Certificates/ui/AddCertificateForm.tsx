import React, { useState, useRef, useEffect } from 'react';
import { initialNewCertificateState, ICertificateClient } from '../utils/constants';
import { doiToDateInput, dateInputToDoi } from '../utils/helpers';
import {
    Tag, User, Hospital, Calendar, Save, Loader2, X, ChevronDown, Check, Sparkles
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import clsx from 'clsx';

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
        <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider ml-1 group-focus-within:text-indigo-600 transition-colors duration-200">
            {label}
        </label>
        <div className="relative">
            <div className="absolute left-0 top-0 bottom-0 w-10 flex items-center justify-center pointer-events-none">
                <Icon className="w-4 h-4 text-slate-400 group-focus-within:text-indigo-500 transition-colors duration-200" />
            </div>
            <input
                type={type}
                placeholder={placeholder}
                value={value}
                onChange={onChange}
                onFocus={onFocus}
                onBlur={onBlur}
                autoComplete={autoComplete}
                className="w-full py-2.5 pl-10 pr-4 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-sm font-medium placeholder-slate-400 transition-all duration-200 ease-in-out focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none shadow-sm"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop with Blur */}
            <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsAddFormVisible(false)}
                className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            />

            {/* Modal Content */}
            <motion.div 
                initial={{ scale: 0.95, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.95, opacity: 0, y: 20 }}
                transition={{ type: "spring", duration: 0.5, bounce: 0.3 }}
                className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl shadow-slate-900/20 overflow-hidden"
            >
                {/* Header */}
                <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center bg-gradient-to-r from-slate-50 to-white">
                    <div>
                        <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                            <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-indigo-100 text-indigo-600">
                                <Sparkles className="w-4 h-4" />
                            </span>
                            Add New Certificate
                        </h2>
                        <p className="text-xs text-slate-500 mt-1 pl-10">
                            Fill in the details below to archive a new record.
                        </p>
                    </div>
                    <button 
                        onClick={() => setIsAddFormVisible(false)}
                        className="p-2 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Form Body */}
                <div className="p-6 md:p-8 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <InputField
                            label="Certificate ID"
                            icon={Tag}
                            placeholder="CERT-XXXX"
                            value={newCertificateData.certificateNo}
                            onChange={(e) => handleNewCertChange('certificateNo', e.target.value)}
                        />

                        <InputField
                            label="Patient/Recipient Name"
                            icon={User}
                            placeholder="Full Name"
                            value={newCertificateData.name}
                            onChange={(e) => handleNewCertChange('name', e.target.value)}
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Hospital Dropdown */}
                        <div className="relative" ref={wrapperRef}>
                            <InputField
                                label="Medical Institution"
                                icon={Hospital}
                                placeholder="Select or type Hospital"
                                value={newCertificateData.hospital}
                                onChange={handleHospitalChange}
                                onFocus={() => setShowSuggestions(true)}
                                autoComplete="off"
                            />
                            <div className="absolute right-3 top-[28px] pointer-events-none text-slate-400">
                                <ChevronDown className="w-4 h-4" />
                            </div>

                            <AnimatePresence>
                                {showSuggestions && filteredHospitals.length > 0 && (
                                    <motion.div 
                                        initial={{ opacity: 0, y: -10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -10 }}
                                        className="absolute top-[calc(100%+4px)] left-0 right-0 bg-white rounded-xl shadow-xl border border-slate-100 z-[60] overflow-hidden max-h-48 overflow-y-auto custom-scrollbar"
                                    >
                                        <div className="px-3 py-2 bg-slate-50/80 border-b border-slate-100 flex justify-between items-center sticky top-0 backdrop-blur-sm">
                                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Suggestions</span>
                                        </div>
                                        <div className="p-1">
                                            {filteredHospitals.map((hospital, idx) => (
                                                <button
                                                    key={idx}
                                                    onClick={() => selectHospital(hospital)}
                                                    className={clsx(
                                                        "w-full text-left px-3 py-2 rounded-lg text-sm transition-colors flex items-center justify-between group",
                                                        newCertificateData.hospital === hospital 
                                                            ? 'bg-indigo-50 text-indigo-700 font-medium' 
                                                            : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                                                    )}
                                                >
                                                    <span className="truncate">{hospital}</span>
                                                    {newCertificateData.hospital === hospital && <Check className="w-3.5 h-3.5 text-indigo-500" />}
                                                </button>
                                            ))}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
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

                {/* Footer Actions */}
                <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
                    <button
                        onClick={() => {
                            setIsAddFormVisible(false);
                            setNewCertificateData(initialNewCertificateState);
                        }}
                        className="px-5 py-2.5 text-sm font-medium text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 hover:border-slate-300 transition-all shadow-sm active:scale-95"
                        disabled={isAdding}
                    >
                        Cancel
                    </button>
                    
                    <button
                        onClick={handleAddCertificate}
                        disabled={isAdding}
                        className="px-8 py-2.5 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-lg shadow-indigo-500/30 transition-all transform active:scale-95 flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                        {isAdding ? (
                            <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                <span>Saving...</span>
                            </>
                        ) : (
                            <>
                                <Save className="w-4 h-4" />
                                <span>Save Certificate</span>
                            </>
                        )}
                    </button>
                </div>
            </motion.div>
        </div>
    );
};

export default AddCertificateForm;