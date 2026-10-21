'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Users,
  Briefcase,
  Building2,
  Pill,
  GraduationCap,
  Wallet,
  BarChart3,
  ChevronDown,
  LogIn,
  ArrowLeftRight
} from 'lucide-react';
import { WORKSPACE_CATEGORIES, START_FROM_ENTRY_POINTS } from '@epn/domain';

const ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  users: Users,
  briefcase: Briefcase,
  building: Building2,
  pill: Pill,
  graduation: GraduationCap,
  wallet: Wallet,
  chart: BarChart3
};

export function Sidebar() {
  const pathname = usePathname();
  const [openCategories, setOpenCategories] = useState<Record<string, boolean>>({
    MEMBERSHIP: true,
    PROJECTS: true
  });

  const toggle = (code: string) =>
    setOpenCategories(prev => ({ ...prev, [code]: !prev[code] }));

  return (
    <aside className="w-64 shrink-0 border-r border-slate-200 bg-white min-h-[calc(100vh-4rem)] sticky top-16 self-start max-h-[calc(100vh-4rem)] overflow-y-auto hidden lg:block">
      <div className="p-3">
        <p className="px-2 pb-2 text-[10px] font-bold uppercase tracking-widest text-slate-400">
          Data Categories
        </p>
        <nav className="space-y-0.5">
          {WORKSPACE_CATEGORIES.map(category => {
            const Icon = ICONS[category.icon] ?? BarChart3;
            const isOpen = openCategories[category.code];
            const categoryActive = pathname === category.href;
            return (
              <div key={category.code}>
                <div className="flex items-stretch">
                  <Link
                    href={category.href}
                    className={`flex-1 flex items-center gap-2.5 px-2.5 py-2 rounded-md text-sm font-medium transition-colors ${
                      categoryActive
                        ? 'bg-sky-50 text-sky-700'
                        : 'text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${categoryActive ? 'text-sky-600' : 'text-slate-400'}`} />
                    <span className="leading-tight">{category.name}</span>
                  </Link>
                  <button
                    onClick={() => toggle(category.code)}
                    className="px-1.5 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-50"
                    aria-label={`Toggle ${category.name} sub-categories`}
                  >
                    <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? '' : '-rotate-90'}`} />
                  </button>
                </div>

                {isOpen && (
                  <ul className="mt-0.5 mb-1.5 ml-4 pl-3 border-l border-slate-100 space-y-0.5">
                    {category.subs.map(sub => (
                      <li key={sub.code}>
                        {sub.external ? (
                          <a
                            href={sub.href}
                            target="_blank"
                            rel="noreferrer"
                            className="block px-2.5 py-1.5 rounded-md text-xs text-slate-500 hover:bg-slate-50 hover:text-slate-700"
                          >
                            {sub.name}
                            <span className="ml-1.5 text-[9px] uppercase text-amber-600 bg-amber-50 px-1 rounded">LMS</span>
                          </a>
                        ) : (
                          <Link
                            href={sub.href}
                            className={`block px-2.5 py-1.5 rounded-md text-xs transition-colors ${
                              pathname === sub.href
                                ? 'text-sky-700 font-medium'
                                : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'
                            }`}
                            title={sub.description}
                          >
                            {sub.name}
                          </Link>
                        )}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            );
          })}
        </nav>

        {/* Circular navigation entry points */}
        <div className="mt-4 pt-3 border-t border-slate-100">
          <p className="px-2 pb-2 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-slate-400">
            <ArrowLeftRight className="w-3 h-3" />
            Start From
          </p>
          <div className="grid grid-cols-2 gap-1.5 px-1">
            {START_FROM_ENTRY_POINTS.map(entry => (
              <Link
                key={entry.code}
                href={entry.href}
                title={entry.description}
                className="flex items-center justify-center px-2 py-1.5 rounded-md bg-slate-50 hover:bg-sky-50 hover:text-sky-700 text-[11px] font-medium text-slate-600 transition-colors"
              >
                {entry.name}
              </Link>
            ))}
          </div>
        </div>

        {/* Sign-in for higher tiers */}
        <div className="mt-4 px-2 pb-2">
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
            <p className="text-[11px] font-semibold text-slate-700">Access tiers</p>
            <p className="mt-0.5 text-[10px] text-slate-500 leading-snug">
              Partial to full data insight by subscription. Contact the Secretariat for extended access.
            </p>
            <Link
              href="/billing"
              className="mt-2 inline-flex items-center gap-1 text-[11px] font-semibold text-sky-700 hover:text-sky-800"
            >
              <LogIn className="w-3 h-3" />
              Manage subscription
            </Link>
          </div>
        </div>
      </div>
    </aside>
  );
}
