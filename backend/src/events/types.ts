export type EventName =
  | 'claim_submitted'
  | 'policy_verified'
  | 'policy_verification_failed'
  | 'document_uploaded'
  | 'claim_flagged'
  | 'adjuster_assigned'
  | 'claim_approved'
  | 'claim_rejected'
  | 'customer_notified'
  | 'payment_processed';

export interface DomainEvent<T = Record<string, any>> {
  id: string;
  name: EventName;
  timestamp: string;
  status: 'queued' | 'processing' | 'processed' | 'failed';
  payload: T;
  error?: string;
}

export interface ClaimRecord {
  id: string;
  customerName: string;
  customerEmail: string;
  policyNumber: string;
  vehicleReg: string;
  accidentDate: string;
  description: string;
  estimatedAmount: number;
  status: 'Submitted' | 'Under Review' | 'Flagged' | 'Approved' | 'Rejected' | 'Paid';
  assignedAdjuster?: string;
  flagReason?: string;
  documents: { name: string; uploadedAt: string }[];
  paymentReference?: string;
  createdAt: string;
}
