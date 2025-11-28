'use client';

import React, { useState } from 'react';
import { 
  CheckCircle, AlertCircle, Info, Users
} from 'lucide-react';
import * as XLSX from 'xlsx';

// Components & Hooks
import { useVisitingCardData } from '@/components/VisitingCards/hooks/useVisitingCardData';
import AddVisitingCardForm from '@/components/VisitingCards/ui/AddVisitingCardForm';
import QuickActionBar from '@/components/VisitingCards/ui/QuickActionBar';
import TableHeader from '@/components/VisitingCards/ui/TableHeader';
import TableRow from '@/components/VisitingCards/ui/TableRow';
import { generateVisitingCardPDF } from '@/components/VisitingCards/utils/pdfGenerator';
import { sortCards } from '@/components/VisitingCards/utils/helpers';
import { IVisitingCardClient, initialNewCardState, PAGE_LIMIT, NotificationState } from '@/components/VisitingCards/utils/constants';

// --- Minimalist Notification Toast ---
const NotificationToast = ({ notification }: { notification: NotificationState }) => (
  <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[100] animate-in slide-in-from-top-4 fade-in duration-300">
    <div className={`flex items-center gap-3 px-5 py-3 rounded-lg shadow-xl border backdrop-blur-md
      ${notification.type === 'success' ? 'bg-white border-emerald-100 text-emerald-700' : 
        notification.type === 'error' ? 'bg-white border-rose-100 text-rose-700' : 
        'bg-white border-blue-100 text-blue-700'}`}>
      {notification.type === 'success' && <CheckCircle className="w-5 h-5 text-emerald-500" />}
      {notification.type === 'error' && <AlertCircle className="w-5 h-5 text-rose-500" />}
      {notification.type === 'info' && <Info className="w-5 h-5 text-blue-500" />}
      <span className="font-medium text-sm">{notification.message}</span>
    </div>
  </div>
);

