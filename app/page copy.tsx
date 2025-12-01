"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  User,
  Calendar,
  CheckCircle,
  Lock,
  Settings,
  Shield,
  Bell,
  Check,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

interface UserProfile {
  _id: string;
  username: string;
  password?: string;
  createdAt: string;
  updatedAt: string;
}

const toggleVariants = {
  unchecked: { x: 0 },
  checked: { x: 20 },
};

export default function ProfilePage() {
  const { user } = useAuth();
  const [profileData, setProfileData] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [showTick, setShowTick] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);

  // State for each toggle button
  const [isEmailEnabled, setIsEmailEnabled] = useState<boolean>(true);
  const [isTwoFactorEnabled, setIsTwoFactorEnabled] = useState<boolean>(false);
  const [isAutosaveEnabled, setIsAutosaveEnabled] = useState<boolean>(true);

  const formatDate = (dateString: string) => {
    try {
      const options: Intl.DateTimeFormatOptions = {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      };
      const date = new Date(dateString);
      return isNaN(date.getTime())
        ? "Invalid Date"
        : date.toLocaleDateString(undefined, options);
    } catch {
      return "N/A";
    }
  };

  const handleSaveChanges = async () => {
    setIsSaving(true);
    setSaveSuccess(false);

    try {
      // Simulate an API call with a 1.5-second delay
      await new Promise((resolve) => setTimeout(resolve, 1500));
      setSaveSuccess(true);
      // Wait for the success animation to show for 1 second
      setTimeout(() => setIsSaving(false), 1000);
    } catch (err) {
      console.error("Failed to save changes:", err);
      setIsSaving(false);
      setSaveSuccess(false);
    }
  };

  useEffect(() => {
    async function fetchProfileData() {
      if (!user) {
        setIsLoading(false);
        setError("User not authenticated.");
        return;
      }

      const startTime = Date.now();

      try {
        const userId = (user as any)._id || (user as any).id || (user as any).uid;
        if (!userId) {
          setIsLoading(false);
          setError("User ID not found in session.");
          return;
        }

        const response = await fetch(`/api/user?userId=${userId}`);
        if (!response.ok)
          throw new Error(`Failed to fetch profile: ${response.statusText}`);

        const data = await response.json();
        setProfileData(data.data);
      } catch (err: any) {
        setError(err.message);
        console.error("Failed to fetch user profile:", err);
      } finally {
        const elapsed = Date.now() - startTime;
        const circleDuration = 2000;
        const tickDuration = 2000;

        // Ensure loading screen is visible for at least 2 seconds
        setTimeout(
          () => {
            setShowTick(true);
            setTimeout(() => setIsLoading(false), tickDuration);
          },
          circleDuration - elapsed > 0 ? circleDuration - elapsed : 0
        );
      }
    }

    fetchProfileData();
  }, [user]);

  return (
    <main className="flex-1 min-h-screen flex items-center justify-center p-4 font-sans bg-transparent">
      <AnimatePresence mode="wait">
        {isSaving && (
          <motion.div
            key="saving-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 backdrop-blur-sm"
          >
            <div className="flex flex-col items-center">
              <motion.div
                key="saving-animation"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
                className="w-24 h-24 relative flex items-center justify-center"
              >
                {!saveSuccess ? (
                  <motion.svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="100%"
                    height="100%"
                    viewBox="0 0 100 100"
                    className="absolute"
                  >
                    <motion.path
                      fill="none"
                      stroke="#60A5FA"
                      strokeWidth="4"
                      strokeLinecap="round"
                      initial={{
                        pathLength: 0,
                        rotate: 0,
                        opacity: 0,
                      }}
                      animate={{
                        pathLength: 1,
                        rotate: 360,
                        opacity: 1,
                      }}
                      transition={{
                        pathLength: { duration: 1.5, ease: "linear" },
                        rotate: { duration: 1.5, repeat: Infinity, ease: "linear" },
                        opacity: { duration: 0.3 },
                      }}
                      d="M50 2 A 48 48 0 0 1 50 98"
                    />
                  </motion.svg>
                ) : (
                  <motion.div
                    key="success-tick"
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{
                      type: "spring",
                      stiffness: 260,
                      damping: 20,
                      duration: 0.5,
                    }}
                    className="flex items-center justify-center w-24 h-24 rounded-full bg-green-500"
                  >
                    <Check size={48} className="text-white" />
                  </motion.div>
                )}
              </motion.div>
              <motion.p
                key="saving-text"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="text-white mt-4 text-lg font-semibold"
              >
                {saveSuccess ? "Credentials Updated!" : "Updating credentials..."}
              </motion.p>
            </div>
          </motion.div>
        )}
        {isLoading ? (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center justify-center w-full h-full"
          >
            <motion.div className="relative w-24 h-24 flex items-center justify-center">
              <svg className="w-24 h-24">
                <circle
                  cx="48"
                  cy="48"
                  r="46"
                  stroke="rgba(229,231,235,0.3)"
                  strokeWidth="4"
                  fill="transparent"
                />
                <motion.circle
                  cx="48"
                  cy="48"
                  r="46"
                  stroke="#60A5FA"
                  strokeWidth="4"
                  fill="transparent"
                  strokeLinecap="round"
                  initial={{ strokeDasharray: 0 }}
                  animate={{ strokeDasharray: 2 * Math.PI * 46 }}
                  transition={{ duration: 2, ease: "easeInOut" }}
                  style={{ transform: "rotate(-90deg)", transformOrigin: "50% 50%" }}
                />
              </svg>

              {showTick && (
                <motion.div
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: "spring", stiffness: 260, damping: 20 }}
                  className="absolute"
                >
                  <CheckCircle size={48} className="text-green-500" />
                </motion.div>
              )}
            </motion.div>

            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-xl text-gray-600 font-medium mt-4"
            >
              Fetching profile details...
            </motion.p>
          </motion.div>
        ) : error ? (
          <motion.div
            key="error"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="text-center p-8 rounded-2xl bg-transparent border border-red-300 shadow-md"
          >
            <p className="text-xl font-semibold text-red-700">Error:</p>
            <p className="mt-2 text-red-600">{error}</p>
          </motion.div>
        ) : (
          <motion.div
            key="content"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeInOut" }}
            className="w-full max-w-2xl p-6 rounded-xl shadow-lg border border-gray-300 bg-transparent"
          >
            <div className="text-center mb-4">
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: "spring", stiffness: 150, damping: 10 }}
                className="p-3 rounded-full bg-transparent text-blue-500 inline-block mb-1 border border-blue-200"
              >
                <User size={36} />
              </motion.div>
              <h1 className="text-2xl font-bold tracking-tight text-gray-800">
                {profileData?.username || "Guest"}
              </h1>
              <p className="text-sm text-gray-500 mt-1 font-light">Your Profile Details</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* User Details */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, ease: "easeOut", delay: 0.2 }}
                className="bg-transparent backdrop-blur-sm rounded-lg p-4 shadow-md border border-gray-200"
              >
