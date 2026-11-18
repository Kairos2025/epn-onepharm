import { NextRequest, NextResponse } from 'next/server';
import { db, executeDhis2Pull } from '@epn/db';
import { ACCESS_TIERS, DataValueWriteSchema, EpnActorRole, StockTransactionSchema } from '@epn/domain';

export const dynamic = 'force-dynamic';

type RouteContext = { params: Promise<{ path: string[] }> };

export async function GET(req: NextRequest, context: RouteContext) {
  const { path } = await context.params;
  const route = '/' + path.join('/');
  const sp = req.nextUrl.searchParams;

  if (route === '/health') {
    return NextResponse.json({
      status: 'HEALTHY',
      service: 'EPN One Network API (Next.js Edge/Node Bridge)',
      version: '1.0.0',
      timestamp: new Date().toISOString()
    });
  }

  if (route === '/public/summary') {
    return NextResponse.json(db.getPublicSummary());
  }

  if (route === '/public/map') {
    const facilities = db.getFacilities();
    const countries = db.getOrgUnits(2);
    return NextResponse.json({
      countries: countries.map(c => ({
        code: c.country,
        name: c.name,
        latitude: c.latitude,
        longitude: c.longitude
      })),
      facilities: facilities.map(f => ({
        id: f.id,
        name: f.name,
        country: f.country,
        level: f.profile?.facility_level,
        status: f.profile?.epn_support_status,
        latitude: f.latitude,
        longitude: f.longitude
      }))
    });
  }

  if (route === '/surveillance/summary') {
    return NextResponse.json(db.getSurveillanceSummary());
  }

  if (route === '/surveillance/alerts') {
    const severity = sp.get('severity') || undefined;
    const status = sp.get('status') || undefined;
    return NextResponse.json(db.getSurveillanceAlerts(severity, status));
  }

  if (route === '/members') {
    return NextResponse.json(db.getMembers());
  }

  if (path[0] === 'members' && path[1]) {
    const member = db.getMemberById(path[1]);
    if (!member) return NextResponse.json({ error: 'Member not found' }, { status: 404 });
    const facilities = db.getFacilities().filter(f => f.member_id === member.id);
    return NextResponse.json({ ...member, facilities });
  }

  if (route === '/organisationUnits') {
    const level = sp.get('level') ? parseInt(sp.get('level')!, 10) : undefined;
    const parentId = sp.get('parentId') || undefined;
    return NextResponse.json(db.getOrgUnits(level, parentId));
  }

  if (path[0] === 'organisationUnits' && path[1]) {
    const ou = db.getOrgUnitById(path[1]);
    if (!ou) return NextResponse.json({ error: 'OrgUnit not found' }, { status: 404 });
    return NextResponse.json(ou);
  }

  if (route === '/facilities') {
    return NextResponse.json(db.getFacilities());
  }

  if (path[0] === 'facilities' && path[1]) {
    const fac = db.getFacilityById(path[1]);
    if (!fac) return NextResponse.json({ error: 'Facility not found' }, { status: 404 });
    return NextResponse.json(fac);
  }

  if (route === '/dataElements') {
    return NextResponse.json(db.getDataElements());
  }

  if (route === '/indicators') {
    return NextResponse.json(db.getIndicators());
  }

  if (route === '/projects') {
    return NextResponse.json(db.getProjects());
  }

  if (route === '/funders') {
    return NextResponse.json(db.getFunders());
  }

  if (route === '/dataValues') {
    const ou = sp.get('ou') || undefined;
    const pe = sp.get('pe') || undefined;
    return NextResponse.json(db.getDataValues(ou, pe));
  }

  if (route === '/analytics') {
    let dx = ['indTracerAvail', 'indStockoutRate'];
    let pe = ['202610', '202609', '202608'];
    let ou = ['epnNetwork1'];
    const dims = sp.getAll('dimension');
    dims.forEach(d => {
      const [key, val] = d.split(':');
      if (key === 'dx' && val) dx = val.split(';');
      if (key === 'pe' && val) pe = val.split(';');
      if (key === 'ou' && val) ou = val.split(';');
    });
    return NextResponse.json(db.getAnalytics(dx, pe, ou));
  }

  if (route === '/stock/items') {
    return NextResponse.json(db.getStockItems());
  }

  if (route === '/stock/transactions') {
    const facilityId = sp.get('facilityId') || undefined;
    return NextResponse.json(db.getStockTransactions(facilityId));
  }

  if (route === '/stories') {
    return NextResponse.json(db.getStories());
  }

  if (route === '/plans') {
    return NextResponse.json(ACCESS_TIERS);
  }

  if (route === '/audit') {
    const limit = sp.get('limit') ? parseInt(sp.get('limit')!, 10) : 50;
    return NextResponse.json(db.getAuditLogs(limit));
  }

  if (route === '/governance/sharing') {
    return NextResponse.json(db.getSharingPolicies());
  }

  if (route === '/dhis2/pull') {
    const connectionId = sp.get('connectionId') || 'khis_ke';
    const dryRun = sp.get('dryRun') !== 'false';
    const role = (req.headers.get('x-epn-role') as EpnActorRole) || 'EPN_COORDINATOR';
    const actor = req.headers.get('x-epn-actor') || 'dhis2_scheduler';
    return NextResponse.json(executeDhis2Pull(connectionId, dryRun, actor, role));
  }

  if (route === '/jurisdictions') {
    return NextResponse.json(db.getJurisdictions());
  }

  if (path[0] === 'jurisdictions' && path[1]) {
    const partition = db.getJurisdictionPartition(path[1]);
    if (!partition) return NextResponse.json({ error: 'Jurisdiction not found' }, { status: 404 });
    return NextResponse.json(partition);
  }

  return NextResponse.json({ error: `Not found: ${route}` }, { status: 404 });
}

