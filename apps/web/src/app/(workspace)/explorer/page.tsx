'use client';

import React, { Suspense, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
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
  Package,
  AlertTriangle,
  Clock,
  Mail,
  Phone,
  Newspaper,
  Save
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
  const [directoryPayFilter, setDirectoryPayFilter] = useState<'ALL' | 'PAID' | 'TIME' | 'OVERDUE'>('ALL');
  const [directoryView, setDirectoryView] = useState<'CARDS' | 'TABLE'>('CARDS');
  const [memberSearch, setMemberSearch] = useState('');
  const [fosaSubView, setFosaSubView] = useState<'ASSOCIATIONS' | 'REGISTRY'>('ASSOCIATIONS');
  const [showEditAssoc, setShowEditAssoc] = useState(false);
  const [projectStatusFilter, setProjectStatusFilter] = useState<'ALL' | 'ACTIVE' | 'COMPLETED'>('ALL');
  const [coverageCountry, setCoverageCountry] = useState<'KE' | 'NG' | 'CM' | 'CD'>('KE');
  const [coverageDisabled, setCoverageDisabled] = useState<Record<string, boolean>>({});
  const [fosaQuery, setFosaQuery] = useState('');
  const [fosaClass, setFosaClass] = useState<string>('ALL');
  const [fosaMemberFilter, setFosaMemberFilter] = useState<string>('ALL');
  const [fosaGovernanceFilter, setFosaGovernanceFilter] = useState<'ALL' | 'COMPLIANT' | 'ATTENTION'>('ALL');
  const [assocRecords, setAssocRecords] = useState([
    {
      code: 'CHAK',
      name: 'Christian Health Association of Kenya (CHAK)',
      country: 'Kenya',
      totalFacilities: 584,
      levels: { 1: 42, 2: 248, 3: 168, 4: 108, 5: 16, 6: 2 },
      activePrograms: ['ACCESS III', 'MINILAB_NET', 'SAFER'],
      completedPrograms: ['ACCESS II', 'IMPACT', 'MNCH_FBO'],
      meetsEpnRequirements: true,
      requirementNotes: 'Faith-based national CHA · Legal NGO charter · Active 2026/2027 DPA & fee standing',
      referencePerson: 'Dr. Samuel Mwenda',
      referenceRole: 'General Secretary',
      contactEmail: 'secretariat@chak.or.ke',
      contactPhone: '+254 20 444 1920',
      mandateEnd: '2028-06-30',
      news: 'CHAK scaled Drug Revolving Funds (DRF) across 120 mission hospitals; cold-chain upgrade ongoing in Northern Kenya.'
    },
    {
      code: 'CHAN',
      name: 'Christian Health Association of Nigeria (CHAN)',
      country: 'Nigeria',
      totalFacilities: 4000,
      levels: { 1: 820, 2: 1850, 3: 890, 4: 380, 5: 54, 6: 6 },
      activePrograms: ['ACCESS III', 'SAFER'],
      completedPrograms: ['ACCESS II', 'MNCH_FBO'],
      meetsEpnRequirements: true,
      requirementNotes: 'Registered faith-based network · 4,000+ affiliated facilities · Active CHAN Medi-Pharm DSO link',
      referencePerson: 'Dr. Obadiah M. Dogara',
      referenceRole: 'Secretary General',
      contactEmail: 'info@channigeria.org',
      contactPhone: '+234 803 000 4100',
      mandateEnd: '2026-10-31',
      news: 'Mandate renewal notice: CHAN focal leadership term ended Oct 2026 — please confirm incoming reference person.'
    },
    {
      code: 'CBCHS',
      name: 'Cameroon Baptist Convention Health Services (CBCHS)',
      country: 'Cameroon',
      totalFacilities: 110,
      levels: { 1: 12, 2: 46, 3: 32, 4: 14, 5: 5, 6: 1 },
      activePrograms: ['MINILAB_NET', 'ACCESS III'],
      completedPrograms: ['IMPACT', 'ACCESS II'],
      meetsEpnRequirements: true,
      requirementNotes: 'CHI Ordinary member · Minilab quality-control reference hub at Mbingo Baptist Hospital',
      referencePerson: 'Prof. Tih Pius Muffih',
      referenceRole: 'Director of Health Services',
      contactEmail: 'cbchs@cbchealthservices.org',
      contactPhone: '+237 677 000 812',
      mandateEnd: '2026-12-31',
      news: 'Mbingo Minilab screened 420+ essential medicine batches in 2026; focal mandate renewal due Dec 2026.'
    },
    {
      code: 'CECA 20',
      name: 'Communauté Evangélique au Centre de l’Afrique (CECA 20)',
      country: 'DR Congo',
      totalFacilities: 93,
      levels: { 1: 18, 2: 38, 3: 28, 4: 7, 5: 2, 6: 0 },
      activePrograms: ['ACCESS III'],
      completedPrograms: ['MNCH_FBO'],
      meetsEpnRequirements: true,
      requirementNotes: 'Admitted at AGM 2026 as Ordinary CHA · Finance contact & pharmacy staff count verification pending',
      referencePerson: 'Dr. Jean-Luc Mugisha',
      referenceRole: 'Health Coordinator',
      contactEmail: 'coordination@ceca20-sante.org',
      contactPhone: '+243 81 000 2020',
      mandateEnd: '2027-11-30',
      news: 'Welcomed at AGM 2026 (93 facilities in Ituri/Bunia); 2027 onboarding & contact confirmation in progress.'
    }
  ]);
  const [selectedAssocCode, setSelectedAssocCode] = useState('CHAK');
  const [editAssocEmail, setEditAssocEmail] = useState('');
  const [editAssocPhone, setEditAssocPhone] = useState('');
  const [editAssocRef, setEditAssocRef] = useState('');
  const [editAssocRole, setEditAssocRole] = useState('');
  const [editAssocMandateEnd, setEditAssocMandateEnd] = useState('');
  const [editAssocNews, setEditAssocNews] = useState('');
  const [fosaUpdateToast, setFosaUpdateToast] = useState<string | null>(null);

  const activeAssoc = assocRecords.find(a => a.code === selectedAssocCode) || assocRecords[0];

  useEffect(() => {
    if (!activeAssoc) return;
    setEditAssocEmail(activeAssoc.contactEmail);
    setEditAssocPhone(activeAssoc.contactPhone);
    setEditAssocRef(activeAssoc.referencePerson);
    setEditAssocRole(activeAssoc.referenceRole);
    setEditAssocMandateEnd(activeAssoc.mandateEnd);
    setEditAssocNews(activeAssoc.news);
  }, [activeAssoc]);

  const getMandateStatus = (mandateEnd: string) => {
    const today = new Date('2026-11-19T00:00:00Z').getTime();
    const end = new Date(`${mandateEnd}T00:00:00Z`).getTime();
    const daysLeft = Math.ceil((end - today) / (1000 * 60 * 60 * 24));
    if (daysLeft <= 0) return { label: 'MANDATE ENDED — REPLACE / RENEW', tone: 'rose', daysLeft };
    if (daysLeft <= 90) return { label: `MANDATE ENDING IN ${daysLeft}d`, tone: 'amber', daysLeft };
    return { label: 'ACTIVE MANDATE', tone: 'emerald', daysLeft };
  };

  const handleSaveAssocUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    setAssocRecords(prev =>
      prev.map(a =>
        a.code === activeAssoc.code
          ? {
              ...a,
              contactEmail: editAssocEmail,
              contactPhone: editAssocPhone,
              referencePerson: editAssocRef,
              referenceRole: editAssocRole,
              mandateEnd: editAssocMandateEnd,
              news: editAssocNews
            }
          : a
      )
    );
    setFosaUpdateToast(`Updated ${activeAssoc.code} facility contact, reference person (${editAssocRef}), and mandate timeline.`);
    setTimeout(() => setFosaUpdateToast(null), 4000);
  };

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
      levelNum: 4,
      beds: 120,
      catchment: 85000,
      activePrograms: ['ACCESS III', 'MINILAB_NET'],
      completedPrograms: ['ACCESS II', 'IMPACT'],
      contactEmail: 'pharmacy@kilomehospital.or.ke',
      contactPhone: '+254 722 100 401',
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
      levelNum: 5,
      beds: 360,
      catchment: 220000,
      activePrograms: ['ACCESS III', 'MINILAB_NET', 'SAFER'],
      completedPrograms: ['ACCESS II', 'IMPACT', 'MNCH_FBO'],
      contactEmail: 'info@kijabehospital.org',
      contactPhone: '+254 709 728 200',
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
      levelNum: 4,
      beds: 210,
      catchment: 180000,
      activePrograms: ['ACCESS III', 'SAFER'],
      completedPrograms: ['ACCESS II', 'MNCH_FBO'],
      contactEmail: 'pharmacy@stgerardkaduna.org',
      contactPhone: '+234 803 555 2100',
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
      levelNum: 6,
      beds: 310,
      catchment: 250000,
      activePrograms: ['MINILAB_NET', 'ACCESS III'],
      completedPrograms: ['IMPACT', 'ACCESS II'],
      contactEmail: 'mbingo@cbchealthservices.org',
      contactPhone: '+237 677 110 310',
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
      levelNum: 3,
      beds: 48,
      catchment: 42000,
      activePrograms: ['ACCESS III'],
      completedPrograms: ['MNCH_FBO'],
      contactEmail: 'bunia.cs@ceca20-sante.org',
      contactPhone: '+243 81 440 0093',
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
      levelNum: 2,
      beds: 8,
      catchment: 15000,
      activePrograms: ['SAFER'],
      completedPrograms: ['MNCH_FBO'],
      contactEmail: 'dispensary@tenwek.org',
      contactPhone: '+254 711 220 008',
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

  const getDirectoryPayStatus = (abbr: string) => {
    const paidSet = new Set(['CHAK', 'MEDS', 'UPMB', 'UCMB', 'CBCHS']);
    const timeSet = new Set(['CECA 20', 'CMMB', 'CSSC', 'BUFMAR', 'PCC', 'CHASL', 'RECOSAC-G', 'CHAN Medi-Pharm']);
    if (paidSet.has(abbr)) {
      return { key: 'PAID' as const, label: 'Paid on time', cls: 'bg-emerald-100 text-emerald-800 border-emerald-200', dot: 'bg-emerald-600' };
    }
    if (timeSet.has(abbr)) {
      return { key: 'TIME' as const, label: 'Still has time', cls: 'bg-amber-100 text-amber-900 border-amber-200', dot: 'bg-amber-500' };
    }
    return { key: 'OVERDUE' as const, label: 'Unpaid / Overdue', cls: 'bg-rose-100 text-rose-800 border-rose-200', dot: 'bg-rose-600' };
  };

  const filteredDirectoryMembers = useMemo(() => {
    const q = directoryQuery.trim().toLowerCase();
    return IMPLEMENTING_MEMBERS_SEED.filter(m => {
      const matchesCat = directoryCategory === 'ALL' || m.type === directoryCategory;
      const pay = getDirectoryPayStatus(m.abbreviation);
      const matchesPay = directoryPayFilter === 'ALL' || pay.key === directoryPayFilter;
      const matchesQuery =
        !q ||
        m.abbreviation.toLowerCase().includes(q) ||
        m.name.toLowerCase().includes(q) ||
        countryName(m.country).toLowerCase().includes(q) ||
        m.country.toLowerCase().includes(q);
      return matchesCat && matchesPay && matchesQuery;
    });
  }, [directoryQuery, directoryCategory, directoryPayFilter]);

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

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 w-full space-y-6">
        {/* Clean Single Executive Header + Underline Tabs */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs px-5 sm:px-6 pt-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4">
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                {activeTab === 'DIRECTORY'
                  ? 'Member Directory'
                  : activeTab === 'MEMBERS'
                  ? `Member Profile · ${selectedMember}`
                  : activeTab === 'FACILITIES'
                  ? 'Health Facilities (FOSAs)'
                  : activeTab === 'PROJECTS'
                  ? 'EPN Projects'
                  : activeTab === 'FUNDERS'
                  ? 'Funders & Donors'
                  : 'Network Coverage'}
              </h1>
              <p className="text-xs text-slate-500 mt-0.5">
                {NETWORK_STATISTICS.totalMembers} members (76 Ordinary · 75 Associate) across {NETWORK_STATISTICS.totalCountries} countries · {NETWORK_STATISTICS.asOf}
              </p>
            </div>
            <Link
              href="/membership"
              className="px-4 py-2 rounded-lg bg-[#004a59] hover:bg-[#003440] text-white text-xs font-semibold shrink-0 self-start sm:self-center transition-colors"
            >
              Membership &amp; 2027 Fees &rarr;
            </Link>
          </div>

          <nav aria-label="Explorer sections" className="flex items-center gap-6 overflow-x-auto border-t border-slate-100 text-xs">
            {(
              [
                { id: 'DIRECTORY', label: `Member Directory (${NETWORK_STATISTICS.totalMembers})` },
                { id: 'MEMBERS', label: `Member Profiles (${IMPLEMENTING_MEMBERS_SEED.length})` },
                { id: 'FACILITIES', label: 'Facilities (FOSA)' },
                { id: 'PROJECTS', label: `Projects (${SEED_PROJECTS.length})` },
                { id: 'FUNDERS', label: `Funders (${FUNDERS_SEED.length})` },
                { id: 'COVERAGE', label: 'Network Coverage' }
              ] as const
            ).map(tab => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`py-3 border-b-2 font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                  activeTab === tab.id
                    ? 'border-[#004a59] text-[#004a59]'
                    : 'border-transparent text-slate-500 hover:text-slate-900'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab 0: Member Directory (Modern Cards & Table View) */}
        {activeTab === 'DIRECTORY' && (
          <div className="space-y-5">
            {/* Single Unified Filter & Category Strip */}
            <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
              {/* Compact Category Bar */}
              <div className="flex flex-wrap items-center gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => setDirectoryCategory('ALL')}
                  className={`px-3 py-1.5 rounded-lg font-semibold border transition-colors cursor-pointer ${
                    directoryCategory === 'ALL'
                      ? 'bg-[#004a59] text-white border-[#004a59]'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  All ({NETWORK_STATISTICS.totalMembers})
                </button>
                {MEMBER_CATEGORIES.map(cat => (
                  <button
                    key={cat.code}
                    type="button"
                    onClick={() => setDirectoryCategory(prev => (prev === cat.code ? 'ALL' : cat.code))}
                    className={`px-3 py-1.5 rounded-lg font-semibold border transition-colors cursor-pointer ${
                      directoryCategory === cat.code
                        ? 'bg-[#004a59] text-white border-[#004a59]'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    {cat.code} <span className={directoryCategory === cat.code ? 'text-cyan-200' : 'text-slate-400'}>({cat.count})</span>
                  </button>
                ))}
              </div>

              {/* Search + Payment Status Filter + View Toggle */}
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
                <div className="relative flex-1 max-w-md">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={directoryQuery}
                    onChange={e => setDirectoryQuery(e.target.value)}
                    placeholder="Search member abbreviation, name, or country..."
                    className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-slate-300 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#004a59]"
                  />
                </div>

                <div className="flex flex-wrap items-center gap-2 text-xs">
                  {(
                    [
                      { id: 'ALL', label: 'All statuses', dot: '' },
                      { id: 'PAID', label: 'Paid on time', dot: 'bg-emerald-600' },
                      { id: 'TIME', label: 'Still has time', dot: 'bg-amber-500' },
                      { id: 'OVERDUE', label: 'Overdue', dot: 'bg-rose-600' }
                    ] as const
                  ).map(p => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => setDirectoryPayFilter(p.id)}
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg font-semibold border transition-colors cursor-pointer ${
                        directoryPayFilter === p.id
                          ? 'bg-slate-900 text-white border-slate-900'
                          : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      {p.dot && <span className={`w-2 h-2 rounded-full ${p.dot}`} />}
                      <span>{p.label}</span>
                    </button>
                  ))}

                  <div className="flex items-center rounded-lg border border-slate-200 bg-slate-100 p-0.5 ml-1">
                    <button
                      type="button"
                      onClick={() => setDirectoryView('CARDS')}
                      className={`px-2.5 py-1 rounded-md font-semibold cursor-pointer ${
                        directoryView === 'CARDS' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-500'
                      }`}
                    >
                      Cards
                    </button>
                    <button
                      type="button"
                      onClick={() => setDirectoryView('TABLE')}
                      className={`px-2.5 py-1 rounded-md font-semibold cursor-pointer ${
                        directoryView === 'TABLE' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-500'
                      }`}
                    >
                      Table
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Cards View (Default — Visual & Scannable) */}
            {directoryView === 'CARDS' ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredDirectoryMembers.map(m => {
                  const payBadge = getDirectoryPayStatus(m.abbreviation);
                  return (
                    <div
                      key={m.abbreviation + m.country}
                      className="bg-white p-5 rounded-2xl border border-slate-200 hover:border-[#004a59] hover:shadow-md transition-all flex flex-col justify-between gap-4"
                    >
                      <div className="space-y-3">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div className="w-10 h-10 rounded-xl bg-[#004a59] text-white font-bold text-xs flex items-center justify-center shrink-0">
                              {m.abbreviation.slice(0, 4)}
                            </div>
                            <div className="min-w-0">
                              <div className="font-bold text-sm text-slate-900 truncate">{m.abbreviation}</div>
                              <div className="text-[11px] text-slate-500 truncate">
                                {countryName(m.country)} ({m.country})
                              </div>
                            </div>
                          </div>
                          <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-bold text-[10px] shrink-0">
                            {m.type}
                          </span>
                        </div>
                        <p className="text-xs text-slate-700 leading-snug line-clamp-2">{m.name}</p>
                      </div>

                      <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border font-bold text-[10px] ${payBadge.cls}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${payBadge.dot}`} />
                          {payBadge.label}
                        </span>
                        <button
                          type="button"
                          onClick={() => openMemberProfile(m.abbreviation)}
                          className="inline-flex items-center gap-1 text-xs font-semibold text-[#004a59] hover:underline cursor-pointer"
                        >
                          <span>View Profile</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
                {filteredDirectoryMembers.length === 0 && (
                  <div className="col-span-full bg-white p-10 rounded-2xl border border-slate-200 text-center text-xs text-slate-400">
                    No members match your current filters.
                  </div>
                )}
              </div>
            ) : (
              /* Compact Table View */
              <div className="bg-white overflow-x-auto border border-slate-200 rounded-2xl shadow-2xs">
                <table className="w-full text-left border-collapse text-xs">
                  <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] tracking-wider border-b border-slate-200">
                    <tr>
                      <th className="py-3 px-4">Abbreviation</th>
                      <th className="py-3 px-4">Member Organization</th>
                      <th className="py-3 px-4">Country</th>
                      <th className="py-3 px-4">Category</th>
                      <th className="py-3 px-4">Payment Status</th>
                      <th className="py-3 px-4 text-right">Profile</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredDirectoryMembers.map(m => {
                      const payBadge = getDirectoryPayStatus(m.abbreviation);
                      return (
                        <tr key={m.abbreviation + m.country} className="hover:bg-slate-50/80">
                          <td className="py-3 px-4 font-bold text-slate-900">{m.abbreviation}</td>
                          <td className="py-3 px-4 text-slate-700">{m.name}</td>
                          <td className="py-3 px-4 text-slate-600">
                            {countryName(m.country)} ({m.country})
                          </td>
                          <td className="py-3 px-4">
                            <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-semibold text-[10px]">
                              {m.type}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border font-bold text-[10px] ${payBadge.cls}`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${payBadge.dot}`} />
                              {payBadge.label}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-right">
                            <button
                              type="button"
                              onClick={() => openMemberProfile(m.abbreviation)}
                              className="inline-flex items-center gap-1 text-[#004a59] hover:underline font-semibold cursor-pointer"
                            >
                              <span>View Profile</span>
                              <ArrowRight className="w-3 h-3" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                    {filteredDirectoryMembers.length === 0 && (
                      <tr>
                        <td colSpan={6} className="py-8 text-center text-slate-400">
                          No members match your current filters.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Tab 1: Member Chapter Overview */}
        {activeTab === 'MEMBERS' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Searchable Left Rail */}
            <div className="lg:col-span-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Member Chapters ({IMPLEMENTING_MEMBERS_SEED.length})</h3>
              </div>
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={memberSearch}
                  onChange={e => setMemberSearch(e.target.value)}
                  placeholder="Filter chapters..."
                  className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#004a59]"
                />
              </div>
              <div className="space-y-1.5 max-h-[520px] overflow-y-auto pr-1">
                {IMPLEMENTING_MEMBERS_SEED.filter(m => {
                  const q = memberSearch.trim().toLowerCase();
                  return !q || m.abbreviation.toLowerCase().includes(q) || m.name.toLowerCase().includes(q) || m.country.toLowerCase().includes(q);
                }).map(m => {
                  const pay = getDirectoryPayStatus(m.abbreviation);
                  return (
                    <button
                      key={m.abbreviation + m.country}
                      onClick={() => selectMember(m.abbreviation)}
                      className={`w-full p-2.5 rounded-xl border text-left text-xs transition-all flex items-center justify-between gap-2 cursor-pointer ${
                        selectedMember === m.abbreviation
                          ? 'border-[#004a59] bg-[#004a59]/5 text-[#004a59] font-bold shadow-2xs'
                          : 'border-slate-100 hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-[10px] font-bold shrink-0 ${
                          selectedMember === m.abbreviation ? 'bg-[#004a59] text-white' : 'bg-slate-100 text-slate-700'
                        }`}>
                          {m.abbreviation.slice(0, 4)}
                        </div>
                        <div className="min-w-0">
                          <span className="font-bold block truncate">{m.abbreviation}</span>
                          <span className="text-slate-500 block text-[11px] truncate">{m.name}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <span className={`w-2 h-2 rounded-full ${pay.dot}`} title={pay.label} />
                        <span className="text-[10px] bg-slate-100 px-1.5 py-0.5 rounded font-semibold text-slate-600">{m.country}</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Right Profile Card */}
            <div className="lg:col-span-8 bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-6">
              {(() => {
                const pay = getDirectoryPayStatus(selectedMember);
                return (
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-100">
                    <div className="flex items-center gap-3.5">
                      <div className="w-14 h-14 rounded-2xl bg-[#004a59] text-white font-extrabold text-sm flex items-center justify-center shadow-xs shrink-0">
                        {selectedMember.slice(0, 4)}
                      </div>
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <h2 className="text-xl font-bold text-slate-900">
                            {memberObj?.name ?? selectedMember}
                          </h2>
                        </div>
                        <div className="flex flex-wrap items-center gap-2 mt-1 text-xs text-slate-500">
                          <span>{countryName(memberObj?.country ?? '')}</span>
                          <span>&bull;</span>
                          <span className="font-semibold text-slate-700">Category: {memberObj?.type ?? 'Member'}</span>
                          <span>&bull;</span>
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border font-bold text-[10px] ${pay.cls}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${pay.dot}`} />
                            {pay.label}
                          </span>
                        </div>
                      </div>
                    </div>
                    <Link
                      href="/membership?tab=RECORD"
                      className="px-3.5 py-2 rounded-lg border border-slate-300 bg-slate-50 hover:bg-slate-100 text-xs font-semibold text-slate-800 shrink-0 self-start sm:self-center"
                    >
                      Manage Invoice &amp; Contacts &rarr;
                    </Link>
                  </div>
                );
              })()}

              {/* Strategic Plan Alignment & Gaps */}
              <div className="bg-amber-50/70 border border-amber-200 rounded-xl p-4 space-y-1.5 text-xs">
                <span className="font-bold text-amber-950">Strategic Plan Alignment &amp; Priorities</span>
                <p className="text-amber-900 leading-relaxed">
                  {selectedMember === 'CHAK'
                    ? 'CHAK Strategic Plan 2024–2028 is aligned with EPN Core Pharmaceutical Systems strengthening. Dedicated Drug Revolving Fund (DRF) initiative scaled across 120 mission hospitals. Flagged gap: sub-county cold chain distribution in arid Northern Kenya.'
                    : `${memberObj?.name ?? selectedMember} participates in the EPN pharmaceutical systems strengthening agenda across its affiliated facilities. Member-level strategic plan details, DRF initiatives and flagged gaps for this chapter are tracked under Strategic Plan 2026–2030.`}
                </p>
              </div>

              {/* Member facilities */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                    Affiliated Health Facilities (FOSAs)
                  </h4>
                  <button
                    type="button"
                    onClick={() => {
                      setFosaMemberFilter(selectedMember);
                      setActiveTab('FACILITIES');
                    }}
                    className="text-xs font-semibold text-[#004a59] hover:underline cursor-pointer"
                  >
                    Inspect All Levels (1–6) &rarr;
                  </button>
                </div>
                {memberFacilities.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {memberFacilities.map(f => (
                      <div key={f.name} className="p-4 rounded-xl border border-slate-200 hover:border-[#004a59] transition-all space-y-3">
                        <div className="flex justify-between items-start gap-2">
                          <span className="font-bold text-xs text-slate-900 leading-snug">{f.name}</span>
                          <span className="text-[10px] bg-cyan-50 text-[#004a59] border border-cyan-200 px-2 py-0.5 rounded-full font-bold shrink-0">
                            L{f.levelNum} · {f.level.replace('_', ' ')}
                          </span>
                        </div>
                        <div className="space-y-1">
                          <div className="flex justify-between text-[11px] text-slate-600">
                            <span>Tracer Availability</span>
                            <b className="text-emerald-700">{f.tracerAvail}</b>
                          </div>
                          <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                            <div className="h-full bg-emerald-600 rounded-full" style={{ width: f.tracerAvail }} />
                          </div>
                        </div>
                        <div className="flex items-center justify-between pt-1 text-[11px] text-slate-500 border-t border-slate-100">
                          <span>Capacity: <b>{f.beds}</b> beds</span>
                          <button
                            onClick={() => {
                              setFosaSubView('REGISTRY');
                              openFosa(f.name);
                            }}
                            className="font-semibold text-[#004a59] hover:underline inline-flex items-center gap-0.5 cursor-pointer"
                          >
                            <span>Open Brief</span>
                            <ChevronRight className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-500 bg-slate-50 border border-slate-200 rounded-xl p-4">
                    Facility master list for <b>{memberObj?.name ?? selectedMember}</b> is onboarded via the Membership CSV/PDF importer. Seeded facility briefs are currently live for CHAK, CHAN, CBCHS, and CECA 20.
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: FOSA Classification & Facility Brief (Section 8.7) */}
        {activeTab === 'FACILITIES' && (
          <div className="space-y-5">
            {fosaUpdateToast && (
              <div
                role="status"
                aria-live="polite"
                className="bg-emerald-700 text-white text-xs font-semibold px-4 py-3 rounded-xl shadow-sm flex items-center gap-2"
              >
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{fosaUpdateToast}</span>
              </div>
            )}

            {/* Clean Sub-View Switcher so Facilities never overwhelms */}
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="inline-flex items-center gap-1 bg-white p-1 rounded-xl border border-slate-200 text-xs shadow-2xs">
                <button
                  type="button"
                  onClick={() => setFosaSubView('ASSOCIATIONS')}
                  className={`px-3.5 py-1.5 rounded-lg font-semibold transition-colors cursor-pointer ${
                    fosaSubView === 'ASSOCIATIONS' ? 'bg-[#004a59] text-white' : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  By Health Association (Levels 1–6 &amp; Mandate Watch)
                </button>
                <button
                  type="button"
                  onClick={() => setFosaSubView('REGISTRY')}
                  className={`px-3.5 py-1.5 rounded-lg font-semibold transition-colors cursor-pointer ${
                    fosaSubView === 'REGISTRY' ? 'bg-[#004a59] text-white' : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  FOSA Registry &amp; Facility Brief ({facilities.length})
                </button>
              </div>

              {fosaSubView === 'ASSOCIATIONS' && (
                <button
                  type="button"
                  onClick={() => setShowEditAssoc(prev => !prev)}
                  className="px-3.5 py-1.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-800 cursor-pointer"
                >
                  {showEditAssoc ? 'Close Contact & Mandate Editor' : `Edit ${activeAssoc.code} Contacts & Mandate`}
                </button>
              )}
            </div>

            {/* Health Association FOSA Categorization & Mandate Watch */}
            {fosaSubView === 'ASSOCIATIONS' && (
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-5">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                <div>
                  <div className="text-xs font-bold text-[#004a59] uppercase tracking-wider">
                    FOSAs Categorised by Health Association
                  </div>
                  <h2 className="text-xl font-bold text-slate-900 mt-0.5">
                    Health Associations: Facility Counts (Levels 1–6), Programs, EPN Eligibility &amp; Mandate Alerts
                  </h2>
                  <p className="text-xs text-slate-500 mt-1">
                    Select a health association to inspect its facility levels (1–6), active/completed programs, EPN membership requirement status, reference members, news, and mandate end-time alerts.
                  </p>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {assocRecords.map(a => {
                    const mStatus = getMandateStatus(a.mandateEnd);
                    return (
                      <button
                        key={a.code}
                        onClick={() => {
                          setSelectedAssocCode(a.code);
                          setFosaMemberFilter(a.code);
                        }}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-colors flex items-center gap-1.5 cursor-pointer ${
                          selectedAssocCode === a.code
                            ? 'bg-[#004a59] text-white border-[#004a59]'
                            : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        <span>{a.code}</span>
                        {mStatus.tone !== 'emerald' && (
                          <span
                            className={`w-2 h-2 rounded-full ${
                              mStatus.tone === 'rose' ? 'bg-rose-500' : 'bg-amber-400'
                            }`}
                            title={mStatus.label}
                          />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Mandate End-Time Alert Banner */}
              {(() => {
                const mStatus = getMandateStatus(activeAssoc.mandateEnd);
                if (mStatus.tone === 'emerald') return null;
                return (
                  <div
                    role="alert"
                    className={`p-4 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs ${
                      mStatus.tone === 'rose'
                        ? 'bg-rose-50 border-rose-200 text-rose-950'
                        : 'bg-amber-50 border-amber-200 text-amber-950'
                    }`}
                  >
                    <div className="flex items-start gap-2.5">
                      <AlertTriangle className={`w-4 h-4 shrink-0 mt-0.5 ${mStatus.tone === 'rose' ? 'text-rose-600' : 'text-amber-600'}`} />
                      <div>
                        <div className="font-bold">
                          {mStatus.label} — {activeAssoc.name}
                        </div>
                        <div className="mt-0.5">
                          Reference person <b>{activeAssoc.referencePerson}</b> ({activeAssoc.referenceRole}) mandate end date is{' '}
                          <span className="font-mono font-bold">{activeAssoc.mandateEnd}</span>. Please update the incoming reference person and contact details below.
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })()}

              {/* Association Overview + Level 1-6 Breakdown + Programs + EPN Requirements */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 text-xs">
                <div className="lg:col-span-2 space-y-4">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                      <div className="text-[10px] font-bold uppercase text-slate-500">Health Association</div>
                      <div className="text-base font-extrabold text-slate-900 mt-0.5">{activeAssoc.code}</div>
                      <div className="text-[11px] text-slate-600">{activeAssoc.country}</div>
                    </div>
                    <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                      <div className="text-[10px] font-bold uppercase text-slate-500">Total Health Facilities</div>
                      <div className="text-xl font-extrabold text-[#004a59] mt-0.5 tabular-nums">
                        {activeAssoc.totalFacilities.toLocaleString()}
                      </div>
                      <div className="text-[11px] text-slate-600">Affiliated FOSAs</div>
                    </div>
                    <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 col-span-2">
                      <div className="text-[10px] font-bold uppercase text-emerald-800">EPN Membership Requirement</div>
                      <div className="text-sm font-extrabold text-emerald-900 mt-0.5">
                        {activeAssoc.meetsEpnRequirements ? 'Meets EPN Requirements ✓' : 'Review Needed'}
                      </div>
                      <div className="text-[11px] text-emerald-800 mt-0.5">{activeAssoc.requirementNotes}</div>
                    </div>
                  </div>

                  {/* Level 1 to 6 Breakdown */}
                  <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/70 space-y-2.5">
                    <div className="font-bold text-slate-900">Number of Health Facilities by Level (Level 1 to Level 6)</div>
                    <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                      {(
                        [
                          { lvl: 1, name: 'L1 · Community' },
                          { lvl: 2, name: 'L2 · Dispensary' },
                          { lvl: 3, name: 'L3 · Health Ctr' },
                          { lvl: 4, name: 'L4 · Primary Hosp' },
                          { lvl: 5, name: 'L5 · Regional Ref' },
                          { lvl: 6, name: 'L6 · National Ref' }
                        ] as const
                      ).map(item => (
                        <div key={item.lvl} className="p-2.5 rounded-lg bg-white border border-slate-200 text-center">
                          <div className="text-[10px] font-bold text-slate-500">{item.name}</div>
                          <div className="text-base font-extrabold text-slate-900 mt-0.5 tabular-nums">
                            {activeAssoc.levels[item.lvl]}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Active & Completed Programs + News */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-2">
                      <div className="font-bold text-slate-900">Active Programs</div>
                      <div className="flex flex-wrap gap-1.5">
                        {activeAssoc.activePrograms.map(p => (
                          <span key={p} className="px-2.5 py-1 rounded-full bg-cyan-50 border border-cyan-200 text-cyan-900 font-semibold text-[11px]">
                            {p}
                          </span>
                        ))}
                      </div>
                      <div className="font-bold text-slate-900 pt-2">Programs Done (Completed)</div>
                      <div className="flex flex-wrap gap-1.5">
                        {activeAssoc.completedPrograms.map(p => (
                          <span key={p} className="px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-900 font-semibold text-[11px]">
                            {p} ✓
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-2">
                      <div className="font-bold text-slate-900 flex items-center gap-1.5">
                        <Newspaper className="w-3.5 h-3.5 text-[#004a59]" /> Member News &amp; Updates
                      </div>
                      <p className="text-slate-700 leading-relaxed">{activeAssoc.news}</p>
                      <div className="pt-2 border-t border-slate-100 text-[11px] text-slate-600 space-y-0.5">
                        <div className="flex items-center gap-1.5"><Mail className="w-3 h-3" /> {activeAssoc.contactEmail}</div>
                        <div className="flex items-center gap-1.5"><Phone className="w-3 h-3" /> {activeAssoc.contactPhone}</div>
                        <div className="flex items-center gap-1.5">
                          <Clock className="w-3 h-3" /> Reference: <b>{activeAssoc.referencePerson}</b> (Mandate ends {activeAssoc.mandateEnd})
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Inline Update Contact, Reference Member & Mandate End Date (Collapsible) */}
                {showEditAssoc && (
                <form onSubmit={handleSaveAssocUpdate} className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-3">
                  <div className="font-bold text-slate-900">Update {activeAssoc.code} Contacts, Reference &amp; Mandate</div>
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">Contact Email</label>
                    <input
                      type="email"
                      value={editAssocEmail}
                      onChange={e => setEditAssocEmail(e.target.value)}
                      className="w-full p-2 rounded-lg border border-slate-300 bg-white"
                    />
                  </div>
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">Contact Phone</label>
                    <input
                      type="text"
                      value={editAssocPhone}
                      onChange={e => setEditAssocPhone(e.target.value)}
                      className="w-full p-2 rounded-lg border border-slate-300 bg-white"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="font-semibold text-slate-700 block mb-1">Reference Person</label>
                      <input
                        type="text"
                        value={editAssocRef}
                        onChange={e => setEditAssocRef(e.target.value)}
                        className="w-full p-2 rounded-lg border border-slate-300 bg-white"
                      />
                    </div>
                    <div>
                      <label className="font-semibold text-slate-700 block mb-1">Role</label>
                      <input
                        type="text"
                        value={editAssocRole}
                        onChange={e => setEditAssocRole(e.target.value)}
                        className="w-full p-2 rounded-lg border border-slate-300 bg-white"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">Mandate End Date (Alert Trigger)</label>
                    <input
                      type="date"
                      value={editAssocMandateEnd}
                      onChange={e => setEditAssocMandateEnd(e.target.value)}
                      className="w-full p-2 rounded-lg border border-slate-300 bg-white"
                    />
                  </div>
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">News / Update Note</label>
                    <textarea
                      rows={2}
                      value={editAssocNews}
                      onChange={e => setEditAssocNews(e.target.value)}
                      className="w-full p-2 rounded-lg border border-slate-300 bg-white"
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full py-2 rounded-full bg-[#004a59] hover:bg-[#003440] text-white font-semibold inline-flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>Save Contacts &amp; Mandate</span>
                  </button>
                </form>
                )}
              </div>
            </div>
            )}

            {fosaSubView === 'REGISTRY' && (
            <>
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
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
          </>
          )}
          </div>
        )}

        {/* Tab 3: Projects (Visual Portfolio + Filter + Progress Bars) */}
        {activeTab === 'PROJECTS' && (
          <div className="space-y-5">
            {/* Portfolio Summary Strip */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white p-4 rounded-2xl border border-slate-200 border-t-4 border-t-[#004a59]">
                <div className="text-[11px] font-bold uppercase text-slate-500">Total Projects</div>
                <div className="text-2xl font-extrabold text-slate-900 mt-0.5 tabular-nums">{SEED_PROJECTS.length}</div>
              </div>
              <div className="bg-white p-4 rounded-2xl border border-slate-200 border-t-4 border-t-emerald-600">
                <div className="text-[11px] font-bold uppercase text-slate-500">Active Projects</div>
                <div className="text-2xl font-extrabold text-emerald-700 mt-0.5 tabular-nums">
                  {SEED_PROJECTS.filter(p => p.status === 'ACTIVE').length}
                </div>
              </div>
              <div className="bg-white p-4 rounded-2xl border border-slate-200 border-t-4 border-t-sky-600">
                <div className="text-[11px] font-bold uppercase text-slate-500">Facilities Reached</div>
                <div className="text-2xl font-extrabold text-slate-900 mt-0.5 tabular-nums">
                  {SEED_PROJECTS.reduce((s, p) => s + p.facilitiesCount, 0).toLocaleString()}
                </div>
              </div>
              <div className="bg-white p-4 rounded-2xl border border-slate-200 border-t-4 border-t-[#f27f20]">
                <div className="text-[11px] font-bold uppercase text-slate-500">Workers Trained</div>
                <div className="text-2xl font-extrabold text-slate-900 mt-0.5 tabular-nums">
                  {SEED_PROJECTS.reduce((s, p) => s + p.healthWorkersTrained, 0).toLocaleString()}
                </div>
              </div>
            </div>

            {/* Filter Bar */}
            <div className="flex items-center gap-2 text-xs">
              {(['ALL', 'ACTIVE', 'COMPLETED'] as const).map(st => (
                <button
                  key={st}
                  type="button"
                  onClick={() => setProjectStatusFilter(st)}
                  className={`px-3.5 py-1.5 rounded-full font-semibold border transition-colors cursor-pointer ${
                    projectStatusFilter === st
                      ? 'bg-[#004a59] text-white border-[#004a59]'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  {st === 'ALL' ? 'All Projects' : st === 'ACTIVE' ? 'Active' : 'Completed'}
                </button>
              ))}
            </div>

            {/* Project Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {SEED_PROJECTS.filter(p => projectStatusFilter === 'ALL' || p.status === projectStatusFilter).map(proj => (
                <div key={proj.code} className="bg-white p-6 rounded-2xl border border-slate-200 hover:border-[#004a59] hover:shadow-md transition-all flex flex-col justify-between gap-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[11px] font-mono font-bold text-[#004a59] bg-cyan-50 border border-cyan-200 px-2.5 py-0.5 rounded-full">
                        {proj.code}
                      </span>
                      <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
                        proj.status === 'ACTIVE'
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                          : 'bg-slate-100 text-slate-700 border-slate-200'
                      }`}>
                        {proj.status}
                      </span>
                    </div>
                    <h3 className="text-base font-bold text-slate-900 leading-snug">{proj.name}</h3>
                    <p className="text-xs text-slate-600 leading-relaxed">{proj.description}</p>
                  </div>

                  <div className="space-y-3 pt-3 border-t border-slate-100 text-xs">
                    <div className="text-slate-700">
                      <span className="text-slate-400 font-semibold">Funder:</span> <b>{proj.funder}</b>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {proj.countries.map(c => (
                        <span key={c} className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-semibold text-[10px]">
                          {c}
                        </span>
                      ))}
                    </div>
                    <div className="grid grid-cols-2 gap-3 pt-1">
                      <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                        <div className="text-[10px] text-slate-500 uppercase font-bold">Facilities</div>
                        <div className="text-base font-extrabold text-[#004a59] tabular-nums">{proj.facilitiesCount}</div>
                      </div>
                      <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                        <div className="text-[10px] text-slate-500 uppercase font-bold">Workers Trained</div>
                        <div className="text-base font-extrabold text-emerald-700 tabular-nums">{proj.healthWorkersTrained}</div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 4: Funders (With Official Scraped Logos from epnetwork.org) */}
        {activeTab === 'FUNDERS' && (
          <div className="space-y-6">
            <div className="rounded-2xl bg-[#004a59] text-white p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="text-[11px] font-bold uppercase tracking-wider text-[#31cdcf]">
                  Global Funding Partners &amp; Donors
                </div>
                <h2 className="text-xl font-bold mt-0.5">
                  Investing in Pharmaceutical Systems Strengthening Across Africa
                </h2>
                <p className="text-xs text-cyan-100/90 mt-1">
                  Transparent co-financing with bilateral faith-based agencies, foundations, procurement cooperatives, and NGOs.
                </p>
              </div>
              <Link
                href="/licensing"
                className="px-5 py-2.5 rounded-full bg-[#f27f20] hover:bg-[#d96e14] text-white text-xs font-bold shrink-0 self-start sm:self-center transition-colors"
              >
                Become a Donor / Partner &rarr;
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {FUNDERS_SEED.map(f => {
                const logoMap: Record<string, string> = {
                  'Bread for the World (Brot für die Welt)': '/partners/brot.jpg',
                  'German Federal Ministry for Economic Cooperation and Development (BMZ) via action medeor': '/partners/action-medeor.jpg',
                  'Difaem (German Institute for Medical Mission)': '/partners/difaem.png',
                  'Plan:g': '/partners/plang.jpg',
                  'Apotheker Helfen e.V.': '/partners/apotheker.png'
                };
                const logoSrc = logoMap[f.name];
                const fundedCount = SEED_PROJECTS.filter(p => p.funder.toLowerCase().includes(f.name.split(' ')[0].toLowerCase())).length;
                return (
                  <div key={f.name} className="bg-white p-5 rounded-2xl border border-slate-200 hover:border-[#004a59] hover:shadow-md transition-all flex flex-col justify-between gap-4">
                    <div className="space-y-3">
                      <div className="h-14 flex items-center justify-between gap-3">
                        {logoSrc ? (
                          <img
                            src={logoSrc}
                            alt={f.name}
                            className="h-12 max-w-[150px] object-contain"
                          />
                        ) : (
                          <div className="h-11 px-3 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center font-extrabold text-xs text-[#004a59]">
                            {f.name.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase()} · {f.country}
                          </div>
                        )}
                        <span className="text-[10px] font-bold text-slate-600 bg-slate-100 px-2.5 py-0.5 rounded-full uppercase shrink-0">
                          {f.type.replace('_', ' ')} · {f.country}
                        </span>
                      </div>
                      <h4 className="text-sm font-bold text-slate-900 leading-snug">{f.name}</h4>
                    </div>

                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                      <span className="text-slate-500">
                        {fundedCount > 0 ? <b>{fundedCount} active/past project{fundedCount > 1 ? 's' : ''}</b> : 'Strategic Network Partner'}
                      </span>
                      <a
                        href={f.website}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[#004a59] font-semibold hover:underline inline-flex items-center gap-1"
                      >
                        <span>Website</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Tab 5: Interactive Multi-Member Union Coverage Calculator */}
        {activeTab === 'COVERAGE' && (() => {
          const COVERAGE_DATA: Record<
            'KE' | 'NG' | 'CM' | 'CD',
            {
              country: string;
              nationalTotal: number;
              members: Array<{ code: string; label: string; count: number }>;
              overlapRate: number;
            }
          > = {
            KE: {
              country: 'Kenya',
              nationalTotal: 6200,
              members: [
                { code: 'CHAK', label: 'CHAK Affiliated Facilities', count: 584 },
                { code: 'MEDS', label: 'MEDS Served Facilities', count: 1420 }
              ],
              overlapRate: 0.18
            },
            NG: {
              country: 'Nigeria',
              nationalTotal: 34000,
              members: [
                { code: 'CHAN', label: 'CHAN Affiliated Facilities', count: 4000 },
                { code: 'CHAN_MP', label: 'CHAN Medi-Pharm Served', count: 3200 }
              ],
              overlapRate: 0.39
            },
            CM: {
              country: 'Cameroon',
              nationalTotal: 4100,
              members: [
                { code: 'CBCHS', label: 'CBCHS Affiliated Facilities', count: 110 },
                { code: 'PCC', label: 'PCC Affiliated Facilities', count: 85 }
              ],
              overlapRate: 0.0
            },
            CD: {
              country: 'DR Congo',
              nationalTotal: 14500,
              members: [
                { code: 'CECA20', label: 'CECA 20 Facilities (Ituri/Bunia)', count: 93 },
                { code: 'CBCA', label: 'CBCA Affiliated Facilities', count: 120 },
                { code: 'DOMECC', label: 'DOM-ECC Network Facilities', count: 640 }
              ],
              overlapRate: 0.08
            }
          };

          const activeData = COVERAGE_DATA[coverageCountry];
          const enabledMembers = activeData.members.filter(m => !coverageDisabled[`${coverageCountry}_${m.code}`]);
          const grossSum = enabledMembers.reduce((s, m) => s + m.count, 0);
          const overlapCount = enabledMembers.length > 1 ? Math.round(grossSum * activeData.overlapRate) : 0;
          const unionUnique = Math.max(0, grossSum - overlapCount);
          const sharePct = ((unionUnique / activeData.nationalTotal) * 100).toFixed(1);

          return (
            <div className="space-y-6">
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <div className="text-[11px] font-bold text-[#004a59] uppercase tracking-wider">
                      Interactive Union Coverage Calculator
                    </div>
                    <h2 className="text-xl font-bold text-slate-900 mt-0.5">
                      Country Coverage Without Double-Counting
                    </h2>
                    <p className="text-xs text-slate-500 mt-1">
                      Select a country and toggle member networks on or off to calculate deduplicated national health-sector coverage.
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-1.5 text-xs">
                    {(['KE', 'NG', 'CM', 'CD'] as const).map(code => (
                      <button
                        key={code}
                        type="button"
                        onClick={() => setCoverageCountry(code)}
                        className={`px-3.5 py-1.5 rounded-lg font-bold border transition-colors cursor-pointer ${
                          coverageCountry === code
                            ? 'bg-[#004a59] text-white border-[#004a59]'
                            : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        {COVERAGE_DATA[code].country}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pt-2">
                  {/* Interactive Network Checkboxes */}
                  <div className="lg:col-span-5 space-y-3">
                    <div className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                      1. Toggle Member Networks in {activeData.country}
                    </div>
                    {activeData.members.map(m => {
                      const key = `${coverageCountry}_${m.code}`;
                      const checked = !coverageDisabled[key];
                      return (
                        <label
                          key={key}
                          className={`flex items-center justify-between p-4 rounded-xl border cursor-pointer transition-colors ${
                            checked ? 'border-[#004a59] bg-cyan-50/50' : 'border-slate-200 bg-slate-50 opacity-65'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <input
                              type="checkbox"
                              checked={checked}
                              onChange={() =>
                                setCoverageDisabled(prev => ({ ...prev, [key]: !prev[key] }))
                              }
                              className="w-4 h-4 accent-[#004a59]"
                            />
                            <div>
                              <div className="text-xs font-bold text-slate-900">{m.code}</div>
                              <div className="text-[11px] text-slate-600">{m.label}</div>
                            </div>
                          </div>
                          <span className="font-mono font-bold text-sm text-slate-900 tabular-nums">
                            {m.count.toLocaleString()}
                          </span>
                        </label>
                      );
                    })}
                  </div>

                  {/* Live Deduplication Result & Visual Bar */}
                  <div className="lg:col-span-7 p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-5 flex flex-col justify-between">
                    <div className="grid grid-cols-3 gap-3 text-xs">
                      <div className="p-3.5 rounded-xl bg-white border border-slate-200">
                        <div className="text-[10px] font-bold uppercase text-slate-500">Gross Sum</div>
                        <div className="text-xl font-extrabold text-slate-900 mt-0.5 tabular-nums">
                          {grossSum.toLocaleString()}
                        </div>
                      </div>
                      <div className="p-3.5 rounded-xl bg-white border border-slate-200">
                        <div className="text-[10px] font-bold uppercase text-amber-700">Overlap Removed</div>
                        <div className="text-xl font-extrabold text-amber-700 mt-0.5 tabular-nums">
                          −{overlapCount.toLocaleString()}
                        </div>
                      </div>
                      <div className="p-3.5 rounded-xl bg-[#004a59] text-white">
                        <div className="text-[10px] font-bold uppercase text-cyan-200">Unique Union FOSAs</div>
                        <div className="text-xl font-extrabold mt-0.5 tabular-nums">
                          {unionUnique.toLocaleString()}
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-xs font-bold">
                        <span className="text-slate-700">
                          Share of {activeData.country} National Health Sector ({activeData.nationalTotal.toLocaleString()} total FOSAs)
                        </span>
                        <span className="text-[#004a59] text-base tabular-nums">{sharePct}%</span>
                      </div>
                      <div className="w-full h-4 bg-slate-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-[#004a59] rounded-full transition-all duration-300"
                          style={{ width: `${Math.min(100, Number(sharePct))}%` }}
                        />
                      </div>
                      <p className="text-[11px] text-slate-500">
                        Deduplicates facilities that are both affiliated to a national CHA (e.g., CHAK/CHAN) and supplied by a national DSO (e.g., MEDS/CHAN Medi-Pharm).
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })()}
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
