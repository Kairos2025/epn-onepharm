'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const MOBILE_NAV = [
  { label: 'Control Center', href: '/dashboard' },
  { label: 'Data Entry', href: '/data-entry' },
  { label: 'Medstock', href: '/medstock' },
  { label: 'GIS Maps', href: '/maps' },
  { label: 'Explorer', href: '/explorer' },
  { label: 'Quality & AMR', href: '/quality' },
  { label: 'Visualizer', href: '/visualizer' },
  { label: 'Reports', href: '/reports' },
  { label: 'Billing', href: '/billing' }
];

export function MobileWorkspaceNav() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Workspace sections"
      className="lg:hidden border-b border-slate-200 bg-white px-4 py-2 overflow-x-auto flex items-center gap-1.5"
    >
      {MOBILE_NAV.map(item => {
        const active = pathname === item.href;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
              active
                ? 'bg-cyan-700 text-white'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
