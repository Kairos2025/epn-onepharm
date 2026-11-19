process.env.NODE_ENV = 'test';
import { describe, it } from 'node:test';
import assert from 'node:assert';
import app from './index.js';

describe('EPN One Network End-to-End API Workflows', () => {
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
    assert.strictEqual(data.network.totalMembers, 151);
    assert.strictEqual(data.network.totalCountries, 37);
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
      period_iso: '209912',
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

  it('GET /surveillance/summary returns CDC-style control summary and alerts', async () => {
    const res = await fetch(`${baseUrl}/surveillance/summary`);
    assert.strictEqual(res.status, 200);
    const data = await res.json();
    assert.ok(data.epiWeek);
    assert.ok(Array.isArray(data.alerts) && data.alerts.length >= 5);
    assert.ok(Array.isArray(data.countryScorecards) && data.countryScorecards.length >= 8);
  });

  it('POST /surveillance/alerts/:id/acknowledge updates alert status', async () => {
    const res = await fetch(`${baseUrl}/surveillance/alerts/alt_ceftriaxone_ke/acknowledge`, {
      method: 'POST',
      headers: { 'x-epn-role': 'DOCTOR', 'x-epn-actor': 'dr_mwangi' }
    });
    assert.strictEqual(res.status, 200);
    const alert = await res.json();
    assert.strictEqual(alert.status, 'ACKNOWLEDGED');
  });

  it('RBAC rejects PUBLIC_VIEWER mutations and logs audit trail', async () => {
    const forbidden = await fetch(`${baseUrl}/surveillance/alerts/alt_ceftriaxone_ke/resolve`, {
      method: 'POST',
      headers: { 'x-epn-role': 'PUBLIC_VIEWER' }
    });
    assert.strictEqual(forbidden.status, 403);

    const auditRes = await fetch(`${baseUrl}/audit`);
    assert.strictEqual(auditRes.status, 200);
    const logs = await auditRes.json();
    assert.ok(Array.isArray(logs) && logs.length > 0);
  });

  it('GET /dhis2/pull executes anchor KHIS mapping and live ingestion', async () => {
    const dryRes = await fetch(`${baseUrl}/dhis2/pull?connectionId=khis_ke&dryRun=true`);
    assert.strictEqual(dryRes.status, 200);
    const dryData = await dryRes.json();
    assert.strictEqual(dryData.recordsMapped, 3);
    assert.strictEqual(dryData.ingestedCount, 0);

    const liveRes = await fetch(`${baseUrl}/dhis2/pull?connectionId=khis_ke&dryRun=false`);
    assert.strictEqual(liveRes.status, 200);
    const liveData = await liveRes.json();
    assert.strictEqual(liveData.ingestedCount, 3);
    assert.strictEqual(liveData.provenance, 'DHIS2_LIVE_SYNC');
  });

  it('POST /governance/sharing/:memberCode enforces member sovereignty', async () => {
    const res = await fetch(`${baseUrl}/governance/sharing/CHASS`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-epn-role': 'EPN_COORDINATOR' },
      body: JSON.stringify({ shareFacilityAlerts: false })
    });
    assert.strictEqual(res.status, 200);
    const updated = await res.json();
    assert.strictEqual(updated.shareFacilityAlerts, false);
  });

  it('GET /jurisdictions returns jurisdiction-partitioned residency summaries', async () => {
    const res = await fetch(`${baseUrl}/jurisdictions`);
    assert.strictEqual(res.status, 200);
    const list = await res.json();
    assert.ok(Array.isArray(list) && list.length >= 8);
    const ke = list.find((j: any) => j.country === 'KE');
    assert.strictEqual(ke.residencyMode, 'IN_COUNTRY_PARTITION');
  });

  it('GET /membership/dashboard and POST /membership/records/:id/invoice manage 151-member 2027 cycle', async () => {
    const dashRes = await fetch(`${baseUrl}/membership/dashboard?region=ALL`);
    assert.strictEqual(dashRes.status, 200);
    const dash = await dashRes.json();
    assert.strictEqual(dash.summary.totalMembers, 151);
    assert.strictEqual(dash.summary.ordinaryVoting, 76);

    const invRes = await fetch(`${baseUrl}/membership/records/mem_ceca20/invoice`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-epn-role': 'EPN_COORDINATOR' },
      body: JSON.stringify({
        invoiceNo: 'INV-2027-014',
        issuedDate: '2027-01-05',
        status: 'ISSUED',
        sentToEmail: 'finance@ceca20-sante.org'
      })
    });
    assert.strictEqual(invRes.status, 200);
    const rec = await invRes.json();
    assert.strictEqual(rec.invoice2027.status, 'ISSUED');
    assert.strictEqual(rec.invoice2027.invoiceNo, 'INV-2027-014');
    assert.strictEqual(rec.invoice2027.sentToEmail, 'finance@ceca20-sante.org');

    const contactRes = await fetch(`${baseUrl}/membership/records/mem_ceca20/contacts`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', 'x-epn-role': 'EPN_COORDINATOR' },
      body: JSON.stringify({
        primaryEmail: 'coordination@ceca20-sante.org',
        financeEmail: 'finance@ceca20-sante.org',
        referencePeople: [{ name: 'Dr. Jean-Luc Mugisha', role: 'Focal Point', email: 'coordination@ceca20-sante.org' }]
      })
    });
    assert.strictEqual(contactRes.status, 200);
    const updatedContactRec = await contactRes.json();
    assert.strictEqual(updatedContactRec.contacts.financeEmail, 'finance@ceca20-sante.org');

    const remindRes = await fetch(`${baseUrl}/membership/records/mem_ceca20/remind`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-epn-role': 'EPN_COORDINATOR' },
      body: JSON.stringify({
        toEmail: 'coordination@ceca20-sante.org',
        subject: 'Annual Contact Update Reminder',
        message: 'Please confirm your reference people.'
      })
    });
    assert.strictEqual(remindRes.status, 200);
    const remindedRec = await remindRes.json();
    assert.ok(remindedRec.contacts.lastReminderSentDate);

    const calRes = await fetch(`${baseUrl}/membership/calendar/activate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-epn-role': 'EPN_COORDINATOR' },
      body: JSON.stringify({
        when: 'Nov–Dec 2026',
        message: 'Clean database and verify 151 member contacts'
      })
    });
    assert.strictEqual(calRes.status, 200);
    const calJson = await calRes.json();
    assert.strictEqual(calJson.when, 'Nov–Dec 2026');
    assert.ok(calJson.remindersDispatched >= 1);

    const importRes = await fetch(`${baseUrl}/membership/import`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-epn-role': 'EPN_COORDINATOR' },
      body: JSON.stringify({
        sourceFile: 'associations.csv',
        rows: [
          {
            code: 'CHAZ',
            name: 'Churches Health Association of Zambia (CHAZ)',
            category: 'CHA',
            votingStatus: 'ORDINARY',
            country: 'Zambia',
            primaryEmail: 'info@chaz.org.zm',
            financeEmail: 'finance@chaz.org.zm',
            referencePerson: 'Karen Sichinga'
          }
        ]
      })
    });
    assert.strictEqual(importRes.status, 200);
    const importJson = await importRes.json();
    assert.strictEqual(importJson.created, 1);
  });

  it('closes test server', async () => {
    await new Promise<void>(resolve => {
      server.close(() => resolve());
    });
  });
});
