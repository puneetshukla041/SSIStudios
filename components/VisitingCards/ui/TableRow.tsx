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
    <tr className={`transition-all duration-300 border-b border-slate-50 last:border-none hover:bg-slate-50/80 ${isDeleting ? 'opacity-0' : 'opacity-100'} ${isSelected ? 'bg-blue-50/50' : ''}`}>
      <td className="px-4 py-3.5 text-center">
        <input type="checkbox" checked={isSelected} onChange={(e) => onSelect(e.target.checked)} className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"/>
      </td>
      
      {['firstName', 'lastName', 'designation', 'phone', 'email'].map((field) => (
        <td key={field} className="px-4 py-3.5 text-sm whitespace-nowrap">
          {isEditing ? (
            <input 
              value={(editData as any)[field] || ''}
              onChange={(e) => onChange(field as keyof IVisitingCardClient, e.target.value)}
              className="w-full bg-white border border-blue-300 rounded px-2 py-1 outline-none text-slate-800 focus:ring-2 focus:ring-blue-100"
            />
          ) : field === 'designation' ? (
            <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${getDesignationColor(card.designation)}`}>
              {card.designation}
            </span>
          ) : (
            <span className="text-slate-600 font-medium">{(card as any)[field]}</span>
          )}
        </td>
      ))}

      <td className="px-4 py-3.5 text-right">
        <div className="flex justify-end gap-2">
          {isEditing ? (
            <>
              <button onClick={onSave} className="p-2 bg-emerald-50 text-emerald-600 rounded-lg hover:bg-emerald-100"><Save className="w-4 h-4"/></button>
              <button onClick={onCancelEdit} className="p-2 bg-slate-100 text-slate-500 rounded-lg hover:bg-slate-200"><X className="w-4 h-4"/></button>
            </>
          ) : (
            <>
              <button onClick={() => onGeneratePdf('dark')} disabled={isGenerating} title="Dark Theme PDF" className="p-2 bg-slate-800 text-white rounded-lg hover:bg-slate-700 transition">
                {isGenerating ? <Loader2 className="w-4 h-4 animate-spin"/> : <Moon className="w-4 h-4"/>}
              </button>
              <button onClick={() => onGeneratePdf('light')} disabled={isGenerating} title="Light Theme PDF" className="p-2 bg-white border border-slate-200 text-orange-500 rounded-lg hover:bg-orange-50 transition">
                {isGenerating ? <Loader2 className="w-4 h-4 animate-spin"/> : <Sun className="w-4 h-4"/>}
              </button>
              <button onClick={onEdit} className="p-2 bg-white border border-slate-200 text-blue-600 rounded-lg hover:bg-blue-50 transition">
                <Edit className="w-4 h-4"/>
              </button>
              <button onClick={onDelete} className="p-2 bg-white border border-slate-200 text-red-600 rounded-lg hover:bg-red-50 transition">
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