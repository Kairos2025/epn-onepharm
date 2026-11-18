import {
  Member,
  OrgUnit,
  FacilityProfile,
  Project,
  Funder,
  Indicator,
  DataElement,
  DataValue,
  StockItem,
  StockTransaction,
  Story,
  SurveillanceAlert,
  SurveillanceSummary,
  MpesaStkPushResponse,
  AuditLogEntry,
  MemberSharingPolicy,
  Dhis2PullResult,
  EpnActorRole,
  JurisdictionPartitionSummary,
  MembershipDashboardData,
  MembershipRegionFilter,
  MemberRecordDetail
} from '@epn/domain';

export interface SdkOptions {
  baseUrl: string;
  token?: string;
  role?: EpnActorRole;
  actorId?: string;
}

export class EpnClient {
  private baseUrl: string;
  private token?: string;
  private role: EpnActorRole;
  private actorId: string;

  constructor(options: SdkOptions) {
    this.baseUrl = options.baseUrl.replace(/\/$/, '');
    this.token = options.token;
    this.role = options.role || 'EPN_COORDINATOR';
    this.actorId = options.actorId || 'web_operator';
  }

  public setRole(role: EpnActorRole) {
    this.role = role;
  }

  private async request<T>(path: string, options: RequestInit = {}): Promise<T> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      'x-epn-role': this.role,
      'x-epn-actor': this.actorId,
      ...((options.headers as any) || {})
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    const res = await fetch(`${this.baseUrl}${path}`, {
      ...options,
      headers
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({ message: res.statusText }));
      throw new Error(err.message || `HTTP ${res.status}`);
    }

    return res.json();
  }

  // Public
  async getPublicSummary() {
    return this.request<any>('/public/summary');
  }

  // Members
  async getMembers() {
    return this.request<Member[]>('/members');
  }

  async getMember(id: string) {
    return this.request<Member>(`/members/${id}`);
  }

  // Org Units & Facilities
  async getOrgUnits(level?: number, parentId?: string) {
    const query = new URLSearchParams();
    if (level) query.append('level', String(level));
    if (parentId) query.append('parentId', parentId);
    return this.request<OrgUnit[]>(`/organisationUnits?${query.toString()}`);
  }

  async getFacilities() {
    return this.request<Array<OrgUnit & { profile?: FacilityProfile }>>('/facilities');
  }

  async getFacility(id: string) {
    return this.request<OrgUnit & { profile?: FacilityProfile; stockSummary?: any }>(`/facilities/${id}`);
  }

  // Projects & Funders
  async getProjects() {
    return this.request<Project[]>('/projects');
  }

  async getFunders() {
    return this.request<Funder[]>('/funders');
  }

  // Metadata
  async getIndicators() {
    return this.request<Indicator[]>('/indicators');
  }

  async getDataElements() {
    return this.request<DataElement[]>('/dataElements');
  }

  // Data Values & Analytics
  async getDataValues(ou?: string, pe?: string) {
    const query = new URLSearchParams();
    if (ou) query.append('ou', ou);
    if (pe) query.append('pe', pe);
    return this.request<DataValue[]>(`/dataValues?${query.toString()}`);
  }

  async saveDataValue(payload: Partial<DataValue>) {
    return this.request<DataValue>('/dataValues', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  }

  async getAnalytics(dx: string[], pe: string[], ou: string[]) {
    const query = new URLSearchParams();
    query.append('dimension', `dx:${dx.join(';')}`);
    query.append('dimension', `pe:${pe.join(';')}`);
    query.append('dimension', `ou:${ou.join(';')}`);
    return this.request<any>(`/analytics?${query.toString()}`);
  }

  // Medstock
  async getStockItems() {
    return this.request<StockItem[]>('/stock/items');
  }

  async getStockTransactions(facilityId?: string) {
    const query = facilityId ? `?facilityId=${facilityId}` : '';
    return this.request<StockTransaction[]>(`/stock/transactions${query}`);
  }

  async recordStockTransaction(txn: Partial<StockTransaction>) {
    return this.request<StockTransaction>('/stock/transactions', {
      method: 'POST',
      body: JSON.stringify(txn)
    });
  }

  // Surveillance & CDC-Style Control
  async getSurveillanceSummary() {
    return this.request<SurveillanceSummary>('/surveillance/summary');
  }

  async getSurveillanceAlerts(severity?: string, status?: string) {
    const query = new URLSearchParams();
    if (severity) query.append('severity', severity);
    if (status) query.append('status', status);
    const qs = query.toString();
    return this.request<SurveillanceAlert[]>(`/surveillance/alerts${qs ? `?${qs}` : ''}`);
  }

  async acknowledgeAlert(id: string) {
    return this.request<SurveillanceAlert>(`/surveillance/alerts/${id}/acknowledge`, {
      method: 'POST'
    });
  }

  async resolveAlert(id: string) {
    return this.request<SurveillanceAlert>(`/surveillance/alerts/${id}/resolve`, {
      method: 'POST'
    });
  }

  // Governance, Audit Trail & DHIS2 Inbound Sync
  async getAuditLogs(limit = 50) {
    return this.request<AuditLogEntry[]>(`/audit?limit=${limit}`);
  }

  async getSharingPolicies() {
    return this.request<MemberSharingPolicy[]>('/governance/sharing');
  }

  async updateSharingPolicy(
    memberCode: string,
    patch: Partial<Pick<MemberSharingPolicy, 'shareFacilityAlerts' | 'shareAmrSignals' | 'dpaSigned'>>
  ) {
    return this.request<MemberSharingPolicy>(`/governance/sharing/${memberCode}`, {
      method: 'POST',
      body: JSON.stringify(patch)
    });
  }

  async pullDhis2(connectionId = 'khis_ke', dryRun = true) {
    return this.request<Dhis2PullResult>(
      `/dhis2/pull?connectionId=${encodeURIComponent(connectionId)}&dryRun=${dryRun}`
    );
  }

  async getJurisdictions() {
    return this.request<JurisdictionPartitionSummary[]>('/jurisdictions');
  }

  async getMembershipDashboard(region: MembershipRegionFilter = 'ALL') {
    return this.request<MembershipDashboardData>(`/membership/dashboard?region=${region}`);
  }

  async issueMemberInvoice(
    memberId: string,
    payload: { invoiceNo: string; issuedDate: string; status?: MemberRecordDetail['invoice2027']['status'] }
  ) {
    return this.request<MemberRecordDetail>(`/membership/records/${memberId}/invoice`, {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  }

  // Payments
  async initiateMpesaStkPush(payload: { phone: string; amount: string | number; plan: string }) {
    return this.request<MpesaStkPushResponse>('/payments/mpesa/stkpush', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  }

  // Stories
  async getStories() {
    return this.request<Story[]>('/stories');
  }
}
