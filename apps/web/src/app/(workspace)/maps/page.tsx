'use client';

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { Navbar } from '@/components/Navbar';
import { MapPin, AlertTriangle, CheckCircle2, ShieldAlert } from 'lucide-react';
import { IMPLEMENTING_MEMBERS_SEED } from '@epn/domain';
import type { SurveillanceSummary, OrgUnit, FacilityProfile } from '@epn/domain';
import { SEED_COUNTRIES, SEED_PROJECTS } from '@epn/db';
import type { MapLayerMode } from '@/components/AfricaMap';
import { epnClient } from '@/lib/api';

const AfricaMap = dynamic(
  () => import('@/components/AfricaMap').then(m => m.AfricaMap),
  { ssr: false, loading: () => <div className="h-[520px] animate-pulse bg-slate-100 rounded-2xl" /> }
);

export default function MapsPage() {
  const [selectedLayer, setSelectedLayer] = useState<MapLayerMode>('CONTROL_STATUS');
  const [activeCountry, setActiveCountry] = useState<string>('KE');
  const [surveillance, setSurveillance] = useState<SurveillanceSummary | null>(null);
  const [facilities, setFacilities] = useState<Array<OrgUnit & { profile?: FacilityProfile }>>([]);

  useEffect(() => {
    Promise.all([
      epnClient.getSurveillanceSummary().catch(() => null),
      epnClient.getFacilities().catch(() => [])
    ]).then(([surv, facs]) => {
      if (surv) setSurveillance(surv);
      if (Array.isArray(facs)) setFacilities(facs);
    });
  }, []);

  const countryInfo = SEED_COUNTRIES.find(c => c.code === activeCountry);
  const scorecard = surveillance?.countryScorecards.find(s => s.country === activeCountry);
  const members = IMPLEMENTING_MEMBERS_SEED.filter(m => m.country === activeCountry);
  const projects = SEED_PROJECTS.filter(p => p.countries.includes(activeCountry));
  const countryFacilities = facilities.filter(f => f.country === activeCountry);
  const countryAlerts = (surveillance?.alerts || []).filter(
    a => a.country === activeCountry && a.status !== 'RESOLVED'
  );

  return (
    <div className="flex-1 flex flex-col min-h-screen">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full space-y-6">
        <div className="m3-glass-card p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-cyan-100 text-cyan-900 uppercase tracking-wider">
                Pan-African GIS Atlas
              </span>
              <h1 className="text-xl font-bold text-slate-900">Pharmaceutical Surveillance &amp; Footprint Map</h1>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Equal-Earth projection with CVD-safe control status, tracer availability choropleth, and FOSA facility points.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-1.5 bg-slate-100 p-1 rounded-full text-xs">
            {(
              [
                { id: 'CONTROL_STATUS', label: 'Control Status' },
                { id: 'COVERAGE', label: 'Tracer Availability' },
                { id: 'FACILITIES', label: 'Facility Points' }
              ] as const
            ).map(tab => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setSelectedLayer(tab.id)}
                className={`px-3.5 py-1.5 rounded-full font-semibold transition-colors cursor-pointer ${
                  selectedLayer === tab.id ? 'bg-cyan-700 text-white shadow-xs' : 'text-slate-700 hover:bg-white'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Map + Dynamic Country Dossier */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <AfricaMap
              onPick={code => setActiveCountry(code)}
              selectedCode={activeCountry}
              layer={selectedLayer}
              scorecards={surveillance?.countryScorecards || []}
              facilities={facilities.map(f => ({
                id: f.id,
                name: f.name,
                country: f.country,
                latitude: f.latitude,
                longitude: f.longitude
              }))}
            />
          </div>

          {/* Dynamic Right Sidebar: Country Dossier */}
          <div className="m3-glass-card p-5 space-y-4 text-xs flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center justify-between gap-2 pb-3 border-b border-slate-100">
                <div>
                  <span className="text-[10px] font-mono uppercase text-slate-400">Country Dossier</span>
                  <h2 className="text-lg font-bold text-slate-900">
                    {countryInfo?.name || activeCountry}{' '}
                    <span className="font-mono text-sm text-slate-400">({activeCountry})</span>
                  </h2>
                </div>
                {scorecard && (
                  <span
                    className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold ${
                      scorecard.controlStatus === 'OPTIMAL'
                        ? 'bg-emerald-100 text-emerald-800'
                        : scorecard.controlStatus === 'WATCH'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-rose-100 text-rose-800'
                    }`}
                  >
                    {scorecard.controlStatus === 'OPTIMAL' ? (
                      <CheckCircle2 className="w-3 h-3" />
                    ) : (
                      <AlertTriangle className="w-3 h-3" />
                    )}
                    {scorecard.controlStatus}
                  </span>
                )}
              </div>

              <div className="space-y-2 text-slate-700">
                <div className="flex justify-between py-1.5 border-b border-slate-100 gap-2">
                  <span>Member Organizations:</span>
                  <span className="font-bold text-right">
                    {members.length > 0 ? members.map(m => m.abbreviation).join(', ') : 'EPN Partner Network'}
                  </span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-slate-100">
                  <span>Reporting Completeness:</span>
                  <span className="font-bold tabular-nums">
                    {scorecard ? `${scorecard.reportingCompletenessPct}%` : 'Regional Aggregate'}
                  </span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-slate-100">
                  <span>Tracer Availability:</span>
                  <span className="font-bold text-cyan-800 tabular-nums">
                    {scorecard ? `${scorecard.tracerAvailabilityPct}%` : '84.2% (Baseline)'}
                  </span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-slate-100">
                  <span>Active EPN Projects:</span>
                  <span className="font-bold text-right">
                    {projects.length > 0 ? projects.map(p => p.code).join(', ') : 'Network-Wide'}
                  </span>
                </div>
              </div>

              {countryAlerts.length > 0 && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 space-y-1">
                  <div className="flex items-center gap-1.5 font-bold text-rose-800 text-[11px]">
                    <ShieldAlert className="w-3.5 h-3.5" />
                    <span>{countryAlerts.length} Active Sentinel Alert(s)</span>
                  </div>
                  {countryAlerts.map(a => (
                    <div key={a.id} className="text-[11px] text-rose-900">
                      • {a.title} ({a.facilityName})
                    </div>
                  ))}
                </div>
              )}

              <div>
                <span className="font-bold text-slate-800 block mb-2">
                  Anchored Facilities ({countryFacilities.length})
                </span>
                {countryFacilities.length === 0 ? (
                  <p className="text-[11px] text-slate-500">
                    Aggregate member reporting active; no individual FOSA coordinates published for {activeCountry}.
                  </p>
                ) : (
                  <ul className="space-y-1.5 text-slate-700">
                    {countryFacilities.map(fac => (
                      <li
                        key={fac.id}
                        className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between gap-2"
                      >
                        <span className="font-medium flex items-center gap-1.5">
                          <MapPin className="w-3.5 h-3.5 text-cyan-700 shrink-0" />
                          <span>{fac.name}</span>
                        </span>
                        <span className="text-[10px] font-mono text-slate-400">
                          {fac.profile?.facility_level || 'FOSA'}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>

            <Link
              href="/dashboard"
              className="w-full py-2.5 rounded-full bg-cyan-700 hover:bg-cyan-800 text-white font-semibold text-center transition-colors cursor-pointer block"
            >
              Open Control Center for {countryInfo?.name || activeCountry}
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
