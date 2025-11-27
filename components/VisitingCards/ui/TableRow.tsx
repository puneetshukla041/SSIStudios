import React from 'react';
import { Save, X, Edit, Trash2, Moon, Sun, Loader2 } from 'lucide-react';
import { IVisitingCardClient } from '../utils/constants';
import { getDesignationColor } from '../utils/helpers';

interface Props {
  card: IVisitingCardClient;
  isSelected: boolean;
  isEditing: boolean;
  isDeleting: boolean;
  generatingId: string | null;
  editData: Partial<IVisitingCardClient>;
  onSelect: (checked: boolean) => void;
  onEdit: () => void;
  onCancelEdit: () => void;
  onSave: () => void;
  onDelete: () => void;
  onChange: (field: keyof IVisitingCardClient, val: string) => void;
  onGeneratePdf: (theme: 'light' | 'dark') => void;
}

const TableRow: React.FC<Props> = ({
  card, isSelected, isEditing, isDeleting, generatingId, editData,
  onSelect, onEdit, onCancelEdit, onSave, onDelete, onChange, onGeneratePdf
}) => {
  
  const isGenerating = generatingId === card._id;

  return (
    <tr className={`
      group transition-all duration-300 ease-in-out border-b border-slate-100 last:border-none 
      hover:bg-indigo-50/30 hover:shadow-[0_4px_20px_-12px_rgba(0,0,0,0.1)] relative z-0 hover:z-10
      ${isDeleting ? 'opacity-0 scale-[0.98] pointer-events-none' : 'opacity-100'} 
      ${isSelected ? 'bg-indigo-50/50' : 'bg-white'}
    `}>
      {/* Checkbox Column */}
      <td className="px-6 py-4 text-center w-16 align-middle">
        <div className="flex items-center justify-center">
          <input 
            type="checkbox" 
            checked={isSelected} 
            onChange={(e) => onSelect(e.target.checked)} 
            className="w-5 h-5 rounded-md border-slate-300 text-indigo-600 focus:ring-indigo-500/20 focus:ring-offset-0 cursor-pointer transition-all checked:bg-indigo-600 hover:border-indigo-400"
          />
        </div>
      </td>
      
      {/* Data Columns */}
      {['firstName', 'lastName', 'designation', 'phone', 'email'].map((field) => (
        <td key={field} className="px-6 py-4 text-sm whitespace-nowrap align-middle">
          {isEditing ? (
            <div className="relative">
              <input 
                value={(editData as any)[field] || ''}
                onChange={(e) => onChange(field as keyof IVisitingCardClient, e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 outline-none text-slate-700 font-medium focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all duration-200 shadow-sm placeholder:text-slate-400"
                placeholder={`Enter ${field}...`}
              />
            </div>
          ) : field === 'designation' ? (
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border shadow-sm ${getDesignationColor(card.designation)}`}>
              {card.designation}
            </span>
          ) : field === 'email' ? (
             <span className="text-slate-500 font-medium font-mono text-xs bg-slate-50 px-2 py-1 rounded border border-slate-100 select-all">
               {(card as any)[field]}
             </span>
          ) : (
            <span className={`font-semibold ${field === 'firstName' || field === 'lastName' ? 'text-slate-700 text-base' : 'text-slate-500'}`}>
              {(card as any)[field]}
            </span>
          )}
        </td>
      ))}

      {/* Actions Column */}
      <td className="px-6 py-4 text-right align-middle">
        <div className="flex items-center justify-end gap-2 opacity-80 group-hover:opacity-100 transition-opacity duration-200">
          {isEditing ? (
            <>
              <button 
                onClick={onSave} 
                className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl border border-emerald-100 hover:bg-emerald-100 hover:border-emerald-200 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
                title="Save Changes"
              >
                <Save className="w-4 h-4"/>
              </button>
              <button 
                onClick={onCancelEdit} 
                className="p-2.5 bg-slate-50 text-slate-500 rounded-xl border border-slate-200 hover:bg-slate-100 hover:text-slate-700 hover:shadow-sm transition-all duration-200"
                title="Cancel Edit"
              >
                <X className="w-4 h-4"/>
              </button>
            </>
          ) : (
            <>
              {/* PDF Actions Group */}
              <div className="flex items-center gap-1 bg-slate-50 p-1 rounded-xl border border-slate-200 mr-2 shadow-sm">
                <button 
                  onClick={() => onGeneratePdf('dark')} 
                  disabled={isGenerating} 
                  title="Generate Dark Theme PDF" 
                  className="p-2 rounded-lg text-slate-600 hover:bg-slate-800 hover:text-white transition-all duration-200 disabled:opacity-50"
                >
                  {isGenerating ? <Loader2 className="w-4 h-4 animate-spin"/> : <Moon className="w-4 h-4"/>}
                </button>
                <div className="w-px h-4 bg-slate-200"></div>
                <button 
                  onClick={() => onGeneratePdf('light')} 
                  disabled={isGenerating} 
                  title="Generate Light Theme PDF" 
                  className="p-2 rounded-lg text-slate-600 hover:bg-white hover:text-orange-500 hover:shadow-sm transition-all duration-200 disabled:opacity-50"
                >
                  {isGenerating ? <Loader2 className="w-4 h-4 animate-spin"/> : <Sun className="w-4 h-4"/>}
                </button>
              </div>

              {/* Edit/Delete Actions */}
              <button 
                onClick={onEdit} 
                className="p-2.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all duration-200 hover:shadow-sm"
                title="Edit Details"
              >
                <Edit className="w-4 h-4"/>
              </button>
              <button 
                onClick={onDelete} 
                className="p-2.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all duration-200 hover:shadow-sm"
                title="Delete Record"
              >
                <Trash2 className="w-4 h-4"/>
              </button>
            </>
          )}
        </div>
      </td>
    </tr>
  );
};

export default TableRow;