"use client";

import { useState, useEffect } from "react";
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
  Clock
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
    twoFactor: "Two-Factor Authentication",
    twoFactorDesc: "Enable 2FA for enhanced account security.",
    deleteAccount: "Delete Account",
    sessionInfo: "You logged in today active session",
    language: "Display Language",
    toastSaved: "Changes saved successfully!",
    toastEmail: "Request sent to Admin.",
    modalTitle: "Delete Account?",
    modalDesc: "This action cannot be undone. All your data will be permanently removed.",
    confirmDelete: "Yes, Delete My Account",
    cancel: "Cancel"
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
    twoFactor: "Autenticación en Dos Pasos",
    twoFactorDesc: "Habilita 2FA para mayor seguridad.",
    deleteAccount: "Eliminar Cuenta",
    sessionInfo: "Iniciaste sesión hoy sesión activa",
    language: "Idioma de Visualización",
    toastSaved: "¡Cambios guardados con éxito!",
    toastEmail: "Solicitud enviada al Administrador.",
    modalTitle: "¿Eliminar Cuenta?",
    modalDesc: "Esta acción no se puede deshacer. Todos tus datos serán eliminados.",
    confirmDelete: "Sí, Eliminar Cuenta",
    cancel: "Cancelar"
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
    twoFactor: "Authentification à Deux Facteurs",
    twoFactorDesc: "Activez 2FA pour plus de sécurité.",
    deleteAccount: "Supprimer le Compte",
    sessionInfo: "Vous êtes connecté aujourd'hui session active",
    language: "Langue d'affichage",
    toastSaved: "Modifications enregistrées !",
    toastEmail: "Demande envoyée à l'administrateur.",
    modalTitle: "Supprimer le compte ?",
    modalDesc: "Cette action est irréversible. Toutes vos données seront supprimées.",
    confirmDelete: "Oui, Supprimer",
    cancel: "Annuler"
  }
};

type LangKey = 'en' | 'es' | 'fr';

// --- Toggle Component ---
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
        className="bg-white w-4 h-4 rounded-full shadow-md"
        style={{ originY: 0.5 }}
      />
    </div>
  </div>
);

// --- Input Field Component ---
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

export default function ProfilePage() {
  const { user } = useAuth();
  const [profileData, setProfileData] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  // State
  const [lang, setLang] = useState<LangKey>('en');
  const t = translations[lang]; // Helper for current language

  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [showSuccessToast, setShowSuccessToast] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string>("");
  const [showDeleteModal, setShowDeleteModal] = useState<boolean>(false);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);
  
  // Settings
  const [isEmailEnabled, setIsEmailEnabled] = useState<boolean>(true);
  const [isTwoFactorEnabled, setIsTwoFactorEnabled] = useState<boolean>(false);
  const [isAutosaveEnabled, setIsAutosaveEnabled] = useState<boolean>(true);

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
    setToastMessage(t.toastSaved);
    setShowSuccessToast(true);
    setTimeout(() => setShowSuccessToast(false), 3000);
  };

  const confirmDeleteAccount = async () => {
    if (isDeleting) return;
    setIsDeleting(true);
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setIsDeleting(false);
    setShowDeleteModal(false);
    setToastMessage(t.toastEmail);
    setShowSuccessToast(true);
    setTimeout(() => setShowSuccessToast(false), 4000);
  };

  useEffect(() => {
    async function fetchProfileData() {
      if (!user) { setIsLoading(false); setError("User not authenticated."); return; }
      try {
        const userId = (user as any)._id || (user as any).id || (user as any).uid;
        if (!userId) { setIsLoading(false); setError("User ID not found."); return; }
        const response = await fetch(`/api/user?userId=${userId}`);
        if (!response.ok) throw new Error(`Failed to fetch profile`);
        const data = await response.json();
        setProfileData(data.data);
      } catch (err: any) { setError(err.message); } 
      finally { setTimeout(() => setIsLoading(false), 500); }
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

            {/* REMOVED Full Stack Developer Text here */}
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

                            <ToggleSwitch 
                                label={t.emailNotif}
                                description={t.emailDesc}
                                checked={isEmailEnabled} 
                                onChange={() => setIsEmailEnabled(!isEmailEnabled)} 
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
                    <div className="bg-gray-50/50 rounded-2xl border border-gray-100 p-1 mb-4">
                        <div className="bg-white rounded-xl border border-gray-200 shadow-sm px-4 py-1">
                             <ToggleSwitch 
                                label={t.twoFactor} 
                                description={t.twoFactorDesc}
                                checked={isTwoFactorEnabled} 
                                onChange={() => setIsTwoFactorEnabled(!isTwoFactorEnabled)} 
                            />
                        </div>
                    </div>
                    
                    {/* --- Login History Notification (Replaced Button) --- */}
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

      {/* --- Warning Modal --- */}
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

      {/* --- Success Toast --- */}
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