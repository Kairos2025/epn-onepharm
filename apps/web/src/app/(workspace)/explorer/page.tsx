'use client';

import React, { Suspense, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Navbar } from '@/components/Navbar';
import Link from 'next/link';
import {
  Network,
  Building,
  FolderKanban,
  Coins,
  Globe2,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  ChevronRight,
  Search,
  Filter,
  Layers,
  MapPin,
  Package
} from 'lucide-react';
import { IMPLEMENTING_MEMBERS_SEED, FUNDERS_SEED, MEMBER_CATEGORIES, NETWORK_STATISTICS } from '@epn/domain';
import { SEED_PROJECTS, SEED_COUNTRIES } from '@epn/db';

type TabKind = 'DIRECTORY' | 'MEMBERS' | 'FACILITIES' | 'PROJECTS' | 'FUNDERS' | 'COVERAGE';
const TAB_KINDS: readonly TabKind[] = ['DIRECTORY', 'MEMBERS', 'FACILITIES', 'PROJECTS', 'FUNDERS', 'COVERAGE'];

function ExplorerInner() {
  const searchParams = useSearchParams();
  const requestedTab = searchParams.get('tab') as TabKind | null;
  const [activeTab, setActiveTab] = useState<TabKind>(
    requestedTab && TAB_KINDS.includes(requestedTab) ? requestedTab : 'DIRECTORY'
  );
  const [selectedMember, setSelectedMember] = useState<string>(searchParams.get('member') || 'CHAK');
  const [selectedFacility, setSelectedFacility] = useState<string>(searchParams.get('fosa') || 'Kilome Mission Hospital');
  const [directoryQuery, setDirectoryQuery] = useState('');
  const [directoryCategory, setDirectoryCategory] = useState<string>('ALL');
  const [fosaQuery, setFosaQuery] = useState('');
  const [fosaClass, setFosaClass] = useState<string>('ALL');
  const [fosaMemberFilter, setFosaMemberFilter] = useState<string>('ALL');
  const [fosaGovernanceFilter, setFosaGovernanceFilter] = useState<'ALL' | 'COMPLIANT' | 'ATTENTION'>('ALL');

  useEffect(() => {
    const tabParam = searchParams.get('tab') as TabKind | null;
    if (tabParam && TAB_KINDS.includes(tabParam)) {
      setActiveTab(tabParam);
    }
    const memberParam = searchParams.get('member');
    if (memberParam) {
      setSelectedMember(memberParam);
    }
    const fosaParam = searchParams.get('fosa');
    if (fosaParam) {
      setSelectedFacility(fosaParam);
    }
  }, [searchParams]);

  // Sample facilities
  const facilities = [
    {
      id: 'fac1',
      name: 'Kilome Mission Hospital',
      member: 'CHAK',
      country: 'KE',
      level: 'HOSPITAL',
      beds: 120,
      catchment: 85000,
      services: ['Outpatient', 'Inpatient', 'Maternity', 'Pediatrics', 'Pharmacy', 'Lab', 'AMR Surveillance'],
      dtc: true,
      ipc: true,
      drf: true,
      tracerAvail: '94.2%',
      stockoutDays: 1,
      medstockActive: true,
      lastUpdate: '2026-10-18'
    },
    {
      id: 'fac2',
      name: 'Kijabe Hospital & Satellite Centers',
      member: 'CHAK',
      country: 'KE',
      level: 'REFERRAL_HOSPITAL',
      beds: 360,
      catchment: 220000,
      services: ['Comprehensive Surgical', 'EmONC', 'ICU', 'Specialist Pharmacy', 'Minilab'],
      dtc: true,
      ipc: true,
      drf: true,
      tracerAvail: '98.0%',
      stockoutDays: 0,
      medstockActive: true,
      lastUpdate: '2026-10-19'
    },
    {
      id: 'fac3',
      name: 'St. Gerard Catholic Hospital Kaduna',
      member: 'CHAN',
      country: 'NG',
      level: 'HOSPITAL',
      beds: 210,
      catchment: 180000,
      services: ['General Medicine', 'Maternity', 'Pediatrics', 'DRF Pharmacy'],
      dtc: true,
      ipc: true,
      drf: true,
      tracerAvail: '88.5%',
      stockoutDays: 3,
      medstockActive: false,
      lastUpdate: '2026-10-15'
    },
    {
      id: 'fac4',
      name: 'Mbingo Baptist Hospital',
      member: 'CBCHS',
      country: 'CM',
      level: 'REFERRAL_HOSPITAL',
      beds: 310,
      catchment: 250000,
      services: ['Teaching Hospital', 'Minilab Surveillance', 'Oncology', 'Surgical'],
      dtc: true,
      ipc: true,
      drf: true,
      tracerAvail: '96.2%',
      stockoutDays: 1,
      medstockActive: true,
      lastUpdate: '2026-10-17'
    },
    {
      id: 'fac5',
      name: 'Bunia Evangelical Health Centre',
      member: 'CECA 20',
      country: 'CD',
      level: 'HEALTH_CENTRE',
      beds: 48,
      catchment: 42000,
      services: ['Outpatient', 'Maternity', 'Immunization', 'Essential Pharmacy'],
      dtc: true,
      ipc: true,
      drf: false,
      tracerAvail: '84.0%',
      stockoutDays: 4,
      medstockActive: true,
      lastUpdate: '2026-10-14'
    },
    {
      id: 'fac6',
      name: 'Tenwek Community Dispensary',
      member: 'CHAK',
      country: 'KE',
      level: 'DISPENSARY',
      beds: 8,
      catchment: 15000,
      services: ['Primary Care', 'MCH', 'Dispensary'],
      dtc: false,
      ipc: true,
      drf: true,
      tracerAvail: '91.5%',
      stockoutDays: 2,
      medstockActive: false,
      lastUpdate: '2026-10-12'
    }
  ];

  const activeFac =
    facilities.find(f => f.name === selectedFacility) ||
    facilities.filter(f => f.member === selectedMember)[0] ||
    facilities[0];

  const memberObj = IMPLEMENTING_MEMBERS_SEED.find(m => m.abbreviation === selectedMember);
  const memberFacilities = facilities.filter(f => f.member === selectedMember);
  const countryName = (code: string) => SEED_COUNTRIES.find(c => c.code === code)?.name ?? code;

  const selectMember = (abbr: string) => {
    setSelectedMember(abbr);
    const first = facilities.find(f => f.member === abbr);
    if (first) setSelectedFacility(first.name);
  };

  const openFosa = (name: string) => {
    setSelectedFacility(name);
    setActiveTab('FACILITIES');
  };

  const filteredDirectoryMembers = useMemo(() => {
    const q = directoryQuery.trim().toLowerCase();
    return IMPLEMENTING_MEMBERS_SEED.filter(m => {
      const matchesCat = directoryCategory === 'ALL' || m.type === directoryCategory;
      const matchesQuery =
        !q ||
        m.abbreviation.toLowerCase().includes(q) ||
        m.name.toLowerCase().includes(q) ||
        countryName(m.country).toLowerCase().includes(q) ||
        m.country.toLowerCase().includes(q);
      return matchesCat && matchesQuery;
    });
  }, [directoryQuery, directoryCategory]);

  const openMemberProfile = (abbr: string) => {
    selectMember(abbr);
    setActiveTab('MEMBERS');
  };

  const filteredFacilities = useMemo(() => {
    const q = fosaQuery.trim().toLowerCase();
    return facilities.filter(f => {
      const matchesClass = fosaClass === 'ALL' || f.level === fosaClass;
      const matchesMember = fosaMemberFilter === 'ALL' || f.member === fosaMemberFilter;
      const fullGov = f.dtc && f.ipc && f.drf;
      const matchesGov =
        fosaGovernanceFilter === 'ALL' ||
        (fosaGovernanceFilter === 'COMPLIANT' && fullGov) ||
        (fosaGovernanceFilter === 'ATTENTION' && !fullGov);
      const matchesQuery =
        !q ||
        f.name.toLowerCase().includes(q) ||
        f.member.toLowerCase().includes(q) ||
        f.country.toLowerCase().includes(q) ||
        f.services.some(s => s.toLowerCase().includes(q));
      return matchesClass && matchesMember && matchesGov && matchesQuery;
    });
  }, [fosaQuery, fosaClass, fosaMemberFilter, fosaGovernanceFilter]);

  const fosaClassCounts = useMemo(
    () => ({
      REFERRAL_HOSPITAL: facilities.filter(f => f.level === 'REFERRAL_HOSPITAL').length,
      HOSPITAL: facilities.filter(f => f.level === 'HOSPITAL').length,
      HEALTH_CENTRE: facilities.filter(f => f.level === 'HEALTH_CENTRE').length,
      DISPENSARY: facilities.filter(f => f.level === 'DISPENSARY').length,
      COMPLIANT: facilities.filter(f => f.dtc && f.ipc && f.drf).length
    }),
    []
  );

  return (
    <div className="flex-1 flex flex-col bg-slate-50 min-h-screen">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full space-y-6">
        {/* Navigation Breadcrumb / Pivot rail */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-xs flex-wrap">
            <span className="font-semibold text-slate-500 uppercase tracking-wider">Circular Navigation:</span>
            <button
              onClick={() => setActiveTab('MEMBERS')}
              title="Open member view"
              className="font-bold text-sky-700 bg-sky-50 px-2 py-0.5 rounded hover:bg-sky-100 transition-colors"
            >
              Member: {selectedMember}
            </button>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
            <button
              onClick={() => setActiveTab('FACILITIES')}
              title="Open facility brief"
              className="font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded hover:bg-slate-200 transition-colors"
            >
              Facility: {activeFac.name}
            </button>
          </div>

          {/* Top Tabs */}
          <div className="flex flex-wrap items-center gap-1.5 text-xs">
            <button
              onClick={() => setActiveTab('DIRECTORY')}
              className={`px-3 py-1.5 rounded-lg font-semibold flex items-center gap-1.5 transition-colors ${
                activeTab === 'DIRECTORY' ? 'bg-sky-600 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              <Search className="w-3.5 h-3.5" />
              <span>Member Directory ({NETWORK_STATISTICS.totalMembers})</span>
            </button>
            <button
              onClick={() => setActiveTab('MEMBERS')}
              className={`px-3 py-1.5 rounded-lg font-semibold flex items-center gap-1.5 transition-colors ${
                activeTab === 'MEMBERS' ? 'bg-sky-600 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              <Network className="w-3.5 h-3.5" />
              <span>Member Profiles ({IMPLEMENTING_MEMBERS_SEED.length})</span>
            </button>
            <button
              onClick={() => setActiveTab('FACILITIES')}
              className={`px-3 py-1.5 rounded-lg font-semibold flex items-center gap-1.5 transition-colors ${
                activeTab === 'FACILITIES' ? 'bg-sky-600 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              <Building className="w-3.5 h-3.5" />
              <span>Facilities (FOSA)</span>
            </button>
            <button
              onClick={() => setActiveTab('PROJECTS')}
              className={`px-3 py-1.5 rounded-lg font-semibold flex items-center gap-1.5 transition-colors ${
                activeTab === 'PROJECTS' ? 'bg-sky-600 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              <FolderKanban className="w-3.5 h-3.5" />
              <span>Projects ({SEED_PROJECTS.length})</span>
            </button>
            <button
              onClick={() => setActiveTab('FUNDERS')}
              className={`px-3 py-1.5 rounded-lg font-semibold flex items-center gap-1.5 transition-colors ${
                activeTab === 'FUNDERS' ? 'bg-sky-600 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              <Coins className="w-3.5 h-3.5" />
              <span>Funders ({FUNDERS_SEED.length})</span>
            </button>
            <button
              onClick={() => setActiveTab('COVERAGE')}
              className={`px-3 py-1.5 rounded-lg font-semibold flex items-center gap-1.5 transition-colors ${
                activeTab === 'COVERAGE' ? 'bg-sky-600 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Network Coverage</span>
            </button>
          </div>
        </div>

        {/* Tab 0: Member Directory (Master List & Category Breakdown) */}
        {activeTab === 'DIRECTORY' && (
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <div className="text-xs font-bold text-sky-600 uppercase tracking-wider">
                    Official Network Registry • {NETWORK_STATISTICS.asOf}
                  </div>
                  <h2 className="text-xl font-bold text-slate-900 mt-0.5">
                    EPN One Network Member Directory ({NETWORK_STATISTICS.totalMembers} Members across {NETWORK_STATISTICS.totalCountries} Countries)
                  </h2>
                  <p className="text-xs text-slate-500 mt-1">
                    76 Ordinary voting members &bull; 75 Associate members &bull; Select any implementing member chapter below to open its full Member Profile.
                  </p>
                </div>
                <Link
                  href="/membership"
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 shrink-0"
                >
                  <span>Open Membership Health &amp; 2027 Fees</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              {/* Category Summary Pills */}
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 pt-2">
                {MEMBER_CATEGORIES.map(cat => (
                  <button
                    key={cat.code}
                    onClick={() => setDirectoryCategory(prev => (prev === cat.code ? 'ALL' : cat.code))}
                    className={`p-3 rounded-lg border text-left transition-colors ${
                      directoryCategory === cat.code
                        ? 'border-sky-600 bg-sky-50'
                        : 'border-slate-200 bg-slate-50 hover:bg-slate-100'
                    }`}
                  >
                    <div className="text-[11px] font-bold text-slate-500 uppercase">{cat.code}</div>
                    <div className="text-lg font-extrabold text-slate-900">{cat.count}</div>
                    <div className="text-[11px] text-slate-600 truncate">{cat.name}</div>
                  </button>
                ))}
              </div>

              {/* Search & Filter Controls */}
              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={directoryQuery}
                    onChange={e => setDirectoryQuery(e.target.value)}
                    placeholder="Search by abbreviation, organization name, or country..."
                    className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500"
                  />
                </div>
                <div className="flex items-center gap-1.5 flex-wrap">
                  <Filter className="w-3.5 h-3.5 text-slate-400" />
                  {(['ALL', 'CHA', 'HSS', 'DSO', 'CHI'] as const).map(cat => (
                    <button
                      key={cat}
                      onClick={() => setDirectoryCategory(cat)}
                      className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                        directoryCategory === cat
                          ? 'bg-sky-600 text-white'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* Directory Table */}
              <div className="overflow-x-auto border border-slate-200 rounded-xl">
                <table className="w-full text-left border-collapse text-xs">
                  <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] tracking-wider border-b border-slate-200">
                    <tr>
                      <th className="py-2.5 px-3">Abbreviation</th>
                      <th className="py-2.5 px-3">Member Organization</th>
                      <th className="py-2.5 px-3">Country</th>
                      <th className="py-2.5 px-3">Category</th>
                      <th className="py-2.5 px-3">Status</th>
                      <th className="py-2.5 px-3 text-right">Profile</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredDirectoryMembers.map(m => (
                      <tr key={m.abbreviation + m.country} className="hover:bg-slate-50/80">
                        <td className="py-2.5 px-3 font-bold text-slate-900">{m.abbreviation}</td>
                        <td className="py-2.5 px-3 text-slate-700">{m.name}</td>
                        <td className="py-2.5 px-3 text-slate-600">
                          {countryName(m.country)} ({m.country})
                        </td>
                        <td className="py-2.5 px-3">
                          <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-semibold text-[10px]">
                            {m.type}
                          </span>
                        </td>
                        <td className="py-2.5 px-3">
                          <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 font-semibold text-[10px]">
                            Active
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-right">
                          <button
                            onClick={() => openMemberProfile(m.abbreviation)}
                            className="inline-flex items-center gap-1 text-sky-700 hover:text-sky-900 font-semibold"
                          >
                            <span>View Profile</span>
                            <ArrowRight className="w-3 h-3" />
                          </button>
                        </td>
                      </tr>
                    ))}
                    {filteredDirectoryMembers.length === 0 && (
                      <tr>
                        <td colSpan={6} className="py-6 text-center text-slate-400">
                          No seeded member chapters match &ldquo;{directoryQuery}&rdquo;.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Tab 1: Member Chapter Overview */}
        {activeTab === 'MEMBERS' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-1 bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-3">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Select Member Chapter</h3>
              <div className="space-y-1.5 max-h-[500px] overflow-y-auto pr-1">
                {IMPLEMENTING_MEMBERS_SEED.map(m => (
                  <button
                    key={m.abbreviation + m.country}
                    onClick={() => selectMember(m.abbreviation)}
                    className={`w-full p-2.5 rounded-lg border text-left text-xs transition-colors flex items-center justify-between ${
                      selectedMember === m.abbreviation
                        ? 'border-sky-600 bg-sky-50 text-sky-900 font-bold'
                        : 'border-slate-100 hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <div>
                      <span className="font-bold">{m.abbreviation}</span>
                      <span className="text-slate-400 block text-[11px] truncate max-w-[180px]">{m.name}</span>
                    </div>
                    <span className="text-[10px] bg-slate-100 px-1.5 py-0.5 rounded text-slate-500">{m.country}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="md:col-span-2 bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-5">
              <div className="flex items-start justify-between pb-4 border-b border-slate-100">
                <div>
                  <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Member Details</div>
                  <h2 className="text-xl font-bold text-slate-900 mt-0.5">
                    {memberObj?.name ?? selectedMember} ({selectedMember})
                  </h2>
                  <span className="text-xs text-slate-500">
                    {countryName(memberObj?.country ?? '')} • Category: {memberObj?.type ?? 'Member'}
                  </span>
                </div>
                <span className="px-2.5 py-1 text-xs font-bold rounded bg-emerald-100 text-emerald-800">Active Member</span>
              </div>

              {/* Strategic Plan Alignment & Gaps */}
              <div className="bg-amber-50/70 border border-amber-200 rounded-lg p-4 space-y-1.5 text-xs">
                <span className="font-bold text-amber-900">Strategic Plan Alignment & Priorities:</span>
                <p className="text-amber-800 leading-relaxed">
                  {selectedMember === 'CHAK'
                    ? 'CHAK Strategic Plan 2024–2028 is aligned with EPN Core Pharmaceutical Systems strengthening. Dedicated Drug Revolving Fund (DRF) initiative scaled across 120 mission hospitals. Flagged gap: sub-county cold chain distribution in arid Northern Kenya.'
                    : `${memberObj?.name ?? selectedMember} participates in the EPN pharmaceutical systems strengthening agenda across its affiliated facilities. Member-level strategic plan details, DRF initiatives and flagged gaps for this chapter are being ingested with the M1 metadata milestone.`}
                </p>
              </div>

              {/* Member facilities */}
              <div>
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Key Member Facilities in EPN Network:
                </h4>
                {memberFacilities.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {memberFacilities.map(f => (
                      <div key={f.name} className="p-3 rounded-lg border border-slate-200 hover:border-sky-300 transition-colors">
                        <div className="flex justify-between items-start">
                          <span className="font-bold text-xs text-slate-900">{f.name}</span>
                          <span className="text-[10px] bg-sky-100 text-sky-800 px-1.5 py-0.5 rounded font-semibold">{f.level}</span>
                        </div>
                        <div className="text-[11px] text-slate-500 mt-2 flex justify-between">
                          <span>Tracer: <b className="text-emerald-600">{f.tracerAvail}</b></span>
                          <span>Capacity: {f.beds} Beds</span>
                        </div>
                        <button
                          onClick={() => openFosa(f.name)}
                          className="text-xs font-semibold text-sky-600 hover:underline mt-2 flex items-center gap-1"
                        >
                          <span>Open FOSA Brief</span>
                          <ChevronRight className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-500 bg-slate-50 border border-slate-200 rounded-lg p-3 italic">
                    Facility master list for {memberObj?.name ?? selectedMember} is being onboarded via the
                    facility importer (CSV + KMFL mapping). Members currently showing briefs: CHAK, CHAN, CBCHS.
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: FOSA Classification & Facility Brief (Section 8.7) */}
        {activeTab === 'FACILITIES' && (
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                <div>
                  <div className="text-xs font-bold text-sky-600 uppercase tracking-wider">FOSA Classification Matrix</div>
                  <h2 className="text-xl font-bold text-slate-900 mt-0.5">
                    Classify All Health Facilities (FOSAs) by Level, Member &amp; Governance
                  </h2>
                  <p className="text-xs text-slate-500 mt-1">
                    Filter FOSAs by facility tier (Referral Hospital, Hospital, Health Centre, Dispensary), supporting member association, or DTC/IPC/DRF governance compliance.
                  </p>
                </div>
                <span className="text-xs font-semibold px-3 py-1.5 rounded-full bg-slate-100 text-slate-700 shrink-0">
                  Showing {filteredFacilities.length} of {facilities.length} seeded FOSAs
                </span>
              </div>

              {/* Classification Tier Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
                {(
                  [
                    { key: 'REFERRAL_HOSPITAL', label: 'Referral Hospital', count: fosaClassCounts.REFERRAL_HOSPITAL },
                    { key: 'HOSPITAL', label: 'Hospital', count: fosaClassCounts.HOSPITAL },
                    { key: 'HEALTH_CENTRE', label: 'Health Centre', count: fosaClassCounts.HEALTH_CENTRE },
                    { key: 'DISPENSARY', label: 'Dispensary', count: fosaClassCounts.DISPENSARY }
                  ] as const
                ).map(tier => (
                  <button
                    key={tier.key}
                    onClick={() => setFosaClass(prev => (prev === tier.key ? 'ALL' : tier.key))}
                    className={`p-3 rounded-lg border text-left transition-colors ${
                      fosaClass === tier.key
                        ? 'border-sky-600 bg-sky-50'
                        : 'border-slate-200 bg-slate-50 hover:bg-slate-100'
                    }`}
                  >
                    <div className="text-[10px] font-bold text-slate-500 uppercase">{tier.label}</div>
                    <div className="text-lg font-extrabold text-slate-900">{tier.count}</div>
                  </button>
                ))}
                <button
                  onClick={() => setFosaGovernanceFilter(prev => (prev === 'COMPLIANT' ? 'ALL' : 'COMPLIANT'))}
                  className={`p-3 rounded-lg border text-left transition-colors ${
                    fosaGovernanceFilter === 'COMPLIANT'
                      ? 'border-emerald-600 bg-emerald-50'
                      : 'border-slate-200 bg-slate-50 hover:bg-slate-100'
                  }`}
                >
                  <div className="text-[10px] font-bold text-emerald-700 uppercase">Full DTC+IPC+DRF</div>
                  <div className="text-lg font-extrabold text-emerald-800">{fosaClassCounts.COMPLIANT}</div>
                </button>
              </div>

              {/* Filters */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-2.5 text-xs">
                <div className="relative sm:col-span-2">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={fosaQuery}
                    onChange={e => setFosaQuery(e.target.value)}
                    placeholder="Search FOSA name, member, country, or service..."
                    className="w-full pl-9 pr-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500"
                  />
                </div>
                <select
                  aria-label="Filter by member association"
                  value={fosaMemberFilter}
                  onChange={e => setFosaMemberFilter(e.target.value)}
                  className="p-2 rounded-lg border border-slate-200 bg-white font-medium text-slate-700"
                >
                  <option value="ALL">All Member Associations</option>
                  <option value="CHAK">CHAK (Kenya)</option>
                  <option value="CHAN">CHAN (Nigeria)</option>
                  <option value="CBCHS">CBCHS (Cameroon)</option>
                  <option value="CECA 20">CECA 20 (DR Congo)</option>
                </select>
                <select
                  aria-label="Filter by governance compliance"
                  value={fosaGovernanceFilter}
                  onChange={e => setFosaGovernanceFilter(e.target.value as 'ALL' | 'COMPLIANT' | 'ATTENTION')}
                  className="p-2 rounded-lg border border-slate-200 bg-white font-medium text-slate-700"
                >
                  <option value="ALL">All Governance Tiers</option>
                  <option value="COMPLIANT">Full DTC + IPC + DRF</option>
                  <option value="ATTENTION">Needs Governance Action</option>
                </select>
              </div>

              {/* Classified FOSA Table */}
              <div className="overflow-x-auto border border-slate-200 rounded-xl">
                <table className="w-full text-left border-collapse text-xs">
                  <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] tracking-wider border-b border-slate-200">
                    <tr>
                      <th className="py-2.5 px-3">FOSA Name</th>
                      <th className="py-2.5 px-3">Class / Tier</th>
                      <th className="py-2.5 px-3">Member</th>
                      <th className="py-2.5 px-3">Beds / Catchment</th>
                      <th className="py-2.5 px-3">Governance (DTC/IPC/DRF)</th>
                      <th className="py-2.5 px-3">Tracer %</th>
                      <th className="py-2.5 px-3 text-right">Brief</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredFacilities.map(f => (
                      <tr
                        key={f.id}
                        className={`hover:bg-slate-50/80 ${activeFac.id === f.id ? 'bg-sky-50/60' : ''}`}
                      >
                        <td className="py-2.5 px-3 font-bold text-slate-900">{f.name}</td>
                        <td className="py-2.5 px-3">
                          <span className="px-2 py-0.5 rounded bg-sky-100 text-sky-800 font-semibold text-[10px]">
                            {f.level}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-slate-700 font-medium">
                          {f.member} ({f.country})
                        </td>
                        <td className="py-2.5 px-3 text-slate-600">
                          {f.beds} beds · {f.catchment.toLocaleString()}
                        </td>
                        <td className="py-2.5 px-3">
                          <div className="flex items-center gap-1 text-[10px] font-bold">
                            <span className={`px-1.5 py-0.5 rounded ${f.dtc ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'}`}>DTC</span>
                            <span className={`px-1.5 py-0.5 rounded ${f.ipc ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'}`}>IPC</span>
                            <span className={`px-1.5 py-0.5 rounded ${f.drf ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-800'}`}>DRF</span>
                          </div>
                        </td>
                        <td className="py-2.5 px-3 font-bold text-emerald-700">{f.tracerAvail}</td>
                        <td className="py-2.5 px-3 text-right">
                          <button
                            onClick={() => setSelectedFacility(f.name)}
                            className="inline-flex items-center gap-1 text-sky-700 hover:text-sky-900 font-semibold"
                          >
                            <span>{activeFac.id === f.id ? 'Viewing' : 'Open Brief'}</span>
                            <ChevronRight className="w-3 h-3" />
                          </button>
                        </td>
                      </tr>
                    ))}
                    {filteredFacilities.length === 0 && (
                      <tr>
                        <td colSpan={7} className="py-6 text-center text-slate-400">
                          No FOSAs match the selected classification filters.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-sky-700 bg-sky-100 px-2 py-0.5 rounded">{activeFac.level}</span>
                  <span className="text-xs text-slate-500">KMFL Code: #48190</span>
                </div>
                <h2 className="text-2xl font-bold text-slate-900 mt-1">{activeFac.name}</h2>
                <div className="text-xs text-slate-500 mt-0.5">
                  Supported by {activeFac.member} ({activeFac.country}) • Catchment Pop: {activeFac.catchment.toLocaleString()}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="px-3 py-1 bg-emerald-100 text-emerald-800 text-xs font-bold rounded-full flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>EPN Supported</span>
                </span>
                <span className="text-xs text-slate-400">Last Report: {activeFac.lastUpdate}</span>
              </div>
            </div>

            {/* Performance Metric Strip */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-center">
                <span className="text-[11px] font-semibold text-slate-500 uppercase">Tracer Availability</span>
                <div className="text-2xl font-extrabold text-emerald-600 mt-1">{activeFac.tracerAvail}</div>
                <span className="text-[10px] text-slate-400">Target 85%</span>
              </div>

              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-center">
                <span className="text-[11px] font-semibold text-slate-500 uppercase">Stock-out Days</span>
                <div className="text-2xl font-extrabold text-slate-900 mt-1">{activeFac.stockoutDays} Day</div>
                <span className="text-[10px] text-slate-400">Observed 30-Day Period</span>
              </div>

              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-center">
                <span className="text-[11px] font-semibold text-slate-500 uppercase">Active DRF Account</span>
                <div className="text-2xl font-extrabold text-sky-600 mt-1">Verified</div>
                <span className="text-[10px] text-slate-400">Audited Ring-fenced Fund</span>
              </div>

              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-center">
                <span className="text-[11px] font-semibold text-slate-500 uppercase">Bed Capacity</span>
                <div className="text-2xl font-extrabold text-slate-900 mt-1">{activeFac.beds} Beds</div>
                <span className="text-[10px] text-slate-400">Inpatient Wards</span>
              </div>
            </div>

            {/* Clinical Services & Committee Functionality */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Clinical Services Offered:</h4>
                <div className="flex flex-wrap gap-1.5">
                  {activeFac.services.map(s => (
                    <span key={s} className="px-2.5 py-1 text-xs bg-slate-100 text-slate-700 rounded-md font-medium">
                      {s}
                    </span>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Quality Improvement Committees:</h4>
                <div className="space-y-2 text-xs">
                  <div className="flex items-center justify-between p-2 rounded bg-slate-50 border border-slate-200">
                    <span className="font-semibold text-slate-700">Drug & Therapeutics Committee (DTC)</span>
                    <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-100 text-emerald-800 font-bold">Functional</span>
                  </div>
                  <div className="flex items-center justify-between p-2 rounded bg-slate-50 border border-slate-200">
                    <span className="font-semibold text-slate-700">Infection Prevention & Control (IPC)</span>
                    <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-100 text-emerald-800 font-bold">Functional</span>
                  </div>
                  <div className="flex items-center justify-between p-2 rounded bg-slate-50 border border-slate-200">
                    <span className="font-semibold text-slate-700">Medstock Inventory PWA Active</span>
                    <span className="px-2 py-0.5 rounded text-[10px] bg-sky-100 text-sky-800 font-bold">FEFO Enabled</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          </div>
        )}

        {/* Tab 3: Projects */}
        {activeTab === 'PROJECTS' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {SEED_PROJECTS.map(proj => (
              <div key={proj.code} className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-3">
                <div className="flex justify-between items-start">
                  <span className="text-xs font-bold text-sky-700 bg-sky-50 px-2 py-0.5 rounded">{proj.code}</span>
                  <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">{proj.status}</span>
                </div>
                <h3 className="text-base font-bold text-slate-900 leading-snug">{proj.name}</h3>
                <p className="text-xs text-slate-600 leading-relaxed">{proj.description}</p>
                <div className="pt-3 border-t border-slate-100 text-xs text-slate-600 space-y-1">
                  <div><span className="font-semibold">Funder:</span> {proj.funder}</div>
                  <div><span className="font-semibold">Countries:</span> {proj.countries.join(', ')}</div>
                  <div><span className="font-semibold">Reach:</span> {proj.facilitiesCount} Facilities • {proj.healthWorkersTrained} Workers Trained</div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Tab 4: Funders */}
        {activeTab === 'FUNDERS' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {FUNDERS_SEED.map(f => (
              <div key={f.name} className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-2">
                <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded uppercase">
                  {f.type} • {f.country}
                </span>
                <h4 className="text-sm font-bold text-slate-900">{f.name}</h4>
                <div className="pt-2 text-xs text-sky-600 flex items-center gap-1">
                  <a href={f.website} target="_blank" rel="noreferrer" className="hover:underline flex items-center gap-1">
                    <span>Partner Website</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Tab 5: Union Coverage Calculator (Meeting Requirement Section 8.7) */}
        {activeTab === 'COVERAGE' && (
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-5">
            <div>
              <div className="text-xs font-bold text-sky-600 uppercase tracking-wider">Multi-Member Union Coverage</div>
              <h2 className="text-xl font-bold text-slate-900 mt-1">Country Coverage Without Double-Counting</h2>
              <p className="text-xs text-slate-500 mt-1">
                Calculate the union coverage across selected faith-based health networks in a target nation.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                <span className="text-xs font-bold text-slate-800">Target Country: Kenya</span>
                <div className="space-y-1.5 text-xs text-slate-600">
                  <div>National FOSA Count: <b>6,200 Facilities</b></div>
                  <div>CHAK Affiliated: <b>584 Facilities</b></div>
                  <div>MEDS Served: <b>1,420 Facilities</b></div>
                </div>
                <div className="p-3 bg-sky-100/70 text-sky-900 rounded-lg text-xs font-bold">
                  Union Coverage: 1,640 Facilities (26.4% of National Sector)
                </div>
              </div>

              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                <span className="text-xs font-bold text-slate-800">Target Country: Nigeria</span>
                <div className="space-y-1.5 text-xs text-slate-600">
                  <div>National FOSA Count: <b>34,000 Facilities</b></div>
                  <div>CHAN Affiliated: <b>4,000 Facilities</b></div>
                  <div>CHAN Medi-Pharm: <b>3,200 Facilities</b></div>
                </div>
                <div className="p-3 bg-emerald-100/70 text-emerald-900 rounded-lg text-xs font-bold">
                  Union Coverage: 4,400 Facilities (12.9% of National Sector)
                </div>
              </div>

              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                <span className="text-xs font-bold text-slate-800">Target Country: Cameroon</span>
                <div className="space-y-1.5 text-xs text-slate-600">
                  <div>National FOSA Count: <b>4,100 Facilities</b></div>
                  <div>CBCHS Affiliated: <b>110 Facilities</b></div>
                  <div>PCC Affiliated: <b>85 Facilities</b></div>
                </div>
                <div className="p-3 bg-purple-100/70 text-purple-900 rounded-lg text-xs font-bold">
                  Union Coverage: 195 Facilities (4.7% of National Sector)
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default function ExplorerPage() {
  return (
    <Suspense
      fallback={
        <div className="flex-1 flex items-center justify-center min-h-[50vh] text-sm text-slate-400">
          Loading explorer
        </div>
      }
    >
      <ExplorerInner />
    </Suspense>
  );
}
