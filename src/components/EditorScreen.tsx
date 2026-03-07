import React from 'react';
import { 
  ArrowLeft, 
  Send, 
  Eye, 
  Code 
} from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '@/src/lib/utils';

interface EditorScreenProps {
  onBack: () => void;
}

export const EditorScreen: React.FC<EditorScreenProps> = ({ onBack }) => {
  const [htmlBody, setHtmlBody] = React.useState("<div style='color: blue;'>Hello World!</div>");

  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="flex flex-col min-h-screen bg-white dark:bg-background-dark"
    >
      <header className="sticky top-0 z-10 flex items-center border-b border-primary/10 px-4 py-4 bg-white dark:bg-background-dark">
        <button 
          onClick={onBack}
          className="p-2 -ml-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h2 className="flex-1 text-lg font-bold text-center pr-8">Send HTML Email</h2>
      </header>

      <main className="flex-1 overflow-y-auto px-4 py-6 space-y-6 max-w-xl mx-auto w-full">
        <div className="space-y-2">
          <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 ml-1">From</label>
          <input 
            type="email" 
            placeholder="yourname@example.com"
            className="w-full h-14 px-4 rounded-xl border border-primary/20 bg-white dark:bg-primary/5 focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all outline-none"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 ml-1">To</label>
          <input 
            type="email" 
            placeholder="recipient@example.com"
            className="w-full h-14 px-4 rounded-xl border border-primary/20 bg-white dark:bg-primary/5 focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all outline-none"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 ml-1">Subject</label>
          <input 
            type="text" 
            placeholder="Enter email subject"
            className="w-full h-14 px-4 rounded-xl border border-primary/20 bg-white dark:bg-primary/5 focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all outline-none"
          />
        </div>

        <div className="space-y-2">
          <div className="flex justify-between items-center ml-1">
            <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">HTML Body</label>
            <button 
              onClick={() => setHtmlBody('')}
              className="text-primary text-xs font-bold uppercase tracking-wider hover:opacity-80 flex items-center gap-1"
            >
              <Code className="w-3 h-3" /> Clear
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
          <button className="w-full flex items-center justify-center gap-2 bg-primary/10 dark:bg-primary/20 text-primary font-semibold py-3.5 rounded-xl border border-primary/30 hover:bg-primary/20 transition-colors">
            <Eye className="w-5 h-5" />
            Preview Design
          </button>
        </div>
      </main>

      <footer className="p-4 bg-white dark:bg-background-dark border-t border-primary/10">
        <button className="w-full bg-primary hover:bg-primary/90 text-white font-bold py-4 rounded-xl shadow-lg shadow-primary/20 flex items-center justify-center gap-3 active:scale-[0.98] transition-all">
          <Send className="w-5 h-5" />
          Send Email
        </button>
        <div className="h-6"></div>
      </footer>
    </motion.div>
  );
};
