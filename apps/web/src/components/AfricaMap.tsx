'use client';

import React from 'react';
import { ComposableMap, Geographies, Geography, Marker } from 'react-simple-maps';
import { IMPLEMENTING_MEMBERS_SEED } from '@epn/domain';
import { SEED_COUNTRIES, SEED_PROJECTS } from '@epn/db';

const GEO_URL = 'https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json';

// Natural Earth country names -> ISO-2 seed codes
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

const DEFAULT_FILL = '#d3dbe6';
const PENDING_FILL = '#e2e8f0';

function fillForCode(code?: string): string {
  if (!code || !SEED_COUNTRIES.some(c => c.code === code)) return DEFAULT_FILL;
  const projects = SEED_PROJECTS.filter(p => p.countries.includes(code));
  if (projects.length === 0) return PENDING_FILL;
  const ongoing = projects.filter(p => p.status === 'ACTIVE').length;
  if (ongoing >= 3) return '#047857';
  if (projects.length >= 3) return '#10b981';
  return '#34d399';
}

interface AfricaMapProps {
  onPick: (code: string) => void;
}

export function AfricaMap({ onPick }: AfricaMapProps) {
  const presence = SEED_COUNTRIES.filter(
    c =>
      IMPLEMENTING_MEMBERS_SEED.some(m => m.country === c.code) ||
      SEED_PROJECTS.some(p => p.countries.includes(c.code))
  );

  return (
    <div className="relative w-full rounded-xl border border-slate-200 overflow-hidden bg-sky-50">
      <ComposableMap
        projection="geoMercator"
        projectionConfig={{ center: [22, -2], scale: 620 }}
        width={900}
        height={720}
        style={{ width: '100%', height: 'auto', display: 'block' }}
      >
        <Geographies geography={GEO_URL}>
          {({ geographies }: { geographies: any[] }) =>
            geographies.map((geo: any) => {
              const code: string | undefined =
                NAME_TO_CODE[geo.properties?.name] ??
                SEED_COUNTRIES.find(c => c.name === geo.properties?.name)?.code;
              const clickable = Boolean(code);
              return (
                <Geography
                  key={geo.rsmKey}
                  geography={geo}
                  onClick={() => {
                    if (clickable) onPick(code as string);
                  }}
                  fill={fillForCode(code)}
                  stroke="#94a3b8"
                  strokeWidth={0.4}
                  className={clickable ? 'epn-geo-clickable' : 'epn-geo-static'}
                />
              );
            })
          }
        </Geographies>
        {/* Country code labels for mapped countries */}
        {presence.map(country => (
          <Marker key={country.code} coordinates={[country.lng, country.lat]}>
            <text
              textAnchor="middle"
              y={4}
              style={{
                fontSize: 8,
                fontWeight: 700,
                fill: '#0f172a',
                stroke: '#ffffff',
                strokeWidth: 2.5,
                paintOrder: 'stroke',
                pointerEvents: 'none'
              }}
            >
              {country.code}
            </text>
          </Marker>
        ))}
      </ComposableMap>
      <div className="absolute bottom-3 left-3 bg-white/85 backdrop-blur rounded-lg border border-slate-200 px-3 py-2 text-[10px] font-semibold text-slate-600">
        300M people served · 25,000 facilities
      </div>
    </div>
  );
}

export default AfricaMap;
