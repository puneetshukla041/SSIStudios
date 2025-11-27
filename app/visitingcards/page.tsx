'use client';

import React, { useState } from 'react';
import { 
  Search, Loader2, ChevronLeft, ChevronRight, 
  CheckCircle, AlertCircle, Info, Sparkles 
} from 'lucide-react';
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

  // Handlers (Logic Preserved)
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
    <div className="min-h-screen w-full bg-[#F1F5F9] text-slate-900 font-sans selection:bg-indigo-100 selection:text-indigo-900">
      
      {/* Refined Background Layers */}
      <div className="fixed inset-0 z-0 bg-gradient-to-br from-slate-50 via-slate-100 to-slate-200 opacity-80 pointer-events-none" />
      <div className="fixed inset-0 z-0 opacity-[0.03] bg-[url('https://grainy-gradients.vercel.app/noise.svg')] pointer-events-none" />

      {/* Floating Notification */}
      {notification && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[100] animate-in slide-in-from-top-4 fade-in duration-300">
          <div className={`flex items-center gap-3 px-6 py-4 rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.08)] border backdrop-blur-md
            ${notification.type === 'success' ? 'bg-white/95 border-emerald-100 text-emerald-800' : 
              notification.type === 'error' ? 'bg-white/95 border-rose-100 text-rose-800' : 
              'bg-white/95 border-blue-100 text-blue-800'}`}>
            {notification.type === 'success' && <CheckCircle className="w-5 h-5 text-emerald-500" />}
            {notification.type === 'error' && <AlertCircle className="w-5 h-5 text-rose-500" />}
            {notification.type === 'info' && <Info className="w-5 h-5 text-blue-500" />}
            <span className="font-medium text-sm tracking-wide">{notification.message}</span>
          </div>
        </div>
      )}

      <div className="relative z-10 max-w-[1600px] mx-auto p-6 md:p-10 space-y-8">
        
        {/* Professional Header */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-2">
          <div className="flex items-center gap-6">
            {/* SSI Logo Container */}
            <div className="relative flex-shrink-0 w-16 h-16 bg-white rounded-2xl shadow-sm border border-slate-100 flex items-center justify-center p-2">
              <img 
                src="/logos/ssilogo.png" 
                alt="SSI Studios" 
                className="w-full h-full object-contain"
              />
            </div>
            
            <div className="space-y-1">
              <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
                Visiting Card Manager
              </h1>
              <div className="flex items-center gap-3 text-sm font-medium text-slate-500">
                <span>Manage digital identities</span>
                <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                <span>Generate PDF Assets</span>
              </div>
            </div>
          </div>
          
          <div className="hidden md:flex items-center gap-2 bg-white px-4 py-2 rounded-full border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-center w-6 h-6 rounded-full bg-indigo-50 text-indigo-600">
               <Sparkles className="w-3.5 h-3.5" />
            </div>
            <div className="flex flex-col leading-none">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Total Active</span>
              <span className="text-sm font-bold text-slate-700">{totalItems} Identities</span>
            </div>
          </div>
        </header>

        {/* Main Dashboard Layout */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
          
          {/* LEFT COLUMN: Main Data Table */}
          <div className="xl:col-span-8 space-y-6">
            
            {/* Modern Toolbar */}
            <div className="flex flex-col lg:flex-row items-center justify-between gap-4 bg-white p-2 pr-4 rounded-2xl border border-slate-200 shadow-sm">
              <div className="relative w-full lg:w-96 group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Search className="h-4 w-4 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                </div>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="block w-full pl-11 pr-4 py-3 bg-slate-50 border-transparent rounded-xl text-sm font-medium placeholder-slate-400 focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all duration-200 outline-none"
                  placeholder="Search employees, emails, or roles..."
                />
              </div>

              <div className="w-full lg:w-auto flex justify-end">
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
              </div>
            </div>

            {/* Expandable Add Form */}
            <div className={`transition-all duration-500 ease-in-out overflow-hidden ${isAddFormVisible ? 'max-h-[800px] opacity-100' : 'max-h-0 opacity-0'}`}>
              <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100 mb-6">
                <AddVisitingCardForm 
                  newCard={newCard} 
                  setNewCard={setNewCard} 
                  isAdding={isAdding}
                  onSubmit={handleAdd}
                  onCancel={() => setIsAddFormVisible(false)}
                />
              </div>
            </div>

            {/* Data Table */}
            <div className="bg-white rounded-[1.5rem] border border-slate-200 shadow-sm flex flex-col min-h-[600px] relative overflow-hidden">
              {isLoading ? (
                <div className="flex-1 flex flex-col items-center justify-center gap-4 text-slate-400">
                  <Loader2 className="w-10 h-10 text-indigo-600 animate-spin" />
                  <span className="text-sm font-medium">Fetching records...</span>
                </div>
              ) : (
                <>
                  <div className="overflow-x-auto flex-1">
                    <table className="w-full text-left">
                      <TableHeader 
                        onSort={(key) => setSortConfig({ key, direction: sortConfig?.direction === 'asc' ? 'desc' : 'asc' })}
                        sortConfig={sortConfig}
                        allSelected={cards.length > 0 && selectedIds.length === cards.length}
                        onSelectAll={(checked) => setSelectedIds(checked ? cards.map(c => c._id) : [])}
                      />
                      <tbody className="divide-y divide-slate-100">
                        {sortedCards.length === 0 ? (
                          <tr>
                            <td colSpan={6} className="text-center py-32">
                              <div className="flex flex-col items-center gap-3 text-slate-300">
                                <div className="p-4 rounded-full bg-slate-50">
                                  <Search className="w-8 h-8 opacity-50" />
                                </div>
                                <span className="text-sm font-medium text-slate-500">No visiting cards found matching your criteria.</span>
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

                  {/* Pagination Footer */}
                  <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100 bg-slate-50/50 backdrop-blur-sm">
                    <div className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                      Page <span className="text-slate-900">{currentPage}</span> of <span className="text-slate-900">{totalPages}</span>
                    </div>
                    <div className="flex gap-2">
                      <button 
                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                        disabled={currentPage === 1}
                        className="p-2.5 rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-white hover:text-indigo-600 hover:border-indigo-200 disabled:opacity-40 disabled:hover:bg-white disabled:hover:text-slate-600 disabled:hover:border-slate-200 transition-all shadow-sm active:scale-95"
                      >
                        <ChevronLeft className="w-4 h-4"/>
                      </button>
                      <button 
                        onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                        disabled={currentPage === totalPages}
                        className="p-2.5 rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-white hover:text-indigo-600 hover:border-indigo-200 disabled:opacity-40 disabled:hover:bg-white disabled:hover:text-slate-600 disabled:hover:border-slate-200 transition-all shadow-sm active:scale-95"
                      >
                        <ChevronRight className="w-4 h-4"/>
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* RIGHT COLUMN: Analytics & Widgets */}
          <div className="xl:col-span-4 space-y-6">
            <div className="sticky top-6 space-y-6">
              
              {/* Analytics Card */}
              <div className="bg-white rounded-[2rem] border border-slate-200 shadow-lg shadow-slate-200/50 p-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-40 h-40 bg-indigo-50 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none" />
                <div className="relative z-10">
                  <h3 className="text-lg font-bold text-slate-900 mb-1">Organization Insights</h3>
                  <p className="text-sm text-slate-500 mb-6 font-medium">Designation distribution across company</p>
                  <div className="min-h-[320px] flex items-center justify-center bg-slate-50/50 rounded-2xl border border-slate-100/50">
                    <DesignationPieChart uniqueDesignations={uniqueDesignations} cards={cards} />
                  </div>
                </div>
              </div>

              {/* Quick Tip Widget */}
              <div className="bg-[#1E293B] rounded-[2rem] p-6 text-white shadow-xl shadow-slate-900/10 relative overflow-hidden">
                 {/* Decorative background shape */}
                 <div className="absolute bottom-0 right-0 w-32 h-32 bg-indigo-500/20 rounded-full blur-2xl translate-x-10 translate-y-10" />
                 
                <div className="relative z-10 flex items-start gap-4">
                  <div className="p-3 bg-indigo-500/20 rounded-xl backdrop-blur-md border border-indigo-500/30">
                    <Info className="w-5 h-5 text-indigo-300" />
                  </div>
                  <div>
                    <h4 className="font-bold text-base mb-2 text-slate-100">Did you know?</h4>
                    <p className="text-sm text-slate-400 leading-relaxed">
                      Keeping designations consistent ensures accurate analytics. Use the search bar to find and edit outdated roles quickly.
                    </p>
                  </div>
                </div>
              </div>

            </div>
          </div>

        </div>
      </div>
    </div>
  );
}