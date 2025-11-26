import React from 'react';
import { User, Briefcase, Phone, Mail, Save, Loader2, X } from 'lucide-react';
import { IVisitingCardClient } from '../utils/constants';

interface Props {
  newCard: Omit<IVisitingCardClient, '_id'>;
  setNewCard: React.Dispatch<React.SetStateAction<Omit<IVisitingCardClient, '_id'>>>;
  isAdding: boolean;
  onSubmit: () => void;
  onCancel: () => void;
}

const AddVisitingCardForm: React.FC<Props> = ({ newCard, setNewCard, isAdding, onSubmit, onCancel }) => {
  const handleChange = (field: keyof typeof newCard, value: string) => {
    setNewCard(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="p-6 bg-white rounded-2xl border border-blue-100 shadow-xl shadow-blue-900/5 mb-8 animate-in fade-in slide-in-from-top-4">
      <div className="flex justify-between items-center mb-6 pb-4 border-b border-slate-100">
        <h3 className="text-lg font-bold text-slate-800">Create New Visiting Card</h3>
        <button onClick={onCancel}><X className="w-5 h-5 text-slate-400 hover:text-slate-600"/></button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {/* Fields */}
        {['firstName', 'lastName', 'designation', 'phone', 'email'].map((field) => (
          <div key={field} className="relative">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
              {field.includes('Name') ? <User className="w-4 h-4"/> : field === 'phone' ? <Phone className="w-4 h-4"/> : field === 'email' ? <Mail className="w-4 h-4"/> : <Briefcase className="w-4 h-4"/>}
            </div>
            <input
              value={(newCard as any)[field]}
              onChange={(e) => handleChange(field as any, e.target.value)}
              placeholder={field.charAt(0).toUpperCase() + field.slice(1).replace(/([A-Z])/g, ' $1')}
              className="w-full py-2.5 pl-10 pr-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none text-sm transition-all"
            />
          </div>
        ))}
      </div>

      <div className="flex justify-end mt-6 gap-3">
        <button onClick={onCancel} className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50">Cancel</button>
        <button 
          onClick={onSubmit} 
          disabled={isAdding}
          className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-lg shadow-blue-600/20 flex items-center"
        >
          {isAdding ? <Loader2 className="w-4 h-4 animate-spin mr-2"/> : <Save className="w-4 h-4 mr-2"/>} Save Record
        </button>
      </div>
    </div>
  );
};

export default AddVisitingCardForm;