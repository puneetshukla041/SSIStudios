'use client';

import React, { useState } from 'react';
import { CreditCard, Search, Loader2, ChevronLeft, ChevronRight, CheckCircle, AlertCircle, Info } from 'lucide-react';
import * as XLSX from 'xlsx';

// Components & Hooks
import { useVisitingCardData } from '@/components/VisitingCards/hooks/useVisitingCardData';
import AddVisitingCardForm from '@/components/VisitingCards/ui/AddVisitingCardForm';
import QuickActionBar from '@/components/VisitingCards/ui/QuickActionBar';
import TableHeader from '@/components/VisitingCards/ui/TableHeader';
import TableRow from '@/components/VisitingCards/ui/TableRow';
import DesignationPieChart from '@/components/VisitingCards/analysis/DesignationPieChart';
import { generateVisitingCardPDF } from '@/components/VisitingCards/utils/pdfGenerator';
import { sortCards } from '@/components/VisitingCards/utils/helpers';
import { IVisitingCardClient, initialNewCardState, PAGE_LIMIT, NotificationState } from '@/components/VisitingCards/utils/constants';

export default function VisitingCardPage() {
  // Data Hook
  const {
    cards, isLoading, totalItems, uniqueDesignations, currentPage, setCurrentPage,
    searchQuery, setSearchQuery, designationFilter, setDesignationFilter,
    sortConfig, setSortConfig, fetchCards, setCards
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

  // Handlers
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
        showNotification('Card updated', 'success');
        setEditingId(null);
        fetchCards();
      }
    } catch (e) { showNotification('Update failed', 'error'); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure?')) return;
    setDeletingId(id);
    try {
      await fetch(`/api/visitingcards/${id}`, { method: 'DELETE' });
      showNotification('Deleted', 'info');
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
    <div className="min-h-screen w-full bg-slate-50 text-slate-800 p-4 md:p-8 font-sans">
      
      {/* Toast Notification */}
      {notification && (
        <div className={`fixed top-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 px-6 py-3 rounded-full shadow-xl bg-white border border-slate-100 animate-in slide-in-from-top-2`}>
          {notification.type === 'success' && <CheckCircle className="text-green-500 w-5 h-5"/>}
          {notification.type === 'error' && <AlertCircle className="text-red-500 w-5 h-5"/>}
          {notification.type === 'info' && <Info className="text-blue-500 w-5 h-5"/>}
          <span className="font-medium text-sm">{notification.message}</span>
        </div>
      )}

      <div className="max-w-[1400px] mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2.5 bg-blue-600 rounded-xl shadow-lg shadow-blue-600/20">
            <CreditCard className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Visiting Card Manager</h1>
            <p className="text-sm text-slate-500 font-medium">Manage digital identities and generate cards</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Controls & Table (2/3 width) */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Search Bar Area */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-3">
              <Search className="w-5 h-5 text-slate-400 ml-2" />
              <input 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by name, email, or designation..."
                className="flex-1 outline-none text-sm bg-transparent"
              />
            </div>

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
            />

            {isAddFormVisible && (
              <AddVisitingCardForm 
                newCard={newCard} 
                setNewCard={setNewCard} 
                isAdding={isAdding}
                onSubmit={handleAdd}
                onCancel={() => setIsAddFormVisible(false)}
              />
            )}

            {isLoading ? (
              <div className="flex justify-center py-20"><Loader2 className="w-10 h-10 text-blue-600 animate-spin"/></div>
            ) : (
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <TableHeader 
                      onSort={(key) => setSortConfig({ key, direction: sortConfig?.direction === 'asc' ? 'desc' : 'asc' })}
                      sortConfig={sortConfig}
                      allSelected={cards.length > 0 && selectedIds.length === cards.length}
                      onSelectAll={(checked) => setSelectedIds(checked ? cards.map(c => c._id) : [])}
                    />
                    <tbody>
                      {sortedCards.length === 0 ? (
                        <tr><td colSpan={6} className="text-center py-10 text-slate-400">No cards found</td></tr>
                      ) : (
                        sortedCards.map(card => (
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
                
                {/* Pagination */}
                <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100 bg-slate-50/50">
                  <span className="text-sm text-slate-500">Page {currentPage} of {totalPages}</span>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                      className="p-2 rounded-lg border bg-white hover:bg-slate-50 disabled:opacity-50"
                    >
                      <ChevronLeft className="w-4 h-4"/>
                    </button>
                    <button 
                      onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                      className="p-2 rounded-lg border bg-white hover:bg-slate-50 disabled:opacity-50"
                    >
                      <ChevronRight className="w-4 h-4"/>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right: Analysis Chart (1/3 width) */}
          <div className="lg:col-span-1 h-full min-h-[400px]">
            <DesignationPieChart uniqueDesignations={uniqueDesignations} cards={cards} />
          </div>
        </div>
      </div>
    </div>
  );
}