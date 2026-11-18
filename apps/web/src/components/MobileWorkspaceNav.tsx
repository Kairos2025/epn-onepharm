'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const MOBILE_NAV = [
  { label: 'Control Center', href: '/dashboard' },
  { label: 'Membership', href: '/membership' },
  { label: 'Data Entry', href: '/data-entry' },
  { label: 'Medstock', href: '/medstock' },
  { label: 'GIS Maps', href: '/maps' },
  { label: 'Explorer', href: '/explorer' },
  { label: 'Quality & AMR', href: '/quality' },
  { label: 'Visualizer', href: '/visualizer' },
  { label: 'Reports', href: '/reports' }
];

export function MobileWorkspaceNav() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Workspace sections"
      className="lg:hidden border-b border-white/70 bg-white/70 backdrop-blur-lg px-4 py-2.5 overflow-x-auto flex items-center gap-1.5"
    >
      {MOBILE_NAV.map(item => {
        const active = pathname === item.href;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
              active
                ? 'bg-cyan-700 text-white shadow-xs'
                : 'bg-white/80 border border-slate-200/70 text-slate-700 hover:bg-white'
            }`}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
