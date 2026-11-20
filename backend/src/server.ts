import express from 'express';
import cors from 'cors';
import { v4 as uuidv4 } from 'uuid';
import { dispatcher } from './events/eventEngine';
import { readDb, writeDb } from './storage/jsonDb';
import { ClaimRecord } from './events/types';

const app = express();
app.use(cors());
app.use(express.json());

// Retrieve current state (claims, eventLog, notifications)
app.get('/api/state', (_req, res) => {
  res.json(readDb());
});

// Submit a new claim (Event Producer)
app.post('/api/claims', (req, res) => {
  const { customerName, customerEmail, policyNumber, vehicleReg, accidentDate, description, estimatedAmount, documentName } = req.body;
  if (!customerName || !policyNumber || !estimatedAmount) {
    return res.status(400).json({ error: 'Missing required claim fields.' });
  }

  const db = readDb();
  const newClaim: ClaimRecord = {
    id: `CLM-${uuidv4().slice(0, 6).toUpperCase()}`,
    customerName,
    customerEmail,
    policyNumber,
    vehicleReg,
    accidentDate,
    description,
    estimatedAmount: Number(estimatedAmount),
    status: 'Submitted',
    documents: [],
    createdAt: new Date().toISOString(),
  };

  db.claims.unshift(newClaim);
  writeDb(db);

  dispatcher.publish('claim_submitted', {
    claimId: newClaim.id,
    policyNumber: newClaim.policyNumber,
    estimatedAmount: newClaim.estimatedAmount,
    description: newClaim.description,
  });

  if (documentName) {
    dispatcher.publish('document_uploaded', { claimId: newClaim.id, fileName: documentName });
  }

  res.status(201).json(readDb());
});

// Assign an adjuster (Event Producer)
app.post('/api/claims/:id/assign', (req, res) => {
  dispatcher.publish('adjuster_assigned', { claimId: req.params.id, adjusterName: req.body.adjusterName });
  res.json(readDb());
});

// Approve or Reject claim (Event Producer)
app.post('/api/claims/:id/decision', (req, res) => {
  const { decision } = req.body;
  if (decision === 'approve') {
    dispatcher.publish('claim_approved', { claimId: req.params.id });
  } else {
    dispatcher.publish('claim_rejected', { claimId: req.params.id });
  }
  res.json(readDb());
});

// Process payment (Guarded: Approved claims only)
app.post('/api/claims/:id/pay', (req, res) => {
  const db = readDb();
  const claim = db.claims.find((c) => c.id === req.params.id);
  if (!claim || claim.status !== 'Approved') {
    return res.status(400).json({ error: 'Payment is strictly restricted to Approved claims.' });
  }
  const reference = `PAY-${uuidv4().slice(0, 8).toUpperCase()}`;
  dispatcher.publish('payment_processed', { claimId: claim.id, amount: claim.estimatedAmount, reference });
  res.json(readDb());
});

const PORT = 4000;

// Hardware ESP32 Kiosk Producer Endpoint
app.post("/api/kiosk-events", (req, res) => {
  const { kioskId = "branch-desk-01", ticket, requestType, priority = "normal" } = req.body;
  if (!ticket || !requestType) return res.status(400).json({ error: "Missing ticket or requestType" });
  const evt = dispatcher.publish("kiosk.request.created", {
    kioskId,
    ticket,
    requestType,
    priority,
    summary: `[${kioskId}] Ticket ${ticket}: ${requestType.toUpperCase()} (${priority})`
  });
  res.status(202).json({ accepted: true, event: evt });
});

app.listen(PORT, () => console.log(`InsureFlow EDP Backend running on http://localhost:${PORT}`));
