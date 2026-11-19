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

export const START_FROM_ENTRY_POINTS = [
  { code: 'MEMBER', name: 'Member', href: '/explorer?tab=DIRECTORY', description: 'Start from a member organization and reach its facilities, projects and funders.' },
  { code: 'FACILITY', name: 'Health Facility', href: '/explorer?tab=FACILITIES', description: 'Start from a facility and reach its member, data and supply indicators.' },
  { code: 'FUNDER', name: 'Funder (Buyer)', href: '/explorer?tab=FUNDERS', description: 'Start from a funder and see all funded projects, amounts and periods.' },
  { code: 'PROJECT', name: 'Project', href: '/explorer?tab=PROJECTS', description: 'Start from a project and see its funder, program and priority area.' }
] as const;

export const WORKSPACE_CATEGORIES: readonly WorkspaceCategory[] = [
  {
    code: 'MEMBERSHIP',
    name: 'Membership',
    nameFr: 'Adhésion',
    icon: 'users',
    href: '/membership',
    description: '151 member associations, voting rights, 2027 fee cycle, contacts, and governance.',
    subs: [
      { code: 'MEMBERSHIP_OVERVIEW', name: 'Overview & 2027 Fees', nameFr: 'Vue d’ensemble & cotisations 2027', description: '151 members, voting rights, fee collection, and 2027 pipeline.', href: '/membership?tab=FEES' },
      { code: 'MEMBERSHIP_REACH', name: 'Reach & Data Quality', nameFr: 'Couverture & qualité des données', description: 'Composition by category, facility size, countries, and clean-up queue.', href: '/membership?tab=REACH' },
      { code: 'MEMBER_RECORDS', name: 'Records, Invoices & Imports', nameFr: 'Dossiers, factures & imports', description: 'Contacts, reference people, reminders, invoices, and CSV/PDF upload.', href: '/membership?tab=RECORD' },
      { code: 'MEMBERSHIP_PLAN', name: '2027 Plan, ToR & JD', nameFr: 'Plan 2027, TdR & Fiche de poste', description: 'Role matrix, Intern ToR, Officer JD, and 2027 Fee Calendar.', href: '/membership?tab=FUNCTION' },
      { code: 'MEMBER_DIRECTORY', name: 'Member Directory (151)', nameFr: 'Annuaire des membres (151)', description: 'Searchable list of member organizations by category and country.', href: '/explorer?tab=DIRECTORY' },
      { code: 'MEMBER_PROFILE', name: 'Member Profiles', nameFr: 'Profils des membres', description: 'Detailed profile, strategic plan alignment, and affiliated FOSAs.', href: '/explorer?tab=MEMBERS' }
    ]
  },
  {
    code: 'PROJECTS',
    name: 'Projects',
    nameFr: 'Projets',
    icon: 'briefcase',
    href: '/programs',
    description: 'The 5 official EPN program areas, active projects, and field impact stories.',
    subs: [
      { code: 'PROGRAM_AREAS', name: '5 Program Areas', nameFr: '5 Domaines de programmes', description: 'Official EPN program areas and health priorities.', href: '/programs' },
      { code: 'PROJECT_REGISTER', name: 'Project Register', nameFr: 'Registre des projets', description: 'Full project list with status, countries, and reach.', href: '/explorer?tab=PROJECTS' },
      { code: 'PROJECT_STORIES', name: 'Impact Stories', nameFr: 'Histoires d’impact', description: 'Verified before/after evidence from church health networks.', href: '/stories' }
    ]
  },
  {
    code: 'FACILITIES',
    name: 'Health Facilities',
    nameFr: 'Établissements de santé',
    icon: 'building',
    href: '/explorer?tab=FACILITIES',
    description: 'FOSAs categorised by Health Association (Levels 1–6), coverage, and facility reporting.',
    subs: [
      { code: 'FACILITY_BY_ASSOC', name: 'FOSAs by Health Association', nameFr: 'FOSA par association de santé', description: 'Facility counts (Levels 1–6), programs, EPN eligibility, and mandate alerts.', href: '/explorer?tab=FACILITIES' },
      { code: 'FACILITY_COVERAGE', name: 'Union Network Coverage', nameFr: 'Couverture réseau (union)', description: 'Country-level coverage without double-counting across members.', href: '/explorer?tab=COVERAGE' },
      { code: 'FACILITY_DATA_ENTRY', name: 'Monthly Data Entry', nameFr: 'Saisie mensuelle des données', description: 'DHIS2-style facility monthly indicator capture and validation.', href: '/data-entry' },
      { code: 'FACILITY_QUALITY', name: 'Data Quality & Audits', nameFr: 'Qualité des données & audits', description: 'Completeness, timeliness, and facility audit matrix.', href: '/quality' }
    ]
  },
  {
    code: 'MEDICINES',
    name: 'Medicines & Supply',
    nameFr: 'Médicaments et approvisionnement',
    icon: 'pill',
    href: '/medstock',
    description: 'Medstock FEFO inventory, tracer availability, and Minilab medicine quality.',
    subs: [
      { code: 'STOCK_INVENTORY', name: 'Medstock & FEFO Ledger', nameFr: 'Inventaire Medstock & FEFO', description: 'Stock on hand, stock-outs, near-expiry batches, and transactions.', href: '/medstock' },
      { code: 'TRACER_AVAIL', name: 'Tracer Availability Trends', nameFr: 'Disponibilité des médicaments traces', description: 'Essential medicines availability charts across countries.', href: '/visualizer' },
      { code: 'MED_QUALITY', name: 'Quality, AMR & Minilab', nameFr: 'Qualité, RAM & Minilab', description: 'Minilab screening and WHO AWaRe antimicrobial stewardship.', href: '/quality' }
    ]
  },
  {
    code: 'WORKFORCE',
    name: 'Workforce Data',
    nameFr: 'Données sur le personnel',
    icon: 'graduation',
    href: '/workforce',
    description: 'Trainings held, health workers trained, champions, and EPN Learning Portal.',
    subs: [
      { code: 'WORKFORCE_TRAININGS', name: 'Trainings & Champions', nameFr: 'Formations & champions', description: 'Training sessions by project and people trained by country.', href: '/workforce' },
      { code: 'LEARNING_PORTAL', name: 'Learning Portal (LMS)', nameFr: 'Portail de formation (LMS)', description: 'External EPN LMS training platform.', href: 'https://training.epnetwork.org/', external: true }
    ]
  },
  {
    code: 'FINANCIAL',
    name: 'Financial Data',
    nameFr: 'Données financières',
    icon: 'wallet',
    href: '/licensing',
    description: 'Donor partnerships, grant funders, membership fee collection, and donor reports.',
    subs: [
      { code: 'DONOR_PARTNERSHIPS', name: 'Donors, Grants & DPAs', nameFr: 'Bailleurs, dons & DPA', description: 'Donor channels (M-Pesa, NCBA, Action Medeor) and institutional DPAs.', href: '/licensing' },
      { code: 'FUNDERS_REGISTER', name: 'Funders & Buyers', nameFr: 'Bailleurs de fonds', description: 'Global funding partners and co-financed projects.', href: '/explorer?tab=FUNDERS' },
      { code: 'FIN_REPORTS', name: 'Donor & Financial Reports', nameFr: 'Rapports bailleurs & financiers', description: 'Scorecards, donor project packs, and AGM data exports.', href: '/reports' }
    ]
  },
  {
    code: 'INSIGHTS',
    name: 'Insights',
    nameFr: 'Analyses',
    icon: 'chart',
    href: '/dashboard',
    description: 'Surveillance control center, thematic GIS map, visualizer, and strategic metadata.',
    subs: [
      { code: 'DASHBOARD', name: 'Control Center', nameFr: 'Centre de contrôle', description: 'Sentinel alerts, country scorecard, trends, and governance audit.', href: '/dashboard' },
      { code: 'MAPS', name: 'Thematic GIS Map', nameFr: 'Carte SIG thématique', description: 'African regional presence, FBO coverage, and stock status map.', href: '/maps' },
      { code: 'VISUALIZER', name: 'Analytical Visualizer', nameFr: 'Visualisation analytique', description: 'Pivot tables, charts, and indicator time series.', href: '/visualizer' },
      { code: 'MAINTENANCE', name: 'Strategic Plan & Metadata', nameFr: 'Plan stratégique & métadonnées', description: '2026–2030 strategic pillars and configurable platform metadata.', href: '/maintenance' }
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
