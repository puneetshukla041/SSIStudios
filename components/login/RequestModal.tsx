import { motion, AnimatePresence } from "framer-motion";
import { XMarkIcon, PaperAirplaneIcon, PhotoIcon } from '@heroicons/react/24/outline';
import React from "react";

interface RequestModalProps {
  showRequestModal: boolean;
  setShowRequestModal: (show: boolean) => void;
  requestName: string;
  setRequestName: (name: string) => void;
  requestPhone: string;
  setRequestPhone: (phone: string) => void;
  requestIDFile: File | null;
  setRequestIDFile: (file: File | null) => void;
  requestComment: string;
  setRequestComment: (comment: string) => void;
  requestError: string;
  setRequestError: (error: string) => void;
  isRequestLoading: boolean;
  handleRequestAccess: (e: React.FormEvent) => Promise<void>;
  handleIDFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  MAX_FILE_SIZE_MB: number;
  MAX_FILE_SIZE_BYTES: number;
}

/**
 * Renders the modal for requesting access from the admin.
 */
export default function RequestModal({
  showRequestModal, setShowRequestModal, requestName, setRequestName,
  requestPhone, setRequestPhone, requestIDFile, requestComment,
  setRequestComment, requestError, isRequestLoading, handleRequestAccess,
  handleIDFileChange, MAX_FILE_SIZE_MB
}: RequestModalProps) {

  return (
    <AnimatePresence>
      {showRequestModal && (
        <motion.div
          className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          <motion.div
            className="bg-gray-900/40 text-gray-100 rounded-3xl p-8 max-w-lg w-full shadow-2xl relative
                       border border-gray-700/60 backdrop-blur-3xl"
            initial={{ scale: 0.9, y: 0, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.9, y: 0, opacity: 0 }}
            transition={{ type: "spring", stiffness: 200, damping: 25 }}
          >
            <button
              className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors cursor-pointer"
              onClick={() => setShowRequestModal(false)}
            >
              <XMarkIcon className="w-6 h-6" />
            </button>
            <h3 className="text-2xl font-bold mb-2 text-white">Request Access</h3>
            <p className="text-gray-400 text-sm mb-6">
              Fill out the form below to request access from the admin.
            </p>

            {requestError && (
              <div className="bg-red-900/50 text-red-300 text-sm px-4 py-3 rounded-xl mb-6 text-center border border-red-800">
                {requestError}
              </div>
            )}

            <form onSubmit={handleRequestAccess} className="space-y-6">
              {/* Full Name */}
              <div>
                <label htmlFor="fullName" className="block text-sm font-medium text-gray-300 mb-2">Full Name</label>
                <input
                  id="fullName"
                  type="text"
                  value={requestName}
                  onChange={(e) => setRequestName(e.target.value)}
                  className="w-full border border-gray-600 rounded-xl px-5 py-3 bg-gray-800/50 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  placeholder="e.g., Puneet Shukla"
                  required
                />
              </div>

              {/* Phone Number */}
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-300 mb-2">Phone Number</label>
                <input
                  id="phone"
                  type="tel"
                  value={requestPhone}
                  onChange={(e) => setRequestPhone(e.target.value)}
                  className="w-full border border-gray-600 rounded-xl px-5 py-3 bg-gray-800/50 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  placeholder="+91-8527989270"
                  required
                />
              </div>

              {/* ID Card Upload */}
              <div>
                <label htmlFor="idCard" className="block text-sm font-medium text-gray-300 mb-2">
                  ID Card (Optional, max {MAX_FILE_SIZE_MB}MB)
                </label>
                <div className="flex items-center space-x-2">
                  <input
                    id="idCard"
                    type="file"
                    onChange={handleIDFileChange}
                    className="hidden"
                    accept="image/*, .pdf"
                  />
                  <label
                    htmlFor="idCard"
                    className="flex-grow flex items-center justify-center px-4 py-3 border border-dashed border-gray-600 rounded-lg text-gray-400 hover:border-blue-500 transition-colors cursor-pointer bg-gray-800/50"
                  >
                    <PhotoIcon className="w-5 h-5 mr-2" />
                    {requestIDFile ? requestIDFile.name : "Choose a file"}
                  </label>
                </div>
                {requestIDFile && (
                  <p className="text-xs text-gray-400 mt-2">
                    File chosen: <span className="font-semibold">{requestIDFile.name}</span>
                  </p>
                )}
              </div>

              {/* Comment */}
              <div>
                <label htmlFor="comment" className="block text-sm font-medium text-gray-300 mb-2">Comment</label>
                <textarea
                  id="comment"
                  rows={4}
                  value={requestComment}
                  onChange={(e) => setRequestComment(e.target.value)}
                  className="w-full border border-gray-600 rounded-xl px-5 py-3 bg-gray-800/50 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  placeholder="Explain why you need access..."
                />
              </div>

              {/* Submit Button */}
              <motion.button
                type="submit"
                className="w-full py-3 rounded-lg font-bold flex items-center justify-center space-x-2
                           bg-gradient-to-r from-blue-600 to-blue-800 text-white
                           hover:from-blue-500 hover:to-blue-700 transition-colors duration-300
                           disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                disabled={isRequestLoading}
              >
                <AnimatePresence mode="wait">
                  {isRequestLoading ? (
                    <motion.span key="request-loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                      Submitting...
                    </motion.span>
                  ) : (
                    <motion.div key="request-submit" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center space-x-2">
                      <PaperAirplaneIcon className="w-5 h-5 -rotate-45" />
                      <span>Submit Request</span>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.button>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}