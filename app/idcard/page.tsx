"use client";
import React, { useEffect, useState, useRef } from "react";
import {
  Upload,
  XCircle,
  Download,
  Trash2,
  Edit,
  Plus,
  Save,
  Search,
  ArrowLeft,
  CreditCard,
  User,
  Briefcase,
  Droplet,
  Layout,
  Maximize2,
  X,
  Hash // Keeping Hash for ID Number
} from "lucide-react";
import { generateIdCardPDF, IIdCardData } from "@/components/Certificates/utils/idCardGenerator";

// --- Helper: Blood Group Image Mapping ---
const getBloodGroupImage = (bg: string) => {
  const map: Record<string, string> = {
    "A+": "/bloodgroup/aplus.png",
    "A-": "/bloodgroup/aminus.png",
    "B+": "/bloodgroup/bplus.png",
    "B-": "/bloodgroup/bminus.png",
    "AB+": "/bloodgroup/abplus.png",
    "AB-": "/bloodgroup/abminus.png",
    "O+": "/bloodgroup/oplus.png",
    "O-": "/bloodgroup/ominus.png",
  };
  return map[bg] || null;
};

// --- Responsive UI Components ---

// FIX: Added '|| ""' to value prop to prevent 'undefined' (uncontrolled) error
const InputComponent = ({ label, value, onChange, placeholder, type = "text", icon: Icon }: any) => (
  <div className="w-full">
    <label className="block text-xs font-extrabold text-slate-600 uppercase tracking-wider mb-2 ml-1">
      {label}
    </label>
    <div className="relative group">
      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors duration-300 pointer-events-none">
        {Icon && <Icon size={20} />}
      </div>
      <input
        type={type}
        value={value || ""} 
        onChange={onChange}
        placeholder={placeholder}
        className="w-full bg-white border border-slate-300 rounded-xl py-3.5 pl-12 pr-4 text-sm text-slate-900 font-bold outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-600 transition-all duration-300 shadow-sm hover:border-slate-500 placeholder:text-slate-300"
      />
    </div>
  </div>
);

// Updated SelectComponent to handle Image Icons
const SelectComponent = ({ label, value, onChange, options, icon: IconOrUrl }: any) => {
  const isImage = typeof IconOrUrl === 'string';

  return (
    <div className="w-full">
      <label className="block text-xs font-extrabold text-slate-600 uppercase tracking-wider mb-2 ml-1">
        {label}
      </label>
      <div className="relative group">
        <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center justify-center pointer-events-none">
          {isImage ? (
            <img src={IconOrUrl} alt="icon" className="w-6 h-6 object-contain opacity-90" />
          ) : (
             IconOrUrl && <IconOrUrl size={20} className="text-slate-400 group-focus-within:text-indigo-600 transition-colors" />
          )}
        </div>
        <select
          value={value || ""} // FIX: Added '|| ""' here as well for safety
          onChange={onChange}
          className="w-full bg-white border border-slate-300 rounded-xl py-3.5 pl-12 pr-10 text-sm text-slate-900 font-bold outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-600 transition-all duration-300 shadow-sm hover:border-slate-500 appearance-none cursor-pointer"
        >
          <option value="" disabled hidden>Select...</option>
          {options.map((opt: string) => (
            <option key={opt} value={opt}>{opt}</option>
          ))}
        </select>
        <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none text-slate-500">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7"></path></svg>
        </div>
      </div>
    </div>
  );
};

// --- Main Page Component ---

