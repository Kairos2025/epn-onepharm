'use client';

import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import {
  Building,
  Globe2,
  GraduationCap,
  Coins,
  Layers,
  ArrowRight,
  Search
} from 'lucide-react';
import {
  STRATEGIC_PROGRAMMES_2021_2025,
  HEALTH_PRIORITIES,
  PROJECT_PROGRAM_MAP,
  PROJECT_PRIORITY_MAP
} from '@epn/domain';
import { SEED_PROJECTS } from '@epn/db';

const FUNDER_LOGO_MAP: Array<{ match: string; src: string }> = [
  { match: 'bread for the world', src: '/partners/brot.jpg' },
  { match: 'action medeor', src: '/partners/action-medeor.jpg' },
  { match: 'difaem', src: '/partners/difaem.png' },
  { match: 'plan:g', src: '/partners/plang.jpg' },
  { match: 'apotheker', src: '/partners/apotheker.png' }
];

function getFunderLogo(funder: string): string | undefined {
  const lower = funder.toLowerCase();
  return FUNDER_LOGO_MAP.find(item => lower.includes(item.match))?.src;
}

export default function ProgramsPage() {
  const [selectedProgram, setSelectedProgram] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'COMPLETED'>('ALL');
  const [query, setQuery] = useState('');

  const projectsOf = (programCode: string) =>
    SEED_PROJECTS.filter(p => PROJECT_PROGRAM_MAP[p.code] === programCode);

  const priorityName = (code?: string) =>
    code ? HEALTH_PRIORITIES.find(h => h.code === code)?.name ?? 'Cross-cutting' : 'Cross-cutting';

  const visibleProjects = useMemo(() => {
    const q = query.trim().toLowerCase();
    return SEED_PROJECTS.filter(p => {
      const matchesProg = !selectedProgram || PROJECT_PROGRAM_MAP[p.code] === selectedProgram;
      const matchesStatus = statusFilter === 'ALL' || p.status === statusFilter;
      const matchesQuery =
        !q ||
        p.name.toLowerCase().includes(q) ||
        p.code.toLowerCase().includes(q) ||
        p.funder.toLowerCase().includes(q) ||
        p.countries.some(c => c.toLowerCase().includes(q));
      return matchesProg && matchesStatus && matchesQuery;
    });
  }, [selectedProgram, statusFilter, query]);

  const totalPortfolioBudget = SEED_PROJECTS.reduce((s, p) => s + p.budget, 0);

  const totals = {
    budget: visibleProjects.reduce((s, p) => s + p.budget, 0),
    facilities: visibleProjects.reduce((s, p) => s + p.facilitiesCount, 0),
    trained: visibleProjects.reduce((s, p) => s + p.healthWorkersTrained, 0),
    countries: new Set(visibleProjects.flatMap(p => p.countries)).size
  };

  const maxFacilities = Math.max(1, ...SEED_PROJECTS.map(p => p.facilitiesCount));
  const maxTrained = Math.max(1, ...SEED_PROJECTS.map(p => p.healthWorkersTrained));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
      {/* Clean Executive Header */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs px-5 sm:px-6 pt-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              Programs &amp; Projects Portfolio
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              5 official EPN program areas · Click any program card to filter budgets, reach, and donor-funded projects.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <Link
              href="/explorer?tab=FUNDERS"
              className="px-3.5 py-2 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-slate-800 text-xs font-semibold transition-colors"
            >
              View Funders
            </Link>
            <Link
              href="/licensing"
              className="px-4 py-2 rounded-lg bg-[#f27f20] hover:bg-[#d96e14] text-white text-xs font-bold transition-colors"
            >
              Fund a Program &rarr;
            </Link>
          </div>
        </div>

        {/* Underline Filter Bar + Search */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-t border-slate-100 py-2.5 text-xs">
          <div className="flex items-center gap-5">
            {(
              [
                { id: 'ALL', label: `All Projects (${SEED_PROJECTS.length})` },
                { id: 'ACTIVE', label: `Active (${SEED_PROJECTS.filter(p => p.status === 'ACTIVE').length})` },
                { id: 'COMPLETED', label: `Completed (${SEED_PROJECTS.filter(p => p.status === 'COMPLETED').length})` }
              ] as const
            ).map(tab => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setStatusFilter(tab.id)}
                className={`py-1.5 border-b-2 font-semibold transition-colors cursor-pointer ${
                  statusFilter === tab.id
                    ? 'border-[#004a59] text-[#004a59]'
                    : 'border-transparent text-slate-500 hover:text-slate-900'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Search project, funder, country..."
              className="w-full pl-8 pr-3 py-1.5 rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#004a59]"
            />
          </div>
        </div>
      </div>

      {/* 4 Dynamic KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl border border-slate-200 border-t-4 border-t-[#004a59] p-4 space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Total Budget</span>
            <Coins className="w-4 h-4 text-[#004a59]" />
          </div>
          <p className="text-2xl font-extrabold text-slate-900 tabular-nums">${totals.budget.toLocaleString()}</p>
          <p className="text-[11px] text-slate-500">USD across {visibleProjects.length} project{visibleProjects.length === 1 ? '' : 's'}</p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 border-t-4 border-t-sky-600 p-4 space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Facilities Reached</span>
            <Building className="w-4 h-4 text-sky-600" />
          </div>
          <p className="text-2xl font-extrabold text-slate-900 tabular-nums">{totals.facilities.toLocaleString()}</p>
          <p className="text-[11px] text-slate-500">Affiliated faith-based FOSAs</p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 border-t-4 border-t-emerald-600 p-4 space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Workers Trained</span>
            <GraduationCap className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-2xl font-extrabold text-slate-900 tabular-nums">{totals.trained.toLocaleString()}</p>
          <p className="text-[11px] text-slate-500">Pharmacists &amp; supply staff</p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 border-t-4 border-t-[#f27f20] p-4 space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Countries Covered</span>
            <Globe2 className="w-4 h-4 text-[#f27f20]" />
          </div>
          <p className="text-2xl font-extrabold text-slate-900 tabular-nums">{totals.countries}</p>
          <p className="text-[11px] text-slate-500">Sub-Saharan Africa footprint</p>
        </div>
      </div>

      {/* 5 Program Area Selector Cards */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500">
            5 Official EPN Program Areas
          </h2>
          {selectedProgram && (
            <button
              type="button"
              onClick={() => setSelectedProgram(null)}
              className="text-xs font-semibold text-[#004a59] hover:underline cursor-pointer"
            >
              Show all 5 programs
            </button>
          )}
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {STRATEGIC_PROGRAMMES_2021_2025.map(program => {
            const projects = projectsOf(program.code);
            const progBudget = projects.reduce((s, p) => s + p.budget, 0);
            const sharePct = totalPortfolioBudget > 0 ? Math.round((progBudget / totalPortfolioBudget) * 100) : 0;
            const selected = selectedProgram === program.code;
            return (
              <button
                key={program.code}
                type="button"
                onClick={() => setSelectedProgram(selected ? null : program.code)}
                className={`text-left rounded-2xl border p-4 transition-all flex flex-col justify-between gap-3 cursor-pointer ${
                  selected
                    ? 'border-[#004a59] bg-[#004a59] text-white shadow-md'
                    : 'border-slate-200 bg-white hover:border-[#004a59] hover:shadow-sm text-slate-900'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <span className={`text-[10px] font-bold uppercase tracking-wider ${selected ? 'text-cyan-200' : 'text-slate-400'}`}>
                      Program {program.sortOrder}
                    </span>
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                        selected ? 'bg-white/15 text-white' : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      {projects.length} {projects.length === 1 ? 'project' : 'projects'}
                    </span>
                  </div>
                  <p className="mt-1.5 text-sm font-bold leading-snug">{program.name}</p>
                  <p className={`mt-1 text-[11px] leading-snug line-clamp-2 ${selected ? 'text-cyan-100/90' : 'text-slate-500'}`}>
                    {program.description}
                  </p>
                </div>

                <div className="space-y-1 pt-2 border-t border-current/10">
                  <div className="flex items-center justify-between text-[10px] font-mono">
                    <span className={selected ? 'text-cyan-100' : 'text-slate-500'}>
                      {progBudget > 0 ? `$${(progBudget / 1000000).toFixed(2)}M` : 'Core Pillar'}
                    </span>
                    <span className="font-bold">{sharePct}%</span>
                  </div>
                  <div className={`w-full h-1.5 rounded-full overflow-hidden ${selected ? 'bg-white/20' : 'bg-slate-100'}`}>
                    <div
                      className={`h-full rounded-full ${selected ? 'bg-[#31cdcf]' : 'bg-[#004a59]'}`}
                      style={{ width: `${Math.max(sharePct, progBudget > 0 ? 8 : 0)}%` }}
                    />
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Project Cards Grid */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-[#004a59]" />
            <span>
              {selectedProgram
                ? `Projects in ${STRATEGIC_PROGRAMMES_2021_2025.find(p => p.code === selectedProgram)?.name}`
                : 'All Funded Projects'}
            </span>
          </h2>
          <span className="text-xs text-slate-500">Showing {visibleProjects.length} of {SEED_PROJECTS.length}</span>
        </div>

        {visibleProjects.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center space-y-3">
            <div className="text-sm font-bold text-slate-900">
              {selectedProgram === 'PROG_4'
                ? 'Member Engagement is a Core Secretariat Pillar'
                : selectedProgram === 'PROG_5'
                ? 'Donor Partnerships & Sustainability is a Core Pillar'
                : 'No projects match your current filter'}
            </div>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              {selectedProgram === 'PROG_4'
                ? 'Managed across all 151 members through AGM governance, regional forums, NetLink, and the 2027 Membership Fee Cycle.'
                : selectedProgram === 'PROG_5'
                ? 'Supports co-financing alliances, bilateral grants, and donor transparency across all EPN countries.'
                : 'Try clearing the search query or switching the status filter.'}
            </p>
            <div className="flex items-center justify-center gap-2 pt-1">
              {selectedProgram === 'PROG_4' && (
                <Link href="/membership" className="px-4 py-2 rounded-full bg-[#004a59] text-white text-xs font-semibold">
                  Open Membership &amp; 2027 Fees &rarr;
                </Link>
              )}
              {selectedProgram === 'PROG_5' && (
                <Link href="/licensing" className="px-4 py-2 rounded-full bg-[#f27f20] text-white text-xs font-semibold">
                  Open Donor Partnerships &rarr;
                </Link>
              )}
              <button
                type="button"
                onClick={() => {
                  setSelectedProgram(null);
                  setStatusFilter('ALL');
                  setQuery('');
                }}
                className="px-4 py-2 rounded-full border border-slate-300 bg-white text-slate-700 text-xs font-semibold cursor-pointer"
              >
                Reset Filters
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {visibleProjects.map(project => {
              const program = STRATEGIC_PROGRAMMES_2021_2025.find(p => p.code === PROJECT_PROGRAM_MAP[project.code]);
              const logo = getFunderLogo(project.funder);
              return (
                <div
                  key={project.code}
                  className="bg-white rounded-2xl border border-slate-200 hover:border-[#004a59] hover:shadow-md transition-all p-5 flex flex-col justify-between gap-4"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[11px] font-bold text-[#004a59] bg-cyan-50 border border-cyan-200 px-2.5 py-0.5 rounded-full">
                          {project.code}
                        </span>
                        <span
                          className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold border ${
                            project.status === 'ACTIVE'
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                              : 'bg-slate-100 text-slate-700 border-slate-200'
                          }`}
                        >
                          {project.status}
                        </span>
                      </div>
                      <span className="font-mono text-sm font-extrabold text-slate-900 tabular-nums">
                        ${project.budget.toLocaleString()}
                      </span>
                    </div>

                    <div>
                      <h3 className="text-base font-bold text-slate-900 leading-snug">{project.name}</h3>
                      <p className="mt-1 text-xs text-slate-600 leading-relaxed">{project.description}</p>
                    </div>

                    {/* Funder with scraped logo if available */}
                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <div className="text-[10px] font-bold uppercase text-slate-400">Funded By</div>
                        <div className="text-xs font-semibold text-slate-900 truncate">{project.funder}</div>
                      </div>
                      {logo && (
                        <img
                          src={logo}
                          alt={project.funder}
                          className="h-7 max-w-[90px] object-contain shrink-0"
                        />
                      )}
                    </div>
                  </div>

                  <div className="space-y-3 pt-3 border-t border-slate-100 text-xs">
                    {/* Visual Metrics */}
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <div className="flex justify-between text-[11px]">
                          <span className="text-slate-500">Facilities</span>
                          <b className="text-[#004a59] tabular-nums">{project.facilitiesCount}</b>
                        </div>
                        <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-[#004a59] rounded-full"
                            style={{ width: `${(project.facilitiesCount / maxFacilities) * 100}%` }}
                          />
                        </div>
                      </div>
                      <div className="space-y-1">
                        <div className="flex justify-between text-[11px]">
                          <span className="text-slate-500">Trained</span>
                          <b className="text-emerald-700 tabular-nums">{project.healthWorkersTrained}</b>
                        </div>
                        <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-emerald-600 rounded-full"
                            style={{ width: `${(project.healthWorkersTrained / maxTrained) * 100}%` }}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Footer metadata */}
                    <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100 text-[11px]">
                      <div className="flex flex-wrap items-center gap-1.5">
                        {project.countries.map(c => (
                          <span key={c} className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-bold text-[10px]">
                            {c}
                          </span>
                        ))}
                      </div>
                      <span className="text-slate-500 font-medium truncate max-w-[220px]" title={priorityName(PROJECT_PRIORITY_MAP[project.code])}>
                        {program?.name ?? 'Cross-cutting'} · {priorityName(PROJECT_PRIORITY_MAP[project.code])}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
