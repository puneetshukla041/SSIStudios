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
  PauseCircleIcon,
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
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [processingProgress, setProcessingProgress] = useState<number | null>(
    null
  );
  const [dragActive, setDragActive] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [fitMode, setFitMode] = useState<"contain" | "cover">("contain");
  const [optimiseForWeb, setOptimiseForWeb] = useState(true);

  // Simplified downloadState: only tracking local download status
  const [downloadState, setDownloadState] = useState<
    "idle" | "downloading" | "downloaded" | "error"
  >("idle");

  // helper: show toast
  const pushToast = useCallback((type: Toast["type"], message: string) => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
    setToasts((t) => [...t, { id, type, message }]);
    // auto-dismiss
    setTimeout(() => {
      setToasts((t) => t.filter((x) => x.id !== id));
    }, 6000);
  }, []);

  // Clean up created object URLs to avoid memory leaks
  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
      if (outputUrl) URL.revokeObjectURL(outputUrl);
    };
  }, [previewUrl, outputUrl]);

  // Handle file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    handleNewFile(f);
  };

  // Validate & set file
  const handleNewFile = (f: File | Blob) => {
    // If it's a Blob from paste, we need to treat it as a File for type checking/naming
    const fileToUse = f instanceof File ? f : new File([f], `pasted-image-${Date.now()}.${f.type.split('/')[1] || 'png'}`, { type: f.type });

    if (!ALLOWED_TYPES.includes(fileToUse.type)) {
      pushToast("error", "Unsupported file type. Use PNG/JPEG/WebP.");
      return;
    }

    if (fileToUse.size > MAX_FILE_SIZE_BYTES) {
      pushToast(
        "error",
        `File too large. Max ${(MAX_FILE_SIZE_BYTES / 1024 / 1024).toFixed(
          0
        )} MB.`
      );
      return;
    }

    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
    if (outputUrl) {
      URL.revokeObjectURL(outputUrl);
      setOutputUrl(null);
    }

    setFile(fileToUse);
    setPreviewUrl(URL.createObjectURL(fileToUse));
    setUploadProgress(0);
    setProcessingProgress(null);
    pushToast("info", `Loaded ${fileToUse.name} — ${Math.round(fileToUse.size / 1024)} KB`);
  };

  // Drag handlers
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

  // Paste support (paste image from clipboard)
  useEffect(() => {
    const pasteHandler = (e: ClipboardEvent) => {
      if (!e.clipboardData) return;
      const items = e.clipboardData.items;
      if (!items) return;
      for (let i = 0; i < items.length; i++) {
        const it = items[i];
        if (it.type.startsWith("image/")) {
          const blob = it.getAsFile();
          if (blob) {
            handleNewFile(blob);
            e.preventDefault();
            return;
          }
        }
      }
    };
    window.addEventListener("paste", pasteHandler);
    // Include all state dependencies for handleNewFile via useCallback or pass them as an object/array to the dependency array.
    // For simplicity and correctness with a complex function like handleNewFile, it's safer to include all dependencies.
    // However, since handleNewFile uses pushToast (which is memoized with useCallback) and its own internal state setters, 
    // we only need to include the stable dependencies here.
    return () => window.removeEventListener("paste", pasteHandler);
  }, [previewUrl, outputUrl, pushToast]); // Depend on related state and stable functions

  // Cancel upload/processing
  const cancelProcessing = () => {
    if (currentController.current) {
      currentController.current.abort();
      currentController.current = null;
      setLoading(false);
      setUploadProgress(0);
      setProcessingProgress(null);
      pushToast("info", "Cancelled");
    }
  };

  // Submit to backend
  const handleRemoveBG = async () => {
    if (!file) {
      pushToast("error", "No file selected.");
      return;
    }

    setLoading(true);
    setUploadProgress(0);
    setProcessingProgress(null);
    setOutputUrl(null);
    setDownloadState("idle");

    const controller = new AbortController();
    currentController.current = controller;

    try {
      const form = new FormData();
      form.append("image", file);
      form.append("optimize", optimiseForWeb ? "1" : "0");

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
      // Revoke old output URL if any before creating a new one
      if (outputUrl) URL.revokeObjectURL(outputUrl);
      const objUrl = URL.createObjectURL(blob);
      setOutputUrl(objUrl);
      pushToast("success", "Background removed successfully!");
    } catch (err: any) {
      if (axios.isCancel(err) || err?.name === "CanceledError") {
        pushToast("info", "Request cancelled.");
      } else {
        console.error("remove-bg error:", err);
        pushToast("error", "Failed to remove background. Try again later.");
      }
    } finally {
      setLoading(false);
      setUploadProgress(0);
      currentController.current = null;
    }
  };

  // Reset everything
  const handleReset = () => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
    if (outputUrl) {
      URL.revokeObjectURL(outputUrl);
      setOutputUrl(null);
    }
    setFile(null);
    setUploadProgress(0);
    setProcessingProgress(null);
    setLoading(false);
    setDownloadState("idle");
    if (fileInput.current) fileInput.current.value = "";
  };

  // Simplified single-step local download logic
  const handleDownload = () => {
    if (!outputUrl) {
      pushToast("error", "No result to download.");
      return;
    }
    setDownloadState("downloading");

    try {
      // Step: Download locally
      const a = document.createElement("a");
      a.href = outputUrl;
      // Use original file name as base if available, otherwise default
      const originalFileName = file?.name.split('.').slice(0, -1).join('.') || "image";
      a.download = `${originalFileName}-bg-removed.png`; 
      document.body.appendChild(a);
      a.click();
      a.remove();
      
      setDownloadState("downloaded");
      pushToast("success", "File downloaded successfully!");
    } catch (err: any) {
      console.error("Download error:", err);
      setDownloadState("error");
      pushToast("error", "An error occurred during local download.");
    } finally {
      // Reset state after a short delay for visual feedback
      setTimeout(() => setDownloadState("idle"), 2000); 
    }
  };

  // Copy output link (still copies the Blob URL)
  const handleCopyLink = async () => {
    if (!outputUrl) return pushToast("error", "No result to copy.");
    try {
      // NOTE: Copying a Blob URL to the clipboard is possible but usually not useful outside the current session.
      // Keeping for functionality parity.
      await navigator.clipboard.writeText(outputUrl);
      pushToast("success", "Result URL copied to clipboard.");
    } catch {
      pushToast("error", "Failed to copy to clipboard.");
    }
  };

  return (
    <div
      className="min-h-screen w-full flex flex-col items-center justify-start p-4 md:p-6 lg:p-10 
                   bg-transparent text-white"
    >
      <div className="w-full max-w-6xl">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left: uploader + controls */}
          <div className="lg:col-span-7">
            {/* Uploader Box */}
            <div
              onDragOver={handleDrag}
              onDragLeave={handleDrag}
              onDrop={handleDrop}
              onClick={() => fileInput.current?.click()}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter") fileInput.current?.click();
              }}
              className={`relative h-80 rounded-2xl border-2 border-dashed transition-all duration-200 flex items-center justify-center p-4 md:p-6 cursor-pointer
                ${
                  dragActive
                    ? "border-cyan-400 bg-slate-800/60"
                    : "border-slate-700 bg-slate-900/40"
                }`}
            >
              <input
                ref={fileInput}
                type="file"
                accept={ALLOWED_TYPES.join(",")}
                onChange={handleFileChange}
                className="hidden"
              />

              {/* If no file: show upload prompt */}
              {!previewUrl ? (
                <div className="flex flex-col items-center gap-3 text-slate-300 select-none px-4 text-center">
                  <div className="p-3 rounded-full bg-gradient-to-br from-cyan-600/20 to-blue-600/20 border border-slate-700">
                    <CloudArrowUpIcon className="h-10 w-10 md:h-12 md:w-12 text-cyan-400" />
                  </div>
                  <div className="text-base md:text-lg font-semibold">
                    Drag & drop, paste, or click to upload
                  </div>
                  <div className="text-sm text-slate-400">
                    PNG / JPG / WEBP — up to{" "}
                    {(MAX_FILE_SIZE_BYTES / 1024 / 1024).toFixed(0)} MB
                  </div>
                  <div className="mt-3 flex flex-col sm:flex-row gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        fileInput.current?.click();
                      }}
                      className="px-4 py-2 bg-cyan-600 text-black rounded-md font-medium hover:scale-[1.02] transition w-full sm:w-auto"
                    >
                      Select File
                    </button>
                  </div>
                </div>
              ) : (
                <div className="w-full h-full flex items-center justify-center p-2">
                  <div className="relative w-full h-full rounded-lg overflow-hidden bg-black/40 border border-slate-700 p-2 md:p-3">
                    <img
                      src={previewUrl}
                      alt="preview"
                      className={`max-h-full max-w-full object-${fitMode} mx-auto`}
                      style={{ transform: "translateZ(0)" }}
                    />
                    {/* file info */}
                    <div className="absolute left-2 top-2 bg-slate-900/60 px-2 py-1 rounded-md text-xs">
                      <div className="font-medium truncate max-w-[100px] sm:max-w-none">
                        {file?.name}
                      </div>
                      <div className="text-slate-400">
                        {Math.round((file?.size || 0) / 1024)} KB
                      </div>
                    </div>

                    {/* small action buttons on preview */}
                    <div className="absolute right-2 top-2 flex flex-col gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setFitMode((m) =>
                            m === "contain" ? "cover" : "contain"
                          );
                        }}
                        title="Toggle fit"
                        className="bg-slate-800/70 p-1 md:p-2 rounded-md hover:bg-slate-700"
                      >
                        <PhotoIcon className="h-4 w-4 md:h-5 md:w-5 text-slate-200" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleReset();
                        }}
                        title="Reset"
                        className="bg-red-700/80 p-1 md:p-2 rounded-md hover:bg-red-600"
                      >
                        <TrashIcon className="h-4 w-4 md:h-5 md:w-5 text-white" />
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Controls */}
            <div className="mt-4 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              {/* Reset/Add buttons - Full width on small screens */}
              <div className="flex-1 flex gap-3">
                <button
                  onClick={() => fileInput.current?.click()}
                  className="flex-1 px-4 py-3 rounded-xl bg-gradient-to-r from-slate-700/60 to-slate-600/40 border border-slate-700 hover:from-slate-600 hover:to-slate-500 transition text-white font-semibold"
                >
                  Add / Replace
                </button>

                <button
                  onClick={handleReset}
                  className="px-4 py-3 rounded-xl border border-slate-700 text-slate-200 hover:bg-slate-800"
                >
                  Reset
                </button>
              </div>

              {/* Optimization and Process buttons - Wrap on small screen */}
              <div className="flex flex-col sm:flex-row gap-2 sm:items-center w-full sm:w-auto">
                {/* Optimization checkbox */}
                <label className="flex items-center gap-2 text-sm text-slate-300 py-2 sm:py-0">
                  <input
                    type="checkbox"
                    checked={optimiseForWeb}
                    onChange={(e) => setOptimiseForWeb(e.target.checked)}
                    className="accent-cyan-500"
                  />
                  <span className="whitespace-nowrap">Optimize output</span>
                </label>

                {/* Remove BG Button */}
                <button
                  onClick={handleRemoveBG}
                  disabled={!file || loading}
                  className={`flex-1 px-4 py-3 rounded-xl font-semibold text-black bg-gradient-to-r from-cyan-400 to-blue-500 shadow-lg transition transform ${
                    !file || loading
                      ? "opacity-60 cursor-not-allowed"
                      : "hover:scale-[1.02]"
                  }`}
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <ArrowPathIcon className="h-5 w-5 animate-spin text-white" />
                      Processing...
                    </span>
                  ) : (
                    <span className="flex items-center justify-center gap-2">
                      <SparklesIcon className="h-5 w-5 text-white" />
                      Remove Background
                    </span>
                  )}
                </button>

                {/* Cancel Button */}
                {loading && (
                  <button
                    onClick={cancelProcessing}
                    className="px-3 py-3 rounded-xl border border-red-600 text-red-400 hover:bg-red-700/10"
                    title="Cancel"
                    aria-label="Cancel processing"
                  >
                    <PauseCircleIcon className="h-5 w-5" />
                  </button>
                )}
              </div>
            </div>

            {/* Progress bars - already responsive */}
            <div className="mt-4">
              <AnimatePresence>
                {(uploadProgress > 0 && uploadProgress < 100) || loading ? (
                  <motion.div
                    key="progress"
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 6 }}
                    className="space-y-2"
                  >
                    {/* Upload */}
                    {uploadProgress > 0 && (
                      <div>
                        <div className="text-xs text-slate-300 mb-1">
                          Upload: {uploadProgress}%
                        </div>
                        <div className="w-full h-2 bg-slate-700 rounded-full overflow-hidden">
                          <div
                            className="h-2 bg-cyan-400 transition-all"
                            style={{ width: `${uploadProgress}%` }}
                          />
                        </div>
                      </div>
                    )}

                    {/* Processing */}
                    {loading && uploadProgress >= 100 && (
                      <div>
                        <div className="flex items-center justify-between text-xs text-slate-300 mb-1">
                          <div>Processing</div>
                          <div>
                            {processingProgress ? `${processingProgress}%` : "..."}
                          </div>
                        </div>
                        <div className="w-full h-2 bg-slate-700 rounded-full overflow-hidden">
                          <div
                            className="h-2 bg-blue-500 animate-[pulse_2s_infinite] opacity-80"
                            style={{
                              width: processingProgress ? `${processingProgress}%` : "50%",
                            }}
                          />
                        </div>
                      </div>
                    )}
                  </motion.div>
                ) : null}
              </AnimatePresence>
            </div>
          </div>

          {/* Right: preview results */}
          <div className="lg:col-span-5 flex flex-col gap-6">
            <div className="rounded-2xl border border-slate-700 bg-slate-900/40 p-4 flex flex-col">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-2">
                <div className="sm:block">
                  <div className="text-sm text-slate-300 font-semibold hidden sm:block">
                    Result Preview
                  </div>
                  <div className="text-xs text-slate-400 hidden sm:block">
                    Original vs processed
                  </div>
                </div>
                <button
                  onClick={handleCopyLink}
                  disabled={!outputUrl || downloadState !== "idle"}
                  className={`px-3 py-2 rounded-md border border-slate-700 text-sm w-full sm:w-auto ${
                    !outputUrl || downloadState !== "idle"
                      ? "opacity-50 cursor-not-allowed"
                      : "hover:bg-slate-800"
                  }`}
                  title="Copy result URL"
                >
                  Copy Link
                </button>
              </div>

              {/* Previews */}
              <div className="mt-3 flex-1 grid grid-cols-2 gap-3 min-h-[160px]">
                {/* Original Preview */}
                <div className="rounded-lg overflow-hidden border border-slate-800 bg-slate-900/60 p-2 flex flex-col items-center justify-center">
                  <div className="text-xs text-slate-400 mb-2">Original</div>
                  {previewUrl ? (
                    <img
                      src={previewUrl}
                      alt="original"
                      className="max-h-full object-contain"
                    />
                  ) : (
                    <div className="text-slate-500 text-sm">No file</div>
                  )}
                </div>

                {/* Result Preview */}
                <div className="rounded-lg overflow-hidden border border-slate-800 bg-slate-900/60 p-2 flex flex-col items-center justify-center">
                  <div className="text-xs text-slate-400 mb-2">Result</div>
                  {outputUrl ? (
                    <img
                      src={outputUrl}
                      alt="result"
                      className="max-h-full object-contain"
                    />
                  ) : (
                    <div className="text-slate-500 text-sm">No result yet</div>
                  )}
                </div>
              </div>
            </div>

            {/* Download Button Only */}
            {outputUrl && (
              <div className="rounded-xl border border-slate-700 bg-slate-800/60 p-4">
                <div className="flex items-center justify-between">
                  <div className="text-sm font-semibold text-slate-300">
                    Download
                  </div>
                </div>

                {/* The main download button */}
                <motion.button
                  onClick={handleDownload}
                  disabled={downloadState !== "idle"}
                  className={`w-full mt-4 px-4 py-3 rounded-xl font-semibold text-black bg-gradient-to-r from-cyan-400 to-blue-500 shadow-lg transition transform ${
                    downloadState !== "idle"
                      ? "opacity-60 cursor-not-allowed"
                      : "hover:scale-[1.02]"
                  }`}
                >
                  <span className="flex items-center justify-center gap-2">
                    {downloadState === "downloading" ? (
                      <ArrowPathIcon className="h-5 w-5 animate-spin" />
                    ) : downloadState === "downloaded" ? (
                      <CheckCircleIcon className="h-5 w-5" />
                    ) : (
                      <ArrowDownTrayIcon className="h-5 w-5" />
                    )}
                    {downloadState === "downloading"
                      ? "Preparing Download..."
                      : downloadState === "downloaded"
                      ? "Downloaded!"
                      : "Download Result"}
                  </span>
                </motion.button>
              </div>
            )}
          </div>
        </div>

        {/* Toasts - already responsive (fixed position) */}
        <div className="fixed right-4 sm:right-6 bottom-4 sm:bottom-6 z-50 flex flex-col gap-2">
          <AnimatePresence>
            {toasts.map((t) => (
              <motion.div
                key={t.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className={`px-4 py-2 rounded-md shadow-lg max-w-xs ${
                  t.type === "error"
                    ? "bg-red-600 text-white"
                    : t.type === "success"
                    ? "bg-green-600 text-white"
                    : "bg-slate-800 text-slate-100"
                }`}
              >
                {t.message}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}