export default function VisitingCardPage() {
  // Data Hook
  const {
    cards, isLoading, totalItems, uniqueDesignations, currentPage, setCurrentPage,
    searchQuery, setSearchQuery, designationFilter, setDesignationFilter,
    sortConfig, setSortConfig, fetchCards
  } = useVisitingCardData();

  // UI States
  const [isAddFormVisible, setIsAddFormVisible] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editFormData, setEditFormData] = useState<Partial<IVisitingCardClient>>({});
  const [newCard, setNewCard] = useState(initialNewCardState);
  const [isAdding, setIsAdding] = useState(false);
  const [generatingPdfId, setGeneratingPdfId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [notification, setNotification] = useState<NotificationState | null>(null);

  // Helper: Notification
  const showNotification = (message: string, type: 'success' | 'error' | 'info') => {
    setNotification({ message, type, active: true });
    setTimeout(() => setNotification(null), 3000);
  };

  // --- Actions ---
  const handleAdd = async () => {
    setIsAdding(true);
    try {
      const res = await fetch('/api/visitingcards', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newCard)
      });
      if (res.ok) {
        showNotification('Card created successfully', 'success');
        setNewCard(initialNewCardState);
        setIsAddFormVisible(false);
        fetchCards();
      } else {
        showNotification('Failed to create card', 'error');
      }
    } catch (e) { showNotification('Network error', 'error'); }
    finally { setIsAdding(false); }
  };

  const handleSave = async (id: string) => {
    try {
      const res = await fetch(`/api/visitingcards/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editFormData)
      });
      if (res.ok) {
        showNotification('Updated successfully', 'success');
        setEditingId(null);
        fetchCards();
      }
    } catch (e) { showNotification('Update failed', 'error'); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure? This action is permanent.')) return;
    setDeletingId(id);
    try {
      await fetch(`/api/visitingcards/${id}`, { method: 'DELETE' });
      showNotification('Deleted successfully', 'info');
      fetchCards();
    } catch (e) { showNotification('Delete failed', 'error'); }
    finally { setDeletingId(null); }
  };

  const handleBulkDelete = async () => {
    if (!confirm(`Delete ${selectedIds.length} items?`)) return;
    try {
      await fetch('/api/visitingcards/bulk', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: selectedIds })
      });
      showNotification('Bulk delete successful', 'success');
      setSelectedIds([]);
      fetchCards();
    } catch (e) { showNotification('Bulk delete failed', 'error'); }
  };

  const handleDownloadExcel = () => {
    const ws = XLSX.utils.json_to_sheet(cards);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Cards");
    XLSX.writeFile(wb, "VisitingCards.xlsx");
  };

  const sortedCards = sortCards(cards, sortConfig);
  const totalPages = Math.ceil(totalItems / PAGE_LIMIT);

  return (
    <div className="min-h-screen w-full bg-[#F9FAFB] text-slate-900 font-sans pb-20">
      
      {/* Subtle Noise Texture */}
      <div className="fixed inset-0 z-0 opacity-[0.015] bg-[url('https://grainy-gradients.vercel.app/noise.svg')] pointer-events-none" />

      {notification && <NotificationToast notification={notification} />}

      <div className="relative z-10 max-w-[1600px] mx-auto px-6 lg:px-10 py-8 space-y-6">
        
        {/* --- Header: Clean & Minimal --- */}
        <header className="flex items-center gap-4 pb-2">
           <div className="relative w-12 h-12 bg-white rounded-xl border border-slate-200 shadow-sm flex items-center justify-center p-2">
              <img src="/logos/ssilogo.png" alt="SSI" className="w-full h-full object-contain" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Visiting Card Manager</h1>
              <p className="text-sm text-slate-500 font-medium">SSI Studios • Identity System</p>
            </div>
        </header>

        {/* --- Control Bar --- */}
        <QuickActionBar 
          isAddFormVisible={isAddFormVisible}
          setIsAddFormVisible={setIsAddFormVisible}
          designationFilter={designationFilter}
          setDesignationFilter={setDesignationFilter}
          uniqueDesignations={uniqueDesignations}
          selectedIds={selectedIds}
          handleBulkDelete={handleBulkDelete}
          handleDownload={handleDownloadExcel}
          isGenerating={false}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
        />

        {/* --- Form Collapse Area --- */}
        <div className={`transition-all duration-300 ease-out overflow-hidden ${isAddFormVisible ? 'max-h-[800px] opacity-100' : 'max-h-0 opacity-0'}`}>
           <AddVisitingCardForm 
             newCard={newCard} 
             setNewCard={setNewCard} 
             isAdding={isAdding}
             onSubmit={handleAdd}
             onCancel={() => setIsAddFormVisible(false)}
           />
        </div>

        {/* --- Data Table Container --- */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col min-h-[600px] overflow-hidden">
          {isLoading ? (
            <div className="flex-1 flex flex-col items-center justify-center gap-3 text-slate-400">
               <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
               <span className="text-sm font-medium">Loading data...</span>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto flex-1">
                <table className="w-full text-left border-collapse">
                  <TableHeader 
                    onSort={(key) => setSortConfig({ key, direction: sortConfig?.direction === 'asc' ? 'desc' : 'asc' })}
                    sortConfig={sortConfig}
                    allSelected={cards.length > 0 && selectedIds.length === cards.length}
                    onSelectAll={(checked) => setSelectedIds(checked ? cards.map(c => c._id) : [])}
                  />
                  <tbody className="divide-y divide-slate-50">
                    {sortedCards.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="text-center py-24">
                          <div className="flex flex-col items-center gap-3 text-slate-400">
                            <Users className="w-10 h-10 opacity-20" />
                            <span className="text-sm font-medium">No records found.</span>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      sortedCards.map((card) => (
                        <TableRow 
                          key={card._id}
                          card={card}
                          isSelected={selectedIds.includes(card._id)}
                          isEditing={editingId === card._id}
                          isDeleting={deletingId === card._id}
                          generatingId={generatingPdfId}
                          editData={editFormData}
                          onSelect={(checked) => setSelectedIds(prev => checked ? [...prev, card._id] : prev.filter(id => id !== card._id))}
                          onEdit={() => { setEditingId(card._id); setEditFormData(card); }}
                          onCancelEdit={() => setEditingId(null)}
                          onSave={() => handleSave(card._id)}
                          onDelete={() => handleDelete(card._id)}
                          onChange={(field, val) => setEditFormData(prev => ({ ...prev, [field]: val }))}
                          onGeneratePdf={(theme) => generateVisitingCardPDF(card, (msg, err) => showNotification(msg, err ? 'error' : 'success'), theme, setGeneratingPdfId)}
                        />
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* --- Minimal Footer --- */}
              <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100 bg-slate-50/50">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wide">
                  {totalItems} Records
                </span>
                
                {totalPages > 1 && (
                  <div className="flex gap-2">
                    <button 
                      onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                      className="px-3 py-1.5 text-sm font-medium bg-white border border-slate-200 rounded-lg text-slate-600 hover:border-indigo-300 hover:text-indigo-600 disabled:opacity-50 disabled:hover:border-slate-200 transition-colors"
                    >
                      Prev
                    </button>
                    <span className="flex items-center px-2 text-sm font-medium text-slate-600">
                      {currentPage} / {totalPages}
                    </span>
                    <button 
                      onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                      className="px-3 py-1.5 text-sm font-medium bg-white border border-slate-200 rounded-lg text-slate-600 hover:border-indigo-300 hover:text-indigo-600 disabled:opacity-50 disabled:hover:border-slate-200 transition-colors"
                    >
                      Next
                    </button>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}