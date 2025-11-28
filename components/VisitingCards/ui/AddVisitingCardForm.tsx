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
    <div className="p-8 bg-white rounded-2xl border border-slate-200 shadow-2xl shadow-slate-200/50 mb-8 animate-in fade-in slide-in-from-top-4 relative overflow-hidden">
      {/* Decorative top strip */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-500" />

      <div className="flex justify-between items-center mb-8 pb-4 border-b border-slate-100">
        <div>
           <h3 className="text-xl font-bold text-slate-800">New Employee Entry</h3>
           <p className="text-slate-500 text-sm mt-1">Fill in the details to generate a visiting card.</p>
        </div>
        <button 
          onClick={onCancel} 
          className="p-2 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
        >
          <X className="w-6 h-6"/>
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {['firstName', 'lastName', 'designation', 'phone', 'email'].map((field) => (
          <div key={field} className="relative group">
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5 ml-1">
              {field.replace(/([A-Z])/g, ' $1')}
            </label>
            <div className="relative">
              <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors">
                {field.includes('Name') ? <User className="w-4 h-4"/> : field === 'phone' ? <Phone className="w-4 h-4"/> : field === 'email' ? <Mail className="w-4 h-4"/> : <Briefcase className="w-4 h-4"/>}
              </div>
              <input
                value={(newCard as any)[field]}
                onChange={(e) => handleChange(field as any, e.target.value)}
                placeholder={`Enter ${field}...`}
                className="w-full py-3 pl-11 pr-4 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none text-sm font-medium transition-all shadow-sm"
              />
            </div>
          </div>
        ))}
      </div>

      <div className="flex justify-end mt-8 gap-3">
        <button 
          onClick={onCancel} 
          className="px-6 py-3 rounded-xl border border-slate-200 text-slate-600 font-semibold hover:bg-slate-50 hover:border-slate-300 transition-all cursor-pointer"
        >
          Cancel
        </button>
        <button 
          onClick={onSubmit} 
          disabled={isAdding}
          className="px-8 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold shadow-lg shadow-indigo-600/20 active:scale-95 transition-all flex items-center cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {isAdding ? <Loader2 className="w-5 h-5 animate-spin mr-2"/> : <Save className="w-5 h-5 mr-2"/>} 
          Save Record
        </button>
      </div>
    </div>
  );
};

export default AddVisitingCardForm;