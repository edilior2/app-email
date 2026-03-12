import React from 'react';
import {
  ArrowLeft,
  Calendar,
  Send,
  MousePointer2,
  AlertCircle,
  TrendingUp,
  TrendingDown,
  Mail,
  Users,
  Megaphone,
  Activity,
  Settings,
  BarChart2
} from 'lucide-react';
import { motion } from 'motion/react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';
import { cn } from '@/src/lib/utils';
import { apiFetch } from '@/src/lib/api';

const defaultData = [
  { date: 'Mon', count: 0 },
  { date: 'Tue', count: 0 },
  { date: 'Wed', count: 0 },
  { date: 'Thu', count: 0 },
  { date: 'Fri', count: 0 },
  { date: 'Sat', count: 0 },
  { date: 'Sun', count: 0 },
];

interface AnalyticsScreenProps {
  onBack: () => void;
}

export const AnalyticsScreen: React.FC<AnalyticsScreenProps> = ({ onBack }) => {
  const [stats, setStats] = React.useState<any>({
    totalSent: "0",
    openRate: "0%",
    clickRate: "0%",
    bounces: "0%",
    topTemplates: [],
    unsubscribed: []
  });
  const [chartData, setChartData] = React.useState<any[]>(defaultData);

  React.useEffect(() => {
    apiFetch('/api/analytics')
      .then(res => res.json())
      .then(data => {
        setStats((prev: any) => ({
          ...prev,
          totalSent: data.totalSent?.toLocaleString() || "0",
          openRate: data.openRate || "0%",
          clickRate: data.clickRate || "0%",
          bounces: data.bounces || "0%",
          topTemplates: data.topTemplates || []
        }));
      })
      .catch(err => console.error("Error loading analytics:", err));

    apiFetch('/api/analytics/unsubscribed')
      .then(res => res.json())
      .then(data => {
        setStats((prev: any) => ({ ...prev, unsubscribed: data || [] }));
      })
      .catch(err => console.error("Error loading unsubscribed:", err));

    apiFetch('/api/analytics/chart')
      .then(res => res.json())
      .then(data => {
        if (data && data.length > 0) setChartData(data);
      })
      .catch(err => console.error("Error loading chart data:", err));
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="flex flex-col min-h-screen bg-[#f6f7f8] dark:bg-background-dark"
    >
      <header className="sticky top-0 z-10 flex items-center bg-white dark:bg-background-dark p-4 pb-2 justify-between border-b border-slate-200 dark:border-slate-800">
        <button
          onClick={onBack}
          className="flex size-10 items-center justify-center rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h2 className="text-lg font-bold tracking-tight flex-1 px-4">Estadísticas</h2>
        <button className="flex items-center justify-center rounded-lg h-10 w-10 bg-primary/10 text-primary hover:bg-primary/20 transition-colors">
          <Calendar className="w-5 h-5" />
        </button>
      </header>



      <main className="flex-1 p-4 max-w-4xl mx-auto w-full pb-24 space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <MetricCard
            title="Total Enviados"
            value={stats.totalSent}
            trend="+0%"
            trendUp={true}
            icon={<Send className="w-4 h-4" />}
          />
          <MetricCard
            title="Tasa de Apertura"
            value={stats.openRate}
            trend="+0%"
            trendUp={true}
            icon={<Mail className="w-4 h-4" />}
          />
          <MetricCard
            title="Tasa de Clics"
            value={stats.clickRate}
            trend="-0%"
            trendUp={false}
            icon={<MousePointer2 className="w-4 h-4" />}
          />
          <MetricCard
            title="Rebotes"
            value={stats.bounces}
            trend="-0%"
            trendUp={true}
            icon={<AlertCircle className="w-4 h-4" />}
          />
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6">
          <h3 className="text-lg font-bold mb-6">Rendimiento (Últimos 7 Días)</h3>
          <div className="h-48 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#1c74e9" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#1c74e9" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <Area
                  type="monotone"
                  dataKey="count"
                  stroke="#1c74e9"
                  fillOpacity={1}
                  fill="url(#colorValue)"
                  strokeWidth={2}
                />
                <XAxis
                  dataKey="date"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 10, fill: '#64748b' }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1e293b',
                    border: 'none',
                    borderRadius: '8px',
                    color: '#fff'
                  }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold">Plantillas Más Usadas</h3>
            <button className="text-primary text-sm font-semibold hover:underline">Ver Todas</button>
          </div>
          <div className="space-y-3">
            {stats.topTemplates && stats.topTemplates.length > 0 ? (
              stats.topTemplates.map((template: any, idx: number) => (
                <TopTemplateItem
                  key={idx}
                  title={template.name || 'Sin Título'}
                  stats={`Usada ${template.count} veces`}
                  rating={idx === 0 ? "Más Popular" : "Alta"}
                />
              ))
            ) : (
              <p className="text-slate-500 text-sm">Aún no hay datos de uso de plantillas.</p>
            )}
          </div>
        </div>
        <div className="space-y-4 pt-6 mt-6 border-t border-slate-200 dark:border-slate-800">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold">Desuscripciones</h3>
            <span className="text-xs font-semibold bg-rose-100 dark:bg-rose-500/10 text-rose-600 px-2 py-1 rounded-full">{stats.unsubscribed?.length || 0} usuarios</span>
          </div>
          <div className="space-y-3">
            {stats.unsubscribed && stats.unsubscribed.length > 0 ? (
              stats.unsubscribed.map((user: any, idx: number) => (
                <div key={idx} className="flex items-center justify-between p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{user.email}</span>
                  <span className="text-xs text-slate-500">{new Date(user.unsubscribed_at).toLocaleDateString()}</span>
                </div>
              ))
            ) : (
              <p className="text-slate-500 text-sm">Nadie se ha desuscrito aún. ¡Buen trabajo!</p>
            )}
          </div>
        </div>
      </main>
    </motion.div >
  );
};

function MetricCard({ title, value, trend, trendUp, icon }: any) {
  return (
    <div className="flex flex-col gap-2 rounded-xl p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
      <div className="flex items-center justify-between">
        <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">{title}</p>
        <div className="text-primary">{icon}</div>
      </div>
      <p className="text-2xl font-bold">{value}</p>
      <p className={cn(
        "text-sm font-semibold flex items-center gap-1",
        trendUp ? "text-emerald-500" : "text-rose-500"
      )}>
        {trendUp ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
        {trend}
      </p>
    </div>
  );
}

function TopTemplateItem({ title, stats, rating }: any) {
  const firstLetter = title ? title.charAt(0).toUpperCase() : '?';

  return (
    <div className="flex items-center gap-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-3 rounded-xl">
      <div className="h-12 w-12 rounded-lg bg-primary/10 text-primary flex items-center justify-center text-xl font-black flex-shrink-0">
        {firstLetter}
      </div>
      <div className="flex-1">
        <p className="text-sm font-bold">{title}</p>
        <p className="text-slate-500 dark:text-slate-400 text-xs">{stats}</p>
      </div>
      <div className="text-right">
        <p className="text-emerald-500 text-sm font-bold">{rating}</p>
      </div>
    </div>
  );
}
