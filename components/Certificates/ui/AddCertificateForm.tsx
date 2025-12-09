import React, { useState, useRef, useEffect } from 'react';
import { initialNewCertificateState, ICertificateClient } from '../utils/constants';
import { doiToDateInput, dateInputToDoi } from '../utils/helpers';
import {
    Tag,
    Hospital,
    Calendar,
    Save,
    Loader2,
    X,
    ChevronDown,
    Check,
    Award
} from 'lucide-react';
import { motion, AnimatePresence, Variants } from 'framer-motion';
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
    label, icon: Icon, placeholder, value, onChange, type = 'text', onFocus, onBlur, autoComplete, className
}: {
    label: string, icon: React.ElementType, placeholder: string, value: string,
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void, type?: string,
    onFocus?: () => void, onBlur?: () => void, autoComplete?: string, className?: string
}) => (
    <div className={clsx("space-y-1.5 group w-full", className)}>
        <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider ml-1 group-focus-within:text-indigo-600 transition-colors duration-300 font-poppins cursor-pointer">
            {label}
        </label>
        <div className="relative">
            <div className="absolute left-0 top-0 bottom-0 w-10 flex items-center justify-center pointer-events-none">
                <Icon className="w-4 h-4 text-slate-400 group-focus-within:text-indigo-500 transition-colors duration-300" />
            </div>
            <input
                type={type}
                placeholder={placeholder}
                value={value}
                onChange={onChange}
                onFocus={onFocus}
                onBlur={onBlur}
                autoComplete={autoComplete}
                className="w-full py-2.5 pl-10 pr-4 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-sm font-medium placeholder-slate-400 transition-all duration-300 ease-out focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none shadow-sm hover:border-slate-300 font-poppins"
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

    const overlayVariants: Variants = {
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { duration: 0.2 } },
        exit: { opacity: 0, transition: { duration: 0.2, delay: 0.1 } }
    };

    const modalVariants: Variants = {
        hidden: { opacity: 0, scale: 0.98, y: 15 },
        visible: {
            opacity: 1,
            scale: 1,
            y: 0,
            transition: {
                type: "spring",
                stiffness: 300,
                damping: 25,
                mass: 0.5
            }
        },
        exit: {
            opacity: 0,
            scale: 0.98,
            y: 15,
            transition: { duration: 0.2, ease: "easeIn" }
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <style>
                {`
                    @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap');
                    .font-poppins { font-family: 'Poppins', sans-serif; }
                    .custom-scrollbar::-webkit-scrollbar { width: 4px; }
                    .custom-scrollbar::-webkit-scrollbar-track { bg: transparent; }
                    .custom-scrollbar::-webkit-scrollbar-thumb { background-color: #cbd5e1; border-radius: 4px; }
                `}
            </style>

            {/* Backdrop */}
            <motion.div
                variants={overlayVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                onClick={() => setIsAddFormVisible(false)}
                className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm cursor-pointer"
            />

            {/* Modal Content */}
            <motion.div
                variants={modalVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl shadow-slate-900/20 ring-1 ring-slate-900/5 font-poppins flex flex-col pointer-events-auto"
            >
                {/* Header */}
                <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-start bg-gradient-to-r from-slate-50/50 to-white rounded-t-2xl">
                    <div>
                        <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2.5">
                            <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-indigo-600 text-white shadow-indigo-200 shadow-sm">
                                <Award className="w-4 h-4" />
                            </span>
                            Record Certificate
                        </h2>
                        <p className="text-xs text-slate-500 mt-1.5 pl-[42px] leading-relaxed">
                            Enter the certificate details below to archive in the system.
                        </p>
                    </div>
                    <button
                        type="button"
                        onClick={() => setIsAddFormVisible(false)}
                        className="p-2 -mr-2 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors duration-200 cursor-pointer outline-none focus:bg-slate-100"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Form Body */}
                <div className="p-6 space-y-6 bg-white">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        {/* Certificate ID */}
                        <InputField
                            label="Certificate ID"
                            icon={Tag}
                            placeholder="e.g. CERT-2024-001"
                            value={newCertificateData.certificateNo}
                            onChange={(e) => handleNewCertChange('certificateNo', e.target.value)}
                        />

                        {/* Date of Issue */}
                        <InputField
                            label="Date of Issue"
                            icon={Calendar}
                            type="date"
                            placeholder="Select date"
                            value={doiToDateInput(newCertificateData.doi)}
                            onChange={(e) => handleNewCertChange('doi', dateInputToDoi(e.target.value))}
                        />

                        {/* Hospital Dropdown */}
                        <div className="relative md:col-span-2" ref={wrapperRef}>
                            <InputField
                                label="Medical Institution"
                                icon={Hospital}
                                placeholder="Search or type institution name"
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
                                        initial={{ opacity: 0, y: -8, scale: 0.98 }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        exit={{ opacity: 0, y: -8, scale: 0.98 }}
                                        transition={{ duration: 0.15, ease: "easeOut" }}
                                        className="absolute top-[calc(100%+6px)] left-0 right-0 bg-white rounded-xl shadow-xl ring-1 ring-slate-900/5 z-[60] overflow-hidden max-h-48 overflow-y-auto custom-scrollbar"
                                    >
                                        <div className="px-3 py-2 bg-slate-50 border-b border-slate-100 sticky top-0 backdrop-blur-sm z-10">
                                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-poppins">Known Institutions</span>
                                        </div>
                                        <div className="p-1">
                                            {filteredHospitals.map((hospital, idx) => (
                                                <button
                                                    type="button"
                                                    key={idx}
                                                    onClick={() => selectHospital(hospital)}
                                                    className={clsx(
                                                        "w-full text-left px-3 py-2 rounded-lg text-sm transition-all duration-200 flex items-center justify-between group font-poppins cursor-pointer",
                                                        newCertificateData.hospital === hospital
                                                            ? 'bg-indigo-50 text-indigo-700 font-medium'
                                                            : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                                                    )}
                                                >
                                                    <span className="truncate">{hospital}</span>
                                                    {newCertificateData.hospital === hospital && (
                                                        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}>
                                                            <Check className="w-3.5 h-3.5 text-indigo-600" />
                                                        </motion.div>
                                                    )}
                                                </button>
                                            ))}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>
                </div>

                {/* Footer Actions */}
                <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-3 rounded-b-2xl">
                    <button
                        type="button"
                        onClick={() => {
                            setIsAddFormVisible(false);
                            setNewCertificateData(initialNewCertificateState);
                        }}
                        className="px-5 py-2 text-sm font-medium text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 hover:text-slate-800 hover:border-slate-300 transition-all shadow-sm active:scale-95 focus:ring-2 focus:ring-slate-200 font-poppins cursor-pointer"
                        disabled={isAdding}
                    >
                        Cancel
                    </button>

                    <button
                        type="button"
                        onClick={handleAddCertificate}
                        disabled={isAdding}
                        className="px-6 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-md shadow-indigo-500/20 transition-all active:scale-95 flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed focus:ring-2 focus:ring-indigo-500 focus:ring-offset-1 font-poppins cursor-pointer"
                    >
                        {isAdding ? (
                            <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                <span>Processing...</span>
                            </>
                        ) : (
                            <>
                                <Save className="w-4 h-4" />
                                <span>Save Record</span>
                            </>
                        )}
                    </button>
                </div>
            </motion.div>
        </div>
    );
};

export default AddCertificateForm;