'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import {
  Grid,
  Search,
  Globe,
  BarChart3,
  Package,
  BookOpen,
  CreditCard,
  Network,
  Layers,
  Building,
  MapPin,
  ShieldAlert,
  ClipboardCheck,
  Users,
  X
} from 'lucide-react';

interface NavbarProps {
  locale?: string;
  onLocaleChange?: (locale: string) => void;
}

export const APPS_LIST = [
  { name: 'Public Portal', href: '/', icon: Globe, authority: 'None', group: 'Network & Membership' },
  { name: 'Membership Health', href: '/membership', icon: Network, authority: 'APP_MEMBERSHIP', group: 'Network & Membership' },
  { name: 'Member Directory', href: '/explorer?tab=DIRECTORY', icon: Users, authority: 'APP_MEMBERSHIP', group: 'Network & Membership' },
  { name: 'Health Facilities', href: '/explorer?tab=FACILITIES', icon: Building, authority: 'APP_FACILITIES', group: 'Field Operations' },
  { name: 'Medicines & Supply', href: '/medstock', icon: Package, authority: 'APP_MEDICINES', group: 'Field Operations' },
  { name: 'Data Entry', href: '/data-entry', icon: ClipboardCheck, authority: 'APP_DATA_ENTRY', group: 'Field Operations' },
  { name: 'Workforce Data', href: '/workforce', icon: BookOpen, authority: 'APP_WORKFORCE', group: 'Field Operations' },
  { name: 'Control Center', href: '/dashboard', icon: BarChart3, authority: 'APP_INSIGHTS', group: 'Surveillance & Governance' },
  { name: 'Projects', href: '/programs', icon: Layers, authority: 'APP_PROJECTS', group: 'Surveillance & Governance' },
  { name: 'GIS Control Map', href: '/maps', icon: MapPin, authority: 'APP_MAPS', group: 'Surveillance & Governance' },
  { name: 'Quality & AMR', href: '/quality', icon: ShieldAlert, authority: 'APP_QUALITY', group: 'Surveillance & Governance' },
  { name: 'Institutional DPA', href: '/licensing', icon: CreditCard, authority: 'APP_FINANCIAL', group: 'Surveillance & Governance' }
];

const SEARCH_INDEX = [
  {
    title: 'Surveillance & Control Dashboard',
    subtitle: 'Epi-Week alerts, completeness, country scorecard',
    href: '/dashboard',
    badge: 'Control',
    badgeClass: 'bg-cyan-50 text-cyan-800'
  },
  {
    title: 'Kilome Mission Hospital',
    subtitle: 'Level 4 FOSA (CHAK, Kenya) • 120 beds',
    href: '/explorer?tab=FACILITIES&fosa=Kilome',
    badge: 'Facility',
    badgeClass: 'bg-sky-50 text-sky-700'
  },
  {
    title: 'Christian Health Association of Kenya (CHAK)',
    subtitle: 'Member (CHA) • Kenya',
    href: '/explorer?tab=MEMBERS&member=CHAK',
    badge: 'Member',
    badgeClass: 'bg-emerald-50 text-emerald-700'
  },
  {
    title: 'Medstock Sentinel & Inventory',
    subtitle: 'Tracer medicines, stock-outs, near-expiry batches',
    href: '/medstock',
    badge: 'Supply',
    badgeClass: 'bg-amber-50 text-amber-800'
  },
  {
    title: 'Facility Monthly Data Entry (DHIS2)',
    subtitle: 'Capture monthly tracer counts & validation rules',
    href: '/data-entry',
    badge: 'Form',
    badgeClass: 'bg-indigo-50 text-indigo-700'
  },
  {
    title: 'Tracer Medicine Availability (%)',
    subtitle: 'Core Pharmaceutical Indicator • Target 85%',
    href: '/visualizer?dx=indTracerAvail',
    badge: 'Indicator',
    badgeClass: 'bg-purple-50 text-purple-700'
  },
  {
    title: 'African Regional GIS Control Map',
    subtitle: 'Country presence, FBO coverage & stock status',
    href: '/maps',
    badge: 'GIS Map',
    badgeClass: 'bg-teal-50 text-teal-800'
  },
  {
    title: 'AMR & IPC Quality Stewardship',
    subtitle: 'WHO AWaRe antibiotic stewardship & DTC audits',
    href: '/quality',
    badge: 'Quality',
    badgeClass: 'bg-rose-50 text-rose-700'
  }
];

