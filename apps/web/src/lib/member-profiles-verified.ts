export interface VerifiedMemberWebProfile {
  logo?: string;
  website?: string;
  publicEmail?: string;
  tagline?: string;
  overview: string;
  scrapedFromOfficialSite?: boolean;
}

/**
 * Verified public organization profiles & official logos scraped directly from
 * EPN member association websites (Nov 2026) and epnetwork.org.
 */
export const VERIFIED_MEMBER_PROFILES: Record<string, VerifiedMemberWebProfile> = {
  CHAK: {
    website: 'https://www.chak.or.ke/',
    publicEmail: 'secretariat@chak.or.ke',
    tagline: 'Promoting Access to Quality Health Care in Kenya',
    overview:
      'Christian Health Association of Kenya (CHAK) is a national faith-based health network of Protestant churches health facilities and programmes across Kenya, working with MEDS and EPN on Drug Revolving Funds (DRF), essential medicine availability, and supply chain strengthening.'
  },
  MEDS: {
    website: 'https://meds.or.ke/',
    publicEmail: 'sahara@meds.or.ke',
    tagline: 'Mission for Essential Drugs and Supplies (Kenya)',
    overview:
      'MEDS is a Christian, not-for-profit Drug Supply Organization (DSO) based in Nairobi providing reliable, quality-assured medicines, medical supplies, WHO-prequalified quality control laboratory testing, and capacity building across Kenya and the East/Central Africa region.',
    scrapedFromOfficialSite: true
  },
  CSSC: {
    logo: '/members/cssc.png',
    website: 'https://www.cssc.or.tz/',
    publicEmail: 'contact@cssc.or.tz',
    tagline: 'Joining Hands for Social Development (Tanzania)',
    overview:
      'The Christian Social Services Commission (CSSC) is an ecumenical body jointly established by the Tanzania Episcopal Conference (TEC) and the Christian Council of Tanzania (CCT) to coordinate and strengthen church-owned health and education services nationwide.',
    scrapedFromOfficialSite: true
  },
  BUFMAR: {
    logo: '/members/bufmar.svg',
    website: 'https://www.bufmar.rw/',
    publicEmail: 'info@bufmar.rw',
    tagline: 'For Better Health (Rwanda)',
    overview:
      'Le Bureau des Formations Médicales Agréées du Rwanda (BUFMAR) is Rwanda’s faith-based Drug Supply Organization coordinating procurement, warehousing, quality assurance, and distribution of essential medicines and medical equipment to church-affiliated health facilities.',
    scrapedFromOfficialSite: true
  },
  CBCHS: {
    logo: '/members/cbchs.png',
    website: 'https://cbchealthservices.org/',
    publicEmail: 'info@cbchealthservices.org',
    tagline: 'Quality Healthcare to All (Cameroon)',
    overview:
      'Cameroon Baptist Convention Health Services (CBCHS) operates a major network of hospitals, integrated health centers, central pharmacy supply, and a GPHF Minilab post-marketing quality control laboratory safeguarding medicine quality across Cameroon.',
    scrapedFromOfficialSite: true
  },
  UCMB: {
    logo: '/members/ucmb.jpg',
    website: 'https://ucmb.co.ug/',
    publicEmail: 'admin@ucmb.co.ug',
    tagline: 'Uganda Catholic Medical Bureau',
    overview:
      'Uganda Catholic Medical Bureau (UCMB) is the technical arm of the Uganda Episcopal Conference coordinating Catholic health facilities, hospitals, and training institutions across Uganda in partnership with JMS and EPN.',
    scrapedFromOfficialSite: true
  },
  UPMB: {
    website: 'https://upmb.co.ug/',
    publicEmail: 'info@upmb.co.ug',
    tagline: 'Uganda Protestant Medical Bureau',
    overview:
      'Uganda Protestant Medical Bureau (UPMB) is a national faith-based umbrella organization coordinating Protestant church-owned hospitals and health centers across Uganda to strengthen clinical governance and essential medicine access.'
  },
  JMS: {
    logo: '/members/jms.webp',
    website: 'https://jms.co.ug/',
    publicEmail: 'sales@jms.co.ug',
    tagline: 'Saving Lives Diligently (Uganda)',
    overview:
      'Joint Medical Store (JMS) is a church-founded, not-for-profit Drug Supply Organization in Uganda partnering with over 3,000 health facilities to provide quality-assured essential medicines, health commodities, and digital supply chain solutions.',
    scrapedFromOfficialSite: true
  },
  CHAM: {
    logo: '/members/cham.png',
    website: 'https://cham.org.mw/',
    publicEmail: 'info@cham.org.mw',
    tagline: 'Christian Health Association of Malawi',
    overview:
      'Christian Health Association of Malawi (CHAM) strengthens health service delivery through its national network of church-owned member hospitals, health centers, training colleges, and Ministry of Health Service Level Agreements.',
    scrapedFromOfficialSite: true
  },
  CHAG: {
    logo: '/members/chag.png',
    website: 'https://chag.org.gh/',
    publicEmail: 'info@chag.org.gh',
    tagline: 'Christian Health Association of Ghana',
    overview:
      'Churches Health Association of Ghana (CHAG) is a network of church-related health institutions and training colleges providing a major share of rural and underserved healthcare delivery and pharmaceutical services across Ghana.',
    scrapedFromOfficialSite: true
  },
  CHAZ: {
    logo: '/members/chaz.png',
    website: 'https://www.chaz.org.zm/',
    publicEmail: 'info@chaz.org.zm',
    tagline: 'Churches Health Association of Zambia',
    overview:
      'Churches Health Association of Zambia (CHAZ) is a leading faith-based umbrella organization coordinating church hospitals, rural health centers, and national supply chain / pooled procurement programmes across Zambia.',
    scrapedFromOfficialSite: true
  },
  ZACH: {
    logo: '/members/zach.png',
    website: 'https://www.zach.org.zw/',
    publicEmail: 'info@zach.org.zw',
    tagline: 'Zimbabwe Association of Church-related Hospitals',
    overview:
      'Zimbabwe Association of Church-related Hospitals (ZACH) supports mission hospitals and clinics across Zimbabwe with quality healthcare delivery, essential medicine supply coordination, and health worker capacity building.',
    scrapedFromOfficialSite: true
  },
  'CHAL-LS': {
    logo: '/members/chal-ls.png',
    website: 'https://www.chal.org.ls/',
    publicEmail: 'ed@chal.org.ls',
    tagline: 'Christian Health Association of Lesotho',
    overview:
      'Christian Health Association of Lesotho (CHAL) coordinates church-owned hospitals and health centers across Lesotho, delivering primary and secondary health services and pharmaceutical care in partnership with the Ministry of Health.',
    scrapedFromOfficialSite: true
  },
  CMMB: {
    logo: '/members/cmmb.png',
    website: 'https://cmmb.org/',
    publicEmail: 'info@cmmb.org',
    tagline: 'Healthier Lives Worldwide (International)',
    overview:
      'Catholic Medical Mission Board (CMMB) is a global faith-based health systems strengthening organization delivering medical donations, maternal and child health programmes, and pharmaceutical supply chain support worldwide.',
    scrapedFromOfficialSite: true
  }
};