<div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
  {/* Username */}
  <div className="flex flex-col items-start p-3 rounded-lg border border-gray-200 bg-transparent">
    <div className="flex items-center gap-1 mb-1">
      <User size={14} className="text-blue-500" />
      <p className="text-xs text-gray-500 font-medium tracking-wide">Username</p>
    </div>
    <p className="text-base font-semibold text-gray-800 tracking-wide">{profileData?.username}</p>
  </div>

  {/* Password */}
  <div className="flex flex-col items-start p-3 rounded-lg border border-gray-200 bg-transparent">
    <div className="flex items-center gap-1 mb-1">
      <Lock size={14} className="text-pink-500" />
      <p className="text-xs text-gray-500 font-medium tracking-wide">Password</p>
    </div>
    <p className="text-base font-semibold text-gray-800 tracking-wide">
      {profileData?.password || "N/A"}
    </p>
  </div>

  {/* Created At */}
  <div className="flex flex-col items-start p-3 rounded-lg border border-gray-200 bg-transparent">
    <div className="flex items-center gap-1 mb-1">
      <Calendar size={14} className="text-green-500" />
      <p className="text-xs text-gray-500 font-medium tracking-wide">Account Created</p>
    </div>
    <p className="text-base font-semibold text-gray-800 tracking-wide">
      {profileData?.createdAt ? formatDate(profileData.createdAt) : "N/A"}
    </p>
  </div>

  {/* Updated At */}
  <div className="flex flex-col items-start p-3 rounded-lg border border-gray-200 bg-transparent">
    <div className="flex items-center gap-1 mb-1">
      <Calendar size={14} className="text-yellow-500" />
      <p className="text-xs text-gray-500 font-medium tracking-wide">Last Updated</p>
    </div>
    <p className="text-base font-semibold text-gray-800 tracking-wide">
      {profileData?.updatedAt ? formatDate(profileData.updatedAt) : "N/A"}
    </p>
  </div>
