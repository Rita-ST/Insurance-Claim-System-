"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const uuid_1 = require("uuid");
const eventEngine_1 = require("./events/eventEngine");
const jsonDb_1 = require("./storage/jsonDb");
const types_1 = require("./events/types");
const app = (0, express_1.default)();
app.use((0, cors_1.default)());
app.use(express_1.default.json());
// Retrieve current state (claims, eventLog, notifications)
app.get('/api/state', (_req, res) => {
    res.json((0, jsonDb_1.readDb)());
});
// Submit a new claim (Event Producer)
app.post('/api/claims', (req, res) => {
    const { customerName, customerEmail, policyNumber, vehicleReg, accidentDate, description, estimatedAmount, documentName } = req.body;
    if (!customerName || !policyNumber || !estimatedAmount) {
        return res.status(400).json({ error: 'Missing required claim fields.' });
    }
    const db = (0, jsonDb_1.readDb)();
    const newClaim = {
        id: `CLM-${(0, uuid_1.v4)().slice(0, 6).toUpperCase()}`,
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
    (0, jsonDb_1.writeDb)(db);
    eventEngine_1.dispatcher.publish('claim_submitted', {
        claimId: newClaim.id,
        policyNumber: newClaim.policyNumber,
        estimatedAmount: newClaim.estimatedAmount,
        description: newClaim.description,
    });
    if (documentName) {
        eventEngine_1.dispatcher.publish('document_uploaded', { claimId: newClaim.id, fileName: documentName });
    }
    res.status(201).json((0, jsonDb_1.readDb)());
});
// Assign an adjuster (Event Producer)
app.post('/api/claims/:id/assign', (req, res) => {
    eventEngine_1.dispatcher.publish('adjuster_assigned', { claimId: req.params.id, adjusterName: req.body.adjusterName });
    res.json((0, jsonDb_1.readDb)());
});
// Approve or Reject claim (Event Producer)
app.post('/api/claims/:id/decision', (req, res) => {
    const { decision } = req.body;
    if (decision === 'approve') {
        eventEngine_1.dispatcher.publish('claim_approved', { claimId: req.params.id });
    }
    else {
        eventEngine_1.dispatcher.publish('claim_rejected', { claimId: req.params.id });
    }
    res.json((0, jsonDb_1.readDb)());
});
// Process payment (Guarded: Approved claims only)
app.post('/api/claims/:id/pay', (req, res) => {
    const db = (0, jsonDb_1.readDb)();
    const claim = db.claims.find((c) => c.id === req.params.id);
    if (!claim || claim.status !== 'Approved') {
        return res.status(400).json({ error: 'Payment is strictly restricted to Approved claims.' });
    }
    const reference = `PAY-${(0, uuid_1.v4)().slice(0, 8).toUpperCase()}`;
    eventEngine_1.dispatcher.publish('payment_processed', { claimId: claim.id, amount: claim.estimatedAmount, reference });
    res.json((0, jsonDb_1.readDb)());
});
const PORT = 4000;
app.listen(PORT, () => console.log(`InsureFlow EDP Backend running on http://localhost:${PORT}`));
//# sourceMappingURL=server.js.map