export function Navbar({ locale = 'en', onLocaleChange }: NavbarProps) {
  const [launcherOpen, setLauncherOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setLauncherOpen(false);
        setSearchOpen(prev => !prev);
      } else if (e.key === 'Escape') {
        setSearchOpen(false);
        setLauncherOpen(false);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  const filteredSearch = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return SEARCH_INDEX;
    return SEARCH_INDEX.filter(
      item =>
        item.title.toLowerCase().includes(q) ||
        item.subtitle.toLowerCase().includes(q) ||
        item.badge.toLowerCase().includes(q)
    );
  }, [searchQuery]);

  return (
    <>
      <header className="sticky top-0 z-40 w-full border-b border-slate-200 bg-white/95 backdrop-blur-md shadow-2xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-3">
          {/* Logo & Brand */}
          <div className="flex items-center gap-4 sm:gap-6 min-w-0">
            <Link href="/" className="flex items-center gap-2.5 cursor-pointer shrink-0">
              <img
                src="/epn-logo.svg"
                alt="EPN One Network"
                className="w-9 h-9 rounded-2xl shadow-sm shrink-0"
              />
              <div className="flex flex-col">
                <span className="font-bold text-slate-900 leading-tight tracking-tight text-lg">
                  One Network
                </span>
                <span className="text-[10px] text-slate-500 font-medium uppercase tracking-wider">
                  Surveillance &amp; Health Systems
                </span>
              </div>
            </Link>

            {/* M3 Tonal Network pill */}
            <div className="hidden md:flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-50/80 border border-cyan-200/70 text-[11px] font-medium text-cyan-950">
              <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse" />
              <span>151 Members • 29 African Nations • 25k Facilities</span>
            </div>
          </div>

          {/* M3 Search pill */}
          <div className="hidden lg:flex items-center flex-1 max-w-xs mx-4">
            <button
              type="button"
              onClick={() => setSearchOpen(true)}
              aria-label="Open global search (Ctrl+K)"
              className="w-full flex items-center justify-between px-3.5 py-2 text-xs text-slate-600 bg-slate-100/70 hover:bg-white/90 border border-slate-200/80 rounded-full transition-all cursor-pointer shadow-2xs"
            >
              <span className="flex items-center gap-2 truncate">
                <Search className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                <span className="truncate">Search control center, facilities...</span>
              </span>
              <kbd className="px-2 py-0.5 text-[10px] bg-white/90 border border-slate-200 rounded-full font-mono text-slate-500 shrink-0">
                Ctrl K
              </kbd>
            </button>
          </div>

          {/* Right actions */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {/* Mobile Search Icon */}
            <button
              type="button"
              onClick={() => setSearchOpen(true)}
              aria-label="Search platform"
              className="lg:hidden p-2 rounded-full hover:bg-slate-100/80 text-slate-600 transition-colors cursor-pointer"
            >
              <Search className="w-5 h-5" />
            </button>

            {/* Bilingual M3 tonal pill */}
            <button
              type="button"
              onClick={() => onLocaleChange && onLocaleChange(locale === 'en' ? 'fr' : 'en')}
              aria-label="Switch language"
              className="px-3 py-1.5 min-h-[36px] text-xs font-semibold rounded-full border border-slate-200/80 bg-white/75 text-slate-700 hover:bg-white flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Globe className="w-3.5 h-3.5 text-cyan-700" />
              <span className="hidden sm:inline">{locale === 'en' ? 'Français' : 'English'}</span>
              <span className="sm:hidden uppercase">{locale === 'en' ? 'FR' : 'EN'}</span>
            </button>

            {/* App Launcher */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setLauncherOpen(!launcherOpen)}
                aria-label="App Ecosystem Launcher"
                aria-expanded={launcherOpen}
                className={`p-2 min-h-[36px] min-w-[36px] flex items-center justify-center rounded-full hover:bg-cyan-50 transition-colors cursor-pointer ${
                  launcherOpen ? 'bg-cyan-100 text-cyan-800' : 'text-slate-600'
                }`}
                title="App Ecosystem Launcher"
              >
                <Grid className="w-5 h-5" />
              </button>

              {launcherOpen && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setLauncherOpen(false)}
                    aria-hidden="true"
                  />
                  <div className="absolute right-0 mt-2 w-[min(20rem,calc(100vw-2rem))] m3-glass-card p-3.5 z-50">
                    <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-200/60 px-1">
                      <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                        EPN Applications
                      </span>
                      <button
                        type="button"
                        onClick={() => setLauncherOpen(false)}
                        aria-label="Close app launcher"
                        className="text-slate-400 hover:text-slate-700 p-1 rounded-full cursor-pointer"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="space-y-3 max-h-[70vh] overflow-y-auto pr-0.5">
                      {(['Network & Membership', 'Field Operations', 'Surveillance & Governance'] as const).map(groupName => (
                        <div key={groupName}>
                          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-1 mb-1">
                            {groupName}
                          </div>
                          <div className="grid grid-cols-3 gap-1.5">
                            {APPS_LIST.filter(a => a.group === groupName).map(app => {
                              const Icon = app.icon;
                              return (
                                <Link
                                  key={app.name}
                                  href={app.href}
                                  onClick={() => setLauncherOpen(false)}
                                  className="flex flex-col items-center justify-center p-2 rounded-2xl hover:bg-cyan-50/90 text-slate-700 hover:text-cyan-900 text-center transition-colors group cursor-pointer"
                                >
                                  <div className="w-9 h-9 rounded-2xl bg-slate-100/80 group-hover:bg-cyan-100 flex items-center justify-center mb-1 text-slate-600 group-hover:text-cyan-700 transition-colors">
                                    <Icon className="w-4 h-4" />
                                  </div>
                                  <span className="text-[10.5px] font-medium leading-tight line-clamp-2">
                                    {app.name}
                                  </span>
                                </Link>
                              );
                            })}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* M3 Filled Pill CTA */}
            <Link
              href="/dashboard"
              className="inline-flex items-center justify-center h-9 px-4 rounded-full bg-cyan-700 hover:bg-cyan-800 text-white text-xs font-semibold shadow-sm transition-colors cursor-pointer"
            >
              <span className="hidden sm:inline">Control Center</span>
              <span className="sm:hidden">Workspace</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Global Search Dialog Modal (M3 + Glassmorphism) */}
      {searchOpen && (
        <div
          className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-md flex items-start justify-center pt-20 px-4"
          onClick={() => setSearchOpen(false)}
          role="dialog"
          aria-modal="true"
          aria-label="Global search"
        >
          <div
            className="w-full max-w-xl m3-glass-card overflow-hidden"
            onClick={e => e.stopPropagation()}
          >
            <div className="p-3 border-b border-slate-100 flex items-center gap-2">
              <Search className="w-4 h-4 text-slate-500 ml-1 shrink-0" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search control dashboard, facilities, members, indicators..."
                className="w-full text-sm outline-none placeholder:text-slate-400 py-1.5"
                autoFocus
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="text-xs text-slate-400 hover:text-slate-700 px-1.5 py-1 cursor-pointer"
                >
                  Clear
                </button>
              )}
              <button
                type="button"
                onClick={() => setSearchOpen(false)}
                className="text-xs font-mono text-slate-500 hover:text-slate-800 px-2 py-1 border border-slate-200 rounded bg-slate-50 cursor-pointer"
              >
                ESC
              </button>
            </div>
            <div className="p-3 max-h-80 overflow-y-auto space-y-1 text-xs">
              <div className="text-[11px] font-semibold text-slate-400 uppercase px-2 py-1">
                {searchQuery ? `Results (${filteredSearch.length})` : 'Quick Navigation & Entities'}
              </div>
              {filteredSearch.length === 0 ? (
                <div className="p-4 text-center text-slate-500">
                  No matches found for &ldquo;{searchQuery}&rdquo;.
                </div>
              ) : (
                filteredSearch.map(item => (
                  <Link
                    key={item.title}
                    href={item.href}
                    onClick={() => setSearchOpen(false)}
                    className="flex items-center justify-between p-2.5 rounded-lg hover:bg-slate-50 text-slate-700 transition-colors cursor-pointer"
                  >
                    <div className="min-w-0 pr-3">
                      <div className="font-semibold text-slate-900 truncate">{item.title}</div>
                      <div className="text-slate-500 text-[11px] truncate">{item.subtitle}</div>
                    </div>
                    <span className={`text-[10px] px-2 py-0.5 rounded font-semibold shrink-0 ${item.badgeClass}`}>
                      {item.badge}
                    </span>
                  </Link>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
