"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  User,
  Calendar,
  Lock,
  Bell,
  Check,
  Save,
  Loader2,
  Shield,
  ShieldAlert,
  Camera,
  AlertTriangle,
  Globe,
  Clock,
  Mail,
  Send,
  X,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Plus_Jakarta_Sans, Inter } from 'next/font/google';
import clsx from 'clsx';

// --- Typography ---
const fontHeading = Plus_Jakarta_Sans({ 
  subsets: ['latin'], 
  weight: ['600', '700'],
  display: 'swap',
});

const fontBody = Inter({ 
  subsets: ['latin'], 
  weight: ['400', '500', '600'],
  display: 'swap',
});

interface UserProfile {
  _id: string;
  username: string;
  password?: string;
  createdAt: string;
  updatedAt: string;
}

// --- 🌍 Translation Data ---
const translations = {
  en: {
    joined: "Joined",
    status: "Status",
    verified: "Verified Account",
    save: "Save Changes",
    saving: "Saving...",
    accountInfo: "Account Information",
    username: "Username",
    password: "Password",
    systemPref: "System & Language",
    emailNotif: "Email Notifications",
    emailDesc: "Receive security alerts via email.",
    autoSave: "Auto-Save Progress",
    autoSaveDesc: "Automatically save changes as you work.",
    security: "Security",
    deleteAccount: "Delete Account",
    sessionInfo: "You logged in today active session",
    language: "Display Language",
    toastSaved: "Changes saved successfully!",
    toastEmail: "Request sent to Admin.",
    modalTitle: "Delete Account?",
    modalDesc: "This action cannot be undone. All your data will be permanently removed.",
    confirmDelete: "Yes, Delete My Account",
    cancel: "Cancel",
    // Development Feature Placeholder
    featureDevTitle: "Two-Factor Authentication (2FA)",
    featureDevDesc: "This feature is currently under active development. We will notify you when 2FA is ready to be enabled for enhanced security.",
    // Setup Section
    emailSetupTitle: "Configure Email Alerts",
    emailSetupDesc: "Enter the email address where you want to receive critical security and login alerts.",
    sendRequest: "Send Setup Request",
    requestSent: "Request Sent! Please check your email/phone."
  },
  es: {
    joined: "Se unió",
    status: "Estado",
    verified: "Cuenta Verificada",
    save: "Guardar Cambios",
    saving: "Guardando...",
    accountInfo: "Información de la Cuenta",
    username: "Usuario",
    password: "Contraseña",
    systemPref: "Sistema e Idioma",
    emailNotif: "Notificaciones por Correo",
    emailDesc: "Recibe alertas de seguridad.",
    autoSave: "Guardado Automático",
    autoSaveDesc: "Guarda cambios automáticamente.",
    security: "Seguridad",
    deleteAccount: "Eliminar Cuenta",
    sessionInfo: "Iniciaste sesión hoy sesión activa",
    language: "Idioma de Visualización",
    toastSaved: "¡Cambios guardados con éxito!",
    toastEmail: "Solicitud enviada al Administrador.",
    modalTitle: "¿Eliminar Cuenta?",
    modalDesc: "Esta acción no se puede deshacer. Todos tus datos serán eliminados.",
    confirmDelete: "Sí, Eliminar Cuenta",
    cancel: "Cancelar",
    // Development Feature Placeholder
    featureDevTitle: "Autenticación en Dos Pasos (2FA)",
    featureDevDesc: "Esta característica se encuentra actualmente en desarrollo activo. Le notificaremos cuando 2FA esté listo para ser habilitado para una seguridad mejorada.",
    // Setup Section
    emailSetupTitle: "Configurar Alertas por Correo",
    emailSetupDesc: "Introduce la dirección de correo electrónico donde deseas recibir alertas críticas de seguridad y de inicio de sesión.",
    sendRequest: "Enviar Solicitud de Configuración",
    requestSent: "¡Solicitud Enviada! Por favor, revisa tu correo/teléfono."
  },
  fr: {
    joined: "Rejoint",
    status: "Statut",
    verified: "Compte Vérifié",
    save: "Sauvegarder",
    saving: "Enregistrement...",
    accountInfo: "Informations du Compte",
    username: "Nom d'utilisateur",
    password: "Mot de passe",
    systemPref: "Système et Langue",
    emailNotif: "Notifications par Email",
    emailDesc: "Recevoir des alertes de sécurité.",
    autoSave: "Sauvegarde Automatique",
    autoSaveDesc: "Sauvegarde automatique des modifications.",
    security: "Sécurité",
    deleteAccount: "Supprimer le Compte",
    sessionInfo: "Vous êtes connecté aujourd'hui session active",
    language: "Langue d'affichage",
    toastSaved: "Modifications enregistrées !",
    toastEmail: "Demande envoyée à l'administrateur.",
    modalTitle: "Supprimer le compte ?",
    modalDesc: "Cette action est irréversible. Toutes vos données seront supprimées.",
    confirmDelete: "Oui, Supprimer",
    cancel: "Annuler",
    // Development Feature Placeholder
    featureDevTitle: "Authentification à Deux Facteurs (2FA)",
    featureDevDesc: "Cette fonctionnalité est en cours de développement actif. Nous vous informerons lorsque la 2FA sera prête à être activée pour une sécurité renforcée.",
    // Setup Section
    emailSetupTitle: "Configurer les Alertes Email",
    emailSetupDesc: "Entrez l'adresse e-mail où vous souhaitez recevoir les alertes de sécurité et de connexion critiques.",
    sendRequest: "Envoyer la Demande de Configuration",
    requestSent: "Demande Envoyée ! Veuillez vérifier votre email/téléphone."
  }
};

