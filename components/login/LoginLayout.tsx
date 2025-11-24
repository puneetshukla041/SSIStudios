"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import AuthBg from "@/components/aminations/AuthBg"; // Assuming path
import Logo from "@/components/aminations/Logo";     // Assuming path
import { ArrowRightIcon } from '@heroicons/react/24/outline';
import { useAuth } from "@/contexts/AuthContext";   // Assuming path
import LoginForm from "./LoginForm";
import RequestModal from "./RequestModal";
import AnimatedModals from ".//AnimatedModals";

/**
 * The core component holding all login state, logic, and the main layout structure.
 */
export default function LoginLayout() {
  const { login } = useAuth();

  // --- Login State ---
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showTick, setShowTick] = useState(false);
  const [showWelcome, setShowWelcome] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // --- Request Modal State ---
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [requestName, setRequestName] = useState("");
  const [requestPhone, setRequestPhone] = useState("");
  const [requestIDFile, setRequestIDFile] = useState<File | null>(null);
  const [requestComment, setRequestComment] = useState("");
  const [requestError, setRequestError] = useState("");
  const [isRequestLoading, setIsRequestLoading] = useState(false);

  const MAX_FILE_SIZE_MB = 10;
  const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

  // --- Handlers ---

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const res = await fetch("/api/admin-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.message || "Login failed. Please try again.");

      // Success Animation Sequence
      setTimeout(() => {
        setIsLoading(false);
        setShowTick(true);

        setTimeout(() => {
          setShowTick(false);
          setShowWelcome(true);

          setTimeout(() => {
            setShowWelcome(false);
            login(data.user); // Final login action
          }, 2000);
        }, 1000);
      }, 1500);
    } catch (err: any) {
      console.error("API Error Response:", err);
      setError(err.message);
      setIsLoading(false);
    }
  };

  const handleIDFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files ? e.target.files[0] : null;
    if (file && file.size > MAX_FILE_SIZE_BYTES) {
      setRequestError(`File size must be less than ${MAX_FILE_SIZE_MB}MB.`);
      setRequestIDFile(null);
    } else {
      setRequestError("");
      setRequestIDFile(file);
    }
  };

  const handleRequestAccess = async (e: React.FormEvent) => {
    e.preventDefault();
    setRequestError("");
    setIsRequestLoading(true);

    // Basic validation
    if (!requestName || !requestPhone) {
      setRequestError("Full Name and Phone Number are required.");
      setIsRequestLoading(false);
      return;
    }

    const formData = new FormData();
    formData.append("fullName", requestName);
    formData.append("phoneNumber", requestPhone);
    formData.append("comment", requestComment);
    if (requestIDFile) {
      formData.append("idCard", requestIDFile);
    }

    try {
      const res = await fetch("/api/request-access", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.message || "Failed to submit request. Please try again.");

      alert("Your access request has been submitted successfully!");
      setShowRequestModal(false);
      setRequestName("");
      setRequestPhone("");
      setRequestIDFile(null);
      setRequestComment("");
      setIsRequestLoading(false);

    } catch (err: any) {
      console.error("API Error Response:", err);
      setRequestError(err.message);
      setIsRequestLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(prev => !prev);
  };

  // Props for Modals
  const modalProps = { isLoading, showTick, showWelcome, username };
  
  // Props for LoginForm
  const loginFormProps = {
    username, setUsername, password, setPassword, error, 
    isLoading, showTick, showWelcome, showPassword,
    handleLogin, togglePasswordVisibility, setShowRequestModal
  };
  // Props for RequestModal
  const requestModalProps = {
    showRequestModal, setShowRequestModal, requestName, setRequestName,
    requestPhone, setRequestPhone, requestIDFile, setRequestIDFile,
    requestComment, setRequestComment, requestError, setRequestError,
    isRequestLoading, handleRequestAccess, handleIDFileChange,
    MAX_FILE_SIZE_MB, MAX_FILE_SIZE_BYTES
  };
  return (
    <div className="min-h-screen flex flex-col md:flex-row items-center justify-center bg-transparent relative p-4 md:p-10 font-sans">
      
      {/* Background and Animated Modals */}
      <div className="hidden md:block absolute inset-0">
        <AuthBg />
      </div>
      <AnimatedModals {...modalProps} />
      {/* --- Desktop View (Large component split into Layout and Form) --- */}
      <div className="hidden md:flex relative z-10 w-full max-w-7xl h-[650px] rounded-[3rem] p-12
                      bg-gradient-to-tr from-gray-900/40 to-black/30
                      border border-gray-700/60 shadow-3xl backdrop-blur-3xl
                      transition-all duration-500 hover:scale-[1.01] hover:shadow-4xl
                      text-gray-100 items-center justify-between overflow-hidden">

        {/* Left Side: Animated Welcome Message */}
        <motion.div
          className="flex flex-col h-full justify-center items-start w-1/2 p-6"
          initial={{ x: -100, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.8, type: "spring", stiffness: 50 }}
        >
          <div className="flex flex-col items-start space-y-4">
            <h1 className="text-6xl font-extrabold text-white leading-tight">
              Welcome to <br />
            </h1>
          </div>
          <div className="relative -mt-0 ml-0">
            <Logo />
          </div>
          <motion.p
            className="text-sm text-gray-300 italic mt-4 max-w-xs tracking-wide"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.6 }}
          >
            This portal is for authorized personnel only. Your credentials grant access to
            project management, user analytics, and system configurations.
          </motion.p>

          <motion.button
            className="mt-6 flex items-center px-4 py-2 text-sm font-semibold text-blue-300 border border-blue-400/40 rounded-full
                       hover:text-white hover:bg-blue-500/20 transition-all duration-300 backdrop-blur-sm cursor-pointer"
            onClick={() => setShowRequestModal(true)}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.5 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Request Access
            <ArrowRightIcon className="w-4 h-4 ml-2" />
          </motion.button>

        </motion.div>

        {/* Right Side: Login Form */}
        <LoginForm {...loginFormProps} isMobile={false} />
      </div>

      {/* --- Mobile View (Uses LoginForm in a different wrapper) --- */}
      <div
        className="md:hidden relative z-10 w-full max-w-2xl aspect-video rounded-2xl p-8
                   bg-gradient-to-tr from-white/80 to-gray-100/70
                   border border-gray-200 shadow-xl backdrop-blur-md
                   transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl
                   flex flex-col justify-center"
      >
        <h1 className="text-3xl font-semibold text-gray-900 mb-4 text-center">
          SSI Studios
        </h1>
        <p className="text-gray-500 text-sm text-center mb-6">
          Please log in to continue
        </p>

        {/* The LoginForm component will handle the mobile form rendering */}
        <LoginForm {...loginFormProps} isMobile={true} />
      </div>

      {/* Request Access Modal */}
      <RequestModal {...requestModalProps} />
    </div>
  );
}