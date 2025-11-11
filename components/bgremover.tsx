"use client";

import React, { useRef, useState, useEffect, useCallback } from "react";
import axios from "axios";
import {
  CloudArrowUpIcon,
  ArrowDownTrayIcon,
  TrashIcon,
  XCircleIcon,
  CheckCircleIcon,
  SparklesIcon,
  PhotoIcon,
  ArrowPathIcon,
  PauseCircleIcon,
} from "@heroicons/react/24/outline";
import { motion, AnimatePresence } from "framer-motion";

/**
 * Big upgrade for BgRemover UI + logic
 * - paste support
 * - upload & processing progress
 * - cancel jobs
 * - file validation
 * - preview + download
 * - toasts + friendly messages
 *
 * NOTE: requires an API route at /api/remove-bg that accepts `image` FormData
 * and returns the processed image blob (PNG ideally). Adjust `axios` config
 * if your API returns a wrapped JSON containing a URL instead.
 */

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
  const [processingProgress, setProcessingProgress] = useState<number | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [fitMode, setFitMode] = useState<"contain" | "cover">("contain");
  const [optimiseForWeb, setOptimiseForWeb] = useState(true);
  const [downloadState, setDownloadState] = useState<
    "idle" | "downloading" | "downloaded" | "uploading_s3" | "uploaded_s3" | "saving_workspace" | "saved_workspace" | "error"
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
  const handleNewFile = (f: File) => {
    if (!ALLOWED_TYPES.includes(f.type)) {
      pushToast("error", "Unsupported file type. Use PNG/JPEG/WebP.");
      return;
    }

    if (f.size > MAX_FILE_SIZE_BYTES) {
      pushToast("error", `File too large. Max ${(MAX_FILE_SIZE_BYTES / 1024 / 1024).toFixed(0)} MB.`);
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

    setFile(f);
    setPreviewUrl(URL.createObjectURL(f));
    setUploadProgress(0);
    setProcessingProgress(null);
    pushToast("info", `Loaded ${f.name} — ${Math.round(f.size / 1024)} KB`);
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
    return () => window.removeEventListener("paste", pasteHandler);
  }, [previewUrl, outputUrl, pushToast]);

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

  // New multi-step download logic
  const handleDownload = async () => {
    if (!outputUrl) {
      pushToast("error", "No result to download.");
      return;
    }
    setDownloadState("downloading");

    try {
      // Step 1: Download locally
      const response = await fetch(outputUrl);
      const blob = await response.blob();
      const a = document.createElement("a");
      a.href = outputUrl;
      a.download = "bg-removed.png";
      document.body.appendChild(a);
      a.click();
      a.remove();
      setDownloadState("downloaded");
      pushToast("success", "File downloaded to your PC!");

      // Step 2: Upload to S3
// Step 2: Upload to S3
setDownloadState("uploading_s3");
const arrayBuffer = await blob.arrayBuffer();
const base64 = btoa(
  new Uint8Array(arrayBuffer).reduce((data, byte) => data + String.fromCharCode(byte), "")
);
const fileName = `bg-removed-${Date.now()}.${blob.type.split("/")[1] || "png"}`;

// Pass mimeType
const res = await fetch("/api/upload", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    fileBase64: base64,
    fileName,
    folder: "bg-removed",
    mimeType: blob.type, // ✅ Pass MIME type dynamically
  }),
});

      const data = await res.json();
      if (res.ok && data.url) {
        setDownloadState("uploaded_s3");
        pushToast("success", `Uploaded to S3: ${data.url}`);
      } else {
        throw new Error(data.message || "S3 upload failed.");
      }

      // Step 3: Simulate saving to workspace
      setDownloadState("saving_workspace");
      await new Promise((resolve) => setTimeout(resolve, 1500));
      setDownloadState("saved_workspace");
      pushToast("success", "Saved to your workspace!");

    } catch (err) {
      console.error(err);
      setDownloadState("error");
      pushToast("error", "An error occurred during the download process.");
    } finally {
      setTimeout(() => setDownloadState("idle"), 3000); // Reset state after a delay
    }
  };

  // Copy output link
  const handleCopyLink = async () => {
    if (!outputUrl) return pushToast("error", "No result to copy.");
    try {
      await navigator.clipboard.writeText(outputUrl);
      pushToast("success", "Result URL copied to clipboard.");
    } catch {
      pushToast("error", "Failed to copy to clipboard.");
    }
  };

  return (
    <div
      className="min-h-screen w-full flex flex-col items-center justify-start p-6 
                 bg-transparent text-white mt-10 ml-[-30px]"
    >
      <div className="w-full max-w-6xl">


        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left: uploader + controls */}
          <div className="lg:col-span-7">
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
              className={`relative h-80 rounded-2xl border-2 border-dashed transition-all duration-200 flex items-center justify-center p-6 cursor-pointer
                ${dragActive ? "border-cyan-400 bg-slate-800/60" : "border-slate-700 bg-slate-900/40"}`}
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
                <div className="flex flex-col items-center gap-3 text-slate-300 select-none">
                  <div className="p-3 rounded-full bg-gradient-to-br from-cyan-600/20 to-blue-600/20 border border-slate-700">
                    <CloudArrowUpIcon className="h-12 w-12 text-cyan-400" />
                  </div>
                  <div className="text-lg font-semibold">Drag & drop, paste, or click to upload</div>
                  <div className="text-sm text-slate-400">
                    PNG / JPG / WEBP — up to {(MAX_FILE_SIZE_BYTES / 1024 / 1024).toFixed(0)} MB
                  </div>
                  <div className="mt-3 flex gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        fileInput.current?.click();
                      }}
                      className="px-4 py-2 bg-cyan-600 text-black rounded-md font-medium hover:scale-[1.02] transition"
                    >
                      Select File
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        pushToast("info", "Tip: press Ctrl/Cmd+V to paste an image from clipboard.");
                      }}
                      className="px-3 py-2 border border-slate-700 rounded-md text-sm text-slate-300 hover:bg-slate-800"
                    >
                      How to paste
                    </button>
                  </div>
                </div>
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <div className="relative w-full h-full rounded-lg overflow-hidden bg-black/40 border border-slate-700 p-3">
                    <img
                      src={previewUrl}
                      alt="preview"
                      className={`max-h-full max-w-full object-${fitMode} mx-auto`}
                      style={{ transform: "translateZ(0)" }}
                    />
                    {/* file info */}
                    <div className="absolute left-3 top-3 bg-slate-900/60 px-2 py-1 rounded-md text-xs">
                      <div className="font-medium">{file?.name}</div>
                      <div className="text-slate-400">{Math.round((file?.size || 0) / 1024)} KB</div>
                    </div>

                    {/* small action buttons on preview */}
                    <div className="absolute right-3 top-3 flex flex-col gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setFitMode((m) => (m === "contain" ? "cover" : "contain"));
                        }}
                        title="Toggle fit"
                        className="bg-slate-800/70 p-2 rounded-md hover:bg-slate-700"
                      >
                        <PhotoIcon className="h-5 w-5 text-slate-200" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleReset();
                        }}
                        title="Reset"
                        className="bg-red-700/80 p-2 rounded-md hover:bg-red-600"
                      >
                        <TrashIcon className="h-5 w-5 text-white" />
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Controls */}
            <div className="mt-4 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
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

              <div className="flex gap-2 items-center">
                <label className="flex items-center gap-2 text-sm text-slate-300">
                  <input
                    type="checkbox"
                    checked={optimiseForWeb}
                    onChange={(e) => setOptimiseForWeb(e.target.checked)}
                    className="accent-cyan-500"
                  />
                  Optimize output
                </label>

                <button
                  onClick={handleRemoveBG}
                  disabled={!file || loading}
                  className={`px-4 py-3 rounded-xl font-semibold text-black bg-gradient-to-r from-cyan-400 to-blue-500 shadow-lg transition transform ${
                    !file || loading ? "opacity-60 cursor-not-allowed" : "hover:scale-[1.02]"
                  }`}
                >
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <ArrowPathIcon className="h-5 w-5 animate-spin text-white" />
                      Processing...
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      <SparklesIcon className="h-5 w-5 text-white" />
                      Remove Background
                    </span>
                  )}
                </button>

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

            {/* Progress bars */}
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
                        <div className="text-xs text-slate-300 mb-1">Upload: {uploadProgress}%</div>
                        <div className="w-full h-2 bg-slate-700 rounded-full overflow-hidden">
                          <div
                            className="h-2 bg-cyan-400 transition-all"
                            style={{ width: `${uploadProgress}%` }}
                          />
                        </div>
                      </div>
                    )}

                    {/* Processing (indeterminate if server not providing) */}
                    {loading && uploadProgress >= 100 && (
                      <div>
                        <div className="flex items-center justify-between text-xs text-slate-300 mb-1">
                          <div>Processing</div>
                          <div>{processingProgress ? `${processingProgress}%` : "..."}</div>
                        </div>
                        <div className="w-full h-2 bg-slate-700 rounded-full overflow-hidden">
                          <div
                            className="h-2 bg-blue-500 animate-[pulse_2s_infinite] opacity-80"
                            style={{ width: processingProgress ? `${processingProgress}%` : "50%" }}
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
          <div className="lg:col-span-5 flex flex-col gap-4">
            <div className="rounded-2xl border border-slate-700 bg-slate-900/40 p-4 min-h-[180px] flex flex-col">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="text-sm text-slate-300 font-semibold">Result Preview</div>
                  <div className="text-xs text-slate-400">Original vs processed</div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={handleCopyLink}
                    disabled={!outputUrl || downloadState !== "idle"}
                    className={`px-3 py-2 rounded-md border border-slate-700 text-sm ${
                      !outputUrl || downloadState !== "idle" ? "opacity-50 cursor-not-allowed" : "hover:bg-slate-800"
                    }`}
                    title="Copy result URL"
                  >
                    Copy Link
                  </button>
                </div>
              </div>

              <div className="mt-3 flex-1 grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="rounded-lg overflow-hidden border border-slate-800 bg-slate-900/60 p-2 flex flex-col items-center justify-center">
                  <div className="text-xs text-slate-400 mb-2">Original</div>
                  {previewUrl ? (
                    <img src={previewUrl} alt="original" className="max-h-40 object-contain" />
                  ) : (
                    <div className="text-slate-500 text-sm">No file</div>
                  )}
                </div>

                <div className="rounded-lg overflow-hidden border border-slate-800 bg-slate-900/60 p-2 flex flex-col items-center justify-center">
                  <div className="text-xs text-slate-400 mb-2">Result</div>
                  {outputUrl ? (
                    <img src={outputUrl} alt="result" className="max-h-40 object-contain" />
                  ) : (
                    <div className="text-slate-500 text-sm">No result yet</div>
                  )}
                </div>
              </div>
            </div>

            {/* New: "Next Level" Download Progress UI */}
            {outputUrl && (
              <div className="rounded-xl border border-slate-700 bg-slate-800/60 p-4">
                <div className="flex items-center justify-between">
                  <div className="text-sm font-semibold text-slate-300">
                    Download Options
                  </div>
      
                  <div
                    className={`flex flex-col items-center justify-center p-3 rounded-md transition-colors ${
                      downloadState === "saving_workspace" ? "bg-purple-900/40" : ""
                    }`}
                  >
                    
                  </div>
                </div>

                {/* The main download button */}
                <motion.button
                  onClick={handleDownload}
                  disabled={downloadState !== "idle"}
                  className={`w-full mt-4 px-4 py-3 rounded-xl font-semibold text-black bg-gradient-to-r from-cyan-400 to-blue-500 shadow-lg transition transform ${
                    downloadState !== "idle" ? "opacity-60 cursor-not-allowed" : "hover:scale-[1.02]"
                  }`}
                >
                  <span className="flex items-center justify-center gap-2">
                    <ArrowDownTrayIcon className="h-5 w-5" />
                    Download & Save
                  </span>
                </motion.button>
              </div>
            )}
            
          </div>
        </div>

        {/* Toasts */}
        <div className="fixed right-6 bottom-6 z-50 flex flex-col gap-2">
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