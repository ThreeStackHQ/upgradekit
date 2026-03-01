'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Plus, LayoutGrid, Eye, TrendingUp, ToggleLeft, ToggleRight } from 'lucide-react';

type GateStatus = 'Active' | 'Draft' | 'Archived';
type TriggerType = 'page_load' | 'feature_click' | 'manual';

interface Gate {
  id: string;
  name: string;
  trigger: TriggerType;
  impressions: number;
  conversion: number;
  status: GateStatus;
  active: boolean;
}

const MOCK_GATES: Gate[] = [
  { id: '1', name: 'Pro Features Gate', trigger: 'page_load', impressions: 2341, conversion: 8.2, status: 'Active', active: true },
  { id: '2', name: 'Export CSV Gate', trigger: 'feature_click', impressions: 2341, conversion: 8.2, status: 'Active', active: true },
  { id: '3', name: 'Team Members Gate', trigger: 'manual', impressions: 2341, conversion: 8.2, status: 'Draft', active: false },
  { id: '4', name: 'API Access Gate', trigger: 'feature_click', impressions: 2341, conversion: 8.2, status: 'Archived', active: false },
];

const triggerColors: Record<TriggerType, string> = {
  page_load: 'bg-blue-500/20 text-blue-400',
  feature_click: 'bg-purple-500/20 text-purple-400',
  manual: 'bg-slate-700 text-slate-300',
};

const statusColors: Record<GateStatus, string> = {
  Active: 'bg-emerald-500/20 text-emerald-400',
  Draft: 'bg-amber-500/20 text-amber-400',
  Archived: 'bg-slate-700 text-slate-400',
};

function EmptyState() {
  return (
    <div className="border border-dashed border-slate-700 rounded-xl py-20 flex flex-col items-center text-center">
      <div className="w-14 h-14 bg-slate-800 rounded-xl flex items-center justify-center mb-4">
        <LayoutGrid className="w-7 h-7 text-slate-500" />
      </div>
      <h3 className="text-white font-semibold text-lg mb-2">No gates yet</h3>
      <p className="text-slate-400 text-sm max-w-xs mb-6">
        Create your first gate to start showing upgrade prompts to your users.
      </p>
      <Link
        href="/gates/new"
        className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#3b82f6] hover:bg-blue-500 text-white rounded-lg text-sm font-medium transition-colors"
      >
        <Plus className="w-4 h-4" /> New Gate
      </Link>
    </div>
  );
}

export default function GatesPage() {
  const [gates, setGates] = useState<Gate[]>(MOCK_GATES);

  function toggleActive(id: string) {
    setGates(prev =>
      prev.map(g => (g.id === id ? { ...g, active: !g.active } : g))
    );
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">Gates</h1>
          <p className="text-slate-400 text-sm mt-1">Manage your upgrade gate widgets</p>
        </div>
        <Link
          href="/gates/new"
          className="inline-flex items-center gap-2 px-4 py-2 bg-[#3b82f6] hover:bg-blue-500 text-white rounded-lg text-sm font-medium transition-colors"
        >
          <Plus className="w-4 h-4" /> New Gate
        </Link>
      </div>

      {gates.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="grid gap-4">
          {gates.map(gate => (
            <div
              key={gate.id}
              className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 flex flex-col sm:flex-row sm:items-center gap-4"
            >
              {/* Name + badges */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2 flex-wrap">
                  <h3 className="text-white font-medium">{gate.name}</h3>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusColors[gate.status]}`}>
                    {gate.status}
                  </span>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${triggerColors[gate.trigger]}`}>
                    {gate.trigger.replace('_', ' ')}
                  </span>
                </div>
                <div className="flex items-center gap-5 text-sm text-slate-400">
                  <span className="flex items-center gap-1.5">
                    <Eye className="w-3.5 h-3.5" />
                    {gate.impressions.toLocaleString()} impressions (7d)
                  </span>
                  <span className="flex items-center gap-1.5">
                    <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-emerald-400">{gate.conversion}% conversion</span>
                  </span>
                </div>
              </div>

              {/* Toggle */}
              <button
                onClick={() => toggleActive(gate.id)}
                className="flex items-center gap-2 text-sm transition-colors"
                title={gate.active ? 'Deactivate' : 'Activate'}
              >
                {gate.active ? (
                  <ToggleRight className="w-8 h-8 text-[#3b82f6]" />
                ) : (
                  <ToggleLeft className="w-8 h-8 text-slate-600" />
                )}
                <span className={gate.active ? 'text-[#3b82f6]' : 'text-slate-500'}>
                  {gate.active ? 'Active' : 'Inactive'}
                </span>
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
