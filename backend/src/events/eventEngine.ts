import { v4 as uuidv4 } from 'uuid';
import { DomainEvent, EventName } from './types';
import { readDb, writeDb } from '../storage/jsonDb';

type EventHandler = (event: DomainEvent) => Promise<void> | void;

export class EventQueue {
  private queue: DomainEvent[] = [];

  enqueue(name: EventName, payload: Record<string, any>): DomainEvent {
    const event: DomainEvent = {
      id: `EVT-${uuidv4().slice(0, 8).toUpperCase()}`,
      name,
      timestamp: new Date().toISOString(),
      status: 'queued',
      payload,
    };
    this.queue.push(event);
    return event;
  }

  dequeue(): DomainEvent | undefined {
    return this.queue.shift();
  }

  size(): number {
    return this.queue.length;
  }
}

export class EventDispatcher {
  private handlers: Map<EventName, EventHandler[]> = new Map();
  private isProcessing = false;

  constructor(private queue: EventQueue) {}

  register(eventName: EventName, handler: EventHandler): void {
    const existing = this.handlers.get(eventName) || [];
    this.handlers.set(eventName, [...existing, handler]);
  }

  publish(name: EventName, payload: Record<string, any>): DomainEvent {
    const event = this.queue.enqueue(name, payload);
    this.processNext();
    return event;
  }

  async processNext(): Promise<void> {
    if (this.isProcessing) return;
    this.isProcessing = true;

    while (this.queue.size() > 0) {
      const event = this.queue.dequeue();
      if (!event) break;

      event.status = 'processing';

      try {
        const eventHandlers = this.handlers.get(event.name) || [];
        for (const handler of eventHandlers) {
          await handler(event);
        }
        event.status = 'processed';
      } catch (err: any) {
        event.status = 'failed';
        event.error = err.message || 'Unknown handler error';
      }

      const updatedDb = readDb();
      updatedDb.eventLog.unshift(event);
      writeDb(updatedDb);
    }

    this.isProcessing = false;
  }
}

export const eventQueue = new EventQueue();
export const dispatcher = new EventDispatcher(eventQueue);

// 1. Policy Verification & Risk Screening Handler
dispatcher.register('claim_submitted', (event) => {
  const { claimId, policyNumber, estimatedAmount, description } = event.payload;
  const isValidPolicy = /^POL-\d{4,}$/i.test(policyNumber);

  if (!isValidPolicy) {
    dispatcher.publish('policy_verification_failed', {
      claimId,
      reason: 'Policy format invalid (expected POL-XXXX)',
    });
    return;
  }

  dispatcher.publish('policy_verified', { claimId, policyNumber });

  if (estimatedAmount > 10000 || description.trim().length < 15) {
    dispatcher.publish('claim_flagged', {
      claimId,
      reason: estimatedAmount > 10000 ? 'High claim value (> $10,000)' : 'Incomplete accident description',
    });
  }
});

// 2. Policy Verified Handler
dispatcher.register('policy_verified', (event) => {
  const db = readDb();
  const claim = db.claims.find((c) => c.id === event.payload.claimId);
  if (claim && claim.status === 'Submitted') {
    claim.status = 'Under Review';
    writeDb(db);
    dispatcher.publish('customer_notified', {
      claimId: claim.id,
      email: claim.customerEmail,
      message: `Policy ${claim.policyNumber} verified. Your claim is now Under Review.`,
    });
  }
});

// 3. Policy Verification Failed Handler
dispatcher.register('policy_verification_failed', (event) => {
  const db = readDb();
  const claim = db.claims.find((c) => c.id === event.payload.claimId);
  if (claim) {
    claim.status = 'Rejected';
    claim.flagReason = event.payload.reason;
    writeDb(db);
    dispatcher.publish('customer_notified', {
      claimId: claim.id,
      email: claim.customerEmail,
      message: `Claim rejected: ${event.payload.reason}`,
    });
  }
});

// 4. Risk Flag Handler
dispatcher.register('claim_flagged', (event) => {
  const db = readDb();
  const claim = db.claims.find((c) => c.id === event.payload.claimId);
  if (claim && claim.status !== 'Rejected') {
    claim.status = 'Flagged';
    claim.flagReason = event.payload.reason;
    writeDb(db);
  }
});

// 5. Document Uploaded Handler
dispatcher.register('document_uploaded', (event) => {
  const db = readDb();
  const claim = db.claims.find((c) => c.id === event.payload.claimId);
  if (claim) {
    claim.documents.push({ name: event.payload.fileName, uploadedAt: event.timestamp });
    writeDb(db);
  }
});

// 6. Adjuster Assigned Handler
dispatcher.register('adjuster_assigned', (event) => {
  const db = readDb();
  const claim = db.claims.find((c) => c.id === event.payload.claimId);
  if (claim) {
    claim.assignedAdjuster = event.payload.adjusterName;
    writeDb(db);
    dispatcher.publish('customer_notified', {
      claimId: claim.id,
      email: claim.customerEmail,
      message: `Adjuster ${event.payload.adjusterName} has been assigned to your claim.`,
    });
  }
});

// 7. Claim Approved Handler
dispatcher.register('claim_approved', (event) => {
  const db = readDb();
  const claim = db.claims.find((c) => c.id === event.payload.claimId);
  if (claim) {
    claim.status = 'Approved';
    writeDb(db);
    dispatcher.publish('customer_notified', {
      claimId: claim.id,
      email: claim.customerEmail,
      message: `Your claim for $${claim.estimatedAmount} has been approved for payout.`,
    });
  }
});

// 8. Claim Rejected Handler
dispatcher.register('claim_rejected', (event) => {
  const db = readDb();
  const claim = db.claims.find((c) => c.id === event.payload.claimId);
  if (claim) {
    claim.status = 'Rejected';
    writeDb(db);
    dispatcher.publish('customer_notified', {
      claimId: claim.id,
      email: claim.customerEmail,
      message: `Your claim (${claim.id}) was rejected after staff review.`,
    });
  }
});

// 9. Customer Notification Handler
dispatcher.register('customer_notified', (event) => {
  const db = readDb();
  db.notifications.unshift({
    id: `NOTIF-${uuidv4().slice(0, 6).toUpperCase()}`,
    claimId: event.payload.claimId,
    email: event.payload.email,
    message: event.payload.message,
    timestamp: event.timestamp,
  });
  writeDb(db);
});

// 10. Payment Processed Handler
dispatcher.register('payment_processed', (event) => {
  const db = readDb();
  const claim = db.claims.find((c) => c.id === event.payload.claimId);
  if (claim && claim.status === 'Approved') {
    claim.status = 'Paid';
    claim.paymentReference = event.payload.reference;
    writeDb(db);
    dispatcher.publish('customer_notified', {
      claimId: claim.id,
      email: claim.customerEmail,
      message: `Payout of $${claim.estimatedAmount} processed (Ref: ${event.payload.reference}).`,
    });
  }
});
