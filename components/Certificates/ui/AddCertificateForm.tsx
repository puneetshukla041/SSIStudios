// D:\ssistudios\ssistudios\components\Certificates\ui\AddCertificateForm.tsx

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
} from 'lucide-react';

interface AddCertificateFormProps {
    newCertificateData: Omit<ICertificateClient, '_id'>;
    isAdding: boolean;
    handleNewCertChange: (field: keyof Omit<ICertificateClient, '_id'>, value: string) => void;
    handleAddCertificate: () => Promise<void>;
    setIsAddFormVisible: React.Dispatch<React.SetStateAction<boolean>>;
    setNewCertificateData: React.Dispatch<React.SetStateAction<Omit<ICertificateClient, '_id'>>>;
}

// Helper component for cleaner, consistent input fields
const InputField = ({ icon: Icon, placeholder, value, onChange, type = 'text' }: {
    icon: React.ElementType,
    placeholder: string,
    value: string,
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void,
    type?: string
}) => (
    <div className="relative">
        <Icon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-sky-500/80 pointer-events-none" />
        <input
            type={type}
            placeholder={placeholder}
            value={value}
            onChange={onChange}
            className="
                w-full p-3 pl-10
                border border-sky-300/60
                rounded-xl
                bg-white/70
                text-gray-800
                placeholder-gray-500/90
                focus:ring-2 focus:ring-sky-500 focus:border-sky-500
                transition duration-300
                shadow-md hover:shadow-lg
                focus:bg-white/90
                text-sm
                outline-none
            "
        />
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
        <div className="p-4 sm:p-6 bg-sky-500/15 rounded-2xl border border-sky-300/40 backdrop-blur-sm shadow-2xl shadow-sky-400/20 mb-6">
            <h3 className="text-xl font-extrabold text-sky-700 mb-5 flex items-center border-b pb-2 border-sky-300/40">
                <Plus className="w-5 h-5 mr-2 text-sky-600" /> Manually Add New Certificate
            </h3>

            {/* Input Fields Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">

                {/* Certificate No */}
                <InputField
                    icon={Tag}
                    placeholder="Certificate No."
                    value={newCertificateData.certificateNo}
                    onChange={(e) => handleNewCertChange('certificateNo', e.target.value)}
                />

                {/* Name */}
                <InputField
                    icon={User}
                    placeholder="Name"
                    value={newCertificateData.name}
                    onChange={(e) => handleNewCertChange('name', e.target.value)}
                />

                {/* Hospital */}
                <InputField
                    icon={Hospital}
                    placeholder="Hospital"
                    value={newCertificateData.hospital}
                    onChange={(e) => handleNewCertChange('hospital', e.target.value)}
                />

                {/* DOI */}
                <InputField
                    icon={Calendar}
                    type="date"
                    placeholder="Date of Issue"
                    // Convert stored DD-MM-YYYY to YYYY-MM-DD for date input
                    value={doiToDateInput(newCertificateData.doi)}
                    onChange={(e) => handleNewCertChange('doi', dateInputToDoi(e.target.value))}
                />
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row justify-end space-y-3 sm:space-y-0 sm:space-x-3 mt-6">
                <button
                    onClick={() => {
                        setIsAddFormVisible(false);
                        setNewCertificateData(initialNewCertificateState); // Reset form on cancel
                    }}
                    className="w-full sm:w-auto px-6 py-2.5 text-sm font-semibold rounded-full bg-gray-500/90 text-white hover:bg-gray-600 transition duration-300 shadow-lg flex items-center justify-center transform hover:scale-[1.03]"
                    disabled={isAdding}
                >
                    <X className="w-4 h-4 mr-2" /> Cancel
                </button>
                <button
                    onClick={handleAddCertificate}
                    className="w-full sm:w-auto px-6 py-2.5 text-sm font-bold rounded-full bg-sky-600 text-white hover:bg-sky-700 transition duration-300 shadow-lg flex items-center justify-center transform hover:scale-[1.03]"
                    disabled={isAdding}
                >
                    {isAdding ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                    {isAdding ? 'Adding...' : 'Add Certificate'}
                </button>
            </div>
        </div>
    );
};

export default AddCertificateForm;