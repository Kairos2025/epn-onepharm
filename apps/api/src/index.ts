import express, { Express } from 'express';
import cors from 'cors';
import { db } from '@epn/db';
import { parsePeriod, generateMonthlyPeriods } from '@epn/periods';
import { ACCESS_TIERS, DataValueWriteSchema, StockTransactionSchema } from '@epn/domain';

const app: Express = express();
const port = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

const apiRouter = express.Router();

// 1. Health check
apiRouter.get('/health', (req, res) => {
  res.json({
    status: 'HEALTHY',
    service: 'EPN OnePharm API',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

// 2. Public endpoints (No auth required)
apiRouter.get('/public/summary', (req, res) => {
  res.json(db.getPublicSummary());
});

apiRouter.get('/public/map', (req, res) => {
  const facilities = db.getFacilities();
  const countries = db.getOrgUnits(2);
  res.json({
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
});

// 3. Members
apiRouter.get('/members', (req, res) => {
  res.json(db.getMembers());
});

apiRouter.get('/members/:id', (req, res) => {
  const member = db.getMemberById(req.params.id);
  if (!member) {
    return res.status(404).json({ error: 'Member not found' });
  }
  const facilities = db.getFacilities().filter(f => f.member_id === member.id);
  res.json({ ...member, facilities });
});

// 4. Organisation Units & Facilities
apiRouter.get('/organisationUnits', (req, res) => {
  const level = req.query.level ? parseInt(String(req.query.level), 10) : undefined;
  const parentId = req.query.parentId ? String(req.query.parentId) : undefined;
  res.json(db.getOrgUnits(level, parentId));
});

apiRouter.get('/organisationUnits/:id', (req, res) => {
  const ou = db.getOrgUnitById(req.params.id);
  if (!ou) return res.status(404).json({ error: 'OrgUnit not found' });
  res.json(ou);
});

apiRouter.get('/facilities', (req, res) => {
  res.json(db.getFacilities());
});

apiRouter.get('/facilities/:id', (req, res) => {
  const fac = db.getFacilityById(req.params.id);
  if (!fac) return res.status(404).json({ error: 'Facility not found' });
  res.json(fac);
});

// 5. Metadata
apiRouter.get('/dataElements', (req, res) => {
  res.json(db.getDataElements());
});

apiRouter.get('/indicators', (req, res) => {
  res.json(db.getIndicators());
});

apiRouter.get('/projects', (req, res) => {
  res.json(db.getProjects());
});

apiRouter.get('/funders', (req, res) => {
  res.json(db.getFunders());
});

// 6. Data Values & Data Sets
apiRouter.get('/dataValues', (req, res) => {
  const ou = req.query.ou ? String(req.query.ou) : undefined;
  const pe = req.query.pe ? String(req.query.pe) : undefined;
  res.json(db.getDataValues(ou, pe));
});

apiRouter.post('/dataValues', (req, res) => {
  try {
    const parseRes = DataValueWriteSchema.safeParse(req.body);
    if (!parseRes.success) {
      return res.status(400).json({ error: 'Invalid data value payload', details: parseRes.error.format() });
    }
    const saved = db.recordDataValue(req.body);
    res.status(201).json(saved);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 7. DHIS2-Compatible Analytics Endpoint
apiRouter.get('/analytics', (req, res) => {
  // Support dimensions format e.g. ?dimension=dx:ind1;ind2&dimension=pe:202610&dimension=ou:ou1
  let dx: string[] = ['indTracerAvail', 'indStockoutRate'];
  let pe: string[] = ['202610', '202609', '202608'];
  let ou: string[] = ['epnNetwork1'];

  const dims = req.query.dimension;
  if (Array.isArray(dims)) {
    dims.forEach(d => {
      const parts = String(d).split(':');
      if (parts[0] === 'dx') dx = parts[1].split(';');
      if (parts[0] === 'pe') pe = parts[1].split(';');
      if (parts[0] === 'ou') ou = parts[1].split(';');
    });
  }

  const result = db.getAnalytics(dx, pe, ou);
  res.json(result);
});

// 8. Graph Circular Navigation (Section 8.7)
apiRouter.get('/graph/navigate', (req, res) => {
  const from = String(req.query.from || '');
  const [kind, id] = from.split(':');

  if (kind === 'funder') {
    const projects = db.getProjects();
    return res.json({ from, related: projects.map(p => ({ kind: 'project', id: p.id, name: p.name })) });
  }
  if (kind === 'member') {
    const member = db.getMemberById(id);
    const facilities = db.getFacilities().filter(f => f.member_id === member?.id);
    return res.json({ from, related: facilities.map(f => ({ kind: 'facility', id: f.id, name: f.name })) });
  }
  res.json({ from, related: [] });
});

// 9. Medstock Stock Management
apiRouter.get('/stock/items', (req, res) => {
  res.json(db.getStockItems());
});

apiRouter.get('/stock/transactions', (req, res) => {
  const facId = req.query.facilityId ? String(req.query.facilityId) : undefined;
  res.json(db.getStockTransactions(facId));
});

apiRouter.post('/stock/transactions', (req, res) => {
  const val = StockTransactionSchema.safeParse(req.body);
  if (!val.success) {
    return res.status(400).json({ error: 'Invalid stock transaction', details: val.error.format() });
  }
  const txn = db.recordStockTransaction({
    id: `txn_${Date.now()}`,
    client_id: req.body.client_id,
    org_unit_id: req.body.org_unit_id,
    location_id: req.body.location_id,
    item_id: req.body.item_id,
    batch_no: req.body.batch_no,
    expiry_date: req.body.expiry_date,
    kind: req.body.kind,
    qty: req.body.qty,
    unit_cost: req.body.unit_cost,
    occurred_at: req.body.occurred_at,
    recorded_by: req.body.recorded_by || 'pharmacist',
    reason: req.body.reason
  });
  res.status(201).json(txn);
});

// 10. Stories
apiRouter.get('/stories', (req, res) => {
  res.json(db.getStories());
});

// 11. Plans & Subscriptions
apiRouter.get('/plans', (req, res) => {
  res.json(ACCESS_TIERS);
});

apiRouter.post('/payments/mpesa/stkpush', (req, res) => {
  const { phone, amount, plan } = req.body;
  res.json({
    status: 'REQUEST_ACCEPTED',
    checkoutRequestId: `ws_CO_${Date.now()}`,
    customerMessage: `STK push prompt sent to ${phone || '254700000000'}. Enter PIN on your handset.`
  });
});

// Mount /api/v1
app.use('/api/v1', apiRouter);

// Export for tests or direct execution
if (process.env.NODE_ENV !== 'test') {
  app.listen(port, () => {
    console.log(`[EPN OnePharm API] Running on http://localhost:${port}/api/v1`);
  });
}

export default app;
