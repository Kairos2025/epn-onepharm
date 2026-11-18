import type { MembershipDashboardData, MemberRecordDetail, MembershipRegionFilter } from '@epn/domain';

export const SEED_MEMBER_RECORDS: MemberRecordDetail[] = [
  {
    id: 'mem_ceca20',
    code: 'C20',
    name: 'CECA 20 — Communauté Evangélique au Centre de l’Afrique',
    category: 'CHA',
    votingStatus: 'ORDINARY',
    country: 'DR Congo',
    city: 'Bunia',
    language: 'FR',
    region: 'CENTRAL',
    facilitiesCount: 93,
    approvedDate: 'December 2025',
    isNew2026: true,
    completenessPct: 78,
    missingFields: [
      'Finance contact phone',
      'Pharmacy staff number',
      'Contacts not confirmed in 12 months'
    ],
    invoice2027: {
      status: 'PENDING',
      amountUsd: 350
    },
    contacts: {
      primaryEmail: 'coordination@ceca20-sante.org',
      financeEmail: '',
      phone: '+243 81 000 2020',
      referencePeople: [
        { name: 'Dr. Jean-Luc Mugisha', role: 'Health Coordinator (Focal Point)', email: 'coordination@ceca20-sante.org', phone: '+243 81 000 2020' },
        { name: 'Sr. Marie-Claire Kavira', role: 'Chief Pharmacist', email: 'pharmacie@ceca20-sante.org' }
      ],
      lastVerifiedDate: '2025-10-12'
    },
    changeHistory: [
      { date: '18 Nov 2026', note: 'Record opened by Membership Intern' },
      { date: 'Oct 2026', note: 'Welcomed at AGM 2026 as new Ordinary member' },
      { date: 'Dec 2025', note: 'Membership approved by the Board' }
    ]
  },
  {
    id: 'mem_cmmb',
    code: 'CMMB',
    name: 'CMMB — Catholic Medical Mission Board',
    category: 'HSS',
    votingStatus: 'ORDINARY',
    country: 'USA',
    language: 'EN',
    region: 'EAST',
    facilitiesCount: 42,
    approvedDate: 'February 2026',
    isNew2026: true,
    completenessPct: 86,
    missingFields: ['Annual TWG representative designation'],
    invoice2027: {
      status: 'PENDING',
      amountUsd: 500
    },
    contacts: {
      primaryEmail: 'partnerships@cmmb.org',
      financeEmail: 'ap-grants@cmmb.org',
      phone: '+1 212 242 7757',
      referencePeople: [
        { name: 'Dr. Grace Mwangi', role: 'Global Supply Chain Lead (Reference Person)', email: 'gmwangi@cmmb.org' }
      ],
      lastVerifiedDate: '2026-02-15'
    },
    changeHistory: [
      { date: 'Feb 2026', note: 'Membership approved by the Board (HSS Ordinary)' }
    ]
  },
  {
    id: 'mem_chak',
    code: 'CHAK',
    name: 'Christian Health Association of Kenya (CHAK)',
    category: 'CHA',
    votingStatus: 'ORDINARY',
    country: 'Kenya',
    city: 'Nairobi',
    language: 'EN',
    region: 'EAST',
    facilitiesCount: 584,
    approvedDate: 'Founding Member',
    completenessPct: 96,
    missingFields: ['2027 AGM delegate confirmation'],
    invoice2027: {
      status: 'ISSUED',
      invoiceNo: 'INV-2027-001',
      issuedDate: '2026-11-18',
      amountUsd: 750,
      sentToEmail: 'finance@chak.or.ke',
      sentAt: '2026-11-18'
    },
    contacts: {
      primaryEmail: 'secretariat@chak.or.ke',
      financeEmail: 'finance@chak.or.ke',
      phone: '+254 20 444 1920',
      referencePeople: [
        { name: 'Dr. Samuel Mwenda', role: 'General Secretary', email: 'secretariat@chak.or.ke', phone: '+254 20 444 1920' },
        { name: 'Pharm. Lydia Njeri', role: 'Pharmaceutical Systems Focal Point', email: 'pharmacy@chak.or.ke' }
      ],
      lastVerifiedDate: '2026-10-20'
    },
    changeHistory: [
      { date: '18 Nov 2026', note: '2027 draft fee statement prepared' },
      { date: 'Oct 2026', note: 'DPA & KHIS anchor sync confirmed' }
    ]
  }
];

