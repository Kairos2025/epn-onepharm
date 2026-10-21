process.env.NODE_ENV = 'test';
import { describe, it } from 'node:test';
import assert from 'node:assert';
import app from './index.js';

describe('EPN OnePharm End-to-End API Workflows', () => {
  let server: any;
  const baseUrl = 'http://localhost:4005/api/v1';

  it('starts the test server', async () => {
    await new Promise<void>(resolve => {
      server = app.listen(4005, () => resolve());
    });
  });

  it('GET /public/summary returns verified network facts', async () => {
    const res = await fetch(`${baseUrl}/public/summary`);
    assert.strictEqual(res.status, 200);
    const data = await res.json();
    assert.strictEqual(data.network.totalMembers, 149);
    assert.strictEqual(data.network.totalCountries, 38);
    assert.strictEqual(data.network.africanCountries, 29);
    assert.strictEqual(data.network.networkFacilities, 25000);
    assert.strictEqual(data.healthPriorities.length, 4);
    assert.strictEqual(data.programmes.length, 5);
  });

  it('GET /members returns all 19 implementing members', async () => {
    const res = await fetch(`${baseUrl}/members`);
    assert.strictEqual(res.status, 200);
    const members = await res.json();
    assert.ok(members.length >= 19);
    const chak = members.find((m: any) => m.abbreviation === 'CHAK');
    assert.ok(chak);
    assert.strictEqual(chak.home_country, 'KE');
  });

  it('GET /facilities/:id returns detailed FOSA profile', async () => {
    const res = await fetch(`${baseUrl}/facilities/fac00000-0000-0000-0000-000000000001`);
    assert.strictEqual(res.status, 200);
    const fac = await res.json();
    assert.strictEqual(fac.name, 'Kilome Mission Hospital');
    assert.strictEqual(fac.profile.facility_level, 'HOSPITAL');
    assert.strictEqual(fac.profile.epn_support_status, 'SUPPORTED');
  });

  it('GET /analytics returns DHIS2-compliant headers, metaData, and rows', async () => {
    const query = 'dimension=dx:indTracerAvail;indStockoutRate&dimension=pe:202610&dimension=ou:epnNetwork1';
    const res = await fetch(`${baseUrl}/analytics?${query}`);
    assert.strictEqual(res.status, 200);
    const data = await res.json();
    assert.ok(Array.isArray(data.headers));
    assert.ok(data.metaData);
    assert.ok(Array.isArray(data.rows));
    assert.strictEqual(data.width, 4);
  });

  it('POST /dataValues validates and records data values', async () => {
    const payload = {
      data_element_id: 'deTracerAvail',
      period_iso: '202611',
      org_unit_id: 'fac00000-0000-0000-0000-000000000001',
      value: '48',
      comment: 'Routine monthly survey'
    };
    const res = await fetch(`${baseUrl}/dataValues`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    assert.strictEqual(res.status, 201);
    const created = await res.json();
    assert.strictEqual(created.value, '48');
    assert.strictEqual(created.version, 1);
  });

  it('POST /stock/transactions records Medstock transactions', async () => {
    const payload = {
      org_unit_id: 'fac00000-0000-0000-0000-000000000001',
      location_id: 'loc_main_pharmacy',
      item_id: 'item1',
      kind: 'RECEIPT',
      qty: 250,
      occurred_at: new Date().toISOString(),
      reason: 'Batch delivery from MEDS'
    };
    const res = await fetch(`${baseUrl}/stock/transactions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    assert.strictEqual(res.status, 201);
    const txn = await res.json();
    assert.strictEqual(txn.qty, 250);
  });

  it('POST /payments/mpesa/stkpush initiates mobile money checkout', async () => {
    const payload = {
      phone: '254712345678',
      amount: 99,
      plan: 'PRO'
    };
    const res = await fetch(`${baseUrl}/payments/mpesa/stkpush`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    assert.strictEqual(res.status, 200);
    const data = await res.json();
    assert.strictEqual(data.status, 'REQUEST_ACCEPTED');
  });

  it('closes test server', async () => {
    await new Promise<void>(resolve => {
      server.close(() => resolve());
    });
  });
});
