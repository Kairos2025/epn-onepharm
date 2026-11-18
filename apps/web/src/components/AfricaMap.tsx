'use client';

import React, { useState } from 'react';
import { ComposableMap, Geographies, Geography, Marker, Graticule } from 'react-simple-maps';
import { IMPLEMENTING_MEMBERS_SEED } from '@epn/domain';
import type { CountryControlScorecard } from '@epn/domain';
import { SEED_COUNTRIES, SEED_PROJECTS } from '@epn/db';

const GEO_URL = 'https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json';

const NAME_TO_CODE: Record<string, string> = {
  Kenya: 'KE',
  Nigeria: 'NG',
  Tanzania: 'TZ',
  'United Republic of Tanzania': 'TZ',
  Rwanda: 'RW',
  Chad: 'TD',
  Cameroon: 'CM',
  Lesotho: 'LS',
  Liberia: 'LR',
  'Sierra Leone': 'SL',
  Guinea: 'GN',
  Burundi: 'BI',
  'Dem. Rep. Congo': 'CD',
  'Democratic Republic of the Congo': 'CD',
  Uganda: 'UG',
  Niger: 'NE',
  Malawi: 'MW',
  Zambia: 'ZM',
  Madagascar: 'MG',
  'South Sudan': 'SS'
};

// Collision-avoidance offsets [dlng, dlat] for dense East/West African labels
const LABEL_OFFSETS: Record<string, [number, number]> = {
  RW: [-1.4, 0.8],
  BI: [1.5, -1.3],
  SL: [-2.0, -0.5],
  GN: [0.2, 1.8],
  LR: [2.0, -1.2]
};

export type MapLayerMode = 'CONTROL_STATUS' | 'COVERAGE' | 'FACILITIES';

export interface MapFacilityPoint {
  id: string;
  name: string;
  country?: string;
  latitude?: number;
  longitude?: number;
  status?: string;
}

interface AfricaMapProps {
  onPick: (code: string) => void;
  selectedCode?: string;
  layer?: MapLayerMode;
  scorecards?: CountryControlScorecard[];
  facilities?: MapFacilityPoint[];
}

