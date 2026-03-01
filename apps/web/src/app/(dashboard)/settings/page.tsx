import { Settings } from 'lucide-react';

export const metadata = { title: 'Settings — UpgradeKit' };

export default function SettingsPage() {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-white mb-2">Settings</h1>
      <p className="text-slate-400 mb-8">Manage your workspace configuration.</p>
      <div className="max-w-lg border border-slate-800 rounded-xl p-8 flex flex-col items-center text-center bg-slate-900/40">
        <Settings className="w-10 h-10 text-slate-600 mb-3" />
        <p className="text-slate-400 text-sm">Settings coming soon.</p>
      </div>
    </div>
  );
}
