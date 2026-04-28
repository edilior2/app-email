import React, { useEffect, useState } from 'react';
import { ArrowLeft, Save, Palette, Key, Mail } from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '@/src/lib/utils';
import { apiFetch } from '@/src/lib/api';

interface SettingsScreenProps {
    onBack: () => void;
}

export const SettingsScreen: React.FC<SettingsScreenProps> = ({ onBack }) => {
    const [apiKey, setApiKey] = useState('');
    const [email, setEmail] = useState('');
    const [publicUrl, setPublicUrl] = useState('');
    const [themeMode, setThemeMode] = useState('dark');
    const [isSaving, setIsSaving] = useState(false);
    const [saveSuccess, setSaveSuccess] = useState(false);

    useEffect(() => {
        apiFetch('/api/settings')
            .then(res => res.json())
            .then(data => {
                if (data.RESEND_API_KEY) setApiKey(data.RESEND_API_KEY);
                if (data.EMAIL_VINCULADO) setEmail(data.EMAIL_VINCULADO);
                if (data.PUBLIC_URL) setPublicUrl(data.PUBLIC_URL);
                if (data.THEME_MODE) setThemeMode(data.THEME_MODE);
            })
            .catch(err => console.error("Error loading settings:", err));
    }, []);

    const handleSave = async () => {
        setIsSaving(true);
        setSaveSuccess(false);
        try {
            const resp = await apiFetch('/api/settings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    EMAIL_VINCULADO: email,
                    PUBLIC_URL: publicUrl,
                    THEME_MODE: themeMode
                })
            });
            if (resp.ok) {
                setSaveSuccess(true);
                document.documentElement.classList.toggle('dark', themeMode === 'dark');
                setTimeout(() => setSaveSuccess(false), 3000);
            }
        } catch (e) {
            alert("Error al guardar la configuración.");
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="flex flex-col min-h-screen bg-[#f6f7f8] dark:bg-background-dark"
        >
            <header className="sticky top-0 z-10 flex items-center bg-white dark:bg-background-dark p-4 pb-4 border-b border-slate-200 dark:border-slate-800">
                <button
                    onClick={onBack}
                    className="flex size-10 items-center justify-center rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
                >
                    <ArrowLeft className="w-6 h-6" />
                </button>
                <h2 className="text-lg font-bold tracking-tight flex-1 px-4">Configuración</h2>
            </header>

            <main className="flex-1 p-4 max-w-2xl mx-auto w-full pb-24 space-y-8 mt-4">

                <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 space-y-6 shadow-sm">
                    <div className="flex items-center gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
                        <div className="p-2 bg-primary/10 text-primary rounded-lg">
                            <Key className="w-5 h-5" />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold">API de Resend</h3>
                            <p className="text-sm text-slate-500">Configura tus credenciales para enviar correos.</p>
                        </div>
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 ml-1">RESEND_API_KEY</label>
                        <input
                            type="password"
                            value={apiKey}
                            readOnly
                            disabled
                            placeholder="re_xxxxxxxxxxxxxxxxx"
                            className="w-full h-12 px-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 text-slate-500 cursor-not-allowed outline-none font-medium"
                        />
                    </div>
                </section>

                <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 space-y-6 shadow-sm">
                    <div className="flex items-center gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
                        <div className="p-2 bg-emerald-500/10 text-emerald-500 rounded-lg">
                            <Mail className="w-5 h-5" />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold">Remitente Predeterminado</h3>
                            <p className="text-sm text-slate-500">¿De quién llegarán los correos?</p>
                        </div>
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 ml-1">Email Vinculado</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="contato@digitallicencas.com.br"
                            className="w-full h-12 px-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all outline-none"
                        />
                    </div>
                </section>

                <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 space-y-6 shadow-sm">
                    <div className="flex items-center gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
                        <div className="p-2 bg-blue-500/10 text-blue-500 rounded-lg">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" /></svg>
                        </div>
                        <div>
                            <h3 className="text-lg font-bold">Enlace Público de la App</h3>
                            <p className="text-sm text-slate-500">URL pública donde alojas esta app (usado para desuscripciones).</p>
                        </div>
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 ml-1">URL Pública (Opcional)</label>
                        <input
                            type="url"
                            value={publicUrl}
                            onChange={(e) => setPublicUrl(e.target.value)}
                            placeholder="https://mi-app-email.up.railway.app"
                            className="w-full h-12 px-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all outline-none"
                        />
                    </div>
                </section>

                <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 space-y-6 shadow-sm">
                    <div className="flex items-center gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
                        <div className="p-2 bg-orange-500/10 text-orange-500 rounded-lg">
                            <Palette className="w-5 h-5" />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold">Apariencia</h3>
                            <p className="text-sm text-slate-500">Personaliza la interfaz de la aplicación.</p>
                        </div>
                    </div>
                    <div className="space-y-2">
                        <div className="flex items-center justify-between bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-200 dark:border-slate-700 mt-2">
                            <span className="font-semibold text-slate-700 dark:text-slate-300">Modo Claro</span>
                            <button
                                onClick={() => setThemeMode(themeMode === 'dark' ? 'light' : 'dark')}
                                className={cn(
                                    "relative inline-flex h-6 w-11 items-center rounded-full transition-colors",
                                    themeMode === 'light' ? "bg-amber-400" : "bg-slate-300 dark:bg-slate-600"
                                )}
                            >
                                <span
                                    className={cn(
                                        "inline-block h-4 w-4 transform rounded-full bg-white transition-transform",
                                        themeMode === 'light' ? "translate-x-6" : "translate-x-1"
                                    )}
                                />
                            </button>
                        </div>
                    </div>
                </section>

            </main>

            <footer className="p-4 bg-white dark:bg-background-dark border-t border-slate-200 dark:border-slate-800 sticky bottom-0">
                <div className="max-w-2xl mx-auto w-full">
                    <button
                        disabled={isSaving}
                        onClick={handleSave}
                        className={cn(
                            "w-full text-white font-bold py-3.5 rounded-xl shadow-lg flex items-center justify-center gap-2 transition-all",
                            saveSuccess ? "bg-emerald-500 shadow-emerald-500/20" : "bg-primary hover:bg-primary/90 shadow-primary/20 active:scale-[0.98]",
                            isSaving && "opacity-70 pointer-events-none"
                        )}
                    >
                        <Save className="w-5 h-5" />
                        <span>{isSaving ? "Guardando..." : saveSuccess ? "¡Guardado!" : "Guardar Cambios"}</span>
                    </button>
                </div>
            </footer>
        </motion.div>
    );
};
