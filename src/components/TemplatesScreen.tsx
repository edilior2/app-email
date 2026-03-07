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
  Edit2 
} from 'lucide-react';
import { motion } from 'motion/react';
import { MOCK_TEMPLATES, EmailTemplate } from '@/src/types';
import { cn } from '@/src/lib/utils';

interface TemplatesScreenProps {
  onBack: () => void;
  onEdit: (template: EmailTemplate) => void;
}

const ICON_MAP: Record<string, any> = {
  Mail,
  ShoppingCart,
  PartyPopper,
  Handshake,
};

export const TemplatesScreen: React.FC<TemplatesScreenProps> = ({ onBack, onEdit }) => {
  const [activeTab, setActiveTab] = React.useState<'All' | 'Drafts' | 'Sent'>('All');
  const [activeFilter, setActiveFilter] = React.useState('All');

  const filters = ['All', 'Marketing', 'Sales', 'Automation', 'Transactional'];

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
          <h1 className="text-xl font-bold tracking-tight">Templates</h1>
        </div>
        <div className="flex items-center gap-2">
          <button className="flex size-10 items-center justify-center rounded-full hover:bg-slate-200 dark:hover:bg-slate-800">
            <Search className="w-5 h-5" />
          </button>
          <button className="flex size-10 items-center justify-center rounded-full bg-primary text-white shadow-lg shadow-primary/20">
            <Plus className="w-5 h-5" />
          </button>
        </div>
      </header>

      <nav className="bg-white dark:bg-background-dark border-b border-slate-200 dark:border-slate-800">
        <div className="flex px-4 gap-8">
          {['All Templates', 'Drafts', 'Sent'].map((tab) => {
            const label = tab === 'All Templates' ? 'All' : tab;
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
        <h2 className="text-lg font-bold mb-4">HTML Email Templates</h2>
        <div className="space-y-4">
          {MOCK_TEMPLATES.filter(t => activeFilter === 'All' || t.category === activeFilter).map((template) => {
            const Icon = ICON_MAP[template.icon] || Mail;
            return (
              <div 
                key={template.id}
                className="group relative flex flex-col gap-4 bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 p-4 rounded-xl transition-all hover:border-primary/50"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="bg-primary/10 rounded-lg p-2 text-primary">
                      <Icon className="w-8 h-8" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-base">{template.title}</h3>
                      <div className="flex items-center gap-2">
                        <p className="text-slate-500 dark:text-slate-400 text-[10px]">Last edited: {template.lastEdited}</p>
                        <span className={cn(
                          "px-1.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider border",
                          template.category === 'Marketing' && "bg-emerald-100/50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 border-emerald-200/50 dark:border-emerald-800/50",
                          template.category === 'Automation' && "bg-amber-100/50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 border-amber-200/50 dark:border-amber-800/50",
                          template.category === 'Sales' && "bg-blue-100/50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border-blue-200/50 dark:border-blue-800/50",
                          template.category === 'Transactional' && "bg-slate-100/50 dark:bg-slate-700/20 text-slate-500 dark:text-slate-400 border-slate-200/50 dark:border-slate-800/50"
                        )}>
                          {template.category}
                        </span>
                      </div>
                    </div>
                  </div>
                  <button className="text-slate-400 hover:text-slate-900 dark:hover:text-slate-100">
                    <MoreVertical className="w-5 h-5" />
                  </button>
                </div>
                <div className="flex gap-2">
                  <button className="flex-1 flex items-center justify-center gap-2 bg-primary/10 dark:bg-primary/20 text-primary py-2.5 rounded-lg text-sm font-semibold transition-colors hover:bg-primary hover:text-white">
                    <Send className="w-4 h-4" />
                    Quick Send
                  </button>
                  <button 
                    onClick={() => onEdit(template)}
                    className="flex-1 flex items-center justify-center gap-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 py-2.5 rounded-lg text-sm font-semibold transition-colors hover:bg-slate-200 dark:hover:bg-slate-700"
                  >
                    <Edit2 className="w-4 h-4" />
                    Edit
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </main>
    </motion.div>
  );
};