type LangKey = 'en' | 'es' | 'fr';

// --- Toggle Component (No change) ---
const ToggleSwitch = ({ label, description, checked, onChange }: { label: string, description?: string, checked: boolean, onChange: () => void }) => (
  <div className="flex items-center justify-between group cursor-pointer py-1" onClick={onChange}>
    <div className="flex flex-col pr-4">
        <span className="text-sm font-semibold text-gray-700 group-hover:text-gray-900 transition-colors cursor-pointer">{label}</span>
        {description && <span className="text-[11px] text-gray-400 font-medium mt-0.5 cursor-pointer">{description}</span>}
    </div>
    
    <div 
      className={clsx(
        "w-11 h-6 flex items-center rounded-full p-1 transition-colors duration-300 ease-in-out shrink-0 cursor-pointer",
        checked ? "bg-indigo-600" : "bg-gray-200"
      )}
    >
      <motion.div 
        layout
        transition={{ type: "spring", stiffness: 700, damping: 30 }}
        className={clsx(
          "bg-white w-4 h-4 rounded-full shadow-md",
          checked ? "translate-x-5" : "translate-x-0"
        )}
        style={{ originY: 0.5 }}
      />
    </div>
  </div>
);

// --- Input Field Component (No change) ---
const InputField = ({ icon: Icon, label, value, isPassword = false }: any) => {
    const [show, setShow] = useState(false);
    return (
      <div className="space-y-1.5">
          <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">{label}</label>
          <div className="relative group">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-hover:text-indigo-500 transition-colors">
                  <Icon size={16} />
              </div>
              <input 
                  type={isPassword && !show ? "password" : "text"}
                  value={value}
                  readOnly
                  className="w-full pl-10 pr-10 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all cursor-text"
              />
               {isPassword && (
                   <button 
                       onClick={() => setShow(!show)}
                       className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-gray-400 hover:text-gray-600 cursor-pointer p-1"
                   >
                       {show ? "Hide" : "Show"}
                   </button>
               )}
          </div>
      </div>
    )
}

// --- Setup Section Component (Modified state initialization) ---
interface SetupSectionProps {
    t: typeof translations[LangKey];
    title: string;
    description: string;
    icon: any; // Lucide Icon
    onSetupComplete: (messageKey: keyof typeof translations['en']) => void;
    // Removed placeholderValue prop as it's no longer used for initial state
    placeholderIcon: any;
    isEnabled: boolean;
    onClose: () => void;
}

