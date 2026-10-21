'use client';

import React, { useState } from 'react';
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
import { IMPLEMENTING_MEMBERS_SEED, FUNDERS_SEED } from '@epn/domain';
import { SEED_PROJECTS } from '@epn/db';

type TabKind = 'MEMBERS' | 'FACILITIES' | 'PROJECTS' | 'FUNDERS' | 'COVERAGE';

export default function ExplorerPage() {
  const [activeTab, setActiveTab] = useState<TabKind>('MEMBERS');
  const [selectedMember, setSelectedMember] = useState<string>('CHAK');
  const [selectedFacility, setSelectedFacility] = useState<string>('Kilome Mission Hospital');

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
    }
  ];

  const activeFac = facilities.find(f => f.name === selectedFacility) || facilities[0];

  return (
    <div className="flex-1 flex flex-col bg-slate-50 min-h-screen">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full space-y-6">
        {/* Navigation Breadcrumb / Pivot rail */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-xs">
            <span className="font-semibold text-slate-500 uppercase tracking-wider">Circular Navigation:</span>
            <span className="font-bold text-sky-700 bg-sky-50 px-2 py-0.5 rounded">Member: {selectedMember}</span>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
            <span className="font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded">Facility: {activeFac.name}</span>
          </div>

          {/* Top Tabs */}
          <div className="flex flex-wrap items-center gap-1.5 text-xs">
            <button
              onClick={() => setActiveTab('MEMBERS')}
              className={`px-3 py-1.5 rounded-lg font-semibold flex items-center gap-1.5 transition-colors ${
                activeTab === 'MEMBERS' ? 'bg-sky-600 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              <Network className="w-3.5 h-3.5" />
              <span>Members (19)</span>
            </button>
            <button
              onClick={() => setActiveTab('FACILITIES')}
              className={`px-3 py-1.5 rounded-lg font-semibold flex items-center gap-1.5 transition-colors ${
                activeTab === 'FACILITIES' ? 'bg-sky-600 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              <Building className="w-3.5 h-3.5" />
              <span>FOSA Briefs</span>
            </button>
            <button
              onClick={() => setActiveTab('PROJECTS')}
              className={`px-3 py-1.5 rounded-lg font-semibold flex items-center gap-1.5 transition-colors ${
                activeTab === 'PROJECTS' ? 'bg-sky-600 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              <FolderKanban className="w-3.5 h-3.5" />
              <span>Projects (6)</span>
            </button>
            <button
              onClick={() => setActiveTab('FUNDERS')}
              className={`px-3 py-1.5 rounded-lg font-semibold flex items-center gap-1.5 transition-colors ${
                activeTab === 'FUNDERS' ? 'bg-sky-600 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              <Coins className="w-3.5 h-3.5" />
              <span>Funders (9)</span>
            </button>
            <button
              onClick={() => setActiveTab('COVERAGE')}
              className={`px-3 py-1.5 rounded-lg font-semibold flex items-center gap-1.5 transition-colors ${
                activeTab === 'COVERAGE' ? 'bg-sky-600 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Union Coverage</span>
            </button>
          </div>
        </div>

        {/* Tab 1: Member Chapter Overview */}
        {activeTab === 'MEMBERS' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-1 bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-3">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Select Member Chapter</h3>
              <div className="space-y-1.5 max-h-[500px] overflow-y-auto pr-1">
                {IMPLEMENTING_MEMBERS_SEED.map(m => (
                  <button
                    key={m.abbreviation + m.country}
                    onClick={() => setSelectedMember(m.abbreviation)}
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
                  <h2 className="text-xl font-bold text-slate-900 mt-0.5">Christian Health Association of Kenya (CHAK)</h2>
                  <span className="text-xs text-slate-500">Nairobi, Kenya • Founded 1930 • 580+ Health Facilities</span>
                </div>
                <span className="px-2.5 py-1 text-xs font-bold rounded bg-emerald-100 text-emerald-800">Active Member</span>
              </div>

              {/* Strategic Plan Alignment & Gaps */}
              <div className="bg-amber-50/70 border border-amber-200 rounded-lg p-4 space-y-1.5 text-xs">
                <span className="font-bold text-amber-900">Strategic Plan Alignment & Priorities:</span>
                <p className="text-amber-800 leading-relaxed">
                  CHAK Strategic Plan 2024–2028 is aligned with EPN Core Pharmaceutical Systems strengthening. Dedicated Drug Revolving Fund (DRF) initiative scaled across 120 mission hospitals. Flagged gap: sub-county cold chain distribution in arid Northern Kenya.
                </p>
              </div>

              {/* Member facilities */}
              <div>
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Key Member Facilities in EPN Network:</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {facilities.filter(f => f.member === 'CHAK').map(f => (
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
                        onClick={() => {
                          setSelectedFacility(f.name);
                          setActiveTab('FACILITIES');
                        }}
                        className="text-xs font-semibold text-sky-600 hover:underline mt-2 flex items-center gap-1"
                      >
                        <span>Open FOSA Brief</span>
                        <ChevronRight className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: FOSA Facility Brief (Section 8.7) */}
        {activeTab === 'FACILITIES' && (
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
