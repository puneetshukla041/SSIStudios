"use client";
import React, { useEffect, useState, useRef } from "react";
import {
  Upload,
  XCircle,
  CloudUpload,
  Download,
  Trash2,
  Edit,
  Plus,
  Save,
  Search,
  Eye,
  ArrowLeft,
  ChevronRight,
  User,
  CreditCard,
  Droplet,
  Briefcase
} from "lucide-react";
import { generateIdCardPDF, IIdCardData } from "@/components/Certificates/utils/idCardGenerator";

// --- Premium UI Components ---

const InputComponent = ({ label, value, onChange, placeholder, type = "text", icon: Icon }: any) => (
  <div className="group relative">
    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors duration-300">
      {Icon && <Icon size={18} />}
    </div>
    <input
      type={type}
      value={value}
      onChange={onChange}
      placeholder=" " // Important for peer-placeholder-shown
      className={`peer w-full bg-white border border-slate-200 rounded-xl py-3.5 ${Icon ? 'pl-10' : 'pl-4'} pr-4 text-sm text-slate-800 font-medium outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all duration-200 shadow-sm hover:border-slate-300`}
    />
    <label className={`absolute left-3 ${Icon ? 'pl-7' : 'pl-1'} -top-2.5 bg-white px-1 text-[10px] font-bold uppercase tracking-wider text-slate-400 transition-all peer-placeholder-shown:top-3.5 peer-placeholder-shown:text-sm peer-placeholder-shown:font-normal peer-placeholder-shown:text-slate-400 peer-focus:-top-2.5 peer-focus:text-[10px] peer-focus:font-bold peer-focus:text-indigo-600`}>
      {label}
    </label>
  </div>
);

const SelectComponent = ({ label, value, onChange, options, icon: Icon }: any) => (
  <div className="group relative">
    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors duration-300">
      {Icon && <Icon size={18} />}
    </div>
    <select
      value={value}
      onChange={onChange}
      className={`peer w-full bg-white border border-slate-200 rounded-xl py-3.5 ${Icon ? 'pl-10' : 'pl-4'} pr-10 text-sm text-slate-800 font-medium outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all duration-200 shadow-sm hover:border-slate-300 appearance-none cursor-pointer`}
    >
      <option value="" disabled hidden></option>
      {options.map((opt: string) => (
        <option key={opt} value={opt}>{opt}</option>
      ))}
    </select>
    <label className={`absolute left-3 ${Icon ? 'pl-7' : 'pl-1'} -top-2.5 bg-white px-1 text-[10px] font-bold uppercase tracking-wider text-slate-400 transition-all peer-placeholder-shown:top-3.5 peer-placeholder-shown:text-sm peer-placeholder-shown:font-normal peer-placeholder-shown:text-slate-400 peer-focus:-top-2.5 peer-focus:text-[10px] peer-focus:font-bold peer-focus:text-indigo-600`}>
      {label}
    </label>
    <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-slate-400">
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
    </div>
  </div>
);

// --- Main Page Component ---