const SetupSection = ({ t, title, description, icon: Icon, onSetupComplete, placeholderIcon: PlaceholderIcon, isEnabled, onClose }: SetupSectionProps) => {
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    // Set initial input value to empty string to ensure no placeholder text
    const [inputValue, setInputValue] = useState(""); 

    // Use useEffect to clear the input value when the section becomes visible, 
    // ensuring the user starts with a clean slate.
    useEffect(() => {
        if (isEnabled) {
            setInputValue("");
        }
    }, [isEnabled]);


    const handleSubmit = async () => {
        setIsSubmitting(true);
        // Mock API call
        await new Promise((resolve) => setTimeout(resolve, 1500)); 
        setIsSubmitting(false);
        onSetupComplete('requestSent');
        onClose(); // Close the setup section after success
    };

    return (
        <AnimatePresence>
            {isEnabled && (
                <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                    className="bg-indigo-50/50 rounded-xl border border-indigo-100 p-4 mt-2 overflow-hidden"
                >
                    <div className="flex justify-between items-start mb-2">
                        <div className="flex items-center gap-2">
                            <Icon size={16} className="text-indigo-600" />
                            <h4 className={`text-sm font-bold text-indigo-900 ${fontHeading.className}`}>{title}</h4>
                        </div>
                        <button onClick={onClose} className="p-1 rounded-full text-gray-400 hover:text-gray-700 transition-colors">
                            <X size={14} />
                        </button>
                    </div>

                    <p className="text-xs text-indigo-800 mb-3">{description}</p>
                    
                    {/* Input Field */}
                    <div className="relative mb-4">
                        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                            <PlaceholderIcon size={16} />
                        </div>
                        <input 
                            type="text"
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 bg-white border border-indigo-200 rounded-lg text-sm font-medium text-gray-700 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all"
                            // Using a proper placeholder attribute now that the value is empty
                            placeholder="Enter your email address" 
                        />
                    </div>

                    <button
                        onClick={handleSubmit}
                        disabled={isSubmitting}
                        className="w-full py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold transition-colors flex items-center justify-center gap-2 active:scale-[0.98]"
                    >
                        {isSubmitting ? <Loader2 className="animate-spin w-4 h-4" /> : <Send className="w-4 h-4" />}
                        <span>{isSubmitting ? t.saving : t.sendRequest}</span>
                    </button>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default function ProfilePage() {
  const { user } = useAuth();
  const [profileData, setProfileData] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  // State
  const [lang, setLang] = useState<LangKey>('en');
  const t = useMemo(() => translations[lang], [lang]); // Helper for current language

  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [showSuccessToast, setShowSuccessToast] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string>("");
  const [showDeleteModal, setShowDeleteModal] = useState<boolean>(false);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);
  
  // Settings (defaulted to off/false)
  const [isEmailEnabled, setIsEmailEnabled] = useState<boolean>(false); 
  const [isAutosaveEnabled, setIsAutosaveEnabled] = useState<boolean>(false); 
  
  // SETUP State
  const [showEmailSetup, setShowEmailSetup] = useState<boolean>(false);

  // Helper function to show toast
  const showToast = useCallback((message: string) => {
    setToastMessage(message);
    setShowSuccessToast(true);
    setTimeout(() => setShowSuccessToast(false), 4000);
  }, []);

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return isNaN(date.getTime()) ? "N/A" : new Intl.DateTimeFormat(lang === 'en' ? "en-US" : lang === 'es' ? "es-ES" : "fr-FR", { year: "numeric", month: "short", day: "numeric" }).format(date);
    } catch { return "N/A"; }
  };

  const handleSaveChanges = async () => {
    if (isSaving) return;
    setIsSaving(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setIsSaving(false);
    showToast(t.toastSaved);
  };
  
  const handleSetupComplete = (messageKey: keyof typeof translations['en']) => {
    showToast(t[messageKey]);
  };
  
  // Function to toggle email settings and show setup section
  const toggleEmailSettings = () => {
      // If currently OFF (false), turning ON (true), so show the setup section. 
      // If currently ON (true), turning OFF (false), so hide it.
      if (!isEmailEnabled) {
          setShowEmailSetup(true);
      } else {
          setShowEmailSetup(false);
      }
      setIsEmailEnabled(!isEmailEnabled);
  };
  
  // Function to close the email setup section
  const closeEmailSetup = () => {
      setShowEmailSetup(false);
      // If user closes setup while it's "enabled", revert the main toggle state (as setup wasn't complete)
      if (isEmailEnabled) setIsEmailEnabled(false);
  };


  const confirmDeleteAccount = async () => {
    if (isDeleting) return;
    setIsDeleting(true);
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setIsDeleting(false);
    setShowDeleteModal(false);
    showToast(t.toastEmail);
  };

  useEffect(() => {
    async function fetchProfileData() {
      if (!user) { setIsLoading(false); setError("User not authenticated."); return; }
      try {
        // Mock fetch with default values if user data is minimal/null
        const mockUser: UserProfile = {
            _id: "u12345",
            username: (user as any).username || "JaneDoe_99",
            password: "defaultpassword",
            createdAt: "2024-01-15T10:00:00Z",
            updatedAt: new Date().toISOString(),
        }
        
        // Simulating a network delay and data fetch
        await new Promise((resolve) => setTimeout(resolve, 500));

        setProfileData(mockUser);
        
      } catch (err: any) { 
          // Keep fetch mock logic simple
          setError("Failed to fetch mock user data."); 
      } 
      finally { 
          setIsLoading(false); 
      }
    }
    fetchProfileData();
  }, [user]);

  if (isLoading) return <div className="h-screen flex items-center justify-center bg-[#F3F4F6]"><Loader2 className="w-8 h-8 animate-spin text-indigo-500" /></div>;
  if (error) return <div className="h-screen flex items-center justify-center bg-[#F3F4F6] text-red-500 flex-col gap-2"><ShieldAlert size={32} /><span>{error}</span></div>;

  return (
    <main className={`min-h-screen w-full bg-[#F3F4F6] flex items-center justify-center p-4 sm:p-8 ${fontBody.className}`}>
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="w-full max-w-5xl bg-white rounded-3xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)] overflow-hidden flex flex-col md:flex-row min-h-[600px] border border-white/50 relative z-10"
      >
        
        {/* --- LEFT SIDE: Identity --- */}
        <div className="w-full md:w-80 bg-slate-50 border-r border-gray-100 p-8 flex flex-col items-center text-center relative shrink-0">
            <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-indigo-50 to-transparent opacity-50" />
            

            <div className="relative z-10 mt-4 group cursor-pointer">
                <div className="w-28 h-28 rounded-full bg-gradient-to-tr from-violet-600 to-indigo-500 p-1 shadow-xl shadow-indigo-200">
                    <div className="w-full h-full rounded-full bg-white flex items-center justify-center text-4xl font-bold text-indigo-600 overflow-hidden relative">
                        {profileData?.username?.charAt(0).toUpperCase()}
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                            <Camera className="text-white w-6 h-6" />
                        </div>
                    </div>
                </div>
                <div className="absolute bottom-1 right-1 w-6 h-6 bg-emerald-500 border-4 border-slate-50 rounded-full" />
            </div>

            <h2 className={`mt-5 text-xl font-bold text-gray-900 ${fontHeading.className}`}>{profileData?.username}</h2>

            <div className="mt-8 w-full space-y-3">
                <div className="bg-white p-3 rounded-xl border border-gray-200/60 shadow-sm flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                        <Calendar size={14} />
                    </div>
                    <div className="text-left">
                        <p className="text-[10px] uppercase font-bold text-gray-400">{t.joined}</p>
                        <p className="text-xs font-semibold text-gray-700">{formatDate(profileData?.createdAt || "")}</p>
                    </div>
                </div>
                
                <div className="bg-white p-3 rounded-xl border border-gray-200/60 shadow-sm flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                        <Shield size={14} />
                    </div>
                    <div className="text-left">
                        <p className="text-[10px] uppercase font-bold text-gray-400">{t.status}</p>
                        <p className="text-xs font-semibold text-gray-700">{t.verified}</p>
                    </div>
                </div>
            </div>

            <div className="mt-auto pt-8 w-full">
                <button 
                    onClick={handleSaveChanges}
                    disabled={isSaving}
                    className="w-full py-3 rounded-xl bg-gray-900 hover:bg-black text-white text-sm font-bold shadow-lg shadow-gray-200 hover:shadow-xl transition-all active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
                >
                    {isSaving ? <Loader2 className="animate-spin w-4 h-4" /> : <Save className="w-4 h-4" />}
                    <span>{isSaving ? t.saving : t.save}</span>
                </button>
            </div>
        </div>

        {/* --- RIGHT SIDE: Content --- */}
        <div className="flex-1 bg-white p-6 sm:p-10 overflow-y-auto custom-scrollbar">
            <div className="max-w-xl mx-auto space-y-10">
                
                {/* Account Info */}
                <section>
                    <div className="flex items-center gap-2 mb-5">
                        <User className="w-4 h-4 text-indigo-500" />
                        <h3 className={`text-sm font-bold text-gray-900 ${fontHeading.className}`}>{t.accountInfo}</h3>
                    </div>
                    <div className="grid grid-cols-1 gap-5">
                        <InputField icon={User} label={t.username} value={profileData?.username} />
                        <InputField icon={Lock} label={t.password} value={profileData?.password || "password123"} isPassword={true} />
                    </div>
                </section>

                <hr className="border-dashed border-gray-200" />

                {/* Preferences & Language */}
                <section>
                    <div className="flex items-center justify-between mb-5">
                        <div className="flex items-center gap-2">
                            <Bell className="w-4 h-4 text-indigo-500" />
                            <h3 className={`text-sm font-bold text-gray-900 ${fontHeading.className}`}>{t.systemPref}</h3>
                        </div>
                    </div>

                    <div className="bg-gray-50/50 rounded-2xl border border-gray-100 p-1 mb-4">
                        <div className="bg-white rounded-xl border border-gray-200 shadow-sm divide-y divide-gray-100 px-4">
                             {/* Language Selector inside the card */}
                             <div className="flex items-center justify-between py-3">
                                <div className="flex items-center gap-2">
                                    <Globe size={16} className="text-gray-400" />
                                    <span className="text-sm font-semibold text-gray-700">{t.language}</span>
                                </div>
                                <select 
                                    value={lang}
                                    onChange={(e) => setLang(e.target.value as LangKey)}
                                    className="bg-gray-50 border border-gray-200 text-gray-700 text-xs font-bold rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block p-2 cursor-pointer outline-none hover:bg-gray-100 transition-colors"
                                >
                                    <option value="en">English (US)</option>
                                    <option value="es">Español</option>
                                    <option value="fr">Français</option>
                                </select>
                             </div>

                             {/* Email Notifications Toggle */}
                            <ToggleSwitch 
                                label={t.emailNotif}
                                description={t.emailDesc}
                                checked={isEmailEnabled} 
                                onChange={toggleEmailSettings} 
                            />
                            
                            {/* NEW: Email Setup Section */}
                            <SetupSection
                                t={t}
                                title={t.emailSetupTitle}
                                description={t.emailSetupDesc}
                                icon={Mail}
                                onSetupComplete={handleSetupComplete}
                                placeholderIcon={Mail}
                                isEnabled={isEmailEnabled && showEmailSetup}
                                onClose={closeEmailSetup}
                            />
                            
                             <ToggleSwitch 
                                label={t.autoSave}
                                description={t.autoSaveDesc}
                                checked={isAutosaveEnabled} 
                                onChange={() => setIsAutosaveEnabled(!isAutosaveEnabled)} 
                            />
                        </div>
                    </div>
                </section>

                {/* Security */}
                <section>
                    <div className="flex items-center gap-2 mb-5">
                        <Shield className="w-4 h-4 text-indigo-500" />
                        <h3 className={`text-sm font-bold text-gray-900 ${fontHeading.className}`}>{t.security}</h3>
                    </div>
                    
                    {/* --- FEATURE UNDER DEVELOPMENT PANEL (Replaces 2FA) --- */}
                    <div className="bg-amber-50/50 border border-amber-100 rounded-xl p-3 flex items-start gap-3 mb-4">
                        <div className="bg-amber-100 p-1.5 rounded-full mt-0.5 shrink-0">
                            <AlertTriangle size={14} className="text-amber-600" />
                        </div>
                        <div>
                            <p className="text-sm font-bold text-amber-900">{t.featureDevTitle}</p>
                            <span className="text-xs font-medium text-amber-800">
                               {t.featureDevDesc}
                            </span>
                        </div>
                    </div>

                    {/* --- Login History Notification (No change) --- */}
                    <div className="bg-indigo-50/50 border border-indigo-100 rounded-xl p-3 flex items-center gap-3 mb-4">
                        <div className="bg-indigo-100 p-1.5 rounded-full">
                            <Clock size={14} className="text-indigo-600" />
                        </div>
                        <span className="text-xs font-medium text-indigo-900">
                           {t.sessionInfo}
                        </span>
                    </div>

                      <div className="mt-2">
                        <button 
                            onClick={() => setShowDeleteModal(true)}
                            className="w-full py-2.5 rounded-xl border border-red-100 bg-red-50 text-xs font-bold text-red-600 hover:bg-red-100 hover:border-red-200 transition-all cursor-pointer"
                        >
                            {t.deleteAccount}
                        </button>
                    </div>
                </section>

            </div>
        </div>

      </motion.div>

      {/* --- Warning Modal (No change) --- */}
      <AnimatePresence>
        {showDeleteModal && (
            <>
                <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={() => !isDeleting && setShowDeleteModal(false)}
                    className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
                />
                
                <motion.div
                    initial={{ opacity: 0, scale: 0.9, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: 20 }}
                    className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-sm px-4"
                >
                    <div className="bg-white rounded-2xl shadow-2xl p-6 border border-gray-100">
                        <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mb-4 mx-auto">
                            <AlertTriangle size={24} />
                        </div>
                        <h3 className={`text-lg font-bold text-center text-gray-900 mb-2 ${fontHeading.className}`}>
                            {t.modalTitle}
                        </h3>
                        <p className="text-sm text-gray-500 text-center mb-6">
                            {t.modalDesc}
                        </p>
                        
                        <div className="flex flex-col gap-3">
                            <button 
                                onClick={confirmDeleteAccount}
                                disabled={isDeleting}
                                className="w-full py-2.5 rounded-xl bg-red-600 text-white font-bold text-sm hover:bg-red-700 transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-red-200"
                            >
                                {isDeleting ? <Loader2 className="animate-spin w-4 h-4" /> : t.confirmDelete}
                            </button>
                            <button 
                                onClick={() => setShowDeleteModal(false)}
                                disabled={isDeleting}
                                className="w-full py-2.5 rounded-xl bg-gray-100 text-gray-700 font-bold text-sm hover:bg-gray-200 transition-colors cursor-pointer"
                            >
                                {t.cancel}
                            </button>
                        </div>
                    </div>
                </motion.div>
            </>
        )}
      </AnimatePresence>

      {/* --- Success Toast (No change) --- */}
      <AnimatePresence>
        {showSuccessToast && (
          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 bg-gray-900 text-white pl-3 pr-5 py-3 rounded-full shadow-2xl flex items-center gap-3"
          >
            <div className="w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center">
              <Check className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="text-sm font-bold">{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}