export function AfricaMap({
  onPick,
  selectedCode,
  layer = 'CONTROL_STATUS',
  scorecards = [],
  facilities = []
}: AfricaMapProps) {
  const [hovered, setHovered] = useState<{ code: string; name: string; detail: string } | null>(null);

  const presence = SEED_COUNTRIES.filter(
    c =>
      IMPLEMENTING_MEMBERS_SEED.some(m => m.country === c.code) ||
      SEED_PROJECTS.some(p => p.countries.includes(c.code))
  );

  const getScorecard = (code?: string) =>
    code ? scorecards.find(s => s.country === code) : undefined;

  const fillForCode = (code?: string): string => {
    if (!code || !SEED_COUNTRIES.some(c => c.code === code)) return '#e2e8f0';
    const sc = getScorecard(code);

    if (layer === 'FACILITIES') {
      return sc || presence.some(p => p.code === code) ? '#e0f2fe' : '#e2e8f0';
    }

    if (layer === 'COVERAGE') {
      if (sc) {
        if (sc.tracerAvailabilityPct >= 90) return '#0e7490';
        if (sc.tracerAvailabilityPct >= 85) return '#06b6d4';
        if (sc.tracerAvailabilityPct >= 75) return '#67e8f9';
        return '#f59e0b';
      }
      const projects = SEED_PROJECTS.filter(p => p.countries.includes(code));
      return projects.length >= 2 ? '#67e8f9' : '#cffafe';
    }

    // CONTROL_STATUS (CVD-safe diverging: Teal / Amber / Vermilion)
    if (sc) {
      if (sc.controlStatus === 'OPTIMAL') return '#0f766e';
      if (sc.controlStatus === 'WATCH') return '#d97706';
      return '#dc2626';
    }
    const projects = SEED_PROJECTS.filter(p => p.countries.includes(code));
    if (projects.filter(p => p.status === 'ACTIVE').length >= 2) return '#14b8a6';
    return '#99f6e4';
  };

  const describeCountry = (code: string, name: string): string => {
    const sc = getScorecard(code);
    if (sc) {
      return `${sc.controlStatus} • Tracer ${sc.tracerAvailabilityPct}% • Completeness ${sc.reportingCompletenessPct}%`;
    }
    const projCount = SEED_PROJECTS.filter(p => p.countries.includes(code)).length;
    return `${projCount} EPN Programme${projCount === 1 ? '' : 's'} Active`;
  };

  return (
    <div className="relative w-full rounded-2xl border border-slate-200 overflow-hidden bg-gradient-to-b from-sky-50 to-slate-100">
      <ComposableMap
        projection="geoEqualEarth"
        projectionConfig={{ center: [18, 2], scale: 520 }}
        width={900}
        height={700}
        style={{ width: '100%', height: 'auto', display: 'block' }}
      >
        <Graticule stroke="#cbd5e1" strokeWidth={0.35} strokeDasharray="2 2" />

        <Geographies geography={GEO_URL}>
          {({ geographies }: { geographies: any[] }) =>
            geographies.map((geo: any) => {
              const code: string | undefined =
                NAME_TO_CODE[geo.properties?.name] ??
                SEED_COUNTRIES.find(c => c.name === geo.properties?.name)?.code;
              const clickable = Boolean(code);
              const isSelected = Boolean(code && selectedCode === code);

              return (
                <Geography
                  key={geo.rsmKey}
                  geography={geo}
                  onClick={() => {
                    if (clickable) onPick(code as string);
                  }}
                  onMouseEnter={() => {
                    if (clickable && code) {
                      const cObj = SEED_COUNTRIES.find(c => c.code === code);
                      setHovered({
                        code,
                        name: cObj?.name || geo.properties?.name || code,
                        detail: describeCountry(code, geo.properties?.name)
                      });
                    }
                  }}
                  onMouseLeave={() => setHovered(null)}
                  fill={fillForCode(code)}
                  stroke={isSelected ? '#0f172a' : '#94a3b8'}
                  strokeWidth={isSelected ? 1.5 : 0.45}
                  className={clickable ? 'epn-geo-clickable' : 'epn-geo-static'}
                />
              );
            })
          }
        </Geographies>

        {/* Country ISO-2 labels with white halo & collision offsets */}
        {presence.map(country => {
          const [dlng, dlat] = LABEL_OFFSETS[country.code] || [0, 0];
          const isSelected = selectedCode === country.code;
          return (
            <Marker key={country.code} coordinates={[country.lng + dlng, country.lat + dlat]}>
              <text
                textAnchor="middle"
                y={3}
                style={{
                  fontSize: isSelected ? 10 : 8,
                  fontWeight: 700,
                  fill: '#0f172a',
                  stroke: '#ffffff',
                  strokeWidth: 2.8,
                  paintOrder: 'stroke',
                  pointerEvents: 'none'
                }}
              >
                {country.code}
              </text>
            </Marker>
          );
        })}

        {/* Facility Point Overlay */}
        {layer === 'FACILITIES' &&
          facilities
            .filter(f => typeof f.longitude === 'number' && typeof f.latitude === 'number')
            .map(fac => (
              <Marker key={fac.id} coordinates={[fac.longitude as number, fac.latitude as number]}>
                <circle
                  r={4.5}
                  fill="#0891b2"
                  stroke="#ffffff"
                  strokeWidth={1.6}
                  style={{ cursor: 'pointer' }}
                  onClick={() => {
                    if (fac.country) onPick(fac.country);
                  }}
                />
              </Marker>
            ))}
      </ComposableMap>

      {/* Hover Tooltip */}
      {hovered && (
        <div className="absolute top-3 left-3 m3-glass px-3.5 py-2 rounded-xl text-xs pointer-events-none">
          <div className="font-bold text-slate-900">
            {hovered.name} <span className="font-mono text-slate-500">({hovered.code})</span>
          </div>
          <div className="text-[11px] text-slate-700 font-medium">{hovered.detail}</div>
        </div>
      )}

      {/* Mandatory Dynamic Cartographic Legend */}
      <div className="absolute bottom-3 left-3 m3-glass rounded-xl px-3.5 py-2.5 text-[10px] space-y-1.5 max-w-xs">
        <div className="font-bold text-slate-800 uppercase tracking-wider">
          {layer === 'CONTROL_STATUS'
            ? 'Control Status (CVD-Safe)'
            : layer === 'COVERAGE'
            ? 'Tracer Medicine Availability'
            : 'FOSA Facility Locations'}
        </div>

        {layer === 'CONTROL_STATUS' && (
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-slate-700 font-medium">
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-xs bg-[#0f766e]" /> Optimal (&ge;85%)
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-xs bg-[#d97706]" /> Watch
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-xs bg-[#dc2626]" /> Alert
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-xs bg-[#99f6e4]" /> EPN Footprint
            </span>
          </div>
        )}

        {layer === 'COVERAGE' && (
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-slate-700 font-medium">
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-xs bg-[#0e7490]" /> &ge;90%
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-xs bg-[#06b6d4]" /> 85–89%
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-xs bg-[#67e8f9]" /> 75–84%
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-xs bg-[#f59e0b]" /> &lt;75%
            </span>
          </div>
        )}

        {layer === 'FACILITIES' && (
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-slate-700 font-medium">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#0891b2] ring-1 ring-white" /> Anchor FOSA Facility
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-xs bg-[#e0f2fe]" /> EPN Member Nation
            </span>
          </div>
        )}

        <div className="text-[9px] text-slate-500 pt-0.5 border-t border-slate-200/70">
          Equal Earth Projection • 29 African Nations • 25,000+ FOSAs
        </div>
      </div>
    </div>
  );
}

export default AfricaMap;