export default function IdCardsPage() {
  const [viewMode, setViewMode] = useState<'table' | 'editor'>('table');
  const [cards, setCards] = useState<IIdCardData[]>([]);
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null);
  
  // Form State
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

  // 1. Fetch Cards on Load
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
    } finally {
      setLoading(false);
    }
  };

  // 2. Generate Preview Effect (Only in Editor Mode)
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

  // 3. Handlers
  const handleEdit = (card: IIdCardData) => {
    setSelectedCardId(card._id || null);
    setFormData(card);
    setViewMode('editor');
  };

  const handleCreateNew = () => {
    setSelectedCardId(null);
    setFormData(initialFormState);
    if(fileInputRef.current) fileInputRef.current.value = "";
    setViewMode('editor');
  };

  const handleBackToTable = () => {
    fetchCards(); // Refresh data
    setViewMode('table');
  };

  const handleSave = async () => {
    if (!formData.fullName || !formData.idCardNo) {
      setFeedback({ msg: "Name and ID No are required", type: "error" });
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
      setFeedback({ msg: "Saved Successfully", type: "success" });
      
      if (selectedCardId) {
        setCards(prev => prev.map(c => c._id === savedCard._id ? savedCard : c));
      } else {
        setCards(prev => [savedCard, ...prev]);
        setSelectedCardId(savedCard._id);
        setFormData(savedCard);
      }

    } catch (err) {
      setFeedback({ msg: "Error Saving", type: "error" });
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

  // Image Dragging Logic
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
    // Constrain drag limits for the specific ID card template
    const constrainedX = Math.max(-15, Math.min(15, newX));
    const constrainedY = Math.max(-20, Math.min(20, newY));

    setFormData(prev => ({ ...prev, imageXOffset: constrainedX, imageYOffset: constrainedY }));
  };

  const onDragEnd = () => setIsDragging(false);

  // Filtering
  const filteredCards = cards.filter(c => 
    c.fullName.toLowerCase().includes(searchTerm.toLowerCase()) || 
    c.idCardNo.includes(searchTerm)
  );

  return (
    <div className="h-screen w-full bg-slate-50/50 text-slate-800 font-sans flex flex-col overflow-hidden selection:bg-indigo-100 selection:text-indigo-700"
         onMouseMove={onDrag} onMouseUp={onDragEnd} onMouseLeave={onDragEnd}>
      
      {/* --- Global Styles for Scrollbar & Clip --- */}
      <style>{`
        .clip-image { clip-path: polygon(0% 0%, 100% 0%, 100% 85%, 0% 100%); touch-action: none; }
        /* Sleek Scrollbar */
        ::-webkit-scrollbar { width: 6px; height: 6px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 3px; }
        ::-webkit-scrollbar-thumb:hover { background: #94a3b8; }
      `}</style>

      {/* --- Navbar (Sticky & Glassmorphic) --- */}
      <div className="flex-shrink-0 h-16 bg-white/80 backdrop-blur-md border-b border-slate-200/60 z-20 sticky top-0">
         <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center justify-between">
            <div className="flex items-center gap-4">
                {viewMode === 'editor' ? (
                  <button onClick={handleBackToTable} className="p-2 -ml-2 rounded-full hover:bg-slate-100 text-slate-500 transition-colors group">
                    <ArrowLeft size={20} className="group-hover:-translate-x-0.5 transition-transform" />
                  </button>
                ) : (
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-600 to-violet-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/20">
                      <CreditCard size={20} />
                  </div>
                )}
                
                <div className="flex flex-col justify-center">
                  <h1 className="text-lg font-bold text-slate-800 leading-tight">
                      {viewMode === 'editor' ? (selectedCardId ? 'Edit ID Card' : 'Create New Card') : 'ID Card Database'}
                  </h1>
                  <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                      SSI Studios Admin
                  </p>
                </div>
            </div>

            <div className="flex items-center gap-3">
                {viewMode === 'table' && (
                  <div className="relative group hidden md:block">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" size={16} />
                    <input 
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      placeholder="Search employees..." 
                      className="w-64 bg-slate-100/50 hover:bg-white focus:bg-white border border-transparent focus:border-indigo-200 rounded-xl pl-10 pr-4 py-2 text-sm outline-none transition-all shadow-sm"
                    />
                  </div>
                )}
                
                {viewMode === 'table' && (
                  <button 
                    onClick={handleCreateNew}
                    className="bg-slate-900 hover:bg-indigo-600 text-white px-5 py-2 rounded-xl text-sm font-medium flex items-center gap-2 transition-all shadow-lg shadow-slate-900/10 active:scale-95"
                  >
                    <Plus size={18} /> <span className="hidden sm:inline">New Card</span>
                  </button>
                )}

                {viewMode === 'editor' && (
                  <div className="flex items-center gap-3">
                      {feedback && (
                        <div className={`hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold animate-in fade-in slide-in-from-top-2 ${feedback.type === 'success' ? 'bg-green-50 text-green-700 border border-green-100' : 'bg-red-50 text-red-700 border border-red-100'}`}>
                          <div className={`w-1.5 h-1.5 rounded-full ${feedback.type === 'success' ? 'bg-green-500' : 'bg-red-500'}`}></div>
                          {feedback.msg}
                        </div>
                      )}
                      <div className="h-6 w-px bg-slate-200 mx-1 hidden sm:block"></div>
                      <button onClick={handleSave} disabled={isSaving} className="text-slate-600 hover:text-indigo-600 font-semibold text-sm px-4 py-2 rounded-xl hover:bg-indigo-50 transition-colors disabled:opacity-50">
                        {isSaving ? 'Saving...' : 'Save Changes'}
                      </button>
                      <button onClick={handleDownload} className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2 rounded-xl text-sm font-medium shadow-lg shadow-indigo-500/20 transition-all active:scale-95 flex items-center gap-2">
                        <Download size={18} /> <span className="hidden sm:inline">Export PDF</span>
                      </button>
                  </div>
                )}
            </div>
         </div>
      </div>

      {/* --- Workspace Content (Centered & Padded) --- */}
      <div className="flex-1 overflow-hidden relative">
        <div className="h-full w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
            
            {viewMode === 'table' ? (
              /* ================= TABLE VIEW ================= */
              <div className="h-full bg-white rounded-2xl border border-slate-200 shadow-xl shadow-slate-200/40 overflow-hidden flex flex-col animate-in fade-in duration-500">
                 {/* Header Row */}
                 <div className="grid grid-cols-12 gap-4 px-6 py-4 border-b border-slate-100 bg-slate-50/80 text-[11px] font-bold text-slate-400 uppercase tracking-wider sticky top-0 z-10 backdrop-blur-md">
                      <div className="col-span-5 pl-2">Employee Profile</div>
                      <div className="col-span-3">Designation</div>
                      <div className="col-span-2">ID Number</div>
                      <div className="col-span-2 text-right pr-2">Actions</div>
                 </div>

                 {/* Data Rows */}
                 <div className="flex-1 overflow-y-auto divide-y divide-slate-50">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center h-full text-slate-400 pb-20">
                           <div className="animate-spin rounded-full h-8 w-8 border-2 border-slate-200 border-b-indigo-600 mb-4"></div>
                           <span className="text-sm font-medium">Loading records...</span>
                        </div>
                    ) : filteredCards.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-slate-400 gap-4 pb-20">
                           <div className="w-20 h-20 rounded-3xl bg-slate-50 flex items-center justify-center border border-slate-100">
                              <Search size={32} className="opacity-20 text-slate-500" />
                           </div>
                           <p className="text-sm font-medium">No records found.</p>
                        </div>
                    ) : (
                      filteredCards.map((card) => (
                        <div key={card._id} className="grid grid-cols-12 gap-4 px-6 py-4 hover:bg-indigo-50/30 transition-colors items-center group cursor-default">
                            {/* Profile */}
                            <div className="col-span-5 flex items-center gap-4 pl-2">
                              <div className="relative w-11 h-11 rounded-xl bg-slate-100 border border-slate-200 overflow-hidden shadow-sm group-hover:shadow-md group-hover:border-indigo-100 transition-all">
                                  {card.userImage ? (
                                    <img src={card.userImage} className="w-full h-full object-cover" />
                                  ) : (
                                    <div className="w-full h-full flex items-center justify-center text-slate-300 bg-slate-50">
                                      <User size={20} />
                                    </div>
                                  )}
                              </div>
                              <div className="min-w-0">
                                  <h3 className="text-sm font-semibold text-slate-800 truncate group-hover:text-indigo-700 transition-colors">{card.fullName}</h3>
                                  <p className="text-xs text-slate-400 truncate font-medium">{card.bloodGroup ? `Blood Group: ${card.bloodGroup}` : "No Blood Group"}</p>
                              </div>
                            </div>

                            {/* Role */}
                            <div className="col-span-3">
                               <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-100 text-xs font-medium text-slate-600 group-hover:bg-white group-hover:border-indigo-100 transition-colors">
                                  <Briefcase size={14} className="text-slate-400" />
                                  <span className="truncate max-w-[120px]">{card.designation}</span>
                               </div>
                            </div>

                            {/* ID */}
                            <div className="col-span-2">
                                <span className="font-mono text-xs font-bold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-md border border-indigo-100/50">
                                  #{card.idCardNo}
                                </span>
                            </div>

                            {/* Actions */}
                            <div className="col-span-2 flex justify-end gap-2 pr-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                               <button onClick={() => handleEdit(card)} className="p-2 rounded-lg hover:bg-white hover:shadow-md border border-transparent hover:border-slate-100 text-slate-400 hover:text-indigo-600 transition-all transform hover:scale-105">
                                  <Eye size={18} />
                               </button>
                               <button onClick={(e) => handleDelete(e, card._id!)} className="p-2 rounded-lg hover:bg-white hover:shadow-md border border-transparent hover:border-slate-100 text-slate-400 hover:text-red-600 transition-all transform hover:scale-105">
                                  <Trash2 size={18} />
                               </button>
                            </div>
                        </div>
                      ))
                    )}
                 </div>
              </div>
            ) : (
              /* ================= EDITOR VIEW ================= */
              <div className="h-full bg-white rounded-2xl border border-slate-200 shadow-xl shadow-slate-200/40 flex overflow-hidden animate-in zoom-in-95 duration-300">
                 
                 {/* Sidebar (Quick Switch) - Responsive Hide */}
                 <div className="w-72 border-r border-slate-200 bg-slate-50/30 flex-col z-10 hidden lg:flex">
                    <div className="p-5 bg-white border-b border-slate-100 flex items-center justify-between">
                       <h3 className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Recent Employees</h3>
                       <div className="text-[10px] bg-slate-100 px-2 py-0.5 rounded-full text-slate-500 font-bold">{filteredCards.length}</div>
                    </div>
                    <div className="flex-1 overflow-y-auto p-3 space-y-1.5">
                       {filteredCards.map(card => (
                          <button 
                            key={card._id}
                            onClick={() => handleEdit(card)}
                            className={`w-full text-left p-2.5 rounded-xl flex items-center gap-3 transition-all group ${selectedCardId === card._id ? 'bg-white border border-indigo-200 shadow-md shadow-indigo-100 relative z-10' : 'hover:bg-white hover:shadow-sm border border-transparent'}`}
                          >
                             <div className={`w-9 h-9 rounded-lg flex items-center justify-center text-xs font-bold transition-colors ${selectedCardId === card._id ? 'bg-indigo-600 text-white' : 'bg-slate-200 text-slate-500 group-hover:bg-slate-100'}`}>
                                {card.fullName.charAt(0)}
                             </div>
                             <div className="min-w-0">
                                <p className={`text-xs font-semibold truncate transition-colors ${selectedCardId === card._id ? 'text-indigo-900' : 'text-slate-700'}`}>{card.fullName}</p>
                                <p className="text-[10px] text-slate-400 truncate font-medium">{card.designation}</p>
                             </div>
                             {selectedCardId === card._id && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-indigo-500"></div>}
                          </button>
                       ))}
                    </div>
                 </div>

                 {/* Form Area */}
                 <div className="flex-1 bg-white overflow-y-auto relative">
                    <div className="max-w-3xl mx-auto p-8 lg:p-12 pb-32">
                        <div className="mb-10">
                           <h2 className="text-2xl font-bold text-slate-800">Employee Details</h2>
                           <p className="text-sm text-slate-500 mt-1">Ensure the information matches the official records.</p>
                        </div>

                        <div className="space-y-8">
                           {/* Image Section */}
                           <div className="bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200 p-8 flex flex-col sm:flex-row items-center gap-8 group hover:border-indigo-300 hover:bg-indigo-50/30 transition-all">
                              <div className="relative flex-shrink-0">
                                 <div className="w-32 aspect-[3/4] bg-white rounded-xl shadow-lg ring-4 ring-white overflow-hidden relative cursor-grab active:cursor-grabbing transition-transform hover:scale-[1.02]" onMouseDown={onDragStart}>
                                    {formData.userImage ? (
                                       <>
                                         <img 
                                           src={formData.userImage} 
                                           className="w-full h-full object-contain pointer-events-none clip-image bg-slate-100"
                                           style={{ transform: `translate(${formData.imageXOffset}px, ${formData.imageYOffset}px)` }} 
                                         />
                                         <button 
                                           onClick={(e) => { e.stopPropagation(); setFormData(prev => ({ ...prev, userImage: null })); }}
                                           className="absolute top-1 right-1 bg-slate-900/60 backdrop-blur text-white p-1.5 rounded-full hover:bg-red-500 transition-all opacity-0 group-hover:opacity-100"
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
                                 {formData.userImage && <div className="absolute -bottom-7 left-0 w-full text-center text-[10px] font-bold text-indigo-500 uppercase tracking-wide animate-pulse">Adjust Photo</div>}
                              </div>

                              <div className="flex-1 text-center sm:text-left">
                                 <h4 className="text-sm font-bold text-slate-800 mb-1">Profile Photo</h4>
                                 <p className="text-xs text-slate-500 mb-5 leading-relaxed max-w-xs mx-auto sm:mx-0">
                                    Upload a high-quality professional headshot with a plain background. <br/> Supports PNG & JPG formats.
                                 </p>
                                 <div className="flex gap-3 justify-center sm:justify-start">
                                    <button onClick={() => fileInputRef.current?.click()} className="px-5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-700 hover:border-indigo-300 hover:text-indigo-600 transition-all shadow-sm hover:shadow flex items-center gap-2">
                                       <Upload size={16} /> Upload Photo
                                    </button>
                                    <input ref={fileInputRef} type="file" hidden accept="image/*" onChange={handleImageChange} />
                                 </div>
                              </div>
                           </div>

                           {/* Inputs Grid */}
                           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                              <div className="md:col-span-2">
                                 <InputComponent label="Full Legal Name" value={formData.fullName} onChange={(e: any) => setFormData({...formData, fullName: e.target.value})} placeholder="e.g. Jonathan Davis" icon={User} />
                              </div>
                              <InputComponent label="Job Designation" value={formData.designation} onChange={(e: any) => setFormData({...formData, designation: e.target.value})} placeholder="e.g. Senior Engineer" icon={Briefcase} />
                              <InputComponent label="ID Number" value={formData.idCardNo} onChange={(e: any) => setFormData({...formData, idCardNo: e.target.value})} placeholder="e.g. 8492" icon={CreditCard} />
                              <SelectComponent label="Blood Group" value={formData.bloodGroup} options={["A-", "A+", "AB-", "AB+", "B-", "B+", "O-", "O+"]} onChange={(e: any) => setFormData({...formData, bloodGroup: e.target.value})} icon={Droplet} />
                           </div>
                        </div>
                    </div>
                 </div>

                 {/* Preview Area - Responsive Hide */}
                 <div className="w-[420px] bg-slate-50/50 border-l border-slate-200 p-8 flex-col hidden xl:flex items-center justify-center relative">
                    {/* Background Decor */}
                    <div className="absolute inset-0 overflow-hidden pointer-events-none">
                       <div className="absolute w-96 h-96 bg-indigo-300/10 rounded-full blur-3xl -top-20 -right-20"></div>
                       <div className="absolute w-80 h-80 bg-blue-300/10 rounded-full blur-3xl bottom-0 left-0"></div>
                    </div>

                    <div className="w-full flex items-center justify-between mb-8 z-10">
                       <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Live Preview</h3>
                       <span className="flex h-2 w-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]"></span>
                    </div>
                    
                    <div className="flex-1 flex items-center justify-center w-full z-10">
                       {previewUrl ? (
                          <div className="relative w-full aspect-[1/1.4] bg-white rounded-2xl shadow-2xl shadow-slate-300/50 ring-1 ring-slate-900/5 overflow-hidden transform transition-transform hover:scale-[1.02] duration-500 group">
                             <iframe src={`${previewUrl}#toolbar=0&navpanes=0`} className="w-full h-full border-none" />
                             <div className="absolute inset-0 pointer-events-none ring-1 ring-inset ring-black/5 rounded-2xl"></div>
                          </div>
                       ) : (
                          <div className="w-full aspect-[1/1.4] bg-white rounded-2xl shadow-sm border border-slate-200 flex flex-col items-center justify-center text-slate-300 gap-4">
                             <div className="animate-pulse bg-slate-100 w-24 h-24 rounded-full flex items-center justify-center">
                                <CreditCard size={32} className="opacity-50" />
                             </div>
                             <p className="text-xs font-medium">Generating preview...</p>
                          </div>
                       )}
                    </div>
                    
                    <div className="mt-8 w-full p-4 bg-white/80 backdrop-blur rounded-xl border border-slate-200 shadow-sm z-10">
                       <div className="flex justify-between items-center text-[10px] text-slate-500 mb-2 uppercase font-bold tracking-wide">
                          <span>Render Status</span>
                          <span className="text-green-600">Ready to Print</span>
                       </div>
                       <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                          <div className="bg-gradient-to-r from-indigo-500 to-blue-500 w-full h-full rounded-full"></div>
                       </div>
                    </div>
                 </div>

              </div>
            )}

        </div>
      </div>
    </div>
  );
}