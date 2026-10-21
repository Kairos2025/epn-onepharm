/**
 * Main interface architecture: the 7 agreed top-level categories (blocks).
 *
 * Each category supports up to 9 sub-categories. Sub-category hrefs map to
 * the current application routes; as milestones progress each sub-category
 * gets its own dedicated route (see docs/interface-architecture.md).
 *
 * Navigation is circular: users can enter from Member, Health Facility,
 * Funder or Project and reach any related data from every entry point.
 */

export interface WorkspaceSubCategory {
  code: string;
  name: string;
  nameFr: string;
  description: string;
  href: string;
  external?: boolean;
}

export interface WorkspaceCategory {
  code: string;
  name: string;
  nameFr: string;
  icon: string;
  href: string;
  description: string;
  subs: readonly WorkspaceSubCategory[];
}

export const START_FROM_ENTRY_POINTS = [  { code: 'MEMBER', name: 'Member', href: '/explorer', description: 'Start from a member organization and reach its facilities, projects and funders.' },
  { code: 'FACILITY', name: 'Health Facility', href: '/explorer', description: 'Start from a facility and reach its member, data and supply indicators.' },
  { code: 'FUNDER', name: 'Funder (Buyer)', href: '/explorer', description: 'Start from a funder and see all funded projects, amounts and periods.' },
  { code: 'PROJECT', name: 'Project', href: '/programs', description: 'Start from a project and see its funder, program and priority area.' }
] as const;

