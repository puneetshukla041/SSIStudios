"use client";

import React, { useRef, useState, useEffect, useCallback } from "react";
import axios from "axios";
import {
  CloudArrowUpIcon,
  ArrowDownTrayIcon,
  CheckCircleIcon,
  TrashIcon,
  SparklesIcon,
  PhotoIcon,
  ArrowPathIcon,
  XMarkIcon,
  ClipboardDocumentCheckIcon,
  LinkIcon,
  FolderArrowDownIcon,
} from "@heroicons/react/24/outline";
import { motion, AnimatePresence } from "framer-motion";

const MAX_FILE_SIZE_BYTES = 8 * 1024 * 1024; // 8 MB
const ALLOWED_TYPES = ["image/png", "image/jpeg", "image/jpg", "image/webp"];

type Toast = { id: string; type: "info" | "success" | "error"; message: string };

export default function BgRemoverFullPage() {
  const fileInput = useRef<HTMLInputElement | null>(null);
  const currentController = useRef<AbortController | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [outputUrl, setOutputUrl] = useState<string | null>(null);
  // New state to store the raw blob for uploading
  const [resultBlob, setResultBlob] = useState<Blob | null>(null);
  
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [dragActive, setDragActive] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);
  
  // Asset saving state
  const [isSavingAsset, setIsSavingAsset] = useState(false);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [assetName, setAssetName] = useState("");

  const [downloadState, setDownloadState] = useState<
    "idle" | "downloading" | "downloaded" | "error"
  >("idle");

  // --- Toast Logic ---
  const pushToast = useCallback((type: Toast["type"], message: string) => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
    setToasts((t) => [...t, { id, type, message }]);
    setTimeout(() => {
      setToasts((t) => t.filter((x) => x.id !== id));
    }, 5000);
  }, []);

  // --- Cleanup ---
  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
      if (outputUrl) URL.revokeObjectURL(outputUrl);
    };
  }, [previewUrl, outputUrl]);

  // --- File Handling ---
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    handleNewFile(f);
  };

  const handleNewFile = (f: File | Blob) => {
    const fileToUse = f instanceof File ? f : new File([f], `pasted-image-${Date.now()}.${f.type.split('/')[1] || 'png'}`, { type: f.type });

    if (!ALLOWED_TYPES.includes(fileToUse.type)) {
      pushToast("error", "Unsupported file type. Use PNG/JPEG/WebP.");
      return;
    }

    if (fileToUse.size > MAX_FILE_SIZE_BYTES) {
      pushToast("error", `File too large. Max ${(MAX_FILE_SIZE_BYTES / 1024 / 1024).toFixed(0)} MB.`);
      return;
    }

    handleReset(); 

    setFile(fileToUse);
    setPreviewUrl(URL.createObjectURL(fileToUse));
    // Pre-fill asset name with original filename (minus extension)
    const nameWithoutExt = fileToUse.name.split('.').slice(0, -1).join('.') || "processed-image";
    setAssetName(`${nameWithoutExt}-bg-removed`);
    pushToast("info", `Loaded ${fileToUse.name}`);
  };

  // --- Drag & Drop ---
  const handleDrag = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragover") setDragActive(true);
    if (e.type === "dragleave") setDragActive(false);
  };
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    const f = e.dataTransfer.files?.[0];
    if (f) handleNewFile(f);
  };

  // --- Paste Support ---
  useEffect(() => {
    const pasteHandler = (e: ClipboardEvent) => {
      if (!e.clipboardData) return;
      const items = e.clipboardData.items;
      for (let i = 0; i < items.length; i++) {
        if (items[i].type.startsWith("image/")) {
          const blob = items[i].getAsFile();
          if (blob) {
            handleNewFile(blob);
            e.preventDefault();
            return;
          }
        }
      }
    };
    window.addEventListener("paste", pasteHandler);
    return () => window.removeEventListener("paste", pasteHandler);
  }, [pushToast]); 

  // --- API Call: Remove BG ---
  const handleRemoveBG = async () => {
    if (!file) return;

    setLoading(true);
    setUploadProgress(0);
    setOutputUrl(null);
    setResultBlob(null);
    setDownloadState("idle");

    const controller = new AbortController();
    currentController.current = controller;

    try {
      const form = new FormData();
      form.append("image", file);

      const res = await axios.post("/api/remove-bg", form, {
        responseType: "blob",
        signal: controller.signal,
        onUploadProgress: (ev) => {
          if (ev.total) {
            const percent = Math.round((ev.loaded / ev.total) * 100);
            setUploadProgress(percent);
          }
        },
      });

      const blob = res.data as Blob;
      const objUrl = URL.createObjectURL(blob);
      
      setResultBlob(blob); // Store raw blob for saving later
      setOutputUrl(objUrl);
      pushToast("success", "Magic complete!");
    } catch (err: any) {
      if (!axios.isCancel(err)) {
        console.error("Error:", err);
        pushToast("error", "Failed to process image.");
      }
    } finally {
      setLoading(false);
      setUploadProgress(0);
      currentController.current = null;
    }
  };

  const handleReset = () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    if (outputUrl) URL.revokeObjectURL(outputUrl);
    setPreviewUrl(null);
    setOutputUrl(null);
    setResultBlob(null);
    setFile(null);
    setLoading(false);
    setDownloadState("idle");
    if (fileInput.current) fileInput.current.value = "";
  };

  const handleDownload = () => {
    if (!outputUrl) return;
    setDownloadState("downloading");
    try {
      const a = document.createElement("a");
      a.href = outputUrl;
      const originalFileName = file?.name.split('.').slice(0, -1).join('.') || "image";
      a.download = `${originalFileName}-bg-removed.png`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      setDownloadState("downloaded");
      setTimeout(() => setDownloadState("idle"), 2000);
    } catch (err) {
      setDownloadState("error");
      pushToast("error", "Download failed.");
    }
  };

  const handleCopyLink = async () => {
    if (!outputUrl) return;
    try {
      await navigator.clipboard.writeText(outputUrl);
      pushToast("success", "Link copied!");
    } catch {
      pushToast("error", "Failed to copy.");
    }
  };

  // --- Save to Assets Logic ---
  const handleOpenSaveModal = () => {
    if (!resultBlob) return;
    setShowSaveModal(true);
  };

  const handleConfirmSave = async () => {
    if (!resultBlob || !assetName.trim()) return;
    
    setIsSavingAsset(true);
    
    try {
        const formData = new FormData();
        // Create a new file from the blob to send to backend
        const imageFile = new File([resultBlob], `${assetName}.png`, { type: "image/png" });
        
        formData.append("file", imageFile);
        formData.append("name", assetName);
        formData.append("type", "removed-bg");

        const response = await axios.post("/api/assets/save", formData);

        if (response.data.success) {
            pushToast("success", "Saved to Assets Library!");
            setShowSaveModal(false);
        } else {
            throw new Error(response.data.message || "Save failed");
        }
    } catch (error) {
        console.error("Save error:", error);
        pushToast("error", "Failed to save to cloud.");
    } finally {
        setIsSavingAsset(false);
    }
  };

  // --- CSS for Checkerboard Background ---
  const transparencyGridStyle = {
    backgroundImage: `
      linear-gradient(45deg, #f1f5f9 25%, transparent 25%),
      linear-gradient(-45deg, #f1f5f9 25%, transparent 25%),
      linear-gradient(45deg, transparent 75%, #f1f5f9 75%),
      linear-gradient(-45deg, transparent 75%, #f1f5f9 75%)
    `,
    backgroundSize: '20px 20px',
    backgroundPosition: '0 0, 0 10px, 10px -10px, -10px 0px'
  };

  return (
    <div className="min-h-screen w-full bg-[#FAFAFA] text-slate-900 font-sans selection:bg-indigo-100 selection:text-indigo-700 flex flex-col overflow-x-hidden p-4 sm:p-6 md:p-8">
      
      {/* Branding / Title Area */}
      <div className="max-w-7xl mx-auto w-full mb-6 sm:mb-8 flex items-center justify-between">
         <div className="flex items-center gap-3">
            <div className="relative w-10 h-10 sm:w-12 sm:h-12 transition-transform duration-300 hover:scale-105 cursor-pointer">
                <img 
                    src="/logos/ssilogo.png" 
                    alt="SSI Logo" 
                    className="w-full h-full object-contain drop-shadow-sm" 
                />
            </div>
            <div className="flex flex-col justify-center">
                <h1 className="text-lg sm:text-2xl font-black tracking-tight text-slate-900">
                    SSI Studios
                </h1>
                <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-indigo-500 leading-none">
                        Background Remover
                    </span>
                    <span className="px-1.5 py-0.5 rounded bg-indigo-50 text-indigo-600 text-[9px] font-bold border border-indigo-100">BETA</span>
                </div>
            </div>
         </div>
      </div>

      <main className="flex-1 w-full max-w-7xl mx-auto">
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 h-auto lg:min-h-[600px]">
          
          {/* --- LEFT COLUMN: INPUT & CONTROLS --- */}
          <div className="flex flex-col gap-6 h-full order-1">
            
            {/* Upload Card */}
            <div className="bg-white rounded-[1.5rem] sm:rounded-[2.5rem] shadow-2xl shadow-slate-200/50 border border-white overflow-hidden flex-1 flex flex-col relative transition-all duration-300 hover:shadow-slate-200/80 ring-1 ring-slate-100">
              
              {/* If File Exists: Show Preview */}
              {file && previewUrl ? (
                <div className="flex-1 relative group bg-slate-50 flex items-center justify-center p-4 sm:p-8 overflow-hidden min-h-[300px]">
                  <motion.img 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    src={previewUrl} 
                    alt="Original" 
                    className="max-w-full max-h-[300px] sm:max-h-[400px] object-contain shadow-xl rounded-2xl z-10" 
                  />
                  <div className="absolute top-4 left-4 sm:top-6 sm:left-6 bg-white/80 backdrop-blur-md border border-white/50 text-[10px] sm:text-xs font-extrabold px-3 py-1.5 sm:px-4 sm:py-2 rounded-full text-slate-600 shadow-sm z-20 pointer-events-none">
                    ORIGINAL
                  </div>
                  <button 
                    onClick={handleReset}
                    disabled={loading}
                    className="absolute top-4 right-4 sm:top-6 sm:right-6 p-2.5 sm:p-3 bg-white/90 hover:bg-rose-50 text-rose-500 rounded-full shadow-lg backdrop-blur-sm border border-white transition-all hover:scale-110 cursor-pointer z-20 disabled:opacity-0 group/trash"
                  >
                    <TrashIcon className="w-4 h-4 sm:w-5 sm:h-5 group-hover/trash:rotate-12 transition-transform" />
                  </button>
                </div>
              ) : (
                // If No File: Upload UI
                <div 
                  onDragOver={handleDrag}
                  onDragLeave={handleDrag}
                  onDrop={handleDrop}
                  onClick={() => fileInput.current?.click()}
                  className={`flex-1 flex flex-col items-center justify-center p-6 sm:p-12 transition-all duration-300 cursor-pointer border-4 border-dashed m-4 sm:m-6 rounded-[2rem] group min-h-[400px]
                    ${dragActive ? "border-indigo-500 bg-indigo-50/50 scale-[0.99]" : "border-slate-100 hover:border-indigo-300 hover:bg-slate-50/50"}
                  `}
                >
                  <div className="w-20 h-20 sm:w-28 sm:h-28 bg-indigo-50 rounded-full flex items-center justify-center mb-6 sm:mb-8 group-hover:scale-110 group-hover:bg-indigo-100 transition-all duration-300 shadow-sm">
                    <CloudArrowUpIcon className="w-10 h-10 sm:w-14 sm:h-14 text-indigo-500 group-hover:text-indigo-600 transition-colors" />
                  </div>
                  <h3 className="text-xl sm:text-3xl font-black text-slate-800 mb-3 sm:mb-4 text-center tracking-tight">Upload Image</h3>
                  <p className="text-sm sm:text-base text-slate-400 text-center max-w-xs mb-8 sm:mb-10 font-medium leading-relaxed">
                    Drag & drop or click to browse. <br/> Supports high-res PNG, JPG, WEBP
                  </p>
                  <button className="px-8 sm:px-10 py-3.5 sm:py-4 bg-slate-900 text-white rounded-2xl font-bold text-sm sm:text-base hover:bg-indigo-600 transition-all shadow-xl shadow-slate-200 hover:shadow-indigo-200 hover:-translate-y-1 active:translate-y-0 active:scale-95 cursor-pointer">
                    Choose from Device
                  </button>
                  <input ref={fileInput} type="file" hidden accept={ALLOWED_TYPES.join(",")} onChange={handleFileChange} />
                </div>
              )}

              {/* Action Bar */}
              {file && (
                <div className="p-6 sm:p-8 bg-white border-t border-slate-100 z-10 relative">
                  <div className="flex flex-col gap-4 sm:gap-6">
                    <div className="flex items-center justify-between text-sm font-medium text-slate-500 bg-slate-50 p-3 sm:p-4 rounded-2xl border border-slate-100">
                      <div className="flex items-center gap-3 overflow-hidden">
                        <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center border border-slate-200 shadow-sm flex-shrink-0">
                            <PhotoIcon className="w-5 h-5 text-indigo-400"/>
                        </div>
                        <div className="flex flex-col min-w-0">
                            <span className="truncate max-w-[120px] sm:max-w-[180px] font-bold text-slate-700 leading-tight">{file.name}</span>
                            <span className="text-[10px] text-slate-400 font-bold">READY TO PROCESS</span>
                        </div>
                      </div>
                      <span className="bg-white px-2.5 py-1 rounded-lg border border-slate-200 text-xs font-bold">{(file.size / 1024 / 1024).toFixed(2)} MB</span>
                    </div>

                    {loading && (
                      <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden relative">
                        <motion.div 
                          className="h-full bg-gradient-to-r from-indigo-500 to-violet-500"
                          initial={{ width: 0 }}
                          animate={{ width: `${uploadProgress === 100 ? 100 : uploadProgress}%` }}
                        />
                      </div>
                    )}

                    <button
                      onClick={handleRemoveBG}
                      disabled={loading || !!outputUrl}
                      className={`w-full py-4 sm:py-5 rounded-2xl font-black text-base sm:text-lg flex items-center justify-center gap-3 transition-all shadow-lg cursor-pointer relative overflow-hidden group
                        ${loading 
                          ? "bg-slate-100 text-slate-400 cursor-not-allowed shadow-none" 
                          : outputUrl
                            ? "bg-emerald-50 text-emerald-600 border-2 border-emerald-100 hover:bg-emerald-100"
                            : "bg-gradient-to-r from-indigo-600 to-violet-600 text-white hover:shadow-indigo-500/30 hover:scale-[1.01] active:scale-95"
                        }
                      `}
                    >
                      {loading ? (
                        <>
                          <ArrowPathIcon className="w-5 h-5 sm:w-6 sm:h-6 animate-spin" />
                          {uploadProgress < 100 ? "Uploading..." : "Processing..."}
                        </>
                      ) : outputUrl ? (
                        <>
                          <CheckCircleIcon className="w-5 h-5 sm:w-6 sm:h-6" />
                          Processing Complete
                        </>
                      ) : (
                        <>
                          <div className="absolute inset-0 bg-gradient-to-r from-violet-600 to-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                          <SparklesIcon className="w-5 h-5 sm:w-6 sm:h-6 text-indigo-200 relative z-10" />
                          <span className="relative z-10">Remove Background</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* --- RIGHT COLUMN: OUTPUT --- */}
          <div className="flex flex-col h-full order-2">
            <div className="bg-white rounded-[1.5rem] sm:rounded-[2.5rem] shadow-2xl shadow-slate-200/60 border border-white overflow-hidden flex-1 flex flex-col relative h-full min-h-[400px] lg:min-h-[500px] ring-1 ring-slate-100/50">
              
              <div className="absolute top-4 left-4 sm:top-6 sm:left-6 right-6 flex justify-between items-center z-20 pointer-events-none">
                 <div className="bg-white/80 backdrop-blur-md border border-white/50 text-[10px] sm:text-xs font-extrabold px-3 py-1.5 sm:px-4 sm:py-2 rounded-full text-slate-600 shadow-sm">
                    RESULT
                 </div>
              </div>

              <div className="flex-1 relative flex items-center justify-center bg-slate-50 p-4 sm:p-8 overflow-hidden">
                <div className="absolute inset-0 opacity-50 pointer-events-none" style={transparencyGridStyle}></div>

                {outputUrl ? (
                  <motion.img 
                    initial={{ opacity: 0, scale: 0.9, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    transition={{ type: "spring", bounce: 0.4 }}
                    src={outputUrl} 
                    alt="Result" 
                    className="relative z-10 max-w-full max-h-[350px] lg:max-h-[450px] object-contain drop-shadow-2xl hover:scale-105 transition-transform duration-500 cursor-pointer"
                  />
                ) : (
                  <div className="relative z-10 text-center opacity-100 flex flex-col items-center justify-center h-full px-4 py-12">
                    <div className="w-24 h-24 sm:w-32 sm:h-32 bg-white rounded-full flex items-center justify-center shadow-sm mb-4 sm:mb-6 border border-slate-100">
                        <PhotoIcon className="w-10 h-10 sm:w-12 sm:h-12 text-slate-300" />
                    </div>
                    <p className="text-lg sm:text-xl font-black text-slate-800 mb-2">No Result Yet</p>
                    <p className="text-sm sm:text-base text-slate-400 font-medium max-w-xs mx-auto">
                        Upload an image and click the magic button to see the transparency here.
                    </p>
                  </div>
                )}
              </div>

              {/* Output Actions */}
              <div className="p-6 sm:p-8 bg-white border-t border-slate-100 flex flex-col gap-4 z-20">
                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 w-full">
                    <button
                    onClick={handleDownload}
                    disabled={!outputUrl || downloadState !== "idle"}
                    className={`flex-1 px-6 py-3.5 sm:py-4 rounded-2xl font-bold text-base sm:text-lg flex items-center justify-center gap-3 transition-all shadow-lg cursor-pointer
                        ${!outputUrl 
                        ? "bg-slate-100 text-slate-400 cursor-not-allowed shadow-none" 
                        : "bg-slate-900 text-white hover:bg-indigo-600 hover:shadow-indigo-200 hover:-translate-y-1 active:scale-95"
                        }
                    `}
                    >
                    {downloadState === "downloading" ? (
                        <ArrowPathIcon className="w-5 h-5 sm:w-6 sm:h-6 animate-spin" />
                    ) : (
                        <ArrowDownTrayIcon className="w-5 h-5 sm:w-6 sm:h-6" />
                    )}
                    {downloadState === "downloaded" ? "Saved!" : "Download HD"}
                    </button>

                    {/* Save to Assets Button */}
                    <button
                        onClick={handleOpenSaveModal}
                        disabled={!outputUrl}
                        className={`px-6 py-3.5 sm:py-4 rounded-2xl font-bold text-sm sm:text-base flex items-center justify-center gap-2 transition-all border-2 cursor-pointer
                            ${!outputUrl 
                                ? "bg-slate-50 border-slate-100 text-slate-300 cursor-not-allowed" 
                                : isSavingAsset 
                                    ? "bg-indigo-50 border-indigo-100 text-indigo-400"
                                    : "bg-white border-slate-200 text-slate-700 hover:border-indigo-500 hover:text-indigo-600 hover:shadow-md"
                            }
                        `}
                    >
                        {isSavingAsset ? (
                            <ArrowPathIcon className="w-5 h-5 animate-spin" />
                        ) : (
                            <FolderArrowDownIcon className="w-5 h-5" />
                        )}
                        <span className="hidden sm:inline">Save to Assets</span>
                    </button>
                </div>

                <div className="flex gap-2 justify-center sm:justify-start">
                   <button 
                    onClick={handleCopyLink}
                    disabled={!outputUrl}
                    className="px-4 py-2 rounded-xl text-xs font-bold text-slate-400 hover:text-indigo-500 hover:bg-indigo-50 disabled:opacity-30 transition-colors flex items-center gap-2 cursor-pointer"
                   >
                     <LinkIcon className="w-4 h-4" /> Copy Link
                   </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Save to Assets Modal */}
      <AnimatePresence>
        {showSaveModal && (
            <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4"
            >
                <motion.div 
                    initial={{ scale: 0.95, y: 20 }}
                    animate={{ scale: 1, y: 0 }}
                    exit={{ scale: 0.95, y: 20 }}
                    className="bg-white w-full max-w-md rounded-3xl shadow-2xl p-6 sm:p-8 relative"
                >
                    <button 
                        onClick={() => setShowSaveModal(false)}
                        className="absolute top-4 right-4 p-2 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-600 transition-colors"
                    >
                        <XMarkIcon className="w-6 h-6" />
                    </button>

                    <h3 className="text-2xl font-black text-slate-800 mb-2">Save to Assets</h3>
                    <p className="text-slate-500 mb-6 text-sm">Name your processed image to save it to your cloud library.</p>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-xs font-bold uppercase text-slate-400 mb-1 ml-1">Asset Name</label>
                            <input 
                                type="text" 
                                value={assetName}
                                onChange={(e) => setAssetName(e.target.value)}
                                className="w-full bg-slate-50 border-2 border-slate-200 rounded-xl px-4 py-3 font-bold text-slate-700 focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all"
                                placeholder="my-awesome-image"
                            />
                        </div>

                        <div className="flex gap-3 pt-2">
                            <button 
                                onClick={() => setShowSaveModal(false)}
                                className="flex-1 py-3.5 rounded-xl font-bold text-slate-500 hover:bg-slate-100 transition-colors"
                            >
                                Cancel
                            </button>
                            <button 
                                onClick={handleConfirmSave}
                                disabled={isSavingAsset || !assetName.trim()}
                                className="flex-1 py-3.5 rounded-xl font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
                            >
                                {isSavingAsset ? <ArrowPathIcon className="w-5 h-5 animate-spin" /> : "Save Asset"}
                            </button>
                        </div>
                    </div>
                </motion.div>
            </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Toast Notifications */}
      <div className="fixed bottom-6 sm:bottom-auto sm:top-10 left-4 right-4 sm:left-auto sm:right-6 z-[70] flex flex-col gap-3 sm:gap-4 pointer-events-none items-center sm:items-end">
        <AnimatePresence>
          {toasts.map((t) => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, y: 20, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.9 }}
              className={`pointer-events-auto flex items-center gap-3 sm:gap-4 pl-4 pr-6 py-3 sm:py-4 rounded-2xl shadow-2xl border backdrop-blur-xl w-full max-w-sm sm:min-w-[320px] cursor-pointer
                ${t.type === 'success' ? 'bg-white/95 border-emerald-100 text-slate-800' : ''}
                ${t.type === 'error' ? 'bg-white/95 border-rose-100 text-rose-600' : ''}
                ${t.type === 'info' ? 'bg-white/95 border-indigo-100 text-slate-600' : ''}
              `}
            >
              <div className={`p-2 rounded-full ${
                  t.type === 'success' ? 'bg-emerald-100 text-emerald-600' : 
                  t.type === 'error' ? 'bg-rose-100 text-rose-600' : 
                  'bg-indigo-100 text-indigo-600'
              }`}>
                  {t.type === 'success' && <CheckCircleIcon className="w-5 h-5" />}
                  {t.type === 'error' && <XMarkIcon className="w-5 h-5" />}
                  {t.type === 'info' && <ClipboardDocumentCheckIcon className="w-5 h-5" />}
              </div>
              <div className="flex flex-col">
                  <span className="text-[10px] sm:text-xs font-bold uppercase opacity-50 tracking-wider">{t.type}</span>
                  <span className="font-bold text-xs sm:text-sm">{t.message}</span>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

    </div>
  );
}