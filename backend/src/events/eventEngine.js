"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.dispatcher = exports.eventQueue = exports.EventDispatcher = exports.EventQueue = void 0;
const uuid_1 = require("uuid");
const types_1 = require("./types");
const jsonDb_1 = require("../storage/jsonDb");
class EventQueue {
    queue = [];
    enqueue(name, payload) {
        const event = {
            id: `EVT-${(0, uuid_1.v4)().slice(0, 8).toUpperCase()}`,
            name,
            timestamp: new Date().toISOString(),
            status: 'queued',
            payload,
        };
        this.queue.push(event);
        return event;
    }
    dequeue() {
        return this.queue.shift();
    }
    size() {
        return this.queue.length;
    }
}
exports.EventQueue = EventQueue;
class EventDispatcher {
    queue;
    handlers = new Map();
    isProcessing = false;
    constructor(queue) {
        this.queue = queue;
    }
    register(eventName, handler) {
        const existing = this.handlers.get(eventName) || [];
        this.handlers.set(eventName, [...existing, handler]);
    }
    publish(name, payload) {
        const event = this.queue.enqueue(name, payload);
        this.processNext();
        return event;
    }
    async processNext() {
        if (this.isProcessing)
            return;
        this.isProcessing = true;
        while (this.queue.size() > 0) {
            const event = this.queue.dequeue();
            if (!event)
                break;
            event.status = 'processing';
            try {
                const eventHandlers = this.handlers.get(event.name) || [];
                for (const handler of eventHandlers) {
                    await handler(event);
                }
                event.status = 'processed';
            }
            catch (err) {
                event.status = 'failed';
                event.error = err.message || 'Unknown handler error';
            }
            const updatedDb = (0, jsonDb_1.readDb)();
            updatedDb.eventLog.unshift(event);
            (0, jsonDb_1.writeDb)(updatedDb);
        }
        this.isProcessing = false;
    }
}
exports.EventDispatcher = EventDispatcher;
exports.eventQueue = new EventQueue();
exports.dispatcher = new EventDispatcher(exports.eventQueue);
// 1. Policy Verification & Risk Screening Handler
exports.dispatcher.register('claim_submitted', (event) => {
    const { claimId, policyNumber, estimatedAmount, description } = event.payload;
    const isValidPolicy = /^POL-\d{4,}$/i.test(policyNumber);
    if (!isValidPolicy) {
        exports.dispatcher.publish('policy_verification_failed', {
            claimId,
            reason: 'Policy format invalid (expected POL-XXXX)',
        });
        return;
    }
    exports.dispatcher.publish('policy_verified', { claimId, policyNumber });
    if (estimatedAmount > 10000 || description.trim().length < 15) {
        exports.dispatcher.publish('claim_flagged', {
            claimId,
            reason: estimatedAmount > 10000 ? 'High claim value (> $10,000)' : 'Incomplete accident description',
        });
    }
});
// 2. Policy Verified Handler
exports.dispatcher.register('policy_verified', (event) => {
    const db = (0, jsonDb_1.readDb)();
    const claim = db.claims.find((c) => c.id === event.payload.claimId);
    if (claim && claim.status === 'Submitted') {
        claim.status = 'Under Review';
        (0, jsonDb_1.writeDb)(db);
        exports.dispatcher.publish('customer_notified', {
            claimId: claim.id,
            email: claim.customerEmail,
            message: `Policy ${claim.policyNumber} verified. Your claim is now Under Review.`,
        });
    }
});
// 3. Policy Verification Failed Handler
exports.dispatcher.register('policy_verification_failed', (event) => {
    const db = (0, jsonDb_1.readDb)();
    const claim = db.claims.find((c) => c.id === event.payload.claimId);
    if (claim) {
        claim.status = 'Rejected';
        claim.flagReason = event.payload.reason;
        (0, jsonDb_1.writeDb)(db);
        exports.dispatcher.publish('customer_notified', {
            claimId: claim.id,
            email: claim.customerEmail,
            message: `Claim rejected: ${event.payload.reason}`,
        });
    }
});
// 4. Risk Flag Handler
exports.dispatcher.register('claim_flagged', (event) => {
    const db = (0, jsonDb_1.readDb)();
    const claim = db.claims.find((c) => c.id === event.payload.claimId);
    if (claim && claim.status !== 'Rejected') {
        claim.status = 'Flagged';
        claim.flagReason = event.payload.reason;
        (0, jsonDb_1.writeDb)(db);
    }
});
// 5. Document Uploaded Handler
exports.dispatcher.register('document_uploaded', (event) => {
    const db = (0, jsonDb_1.readDb)();
    const claim = db.claims.find((c) => c.id === event.payload.claimId);
    if (claim) {
        claim.documents.push({ name: event.payload.fileName, uploadedAt: event.timestamp });
        (0, jsonDb_1.writeDb)(db);
    }
});
// 6. Adjuster Assigned Handler
exports.dispatcher.register('adjuster_assigned', (event) => {
    const db = (0, jsonDb_1.readDb)();
    const claim = db.claims.find((c) => c.id === event.payload.claimId);
    if (claim) {
        claim.assignedAdjuster = event.payload.adjusterName;
        (0, jsonDb_1.writeDb)(db);
        exports.dispatcher.publish('customer_notified', {
            claimId: claim.id,
            email: claim.customerEmail,
            message: `Adjuster ${event.payload.adjusterName} has been assigned to your claim.`,
        });
    }
});
// 7. Claim Approved Handler
exports.dispatcher.register('claim_approved', (event) => {
    const db = (0, jsonDb_1.readDb)();
    const claim = db.claims.find((c) => c.id === event.payload.claimId);
    if (claim) {
        claim.status = 'Approved';
        (0, jsonDb_1.writeDb)(db);
        exports.dispatcher.publish('customer_notified', {
            claimId: claim.id,
            email: claim.customerEmail,
            message: `Your claim for $${claim.estimatedAmount} has been approved for payout.`,
        });
    }
});
// 8. Claim Rejected Handler
exports.dispatcher.register('claim_rejected', (event) => {
    const db = (0, jsonDb_1.readDb)();
    const claim = db.claims.find((c) => c.id === event.payload.claimId);
    if (claim) {
        claim.status = 'Rejected';
        (0, jsonDb_1.writeDb)(db);
        exports.dispatcher.publish('customer_notified', {
            claimId: claim.id,
            email: claim.customerEmail,
            message: `Your claim (${claim.id}) was rejected after staff review.`,
        });
    }
});
// 9. Customer Notification Handler
exports.dispatcher.register('customer_notified', (event) => {
    const db = (0, jsonDb_1.readDb)();
    db.notifications.unshift({
        id: `NOTIF-${(0, uuid_1.v4)().slice(0, 6).toUpperCase()}`,
        claimId: event.payload.claimId,
        email: event.payload.email,
        message: event.payload.message,
        timestamp: event.timestamp,
    });
    (0, jsonDb_1.writeDb)(db);
});
// 10. Payment Processed Handler
exports.dispatcher.register('payment_processed', (event) => {
    const db = (0, jsonDb_1.readDb)();
    const claim = db.claims.find((c) => c.id === event.payload.claimId);
    if (claim && claim.status === 'Approved') {
        claim.status = 'Paid';
        claim.paymentReference = event.payload.reference;
        (0, jsonDb_1.writeDb)(db);
        exports.dispatcher.publish('customer_notified', {
            claimId: claim.id,
            email: claim.customerEmail,
            message: `Payout of $${claim.estimatedAmount} processed (Ref: ${event.payload.reference}).`,
        });
    }
});
//# sourceMappingURL=eventEngine.js.map