'use client';

import { useState } from 'react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts';
import { TrendingUp, TrendingDown, Eye, MousePointerClick, Percent, DollarSign } from 'lucide-react';

type Period = '7d' | '30d' | '90d';

function generateData(days: number) {
  const result = [];
  const now = new Date();
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const label = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    const impressions = Math.floor(350 + Math.random() * 200 + (days - i) * 2);
    result.push({
      date: label,
      Impressions: impressions,
      'Upgrade Clicks': Math.floor(impressions * (0.08 + Math.random() * 0.05)),
    });
  }
  return result;
}

const DATA: Record<Period, ReturnType<typeof generateData>> = {
  '7d': generateData(7),
  '30d': generateData(30),
  '90d': generateData(90),
};

const GATE_TABLE = [
  { name: 'Pro Features Gate', impressions: 4821, clicks: 423, rate: '8.8%', revenue: '$1,127' },
  { name: 'Export CSV Gate', impressions: 3204, clicks: 267, rate: '8.3%', revenue: '$712' },
  { name: 'Team Members Gate', impressions: 2891, clicks: 220, rate: '7.6%', revenue: '$587' },
];

interface KpiCardProps {
  title: string;
  value: string;
  change: string;
  up: boolean;
  icon: React.ReactNode;
  accent: string;
}

function KpiCard({ title, value, change, up, icon, accent }: KpiCardProps) {
  return (
    <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5">
      <div className="flex items-center justify-between mb-3">
        <p className="text-slate-400 text-sm">{title}</p>
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${accent}`}>
          {icon}
        </div>
      </div>
      <p className="text-white text-2xl font-bold mb-1">{value}</p>
      <p className={`text-sm flex items-center gap-1 ${up ? 'text-emerald-400' : 'text-red-400'}`}>
        {up ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
        {change}
      </p>
    </div>
  );
}

export default function AnalyticsPage() {
  const [period, setPeriod] = useState<Period>('30d');

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Analytics</h1>
          <p className="text-slate-400 text-sm mt-1">Track gate performance and revenue impact</p>
        </div>
        {/* Period selector */}
        <div className="flex rounded-lg border border-slate-700 overflow-hidden">
          {(['7d', '30d', '90d'] as Period[]).map(p => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-4 py-2 text-sm font-medium transition-colors ${
                period === p
                  ? 'bg-[#3b82f6] text-white'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
        <KpiCard
          title="Total Impressions"
          value="12,847"
          change="+18.4% vs prev period"
          up={true}
          icon={<Eye className="w-4 h-4 text-blue-400" />}
          accent="bg-blue-500/10"
        />
        <KpiCard
          title="Upgrade Clicks"
          value="1,423"
          change="+22.1% vs prev period"
          up={true}
          icon={<MousePointerClick className="w-4 h-4 text-purple-400" />}
          accent="bg-purple-500/10"
        />
        <KpiCard
          title="Conversion Rate"
          value="11.1%"
          change="+0.8% vs prev period"
          up={true}
          icon={<Percent className="w-4 h-4 text-emerald-400" />}
          accent="bg-emerald-500/10"
        />
        <KpiCard
          title="Revenue Impact"
          value="$2,847/mo"
          change="+$312 vs prev period"
          up={true}
          icon={<DollarSign className="w-4 h-4 text-amber-400" />}
          accent="bg-amber-500/10"
        />
      </div>

      {/* Chart */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-6 mb-8">
        <h2 className="text-white font-semibold mb-6">Impressions vs Upgrade Clicks</h2>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={DATA[period]} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorImpressions" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorClicks" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis
                dataKey="date"
                tick={{ fill: '#64748b', fontSize: 11 }}
                tickLine={false}
                axisLine={false}
                interval={period === '7d' ? 0 : period === '30d' ? 4 : 14}
              />
              <YAxis tick={{ fill: '#64748b', fontSize: 11 }} tickLine={false} axisLine={false} />
              <Tooltip
                contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px', color: '#f8fafc' }}
                labelStyle={{ color: '#94a3b8', marginBottom: '4px' }}
              />
              <Legend wrapperStyle={{ color: '#94a3b8', fontSize: 12, paddingTop: '16px' }} />
              <Area type="monotone" dataKey="Impressions" stroke="#3b82f6" strokeWidth={2} fill="url(#colorImpressions)" />
              <Area type="monotone" dataKey="Upgrade Clicks" stroke="#8b5cf6" strokeWidth={2} fill="url(#colorClicks)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Per-gate table */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-xl overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-800">
          <h2 className="text-white font-semibold">Per-Gate Breakdown</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-800">
                <th className="text-left px-6 py-3 text-slate-400 font-medium">Gate Name</th>
                <th className="text-right px-6 py-3 text-slate-400 font-medium">Impressions</th>
                <th className="text-right px-6 py-3 text-slate-400 font-medium">Clicks</th>
                <th className="text-right px-6 py-3 text-slate-400 font-medium">Conversion Rate</th>
                <th className="text-right px-6 py-3 text-slate-400 font-medium">Revenue</th>
              </tr>
            </thead>
            <tbody>
              {GATE_TABLE.map((row, i) => (
                <tr key={i} className="border-b border-slate-800/50 hover:bg-slate-800/30 transition-colors">
                  <td className="px-6 py-4 text-white font-medium">{row.name}</td>
                  <td className="px-6 py-4 text-slate-300 text-right">{row.impressions.toLocaleString()}</td>
                  <td className="px-6 py-4 text-slate-300 text-right">{row.clicks}</td>
                  <td className="px-6 py-4 text-right">
                    <span className="text-emerald-400 font-medium">{row.rate}</span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <span className="text-amber-400 font-medium">{row.revenue}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