const REGION_SCALE: Record<MembershipRegionFilter, number> = {
  ALL: 1,
  EAST: 0.34,
  WEST: 0.25,
  CENTRAL: 0.23,
  SOUTHERN: 0.18
};

export function buildMembershipDashboard(
  region: MembershipRegionFilter,
  records: MemberRecordDetail[]
): MembershipDashboardData {
  const scale = REGION_SCALE[region] || 1;
  const issuedCount = records.filter(r => r.invoice2027.status !== 'PENDING').length;

  return {
    region,
    summary: {
      totalMembers: region === 'ALL' ? 151 : Math.round(151 * scale),
      newOrdinary2026: '+2 new Ordinary members in 2026 (CECA 20, CMMB)',
      ordinaryVoting: region === 'ALL' ? 76 : Math.round(76 * scale),
      associateNoVote: region === 'ALL' ? 75 : Math.round(75 * scale),
      feesCollected2025Usd: region === 'ALL' ? 3869 : Math.round(3869 * scale),
      feesExpectedUsd: region === 'ALL' ? 33000 : Math.round(33000 * scale),
      feesCollected2025Pct: 12,
      membersPaid2025: region === 'ALL' ? 14 : Math.max(1, Math.round(14 * scale)),
      membersPaid2024: region === 'ALL' ? 39 : Math.max(2, Math.round(39 * scale)),
      financeContactOnFile: region === 'ALL' ? 53 : Math.round(53 * scale),
      financeContactPct: 35
    },
    categories: [
      { code: 'CHA', name: 'Christian Health Associations (CHA)', ordinary: 36, associate: 0, total: 36, sharePct: 24, paid2024: 14, paid2025: 5 },
      { code: 'HSS', name: 'Health System Strengthening Orgs (HSS)', ordinary: 10, associate: 16, total: 26, sharePct: 17, paid2024: 8, paid2025: 1 },
      { code: 'DSO', name: 'Drug Supply Organizations (DSO)', ordinary: 15, associate: 4, total: 19, sharePct: 13, paid2024: 7, paid2025: 3 },
      { code: 'CHI', name: 'Church Health Institutions (CHI)', ordinary: 15, associate: 4, total: 19, sharePct: 13, paid2024: 1, paid2025: 0 },
      { code: 'INDIVIDUAL', name: 'Individuals', ordinary: 0, associate: 51, total: 51, sharePct: 34, paid2024: 2, paid2025: 1 }
    ],
    yearlyPayments: [
      { year: 2019, isForumYear: false, membersPaid: 58, amountUsd: 14700 },
      { year: 2020, isForumYear: false, membersPaid: 46, amountUsd: 11700 },
      { year: 2021, isForumYear: false, membersPaid: 38, amountUsd: 10600 },
      { year: 2022, isForumYear: true, membersPaid: 40, amountUsd: 13000 },
      { year: 2023, isForumYear: false, membersPaid: 44, amountUsd: 11800 },
      { year: 2024, isForumYear: true, membersPaid: 39, amountUsd: 12500 },
      { year: 2025, isForumYear: false, membersPaid: 14, amountUsd: 3800 }
    ],
    feeCycle2027: {
      invoiceIssued: issuedCount,
      submitted: records.filter(r => ['SUBMITTED', 'ACKNOWLEDGED', 'PAID'].includes(r.invoice2027.status)).length,
      acknowledged: records.filter(r => ['ACKNOWLEDGED', 'PAID'].includes(r.invoice2027.status)).length,
      paymentReceived: records.filter(r => r.invoice2027.status === 'PAID').length,
      goodStandingList: records.filter(r => r.invoice2027.status === 'PAID').length
    },
    invoiceAging: [
      { label: '0–30 days', count: 13, tone: 'sky' },
      { label: '31–60 days', count: 12, tone: 'amber' },
      { label: '61–90 days', count: 10, tone: 'orange' },
      { label: '90+ days', count: 16, tone: 'rose' }
    ],
    sizeBands: [
      { band: 'Single', range: '1 facility', count: 27, sharePct: 18 },
      { band: 'Small', range: '2–10 facilities', count: 41, sharePct: 28 },
      { band: 'Medium', range: '11–50 facilities', count: 41, sharePct: 28 },
      { band: 'Large', range: '51–200 facilities', count: 25, sharePct: 17 },
      { band: 'Network', range: '201+ facilities', count: 15, sharePct: 10 }
    ],
    contactsOnFile: [
      { field: 'Email address', pct: 83, count: 126 },
      { field: 'Contact person', pct: 78, count: 118 },
      { field: 'Telephone', pct: 73, count: 110 },
      { field: 'Communications contact', pct: 38, count: 58 },
      { field: 'Finance contact', pct: 35, count: 53 }
    ],
    cleanUpQueue: [
      { label: 'Records with no category (CHA, DSO, CHI, HSS, Individual)', count: 15 },
      { label: 'Records with no country', count: 24 },
      { label: 'Records with no working language', count: 18 },
      { label: 'CHAs: 30 in tracker vs 36 in AGM 2026 list', count: 6 }
    ],
    countriesTop12: [
      { country: 'Kenya', count: 13 },
      { country: 'Cameroon', count: 13 },
      { country: 'DR Congo', count: 11 },
      { country: 'Nigeria', count: 9 },
      { country: 'Germany', count: 9 },
      { country: 'Tanzania', count: 7 },
      { country: 'Uganda', count: 7 },
      { country: 'Ghana', count: 6 },
      { country: 'Chad', count: 5 },
      { country: 'USA', count: 5 },
      { country: 'India', count: 4 },
      { country: 'Togo', count: 3 }
    ],
    languages: [
      { label: 'English', count: 92, color: 'bg-cyan-700' },
      { label: 'Français', count: 35, color: 'bg-sky-500' },
      { label: 'Bilingual', count: 5, color: 'bg-emerald-600' },
      { label: 'Spanish', count: 1, color: 'bg-amber-500' },
      { label: 'Not recorded', count: 18, color: 'bg-slate-300' }
    ],
    feeCalendar2027: [
      { when: 'Nov–Dec 2026', action: 'Clean the database for all 151 members; map 2026 benefits received', owner: 'Intern, Officer', output: 'Verified database and benefit list' },
      { when: 'Early Jan 2027', action: 'Fee letter signed by ED, sent with Value Proposition, benefit statement & invoice', owner: 'ED, Intern, Finance', output: 'Invoices sent to all members' },
      { when: 'Feb 2027', action: 'First reminder (30 days); first monthly dashboard', owner: 'Intern', output: 'Reminder log; dashboard' },
      { when: 'Mar 2027', action: 'Second reminder (60 days); quarterly member call', owner: 'Intern, Officer', output: 'Call held; arrears list updated' },
      { when: 'Apr 2027', action: 'Letter or call from ED to members over 90 days in arrears', owner: 'ED, Intern', output: 'Escalation done' },
      { when: 'May–Jun 2027', action: 'Follow-up calls by region; agree instalment plans where needed', owner: 'Intern', output: 'Payment plans agreed' },
      { when: 'Jul 2027', action: 'Mid-year review; publish members in good standing in NetLink', owner: 'Officer, Intern', output: 'Mid-year report to ED' },
      { when: 'Aug–Sep 2027', action: 'Member satisfaction survey; quarterly member call', owner: 'Intern, Officer', output: 'Survey results' },
      { when: 'Before AGM', action: 'Final notice linking fees to voting rights; good-standing list', owner: 'ED, Intern', output: 'AGM voting list' },
      { when: 'Oct–Nov 2027', action: 'Member award nominations; prepare 2028 fee letters', owner: 'Officer, Intern', output: 'Award shortlist; 2028 letters ready' },
      { when: 'Dec 2027', action: 'Year-end reconciliation with Finance; annual membership report', owner: 'Intern, Finance, Officer', output: 'Report to ED and Board' }
    ],
    roleMatrix: [
      {
        role: 'Executive Director',
        membership: 'Signs annual fee letter; writes/calls members >90 days in arrears; reports good standing to Board & AGM',
        communications: 'Spokesperson; approves key messages',
        ict: 'Sets priorities'
      },
      {
        role: 'Membership, Comms & ICT Officer (Accountable)',
        membership: '25% time: strategy, KPIs, database design; supervises intern; reviews monthly dashboard',
        communications: '40% time: E-Pharmalink, NetLink, webinars, website',
        ict: '35% time: EDMS, network dashboard (Q2 2027), ERP & LMS'
      },
      {
        role: 'Membership Intern (Operational Lead)',
        membership: '80% time: 151-member database, invoicing with Finance, 30/60d reminders, onboarding (<2 wks)',
        communications: '20% time: member stories for NetLink & social media',
        ict: 'Data entry in membership database'
      },
      {
        role: 'Finance and Grants Officer',
        membership: 'Issues invoices, records bank/mobile-money payments, reconciles monthly with intern',
        communications: '—',
        ict: '—'
      }
    ],
    records
  };
}
