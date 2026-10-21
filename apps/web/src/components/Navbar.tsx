'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Activity,
  Grid,
  Search,
  Globe,
  BarChart3,
  Database,
  Layers,
  MapPin,
  Package,
  BookOpen,
  FileSpreadsheet,
  Settings,
  CreditCard,
  Network,
  ShieldCheck,
  X
} from 'lucide-react';

interface NavbarProps {
  locale?: string;
  onLocaleChange?: (locale: string) => void;
}

export const APPS_LIST = [
  { name: 'Public Portal', href: '/', icon: Globe, authority: 'None' },
  { name: 'Dashboard', href: '/dashboard', icon: BarChart3, authority: 'APP_DASHBOARD' },
  { name: 'Network Explorer', href: '/explorer', icon: Network, authority: 'APP_EXPLORER' },
  { name: 'Data Entry', href: '/data-entry', icon: Database, authority: 'APP_DATA_ENTRY' },
  { name: 'Data Visualizer', href: '/visualizer', icon: BarChart3, authority: 'APP_VISUALIZER' },
  { name: 'Thematic Maps', href: '/maps', icon: MapPin, authority: 'APP_MAPS' },
  { name: 'Medstock Inventory', href: '/medstock', icon: Package, authority: 'APP_MEDSTOCK' },
  { name: 'Stories & Impact', href: '/stories', icon: BookOpen, authority: 'APP_STORIES' },
  { name: 'Reports & Scorecards', href: '/reports', icon: FileSpreadsheet, authority: 'APP_REPORTS' },
  { name: 'Data Quality & Audit', href: '/quality', icon: ShieldCheck, authority: 'APP_DATA_QUALITY' },
  { name: 'Subscriptions & Billing', href: '/billing', icon: CreditCard, authority: 'APP_BILLING' },
  { name: 'Maintenance & Strategy', href: '/maintenance', icon: Settings, authority: 'APP_MAINTENANCE' }
];