export default function IdCardsPage() {
  const [viewMode, setViewMode] = useState<'table' | 'editor'>('table');
  const [cards, setCards] = useState<IIdCardData[]>([]);
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  
  // Removed phoneNo
  const initialFormState: IIdCardData = {
    fullName: "",
    designation: "",
    idCardNo: "",
    bloodGroup: "",
    userImage: null,
    imageXOffset: 0,
    imageYOffset: 0,
  };

  const [formData, setFormData] = useState<IIdCardData>(initialFormState);
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [feedback, setFeedback] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);

  // Dragging State for Image
  const [isDragging, setIsDragging] = useState(false);
  const dragStart = useRef({ x: 0, y: 0 });
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchCards();
  }, []);

  const fetchCards = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/idcards");
      const data = await res.json();
      if (Array.isArray(data)) setCards(data);
    } catch (err) {
      console.error(err);
      setCards([]); 
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (viewMode !== 'editor') return;
    const timer = setTimeout(async () => {
      const result = await generateIdCardPDF(formData);
      if (result) {
        if (previewUrl) URL.revokeObjectURL(previewUrl);
        const url = URL.createObjectURL(result.blob);
        setPreviewUrl(url);
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [formData, viewMode]);

  const handleEdit = (card: IIdCardData) => {
    setSelectedCardId(card._id || null);
    // Ensure we merge with initialFormState so no fields are undefined
    setFormData({ ...initialFormState, ...card });
    setViewMode('editor');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCreateNew = () => {
    setSelectedCardId(null);
    setFormData(initialFormState);
    if(fileInputRef.current) fileInputRef.current.value = "";
    setViewMode('editor');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBackToTable = () => {
    fetchCards();
    setViewMode('table');
  };

  const handleSave = async () => {
    if (!formData.fullName || !formData.idCardNo) {
      setFeedback({ msg: "Name & ID Missing", type: "error" });
      setTimeout(() => setFeedback(null), 2000);
      return;
    }

    setIsSaving(true);
    try {
      const method = selectedCardId ? "PUT" : "POST";
      const url = selectedCardId ? `/api/idcards/${selectedCardId}` : "/api/idcards";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!res.ok) throw new Error("Failed to save");
      
      const savedCard = await res.json();
      setFeedback({ msg: "Saved!", type: "success" });
      
      if (selectedCardId) {
        setCards(prev => prev.map(c => c._id === savedCard._id ? savedCard : c));
      } else {
        setCards(prev => [savedCard, ...prev]);
        setSelectedCardId(savedCard._id);
        setFormData(savedCard);
      }
    } catch (err) {
      setFeedback({ msg: "Save Failed", type: "error" });
    } finally {
      setIsSaving(false);
      setTimeout(() => setFeedback(null), 3000);
    }
  };

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if(!confirm("Delete this card permanently?")) return;

    try {
      const res = await fetch(`/api/idcards/${id}`, { method: "DELETE" });
      if(res.ok) {
          setCards(prev => prev.filter(c => c._id !== id));
          if (selectedCardId === id && viewMode === 'editor') handleCreateNew();
      }
    } catch(err) {
      alert("Failed to delete");
    }
  };

  const handleDownload = async () => {
    const result = await generateIdCardPDF(formData);
    if (result) {
      const link = document.createElement("a");
      link.href = URL.createObjectURL(result.blob);
      link.download = result.filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ 
            ...prev, 
            userImage: reader.result as string,
            imageXOffset: 0, 
            imageYOffset: 0 
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const onDragStart = (e: React.MouseEvent) => {
    setIsDragging(true);
    dragStart.current = {
      x: e.clientX - formData.imageXOffset,
      y: e.clientY - formData.imageYOffset,
    };
  };

  const onDrag = (e: React.MouseEvent) => {
    if (!isDragging) return;
    const newX = e.clientX - dragStart.current.x;
    const newY = e.clientY - dragStart.current.y;
    const constrainedX = Math.max(-15, Math.min(15, newX));
    const constrainedY = Math.max(-20, Math.min(20, newY));

    setFormData(prev => ({ ...prev, imageXOffset: constrainedX, imageYOffset: constrainedY }));
  };

  const onDragEnd = () => setIsDragging(false);

  const filteredCards = cards.filter(c => 
    c.fullName.toLowerCase().includes(searchTerm.toLowerCase()) || 
    c.idCardNo.includes(searchTerm)
  );

  return (
    <div className="min-h-screen w-full bg-slate-100 text-slate-800 font-sans flex flex-col overflow-x-hidden selection:bg-indigo-100 selection:text-indigo-700"
         onMouseMove={onDrag} onMouseUp={onDragEnd} onMouseLeave={onDragEnd}>
      
      <style>{`
        .clip-image { clip-path: polygon(0% 0%, 100% 0%, 100% 85%, 0% 100%); touch-action: none; }
        ::-webkit-scrollbar { width: 6px; height: 6px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #94a3b8; border-radius: 10px; }
        ::-webkit-scrollbar-thumb:hover { background: #64748b; }
      `}</style>

      {/* --- Responsive Floating Header --- */}
      <div className="flex-shrink-0 z-30 pt-4 px-4 sm:px-8 md:px-12 lg:px-16 xl:px-24 sticky top-0 pointer-events-none w-full max-w-[1400px] mx-auto">
         <div className="pointer-events-auto w-full min-h-[5rem] bg-white border border-slate-300 shadow-2xl shadow-slate-300/50 rounded-[2rem] flex flex-col md:flex-row items-center justify-between px-4 sm:px-8 py-3 md:py-0 transition-all duration-300 gap-4 md:gap-0">
            
            <div className="flex items-center gap-3 sm:gap-5 w-full md:w-auto justify-between md:justify-start">
                <div className="flex items-center gap-3 sm:gap-5">
                    {viewMode === 'editor' ? (
                      <button onClick={handleBackToTable} className="cursor-pointer p-2.5 rounded-full bg-slate-100 border border-slate-300 hover:bg-slate-200 text-slate-700 hover:text-slate-900 transition-all group shadow-sm active:scale-95 flex-shrink-0">
                        <ArrowLeft size={18} className="group-hover:-translate-x-0.5 transition-transform" />
                      </button>
                    ) : (
                      <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br from-indigo-600 to-violet-700 flex items-center justify-center text-white shadow-lg shadow-indigo-500/30 ring-2 sm:ring-4 ring-indigo-50 flex-shrink-0">
                          <CreditCard size={18} strokeWidth={2.5} />
                      </div>
                    )}
                    
                    <div className="flex flex-col justify-center">
                      <h1 className="text-base sm:text-lg font-extrabold text-slate-900 leading-tight tracking-tight">
                          {viewMode === 'editor' ? (selectedCardId ? 'Edit Card' : 'New Card') : 'ID Database'}
                      </h1>
                      <p className="text-[9px] sm:text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-0.5">
                          SSI Studios
                      </p>
                    </div>
                </div>

                 <div className="md:hidden">
                    {viewMode === 'table' && (
                        <button 
                            onClick={handleCreateNew}
                            className="bg-slate-900 hover:bg-indigo-600 text-white p-2.5 rounded-full transition-all shadow-lg active:scale-95 cursor-pointer"
                        >
                            <Plus size={18} />
                        </button>
                    )}
                 </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
                {viewMode === 'table' && (
                  <div className="relative group w-full md:w-auto">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors" size={16} />
                    <input 
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      placeholder="Search..." 
                      className="w-full md:w-64 bg-slate-50 border border-slate-300 focus:border-indigo-600 rounded-full pl-11 pr-4 py-2 text-sm font-bold outline-none transition-all shadow-inner focus:ring-2 focus:ring-indigo-500/10 focus:bg-white text-slate-800"
                    />
                  </div>
                )}
                
                {viewMode === 'table' && (
                  <button 
                    onClick={handleCreateNew}
                    className="cursor-pointer hidden md:flex bg-slate-900 hover:bg-indigo-600 text-white px-5 py-2.5 rounded-full text-sm font-bold items-center gap-2 transition-all shadow-xl shadow-slate-900/10 hover:shadow-indigo-600/20 active:scale-95 transform hover:-translate-y-0.5 whitespace-nowrap"
                  >
                    <Plus size={18} /> <span className="hidden lg:inline">Add Card</span>
                  </button>
                )}

                {viewMode === 'editor' && (
                  <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto justify-end">
                      {feedback && (
                        <div className={`hidden lg:flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold animate-in fade-in slide-in-from-top-4 ${feedback.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-rose-50 text-rose-700 border border-rose-100'}`}>
                          <div className={`w-2 h-2 rounded-full ${feedback.type === 'success' ? 'bg-emerald-500' : 'bg-rose-500'}`}></div>
                          {feedback.msg}
                        </div>
                      )}
                      
                      <button onClick={handleSave} disabled={isSaving} className="cursor-pointer flex-1 sm:flex-none justify-center text-slate-700 hover:text-indigo-700 font-bold text-xs sm:text-sm px-4 sm:px-5 py-2.5 rounded-full bg-slate-50 border border-slate-300 hover:border-slate-500 hover:bg-white transition-all disabled:opacity-50 flex items-center gap-2">
                        <Save size={16} /> <span className="inline">{isSaving ? '...' : 'Save'}</span>
                      </button>
                      <button onClick={handleDownload} className="cursor-pointer flex-1 sm:flex-none justify-center bg-indigo-600 hover:bg-indigo-700 text-white px-4 sm:px-6 py-2.5 rounded-full text-xs sm:text-sm font-bold shadow-xl shadow-indigo-500/20 transition-all active:scale-95 flex items-center gap-2 hover:-translate-y-0.5">
                        <Download size={16} /> <span className="inline">Export</span>
                      </button>
                  </div>
                )}
            </div>
         </div>
      </div>

      {/* --- Main Workspace --- */}
      <div className="flex-1 relative w-full flex flex-col">
        <div className="flex-1 w-full max-w-[1400px] mx-auto px-4 sm:px-8 md:px-12 lg:px-16 xl:px-24 py-6">
            
            {viewMode === 'table' ? (
              <div className="h-full min-h-[60vh] bg-white/40 backdrop-blur-md rounded-[1.5rem] sm:rounded-[2.5rem] border border-slate-300 shadow-none flex flex-col animate-in fade-in slide-in-from-bottom-4 duration-500">
                 
                 <div className="hidden md:grid grid-cols-12 gap-6 px-8 py-5 border-b border-slate-300 bg-slate-200/80 text-[11px] font-extrabold text-slate-700 uppercase tracking-wider rounded-t-[2.5rem] mb-2">
                      <div className="col-span-5 pl-2">Employee Profile</div>
                      <div className="col-span-3">Designation</div>
                      <div className="col-span-2">ID Number</div>
                      <div className="col-span-2 text-right pr-4">Actions</div>
                 </div>

                 <div className="flex-1 p-3 sm:p-2">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center h-64 text-slate-500">
                           <div className="animate-spin rounded-full h-8 w-8 border-2 border-slate-400 border-b-indigo-600 mb-4"></div>
                           <span className="text-sm font-medium">Loading...</span>
                        </div>
                    ) : filteredCards.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-64 text-slate-500 gap-4">
                           <div className="w-20 h-20 rounded-[1.5rem] bg-white flex items-center justify-center border border-slate-300 shadow-sm">
                              <Search size={28} className="opacity-30 text-slate-600" />
                           </div>
                           <p className="text-sm font-medium">No records found.</p>
                        </div>
                    ) : (
                      <div className="space-y-3">
                      {filteredCards.map((card) => (
                        <React.Fragment key={card._id}>
                        <div className="hidden md:grid grid-cols-12 gap-6 px-6 py-4 rounded-[1.5rem] bg-white border border-slate-300 shadow-md items-center group cursor-pointer transition-all duration-200 hover:shadow-xl hover:border-slate-500 transform hover:-translate-y-0.5">
                            <div className="col-span-5 flex items-center gap-5 pl-2">
                              <div className="relative w-12 h-12 rounded-2xl bg-slate-100 border border-slate-300 overflow-hidden shadow-sm flex-shrink-0">
                                  {card.userImage ? (
                                    <img src={card.userImage} className="w-full h-full object-cover" />
                                  ) : (
                                    <div className="w-full h-full flex items-center justify-center text-slate-400 bg-slate-100">
                                      <User size={20} />
                                    </div>
                                  )}
                              </div>
                              <div className="min-w-0">
                                  <h3 className="text-sm font-extrabold text-slate-900 truncate">{card.fullName}</h3>
                                  <div className="flex items-center gap-2 mt-0.5">
                                    <span className={`w-2 h-2 rounded-full border border-white shadow-sm ${card.bloodGroup ? 'bg-emerald-500' : 'bg-slate-300'}`}></span>
                                    <p className="text-[11px] text-slate-600 truncate font-bold">{card.bloodGroup ? `${card.bloodGroup}` : "N/A"}</p>
                                  </div>
                              </div>
                            </div>

                            <div className="col-span-3">
                               <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-100 border border-slate-300 text-xs font-bold text-slate-700">
                                  <Briefcase size={14} className="opacity-60" />
                                  <span className="truncate max-w-[140px]">{card.designation}</span>
                               </div>
                            </div>

                            <div className="col-span-2">
                                <span className="font-mono text-xs font-bold text-slate-700 bg-slate-100 px-3 py-1.5 rounded-md border border-slate-300">
                                  {card.idCardNo}
                                </span>
                            </div>

                            <div className="col-span-2 flex justify-end gap-2 pr-4">
                               <button onClick={() => handleEdit(card)} className="cursor-pointer p-2 rounded-xl bg-slate-50 hover:bg-indigo-600 hover:text-white border border-slate-300 hover:border-indigo-600 text-slate-500 transition-all shadow-sm">
                                  <Edit size={16} />
                               </button>
                               <button onClick={(e) => handleDelete(e, card._id!)} className="cursor-pointer p-2 rounded-xl bg-slate-50 hover:bg-red-500 hover:text-white border border-slate-300 hover:border-red-500 text-slate-500 transition-all shadow-sm">
                                  <Trash2 size={16} />
                               </button>
                            </div>
                        </div>

                        <div className="md:hidden bg-white rounded-2xl p-4 shadow-md border border-slate-300 flex items-center justify-between mb-3 hover:border-slate-500 transition-colors">
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 rounded-xl bg-slate-100 border border-slate-300 overflow-hidden flex-shrink-0">
                                   {card.userImage ? <img src={card.userImage} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-slate-400"><User size={20} /></div>}
                                </div>
                                <div>
                                    <h3 className="text-sm font-extrabold text-slate-900">{card.fullName}</h3>
                                    <p className="text-xs text-slate-600 font-bold">{card.designation}</p>
                                    <div className="flex items-center gap-2 mt-1">
                                       <span className="text-[10px] font-mono bg-slate-100 px-1.5 py-0.5 rounded text-slate-700 border border-slate-300 font-bold">#{card.idCardNo}</span>
                                    </div>
                                </div>
                            </div>
                            <div className="flex flex-col gap-2 pl-3 border-l border-slate-200">
                                <button onClick={() => handleEdit(card)} className="cursor-pointer p-2 text-indigo-600 bg-indigo-50 rounded-lg border border-indigo-200"><Edit size={16} /></button>
                                <button onClick={(e) => handleDelete(e, card._id!)} className="cursor-pointer p-2 text-red-500 bg-red-50 rounded-lg border border-red-200"><Trash2 size={16} /></button>
                            </div>
                        </div>
                        </React.Fragment>
                      ))}
                      </div>
                    )}
                 </div>
              </div>
            ) : (
              <div className="h-full bg-white rounded-[1.5rem] sm:rounded-[2.5rem] border border-slate-300 shadow-2xl shadow-slate-300/40 flex overflow-hidden animate-in zoom-in-95 duration-300 relative min-h-[70vh]">
                  
                  <div className="hidden xl:flex w-72 border-r border-slate-300 bg-slate-50/50 flex-col z-10">
                      <div className="p-6 bg-white/50 backdrop-blur border-b border-slate-300 flex items-center justify-between">
                         <h3 className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Directory</h3>
                         <div className="text-[10px] bg-indigo-50 px-2 py-0.5 rounded-md text-indigo-600 font-bold border border-indigo-100">{filteredCards.length}</div>
                      </div>
                      <div className="flex-1 overflow-y-auto p-4 space-y-2 custom-scrollbar">
                         {filteredCards.map(card => (
                            <button 
                              key={card._id}
                              onClick={() => handleEdit(card)}
                              className={`cursor-pointer w-full text-left p-3 rounded-2xl flex items-center gap-3 transition-all group border ${selectedCardId === card._id ? 'bg-white border-indigo-400 shadow-md shadow-indigo-100/50 relative z-10 ring-1 ring-indigo-500/20' : 'hover:bg-white hover:border-slate-400 border-transparent'}`}
                            >
                              <div className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold transition-colors flex-shrink-0 ${selectedCardId === card._id ? 'bg-indigo-600 text-white' : 'bg-slate-200 text-slate-600 group-hover:bg-slate-300'}`}>
                                  {card.fullName.charAt(0)}
                              </div>
                              <div className="min-w-0">
                                  <p className={`text-xs font-bold truncate transition-colors ${selectedCardId === card._id ? 'text-indigo-900' : 'text-slate-800'}`}>{card.fullName}</p>
                                  <p className="text-[10px] text-slate-500 truncate font-medium">{card.designation}</p>
                              </div>
                            </button>
                         ))}
                      </div>
                  </div>

                  <div className="flex-1 bg-white overflow-y-auto relative scroll-smooth custom-scrollbar">
                      <div className="max-w-3xl mx-auto p-6 md:p-10 lg:p-12 pb-32">
                          <div className="mb-6 md:mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
                            <div>
                              <h2 className="text-xl md:text-2xl font-bold text-slate-800 tracking-tight">Employee Details</h2>
                              <p className="text-xs md:text-sm text-slate-500 mt-1 font-medium">Please verify all information before saving.</p>
                            </div>
                            
                            <button 
                              onClick={() => setShowPreviewModal(true)}
                              className="cursor-pointer 2xl:hidden w-full md:w-auto flex items-center justify-center gap-2 text-xs font-bold text-indigo-600 bg-indigo-50 px-4 py-2.5 rounded-xl border border-indigo-200 hover:bg-indigo-100 transition-colors"
                            >
                                <Maximize2 size={16} /> Check Preview
                            </button>
                          </div>

                          <div className="space-y-6 md:space-y-8">
                            <div className="bg-slate-50/80 rounded-[1.5rem] md:rounded-[2rem] border-2 border-dashed border-slate-400 p-6 md:p-8 flex flex-col md:flex-row items-center gap-6 md:gap-8 group hover:border-indigo-500 hover:bg-indigo-50/10 transition-all">
                               <div className="relative flex-shrink-0">
                                  <div className="w-28 h-[149px] md:w-32 md:h-[170px] bg-white rounded-2xl shadow-xl ring-4 ring-white border border-slate-200 overflow-hidden relative cursor-grab active:cursor-grabbing transition-transform hover:scale-[1.02]" onMouseDown={onDragStart}>
                                    {formData.userImage ? (
                                        <>
                                          <img 
                                            src={formData.userImage} 
                                            className="w-full h-full object-contain pointer-events-none clip-image bg-slate-100"
                                            style={{ transform: `translate(${formData.imageXOffset}px, ${formData.imageYOffset}px)` }} 
                                          />
                                          <button 
                                            onClick={(e) => { e.stopPropagation(); setFormData(prev => ({ ...prev, userImage: null })); }}
                                            className="cursor-pointer absolute top-2 right-2 bg-white/90 backdrop-blur text-slate-800 p-1.5 rounded-full hover:bg-red-500 hover:text-white transition-all shadow-sm opacity-100 md:opacity-0 group-hover:opacity-100"
                                          >
                                              <XCircle size={14} />
                                          </button>
                                        </>
                                    ) : (
                                        <div className="w-full h-full flex flex-col items-center justify-center text-slate-300 bg-slate-50">
                                           <User size={40} strokeWidth={1.5} />
                                        </div>
                                    )}
                                  </div>
                                  {formData.userImage && <div className="absolute -bottom-6 left-0 w-full text-center text-[10px] font-bold text-indigo-500 uppercase tracking-wide animate-pulse">Drag to Adjust</div>}
                               </div>

                               <div className="flex-1 text-center md:text-left w-full">
                                  <h4 className="text-sm font-bold text-slate-800 mb-1">Profile Photo</h4>
                                  <p className="text-xs text-slate-500 mb-4 leading-relaxed max-w-xs mx-auto md:mx-0 font-medium">
                                    Upload a professional headshot. <br className="hidden md:block"/> Plain background recommended.
                                  </p>
                                  <div className="flex gap-3 justify-center md:justify-start">
                                     <button onClick={() => fileInputRef.current?.click()} className="cursor-pointer w-full md:w-auto px-5 py-2.5 bg-white border border-slate-400 rounded-xl text-xs font-bold text-slate-700 hover:border-indigo-600 hover:text-indigo-600 transition-all shadow-sm hover:shadow-md flex items-center justify-center gap-2 transform active:scale-95">
                                               <Upload size={16} /> Choose File
                                     </button>
                                     <input ref={fileInputRef} type="file" hidden accept="image/*" onChange={handleImageChange} />
                                  </div>
                               </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-6 md:gap-y-8">
                               <div className="md:col-span-2">
                                  <InputComponent 
                                    label="Full Legal Name" 
                                    value={formData.fullName} 
                                    onChange={(e: any) => setFormData({...formData, fullName: e.target.value})} 
                                    placeholder="Puneet Shukla" 
                                    icon={User} 
                                  />
                               </div>
                               <InputComponent 
                                 label="Job Designation" 
                                 value={formData.designation} 
                                 onChange={(e: any) => setFormData({...formData, designation: e.target.value})} 
                                 placeholder="Software Engineer" 
                                 icon={Briefcase} 
                               />
                               
                               <InputComponent 
                                 label="ID Number" 
                                 value={formData.idCardNo} 
                                 onChange={(e: any) => setFormData({...formData, idCardNo: e.target.value})} 
                                 placeholder="EMP-001" 
                                 icon={Hash} // Removed Phone Input, kept ID
                               />

                               <SelectComponent 
                                 label="Blood Group" 
                                 value={formData.bloodGroup} 
                                 options={["A-", "A+", "AB-", "AB+", "B-", "B+", "O-", "O+"]} 
                                 onChange={(e: any) => setFormData({...formData, bloodGroup: e.target.value})} 
                                 icon={getBloodGroupImage(formData.bloodGroup) || Droplet} 
                               />
                            </div>
                          </div>
                      </div>
                  </div>

                  <div className="hidden 2xl:flex w-[480px] bg-slate-50/50 border-l border-slate-300 p-10 flex-col items-center justify-center relative flex-shrink-0">
                      <div className="absolute inset-0 overflow-hidden pointer-events-none">
                         <div className="absolute w-[500px] h-[500px] bg-indigo-300/10 rounded-full blur-[100px] -top-20 -right-20"></div>
                      </div>

                      <div className="w-full flex items-center justify-between mb-8 z-10">
                         <h3 className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Live Preview</h3>
                         <span className="text-[10px] font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded border border-green-100">Auto-Update</span>
                      </div>
                      
                      <div className="flex-1 flex items-center justify-center w-full z-10">
                         {previewUrl ? (
                            <div className="relative w-full aspect-[1/1.4] bg-white rounded-2xl shadow-2xl shadow-slate-300/50 ring-1 ring-slate-900/5 overflow-hidden transform transition-transform hover:scale-[1.02] duration-500 group">
                               <iframe src={`${previewUrl}#toolbar=0&navpanes=0`} className="w-full h-full border-none" />
                            </div>
                         ) : (
                            <div className="w-full aspect-[1/1.4] bg-white rounded-2xl shadow-sm border border-slate-300 flex flex-col items-center justify-center text-slate-300 gap-4">
                               <div className="animate-pulse bg-slate-50 w-24 h-24 rounded-full flex items-center justify-center border border-slate-200">
                                  <Layout size={32} className="opacity-30" />
                               </div>
                               <p className="text-xs font-medium text-slate-400">Waiting for input...</p>
                            </div>
                         )}
                      </div>
                  </div>
              </div>
            )}
        </div>
      </div>

      {showPreviewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
                <div className="flex justify-between items-center p-4 border-b border-slate-200">
                    <h3 className="text-sm font-bold text-slate-800">Card Preview</h3>
                    <button onClick={() => setShowPreviewModal(false)} className="cursor-pointer p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-500">
                        <X size={20} />
                    </button>
                </div>
                <div className="p-6 bg-slate-50 flex-1 overflow-auto flex items-center justify-center">
                    {previewUrl ? (
                        <div className="relative w-full aspect-[1/1.4] shadow-xl rounded-xl overflow-hidden ring-1 ring-black/5">
                            <iframe src={`${previewUrl}#toolbar=0&navpanes=0`} className="w-full h-full border-none" />
                        </div>
                    ) : (
                        <div className="text-center text-slate-400 py-10">
                            <p>Fill in details to generate preview</p>
                        </div>
                    )}
                </div>
                <div className="p-4 border-t border-slate-200 flex gap-3">
                    <button onClick={() => setShowPreviewModal(false)} className="cursor-pointer flex-1 py-3 text-sm font-bold text-slate-600 hover:bg-slate-50 rounded-xl transition-colors">Close</button>
                    <button onClick={handleDownload} className="cursor-pointer flex-1 py-3 text-sm font-bold bg-indigo-600 text-white rounded-xl shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-colors">Download PDF</button>
                </div>
            </div>
        </div>
      )}

    </div>
  );
}