'use client';

import React, { useState } from 'react';
import { Navbar } from '@/components/Navbar';
import Link from 'next/link';
import {
  Briefcase,
  Building,
  Globe2,
  GraduationCap,
  Coins,
  Layers,
  ArrowRight,
  ChevronRight
} from 'lucide-react';
import { STRATEGIC_PROGRAMMES_2021_2025, HEALTH_PRIORITIES } from '@epn/domain';
import { SEED_PROJECTS } from '@epn/db';

// Seed-level classification: project → program area + health priority.
// Becomes configurable metadata (M1) once programme assignment is editable in /maintenance.
const PROJECT_PROGRAM_MAP: Record<string, { program: string; priority?: string }> = {
  ACCESS_II: { program: 'PROG_2' },
  ACCESS_III: { program: 'PROG_2' },
  IMPACT: { program: 'PROG_1' },
  MNCH_FBO: { program: 'PROG_2', priority: 'MNCH_RH' },
  MINILAB_NET: { program: 'PROG_3', priority: 'IPC_AMR' },
  SAFER: { program: 'PROG_2', priority: 'IPC_AMR' }
};

export default function ProgramsPage() {
  const [selectedProgram, setSelectedProgram] = useState<string | null>(null);

  const projectsOf = (programCode: string) =>
    SEED_PROJECTS.filter(p => PROJECT_PROGRAM_MAP[p.code]?.program === programCode);

  const priorityName = (code?: string) =>
    code ? HEALTH_PRIORITIES.find(h => h.code === code)?.name ?? 'Cross-cutting' : 'Cross-cutting';

  const visibleProjects = selectedProgram
    ? projectsOf(selectedProgram)
    : SEED_PROJECTS;

  const totals = {
    budget: visibleProjects.reduce((s, p) => s + p.budget, 0),
    facilities: visibleProjects.reduce((s, p) => s + p.facilitiesCount, 0),
    trained: visibleProjects.reduce((s, p) => s + p.healthWorkersTrained, 0),
    countries: new Set(visibleProjects.flatMap(p => p.countries)).size
  };

  return (
    <>
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Programs &amp; Projects</h1>
          <p className="mt-1 text-sm text-slate-500">
            Projects organized by program area and health priority. Browse by program or by project list —
            each view links to the other.
          </p>
        </div>

        {/* Program area cards */}
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5 mb-8">
          {STRATEGIC_PROGRAMMES_2021_2025.map(program => {
            const projects = projectsOf(program.code);
            const selected = selectedProgram === program.code;
            return (
              <button
                key={program.code}
                onClick={() => setSelectedProgram(selected ? null : program.code)}
                className={`text-left rounded-xl border p-4 transition-all ${
                  selected
                    ? 'border-sky-400 bg-sky-50 ring-2 ring-sky-100'
                    : 'border-slate-200 bg-white hover:border-sky-200 hover:shadow-sm'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Program {program.sortOrder}
                  </span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-slate-100 text-slate-600 font-semibold">
                    {projects.length} {projects.length === 1 ? 'project' : 'projects'}
                  </span>
                </div>
                <p className="mt-1.5 text-sm font-semibold text-slate-900 leading-snug">{program.name}</p>
                <p className="mt-1 text-[11px] text-slate-500 leading-snug line-clamp-3">{program.description}</p>
              </button>
            );
          })}
        </div>

        {selectedProgram && (
          <div className="mb-4 flex items-center gap-2 text-xs text-sky-700 bg-sky-50 border border-sky-100 rounded-lg px-3 py-2">
            <Layers className="w-3.5 h-3.5" />
            Filtered by program:{' '}
            <span className="font-semibold">
              {STRATEGIC_PROGRAMMES_2021_2025.find(p => p.code === selectedProgram)?.name}
            </span>
            <button onClick={() => setSelectedProgram(null)} className="ml-auto font-medium hover:underline">
              Clear filter
            </button>
          </div>
        )}

        {/* Aggregate totals for the current view */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
          <div className="rounded-xl border border-slate-200 bg-white p-4">
            <Coins className="w-4 h-4 text-emerald-600" />
            <p className="mt-2 text-xl font-bold text-slate-900">${totals.budget.toLocaleString()}</p>
            <p className="text-[11px] text-slate-500">Total budget (USD)</p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-4">
            <Building className="w-4 h-4 text-sky-600" />
            <p className="mt-2 text-xl font-bold text-slate-900">{totals.facilities.toLocaleString()}</p>
            <p className="text-[11px] text-slate-500">Facilities reached</p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-4">
            <GraduationCap className="w-4 h-4 text-violet-600" />
            <p className="mt-2 text-xl font-bold text-slate-900">{totals.trained.toLocaleString()}</p>
            <p className="text-[11px] text-slate-500">Health workers trained</p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-4">
            <Globe2 className="w-4 h-4 text-amber-600" />
            <p className="mt-2 text-xl font-bold text-slate-900">{totals.countries}</p>
            <p className="text-[11px] text-slate-500">Countries covered</p>
          </div>
        </div>

        {/* Project register (circular navigation: project → funder / program / priority) */}
        <h2 className="text-sm font-bold uppercase tracking-widest text-slate-400 mb-3">
          {selectedProgram ? 'Projects in this program' : 'All projects'}
        </h2>
        <div className="space-y-2.5">
          {visibleProjects.map(project => {
            const mapping = PROJECT_PROGRAM_MAP[project.code];
            const program = STRATEGIC_PROGRAMMES_2021_2025.find(p => p.code === mapping?.program);
            return (
              <div
                key={project.code}
                className="rounded-xl border border-slate-200 bg-white p-4 hover:border-sky-200 hover:shadow-sm transition-all"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Briefcase className="w-4 h-4 text-sky-600 shrink-0" />
                      <h3 className="text-sm font-semibold text-slate-900">{project.name}</h3>
                      <span
                        className={`text-[10px] px-1.5 py-0.5 rounded-full font-semibold ${
                          project.status === 'ACTIVE'
                            ? 'bg-emerald-50 text-emerald-700'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {project.status}
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-slate-500 leading-snug">{project.description}</p>
                    <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-slate-500">
                      <span>
                        Funder: <span className="font-medium text-slate-700">{project.funder}</span>
                      </span>
                      <Link
                        href="/programs"
                        className="flex items-center gap-1 hover:text-sky-700"
                        title="Program area"
                      >
                        <ArrowRight className="w-3 h-3" />
                        {program?.name ?? 'Cross-cutting'}
                      </Link>
                      <span className="flex items-center gap-1">
                        <Globe2 className="w-3 h-3" />
                        {project.countries.length} countries
                      </span>
                      <span>
                        Priority: <span className="font-medium text-slate-700">{priorityName(mapping?.priority)}</span>
                      </span>
                      <span>
                        {project.facilitiesCount} facilities · {project.healthWorkersTrained} trained ·{' '}
                        ${project.budget.toLocaleString()}
                      </span>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-300 shrink-0 mt-1" />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
}
