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

const data = [
  { name: 'Mon', value: 35 },
  { name: 'Tue', value: 30 },
  { name: 'Wed', value: 32 },
  { name: 'Thu', value: 20 },
  { name: 'Fri', value: 25 },
  { name: 'Sat', value: 10 },
  { name: 'Sun', value: 15 },
];

interface AnalyticsScreenProps {
  onBack: () => void;
}

export const AnalyticsScreen: React.FC<AnalyticsScreenProps> = ({ onBack }) => {
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
        <h2 className="text-lg font-bold tracking-tight flex-1 px-4">Analytics</h2>
        <button className="flex items-center justify-center rounded-lg h-10 w-10 bg-primary/10 text-primary hover:bg-primary/20 transition-colors">
          <Calendar className="w-5 h-5" />
        </button>
      </header>

      <nav className="bg-white dark:bg-background-dark border-b border-slate-200 dark:border-slate-800">
        <div className="flex px-4 gap-8">
          {['Overview', 'Campaigns', 'Templates'].map((tab) => (
            <button
              key={tab}
              className={cn(
                "flex flex-col items-center justify-center border-b-[3px] pb-3 pt-4 transition-colors",
                tab === 'Overview' ? "border-primary text-primary" : "border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
              )}
            >
              <span className="text-sm font-bold tracking-tight">{tab}</span>
            </button>
          ))}
        </div>
      </nav>

      <main className="flex-1 p-4 max-w-4xl mx-auto w-full pb-24 space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <MetricCard 
            title="Total Sent" 
            value="125,430" 
            trend="+12%" 
            trendUp={true} 
            icon={<Send className="w-4 h-4" />} 
          />
          <MetricCard 
            title="Open Rate" 
            value="24.8%" 
            trend="+2%" 
            trendUp={true} 
            icon={<Mail className="w-4 h-4" />} 
          />
          <MetricCard 
            title="Click Rate" 
            value="3.2%" 
            trend="-1%" 
            trendUp={false} 
            icon={<MousePointer2 className="w-4 h-4" />} 
          />
          <MetricCard 
            title="Bounces" 
            value="0.5%" 
            trend="-0.1%" 
            trendUp={true} 
            icon={<AlertCircle className="w-4 h-4" />} 
          />
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6">
          <h3 className="text-lg font-bold mb-6">Email Performance (Last 7 Days)</h3>
          <div className="h-48 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data}>
                <defs>
                  <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#1c74e9" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#1c74e9" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <Area 
                  type="monotone" 
                  dataKey="value" 
                  stroke="#1c74e9" 
                  fillOpacity={1} 
                  fill="url(#colorValue)" 
                  strokeWidth={2}
                />
                <XAxis 
                  dataKey="name" 
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
            <h3 className="text-lg font-bold">Top Performing Templates</h3>
            <button className="text-primary text-sm font-semibold hover:underline">View All</button>
          </div>
          <div className="space-y-3">
            <TopTemplateItem 
              title="Summer Sale Announcement" 
              stats="Used 12 times · 45.2% avg. open" 
              rating="High"
              image="https://picsum.photos/seed/summer/100/100"
            />
            <TopTemplateItem 
              title="Product Update - v2.4" 
              stats="Used 5 times · 38.1% avg. open" 
              rating="Medium"
              image="https://picsum.photos/seed/update/100/100"
            />
            <TopTemplateItem 
              title="Monthly Newsletter - June" 
              stats="Used 1 time · 32.5% avg. open" 
              rating="High"
              image="https://picsum.photos/seed/newsletter/100/100"
            />
          </div>
        </div>
      </main>
    </motion.div>
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

function TopTemplateItem({ title, stats, rating, image }: any) {
  return (
    <div className="flex items-center gap-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-3 rounded-xl">
      <div className="h-12 w-12 rounded-lg bg-slate-100 dark:bg-slate-800 flex-shrink-0 overflow-hidden">
        <img src={image} alt={title} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
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
