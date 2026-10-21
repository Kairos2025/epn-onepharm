'use client';

import React from 'react';
import { Navbar } from '@/components/Navbar';
import Link from 'next/link';
import {
  GraduationCap,
  Users,
  Award,
  Globe2,
  Building,
  ArrowRight
} from 'lucide-react';
import { STRATEGIC_PROGRAMMES_2021_2025 } from '@epn/domain';
import { SEED_PROJECTS, SEED_COUNTRIES } from '@epn/db';

const PROJECT_PROGRAM_MAP: Record<string, string> = {
  ACCESS_II: 'PROG_2',
  ACCESS_III: 'PROG_2',
  IMPACT: 'PROG_1',
  MNCH_FBO: 'PROG_2',
  MINILAB_NET: 'PROG_3',
  SAFER: 'PROG_2'
};

const COUNTRY_NAMES: Record<string, string> = Object.fromEntries(
  SEED_COUNTRIES.map(c => [c.code, c.name])
);

export default function WorkforcePage() {
  const totalTrained = SEED_PROJECTS.reduce((s, p) => s + p.healthWorkersTrained, 0);
  const totalFacilities = SEED_PROJECTS.reduce((s, p) => s + p.facilitiesCount, 0);
  const champions = SEED_PROJECTS
    .filter(p => p.code === 'ACCESS_III')
    .reduce((s, p) => s + p.healthWorkersTrained, 0);

  const byCountry = Object.entries(
    SEED_PROJECTS.reduce<Record<string, number>>((acc, p) => {
      p.countries.forEach(c => {
        acc[c] = (acc[c] ?? 0) + p.healthWorkersTrained;
      });
      return acc;
    }, {})
  ).sort((a, b) => b[1] - a[1]);

  const maxCountry = byCountry[0]?.[1] ?? 1;

  return (
    <>
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Workforce Data</h1>
          <p className="mt-1 text-sm text-slate-500">
            Trainings held, people trained and workforce metrics across programs. Renamed from Human
            Resources per the 2026 interface agreement.
          </p>
        </div>

        {/* Headline workforce KPIs */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
          <div className="rounded-xl border border-slate-200 bg-white p-4">
            <GraduationCap className="w-4 h-4 text-violet-600" />
            <p className="mt-2 text-2xl font-bold text-slate-900">{totalTrained.toLocaleString()}</p>
            <p className="text-[11px] text-slate-500">People trained (all projects)</p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-4">
            <Award className="w-4 h-4 text-amber-600" />
            <p className="mt-2 text-2xl font-bold text-slate-900">{champions}</p>
            <p className="text-[11px] text-slate-500">System champions (ACCESS III)</p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-4">
            <Building className="w-4 h-4 text-sky-600" />
            <p className="mt-2 text-2xl font-bold text-slate-900">{totalFacilities.toLocaleString()}</p>
            <p className="text-[11px] text-slate-500">Facilities supported by training</p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-4">
            <Globe2 className="w-4 h-4 text-emerald-600" />
            <p className="mt-2 text-2xl font-bold text-slate-900">{byCountry.length}</p>
            <p className="text-[11px] text-slate-500">Countries with trained staff</p>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Training by project */}
          <section>
            <h2 className="text-sm font-bold uppercase tracking-widest text-slate-400 mb-3">Trainings by project</h2>
            <div className="rounded-xl border border-slate-200 bg-white divide-y divide-slate-100">
              {SEED_PROJECTS.map(project => {
                const program = STRATEGIC_PROGRAMMES_2021_2025.find(
                  p => p.code === PROJECT_PROGRAM_MAP[project.code]
                );
                return (
                  <div key={project.code} className="p-4">
                    <div className="flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-slate-900 truncate">{project.name}</p>
                        <Link
                          href="/programs"
                          className="mt-0.5 inline-flex items-center gap-1 text-[11px] text-sky-700 hover:text-sky-800"
                        >
                          <ArrowRight className="w-3 h-3" />
                          {program?.name ?? 'Cross-cutting'}
                        </Link>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-lg font-bold text-slate-900">{project.healthWorkersTrained}</p>
                        <p className="text-[10px] text-slate-500">trained</p>
                      </div>
                    </div>
                    <div className="mt-2 h-1.5 rounded-full bg-slate-100 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-violet-500"
                        style={{ width: `${(project.healthWorkersTrained / Math.max(...SEED_PROJECTS.map(x => x.healthWorkersTrained))) * 100}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* People trained by country */}
          <section>
            <h2 className="text-sm font-bold uppercase tracking-widest text-slate-400 mb-3">People trained by country</h2>
            <div className="rounded-xl border border-slate-200 bg-white p-4 space-y-2.5">
              {byCountry.map(([code, count]) => (
                <div key={code} className="flex items-center gap-3">
                  <span className="w-28 shrink-0 text-xs font-medium text-slate-700 truncate">
                    {COUNTRY_NAMES[code] ?? code}
                  </span>
                  <div className="flex-1 h-2 rounded-full bg-slate-100 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-sky-500"
                      style={{ width: `${(count / maxCountry) * 100}%` }}
                    />
                  </div>
                  <span className="w-10 text-right text-xs font-semibold text-slate-900">{count}</span>
                </div>
              ))}
            </div>

            <div className="mt-4 rounded-xl border border-violet-200 bg-violet-50 p-4">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-violet-600" />
                <p className="text-sm font-semibold text-violet-900">Learning Portal (LMS)</p>
              </div>
              <p className="mt-1 text-xs text-violet-800 leading-snug">
                Online and continuous training programs reach all member countries via the EPN learning platform.
              </p>
              <a
                href="https://training.epnetwork.org/"
                target="_blank"
                rel="noreferrer"
                className="mt-2 inline-flex items-center gap-1 text-[11px] font-semibold text-violet-700 hover:text-violet-900"
              >
                Open training.epnetwork.org
                <ArrowRight className="w-3 h-3" />
              </a>
            </div>
          </section>
        </div>
      </div>
    </>
  );
}
