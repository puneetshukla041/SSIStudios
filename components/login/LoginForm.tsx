import { motion, AnimatePresence } from "framer-motion";
import { EyeIcon, EyeSlashIcon, ArrowRightIcon } from '@heroicons/react/24/outline';
import React from 'react';

interface LoginFormProps {
  username: string;
  setUsername: (value: string) => void;
  password: string;
  setPassword: (value: string) => void;
  error: string;
  isLoading: boolean;
  showTick: boolean;
  showWelcome: boolean;
  showPassword: boolean;
  handleLogin: (e: React.FormEvent) => Promise<void>;
  togglePasswordVisibility: () => void;
  isMobile: boolean;
  setShowRequestModal: (show: boolean) => void; // Included for the desktop 'forgot' button logic
}

/**
 * Renders the Login Form for both desktop and mobile views.
 * The styling and structure adjust based on the 'isMobile' prop.
 */
export default function LoginForm({
  username, setUsername, password, setPassword, error,
  isLoading, showTick, showWelcome, showPassword,
  handleLogin, togglePasswordVisibility, isMobile, setShowRequestModal
}: LoginFormProps) {

  const disabled = isLoading || showTick || showWelcome;

  // --- Desktop Styling (Right Side of Layout) ---
  if (!isMobile) {
    return (
      <motion.div
        className="w-1/2 p-12 bg-black/20 rounded-3xl backdrop-blur-2xl h-full flex flex-col justify-center
                   border border-gray-700/50 shadow-inner"
        initial={{ x: 100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.8, type: "spring", stiffness: 50 }}
      >
        <h2 className="text-3xl font-extrabold mb-2 text-center text-white">User Portal</h2>
        <p className="text-gray-400 text-sm mb-8 text-center">
          Access your control panel with your credentials.
        </p>

        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="bg-red-900/50 text-red-300 text-sm px-4 py-3 rounded-xl mb-6 text-center border border-red-800"
            >
              {error}
            </motion.div>
          )}
        </AnimatePresence>

        <form onSubmit={handleLogin} className="space-y-8">
          {/* Username Input */}
          <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.3 }}>
            <label className="block text-sm font-medium text-gray-300 mb-2">Username</label>
            <input
              type="text"
              className="w-full border border-gray-600 rounded-xl px-5 py-3
                         bg-gray-800/50 text-white placeholder-gray-500
                         focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                         transition-colors duration-200"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter your username"
              disabled={disabled}
            />
          </motion.div>

          {/* Password Input */}
          <motion.div className="relative" initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.4 }}>
            <label className="block text-sm font-medium text-gray-300 mb-2">Password</label>
            <input
              type={showPassword ? "text" : "password"}
              className="w-full border border-gray-600 rounded-xl px-5 py-3 pr-12
                         bg-gray-800/50 text-white placeholder-gray-500
                         focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                         transition-colors duration-200"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              disabled={disabled}
            />
            <motion.button
              type="button"
              className="absolute inset-y-0 right-0 top-6 flex items-center pr-4 text-gray-400 hover:text-white transition-colors duration-200 cursor-pointer"
              onClick={togglePasswordVisibility}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
            >
              {showPassword ? <EyeSlashIcon className="w-6 h-6" /> : <EyeIcon className="w-6 h-6" />}
            </motion.button>
          </motion.div>

          {/* Login Button */}
          <motion.button
            type="submit"
            className="w-full py-4 rounded-xl font-bold flex items-center justify-center space-x-2
                       bg-gradient-to-r from-gray-700 to-gray-900 text-white
                       hover:bg-gradient-to-r hover:from-gray-600 hover:to-gray-800
                       transition-colors duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1
                       disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleLogin}
            disabled={disabled}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <AnimatePresence mode="wait">
              {isLoading ? (
                <motion.span key="loading" initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                  Logging in...
                </motion.span>
              ) : (
                <motion.div key="login" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center space-x-2">
                  <span>Login</span>
                  <ArrowRightIcon className="w-5 h-5" />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.button>
          
          <div className="text-center">
            <button
              type="button"
              className="text-sm text-blue-400 hover:text-blue-300 transition-colors"
              onClick={() => setShowRequestModal(true)}
              disabled={disabled}
            >
              Forgot Password or Need Access?
            </button>
          </div>
        </form>

        {/* SSI Maya Product line */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-gray-400 text-xs italic opacity-80">
          A SSI Maya Application
        </div>
      </motion.div>
    );
  }

  // --- Mobile Styling ---
  return (
    <>
      {error && (
        <div className="bg-red-50 text-red-600 text-sm px-3 py-2 rounded mb-4 text-center">
          {error}
        </div>
      )}

      <form onSubmit={handleLogin} className="space-y-4">
        {/* Username Input */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Username</label>
          <input
            type="text"
            className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2
                       text-gray-900 focus:outline-none focus:ring-2 focus:ring-black
                       bg-white transition-all duration-200"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Enter your username"
            disabled={disabled}
          />
        </div>

        {/* Password Input */}
        <div className="relative">
          <label className="block text-sm font-medium text-gray-700">Password</label>
          <input
            type={showPassword ? "text" : "password"}
            className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 pr-10
                       text-gray-900 focus:outline-none focus:ring-2 focus:ring-black
                       bg-white transition-all duration-200"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter your password"
            disabled={disabled}
          />
          <button
            type="button"
            className="absolute inset-y-0 right-0 top-6 flex items-center pr-3 text-gray-400 hover:text-gray-700 cursor-pointer"
            onClick={togglePasswordVisibility}
          >
            {showPassword ? <EyeSlashIcon className="w-5 h-5" /> : <EyeIcon className="w-5 h-5" />}
          </button>
        </div>

        {/* Login Button */}
        <button
          type="submit"
          className="w-full bg-black text-white py-2.5 rounded-lg font-medium
                     hover:bg-gray-800 transition-colors
                     disabled:opacity-50 disabled:cursor-not-allowed
                     transition-all duration-200 cursor-pointer"
          disabled={disabled}
          onClick={handleLogin}
        >
          {isLoading ? "Logging in..." : "Login"}
        </button>
      </form>
    </>
  );
}