import { db } from './index.js';

const args = process.argv.slice(2);
const isMinimal = args.includes('--minimal');
const isEpnOnly = args.includes('--epn');

console.log('--- EPN OnePharm Database Seed ---');
if (isMinimal) {
  console.log('Mode: Minimal Metadata Only');
  db.initializeData('epn');
} else if (isEpnOnly) {
  console.log('Mode: EPN Verified Network & Project Facts');
  db.initializeData('epn');
} else {
  console.log('Mode: Demo (EPN Network + Synthetic Facilities & 36-Month Time Series)');
  db.initializeData('demo');
}

console.log(`Seeded ${db.getMembers().length} Network Members across ${db.getOrgUnits(2).length} Countries.`);
console.log(`Seeded ${db.getFacilities().length} Health Facilities.`);
console.log(`Seeded ${db.getDataElements().length} DHIS2 Data Elements.`);
console.log(`Seeded ${db.getIndicators().length} Core Result Indicators.`);
console.log(`Seeded ${db.getProjects().length} Projects and ${db.getFunders().length} Funders.`);
console.log(`Seeded ${db.getStockItems().length} Tracer Stock Items.`);
console.log('Database seed completed successfully.');
