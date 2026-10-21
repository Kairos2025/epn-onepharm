'use client';

import React, { useState } from 'react';
import { Navbar } from '@/components/Navbar';
import { MapPin, Layers, Filter, CheckCircle2, AlertCircle } from 'lucide-react';
import { SEED_COUNTRIES } from '@epn/db';

export default function MapsPage() {
  const [selectedLayer, setSelectedLayer] = useState<'FACILITIES' | 'COVERAGE' | 'PRESENCE'>('FACILITIES');
  const [activeCountry, setActiveCountry] = useState<string>('KE');

  return (
    <div className="flex-1 flex flex-col bg-slate-50 min-h-screen">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full space-y-6">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-sky-100 text-sky-800 uppercase tracking-wider">
                Geographic Information
              </span>
              <h1 className="text-xl font-bold text-slate-900">Pan-African Thematic Map</h1>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Geospatial distribution of church health networks, supported vs unsupported facilities, and priority footprints.
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <button
              onClick={() => setSelectedLayer('FACILITIES')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-colors ${
                selectedLayer === 'FACILITIES' ? 'bg-sky-600 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              Facility Points
            </button>
            <button
              onClick={() => setSelectedLayer('COVERAGE')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-colors ${
                selectedLayer === 'COVERAGE' ? 'bg-sky-600 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              National Coverage %
            </button>
          </div>
        </div>

        {/* Map visualization canvas container */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-3 bg-slate-900 rounded-xl overflow-hidden min-h-[480px] relative border border-slate-800 p-6 flex flex-col justify-between text-white">
            <div className="flex justify-between items-start">
              <div className="bg-slate-800/90 backdrop-blur p-3 rounded-lg border border-slate-700 text-xs space-y-1">
                <span className="font-bold text-sky-400 block">Sub-Saharan Africa Coverage</span>
                <span className="text-[11px] text-slate-300">29 African Member Countries Active</span>
              </div>

              {/* Legend Box */}
              <div className="bg-slate-800/90 backdrop-blur p-3 rounded-lg border border-slate-700 text-xs space-y-1.5">
                <span className="font-bold text-slate-200 block text-[10px] uppercase">Facility Status</span>
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400"></span>
                  <span className="text-slate-300 text-[11px]">EPN Supported (Active Project)</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-slate-400"></span>
                  <span className="text-slate-300 text-[11px]">Network Member Affiliated</span>
                </div>
              </div>
            </div>

            {/* Stylized African continent nodes simulation */}
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 my-auto max-w-2xl mx-auto py-8">
              {SEED_COUNTRIES.slice(0, 12).map(c => (
                <button
                  key={c.code}
                  onClick={() => setActiveCountry(c.code)}
                  className={`p-3 rounded-lg border transition-all text-left ${
                    activeCountry === c.code
                      ? 'border-sky-400 bg-sky-950/80 shadow-md ring-1 ring-sky-400'
                      : 'border-slate-700 bg-slate-800/50 hover:bg-slate-800'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-white">{c.name}</span>
                    <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono mt-1 block">
                    Lat: {c.lat.toFixed(1)}°, Lng: {c.lng.toFixed(1)}°
                  </span>
                </button>
              ))}
            </div>

            <div className="text-[11px] text-slate-400 flex justify-between items-center pt-2 border-t border-slate-800">
              <span>MapLibre GL JS / OpenStreetMap Vector Data</span>
              <span>Coordinates validated against Kenyan Master Facility List</span>
            </div>
          </div>

          {/* Right sidebar: Country Profile & Facility List */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4 text-xs">
            <h3 className="font-bold text-slate-900 uppercase tracking-wider">
              {activeCountry === 'KE' ? 'Kenya Footprint' : 'Country Profile'}
            </h3>

            <div className="space-y-2 text-slate-700">
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span>Member Organizations:</span>
                <span className="font-bold">CHAK, MEDS</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span>Network Facilities:</span>
                <span className="font-bold">584 FOSAs</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span>Active EPN Projects:</span>
                <span className="font-bold">ACCESS II, IMPACT, MNCH</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span>Tracer Availability:</span>
                <span className="font-bold text-emerald-600">88.5%</span>
              </div>
            </div>

            <div className="pt-2">
              <span className="font-bold text-slate-800 block mb-2">Sample Supported Hospitals:</span>
              <ul className="space-y-1.5 text-slate-600">
                <li className="p-2 rounded bg-slate-50 border border-slate-100 font-medium">
                  Kilome Mission Hospital (Machakos)
                </li>
                <li className="p-2 rounded bg-slate-50 border border-slate-100 font-medium">
                  Kijabe Hospital & Satellite Centers
                </li>
                <li className="p-2 rounded bg-slate-50 border border-slate-100 font-medium">
                  Maua Methodist Hospital (Meru)
                </li>
              </ul>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