export async function POST(req: NextRequest, context: RouteContext) {
  const { path } = await context.params;
  const route = '/' + path.join('/');
  const body = await req.json().catch(() => ({}));
  const role = (req.headers.get('x-epn-role') as EpnActorRole) || 'EPN_COORDINATOR';
  const actor = req.headers.get('x-epn-actor') || 'epn_coordinator';

  if (route === '/dataValues') {
    const parseRes = DataValueWriteSchema.safeParse(body);
    if (!parseRes.success) {
      return NextResponse.json(
        { error: 'Invalid data value payload', details: parseRes.error.format() },
        { status: 400 }
      );
    }
    const saved = db.recordDataValue(body);
    return NextResponse.json(saved, { status: 201 });
  }

  if (route === '/stock/transactions') {
    const val = StockTransactionSchema.safeParse(body);
    if (!val.success) {
      return NextResponse.json(
        { error: 'Invalid stock transaction', details: val.error.format() },
        { status: 400 }
      );
    }
    const txn = db.recordStockTransaction({
      id: `txn_${Date.now()}`,
      client_id: body.client_id,
      org_unit_id: body.org_unit_id,
      location_id: body.location_id,
      item_id: body.item_id,
      batch_no: body.batch_no,
      expiry_date: body.expiry_date,
      kind: body.kind,
      qty: body.qty,
      unit_cost: body.unit_cost,
      occurred_at: body.occurred_at,
      recorded_by: body.recorded_by || 'pharmacist',
      reason: body.reason
    });
    return NextResponse.json(txn, { status: 201 });
  }

  if (path[0] === 'surveillance' && path[1] === 'alerts' && path[2] && path[3] === 'acknowledge') {
    if (role === 'PUBLIC_VIEWER') {
      return NextResponse.json({ error: 'Insufficient authority: authenticated role required' }, { status: 403 });
    }
    const updated = db.acknowledgeAlert(path[2], actor, role);
    if (!updated) return NextResponse.json({ error: 'Alert not found' }, { status: 404 });
    return NextResponse.json(updated);
  }

  if (path[0] === 'surveillance' && path[1] === 'alerts' && path[2] && path[3] === 'resolve') {
    if (role === 'PUBLIC_VIEWER') {
      return NextResponse.json({ error: 'Insufficient authority: authenticated role required' }, { status: 403 });
    }
    const updated = db.resolveAlert(path[2], actor, role);
    if (!updated) return NextResponse.json({ error: 'Alert not found' }, { status: 404 });
    return NextResponse.json(updated);
  }

  if (path[0] === 'governance' && path[1] === 'sharing' && path[2]) {
    if (role === 'PUBLIC_VIEWER') {
      return NextResponse.json({ error: 'Insufficient authority: member or coordinator role required' }, { status: 403 });
    }
    const updated = db.updateSharingPolicy(path[2], body, actor, role);
    if (!updated) return NextResponse.json({ error: 'Member sharing policy not found' }, { status: 404 });
    return NextResponse.json(updated);
  }

  if (route === '/payments/mpesa/stkpush') {
    return NextResponse.json({
      status: 'REQUEST_ACCEPTED',
      checkoutRequestId: `ws_CO_${Date.now()}`,
      customerMessage: `STK push prompt sent to ${body.phone || '254700000000'}. Enter PIN on your handset.`
    });
  }

  return NextResponse.json({ error: `Not found: ${route}` }, { status: 404 });
}
