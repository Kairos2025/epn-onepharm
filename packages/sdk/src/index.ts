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
  Story
} from '@epn/domain';

export interface SdkOptions {
  baseUrl: string;
  token?: string;
}

export class EpnClient {
  private baseUrl: string;
  private token?: string;

  constructor(options: SdkOptions) {
    this.baseUrl = options.baseUrl.replace(/\/$/, '');
    this.token = options.token;
  }

  private async request<T>(path: string, options: RequestInit = {}): Promise<T> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      Accept: 'application/json',
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

  // Stories
  async getStories() {
    return this.request<Story[]>('/stories');
  }
}
