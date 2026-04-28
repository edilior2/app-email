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
import { SettingsScreen } from './components/SettingsScreen';
import { MOCK_TEMPLATES, Screen, EmailTemplate } from './types';
import { cn } from './lib/utils';
import { apiFetch } from './lib/api';

export default function App() {
  const [currentScreen, setCurrentScreen] = React.useState<Screen>('home');
  const [previousScreen, setPreviousScreen] = React.useState<Screen | null>(null);
  const [selectedTemplate, setSelectedTemplate] = React.useState<EmailTemplate | null>(null);
  const [templates, setTemplates] = React.useState<EmailTemplate[]>([]);

  React.useEffect(() => {
    apiFetch('/api/templates')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setTemplates(data);
      })
      .catch(err => console.error("Error loading templates:", err));
  }, []);

  React.useEffect(() => {
    apiFetch('/api/settings')
      .then(res => res.json())
      .then(data => {
        if (data.THEME_MODE === 'dark') {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
      })
      .catch(err => console.error("Error loading settings in App:", err));

    // Re-check theme occasionally in case settings change from another screen
    const interval = setInterval(() => {
      apiFetch('/api/settings').then(r => r.json()).then(d => {
        if (d.THEME_MODE === 'dark') document.documentElement.classList.add('dark');
        else document.documentElement.classList.remove('dark');
      }).catch(() => { });
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  const handleCreateNew = () => {
    setSelectedTemplate(null);
    setPreviousScreen(currentScreen);
    setCurrentScreen('editor');
  };

  const handleEditTemplate = (template: EmailTemplate) => {
    setSelectedTemplate(template);
    setPreviousScreen(currentScreen);
    setCurrentScreen('editor');
  };

  const handleBack = () => {
    if (currentScreen === 'editor' && previousScreen) {
      setCurrentScreen(previousScreen);
      setPreviousScreen(null);
    } else {
      setCurrentScreen('home');
      setPreviousScreen(null);
    }
  };

  const handleSaveTemplate = (template: EmailTemplate, redirectHome: boolean = true) => {
    apiFetch('/api/templates', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(template)
    }).catch(e => console.error("Error saving template", e));

    setTemplates(prev => {
      const exists = prev.find(t => t.id === template.id);
      if (exists) {
        return prev.map(t => t.id === template.id ? template : t);
      }
      return [template, ...prev];
    });
    if (redirectHome) {
      if (previousScreen) {
        setCurrentScreen(previousScreen);
        setPreviousScreen(null);
      } else {
        setCurrentScreen('home');
      }
    }
  };

  const handleDeleteTemplate = (id: string, redirectHome: boolean = false) => {
    apiFetch(`/api/templates/${id}`, { method: 'DELETE' }).catch(e => console.error("Error deleting template", e));
    setTemplates(prev => prev.filter(t => t.id !== id));
    if (redirectHome) {
      if (previousScreen) {
        setCurrentScreen(previousScreen);
        setPreviousScreen(null);
      } else {
        setCurrentScreen('home');
      }
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#f6f7f8] dark:bg-background-dark">
      <div className="flex-1">
        <AnimatePresence mode="wait">
          {currentScreen === 'home' && (
            <HomeScreen
              key="home"
              templates={templates}
              onCreateNew={handleCreateNew}
              onViewAll={() => setCurrentScreen('templates')}
              onEditTemplate={handleEditTemplate}
            />
          )}
          {currentScreen === 'editor' && (
            <EditorScreen
              key="editor"
              template={selectedTemplate}
              onSave={handleSaveTemplate}
              onDelete={(id) => handleDeleteTemplate(id, true)}
              onBack={handleBack}
              categories={Array.from(new Set(templates.map(t => t.category?.trim()).filter(Boolean)))}
            />
          )}
          {currentScreen === 'templates' && (
            <TemplatesScreen
              key="templates"
              templates={templates}
              onBack={handleBack}
              onEdit={handleEditTemplate}
              onDelete={(id) => handleDeleteTemplate(id, false)}
            />
          )}
          {currentScreen === 'analytics' && (
            <AnalyticsScreen
              key="analytics"
              onBack={handleBack}
            />
          )}
          {currentScreen === 'settings' && (
            <SettingsScreen
              key="settings"
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
              label="Inicio"
            />
            <NavButton
              active={currentScreen === 'templates'}
              onClick={() => setCurrentScreen('templates')}
              icon={<FileText className="w-6 h-6" />}
              label="Plantillas"
            />
            <NavButton
              active={currentScreen === 'analytics'}
              onClick={() => setCurrentScreen('analytics')}
              icon={<BarChart2 className="w-6 h-6" />}
              label="Estadísticas"
            />
            <NavButton
              active={currentScreen === 'settings'}
              onClick={() => setCurrentScreen('settings')}
              icon={<Settings className="w-6 h-6" />}
              label="Configuración"
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

