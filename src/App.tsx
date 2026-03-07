/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { 
  Home, 
  FileText, 
  BarChart2, 
  Settings,
  FolderHeart,
  Activity,
  Megaphone,
  Users
} from 'lucide-react';
import { AnimatePresence } from 'motion/react';
import { HomeScreen } from './components/HomeScreen';
import { EditorScreen } from './components/EditorScreen';
import { TemplatesScreen } from './components/TemplatesScreen';
import { AnalyticsScreen } from './components/AnalyticsScreen';
import { Screen, EmailTemplate } from './types';
import { cn } from './lib/utils';

export default function App() {
  const [currentScreen, setCurrentScreen] = React.useState<Screen>('home');
  const [selectedTemplate, setSelectedTemplate] = React.useState<EmailTemplate | null>(null);

  const handleCreateNew = () => {
    setSelectedTemplate(null);
    setCurrentScreen('editor');
  };

  const handleEditTemplate = (template: EmailTemplate) => {
    setSelectedTemplate(template);
    setCurrentScreen('editor');
  };

  const handleBack = () => {
    setCurrentScreen('home');
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#f6f7f8] dark:bg-background-dark">
      <div className="flex-1">
        <AnimatePresence mode="wait">
          {currentScreen === 'home' && (
            <HomeScreen 
              key="home"
              onCreateNew={handleCreateNew} 
              onViewAll={() => setCurrentScreen('templates')}
              onEditTemplate={(id) => setCurrentScreen('editor')}
            />
          )}
          {currentScreen === 'editor' && (
            <EditorScreen 
              key="editor"
              onBack={handleBack} 
            />
          )}
          {currentScreen === 'templates' && (
            <TemplatesScreen 
              key="templates"
              onBack={handleBack}
              onEdit={handleEditTemplate}
            />
          )}
          {currentScreen === 'analytics' && (
            <AnalyticsScreen 
              key="analytics"
              onBack={handleBack}
            />
          )}
        </AnimatePresence>
      </div>

      {/* Bottom Navigation */}
      {currentScreen !== 'editor' && (
        <nav className="fixed bottom-0 left-0 right-0 z-20 border-t border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur-lg">
          <div className="flex gap-1 px-4 pb-6 pt-3 max-w-xl mx-auto">
            <NavButton 
              active={currentScreen === 'home'} 
              onClick={() => setCurrentScreen('home')}
              icon={<Home className={cn("w-6 h-6", currentScreen === 'home' && "fill-current")} />}
              label="Home"
            />
            <NavButton 
              active={currentScreen === 'templates'} 
              onClick={() => setCurrentScreen('templates')}
              icon={<FileText className="w-6 h-6" />}
              label="Templates"
            />
            <NavButton 
              active={currentScreen === 'analytics'} 
              onClick={() => setCurrentScreen('analytics')}
              icon={<BarChart2 className="w-6 h-6" />}
              label="Analytics"
            />
            <NavButton 
              active={false} 
              onClick={() => {}}
              icon={<Settings className="w-6 h-6" />}
              label="Settings"
            />
          </div>
        </nav>
      )}
    </div>
  );
}

function NavButton({ active, onClick, icon, label }: { active: boolean, onClick: () => void, icon: React.ReactNode, label: string }) {
  return (
    <button 
      onClick={onClick}
      className={cn(
        "flex flex-1 flex-col items-center justify-center gap-1 rounded-xl py-1 transition-colors",
        active ? "text-primary" : "text-slate-500 dark:text-slate-400 hover:text-primary"
      )}
    >
      {icon}
      <p className={cn("text-[11px] leading-normal", active ? "font-semibold" : "font-medium")}>
        {label}
      </p>
    </button>
  );
}

