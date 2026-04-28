import React from 'react';
import {
  ArrowLeft,
  Search,
  Plus,
  Mail,
  ShoppingCart,
  PartyPopper,
  Handshake,
  MoreVertical,
  Send,
  Edit2,
  CheckCircle2,
  XCircle,
  Loader2,
  Trash2,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { EmailTemplate } from '@/src/types';
import { cn } from '@/src/lib/utils';
import { apiFetch } from '@/src/lib/api';

interface TemplatesScreenProps {
  templates: EmailTemplate[];
  onBack: () => void;
  onEdit: (template: EmailTemplate) => void;
  onDelete?: (id: string) => void;
}

const ICON_MAP: Record<string, any> = {
  Mail,
  ShoppingCart,
  PartyPopper,
  Handshake,
};

export const TemplatesScreen: React.FC<TemplatesScreenProps> = ({ templates, onBack, onEdit, onDelete }) => {
  const [activeTab, setActiveTab] = React.useState<'Todas' | 'Borradores' | 'Enviados'>('Todas');
  const [activeFilter, setActiveFilter] = React.useState('Todas');

  const [quickSendId, setQuickSendId] = React.useState<string | null>(null);
  const [quickSendEmail, setQuickSendEmail] = React.useState('');
  const [isSending, setIsSending] = React.useState(false);
  const [sendSuccess, setSendSuccess] = React.useState(false);
  const [sendError, setSendError] = React.useState<string | null>(null);

  const [searchQuery, setSearchQuery] = React.useState('');
  const [showSearch, setShowSearch] = React.useState(false);
  const [enviadosStats, setEnviadosStats] = React.useState<any[]>([]);

  React.useEffect(() => {
    apiFetch('/api/analytics/enviados')
      .then(res => res.json())
      .then(data => {
        const aggregated: any = {};
        data.forEach((row: any) => {
          const name = row.template_name || row.subject || 'Sin Título';
          if (!aggregated[name]) aggregated[name] = { name, count: 0, last10: [] };
          aggregated[name].count++;
          if (aggregated[name].last10.length < 10) {
            aggregated[name].last10.push({ email: row.to_email, date: row.sent_at });
          }
        });
        setEnviadosStats(Object.values(aggregated));
      })
      .catch(err => console.error(err));
  }, []);

  const filters = ['Todas', ...Array.from(new Set(templates.map(t => t.category?.trim()).filter(Boolean)))];

  const handleQuickSend = async (template: EmailTemplate) => {
    if (!quickSendEmail) {
      setSendError("Por favor ingresa un email");
      return;
    }

    setIsSending(true);
    setSendSuccess(false);
    setSendError(null);

    const htmlBody = template.htmlBody || "<p>Plantilla vacía</p>";
    const subject = template.subject || template.title;

    try {
      const resp = await apiFetch('/api/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ to: quickSendEmail, subject, htmlBody, templateName: template.title })
      });
      const data = await resp.json();

      if (resp.ok && data.success) {
        setSendSuccess(true);
        setTimeout(() => {
          // Reset after 3 seconds
          setQuickSendId(null);
          setQuickSendEmail('');
          setSendSuccess(false);
        }, 3000);
      } else {
        setSendError(data.error || "Error desconocido");
      }
    } catch (e: any) {
      setSendError("Error de conexión");
    } finally {
      setIsSending(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="flex flex-col min-h-screen bg-[#f6f7f8] dark:bg-background-dark"
    >
      <header className="sticky top-0 z-10 flex items-center bg-white/80 dark:bg-background-dark/80 backdrop-blur-md p-4 border-b border-slate-200 dark:border-slate-800 justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={onBack}
            className="flex size-10 items-center justify-center rounded-full hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="text-xl font-bold tracking-tight">Plantillas</h1>
        </div>
        <div className="flex items-center gap-4 flex-1 justify-end">
          <AnimatePresence>
            {showSearch && (
              <motion.div
                initial={{ width: 0, opacity: 0 }}
                animate={{ width: 'auto', opacity: 1 }}
                exit={{ width: 0, opacity: 0 }}
                className="overflow-hidden flex-1 flex justify-end"
              >
                <input
                  type="text"
                  placeholder="Buscar plantillas..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full max-w-[200px] h-9 px-3 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                  autoFocus
                />
              </motion.div>
            )}
          </AnimatePresence>
          <button
            onClick={() => {
              setShowSearch(!showSearch);
              if (showSearch) setSearchQuery('');
            }}
            className={cn(
              "flex size-10 items-center justify-center rounded-full transition-colors",
              showSearch ? "bg-primary/10 text-primary" : "hover:bg-slate-200 dark:hover:bg-slate-800"
            )}
          >
            {showSearch ? <XCircle className="w-5 h-5" /> : <Search className="w-5 h-5" />}
          </button>
          <button className="flex size-10 items-center justify-center rounded-full bg-primary text-white shadow-lg shadow-primary/20">
            <Plus className="w-5 h-5" />
          </button>
        </div>
      </header>

      <nav className="bg-white dark:bg-background-dark border-b border-slate-200 dark:border-slate-800">
        <div className="flex px-4 gap-8">
          {['Todas las Plantillas', 'Borradores', 'Enviados'].map((tab) => {
            const label = tab === 'Todas las Plantillas' ? 'Todas' : tab;
            const isActive = activeTab === label;
            return (
              <button
                key={tab}
                onClick={() => setActiveTab(label as any)}
                className={cn(
                  "flex flex-col items-center justify-center border-b-2 pb-3 pt-4 transition-colors",
                  isActive ? "border-primary text-primary" : "border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                )}
              >
                <span className="text-sm font-semibold">{tab}</span>
              </button>
            );
          })}
        </div>
      </nav>

      <div className="flex gap-2 overflow-x-auto px-4 py-3 no-scrollbar">
        {filters.map((filter) => (
          <button
            key={filter}
            onClick={() => setActiveFilter(filter)}
            className={cn(
              "whitespace-nowrap rounded-full px-4 py-1.5 text-xs font-medium transition-colors border",
              activeFilter === filter
                ? "bg-primary text-white border-primary shadow-sm"
                : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:border-primary/50"
            )}
          >
            {filter}
          </button>
        ))}
      </div>

      <main className="flex-1 p-4 max-w-4xl mx-auto w-full pb-24">
        {activeTab !== 'Enviados' ? (
          <>
            <h2 className="text-lg font-bold mb-4">Plantillas de Correo HTML</h2>
            <div className="space-y-4">
              {templates
                .filter(t => (activeFilter === 'Todas' || t.category === activeFilter))
                .filter(t => t.title.toLowerCase().includes(searchQuery.toLowerCase()))
                .filter(t => {
                  if (activeTab === 'Borradores') return t.status === 'draft';
                  if (activeTab === 'Todas') return t.status !== 'draft';
                  return true;
                })
                .map((template) => {

                  const tTitle = template.title.toLowerCase();
                  let brandColor = 'primary';
                  if (tTitle.includes('office') || tTitle.includes('naranja')) brandColor = 'orange';
                  else if (tTitle.includes('adobe') || tTitle.includes('rojo')) brandColor = 'red';
                  else if (tTitle.includes('windows') || tTitle.includes('azul') || tTitle.includes('confirmacion') || tTitle.includes('confirmación')) brandColor = 'blue';
                  else if (tTitle.includes('corel') || tTitle.includes('verde') || tTitle.includes('coreldraw')) brandColor = 'green';

                  const colorClasses = {
                    blue: "bg-blue-500/10 text-blue-500",
                    red: "bg-red-500/10 text-red-500",
                    green: "bg-emerald-500/10 text-emerald-500",
                    orange: "bg-orange-500/10 text-orange-500",
                    primary: "bg-primary/10 text-primary",
                  }[brandColor as 'blue' | 'red' | 'green' | 'orange' | 'primary'];

                  const firstLetter = template.title ? template.title.charAt(0).toUpperCase() : '?';

                  return (
                    <div
                      key={template.id}
                      className="group relative flex flex-col gap-4 bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 p-4 rounded-xl transition-all hover:border-primary/50"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className={cn("size-12 rounded-lg flex items-center justify-center text-xl font-black", colorClasses)}>
                            {firstLetter}
                          </div>
                          <div>
                            <h3 className="font-semibold text-base">{template.title}</h3>
                            <div className="flex items-center gap-2">
                              <p className="text-slate-500 dark:text-slate-400 text-[10px]">Actualizado: {template.lastEdited}</p>
                              <span className={cn(
                                "px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border border-current opacity-80",
                                colorClasses
                              )}>
                                {template.category}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => {
                              if (window.confirm('¿Seguro que deseas eliminar esta plantilla?')) {
                                onDelete?.(template.id);
                                // Optional fast feedback alert
                                const el = document.createElement('div');
                                el.textContent = 'Eliminado';
                                el.className = 'fixed bottom-24 left-1/2 -translate-x-1/2 bg-slate-800 text-white px-4 py-2 rounded-full font-bold shadow-xl z-50 text-sm animate-bounce';
                                document.body.appendChild(el);
                                setTimeout(() => el.remove(), 2000);
                              }
                            }}
                            className="text-slate-400 hover:text-rose-500 transition-colors p-2 rounded-full hover:bg-rose-50 dark:hover:bg-rose-500/10"
                            title="Eliminar plantilla"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                      <div className="flex flex-col gap-2">
                        <AnimatePresence mode="wait">
                          {quickSendId === template.id ? (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: 'auto' }}
                              exit={{ opacity: 0, height: 0 }}
                              className="flex flex-col gap-2 overflow-hidden"
                            >
                              <div className="flex items-center gap-2">
                                <input
                                  type="email"
                                  placeholder="Email destinatario..."
                                  value={quickSendEmail}
                                  onChange={e => {
                                    setQuickSendEmail(e.target.value);
                                    setSendError(null);
                                  }}
                                  className="flex-1 h-10 px-3 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                                />
                                <button
                                  disabled={isSending || sendSuccess}
                                  onClick={() => handleQuickSend(template)}
                                  className={cn(
                                    "h-10 px-4 rounded-lg text-white font-semibold transition-colors flex items-center justify-center min-w-[48px]",
                                    sendSuccess ? "bg-emerald-500" : (sendError ? "bg-rose-500 hover:bg-rose-600" : "bg-primary hover:bg-primary/90"),
                                    isSending && "opacity-70 cursor-not-allowed"
                                  )}
                                >
                                  {isSending ? (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                  ) : sendSuccess ? (
                                    <CheckCircle2 className="w-5 h-5" />
                                  ) : (
                                    <Send className="w-4 h-4" />
                                  )}
                                </button>
                              </div>
                              {sendSuccess && (
                                <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1">
                                  <CheckCircle2 className="w-3 h-3" /> ¡Enviado correctamente!
                                </p>
                              )}
                              {sendError && (
                                <p className="text-xs text-rose-600 dark:text-rose-400 font-medium flex items-center gap-1">
                                  <XCircle className="w-3 h-3" /> {sendError}
                                </p>
                              )}
                            </motion.div>
                          ) : (
                            <div className="flex gap-2">
                              <button
                                onClick={() => {
                                  setQuickSendId(template.id);
                                  setQuickSendEmail(template.to || '');
                                  setSendError(null);
                                  setSendSuccess(false);
                                }}
                                className="flex-1 flex items-center justify-center gap-2 bg-primary/10 dark:bg-primary/20 text-primary py-2.5 rounded-lg text-sm font-semibold transition-colors hover:bg-primary hover:text-white"
                              >
                                <Send className="w-4 h-4" />
                                Envío Rápido
                              </button>
                              <button
                                onClick={() => onEdit(template)}
                                className="flex-1 flex items-center justify-center gap-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 py-2.5 rounded-lg text-sm font-semibold transition-colors hover:bg-slate-200 dark:hover:bg-slate-700"
                              >
                                <Edit2 className="w-4 h-4" />
                                Editar
                              </button>
                            </div>
                          )}
                        </AnimatePresence>
                      </div>
                    </div>
                  );
                })}
            </div>
          </>
        ) : (
          <>
            <h2 className="text-lg font-bold mb-4">Desempeño de Envíos</h2>
            <div className="space-y-4">
              {enviadosStats
                .filter(st => {
                  const matchSearch = st.name.toLowerCase().includes(searchQuery.toLowerCase());
                  // We also respect the activeFilter if it's not 'Todas', though we might not have 'category'
                  // We'll just search by name for now inside Enviados
                  return matchSearch;
                })
                .map((stat, idx) => (
                  <EnviadosCard key={idx} stat={stat} />
                ))}
              {enviadosStats.length === 0 && (
                <p className="text-slate-500 text-sm">Aún no se han enviado plantillas.</p>
              )}
            </div>
          </>
        )}
      </main>
    </motion.div>
  );
};

const EnviadosCard: React.FC<{ stat: any }> = ({ stat }) => {
  const [expanded, setExpanded] = React.useState(false);
  const firstLetter = stat.name ? stat.name.charAt(0).toUpperCase() : '?';

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm">
      <div
        onClick={() => setExpanded(!expanded)}
        className="flex items-center justify-between p-4 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
      >
        <div className="flex items-center gap-4">
          <div className="h-10 w-10 bg-primary/10 text-primary rounded-lg flex items-center justify-center font-bold text-lg">
            {firstLetter}
          </div>
          <div>
            <h3 className="font-semibold text-slate-800 dark:text-slate-100">{stat.name}</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">Enviada {stat.count} veces</p>
          </div>
        </div>
        <button className="text-slate-400">
          {expanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
        </button>
      </div>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50"
          >
            <div className="p-4 space-y-2">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Últimos {stat.last10.length} destinatarios</p>
              {stat.last10.map((emailRec: any, i: number) => (
                <div key={i} className="flex items-center justify-between text-sm py-1 border-b border-slate-100 dark:border-slate-800 last:border-0">
                  <span className="text-slate-700 dark:text-slate-300 font-medium">{emailRec.email}</span>
                  <span className="text-slate-400 text-xs">{new Date(emailRec.date).toLocaleString()}</span>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
