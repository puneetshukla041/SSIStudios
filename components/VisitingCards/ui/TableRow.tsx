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
      group transition-all duration-200 ease-in-out border-b border-slate-100 last:border-none 
      hover:bg-slate-50/80 hover:shadow-[0_2px_8px_-2px_rgba(0,0,0,0.05)] relative z-0 hover:z-10
      ${isDeleting ? 'opacity-0 scale-[0.98] pointer-events-none' : 'opacity-100'} 
      ${isSelected ? 'bg-indigo-50/60' : 'bg-white'}
    `}>
      {/* Checkbox Column */}
      <td className="px-6 py-4 text-center w-16 align-middle">
        <div className="flex items-center justify-center">
          <input 
            type="checkbox" 
            checked={isSelected} 
            onChange={(e) => onSelect(e.target.checked)} 
            className="w-5 h-5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500/30 cursor-pointer transition-all checked:bg-indigo-600 hover:border-indigo-400 shadow-sm"
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
                className="w-full bg-white border border-indigo-200 rounded-lg px-3 py-2 outline-none text-slate-800 font-medium focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all duration-200 shadow-sm placeholder:text-slate-400"
                placeholder={`Enter ${field}...`}
              />
            </div>
          ) : field === 'designation' ? (
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider border ${getDesignationColor(card.designation)}`}>
              {card.designation}
            </span>
          ) : field === 'email' ? (
             <span className="text-slate-600 font-medium font-mono text-xs hover:text-indigo-600 transition-colors cursor-text select-all">
               {(card as any)[field]}
             </span>
          ) : (
            <span className={`font-semibold tracking-tight ${field === 'firstName' || field === 'lastName' ? 'text-slate-800 text-[15px]' : 'text-slate-600'}`}>
              {(card as any)[field]}
            </span>
          )}
        </td>
      ))}

      {/* Actions Column */}
      <td className="px-6 py-4 text-right align-middle">
        <div className="flex items-center justify-end gap-2 opacity-90 group-hover:opacity-100 transition-opacity duration-200">
          {isEditing ? (
            <>
              <button 
                onClick={onSave} 
                className="flex items-center gap-1.5 px-3 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 shadow-lg shadow-emerald-500/20 active:scale-95 transition-all duration-200 cursor-pointer"
                title="Save Changes"
              >
                <Save className="w-4 h-4"/>
                <span className="text-xs font-semibold">Save</span>
              </button>
              <button 
                onClick={onCancelEdit} 
                className="flex items-center gap-1.5 px-3 py-2 bg-white text-slate-500 border border-slate-200 rounded-lg hover:bg-slate-50 hover:text-slate-700 active:scale-95 transition-all duration-200 cursor-pointer"
                title="Cancel Edit"
              >
                <X className="w-4 h-4"/>
                <span className="text-xs font-semibold">Cancel</span>
              </button>
            </>
          ) : (
            <>
              {/* PDF Actions Group */}
              <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-slate-200 mr-2 shadow-sm">
                <button 
                  onClick={() => onGeneratePdf('dark')} 
                  disabled={isGenerating} 
                  title="Dark Theme PDF" 
                  className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-slate-500 hover:bg-slate-800 hover:text-white transition-all duration-200 disabled:opacity-50 active:scale-95 cursor-pointer"
                >
                  {isGenerating ? <Loader2 className="w-4 h-4 animate-spin"/> : <Moon className="w-4 h-4"/>}
                  <span className="text-xs font-medium">Dark</span>
                </button>
                <div className="w-px h-4 bg-slate-200"></div>
                <button 
                  onClick={() => onGeneratePdf('light')} 
                  disabled={isGenerating} 
                  title="Light Theme PDF" 
                  className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-slate-500 hover:bg-orange-50 hover:text-orange-500 transition-all duration-200 disabled:opacity-50 active:scale-95 cursor-pointer"
                >
                  {isGenerating ? <Loader2 className="w-4 h-4 animate-spin"/> : <Sun className="w-4 h-4"/>}
                  <span className="text-xs font-medium">Light</span>
                </button>
              </div>

              {/* Edit/Delete Actions */}
              <button 
                onClick={onEdit} 
                className="flex items-center gap-1.5 px-3 py-2 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 border border-transparent hover:border-indigo-100 rounded-xl transition-all duration-200 active:scale-95 cursor-pointer"
                title="Edit Details"
              >
                <Edit className="w-4 h-4"/>
                <span className="text-xs font-medium">Edit</span>
              </button>
              <button 
                onClick={onDelete} 
                className="flex items-center gap-1.5 px-3 py-2 text-slate-500 hover:text-rose-600 hover:bg-rose-50 border border-transparent hover:border-rose-100 rounded-xl transition-all duration-200 active:scale-95 cursor-pointer"
                title="Delete Record"
              >
                <Trash2 className="w-4 h-4"/>
                <span className="text-xs font-medium">Delete</span>
              </button>
            </>
          )}
        </div>
      </td>
    </tr>
  );
};

export default TableRow;