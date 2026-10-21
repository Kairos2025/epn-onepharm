'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Navbar } from '@/components/Navbar';
import {
  NETWORK_STATISTICS,
  HEALTH_PRIORITIES,
  STRATEGIC_PROGRAMMES_2021_2025,
  IMPLEMENTING_MEMBERS_SEED,
  FUNDERS_SEED,
  ACCESS_TIERS,
  PROJECT_PROGRAM_MAP,
  PROJECT_PRIORITY_MAP
} from '@epn/domain';
import { SEED_PROJECTS, SEED_COUNTRIES } from '@epn/db';
import {
  Globe,
  TrendingUp,
  ShieldCheck,
  CheckCircle2,
  Building2,
  Users,
  Activity,
  ArrowRight,
  ExternalLink,
  ChevronRight,
  AlertCircle,
  FileText,
  Lock,
  Sparkles,
  Briefcase,
  Coins,
  GraduationCap,
  Building,
  Globe2,
  BarChart3,
  X,
  Handshake,
  MapPin,
  CalendarClock
} from 'lucide-react';

export default function PublicPortalPage() {
  const [locale, setLocale] = useState<'en' | 'fr'>('en');
  const [selectedPriority, setSelectedPriority] = useState<string>('IPC_AMR');
  const [selectedCountry, setSelectedCountry] = useState<string>('KE');
  const [memberFilter, setMemberFilter] = useState<string>('ALL');
  const [searchMember, setSearchMember] = useState<string>('');
  const [openProgram, setOpenProgram] = useState<string | null>(null);
  const [openCountry, setOpenCountry] = useState<string | null>(null);

  const priorityData = HEALTH_PRIORITIES.find(p => p.code === selectedPriority);

  // Drilldown data for meeting requirement: Priority -> Country -> Hospitals -> FOSA Brief
  const drilldownHospitals: Record<string, Array<{ name: string; member: string; beds: number; availability: string; drf: boolean }>> = {
    KE: [
      { name: 'Kilome Mission Hospital', member: 'CHAK', beds: 120, availability: '94%', drf: true },
      { name: 'Kijabe Hospital & Outpatient Center', member: 'CHAK', beds: 360, availability: '98%', drf: true },
      { name: 'Maua Methodist Hospital', member: 'CHAK', beds: 240, availability: '91%', drf: true }
    ],
    NG: [
      { name: 'St. Gerard Catholic Hospital Kaduna', member: 'CHAN', beds: 210, availability: '88%', drf: true },
      { name: 'ECWA Hospital Egbe', member: 'CHAN', beds: 180, availability: '85%', drf: true }
    ],
    CM: [
      { name: 'Mbingo Baptist Hospital', member: 'CBCHS', beds: 310, availability: '96%', drf: true },
      { name: 'Banso Baptist Hospital', member: 'CBCHS', beds: 240, availability: '90%', drf: true }
    ],
    TZ: [
      { name: 'Bumbuli Lutheran Hospital', member: 'CSSC', beds: 130, availability: '87%', drf: true },
      { name: 'Mvumi Hospital Dodoma', member: 'CSSC', beds: 200, availability: '89%', drf: true }
    ]
  };

  const filteredMembers = IMPLEMENTING_MEMBERS_SEED.filter(m => {
    if (memberFilter !== 'ALL' && m.type !== memberFilter) return false;
    if (searchMember && !m.name.toLowerCase().includes(searchMember.toLowerCase()) && !m.abbreviation.toLowerCase().includes(searchMember.toLowerCase())) {
      return false;
    }
    return true;
  });

  return (
    <div className="flex-1 flex flex-col">
      <Navbar locale={locale} onLocaleChange={l => setLocale(l as any)} />

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-sky-50 via-white to-slate-50 border-b border-slate-200 py-16 sm:py-20">
        {/* Background video: EPN online training course, muted autoplay loop */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
          <iframe
            src="https://www.youtube-nocookie.com/embed/hSgiQQ3vEo8?autoplay=1&mute=1&controls=0&loop=1&playlist=hSgiQQ3vEo8&modestbranding=1&playsinline=1&rel=0&disablekb=1&iv_load_policy=3"
            title="Background video"
            allow="autoplay; encrypted-media"
            tabIndex={-1}
            className="absolute top-1/2 left-1/2 w-full h-full min-w-[177.78vh] min-h-[56.25vw] -translate-x-1/2 -translate-y-1/2"
            style={{ border: 0 }}
          />
          {/* Readability overlay */}
          <div className="absolute inset-0 bg-white/70" />
          <div className="absolute inset-0 bg-gradient-to-b from-white/80 via-white/40 to-white/85" />
        </div>
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-100 text-sky-800 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>{locale === 'en' ? 'Evidence-Based Pharmaceutical Strengthening' : 'Renforcement Pharmaceutique Fondé sur les Données'}</span>
            </div>

            <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight">
              {locale === 'en'
                ? 'One Trusted Platform for Faith-Based Pharmaceutical Systems Across Africa'
                : 'Une Plateforme Unique pour les Systèmes Pharmaceutiques Confessionnels en Afrique'}
            </h1>

            <p className="text-base sm:text-lg text-slate-600 leading-relaxed">
              {locale === 'en'
                ? 'Connecting 149 members, 25,000 health facilities and 300 million people. EPN OnePharm tracks medicine availability, rational use, supply chain resilience, and capacity building in near real time.'
                : 'Reliant 149 membres, 25 000 formations sanitaires et 300 millions de personnes. EPN OnePharm assure le suivi en temps réel de la disponibilité des médicaments et du renforcement des capacités.'}
            </p>

            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-sky-600 hover:bg-sky-700 text-white font-semibold text-sm shadow-sm transition-all"
              >
                <span>{locale === 'en' ? 'Explore Aggregate Data' : 'Explorer les Données'}</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/explorer"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 font-semibold text-sm shadow-sm transition-all"
              >
                <span>{locale === 'en' ? 'Network & Facility Directory' : 'Annuaire du Réseau & FOSA'}</span>
              </Link>
            </div>
          </div>

          {/* Headline Live Badges (Principle P1 & Section 2.1) */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-12 pt-8 border-t border-slate-200/80">
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm text-center">
              <div className="text-3xl font-extrabold text-sky-600 tabular-nums">149</div>
              <div className="text-xs font-semibold text-slate-900 mt-1">Network Members</div>
              <div className="text-[11px] text-slate-500">38 Countries (29 in Africa)</div>
            </div>
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm text-center">
              <div className="text-3xl font-extrabold text-sky-600 tabular-nums">25,000+</div>
              <div className="text-xs font-semibold text-slate-900 mt-1">Health Facilities (FOSA)</div>
              <div className="text-[11px] text-slate-500">Dispensaries to Referral Hospitals</div>
            </div>
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm text-center">
              <div className="text-3xl font-extrabold text-sky-600 tabular-nums">300M+</div>
              <div className="text-xs font-semibold text-slate-900 mt-1">Population Served</div>
              <div className="text-[11px] text-slate-500">Across Sub-Saharan Africa</div>
            </div>
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm text-center">
              <div className="text-3xl font-extrabold text-emerald-600 tabular-nums">84.2%</div>
              <div className="text-xs font-semibold text-slate-900 mt-1">Tracer Availability</div>
              <div className="text-[11px] text-emerald-600 font-medium">Up from 65.0% Baseline</div>
            </div>
          </div>
        </div>
      </section>

      {/* Our 5 Program Areas with expandable program graph panel */}
      <section className="py-14 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="text-center max-w-2xl mx-auto">
            <div className="text-xs font-bold text-sky-600 uppercase tracking-wider">
              {locale === 'en' ? 'How We Work' : 'Notre Approche'}
            </div>
            <h2 className="text-2xl font-bold text-slate-900 mt-1">
              {locale === 'en' ? 'Our 5 Program Areas' : 'Nos 5 Domaines de Programmes'}
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              {locale === 'en'
                ? 'Click a program to open its live overview — projects, budgets, people trained and country reach, all in one view.'
                : 'Cliquez sur un programme pour ouvrir sa vue d’ensemble — projets, budgets, personnes formées et pays couverts.'}
            </p>
          </div>

          {/* Program cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            {STRATEGIC_PROGRAMMES_2021_2025.map(program => {
              const projects = SEED_PROJECTS.filter(p => PROJECT_PROGRAM_MAP[p.code] === program.code);
              const open = openProgram === program.code;
              return (
                <button
                  key={program.code}
                  onClick={() => setOpenProgram(open ? null : program.code)}
                  className={`text-left rounded-xl border p-4 transition-all ${
                    open
                      ? 'border-sky-500 bg-sky-50 ring-2 ring-sky-100 shadow-sm'
                      : 'border-slate-200 bg-white hover:border-sky-300 hover:shadow-md'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      {locale === 'en' ? 'Program' : 'Programme'} {program.sortOrder}
                    </span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-sky-100 text-sky-700 font-semibold">
                      {projects.length}
                    </span>
                  </div>
                  <p className="mt-2 text-sm font-bold text-slate-900 leading-snug">{program.name}</p>
                  <p className="mt-1.5 text-[11px] text-slate-500 leading-snug line-clamp-3">{program.description}</p>
                  <span className={`mt-3 inline-flex items-center gap-1 text-[11px] font-semibold ${open ? 'text-sky-700' : 'text-slate-400'}`}>
                    <BarChart3 className="w-3.5 h-3.5" />
                    {open ? (locale === 'en' ? 'Close overview' : 'Fermer') : locale === 'en' ? 'Open overview' : 'Ouvrir'}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Program modal window: opens on card click, shows combined graph with all data */}
          {(() => {
            const program = STRATEGIC_PROGRAMMES_2021_2025.find(p => p.code === openProgram);
            if (!program) return null;
            const projects = SEED_PROJECTS.filter(p => PROJECT_PROGRAM_MAP[p.code] === program.code);
            const totals = {
              budget: projects.reduce((s, p) => s + p.budget, 0),
              facilities: projects.reduce((s, p) => s + p.facilitiesCount, 0),
              trained: projects.reduce((s, p) => s + p.healthWorkersTrained, 0),
              countries: new Set(projects.flatMap(p => p.countries))
            };
            const maxTrained = Math.max(...projects.map(p => p.healthWorkersTrained), 1);
            const maxFacilities = Math.max(...projects.map(p => p.facilitiesCount), 1);
            const maxBudget = Math.max(...projects.map(p => p.budget), 1);
            const funders = Array.from(new Set(projects.map(p => p.funder)));
            const priorities = Array.from(new Set(projects.map(p => PROJECT_PRIORITY_MAP[p.code]).filter(Boolean))) as string[];

            const kpiTiles = [
              { label: locale === 'en' ? 'Projects' : 'Projets', value: String(projects.length), icon: Briefcase, color: 'text-sky-600' },
              { label: 'Budget (USD)', value: `$${totals.budget.toLocaleString()}`, icon: Coins, color: 'text-emerald-600' },
              { label: locale === 'en' ? 'Facilities reached' : 'Établissements', value: totals.facilities.toLocaleString(), icon: Building, color: 'text-amber-600' },
              { label: locale === 'en' ? 'People trained' : 'Personnes formées', value: totals.trained.toLocaleString(), icon: GraduationCap, color: 'text-violet-600' },
              { label: locale === 'en' ? 'Countries' : 'Pays', value: String(totals.countries.size), icon: Globe2, color: 'text-rose-600' }
            ];

            return (
              <div
                className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4"
                onClick={() => setOpenProgram(null)}
              >
                <div
                  className="w-full max-w-4xl bg-white rounded-2xl shadow-2xl border border-slate-200 max-h-[88vh] overflow-y-auto"
                  onClick={e => e.stopPropagation()}
                >
                  {/* Modal header */}
                  <div className="sticky top-0 bg-white/95 backdrop-blur border-b border-slate-200 px-6 py-4 flex items-start justify-between gap-4 z-10">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-sky-600">
                        {locale === 'en' ? `Program ${program.sortOrder}` : `Programme ${program.sortOrder}`}
                      </span>
                      <h3 className="text-lg font-bold text-slate-900 leading-tight">{program.name}</h3>
                      <p className="text-xs text-slate-500 mt-0.5 max-w-2xl leading-relaxed">{program.description}</p>
                    </div>
                    <button
                      onClick={() => setOpenProgram(null)}
                      className="p-1.5 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-100 shrink-0"
                      aria-label="Close program overview"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="p-6 space-y-6">
                    {/* KPI tiles */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                      {kpiTiles.map(tile => {
                        const Icon = tile.icon;
                        return (
                          <div key={tile.label} className="bg-slate-50 rounded-xl border border-slate-200 p-3.5">
                            <Icon className={`w-4 h-4 ${tile.color}`} />
                            <p className="mt-1.5 text-lg font-extrabold text-slate-900 tabular-nums leading-tight">{tile.value}</p>
                            <p className="text-[10px] text-slate-500 font-medium">{tile.label}</p>
                          </div>
                        );
                      })}
                    </div>

                    {/* Combined graph: all project metrics in one view */}
                    <div className="rounded-xl border border-slate-200 p-4">
                      <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
                        <p className="text-xs font-bold text-slate-700">
                          {locale === 'en' ? 'All project data in one graph' : 'Toutes les données des projets en un graphique'}
                        </p>
                        {/* Legend */}
                        <div className="flex items-center gap-3 text-[10px] font-semibold text-slate-500">
                          <span className="inline-flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-violet-500" />{locale === 'en' ? 'People trained' : 'Formées'}</span>
                          <span className="inline-flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-amber-500" />{locale === 'en' ? 'Facilities' : 'Établissements'}</span>
                          <span className="inline-flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-sky-500" />Budget ($k)</span>
                        </div>
                      </div>

                      <div className="space-y-4">
                        {projects.map(p => (
                          <div key={p.code} className="pb-3 border-b border-slate-100 last:border-0 last:pb-0">
                            <div className="flex items-center justify-between gap-2 mb-1.5">
                              <span className="text-xs font-semibold text-slate-900 truncate" title={p.name}>
                                {p.name.split('(')[0].trim()}
                              </span>
                              <span className="text-[10px] font-medium text-slate-400 shrink-0">{p.countries.join(' · ')}</span>
                            </div>
                            <div className="space-y-1.5">
                              {/* People trained */}
                              <div className="flex items-center gap-2">
                                <div className="flex-1 h-2.5 rounded-full bg-slate-100 overflow-hidden">
                                  <div className="h-full rounded-full bg-violet-500" style={{ width: `${(p.healthWorkersTrained / maxTrained) * 100}%` }} />
                                </div>
                                <span className="w-12 text-right text-[10px] font-bold text-violet-700 tabular-nums">{p.healthWorkersTrained}</span>
                              </div>
                              {/* Facilities */}
                              <div className="flex items-center gap-2">
                                <div className="flex-1 h-2.5 rounded-full bg-slate-100 overflow-hidden">
                                  <div className="h-full rounded-full bg-amber-500" style={{ width: `${(p.facilitiesCount / maxFacilities) * 100}%` }} />
                                </div>
                                <span className="w-12 text-right text-[10px] font-bold text-amber-700 tabular-nums">{p.facilitiesCount}</span>
                              </div>
                              {/* Budget */}
                              <div className="flex items-center gap-2">
                                <div className="flex-1 h-2.5 rounded-full bg-slate-100 overflow-hidden">
                                  <div className="h-full rounded-full bg-sky-500" style={{ width: `${(p.budget / maxBudget) * 100}%` }} />
                                </div>
                                <span className="w-12 text-right text-[10px] font-bold text-sky-700 tabular-nums">${Math.round(p.budget / 1000)}k</span>
                              </div>
                            </div>
                          </div>
                        ))}
                        {projects.length === 0 && (
                          <p className="text-xs text-slate-400 italic">
                            {locale === 'en' ? 'No projects registered in this program yet.' : 'Aucun projet enregistré dans ce programme.'}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Countries, priorities, funders + register link */}
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">
                          {locale === 'en' ? 'Countries covered' : 'Pays couverts'}
                        </p>
                        <div className="flex flex-wrap gap-1.5">
                          {totals.countries.size > 0 ? Array.from(totals.countries).map(c => (
                            <span key={c} className="px-2 py-0.5 rounded-full bg-white border border-slate-200 text-[11px] font-medium text-slate-700">
                              {c}
                            </span>
                          )) : (
                            <span className="text-xs text-slate-400 italic">—</span>
                          )}
                        </div>
                        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mt-3 mb-2">
                          {locale === 'en' ? 'Health priorities' : 'Priorités de santé'}
                        </p>
                        <div className="flex flex-wrap gap-1.5">
                          {priorities.length > 0 ? priorities.map(code => {
                            const pr = HEALTH_PRIORITIES.find(h => h.code === code);
                            return (
                              <span key={code} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-white border border-slate-200" style={{ color: pr?.color }}>
                                <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: pr?.color }} />
                                {pr?.name ?? code}
                              </span>
                            );
                          }) : (
                            <span className="text-[11px] text-slate-500 italic">
                              {locale === 'en' ? 'Cross-cutting across priorities' : 'Transversal'}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">
                          {locale === 'en' ? 'Funders in this program' : 'Bailleurs de ce programme'}
                        </p>
                        <div className="space-y-1.5">
                          {funders.map(f => (
                            <div key={f} className="text-[11px] font-medium text-slate-700 leading-snug">{f}</div>
                          ))}
                        </div>
                        <Link
                          href="/programs"
                          className="mt-3 inline-flex items-center gap-1 text-[11px] font-semibold text-sky-600 hover:text-sky-800"
                        >
                          {locale === 'en' ? 'Open full program register' : 'Registre complet des programmes'}
                          <ArrowRight className="w-3 h-3" />
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })()}
        </div>
      </section>

      {/* Interactive country cards: members, ongoing projects, partners and completed work per area */}
      <section className="py-14 bg-slate-50 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="text-center max-w-2xl mx-auto">
            <div className="text-xs font-bold text-sky-600 uppercase tracking-wider">
              {locale === 'en' ? 'Where We Work' : 'Où Nous Intervenons'}
            </div>
            <h2 className="text-2xl font-bold text-slate-900 mt-1">
              {locale === 'en' ? 'Explore the Network by Country' : 'Explorer le Réseau par Pays'}
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              {locale === 'en'
                ? 'Click a country card to see its health associations, ongoing projects, partners and completed work — all in one interactive card.'
                : 'Cliquez sur une carte pays pour voir ses associations de santé, projets en cours, partenaires et projets réalisés.'}
            </p>
          </div>

          {/* Country cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {SEED_COUNTRIES.map(country => {
              const members = IMPLEMENTING_MEMBERS_SEED.filter(m => m.country === country.code);
              const projects = SEED_PROJECTS.filter(p => p.countries.includes(country.code));
              const ongoing = projects.filter(p => p.status === 'ACTIVE').length;
              const done = projects.filter(p => p.status === 'COMPLETED').length;
              const hasData = members.length > 0 || projects.length > 0;
              return (
                <button
                  key={country.code}
                  onClick={() => setOpenCountry(country.code)}
                  className={`text-left rounded-xl border p-3.5 transition-all ${
                    hasData
                      ? 'border-slate-200 bg-white hover:border-sky-300 hover:shadow-md'
                      : 'border-slate-200/60 bg-white/60 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-800 text-white">{country.code}</span>
                    {hasData ? (
                      <span className="w-2 h-2 rounded-full bg-emerald-500" title={locale === 'en' ? 'Active presence' : 'Présence active'} />
                    ) : (
                      <span className="w-2 h-2 rounded-full bg-slate-300" title={locale === 'en' ? 'Mapped, data pending' : 'Cartographié, données à venir'} />
                    )}
                  </div>
                  <p className="mt-2 text-xs font-bold text-slate-900 leading-tight truncate" title={country.name}>{country.name}</p>
                  <div className="mt-2 flex items-center gap-2.5 text-[10px] text-slate-500">
                    <span className="inline-flex items-center gap-0.5"><Users className="w-3 h-3" />{members.length}</span>
                    <span className="inline-flex items-center gap-0.5"><CalendarClock className="w-3 h-3" />{ongoing}</span>
                    <span className="inline-flex items-center gap-0.5"><CheckCircle2 className="w-3 h-3" />{done}</span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Country detail modal window */}
          {(() => {
            if (!openCountry) return null;
            const country = SEED_COUNTRIES.find(c => c.code === openCountry);
            if (!country) return null;
            const members = IMPLEMENTING_MEMBERS_SEED.filter(m => m.country === country.code);
            const projects = SEED_PROJECTS.filter(p => p.countries.includes(country.code));
            const ongoing = projects.filter(p => p.status === 'ACTIVE');
            const done = projects.filter(p => p.status === 'COMPLETED');
            const partners = Array.from(new Set(projects.map(p => p.funder)));
            const facilities = drilldownHospitals[country.code] ?? [];

            const tiles = [
              { label: locale === 'en' ? 'Health associations' : 'Associations de santé', value: String(members.length), icon: Users, color: 'text-sky-600' },
              { label: locale === 'en' ? 'Ongoing projects' : 'Projets en cours', value: String(ongoing.length), icon: CalendarClock, color: 'text-amber-600' },
              { label: locale === 'en' ? 'Projects completed' : 'Projets réalisés', value: String(done.length), icon: CheckCircle2, color: 'text-emerald-600' },
              { label: locale === 'en' ? 'Partners involved' : 'Partenaires impliqués', value: String(partners.length), icon: Handshake, color: 'text-violet-600' },
              { label: locale === 'en' ? 'Facilities listed' : 'Établissements listés', value: String(facilities.length), icon: MapPin, color: 'text-rose-600' }
            ];

            return (
              <div
                className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4"
                onClick={() => setOpenCountry(null)}
              >
                <div
                  className="w-full max-w-4xl bg-white rounded-2xl shadow-2xl border border-slate-200 max-h-[88vh] overflow-y-auto"
                  onClick={e => e.stopPropagation()}
                >
                  {/* Modal header */}
                  <div className="sticky top-0 bg-white/95 backdrop-blur border-b border-slate-200 px-6 py-4 flex items-start justify-between gap-4 z-10">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-sky-600">
                        {locale === 'en' ? 'Country overview' : 'Vue par pays'} · {country.code}
                      </span>
                      <h3 className="text-lg font-bold text-slate-900 leading-tight">{country.name}</h3>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {locale === 'en' ? 'EPN network presence, projects and partners in this area.' : 'Présence du réseau EPN, projets et partenaires dans cette zone.'}
                      </p>
                    </div>
                    <button
                      onClick={() => setOpenCountry(null)}
                      className="p-1.5 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-100 shrink-0"
                      aria-label="Close country overview"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="p-6 space-y-6">
                    {/* Summary tiles */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                      {tiles.map(tile => {
                        const Icon = tile.icon;
                        return (
                          <div key={tile.label} className="bg-slate-50 rounded-xl border border-slate-200 p-3.5">
                            <Icon className={`w-4 h-4 ${tile.color}`} />
                            <p className="mt-1.5 text-lg font-extrabold text-slate-900 tabular-nums leading-tight">{tile.value}</p>
                            <p className="text-[10px] text-slate-500 font-medium">{tile.label}</p>
                          </div>
                        );
                      })}
                    </div>

                    <div className="grid gap-5 lg:grid-cols-2">
                      {/* Health associations */}
                      <div className="rounded-xl border border-slate-200 p-4">
                        <p className="text-xs font-bold text-slate-700 mb-3">
                          {locale === 'en' ? 'Health associations (members)' : 'Associations de santé (membres)'}
                        </p>
                        <div className="space-y-2">
                          {members.length > 0 ? members.map(m => (
                            <div key={m.abbreviation} className="flex items-center justify-between gap-2 py-1.5">
                              <div className="min-w-0">
                                <span className="text-xs font-bold text-sky-700 bg-sky-50 px-1.5 py-0.5 rounded mr-2">{m.abbreviation}</span>
                                <span className="text-[11px] text-slate-600">{m.name}</span>
                              </div>
                              <span className="text-[9px] font-bold uppercase text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded shrink-0">{m.type}</span>
                            </div>
                          )) : (
                            <p className="text-xs text-slate-400 italic">
                              {locale === 'en' ? 'No member chapter registered yet — mapped for network expansion.' : 'Aucun chapitre membre — cartographié pour l’expansion.'}
                            </p>
                          )}
                        </div>

                        {/* Partners */}
                        <p className="text-xs font-bold text-slate-700 mt-4 mb-2">
                          {locale === 'en' ? 'Partners & funders' : 'Partenaires et bailleurs'}
                        </p>
                        <div className="flex flex-wrap gap-1.5">
                          {partners.length > 0 ? partners.map(f => (
                            <span key={f} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-violet-50 text-[10px] font-medium text-violet-700 border border-violet-100">
                              <Handshake className="w-3 h-3" />
                              {f}
                            </span>
                          )) : (
                            <span className="text-xs text-slate-400 italic">—</span>
                          )}
                        </div>
                      </div>

                      {/* Projects: ongoing + completed */}
                      <div className="rounded-xl border border-slate-200 p-4">
                        <p className="text-xs font-bold text-slate-700 mb-3">
                          {locale === 'en' ? 'Projects in this area' : 'Projets dans cette zone'}
                        </p>
                        {projects.length === 0 && (
                          <p className="text-xs text-slate-400 italic">
                            {locale === 'en' ? 'No projects registered in this area yet.' : 'Aucun projet enregistré dans cette zone.'}
                          </p>
                        )}
                        <div className="space-y-2">
                          {ongoing.map(p => (
                            <div key={p.code} className="py-1.5 border-b border-slate-100 last:border-0">
                              <div className="flex items-center justify-between gap-2">
                                <span className="text-[11px] font-semibold text-slate-900 truncate" title={p.name}>{p.name}</span>
                                <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-800 shrink-0">{locale === 'en' ? 'ONGOING' : 'EN COURS'}</span>
                              </div>
                              <span className="text-[10px] text-slate-500">{p.funder} · {p.healthWorkersTrained} {locale === 'en' ? 'trained' : 'formés'} · ${Math.round(p.budget / 1000)}k</span>
                            </div>
                          ))}
                          {done.map(p => (
                            <div key={p.code} className="py-1.5 border-b border-slate-100 last:border-0">
                              <div className="flex items-center justify-between gap-2">
                                <span className="text-[11px] font-semibold text-slate-500 truncate" title={p.name}>{p.name}</span>
                                <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 shrink-0">{locale === 'en' ? 'DONE' : 'RÉALISÉ'}</span>
                              </div>
                              <span className="text-[10px] text-slate-500">{p.funder} · {p.healthWorkersTrained} {locale === 'en' ? 'trained' : 'formés'} · ${Math.round(p.budget / 1000)}k</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Facilities + full register link */}
                    <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                      <p className="text-xs font-bold text-slate-700 mb-3">
                        {locale === 'en' ? 'Featured health facilities' : 'Établissements de santé phares'}
                      </p>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                        {facilities.map((h, idx) => (
                          <div key={idx} className="bg-white rounded-lg border border-slate-200 p-3">
                            <p className="text-[11px] font-bold text-slate-900 leading-tight">{h.name}</p>
                            <p className="mt-1 text-[10px] text-slate-500">{h.member} · {h.beds} beds · {h.availability}</p>
                          </div>
                        ))}
                        {facilities.length === 0 && (
                          <p className="text-xs text-slate-400 italic sm:col-span-3">
                            {locale === 'en' ? 'Full facility master list for this country is being onboarded (CSV import).' : 'La liste complète des établissements pour ce pays est en cours d’intégration.'}
                          </p>
                        )}
                      </div>
                      <Link
                        href="/explorer"
                        className="mt-3 inline-flex items-center gap-1 text-[11px] font-semibold text-sky-600 hover:text-sky-800"
                      >
                        {locale === 'en' ? 'Open network explorer' : 'Ouvrir l’explorateur du réseau'}
                        <ArrowRight className="w-3 h-3" />
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            );
          })()}
        </div>
      </section>

      {/* Strategic Programmes & Priority Explorer with Drilldown (Meeting requirement) */}
      <section className="py-14 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div>
            <div className="text-xs font-bold text-sky-600 uppercase tracking-wider">Strategic Framework</div>
            <h2 className="text-2xl font-bold text-slate-900 mt-1">
              {locale === 'en' ? 'Health Priority & Facility Drilldown' : 'Priorités Sanitaires & Exploration des Hôpitaux'}
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Select a health priority to drill into participating countries, affiliated hospitals, and facility-level briefs.
            </p>
          </div>

          {/* Priority selector tabs */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {HEALTH_PRIORITIES.map(priority => {
              const active = selectedPriority === priority.code;
              return (
                <button
                  key={priority.code}
                  onClick={() => setSelectedPriority(priority.code)}
                  className={`p-4 rounded-xl border text-left transition-all ${
                    active
                      ? 'border-sky-600 bg-sky-50/70 shadow-sm ring-1 ring-sky-600'
                      : 'border-slate-200 bg-white hover:border-slate-300'
                  }`}
                >
                  <div className="w-2.5 h-2.5 rounded-full mb-2" style={{ backgroundColor: priority.color }} />
                  <div className="text-xs font-bold text-slate-900 leading-snug">{priority.name}</div>
                  <div className="text-[11px] text-slate-500 mt-1 line-clamp-2">{priority.description}</div>
                </button>
              );
            })}
          </div>

          {/* Drilldown view: Priority -> Country -> Hospitals */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200">
              <div>
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Active Priority:</span>
                <h3 className="text-base font-bold text-slate-900">{priorityData?.name}</h3>
              </div>

              {/* Country selector */}
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-600 font-medium">Select Country:</span>
                <div className="flex gap-1.5">
                  {['KE', 'NG', 'CM', 'TZ'].map(cCode => (
                    <button
                      key={cCode}
                      onClick={() => setSelectedCountry(cCode)}
                      className={`px-3 py-1 text-xs font-bold rounded-md transition-colors ${
                        selectedCountry === cCode
                          ? 'bg-sky-600 text-white'
                          : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {cCode === 'KE' ? 'Kenya' : cCode === 'NG' ? 'Nigeria' : cCode === 'CM' ? 'Cameroon' : 'Tanzania'}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Hospitals list in this drilldown */}
            <div className="mt-5">
              <div className="text-xs font-semibold text-slate-500 mb-3 uppercase tracking-wider">
                Participating Church Health Facilities in {selectedCountry === 'KE' ? 'Kenya' : selectedCountry === 'NG' ? 'Nigeria' : selectedCountry === 'CM' ? 'Cameroon' : 'Tanzania'}:
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {(drilldownHospitals[selectedCountry] || []).map((h, idx) => (
                  <div key={idx} className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm space-y-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="text-sm font-bold text-slate-900 leading-tight">{h.name}</h4>
                        <span className="text-[11px] text-slate-500 font-medium">Supported by {h.member}</span>
                      </div>
                      <span className="text-[10px] bg-sky-100 text-sky-800 px-2 py-0.5 rounded font-semibold">
                        {h.beds} Beds
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-[11px] pt-2 border-t border-slate-100">
                      <div>
                        <span className="text-slate-400 block">Tracer Avail</span>
                        <span className="font-bold text-emerald-600 text-xs">{h.availability}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block">Active DRF</span>
                        <span className="font-bold text-slate-700 text-xs">{h.drf ? 'Yes (Audited)' : 'No'}</span>
                      </div>
                    </div>

                    <Link
                      href={`/explorer?fosa=${encodeURIComponent(h.name)}`}
                      className="text-xs font-semibold text-sky-600 hover:text-sky-800 flex items-center gap-1 pt-1"
                    >
                      <span>View Full FOSA Profile</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Verified Reported Results (Section 2.5) */}
      <section className="py-14 bg-slate-50 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2">
            <div>
              <div className="text-xs font-bold text-sky-600 uppercase tracking-wider">Annual Report 2025/2026</div>
              <h2 className="text-2xl font-bold text-slate-900 mt-1">Network Result Indicators & Milestones</h2>
            </div>
            <div className="text-xs text-slate-500">Source: EPN 2025/2026 General Assembly Documentation</div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-500">
                <span>Stock-out Reduction</span>
                <span className="text-emerald-600 font-bold">-7% Reported</span>
              </div>
              <div className="text-2xl font-extrabold text-slate-900">79% → 72%</div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Reported cohort of faith-based facilities significantly cut tracer stock-out frequency via AMT tracking.
              </p>
            </div>

            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-500">
                <span>DTC & Quality Structures</span>
                <span className="text-sky-600 font-bold">400+ Active</span>
              </div>
              <div className="text-2xl font-extrabold text-slate-900">400+ Committees</div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Functional Drug & Therapeutics (DTC), Infection Prevention & Control (IPC), and AMS stewardship teams.
              </p>
            </div>

            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-500">
                <span>Drug Revolving Fund Accounts</span>
                <span className="text-sky-600 font-bold">250 Facilities</span>
              </div>
              <div className="text-2xl font-extrabold text-slate-900">250 Accounts</div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Self-sustaining ring-fenced pharmacy capital models preventing medicine supply disruptions.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Success Stories Carousel with Before/After (Section 8.9) */}
      <section className="py-14 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs font-bold text-sky-600 uppercase tracking-wider">Evidence of Change</div>
              <h2 className="text-2xl font-bold text-slate-900 mt-1">Impact Stories from Church Health Networks</h2>
            </div>
            <Link href="/stories" className="text-xs font-semibold text-sky-600 hover:text-sky-800 flex items-center gap-1">
              <span>View All Stories</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-slate-50 rounded-xl border border-slate-200 overflow-hidden shadow-sm flex flex-col">
              <div className="p-6 flex-1 space-y-3">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-emerald-100 text-emerald-800 uppercase">
                    Consent Verified
                  </span>
                  <span className="text-xs text-slate-500">Kilome Mission Hospital • Kenya</span>
                </div>
                <h3 className="text-base font-bold text-slate-900">
                  Eliminating Amoxicillin Stock-outs in Rural Machakos Satellite Dispensaries
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Before the introduction of the EPN Drug Revolving Fund (DRF) training, the dispensary experienced up to 18 stock-out days per month. Following active committee establishment, availability rose to 94%.
                </p>

                {/* Before / After Metrics comparison */}
                <div className="grid grid-cols-2 gap-3 pt-3 border-t border-slate-200 text-xs">
                  <div className="bg-white p-2.5 rounded border border-rose-200">
                    <span className="text-[10px] text-rose-600 font-bold uppercase">Before EPN DRF</span>
                    <div className="text-lg font-bold text-rose-700 mt-0.5">18 Days/Mo</div>
                    <span className="text-[10px] text-slate-500">Frequent stock-outs</span>
                  </div>
                  <div className="bg-white p-2.5 rounded border border-emerald-200">
                    <span className="text-[10px] text-emerald-600 font-bold uppercase">After EPN DRF</span>
                    <div className="text-lg font-bold text-emerald-700 mt-0.5">0 Days/Mo</div>
                    <span className="text-[10px] text-slate-500">100% Tracer availability</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-slate-50 rounded-xl border border-slate-200 overflow-hidden shadow-sm flex flex-col">
              <div className="p-6 flex-1 space-y-3">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-emerald-100 text-emerald-800 uppercase">
                    Consent Verified
                  </span>
                  <span className="text-xs text-slate-500">CBCHS Minilab Network • Cameroon</span>
                </div>
                <h3 className="text-base font-bold text-slate-900">
                  Minilab Post-Marketing Surveillance Intercepts Falsified Antibiotics
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Supported by Difaem and EPN, two GPHF Minilab stations detected zero active pharmaceutical ingredient (API) in commercial shipments of cephalosporins, protecting over 800 surgical inpatients.
                </p>

                {/* Before / After Metrics comparison */}
                <div className="grid grid-cols-2 gap-3 pt-3 border-t border-slate-200 text-xs">
                  <div className="bg-white p-2.5 rounded border border-rose-200">
                    <span className="text-[10px] text-rose-600 font-bold uppercase">Screening Result</span>
                    <div className="text-lg font-bold text-rose-700 mt-0.5">0% API Found</div>
                    <span className="text-[10px] text-slate-500">Counterfeit Batch Quarantined</span>
                  </div>
                  <div className="bg-white p-2.5 rounded border border-emerald-200">
                    <span className="text-[10px] text-emerald-600 font-bold uppercase">Patient Safety</span>
                    <div className="text-lg font-bold text-emerald-700 mt-0.5">800+ Patients</div>
                    <span className="text-[10px] text-slate-500">Harm prevented</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Member Organizations Directory Filter (Section 2.1 & 8.7) */}
      <section className="py-14 bg-slate-50 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="text-xs font-bold text-sky-600 uppercase tracking-wider">Network Directory</div>
              <h2 className="text-2xl font-bold text-slate-900 mt-1">Implementing Church Health Members</h2>
            </div>

            {/* Filter buttons */}
            <div className="flex flex-wrap gap-2 text-xs">
              {['ALL', 'CHA', 'DSO', 'CHI', 'HSS'].map(cat => (
                <button
                  key={cat}
                  onClick={() => setMemberFilter(cat)}
                  className={`px-3 py-1.5 rounded-md font-semibold transition-colors ${
                    memberFilter === cat
                      ? 'bg-sky-600 text-white'
                      : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {cat === 'ALL' ? 'All Types' : cat}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredMembers.map(m => (
              <div key={m.abbreviation + m.country} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-2">
                <div className="flex items-start justify-between">
                  <span className="text-xs font-bold text-sky-700 bg-sky-50 px-2 py-0.5 rounded">{m.abbreviation}</span>
                  <span className="text-[10px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded uppercase">
                    {m.country} • {m.type}
                  </span>
                </div>
                <h4 className="text-xs font-bold text-slate-900 leading-snug">{m.name}</h4>
                <div className="pt-2 flex justify-between items-center text-[11px] text-slate-500 border-t border-slate-100">
                  <span>Status: Active Chapter</span>
                  <Link href={`/explorer?member=${m.abbreviation}`} className="text-sky-600 font-semibold hover:underline">
                    View Network →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Access Tiers & Subscriptions (Section 12.3) */}
      <section className="py-14 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="text-center max-w-2xl mx-auto">
            <div className="text-xs font-bold text-sky-600 uppercase tracking-wider">Access Tiers & Governance</div>
            <h2 className="text-2xl font-bold text-slate-900 mt-1">Multi-Tier Data Access & Subscriptions</h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              EPN respects member data sovereignty. Access is governed by member data-sharing agreements (DSA) and privacy cell suppression.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {ACCESS_TIERS.slice(0, 4).map(tier => (
              <div key={tier.tier} className="bg-slate-50 rounded-xl border border-slate-200 p-5 flex flex-col justify-between space-y-4 shadow-sm">
                <div className="space-y-2">
                  <div className="text-xs font-bold text-sky-600 uppercase tracking-wider">{tier.tier}</div>
                  <h4 className="text-base font-bold text-slate-900">{tier.name}</h4>
                  <p className="text-xs text-slate-600 leading-relaxed">{tier.description}</p>
                </div>
                <div className="pt-3 border-t border-slate-200 space-y-1 text-xs text-slate-600">
                  <div><span className="font-semibold text-slate-800">Granularity:</span> {tier.granularity}</div>
                  <div><span className="font-semibold text-slate-800">Export:</span> {tier.export}</div>
                </div>
                <Link
                  href="/billing"
                  className="w-full text-center py-2 text-xs font-semibold rounded bg-white hover:bg-slate-100 text-slate-800 border border-slate-300 transition-colors shadow-xs"
                >
                  {tier.tier === 'PUBLIC' ? 'Current Access' : 'Select Plan'}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 py-12 text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-8 border-b border-slate-800">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded bg-sky-500 text-white font-bold flex items-center justify-center text-sm">
                  EPN
                </div>
                <span className="text-white font-bold text-base">OnePharm</span>
              </div>
              <p className="text-slate-400 leading-relaxed text-xs">
                Ecumenical Pharmaceutical Network (EPN), P.O. Box 73860-00200 Nairobi, Kenya. Modelled on DHIS2 conventions for church health networks.
              </p>
            </div>

            <div className="space-y-2">
              <h5 className="text-white font-semibold uppercase tracking-wider text-[11px]">Key Applications</h5>
              <ul className="space-y-1.5">
                <li><Link href="/dashboard" className="hover:text-white">Analytics Dashboard</Link></li>
                <li><Link href="/explorer" className="hover:text-white">Network Explorer</Link></li>
                <li><Link href="/data-entry" className="hover:text-white">Data Entry (DHIS2 Form)</Link></li>
                <li><Link href="/visualizer" className="hover:text-white">Data Visualizer</Link></li>
                <li><Link href="/medstock" className="hover:text-white">Medstock Inventory</Link></li>
              </ul>
            </div>

            <div className="space-y-2">
              <h5 className="text-white font-semibold uppercase tracking-wider text-[11px]">Funders & Partners</h5>
              <ul className="space-y-1.5 text-slate-400">
                <li>Bread for the World (Brot für die Welt)</li>
                <li>Bill & Melinda Gates Foundation</li>
                <li>BMZ via action medeor</li>
                <li>Difaem (German Institute for Medical Mission)</li>
                <li>BEGECA eG • Plan:g • Fresenius Kabi</li>
              </ul>
            </div>

            <div className="space-y-2">
              <h5 className="text-white font-semibold uppercase tracking-wider text-[11px]">Governance & Compliance</h5>
              <p className="leading-relaxed">
                Compliant with Kenya Data Protection Act 2019 and GDPR. EPN tracks aggregate indicators only. No patient-level or identifiable health records are processed.
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px]">
            <div>© 2026 Ecumenical Pharmaceutical Network (EPN). All rights reserved.</div>
            <div className="flex gap-4">
              <Link href="/docs" className="hover:text-white">DHIS2 Tutorial Standards</Link>
              <Link href="/privacy" className="hover:text-white">Data Sharing Framework</Link>
              <Link href="/accessibility" className="hover:text-white">WCAG AA Statement</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
