import React from 'react';
import { 
  Menu, 
  User, 
  Plus, 
  ChevronRight, 
  Megaphone, 
  ShoppingCart, 
  Handshake, 
  Edit2, 
  Send 
} from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '@/src/lib/utils';

interface HomeScreenProps {
  onCreateNew: () => void;
  onViewAll: () => void;
  onEditTemplate: (id: string) => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({ onCreateNew, onViewAll, onEditTemplate }) => {
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex flex-col min-h-screen bg-[#f6f7f8] dark:bg-background-dark"
    >
      <header className="sticky top-0 z-10 border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-background-dark/80 backdrop-blur-md">
        <div className="flex items-center p-4 justify-between max-w-xl mx-auto w-full">
          <button className="flex size-10 items-center justify-center rounded-full hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors">
            <Menu className="w-6 h-6" />
          </button>
          <h1 className="text-lg font-bold tracking-tight">Email Designer</h1>
          <div className="flex size-10 items-center justify-center rounded-full bg-primary/10 text-primary">
            <User className="w-6 h-6" />
          </div>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto max-w-xl mx-auto w-full pb-24">
        <section className="px-4 pt-6 pb-2">
          <h2 className="text-2xl font-bold mb-4">Start Drafting</h2>
          <div className="group relative overflow-hidden rounded-xl bg-slate-200 dark:bg-slate-800 p-1">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-transparent opacity-50"></div>
            <div className="relative flex flex-col items-stretch justify-start rounded-lg bg-white dark:bg-slate-900 overflow-hidden">
              <div 
                className="w-full aspect-video bg-cover bg-center bg-slate-300 dark:bg-slate-700"
                style={{ backgroundImage: 'url("https://picsum.photos/seed/workspace/800/450")' }}
              />
              <div className="flex flex-col gap-3 p-5">
                <div className="flex flex-col gap-1">
                  <p className="text-xl font-bold tracking-tight">New Email</p>
                  <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">
                    Create a professional email from scratch or start from a curated template library.
                  </p>
                </div>
                <button 
                  onClick={onCreateNew}
                  className="w-full flex items-center justify-center gap-2 rounded-lg h-12 bg-primary text-white text-base font-semibold transition-transform active:scale-95"
                >
                  <Plus className="w-5 h-5" />
                  <span>Create New Design</span>
                </button>
              </div>
            </div>
          </div>
        </section>

        <section className="px-4 mt-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold">Saved Designs</h2>
            <button 
              onClick={onViewAll}
              className="text-primary text-sm font-semibold flex items-center gap-1"
            >
              See all
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
          <div className="flex flex-col gap-3">
            <DesignCard 
              title="Monthly Newsletter" 
              category="Marketing" 
              time="2 days ago" 
              icon={<Megaphone className="w-8 h-8" />}
              color="blue"
              onEdit={() => onEditTemplate('1')}
            />
            <DesignCard 
              title="Product Launch Event" 
              category="Sales" 
              time="Edited 4h ago" 
              icon={<ShoppingCart className="w-8 h-8" />}
              color="emerald"
              onEdit={() => onEditTemplate('2')}
              actionIcon={<Send className="w-5 h-5" />}
            />
            <DesignCard 
              title="Welcome Sequence #1" 
              category="Automation" 
              time="1 week ago" 
              icon={<Handshake className="w-8 h-8" />}
              color="amber"
              onEdit={() => onEditTemplate('3')}
              opacity={0.8}
            />
          </div>
        </section>
      </main>
    </motion.div>
  );
};

function DesignCard({ title, category, time, icon, color, onEdit, actionIcon, opacity = 1 }: any) {
  const colorClasses = {
    blue: "bg-blue-500/10 text-blue-500",
    emerald: "bg-emerald-500/10 text-emerald-500",
    amber: "bg-amber-500/10 text-amber-500",
  }[color as 'blue' | 'emerald' | 'amber'];

  const badgeClasses = {
    blue: "bg-blue-500/10 text-blue-500",
    emerald: "bg-emerald-500/10 text-emerald-500",
    amber: "bg-amber-500/10 text-amber-500",
  }[color as 'blue' | 'emerald' | 'amber'];

  return (
    <div 
      style={{ opacity }}
      className="flex items-center gap-4 p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm"
    >
      <div className={cn("size-14 rounded-lg flex items-center justify-center", colorClasses)}>
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <h4 className="font-semibold text-base truncate">{title}</h4>
        <div className="flex items-center gap-2 mt-0.5">
          <span className={cn("px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider", badgeClasses)}>
            {category}
          </span>
          <span className="text-slate-400 text-xs">{time}</span>
        </div>
      </div>
      <button 
        onClick={onEdit}
        className="size-9 rounded-full flex items-center justify-center bg-slate-100 dark:bg-slate-800 hover:text-primary transition-colors"
      >
        {actionIcon || <Edit2 className="w-5 h-5" />}
      </button>
    </div>
  );
}
