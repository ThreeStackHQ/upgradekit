'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut, useSession } from 'next-auth/react';
import {
  LayoutGrid,
  BarChart2,
  Settings,
  Menu,
  X,
  LogOut,
  Zap,
} from 'lucide-react';

const navItems = [
  { label: 'Gates', href: '/gates', icon: LayoutGrid },
  { label: 'Analytics', href: '/analytics', icon: BarChart2 },
  { label: 'Settings', href: '/settings', icon: Settings },
];

function Sidebar({ mobile = false, onClose }: { mobile?: boolean; onClose?: () => void }) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const user = session?.user;

  return (
    <div className="flex flex-col h-full bg-[#0f172a] border-r border-slate-800 w-64">
      {/* Logo */}
      <div className="flex items-center justify-between h-16 px-6 border-b border-slate-800">
        <Link href="/dashboard" className="flex items-center gap-2 text-white font-bold text-lg">
          <Zap className="w-5 h-5 text-[#3b82f6]" />
          UpgradeKit
        </Link>
        {mobile && (
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map(({ label, href, icon: Icon }) => {
          const active = pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              onClick={onClose}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                active
                  ? 'bg-[#3b82f6]/20 text-[#3b82f6]'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Icon className="w-4 h-4" />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* Stats footer */}
      <div className="px-4 py-3 border-t border-slate-800 text-xs text-slate-500 space-y-0.5">
        <div className="flex justify-between">
          <span>Total Impressions</span>
          <span className="text-slate-300 font-medium">12,847</span>
        </div>
        <div className="flex justify-between">
          <span>Upgrade Clicks</span>
          <span className="text-slate-300 font-medium">1,423</span>
        </div>
        <div className="flex justify-between">
          <span>Rate</span>
          <span className="text-[#3b82f6] font-medium">11.1%</span>
        </div>
      </div>

      {/* User */}
      <div className="px-4 py-4 border-t border-slate-800 flex items-center gap-3">
        {user?.image ? (
          <img src={user.image} alt={user.name ?? ''} className="w-8 h-8 rounded-full" />
        ) : (
          <div className="w-8 h-8 rounded-full bg-[#3b82f6] flex items-center justify-center text-white text-xs font-bold">
            {user?.name?.[0]?.toUpperCase() ?? 'U'}
          </div>
        )}
        <div className="flex-1 min-w-0">
          <p className="text-sm text-white truncate">{user?.name ?? 'User'}</p>
          <p className="text-xs text-slate-500 truncate">{user?.email ?? ''}</p>
        </div>
        <button
          onClick={() => signOut({ callbackUrl: '/login' })}
          className="text-slate-500 hover:text-white transition-colors"
          title="Sign out"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex h-screen bg-[#0f172a] text-white overflow-hidden">
      {/* Desktop sidebar */}
      <aside className="hidden md:flex flex-col flex-shrink-0">
        <Sidebar />
      </aside>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
          />
          <div className="relative z-10">
            <Sidebar mobile onClose={() => setMobileOpen(false)} />
          </div>
        </div>
      )}

      {/* Main */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Mobile topbar */}
        <header className="md:hidden flex items-center gap-4 h-16 px-4 border-b border-slate-800 bg-[#0f172a]">
          <button
            onClick={() => setMobileOpen(true)}
            className="text-slate-400 hover:text-white"
          >
            <Menu className="w-6 h-6" />
          </button>
          <div className="flex items-center gap-2 text-white font-bold">
            <Zap className="w-5 h-5 text-[#3b82f6]" />
            UpgradeKit
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