export const WORKSPACE_CATEGORIES: readonly WorkspaceCategory[] = [
  {
    code: 'MEMBERSHIP',
    name: 'Membership',
    nameFr: 'Adhésion',
    icon: 'users',
    href: '/explorer',
    description: 'Member identities, health facility links and group composition across the network.',
    subs: [
      { code: 'MEMBER_DIRECTORY', name: 'Member Directory', nameFr: 'Annuaire des membres', description: 'All 149 member organizations with type, country and status.', href: '/explorer' },
      { code: 'MEMBER_PROFILE', name: 'Member Profiles', nameFr: 'Profils des membres', description: 'Identity, membership category and strategic plan per member.', href: '/explorer' },
      { code: 'MEMBER_FACILITIES', name: 'Facilities & Networks', nameFr: 'Établissements et réseaux', description: 'Health facilities linked back to each member organization.', href: '/explorer' },
      { code: 'CHAPTERS', name: 'Chapters & Regions', nameFr: 'Chapitres et régions', description: 'Regional chapters and country groupings.', href: '/maps' },
      { code: 'MEMBERSHIP_FEES', name: 'Fees & Subscriptions', nameFr: 'Cotisations et abonnements', description: 'Subscription tiers and payment status per member.', href: '/billing' },
      { code: 'DATA_SHARING', name: 'Data Sharing Agreements', nameFr: 'Accords de partage des données', description: 'Sovereign data-sharing controls per member (P2).', href: '/maintenance' }
    ]
  },
  {
    code: 'PROJECTS',
    name: 'Projects',
    nameFr: 'Projets',
    icon: 'briefcase',
    href: '/programs',
    description: 'Projects organized by program area and health priority, with funder and period links.',
    subs: [
      { code: 'PROGRAM_AREAS', name: 'Program Areas', nameFr: 'Domaines de programmes', description: 'The 5 official EPN program areas and their projects.', href: '/programs' },
      { code: 'PROJECT_REGISTER', name: 'Project Register', nameFr: 'Registre des projets', description: 'Browse the full project list with status, budget and period.', href: '/explorer' },
      { code: 'BY_PRIORITY', name: 'By Health Priority', nameFr: 'Par priorité de santé', description: 'MNCH/RH, IPC & AMR, NCDs, NTDs project views.', href: '/explorer' },
      { code: 'BY_FUNDER', name: 'By Funder', nameFr: 'Par bailleur', description: 'Funders (Buyers) with all funded projects, amounts and periods.', href: '/explorer' },
      { code: 'PROJECT_RESULTS', name: 'Project Results', nameFr: 'Résultats des projets', description: 'People trained, facilities reached and outcomes per project.', href: '/reports' }
    ]
  },
  {
    code: 'FACILITIES',
    name: 'Health Facilities',
    nameFr: 'Établissements de santé',
    icon: 'building',
    href: '/explorer',
    description: 'Facility data linked to members and geography across 29 African nations.',
    subs: [
      { code: 'FACILITY_REGISTRY', name: 'Facility Registry', nameFr: 'Registre des établissements', description: 'Master list of network health facilities.', href: '/explorer' },
      { code: 'FACILITY_PROFILE', name: 'Facility Profiles', nameFr: 'Profils des établissements', description: 'Level, beds, catchment, services and pharmacy capacity.', href: '/explorer' },
      { code: 'GEO_COVERAGE', name: 'Geographic Coverage', nameFr: 'Couverture géographique', description: 'Country and subnational mapping of the network.', href: '/maps' },
      { code: 'REPORTING', name: 'Reporting & Completeness', nameFr: 'Rapports et complétude', description: 'Data quality, completeness and timeliness per facility.', href: '/quality' },
      { code: 'FACILITY_MEMBER_LINKS', name: 'Facility–Member Links', nameFr: 'Liens établissement–membre', description: 'Ownership chains: Network → Country → Member → Facility.', href: '/explorer' }
    ]
  },
  {
    code: 'MEDICINES',
    name: 'Medicines & Supply',
    nameFr: 'Médicaments et approvisionnement',
    icon: 'pill',
    href: '/medstock',
    description: 'Procurement, consumption, availability and innovative products (renamed from Pharmaceuticals).',
    subs: [
      { code: 'TRACER_AVAIL', name: 'Tracer Availability', nameFr: 'Disponibilité des médicaments traces', description: 'Essential medicines availability rates across facilities.', href: '/visualizer' },
      { code: 'STOCK_INVENTORY', name: 'Stock Inventory', nameFr: 'Inventaire du stock', description: 'Medstock facility-level inventory and balances.', href: '/medstock' },
      { code: 'STOCKOUT_ALERTS', name: 'Stockout Alerts', nameFr: 'Alertes de rupture', description: 'Sentinel stockout alert engine per tracer item.', href: '/medstock' },
      { code: 'EXPIRY', name: 'Expiry Monitoring', nameFr: 'Surveillance des péremptions', description: 'Batch expiry watch and disposal tracking.', href: '/medstock' },
      { code: 'PROCUREMENT', name: 'Procurement & Consumption', nameFr: 'Achats et consommation', description: 'Pooled procurement (EACPP) and consumption aggregates.', href: '/medstock' },
      { code: 'MED_QUALITY', name: 'Medicine Quality & Minilab', nameFr: 'Qualité et Minilab', description: 'Minilab screening network for substandard medicines.', href: '/quality' },
      { code: 'INNOVATION', name: 'Innovative Products', nameFr: 'Produits innovants', description: 'New product introductions and pilot tracking.', href: '/medstock' }
    ]
  },
  {
    code: 'WORKFORCE',
    name: 'Workforce Data',
    nameFr: 'Données sur le personnel',
    icon: 'graduation',
    href: '/workforce',
    description: 'Trainings held, people trained and workforce metrics (renamed from Human Resources).',
    subs: [
      { code: 'WORKFORCE_OVERVIEW', name: 'Workforce Overview', nameFr: 'Vue d’ensemble', description: 'Aggregated workforce and training metrics across programs.', href: '/workforce' },
      { code: 'TRAININGS', name: 'Trainings Held', nameFr: 'Formations dispensées', description: 'Training sessions by program, priority and country.', href: '/workforce' },
      { code: 'PEOPLE_TRAINED', name: 'People Trained', nameFr: 'Personnes formées', description: 'Health workers trained with gender disaggregation.', href: '/workforce' },
      { code: 'CHAMPIONS', name: 'Champions', nameFr: 'Champions', description: 'Pharmaceutical system champions developed per project.', href: '/workforce' },
      { code: 'LEARNING_PORTAL', name: 'Learning Portal', nameFr: 'Portail de formation', description: 'EPN LMS external learning platform.', href: 'https://training.epnetwork.org/', external: true }
    ]
  },
  {
    code: 'FINANCIAL',
    name: 'Financial Data',
    nameFr: 'Données financières',
    icon: 'wallet',
    href: '/explorer',
    description: 'Funding received, member business activity and ongoing jobs.',
    subs: [
      { code: 'FUNDING_RECEIVED', name: 'Funding Received', nameFr: 'Financements reçus', description: 'All funding by funder, amount, currency and period.', href: '/explorer' },
      { code: 'FUNDING_PROJECT', name: 'Funding by Project', nameFr: 'Financement par projet', description: 'Budgets and disbursements per project.', href: '/explorer' },
      { code: 'BUSINESS_ACTIVITY', name: 'Member Business Activity', nameFr: 'Activité des entreprises membres', description: 'DSO revenues, DRF status and trading activity.', href: '/explorer' },
      { code: 'JOBS', name: 'Jobs & Consultancies', nameFr: 'Emplois et consultations', description: 'Ongoing jobs and consultancies in the network.', href: '/reports' },
      { code: 'BILLING', name: 'Billing & Payments', nameFr: 'Facturation et paiements', description: 'Subscription invoices and payment tracking.', href: '/billing' },
      { code: 'FIN_REPORTS', name: 'Financial Reports', nameFr: 'Rapports financiers', description: 'Donor reports and financial exports.', href: '/reports' }
    ]
  },
  {
    code: 'INSIGHTS',
    name: 'Insights',
    nameFr: 'Analyses',
    icon: 'chart',
    href: '/dashboard',
    description: 'Dashboards, visualizer, maps, reports and stories.',
    subs: [
      { code: 'DASHBOARD', name: 'Network Dashboard', nameFr: 'Tableau de bord réseau', description: 'Aggregated network KPIs and reporting trends.', href: '/dashboard' },
      { code: 'DATA_ENTRY', name: 'Data Entry', nameFr: 'Saisie des données', description: 'DHIS2-style matrix data capture with validation.', href: '/data-entry' },
      { code: 'VISUALIZER', name: 'Visualizer', nameFr: 'Visualisation', description: 'Pivot tables, charts and indicator time series.', href: '/visualizer' },
      { code: 'MAPS', name: 'Thematic Maps', nameFr: 'Cartes thématiques', description: 'Choropleth and facility pinpoint mapping.', href: '/maps' },
      { code: 'REPORTS', name: 'Reports & Exports', nameFr: 'Rapports et exports', description: 'PDF/Excel export pipeline for Secretariat and donors.', href: '/reports' },
      { code: 'STORIES', name: 'Stories & Impact', nameFr: 'Histoires et impact', description: 'Field testimonies and capacity building outcomes.', href: '/stories' },
      { code: 'MAINTENANCE', name: 'Metadata & Maintenance', nameFr: 'Maintenance des métadonnées', description: 'Strategy pillars, programs and metadata configuration.', href: '/maintenance' }
    ]
  }
] as const;

/**
 * Seed-level classification of seeded projects into the 5 official program
 * areas and the 4 health priority areas. Becomes configurable metadata (M1)
 * once programme assignment is editable in /maintenance.
 */
export const PROJECT_PROGRAM_MAP: Record<string, string> = {
  ACCESS_II: 'PROG_2',
  ACCESS_III: 'PROG_2',
  IMPACT: 'PROG_1',
  MNCH_FBO: 'PROG_2',
  MINILAB_NET: 'PROG_3',
  SAFER: 'PROG_2'
};

export const PROJECT_PRIORITY_MAP: Record<string, string | undefined> = {
  ACCESS_II: undefined,
  ACCESS_III: undefined,
  IMPACT: undefined,
  MNCH_FBO: 'MNCH_RH',
  MINILAB_NET: 'IPC_AMR',
  SAFER: 'IPC_AMR'
};
