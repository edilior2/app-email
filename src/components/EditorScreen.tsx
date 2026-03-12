import React from 'react';
import {
  ArrowLeft,
  Send,
  Eye,
  Code,
  X,
  Save,
  Trash2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '@/src/lib/utils';
import { apiFetch } from '@/src/lib/api';

import { EmailTemplate } from '../types';

interface EditorScreenProps {
  template: EmailTemplate | null;
  onSave: (template: EmailTemplate, redirectHome?: boolean) => void;
  onDelete: (id: string) => void;
  onBack: () => void;
  categories?: string[];
}

export const EditorScreen: React.FC<EditorScreenProps> = ({ template, onSave, onDelete, onBack, categories = [] }) => {
  const [htmlBody, setHtmlBody] = React.useState(template?.htmlBody || "<div style='color: blue;'>Hello World!</div>");
  const [designName, setDesignName] = React.useState(template?.title || "");
  const [category, setCategory] = React.useState(template?.category || "");
  const [to, setTo] = React.useState(template?.to || "");
  const [subject, setSubject] = React.useState(template?.subject || "");
  const [showPreview, setShowPreview] = React.useState(false);
  const [isSending, setIsSending] = React.useState(false);
  const [sentSuccess, setSentSuccess] = React.useState(false);
  const [fromEmail, setFromEmail] = React.useState("contato@digitallicencas.com.br");
  const [draftId, setDraftId] = React.useState<string | null>(null);

  React.useEffect(() => {
    apiFetch('/api/settings')
      .then(r => r.json())
      .then(d => {
        if (d.EMAIL_VINCULADO) setFromEmail(d.EMAIL_VINCULADO);
      })
      .catch(() => { });
  }, []);

  const handleSend = async () => {
    if (!to || !subject || !htmlBody) {
      alert("Por favor completa el destinatario (Para), el asunto y el cuerpo del correo.");
      return;
    }
    setIsSending(true);
    setSentSuccess(false);

    // Auto-save as draft if unsaved
    const currentId = template?.id || draftId || Date.now().toString();
    if (!template && !draftId) setDraftId(currentId);

    onSave({
      id: currentId,
      title: designName.trim() || 'Borrador Enviado',
      lastEdited: 'justo ahora',
      category: category.trim() || 'Borradores',
      status: 'draft',
      icon: 'Mail',
      htmlBody,
      to,
      subject
    }, false);

    try {
      const resp = await apiFetch('/api/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ to, subject, htmlBody, templateName: designName.trim() || 'Diseño sin nombre' })
      });
      const data = await resp.json();
      if (resp.ok && data.success) {
        setSentSuccess(true);
        setTimeout(() => setSentSuccess(false), 5000);
      } else {
        alert("Error al enviar: " + (data.error || "Desconocido"));
      }
    } catch (e: any) {
      alert("Error de conexión al enviar el correo: " + e.message);
    } finally {
      setIsSending(false);
    }
  };

  const handleSave = () => {
    if (!designName.trim()) { alert("Asigna un nombre al diseño para guardarlo."); return; }

    const savedTemplate: EmailTemplate = {
      id: template?.id || draftId || Date.now().toString(),
      title: designName,
      lastEdited: 'justo ahora',
      category: category.trim() || 'Marketing',
      status: 'active',
      icon: 'Mail',
      htmlBody,
      to,
      subject
    };

    onSave(savedTemplate, true);
  };

  const handleBackWrapper = () => {
    if (!template && !draftId && (designName.trim() || htmlBody !== "<div style='color: blue;'>Hello World!</div>")) {
      onSave({
        id: Date.now().toString(),
        title: designName.trim() || 'Borrador sin título',
        lastEdited: 'justo ahora',
        category: category.trim() || 'Borradores',
        status: 'draft',
        icon: 'Mail',
        htmlBody,
        to,
        subject
      }, true);
    } else {
      onBack();
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="flex flex-col min-h-screen bg-white dark:bg-background-dark"
    >
      <header className="sticky top-0 z-10 flex items-center border-b border-primary/10 px-4 py-4 bg-white dark:bg-background-dark">
        <button
          onClick={handleBackWrapper}
          className="p-2 -ml-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h2 className="flex-1 text-lg font-bold text-center pr-8">Enviar Correo HTML</h2>
      </header>

      <main className="flex-1 overflow-y-auto px-4 py-6 space-y-6 max-w-xl mx-auto w-full">
        <div className="space-y-2">
          <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 ml-1">Nombre del Diseño</label>
          <input
            type="text"
            value={designName}
            onChange={(e) => setDesignName(e.target.value)}
            placeholder="Mi diseño increíble"
            className="w-full h-14 px-4 rounded-xl border border-primary/20 bg-white dark:bg-primary/5 focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all outline-none"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 ml-1">Etiqueta</label>
          <input
            type="text"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            placeholder="Ej: Marketing, Ventas, etc."
            list="default-categories"
            className="w-full h-14 px-4 rounded-xl border border-primary/20 bg-white dark:bg-primary/5 focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all outline-none"
          />
          <datalist id="default-categories">
            {categories.map((cat, i) => (
              <option key={i} value={cat} />
            ))}
          </datalist>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 ml-1">De</label>
          <input
            type="email"
            value={fromEmail}
            readOnly
            disabled
            className="w-full h-14 px-4 rounded-xl border border-primary/20 bg-slate-100 dark:bg-slate-800 text-slate-500 cursor-not-allowed outline-none font-medium"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 ml-1">Para</label>
          <input
            type="email"
            value={to}
            onChange={(e) => setTo(e.target.value)}
            placeholder="destinatario@ejemplo.com"
            className="w-full h-14 px-4 rounded-xl border border-primary/20 bg-white dark:bg-primary/5 focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all outline-none"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 ml-1">Asunto</label>
          <input
            type="text"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="Ingresa el asunto del correo"
            className="w-full h-14 px-4 rounded-xl border border-primary/20 bg-white dark:bg-primary/5 focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all outline-none"
          />
        </div>

        <div className="space-y-2">
          <div className="flex justify-between items-center ml-1">
            <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Cuerpo HTML</label>
            <button
              onClick={() => setHtmlBody('')}
              className="text-primary text-xs font-bold uppercase tracking-wider hover:opacity-80 flex items-center gap-1"
            >
              <Code className="w-3 h-3" /> Limpiar
            </button>
          </div>
          <textarea
            value={htmlBody}
            onChange={(e) => setHtmlBody(e.target.value)}
            className="w-full min-h-[240px] p-4 rounded-xl border border-primary/20 bg-white dark:bg-primary/5 focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all font-mono text-sm leading-relaxed resize-none outline-none"
            placeholder="<div style='color: blue;'>Hello World!</div>"
          />
        </div>

        <div className="pt-2">
          <button
            onClick={() => setShowPreview(true)}
            className="w-full flex items-center justify-center gap-2 bg-primary/10 dark:bg-primary/20 text-primary font-semibold py-3.5 rounded-xl border border-primary/30 hover:bg-primary/20 transition-colors"
          >
            <Eye className="w-5 h-5" />
            Vista Previa
          </button>
        </div>
      </main>

      <footer className="p-4 bg-white dark:bg-background-dark border-t border-primary/10">
        <div className="flex gap-3 max-w-xl mx-auto w-full">
          <button
            onClick={handleSave}
            className="flex-1 bg-primary/10 dark:bg-primary/20 hover:bg-primary/20 text-primary font-bold py-3.5 rounded-xl shadow-sm flex items-center justify-center gap-2 active:scale-[0.98] transition-all"
          >
            <Save className="w-5 h-5 flex-shrink-0" />
            <span>Guardar</span>
          </button>
          <button
            disabled={isSending}
            onClick={handleSend}
            className={cn(
              "flex-1 text-white font-bold py-3.5 rounded-xl shadow-lg flex items-center justify-center gap-2 transition-all",
              sentSuccess ? "bg-emerald-500 shadow-emerald-500/20 pointer-events-none" : "bg-primary hover:bg-primary/90 shadow-primary/20 active:scale-[0.98]",
              isSending && "opacity-70 pointer-events-none"
            )}
          >
            <Send className={cn("w-5 h-5 flex-shrink-0", isSending && "animate-pulse")} />
            <span>{isSending ? "Enviando..." : sentSuccess ? "¡Enviado!" : "Enviar"}</span>
          </button>

          {template && (
            <button
              onClick={() => onDelete(template.id)}
              className="w-14 bg-red-100 hover:bg-red-200 dark:bg-red-500/10 dark:hover:bg-red-500/20 text-red-600 font-bold py-3.5 rounded-xl shadow-sm flex items-center justify-center flex-shrink-0 active:scale-[0.98] transition-all"
            >
              <Trash2 className="w-5 h-5" />
            </button>
          )}
        </div>
        <div className="h-6"></div>
      </footer>
      <AnimatePresence>
        {showPreview && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed inset-0 z-50 bg-white dark:bg-background-dark flex flex-col"
          >
            <header className="flex items-center justify-between px-4 py-4 border-b border-primary/10 bg-white dark:bg-background-dark">
              <h2 className="text-lg font-bold text-slate-800 dark:text-slate-200">Vista Previa</h2>
              <button
                onClick={() => setShowPreview(false)}
                className="p-2 -mr-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                aria-label="Close Preview"
              >
                <X className="w-6 h-6 text-slate-500 dark:text-slate-400" />
              </button>
            </header>
            <div className="flex-1 bg-slate-100 dark:bg-slate-900 p-4 md:p-8 overflow-y-auto">
              <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden h-full flex flex-col">
                <iframe
                  title="Email Preview"
                  srcDoc={htmlBody}
                  className="w-full h-full flex-1 border-0"
                  sandbox="allow-same-origin"
                />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};