</div>
              </motion.div>

              {/* Account Settings */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, ease: "easeOut", delay: 0.3 }}
                className="bg-transparent backdrop-blur-sm rounded-lg p-4 shadow-md border border-gray-200"
              >
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                    <Settings className="w-5 h-5 text-green-600" />
                  </div>
                  <h2 className="text-lg font-semibold text-gray-800">Account Settings</h2>
                </div>
                <div className="space-y-3 text-sm">
                  {/* Toggle 1: Email Notifications */}
                  <div className="flex items-center justify-between">
                    <span className="text-gray-700">Email Notifications</span>
                    <motion.div
                      className="w-11 h-6 flex items-center rounded-full cursor-pointer p-0.5"
                      onClick={() => setIsEmailEnabled(!isEmailEnabled)}
                      initial={false} // Prevents initial animation from state change
                      animate={{ backgroundColor: isEmailEnabled ? "#3B82F6" : "#D1D5DB" }}
                      transition={{ duration: 0.2 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <motion.div
                        className="w-5 h-5 rounded-full bg-white shadow"
                        variants={toggleVariants}
                        animate={isEmailEnabled ? "checked" : "unchecked"}
                        transition={{ duration: 0.2 }}
                      />
                    </motion.div>
                  </div>

                  {/* Toggle 2: Two-Factor Authentication */}
                  <div className="flex items-center justify-between">
                    <span className="text-gray-700">Two-Factor Authentication</span>
                    <motion.div
                      className="w-11 h-6 flex items-center rounded-full cursor-pointer p-0.5"
                      onClick={() => setIsTwoFactorEnabled(!isTwoFactorEnabled)}
                      initial={false}
                      animate={{ backgroundColor: isTwoFactorEnabled ? "#3B82F6" : "#D1D5DB" }}
                      transition={{ duration: 0.2 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <motion.div
                        className="w-5 h-5 rounded-full bg-white shadow"
                        variants={toggleVariants}
                        animate={isTwoFactorEnabled ? "checked" : "unchecked"}
                        transition={{ duration: 0.2 }}
                      />
                    </motion.div>
                  </div>

                  {/* Toggle 3: Auto-save Projects */}
                  <div className="flex items-center justify-between">
                    <span className="text-gray-700">Auto-save Projects</span>
                    <motion.div
                      className="w-11 h-6 flex items-center rounded-full cursor-pointer p-0.5"
                      onClick={() => setIsAutosaveEnabled(!isAutosaveEnabled)}
                      initial={false}
                      animate={{ backgroundColor: isAutosaveEnabled ? "#3B82F6" : "#D1D5DB" }}
                      transition={{ duration: 0.2 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <motion.div
                        className="w-5 h-5 rounded-full bg-white shadow"
                        variants={toggleVariants}
                        animate={isAutosaveEnabled ? "checked" : "unchecked"}
                        transition={{ duration: 0.2 }}
                      />
                    </motion.div>
                  </div>
                </div>
              </motion.div>

              {/* Security */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, ease: "easeOut", delay: 0.4 }}
                className="bg-transparent backdrop-blur-sm rounded-lg p-4 shadow-md border border-gray-200"
              >
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-10 h-10 bg-red-100/50 rounded-full flex items-center justify-center">
                    <Shield className="w-5 h-5 text-red-600" />
                  </div>
                  <h2 className="text-lg font-semibold text-gray-800">Security</h2>
                </div>
                <div className="space-y-3 text-sm">
                  <button className="w-full text-left px-3 py-2 rounded-lg hover:bg-gray-100/20 transition-colors cursor-pointer">
                    Change Password
                  </button>
                  <button className="w-full text-left px-3 py-2 rounded-lg hover:bg-gray-100/20 transition-colors cursor-pointer">
                    Login History
                  </button>
                  <button className="w-full text-left px-3 py-2 rounded-lg hover:bg-gray-100/20 transition-colors cursor-pointer">
                    Active Sessions
                  </button>
                </div>
              </motion.div>

              {/* Preferences */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, ease: "easeOut", delay: 0.5 }}
                className="bg-transparent backdrop-blur-sm rounded-lg p-4 shadow-md border border-gray-200"
              >
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-10 h-10 bg-purple-100/50 rounded-full flex items-center justify-center">
                    <Bell className="w-5 h-5 text-purple-600" />
                  </div>
                  <h2 className="text-lg font-semibold text-gray-800">Preferences</h2>
                </div>
                <div className="space-y-3 text-sm">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Language
                    </label>
                    <select className="w-full px-2 py-1.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white/10 backdrop-blur-sm text-sm cursor-pointer">
                      <option>English</option>
                      <option>Spanish</option>
                      <option>French</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Timezone
                    </label>
                    <select className="w-full px-2 py-1.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white/10 backdrop-blur-sm text-sm cursor-pointer">
                      <option>UTC-5 (Eastern)</option>
                      <option>UTC-8 (Pacific)</option>
                      <option>UTC+0 (GMT)</option>
                    </select>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Save Button */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: "easeOut", delay: 0.6 }}
              className="text-center mt-8"
            >
              <button
                onClick={handleSaveChanges}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium text-sm hover:bg-blue-700 transition-colors cursor-pointer"
              >
                Save Changes
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}