export function Navbar({ locale = 'en', onLocaleChange }: NavbarProps) {
  const [launcherOpen, setLauncherOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <>
      <header className="sticky top-0 z-40 w-full border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Logo & Brand */}
          <div className="flex items-center gap-6">
            <Link href="/" className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-lg bg-sky-600 flex items-center justify-center text-white font-bold text-lg shadow-sm">
                EPN
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-slate-900 leading-tight tracking-tight text-lg">OnePharm</span>
                <span className="text-[10px] text-slate-500 font-medium uppercase tracking-wider">Health Systems Platform</span>
              </div>
            </Link>

            {/* Network pill */}
            <div className="hidden md:flex items-center gap-2 px-2.5 py-1 rounded-full bg-slate-100 text-[11px] font-medium text-slate-600">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>149 Members • 29 African Nations • 25k Facilities</span>
            </div>
          </div>

          {/* Search bar */}
          <div className="hidden lg:flex items-center flex-1 max-w-xs mx-6">
            <button
              onClick={() => setSearchOpen(true)}
              className="w-full flex items-center justify-between px-3 py-1.5 text-xs text-slate-500 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-md transition-colors"
            >
              <span className="flex items-center gap-2">
                <Search className="w-3.5 h-3.5" />
                <span>Search network, facilities, indicators...</span>
              </span>
              <kbd className="px-1.5 py-0.5 text-[10px] bg-white border border-slate-200 rounded font-mono">Ctrl K</kbd>
            </button>
          </div>

          {/* Right actions */}
          <div className="flex items-center gap-3">
            {/* Bilingual toggle */}
            <button
              onClick={() => onLocaleChange && onLocaleChange(locale === 'en' ? 'fr' : 'en')}
              className="px-2.5 py-1 text-xs font-semibold rounded border border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100 flex items-center gap-1.5"
            >
              <Globe className="w-3.5 h-3.5 text-slate-500" />
              <span>{locale === 'en' ? 'Français' : 'English'}</span>
            </button>

            {/* App Launcher (9 dots) */}
            <div className="relative">
              <button
                onClick={() => setLauncherOpen(!launcherOpen)}
                className={`p-2 rounded-md hover:bg-slate-100 transition-colors ${launcherOpen ? 'bg-slate-100 text-sky-600' : 'text-slate-600'}`}
                title="App Ecosystem Launcher"
              >
                <Grid className="w-5 h-5" />
              </button>

              {launcherOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-white border border-slate-200 rounded-xl shadow-xl p-3 z-50 animate-in fade-in zoom-in-95">
                  <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100 px-1">
                    <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">EPN Applications</span>
                    <button onClick={() => setLauncherOpen(false)} className="text-slate-400 hover:text-slate-600">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    {APPS_LIST.map(app => {
                      const Icon = app.icon;
                      return (
                        <Link
                          key={app.name}
                          href={app.href}
                          onClick={() => setLauncherOpen(false)}
                          className="flex flex-col items-center justify-center p-2.5 rounded-lg hover:bg-sky-50 text-slate-700 hover:text-sky-700 text-center transition-colors group"
                        >
                          <div className="w-9 h-9 rounded-md bg-slate-100 group-hover:bg-sky-100 flex items-center justify-center mb-1.5 text-slate-600 group-hover:text-sky-600">
                            <Icon className="w-4 h-4" />
                          </div>
                          <span className="text-[11px] font-medium leading-tight line-clamp-2">{app.name}</span>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Explore / Sign In */}
            <Link
              href="/dashboard"
              className="inline-flex items-center justify-center h-9 px-3.5 rounded-md bg-sky-600 hover:bg-sky-700 text-white text-xs font-semibold shadow-sm transition-colors"
            >
              Enter Workspace
            </Link>
          </div>
        </div>
      </header>

      {/* Global Search Dialog Modal */}
      {searchOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-start justify-center pt-24 px-4">
          <div className="w-full max-w-xl bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden">
            <div className="p-3 border-b border-slate-100 flex items-center gap-2">
              <Search className="w-4 h-4 text-slate-400 ml-1" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Type to search facilities, members, indicators or countries..."
                className="w-full text-sm outline-none placeholder:text-slate-400 py-1"
                autoFocus
              />
              <button onClick={() => setSearchOpen(false)} className="text-xs text-slate-400 hover:text-slate-600 px-2 py-1">
                ESC
              </button>
            </div>
            <div className="p-3 max-h-72 overflow-y-auto space-y-1 text-xs">
              <div className="text-[11px] font-semibold text-slate-400 uppercase px-2 py-1">Suggested Entities</div>
              <Link
                href="/explorer?fosa=Kilome"
                onClick={() => setSearchOpen(false)}
                className="flex items-center justify-between p-2 rounded-md hover:bg-slate-50 text-slate-700"
              >
                <div>
                  <span className="font-semibold">Kilome Mission Hospital</span>
                  <span className="text-slate-400 ml-2">• Level 4 FOSA (CHAK, Kenya)</span>
                </div>
                <span className="text-[10px] bg-sky-50 text-sky-700 px-2 py-0.5 rounded font-medium">Facility</span>
              </Link>
              <Link
                href="/explorer?member=CHAK"
                onClick={() => setSearchOpen(false)}
                className="flex items-center justify-between p-2 rounded-md hover:bg-slate-50 text-slate-700"
              >
                <div>
                  <span className="font-semibold">Christian Health Association of Kenya (CHAK)</span>
                  <span className="text-slate-400 ml-2">• Member (CHA)</span>
                </div>
                <span className="text-[10px] bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded font-medium">Member</span>
              </Link>
              <Link
                href="/visualizer?dx=indTracerAvail"
                onClick={() => setSearchOpen(false)}
                className="flex items-center justify-between p-2 rounded-md hover:bg-slate-50 text-slate-700"
              >
                <div>
                  <span className="font-semibold">Tracer Medicine Availability (%)</span>
                  <span className="text-slate-400 ml-2">• Core Pharmaceutical Indicator</span>
                </div>
                <span className="text-[10px] bg-purple-50 text-purple-700 px-2 py-0.5 rounded font-medium">Indicator</span>
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
