import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import {
  ShieldCheck,
  ShieldAlert,
  FileText,
  Activity,
  Users,
  PlusCircle,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Clock,
  DollarSign,
  Search,
  Filter,
  Upload,
  Bell,
  ChevronRight,
  ChevronDown,
  RotateCcw,
  Cpu,
  Layers,
  Database,
  Send,
  UserCheck,
  BookOpen,
  Play,
  ArrowRight,
  Terminal,
  Briefcase,
  Car,
  Calendar,
  Mail,
  Hash,
  FileCheck,
  Sparkles,
  Info,
  X,
  Menu
} from 'lucide-react';

// ============================================================================
// 1. CONSTANTS, TYPES & INITIAL SEED DATA
// ============================================================================

const STORAGE_KEYS = {
  CLAIMS: 'insureflow_claims_v1',
  EVENTS: 'insureflow_events_v1',
  NOTIFICATIONS: 'insureflow_notifications_v1'
};

const ADJUSTERS = [
  { id: 'ADJ-01', name: 'Sarah Jenkins', specialty: 'Senior Collision Specialist' },
  { id: 'ADJ-02', name: 'Marcus Vance', specialty: 'Complex & High-Value Claims' },
  { id: 'ADJ-03', name: 'Elena Rostova', specialty: 'Commercial & Multi-Vehicle' }
];

const EVENT_TYPES = [
  'claim_submitted',
  'policy_verified',
  'policy_verification_failed',
  'document_uploaded',
  'claim_flagged',
  'adjuster_assigned',
  'claim_approved',
  'claim_rejected',
  'customer_notified',
  'payment_processed'
];

const generateEventId = () => `EVT-${Math.floor(1000 + Math.random() * 9000)}-${Date.now().toString().slice(-3)}`;
const generateClaimId = () => `CLM-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

const INITIAL_SEED_DATA = () => {
  const now = Date.now();
  const iso = (offsetMs) => new Date(now - offsetMs).toISOString();

  const claims = [
    {
      id: 'CLM-2026-4821',
      customerName: 'Daniel Mercer',
      email: 'd.mercer@example.com',
      policyNumber: 'POL-884920',
      vehicleReg: 'WA-742-KL',
      accidentDate: '2026-11-15',
      description: 'Rear-ended at traffic light on Main Street during rain. Bumper and trunk lid dented.',
      estimatedDamage: 4250,
      status: 'Approved',
      assignedAdjuster: 'Sarah Jenkins',
      flagReasons: [],
      rejectionReason: null,
      paymentAmount: null,
      paymentDate: null,
      documents: [
        { id: 'DOC-101', name: 'police_report_4821.pdf', size: '1.2 MB', uploadedAt: iso(86400000 * 2) },
        { id: 'DOC-102', name: 'rear_bumper_photo.jpg', size: '3.4 MB', uploadedAt: iso(86400000 * 2) }
      ],
      createdAt: iso(86400000 * 2),
      updatedAt: iso(3600000 * 5),
      timeline: [
        { time: iso(86400000 * 2), title: 'Claim Submitted', detail: 'Submitted by Daniel Mercer (4,250)', type: 'info' },
        { time: iso(86400000 * 2 - 400), title: 'Policy Verified', detail: 'Policy POL-884920 active and valid', type: 'success' },
        { time: iso(86400000 * 2 - 800), title: 'Risk Screening Passed', detail: 'No anomalies detected; routed to Under Review', type: 'success' },
        { time: iso(86400000), title: 'Adjuster Assigned', detail: 'Assigned to Sarah Jenkins', type: 'info' },
        { time: iso(3600000 * 5), title: 'Claim Approved', detail: 'Approved for payout of 4,250.00', type: 'success' }
      ]
    },
    {
      id: 'CLM-2026-4905',
      customerName: 'Victoria Sterling',
      email: 'v.sterling@example.com',
      policyNumber: 'POL-331094',
      vehicleReg: 'KR-901-VX',
      accidentDate: '2026-11-18',
      description: 'Vehicle parked overnight in commercial lot; woke up to find vehicle totaled with no witnesses present.',
      estimatedDamage: 24800,
      status: 'Flagged for Review',
      assignedAdjuster: null,
      flagReasons: [
        'Estimated damage (24,800) exceeds 15,000 automated threshold',
        'High-risk keyword detected in description: "totaled", "no witnesses"'
      ],
      rejectionReason: null,
      paymentAmount: null,
      paymentDate: null,
      documents: [
        { id: 'DOC-103', name: 'parking_lot_scene.jpg', size: '2.8 MB', uploadedAt: iso(3600000 * 14) }
      ],
      createdAt: iso(3600000 * 14),
      updatedAt: iso(3600000 * 14),
      timeline: [
        { time: iso(3600000 * 14), title: 'Claim Submitted', detail: 'Submitted by Victoria Sterling (24,800)', type: 'info' },
        { time: iso(3600000 * 14 - 400), title: 'Policy Verified', detail: 'Policy POL-331094 active and valid', type: 'success' },
        { time: iso(3600000 * 14 - 800), title: 'Claim Flagged by Risk Engine', detail: 'Damage > 15k & keywords ("totaled", "no witnesses")', type: 'warning' }
      ]
    },
    {
      id: 'CLM-2026-4712',
      customerName: 'Arthur Pendelton',
      email: 'arthur.p@example.com',
      policyNumber: 'POL-559102',
      vehicleReg: 'GD-118-TR',
      accidentDate: '2026-11-10',
      description: 'Side mirror clipped by passing delivery van on narrow street.',
      estimatedDamage: 890,
      status: 'Paid',
      assignedAdjuster: 'Elena Rostova',
      flagReasons: [],
      rejectionReason: null,
      paymentAmount: 890,
      paymentDate: iso(86400000 * 3),
      documents: [
        { id: 'DOC-104', name: 'repair_quote_authorized.pdf', size: '640 KB', uploadedAt: iso(86400000 * 6) }
      ],
      createdAt: iso(86400000 * 6),
      updatedAt: iso(86400000 * 3),
      timeline: [
        { time: iso(86400000 * 6), title: 'Claim Submitted', detail: 'Submitted by Arthur Pendelton (890)', type: 'info' },
        { time: iso(86400000 * 6 - 400), title: 'Policy Verified', detail: 'Policy POL-559102 active and valid', type: 'success' },
        { time: iso(86400000 * 5), title: 'Adjuster Assigned', detail: 'Assigned to Elena Rostova', type: 'info' },
        { time: iso(86400000 * 4), title: 'Claim Approved', detail: 'Approved for payout of 890.00', type: 'success' },
        { time: iso(86400000 * 3), title: 'Payment Processed', detail: 'Disbursed 890.00 via EFT', type: 'success' }
      ]
    }
  ];

  const events = [
    {
      id: 'EVT-1001-901',
      name: 'claim_submitted',
      timestamp: iso(86400000 * 2),
      producer: 'CustomerPortalProducer',
      handler: 'PolicyVerificationHandler',
      status: 'processed',
      claimId: 'CLM-2026-4821',
      payload: { claimId: 'CLM-2026-4821', policyNumber: 'POL-884920', estimatedDamage: 4250 }
    },
    {
      id: 'EVT-1002-902',
      name: 'policy_verified',
      timestamp: iso(86400000 * 2 - 400),
      producer: 'PolicyVerificationHandler',
      handler: 'RiskScreeningHandler',
      status: 'processed',
      claimId: 'CLM-2026-4821',
      payload: { claimId: 'CLM-2026-4821', policyNumber: 'POL-884920', verified: true }
    },
    {
      id: 'EVT-1003-903',
      name: 'adjuster_assigned',
      timestamp: iso(86400000),
      producer: 'StaffDashboardProducer',
      handler: 'ClaimAssignmentHandler',
      status: 'processed',
      claimId: 'CLM-2026-4821',
      payload: { claimId: 'CLM-2026-4821', adjuster: 'Sarah Jenkins' }
    },
    {
      id: 'EVT-1004-904',
      name: 'claim_approved',
      timestamp: iso(3600000 * 5),
      producer: 'StaffDashboardProducer',
      handler: 'ClaimDecisionHandler',
      status: 'processed',
      claimId: 'CLM-2026-4821',
      payload: { claimId: 'CLM-2026-4821', approvedAmount: 4250 }
    },
    {
      id: 'EVT-1005-905',
      name: 'claim_submitted',
      timestamp: iso(3600000 * 14),
      producer: 'CustomerPortalProducer',
      handler: 'PolicyVerificationHandler',
      status: 'processed',
      claimId: 'CLM-2026-4905',
      payload: { claimId: 'CLM-2026-4905', policyNumber: 'POL-331094', estimatedDamage: 24800 }
    },
    {
      id: 'EVT-1006-906',
      name: 'claim_flagged',
      timestamp: iso(3600000 * 14 - 800),
      producer: 'RiskScreeningHandler',
      handler: 'ClaimStatusHandler',
      status: 'processed',
      claimId: 'CLM-2026-4905',
      payload: {
        claimId: 'CLM-2026-4905',
        reasons: ['Damage exceeds 15,000', 'Keywords: totaled, no witnesses']
      }
    },
    {
      id: 'EVT-1007-907',
      name: 'payment_processed',
      timestamp: iso(86400000 * 3),
      producer: 'StaffDashboardProducer',
      handler: 'PaymentSettlementHandler',
      status: 'processed',
      claimId: 'CLM-2026-4712',
      payload: { claimId: 'CLM-2026-4712', amount: 890, method: 'EFT_SIMULATED' }
    }
  ];

  const notifications = [
    {
      id: 'NTF-801',
      claimId: 'CLM-2026-4821',
      recipient: 'd.mercer@example.com',
      customerName: 'Daniel Mercer',
      subject: 'Claim CLM-2026-4821 Approved',
      message: 'Good news! Your claim CLM-2026-4821 has been approved for 4,250.00. Payment disbursement is now eligible.',
      timestamp: iso(3600000 * 5),
      read: false
    },
    {
      id: 'NTF-802',
      claimId: 'CLM-2026-4905',
      recipient: 'v.sterling@example.com',
      customerName: 'Victoria Sterling',
      subject: 'Claim CLM-2026-4905 Flagged for Extended Review',
      message: 'Your claim CLM-2026-4905 has been routed to our Senior Special Investigations & Adjuster team for manual verification.',
      timestamp: iso(3600000 * 14 - 900),
      read: false
    },
    {
      id: 'NTF-803',
      claimId: 'CLM-2026-4712',
      recipient: 'arthur.p@example.com',
      customerName: 'Arthur Pendelton',
      subject: 'Payment Disbursed for Claim CLM-2026-4712',
      message: 'A settlement payment of 890.00 has been processed for your claim CLM-2026-4712.',
      timestamp: iso(86400000 * 3),
      read: true
    }
  ];

  return { claims, events, notifications };
};

// ============================================================================
// 2. EVENT-DRIVEN ENGINE (PRODUCER -> LOCAL QUEUE -> DISPATCHER -> HANDLERS)
// ============================================================================

/**
 * In-Memory Local Event Queue
 * Temporarily buffers emitted events before the EventDispatcher consumes them.
 */
class LocalEventQueue {
  constructor() {
    this.queue = [];
    this.listeners = new Set();
  }

  enqueue(event) {
    const queuedEvent = {
      ...event,
      id: event.id || generateEventId(),
      timestamp: event.timestamp || new Date().toISOString(),
      status: 'queued'
    };
    this.queue.push(queuedEvent);
    this.notify();
    return queuedEvent;
  }

  dequeue() {
    const item = this.queue.shift();
    this.notify();
    return item;
  }

  peek() {
    return this.queue[0] || null;
  }

  size() {
    return this.queue.length;
  }

  getItems() {
    return [...this.queue];
  }

  subscribe(listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  notify() {
    this.listeners.forEach((fn) => fn(this.getItems()));
  }
}

/**
 * Central Event Dispatcher
 * Polls/processes events asynchronously from the LocalEventQueue and routes
 * them to registered independent EventHandlers with realistic step delays.
 */
class EventDispatcher {
  constructor(queue, callbacks) {
    this.queue = queue;
    this.handlers = new Map();
    this.isProcessing = false;
    this.activeEvent = null;
    this.activeHandlerName = null;
    this.callbacks = callbacks; // { onEventQueued, onEventProcessing, onEventProcessed, onStateChange }
  }

  registerHandler(eventName, handlerName, handlerFn) {
    if (!this.handlers.has(eventName)) {
      this.handlers.set(eventName, []);
    }
    this.handlers.get(eventName).push({ handlerName, handlerFn });
  }

  // Producer entry point
  emit(eventName, producer, payload, claimId = null) {
    const evt = this.queue.enqueue({
      name: eventName,
      producer,
      claimId: claimId || payload?.claimId || null,
      payload
    });
    if (this.callbacks.onEventQueued) {
      this.callbacks.onEventQueued(evt);
    }
    this.scheduleDrain();
    return evt;
  }

  scheduleDrain() {
    if (!this.isProcessing && this.queue.size() > 0) {
      this.drainQueue();
    }
  }

  async drainQueue() {
    if (this.isProcessing) return;
    this.isProcessing = true;
    this.emitStatus();

    while (this.queue.size() > 0) {
      const event = this.queue.dequeue();
      if (!event) continue;

      const registered = this.handlers.get(event.name) || [];
      const primaryHandlerName = registered.length > 0 ? registered[0].handlerName : 'AuditLogOnlyHandler';

      this.activeEvent = event;
      this.activeHandlerName = primaryHandlerName;
      this.emitStatus();

      if (this.callbacks.onEventProcessing) {
        this.callbacks.onEventProcessing({ ...event, status: 'processing', handler: primaryHandlerName });
      }

      // Realistic asynchronous step delay (320ms) so students/lecturers can observe pipeline stages
      await new Promise((resolve) => setTimeout(resolve, 320));

      try {
        for (const { handlerFn } of registered) {
          await handlerFn(event, this);
        }

        if (this.callbacks.onEventProcessed) {
          this.callbacks.onEventProcessed({
            ...event,
            status: 'processed',
            handler: primaryHandlerName,
            processedAt: new Date().toISOString()
          });
        }
      } catch (err) {
        console.error(`[EventDispatcher] Error handling ${event.name}:`, err);
        if (this.callbacks.onEventProcessed) {
          this.callbacks.onEventProcessed({
            ...event,
            status: 'failed',
            handler: primaryHandlerName,
            error: err.message
          });
        }
      }
    }

    this.activeEvent = null;
    this.activeHandlerName = null;
    this.isProcessing = false;
    this.emitStatus();
  }

  emitStatus() {
    if (this.callbacks.onStateChange) {
      this.callbacks.onStateChange({
        isProcessing: this.isProcessing,
        queueLength: this.queue.size(),
        activeEvent: this.activeEvent,
        activeHandlerName: this.activeHandlerName
      });
    }
  }
}

// ============================================================================
// 3. UI HELPER COMPONENTS
// ============================================================================

const StatusBadge = ({ status }) => {
  const styles = {
    'Submitted': 'bg-slate-100 text-slate-700 border-slate-300',
    'Under Review': 'bg-blue-50 text-blue-700 border-blue-200',
    'Flagged for Review': 'bg-amber-50 text-amber-800 border-amber-300',
    'Approved': 'bg-emerald-50 text-emerald-700 border-emerald-200',
    'Rejected': 'bg-rose-50 text-rose-700 border-rose-200',
    'Rejected (Invalid Policy)': 'bg-rose-50 text-rose-800 border-rose-300',
    'Paid': 'bg-indigo-50 text-indigo-700 border-indigo-200'
  };

  const icons = {
    'Submitted': <Clock className="w-3.5 h-3.5 mr-1.5" />,
    'Under Review': <Activity className="w-3.5 h-3.5 mr-1.5" />,
    'Flagged for Review': <AlertTriangle className="w-3.5 h-3.5 mr-1.5" />,
    'Approved': <CheckCircle2 className="w-3.5 h-3.5 mr-1.5" />,
    'Rejected': <XCircle className="w-3.5 h-3.5 mr-1.5" />,
    'Rejected (Invalid Policy)': <ShieldAlert className="w-3.5 h-3.5 mr-1.5" />,
    'Paid': <DollarSign className="w-3.5 h-3.5 mr-1.5" />
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${styles[status] || styles['Submitted']}`}>
      {icons[status]}
      {status}
    </span>
  );
};

const EventBadge = ({ eventName }) => {
  const colorMap = {
    claim_submitted: 'bg-blue-100 text-blue-800 border-blue-200',
    policy_verified: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    policy_verification_failed: 'bg-rose-100 text-rose-800 border-rose-200',
    document_uploaded: 'bg-sky-100 text-sky-800 border-sky-200',
    claim_flagged: 'bg-amber-100 text-amber-800 border-amber-200',
    adjuster_assigned: 'bg-indigo-100 text-indigo-800 border-indigo-200',
    claim_approved: 'bg-teal-100 text-teal-800 border-teal-200',
    claim_rejected: 'bg-red-100 text-red-800 border-red-200',
    customer_notified: 'bg-purple-100 text-purple-800 border-purple-200',
    payment_processed: 'bg-green-100 text-green-800 border-green-200'
  };

  return (
    <code className={`px-2 py-0.5 rounded text-xs font-mono font-semibold border ${colorMap[eventName] || 'bg-slate-100 text-slate-800 border-slate-200'}`}>
      {eventName}
    </code>
  );
};

const formatCurrency = (amount) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(amount || 0);

const formatTime = (isoStr) => {
  if (!isoStr) return '';
  const d = new Date(isoStr);
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }) +
    ' · ' +
    d.toLocaleDateString([], { month: 'short', day: 'numeric' });
};

// ============================================================================
// 4. MAIN APPLICATION COMPONENT
// ============================================================================

export default function App() {
  // Persistent State Initialization
  const [claims, setClaims] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.CLAIMS);
      if (saved) return JSON.parse(saved);
    } catch (e) { /* ignore */ }
    return INITIAL_SEED_DATA().claims;
  });

  const [events, setEvents] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.EVENTS);
      if (saved) return JSON.parse(saved);
    } catch (e) { /* ignore */ }
    return INITIAL_SEED_DATA().events;
  });

  const [notifications, setNotifications] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS);
      if (saved) return JSON.parse(saved);
    } catch (e) { /* ignore */ }
    return INITIAL_SEED_DATA().notifications;
  });

  // Navigation & UI State
  const [activeView, setActiveView] = useState('dashboard'); // 'dashboard' | 'customer' | 'architecture' | 'docs'
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [selectedClaimId, setSelectedClaimId] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);

  // Live Engine Telemetry State
  const [engineState, setEngineState] = useState({
    isProcessing: false,
    queueLength: 0,
    activeEvent: null,
    activeHandlerName: null
  });
  const [queuedSnapshot, setQueuedSnapshot] = useState([]);

  // Refs to access latest state inside async event handlers without stale closures
  const claimsRef = useRef(claims);
  useEffect(() => {
    claimsRef.current = claims;
    try {
      localStorage.setItem(STORAGE_KEYS.CLAIMS, JSON.stringify(claims));
    } catch (e) { /* ignore */ }
  }, [claims]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.EVENTS, JSON.stringify(events));
    } catch (e) { /* ignore */ }
  }, [events]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(notifications));
    } catch (e) { /* ignore */ }
  }, [notifications]);

  const showToast = useCallback((text, tone = 'info') => {
    setToastMessage({ text, tone, id: Date.now() });
  }, []);

  useEffect(() => {
    if (!toastMessage) return;
    const t = setTimeout(() => setToastMessage(null), 4000);
    return () => clearTimeout(t);
  }, [toastMessage]);

  // Helper to update a specific claim cleanly
  const updateClaimRecord = useCallback((claimId, updater) => {
    setClaims((prev) =>
      prev.map((c) => {
        if (c.id !== claimId) return c;
        const updated = typeof updater === 'function' ? updater(c) : { ...c, ...updater };
        return { ...updated, updatedAt: new Date().toISOString() };
      })
    );
  }, []);

  // ==========================================================================
  // INITIALIZE EVENT QUEUE, DISPATCHER & INDEPENDENT EVENT HANDLERS
  // ==========================================================================
  const dispatcherRef = useRef(null);
  const queueRef = useRef(null);

  if (!dispatcherRef.current) {
    const queue = new LocalEventQueue();
    queue.subscribe((items) => setQueuedSnapshot(items));

    const dispatcher = new EventDispatcher(queue, {
      onEventQueued: (evt) => {
        setEvents((prev) => [evt, ...prev]);
      },
      onEventProcessing: (evt) => {
        setEvents((prev) => prev.map((e) => (e.id === evt.id ? { ...e, ...evt } : e)));
      },
      onEventProcessed: (evt) => {
        setEvents((prev) => prev.map((e) => (e.id === evt.id ? { ...e, ...evt } : e)));
      },
      onStateChange: (state) => {
        setEngineState(state);
      }
    });

    // ------------------------------------------------------------------------
    // HANDLER 1: PolicyVerificationHandler (listens to: claim_submitted)
    // ------------------------------------------------------------------------
    dispatcher.registerHandler('claim_submitted', 'PolicyVerificationHandler', (event, disp) => {
      const { claimId, policyNumber, customerName, email } = event.payload;
      const normalizedPolicy = (policyNumber || '').trim().toUpperCase();

      const isValidFormat = normalizedPolicy.startsWith('POL-') && normalizedPolicy.length >= 7;
      const isBlockedPolicy = normalizedPolicy === 'POL-EXPIRED' || normalizedPolicy === 'POL-INVALID';

      if (!isValidFormat || isBlockedPolicy) {
        const failureReason = isBlockedPolicy
          ? `Policy ${normalizedPolicy} is marked as inactive/expired in policy registry.`
          : `Policy number "${policyNumber}" does not match required POL-XXXXXX format.`;

        updateClaimRecord(claimId, (c) => ({
          ...c,
          timeline: [
            ...c.timeline,
            {
              time: new Date().toISOString(),
              title: 'Policy Verification Failed',
              detail: failureReason,
              type: 'error'
            }
          ]
        }));

        disp.emit(
          'policy_verification_failed',
          'PolicyVerificationHandler',
          { claimId, policyNumber, reason: failureReason, customerName, email },
          claimId
        );
      } else {
        updateClaimRecord(claimId, (c) => ({
          ...c,
          timeline: [
            ...c.timeline,
            {
              time: new Date().toISOString(),
              title: 'Policy Verified',
              detail: `Policy ${normalizedPolicy} confirmed active with valid collision coverage.`,
              type: 'success'
            }
          ]
        }));

        disp.emit(
          'policy_verified',
          'PolicyVerificationHandler',
          { claimId, policyNumber: normalizedPolicy, customerName, email },
          claimId
        );
      }
    });

    // ------------------------------------------------------------------------
    // HANDLER 2: InvalidPolicyHandler (listens to: policy_verification_failed)
    // ------------------------------------------------------------------------
    dispatcher.registerHandler('policy_verification_failed', 'PolicyRejectionHandler', (event, disp) => {
      const { claimId, reason, customerName, email } = event.payload;

      updateClaimRecord(claimId, (c) => ({
        ...c,
        status: 'Rejected (Invalid Policy)',
        rejectionReason: reason,
        timeline: [
          ...c.timeline,
          {
            time: new Date().toISOString(),
            title: 'Claim Auto-Rejected',
            detail: 'Closed due to invalid or inactive insurance policy.',
            type: 'error'
          }
        ]
      }));

      disp.emit(
        'customer_notified',
        'PolicyRejectionHandler',
        {
          claimId,
          recipient: email,
          customerName,
          subject: `Action Required: Claim ${claimId} Policy Verification Failed`,
          message: `We could not verify policy coverage for claim ${claimId}. Reason: ${reason}`
        },
        claimId
      );
    });

    // ------------------------------------------------------------------------
    // HANDLER 3: RiskScreeningHandler (listens to: policy_verified)
    // ------------------------------------------------------------------------
    dispatcher.registerHandler('policy_verified', 'RiskScreeningHandler', (event, disp) => {
      const { claimId } = event.payload;
      const claim = claimsRef.current.find((c) => c.id === claimId);
      if (!claim) return;

      const flagReasons = [];
      if (Number(claim.estimatedDamage) > 15000) {
        flagReasons.push(`Estimated damage (${formatCurrency(claim.estimatedDamage)}) exceeds 15,000 automated threshold`);
      }

      const riskKeywords = ['totaled', 'stolen', 'cash', 'no witnesses'];
      const descLower = (claim.description || '').toLowerCase();
      const matchedKeywords = riskKeywords.filter((kw) => descLower.includes(kw));
      if (matchedKeywords.length > 0) {
        flagReasons.push(`High-risk keyword(s) detected: "${matchedKeywords.join('", "')}"`);
      }

      const todayStr = new Date().toISOString().split('T')[0];
      if (claim.accidentDate && claim.accidentDate > todayStr) {
        flagReasons.push(`Accident date (${claim.accidentDate}) is in the future`);
      }

      if (flagReasons.length > 0) {
        updateClaimRecord(claimId, (c) => ({
          ...c,
          status: 'Flagged for Review',
          flagReasons,
          timeline: [
            ...c.timeline,
            {
              time: new Date().toISOString(),
              title: 'Flagged by Risk Screening Engine',
              detail: flagReasons.join(' • '),
              type: 'warning'
            }
          ]
        }));

        disp.emit(
          'claim_flagged',
          'RiskScreeningHandler',
          {
            claimId,
            flagReasons,
            customerName: claim.customerName,
            email: claim.email
          },
          claimId
        );
      } else {
        updateClaimRecord(claimId, (c) => ({
          ...c,
          status: 'Under Review',
          flagReasons: [],
          timeline: [
            ...c.timeline,
            {
              time: new Date().toISOString(),
              title: 'Risk Screening Passed',
              detail: 'Standard risk profile. Queued for claims adjuster review.',
              type: 'success'
            }
          ]
        }));

        disp.emit(
          'customer_notified',
          'RiskScreeningHandler',
          {
            claimId,
            recipient: claim.email,
            customerName: claim.customerName,
            subject: `Claim ${claimId} Verified & Under Review`,
            message: `Your claim ${claimId} passed initial policy and automated checks and is now awaiting adjuster review.`
          },
          claimId
        );
      }
    });

    // ------------------------------------------------------------------------
    // HANDLER 4: FlaggedClaimHandler (listens to: claim_flagged)
    // ------------------------------------------------------------------------
    dispatcher.registerHandler('claim_flagged', 'FlaggedEscalationHandler', (event, disp) => {
      const { claimId, customerName, email } = event.payload;
      disp.emit(
        'customer_notified',
        'FlaggedEscalationHandler',
        {
          claimId,
          recipient: email,
          customerName,
          subject: `Claim ${claimId} Routed to Specialist Review`,
          message: `Your claim ${claimId} requires additional specialist review based on claim parameters. An adjuster will review your file shortly.`
        },
        claimId
      );
    });

    // ------------------------------------------------------------------------
    // HANDLER 5: DocumentEvidenceHandler (listens to: document_uploaded)
    // ------------------------------------------------------------------------
    dispatcher.registerHandler('document_uploaded', 'DocumentEvidenceHandler', (event) => {
      const { claimId, fileName, fileSize, uploadedBy } = event.payload;
      updateClaimRecord(claimId, (c) => {
        const exists = c.documents.some((d) => d.name === fileName && d.id === event.payload.docId);
        const nextDocs = exists
          ? c.documents
          : [
              ...c.documents,
              {
                id: event.payload.docId || `DOC-${Math.floor(100 + Math.random() * 900)}`,
                name: fileName,
                size: fileSize || '1.1 MB',
                uploadedAt: new Date().toISOString()
              }
            ];

        return {
          ...c,
          documents: nextDocs,
          timeline: [
            ...c.timeline,
            {
              time: new Date().toISOString(),
              title: 'Evidence Document Attached',
              detail: `"${fileName}" uploaded by ${uploadedBy || 'Customer'}`,
              type: 'info'
            }
          ]
        };
      });
    });

    // ------------------------------------------------------------------------
    // HANDLER 6: AdjusterAssignmentHandler (listens to: adjuster_assigned)
    // ------------------------------------------------------------------------
    dispatcher.registerHandler('adjuster_assigned', 'AdjusterAssignmentHandler', (event, disp) => {
      const { claimId, adjusterName } = event.payload;
      const claim = claimsRef.current.find((c) => c.id === claimId);

      updateClaimRecord(claimId, (c) => ({
        ...c,
        assignedAdjuster: adjusterName,
        status: c.status === 'Submitted' ? 'Under Review' : c.status,
        timeline: [
          ...c.timeline,
          {
            time: new Date().toISOString(),
            title: 'Adjuster Assigned',
            detail: `Assigned to ${adjusterName}`,
            type: 'info'
          }
        ]
      }));

      if (claim) {
        disp.emit(
          'customer_notified',
          'AdjusterAssignmentHandler',
          {
            claimId,
            recipient: claim.email,
            customerName: claim.customerName,
            subject: `Adjuster Assigned to Claim ${claimId}`,
            message: `Claims adjuster ${adjusterName} has been assigned to handle your claim ${claimId}.`
          },
          claimId
        );
      }
    });

    // ------------------------------------------------------------------------
    // HANDLER 7: ClaimApprovalHandler (listens to: claim_approved)
    // ------------------------------------------------------------------------
    dispatcher.registerHandler('claim_approved', 'ClaimDecisionHandler', (event, disp) => {
      const { claimId, approvedAmount, approvedBy } = event.payload;
      const claim = claimsRef.current.find((c) => c.id === claimId);

      updateClaimRecord(claimId, (c) => ({
        ...c,
        status: 'Approved',
        rejectionReason: null,
        timeline: [
          ...c.timeline,
          {
            time: new Date().toISOString(),
            title: 'Claim Approved',
            detail: `Approved for ${formatCurrency(approvedAmount || c.estimatedDamage)} by ${approvedBy || 'Claims Staff'}`,
            type: 'success'
          }
        ]
      }));

      if (claim) {
        disp.emit(
          'customer_notified',
          'ClaimDecisionHandler',
          {
            claimId,
            recipient: claim.email,
            customerName: claim.customerName,
            subject: `Claim ${claimId} Approved for Settlement`,
            message: `Your claim ${claimId} has been approved for ${formatCurrency(approvedAmount || claim.estimatedDamage)}. Payment processing is now unlocked.`
          },
          claimId
        );
      }
    });

    // ------------------------------------------------------------------------
    // HANDLER 8: ClaimRejectionHandler (listens to: claim_rejected)
    // ------------------------------------------------------------------------
    dispatcher.registerHandler('claim_rejected', 'ClaimDecisionHandler', (event, disp) => {
      const { claimId, reason } = event.payload;
      const claim = claimsRef.current.find((c) => c.id === claimId);

      updateClaimRecord(claimId, (c) => ({
        ...c,
        status: 'Rejected',
        rejectionReason: reason,
        timeline: [
          ...c.timeline,
          {
            time: new Date().toISOString(),
            title: 'Claim Rejected',
            detail: `Rejected by staff. Reason: ${reason}`,
            type: 'error'
          }
        ]
      }));

      if (claim) {
        disp.emit(
          'customer_notified',
          'ClaimDecisionHandler',
          {
            claimId,
            recipient: claim.email,
            customerName: claim.customerName,
            subject: `Update Regarding Claim ${claimId}`,
            message: `Your claim ${claimId} was not approved. Reason provided: ${reason}`
          },
          claimId
        );
      }
    });

    // ------------------------------------------------------------------------
    // HANDLER 9: PaymentSettlementHandler (listens to: payment_processed)
    // ------------------------------------------------------------------------
    dispatcher.registerHandler('payment_processed', 'PaymentSettlementHandler', (event, disp) => {
      const { claimId, amount, method } = event.payload;
      const claim = claimsRef.current.find((c) => c.id === claimId);

      if (!claim || claim.status !== 'Approved') {
        throw new Error(`Payment blocked: Claim ${claimId} must be in 'Approved' status before disbursement.`);
      }

      updateClaimRecord(claimId, (c) => ({
        ...c,
        status: 'Paid',
        paymentAmount: amount,
        paymentDate: new Date().toISOString(),
        timeline: [
          ...c.timeline,
          {
            time: new Date().toISOString(),
            title: 'Settlement Payment Processed',
            detail: `Disbursed ${formatCurrency(amount)} via ${method || 'Simulated EFT'}`,
            type: 'success'
          }
        ]
      }));

      disp.emit(
        'customer_notified',
        'PaymentSettlementHandler',
        {
          claimId,
          recipient: claim.email,
          customerName: claim.customerName,
          subject: `Payment Sent for Claim ${claimId}`,
          message: `A settlement payment of ${formatCurrency(amount)} has been issued for claim ${claimId}.`
        },
        claimId
      );
    });

    // ------------------------------------------------------------------------
    // HANDLER 10: CustomerNotificationHandler (listens to: customer_notified)
    // ------------------------------------------------------------------------
    dispatcher.registerHandler('customer_notified', 'CustomerNotificationHandler', (event) => {
      const { claimId, recipient, customerName, subject, message } = event.payload;
      const newNotification = {
        id: `NTF-${Math.floor(100 + Math.random() * 899)}`,
        claimId,
        recipient,
        customerName,
        subject,
        message,
        timestamp: new Date().toISOString(),
        read: false
      };
      setNotifications((prev) => [newNotification, ...prev]);
    });

    queueRef.current = queue;
    dispatcherRef.current = dispatcher;
  }

  // ==========================================================================
  // PRODUCER ACTIONS (INVOKED BY UI)
  // ==========================================================================

  const handleSubmitClaim = (formData) => {
    const newClaimId = generateClaimId();
    const nowIso = new Date().toISOString();

    const initialDocs = formData.attachmentName
      ? [
          {
            id: `DOC-${Math.floor(100 + Math.random() * 900)}`,
            name: formData.attachmentName,
            size: formData.attachmentSize || '1.8 MB',
            uploadedAt: nowIso
          }
        ]
      : [];

    const newClaim = {
      id: newClaimId,
      customerName: formData.customerName.trim(),
      email: formData.email.trim(),
      policyNumber: formData.policyNumber.trim().toUpperCase(),
      vehicleReg: formData.vehicleReg.trim().toUpperCase(),
      accidentDate: formData.accidentDate,
      description: formData.description.trim(),
      estimatedDamage: Number(formData.estimatedDamage),
      status: 'Submitted',
      assignedAdjuster: null,
      flagReasons: [],
      rejectionReason: null,
      paymentAmount: null,
      paymentDate: null,
      documents: initialDocs,
      createdAt: nowIso,
      updatedAt: nowIso,
      timeline: [
        {
          time: nowIso,
          title: 'Claim Submitted',
          detail: `Submitted by ${formData.customerName} (${formatCurrency(formData.estimatedDamage)})`,
          type: 'info'
        }
      ]
    };

    // Persist initial record immediately so handlers can mutate it
    setClaims((prev) => [newClaim, ...prev]);
    claimsRef.current = [newClaim, ...claimsRef.current];

    // Producer emits primary claim_submitted event
    dispatcherRef.current.emit(
      'claim_submitted',
      'CustomerPortalProducer',
      {
        claimId: newClaimId,
        customerName: newClaim.customerName,
        email: newClaim.email,
        policyNumber: newClaim.policyNumber,
        vehicleReg: newClaim.vehicleReg,
        accidentDate: newClaim.accidentDate,
        estimatedDamage: newClaim.estimatedDamage
      },
      newClaimId
    );

    // If evidence was attached during submission, also emit document_uploaded
    if (initialDocs.length > 0) {
      dispatcherRef.current.emit(
        'document_uploaded',
        'CustomerPortalProducer',
        {
          claimId: newClaimId,
          docId: initialDocs[0].id,
          fileName: initialDocs[0].name,
          fileSize: initialDocs[0].size,
          uploadedBy: newClaim.customerName
        },
        newClaimId
      );
    }

    showToast(`Claim ${newClaimId} submitted! Event dispatched to queue.`, 'success');
    return newClaimId;
  };

  const handleUploadEvidence = (claimId, fileName, uploadedBy = 'Claims Staff') => {
    const cleanName = fileName.trim() || `evidence_scan_${Math.floor(100 + Math.random() * 899)}.pdf`;
    dispatcherRef.current.emit(
      'document_uploaded',
      uploadedBy === 'Claims Staff' ? 'StaffDashboardProducer' : 'CustomerPortalProducer',
      {
        claimId,
        docId: `DOC-${Math.floor(100 + Math.random() * 900)}`,
        fileName: cleanName,
        fileSize: `${(Math.random() * 3 + 0.5).toFixed(1)} MB`,
        uploadedBy
      },
      claimId
    );
    showToast(`Event "document_uploaded" queued for ${claimId}`, 'info');
  };

  const handleAssignAdjuster = (claimId, adjusterName) => {
    if (!adjusterName) return;
    dispatcherRef.current.emit(
      'adjuster_assigned',
      'StaffDashboardProducer',
      { claimId, adjusterName },
      claimId
    );
    showToast(`Assigned ${adjusterName} to ${claimId}`, 'info');
  };

  const handleApproveClaim = (claimId, amount) => {
    dispatcherRef.current.emit(
      'claim_approved',
      'StaffDashboardProducer',
      { claimId, approvedAmount: amount, approvedBy: 'Senior Claims Reviewer' },
      claimId
    );
    showToast(`Approval event queued for ${claimId}`, 'success');
  };

  const handleRejectClaim = (claimId, reason) => {
    if (!reason.trim()) return;
    dispatcherRef.current.emit(
      'claim_rejected',
      'StaffDashboardProducer',
      { claimId, reason: reason.trim() },
      claimId
    );
    showToast(`Rejection event queued for ${claimId}`, 'warning');
  };

  const handleProcessPayment = (claim) => {
    if (claim.status !== 'Approved') {
      showToast('Payment is only allowed for Approved claims.', 'error');
      return;
    }
    dispatcherRef.current.emit(
      'payment_processed',
      'StaffDashboardProducer',
      {
        claimId: claim.id,
        amount: claim.estimatedDamage,
        method: 'Simulated Instant EFT'
      },
      claim.id
    );
    showToast(`Payment disbursement event queued for ${claim.id}`, 'success');
  };

  const handleResetDemoData = () => {
    const seed = INITIAL_SEED_DATA();
    setClaims(seed.claims);
    setEvents(seed.events);
    setNotifications(seed.notifications);
    setSelectedClaimId(null);
    localStorage.setItem(STORAGE_KEYS.CLAIMS, JSON.stringify(seed.claims));
    localStorage.setItem(STORAGE_KEYS.EVENTS, JSON.stringify(seed.events));
    localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(seed.notifications));
    showToast('Demo data restored to initial state.', 'info');
  };

  // Computed KPI Metrics directly from stored claims
  const kpis = useMemo(() => {
    const total = claims.length;
    const pending = claims.filter((c) => c.status === 'Submitted' || c.status === 'Under Review').length;
    const flagged = claims.filter((c) => c.status === 'Flagged for Review').length;
    const approved = claims.filter((c) => c.status === 'Approved' || c.status === 'Paid').length;
    const rejected = claims.filter((c) => c.status.startsWith('Rejected')).length;
    return { total, pending, flagged, approved, rejected };
  }, [claims]);

  const selectedClaim = useMemo(
    () => claims.find((c) => c.id === selectedClaimId) || null,
    [claims, selectedClaimId]
  );

  const navItems = [
    { id: 'dashboard', label: 'Staff Dashboard', icon: Layers, badge: claims.length },
    { id: 'customer', label: 'Customer Portal (Submit)', icon: PlusCircle },
    { id: 'architecture', label: 'Event Architecture & Log', icon: Cpu, badge: events.length },
    { id: 'docs', label: 'EDP Documentation', icon: BookOpen }
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col md:flex-row font-sans">
      {/* ====================================================================
          LEFT SIDEBAR NAVIGATION (NAVY #0F172A)
         ==================================================================== */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-68 bg-[#0F172A] text-white flex flex-col justify-between transition-transform duration-200 ease-in-out md:static md:translate-x-0 ${
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div>
          {/* Brand Header */}
          <div className="px-6 py-5 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-9 h-9 rounded-lg bg-blue-600 flex items-center justify-center shadow-md shadow-blue-900/50">
                <ShieldCheck className="w-5 h-5 text-white" />
              </div>
              <div>
                <span className="text-lg font-bold tracking-tight text-white block leading-none">
                  InsureFlow
                </span>
                <span className="text-[11px] font-medium text-blue-400 tracking-wider uppercase mt-1 block">
                  EDP Claims Engine
                </span>
              </div>
            </div>
            <button
              onClick={() => setMobileMenuOpen(false)}
              className="md:hidden text-slate-400 hover:text-white p-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Menu */}
          <nav className="px-3 py-5 space-y-1.5">
            <div className="px-3 pb-2 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
              Platform Views
            </div>
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeView === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveView(item.id);
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-lg text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'text-slate-300 hover:bg-[#1E293B] hover:text-white'
                  }`}
                >
                  <span className="flex items-center space-x-3">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                    <span>{item.label}</span>
                  </span>
                  {item.badge !== undefined && (
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full font-semibold ${
                        isActive ? 'bg-blue-500 text-white' : 'bg-slate-800 text-slate-300'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Live Mini Queue Monitor in Sidebar */}
          <div className="mx-3 mt-4 p-4 rounded-xl bg-[#1E293B] border border-slate-700/80">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-300 flex items-center">
                <Activity className="w-3.5 h-3.5 mr-1.5 text-blue-400" />
                Dispatcher Loop
              </span>
              <span
                className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                  engineState.isProcessing
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                    : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                }`}
              >
                <span
                  className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
                    engineState.isProcessing ? 'bg-amber-400 animate-ping' : 'bg-emerald-400'
                  }`}
                />
                {engineState.isProcessing ? 'Processing' : 'Idle'}
              </span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              {engineState.activeEvent ? (
                <>
                  Dispatching <code className="text-blue-300">{engineState.activeEvent.name}</code> →{' '}
                  <span className="text-slate-200">{engineState.activeHandlerName}</span>
                </>
              ) : (
                'Awaiting events from Customer Portal or Staff Producers.'
              )}
            </p>
            <div className="mt-3 pt-2.5 border-t border-slate-700/80 flex justify-between text-xs text-slate-400">
              <span>Queue Depth:</span>
              <span className="font-mono font-semibold text-white">{engineState.queueLength}</span>
            </div>
          </div>
        </div>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-slate-800 text-xs text-slate-400">
          <div className="flex items-center space-x-2 text-slate-300 font-medium mb-1">
            <Database className="w-3.5 h-3.5 text-blue-400" />
            <span>LocalStorage Persistence Active</span>
          </div>
          <p className="text-[11px] text-slate-500">
            Claims, notifications & event logs survive browser reloads.
          </p>
        </div>
      </aside>

      {/* Mobile Backdrop */}
      {mobileMenuOpen && (
        <div
          onClick={() => setMobileMenuOpen(false)}
          className="fixed inset-0 bg-slate-900/60 z-30 md:hidden"
        />
      )}

      {/* ====================================================================
          MAIN CONTENT COLUMN
         ==================================================================== */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header Bar */}
        <header className="sticky top-0 z-20 bg-white border-b border-slate-200 px-4 sm:px-8 py-3.5 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="md:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100"
              aria-label="Open menu"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-base sm:text-lg font-bold text-slate-900">
                {navItems.find((n) => n.id === activeView)?.label}
              </h1>
              <p className="text-xs text-slate-500 hidden sm:block">
                Event-Driven Motor Claims Processing & Automated Risk Triage
              </p>
            </div>
          </div>

          {/* Telemetry Pills & Reset Action */}
          <div className="flex items-center space-x-2 sm:space-x-4">
            {/* Queue Status Indicator */}
            <div
              className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg border text-xs font-semibold transition-colors ${
                engineState.isProcessing
                  ? 'bg-amber-50 border-amber-200 text-amber-800'
                  : 'bg-slate-50 border-slate-200 text-slate-700'
              }`}
            >
              <span
                className={`w-2 h-2 rounded-full ${
                  engineState.isProcessing ? 'bg-amber-500 animate-ping' : 'bg-emerald-500'
                }`}
              />
              <span>Queue: {engineState.isProcessing ? `Processing (${engineState.queueLength + 1})` : 'Idle'}</span>
            </div>

            {/* Total Events Processed */}
            <button
              onClick={() => setActiveView('architecture')}
              className="hidden sm:flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-blue-50 border border-blue-200 text-blue-700 text-xs font-semibold hover:bg-blue-100 transition-colors"
            >
              <Terminal className="w-3.5 h-3.5" />
              <span>Events Logged: {events.length}</span>
            </button>

            {/* Reset Demo Data Button */}
            <button
              onClick={handleResetDemoData}
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold transition-colors shadow-xs"
              title="Restore initial 3 claims and sample event history"
            >
              <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
              <span>Reset Demo Data</span>
            </button>
          </div>
        </header>

        {/* Educational Simulation Banner */}
        <div className="bg-[#1E293B] text-slate-200 px-4 sm:px-8 py-2 text-xs flex items-center justify-between border-b border-slate-700">
          <div className="flex items-center space-x-2">
            <Info className="w-4 h-4 text-blue-400 shrink-0" />
            <span>
              <strong>Educational EDP Simulation:</strong> Uses demonstration rules for policy verification, risk screening, and payment processing.
            </span>
          </div>
          <span className="hidden lg:inline text-slate-400 font-mono">
            Producer → LocalQueue → Dispatcher → Handlers
          </span>
        </div>

        {/* Toast Notification Banner */}
        {toastMessage && (
          <div className="fixed bottom-5 right-5 z-50 max-w-md bg-[#0F172A] text-white px-4 py-3 rounded-xl shadow-xl border border-slate-700 flex items-center space-x-3 animate-fade-in">
            <Sparkles className="w-4 h-4 text-blue-400 shrink-0" />
            <span className="text-xs font-medium">{toastMessage.text}</span>
            <button onClick={() => setToastMessage(null)} className="text-slate-400 hover:text-white">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Active View Container */}
        <main className="flex-1 p-4 sm:p-8 max-w-7xl w-full mx-auto">
          {activeView === 'dashboard' && (
            <StaffDashboardView
              claims={claims}
              events={events}
              kpis={kpis}
              onSelectClaim={(id) => setSelectedClaimId(id)}
              onNavigateCustomer={() => setActiveView('customer')}
              onNavigateEvents={() => setActiveView('architecture')}
            />
          )}

          {activeView === 'customer' && (
            <CustomerPortalView
              claims={claims}
              notifications={notifications}
              onSubmitClaim={handleSubmitClaim}
              onUploadEvidence={handleUploadEvidence}
              onSelectClaim={(id) => setSelectedClaimId(id)}
            />
          )}

          {activeView === 'architecture' && (
            <EventArchitectureView
              events={events}
              engineState={engineState}
              queuedSnapshot={queuedSnapshot}
              claimsCount={claims.length}
              notificationsCount={notifications.length}
            />
          )}

          {activeView === 'docs' && <DocumentationView />}
        </main>

        {/* Footer */}
        <footer className="bg-white border-t border-slate-200 px-4 sm:px-8 py-4 text-xs text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>
            Educational EDP Simulation: Uses demonstration rules for policy verification, risk screening, and payment processing.
          </span>
          <span className="font-mono text-slate-400">InsureFlow v1.0 · Event-Driven Architecture</span>
        </footer>
      </div>

      {/* ====================================================================
          CLAIM DETAIL DRAWER / MODAL
         ==================================================================== */}
      {selectedClaim && (
        <ClaimDetailModal
          claim={selectedClaim}
          events={events.filter((e) => e.claimId === selectedClaim.id)}
          onClose={() => setSelectedClaimId(null)}
          onAssignAdjuster={handleAssignAdjuster}
          onApproveClaim={handleApproveClaim}
          onRejectClaim={handleRejectClaim}
          onProcessPayment={handleProcessPayment}
          onUploadEvidence={handleUploadEvidence}
        />
      )}
    </div>
  );
}

// ============================================================================
// VIEW 1: STAFF DASHBOARD
// ============================================================================

function StaffDashboardView({
  claims,
  events,
  kpis,
  onSelectClaim,
  onNavigateCustomer,
  onNavigateEvents
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  const filteredClaims = useMemo(() => {
    return claims.filter((c) => {
      const matchesSearch =
        c.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.policyNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.vehicleReg.toLowerCase().includes(searchQuery.toLowerCase());

      if (!matchesSearch) return false;

      if (statusFilter === 'ALL') return true;
      if (statusFilter === 'PENDING') return c.status === 'Submitted' || c.status === 'Under Review';
      if (statusFilter === 'FLAGGED') return c.status === 'Flagged for Review';
      if (statusFilter === 'APPROVED') return c.status === 'Approved' || c.status === 'Paid';
      if (statusFilter === 'REJECTED') return c.status.startsWith('Rejected');
      return true;
    });
  }, [claims, searchQuery, statusFilter]);

  const kpiCards = [
    {
      label: 'Total Claims',
      value: kpis.total,
      icon: FileText,
      accent: 'text-blue-600 bg-blue-50 border-blue-100',
      filterKey: 'ALL'
    },
    {
      label: 'Pending / Under Review',
      value: kpis.pending,
      icon: Clock,
      accent: 'text-sky-600 bg-sky-50 border-sky-100',
      filterKey: 'PENDING'
    },
    {
      label: 'Flagged for Risk',
      value: kpis.flagged,
      icon: AlertTriangle,
      accent: 'text-amber-600 bg-amber-50 border-amber-100',
      filterKey: 'FLAGGED'
    },
    {
      label: 'Approved / Paid',
      value: kpis.approved,
      icon: CheckCircle2,
      accent: 'text-emerald-600 bg-emerald-50 border-emerald-100',
      filterKey: 'APPROVED'
    },
    {
      label: 'Rejected',
      value: kpis.rejected,
      icon: XCircle,
      accent: 'text-rose-600 bg-rose-50 border-rose-100',
      filterKey: 'REJECTED'
    }
  ];

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {kpiCards.map((card) => {
          const Icon = card.icon;
          const active = statusFilter === card.filterKey;
          return (
            <button
              key={card.label}
              onClick={() => setStatusFilter(card.filterKey)}
              className={`text-left bg-white p-5 rounded-xl border transition-all shadow-xs hover:shadow-md ${
                active ? 'border-blue-500 ring-2 ring-blue-500/20' : 'border-slate-200'
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  {card.label}
                </span>
                <div className={`p-2 rounded-lg border ${card.accent}`}>
                  <Icon className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl font-bold text-slate-900">{card.value}</div>
            </button>
          );
        })}
      </div>

      {/* Main Grid: Claims Table + Live Event Stream Sidebar */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Claims Management Table */}
        <div className="xl:col-span-2 bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden flex flex-col">
          <div className="p-5 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-base font-bold text-slate-900">Motor Claims Queue</h2>
              <p className="text-xs text-slate-500">
                Click any claim to inspect evidence, assign adjusters, approve/reject, or disburse funds.
              </p>
            </div>
            <button
              onClick={onNavigateCustomer}
              className="inline-flex items-center justify-center space-x-1.5 px-3.5 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold transition-colors shadow-xs"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Simulate New Claim</span>
            </button>
          </div>

          {/* Search & Filter Controls */}
          <div className="px-5 py-3 bg-slate-50 border-b border-slate-200 flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by Claim ID, Customer, Policy #, or Vehicle Reg..."
                className="w-full pl-9 pr-3 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex items-center space-x-2">
              <Filter className="w-4 h-4 text-slate-400" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="text-xs bg-white border border-slate-300 rounded-lg px-3 py-2 font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="ALL">All Statuses ({kpis.total})</option>
                <option value="PENDING">Pending / Under Review ({kpis.pending})</option>
                <option value="FLAGGED">Flagged for Review ({kpis.flagged})</option>
                <option value="APPROVED">Approved / Paid ({kpis.approved})</option>
                <option value="REJECTED">Rejected ({kpis.rejected})</option>
              </select>
            </div>
          </div>

          {/* Responsive Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 text-[11px] font-bold uppercase tracking-wider text-slate-500 bg-slate-50/60">
                  <th className="py-3 px-4">Claim / Policy</th>
                  <th className="py-3 px-4">Policyholder</th>
                  <th className="py-3 px-4">Damage Est.</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Adjuster</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {filteredClaims.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-10 text-center text-slate-400 text-xs">
                      No claims match your current filter criteria.
                    </td>
                  </tr>
                ) : (
                  filteredClaims.map((claim) => (
                    <tr
                      key={claim.id}
                      onClick={() => onSelectClaim(claim.id)}
                      className="hover:bg-blue-50/40 cursor-pointer transition-colors group"
                    >
                      <td className="py-3.5 px-4">
                        <div className="font-mono font-bold text-xs text-blue-700 group-hover:underline">
                          {claim.id}
                        </div>
                        <div className="text-xs text-slate-500 font-mono">{claim.policyNumber}</div>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-slate-900 text-xs">{claim.customerName}</div>
                        <div className="text-[11px] text-slate-500">{claim.vehicleReg}</div>
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-slate-800 text-xs">
                        {formatCurrency(claim.estimatedDamage)}
                      </td>
                      <td className="py-3.5 px-4">
                        <StatusBadge status={claim.status} />
                      </td>
                      <td className="py-3.5 px-4 text-xs text-slate-600">
                        {claim.assignedAdjuster || (
                          <span className="text-slate-400 italic">Unassigned</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelectClaim(claim.id);
                          }}
                          className="inline-flex items-center px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 hover:bg-blue-600 text-slate-700 hover:text-white transition-colors"
                        >
                          Manage
                          <ChevronRight className="w-3.5 h-3.5 ml-1" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Event Stream Panel */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs flex flex-col">
          <div className="p-5 border-b border-slate-200 flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900">Recent Event Activity</h2>
              <p className="text-xs text-slate-500">Live feed from EventDispatcher</p>
            </div>
            <button
              onClick={onNavigateEvents}
              className="text-xs font-semibold text-blue-600 hover:text-blue-800"
            >
              Inspect All →
            </button>
          </div>
          <div className="p-4 space-y-3 overflow-y-auto max-h-[520px]">
            {events.slice(0, 10).map((evt) => (
              <div
                key={evt.id}
                className="p-3 rounded-lg bg-slate-50 border border-slate-200/80 hover:border-blue-300 transition-colors"
              >
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <EventBadge eventName={evt.name} />
                  <span
                    className={`text-[10px] font-bold uppercase px-1.5 py-0.5 rounded ${
                      evt.status === 'processed'
                        ? 'bg-emerald-100 text-emerald-700'
                        : evt.status === 'processing'
                        ? 'bg-amber-100 text-amber-700'
                        : 'bg-slate-200 text-slate-700'
                    }`}
                  >
                    {evt.status}
                  </span>
                </div>
                <div className="flex items-center justify-between text-[11px] text-slate-500">
                  <span className="font-mono">{evt.id}</span>
                  <span>{formatTime(evt.timestamp)}</span>
                </div>
                <div className="mt-1 text-[11px] text-slate-600 truncate">
                  <span className="font-medium text-slate-800">{evt.producer}</span>
                  {evt.claimId && (
                    <>
                      {' '}
                      · <span className="font-mono text-blue-600">{evt.claimId}</span>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// VIEW 2: CUSTOMER PORTAL (SUBMIT CLAIM + MY CLAIMS & NOTIFICATIONS)
// ============================================================================

function CustomerPortalView({
  claims,
  notifications,
  onSubmitClaim,
  onUploadEvidence,
  onSelectClaim
}) {
  const [form, setForm] = useState({
    customerName: '',
    email: '',
    policyNumber: '',
    vehicleReg: '',
    accidentDate: new Date().toISOString().split('T')[0],
    description: '',
    estimatedDamage: '',
    attachmentName: ''
  });
  const [formError, setFormError] = useState('');
  const [lastSubmittedId, setLastSubmittedId] = useState(null);
  const [docInputs, setDocInputs] = useState({});

  const applyPreset = (presetType) => {
    setFormError('');
    const today = new Date().toISOString().split('T')[0];
    if (presetType === 'valid') {
      setForm({
        customerName: 'Claire Vance-Houghton',
        email: 'claire.vh@example.com',
        policyNumber: 'POL-774120',
        vehicleReg: 'WX-409-PL',
        accidentDate: today,
        description: 'Minor collision at roundabout; front left fender and headlight assembly damaged.',
        estimatedDamage: '3450',
        attachmentName: 'dashcam_roundabout_clip.mp4'
      });
    } else if (presetType === 'flagged') {
      setForm({
        customerName: 'Marcus Holloway',
        email: 'm.holloway@example.com',
        policyNumber: 'POL-992014',
        vehicleReg: 'KR-882-GT',
        accidentDate: today,
        description: 'Luxury SUV stolen from unmonitored industrial lot overnight with no witnesses.',
        estimatedDamage: '28500',
        attachmentName: 'incident_statement.pdf'
      });
    } else if (presetType === 'invalid') {
      setForm({
        customerName: 'Trevor Belmont',
        email: 't.belmont@example.com',
        policyNumber: 'POL-EXPIRED',
        vehicleReg: 'PO-112-ZZ',
        accidentDate: today,
        description: 'Scraped side door against concrete pillar in underground garage.',
        estimatedDamage: '1600',
        attachmentName: 'door_scratch_photo.jpg'
      });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.customerName.trim() || !form.email.trim() || !form.policyNumber.trim() || !form.vehicleReg.trim()) {
      setFormError('Please complete all required customer, policy, and vehicle fields.');
      return;
    }
    if (!form.description.trim()) {
      setFormError('Please provide a brief description of the accident.');
      return;
    }
    if (!form.estimatedDamage || Number(form.estimatedDamage) <= 0) {
      setFormError('Estimated damage amount must be greater than 0.');
      return;
    }

    setFormError('');
    const createdId = onSubmitClaim(form);
    setLastSubmittedId(createdId);
    setForm({
      customerName: '',
      email: '',
      policyNumber: '',
      vehicleReg: '',
      accidentDate: new Date().toISOString().split('T')[0],
      description: '',
      estimatedDamage: '',
      attachmentName: ''
    });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      {/* Left 7 Columns: Accident Claim Submission Form */}
      <div className="lg:col-span-7 bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-6 bg-[#0F172A] text-white">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <h2 className="text-lg font-bold">Submit Motor Accident Claim</h2>
              <p className="text-xs text-slate-300 mt-0.5">
                Emits <code className="text-blue-300">claim_submitted</code> into the asynchronous Event Queue.
              </p>
            </div>
          </div>

          {/* Quick-Fill Demo Presets */}
          <div className="mt-4 pt-4 border-t border-slate-800">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 block mb-2">
              Lecturer Demonstration Presets (One-Click Fill):
            </span>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => applyPreset('valid')}
                className="px-3 py-1.5 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/40 text-emerald-200 text-xs font-semibold transition-colors"
              >
                1. Valid Standard Claim
              </button>
              <button
                type="button"
                onClick={() => applyPreset('flagged')}
                className="px-3 py-1.5 rounded-lg bg-amber-600/20 hover:bg-amber-600/30 border border-amber-500/40 text-amber-200 text-xs font-semibold transition-colors"
              >
                2. High-Value Flagged Claim
              </button>
              <button
                type="button"
                onClick={() => applyPreset('invalid')}
                className="px-3 py-1.5 rounded-lg bg-rose-600/20 hover:bg-rose-600/30 border border-rose-500/40 text-rose-200 text-xs font-semibold transition-colors"
              >
                3. Invalid Policy Claim
              </button>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {formError && (
            <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium flex items-center">
              <AlertTriangle className="w-4 h-4 mr-2 shrink-0" />
              {formError}
            </div>
          )}

          {lastSubmittedId && (
            <div className="p-3.5 rounded-lg bg-blue-50 border border-blue-200 text-blue-900 text-xs flex items-center justify-between">
              <div>
                <span className="font-bold">Claim {lastSubmittedId} Queued!</span> Watch the automated policy & risk handlers process it on the right.
              </div>
              <button
                type="button"
                onClick={() => onSelectClaim(lastSubmittedId)}
                className="px-2.5 py-1 rounded bg-blue-600 text-white font-semibold hover:bg-blue-700 shrink-0 ml-2"
              >
                Inspect Claim
              </button>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Policyholder Full Name *
              </label>
              <input
                type="text"
                value={form.customerName}
                onChange={(e) => setForm({ ...form, customerName: e.target.value })}
                placeholder="e.g., Jane Doe"
                className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Email Address *
              </label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="jane.doe@example.com"
                className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Policy Number *
              </label>
              <input
                type="text"
                value={form.policyNumber}
                onChange={(e) => setForm({ ...form, policyNumber: e.target.value })}
                placeholder="POL-123456"
                className="w-full px-3.5 py-2 text-sm font-mono border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <span className="text-[10px] text-slate-400">Valid: POL-xxxx (Not POL-EXPIRED)</span>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Vehicle Registration *
              </label>
              <input
                type="text"
                value={form.vehicleReg}
                onChange={(e) => setForm({ ...form, vehicleReg: e.target.value })}
                placeholder="WA-123-AB"
                className="w-full px-3.5 py-2 text-sm font-mono border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Accident Date *
              </label>
              <input
                type="date"
                value={form.accidentDate}
                onChange={(e) => setForm({ ...form, accidentDate: e.target.value })}
                className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Estimated Damage Amount (USD) *
              </label>
              <input
                type="number"
                min="1"
                value={form.estimatedDamage}
                onChange={(e) => setForm({ ...form, estimatedDamage: e.target.value })}
                placeholder="e.g., 4500"
                className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <span className="text-[10px] text-slate-400">&gt; 15,000 triggers Risk Screening flag</span>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Supporting Evidence (Simulated File)
              </label>
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={form.attachmentName}
                  onChange={(e) => setForm({ ...form, attachmentName: e.target.value })}
                  placeholder="accident_photo.jpg"
                  className="flex-1 px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <label className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold cursor-pointer flex items-center border border-slate-300">
                  <Upload className="w-3.5 h-3.5 mr-1" />
                  Browse
                  <input
                    type="file"
                    className="hidden"
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (f) setForm({ ...form, attachmentName: f.name });
                    }}
                  />
                </label>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Incident Description *
            </label>
            <textarea
              rows={3}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Describe how the accident occurred, road conditions, and visible vehicle damage..."
              className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <span className="text-[10px] text-slate-400">
              Keywords like "totaled", "stolen", "cash", or "no witnesses" trigger automated risk screening.
            </span>
          </div>

          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              className="inline-flex items-center space-x-2 px-6 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold shadow-sm transition-colors"
            >
              <Send className="w-4 h-4" />
              <span>Submit Claim & Emit Event</span>
            </button>
          </div>
        </form>
      </div>

      {/* Right 5 Columns: My Claims Tracker & Automated Customer Notifications */}
      <div className="lg:col-span-5 space-y-6">
        {/* Track Claims */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-slate-200 flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900">Submitted Claims Tracker</h3>
            <span className="text-xs text-slate-500">{claims.length} Total</span>
          </div>
          <div className="divide-y divide-slate-100 max-h-80 overflow-y-auto">
            {claims.map((c) => (
              <div key={c.id} className="p-4 hover:bg-slate-50 transition-colors">
                <div className="flex items-center justify-between mb-1">
                  <button
                    onClick={() => onSelectClaim(c.id)}
                    className="font-mono text-xs font-bold text-blue-600 hover:underline"
                  >
                    {c.id}
                  </button>
                  <StatusBadge status={c.status} />
                </div>
                <div className="text-xs font-semibold text-slate-800">
                  {c.customerName} · {formatCurrency(c.estimatedDamage)}
                </div>
                <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">{c.description}</p>

                {/* Quick Customer Document Upload */}
                <div className="mt-2.5 flex items-center space-x-2">
                  <input
                    type="text"
                    value={docInputs[c.id] || ''}
                    onChange={(e) => setDocInputs({ ...docInputs, [c.id]: e.target.value })}
                    placeholder="Add document filename..."
                    className="flex-1 px-2.5 py-1 text-xs border border-slate-300 rounded bg-white"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      onUploadEvidence(c.id, docInputs[c.id] || 'additional_evidence.pdf', c.customerName);
                      setDocInputs({ ...docInputs, [c.id]: '' });
                    }}
                    className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-900 text-white text-[11px] font-semibold flex items-center"
                  >
                    <Upload className="w-3 h-3 mr-1" />
                    Upload
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Customer Notification Inbox (Generated by CustomerNotificationHandler) */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-slate-200 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Bell className="w-4 h-4 text-blue-600" />
              <h3 className="text-sm font-bold text-slate-900">Customer Notifications</h3>
            </div>
            <span className="text-[11px] font-mono bg-purple-50 text-purple-700 border border-purple-200 px-2 py-0.5 rounded">
              customer_notified
            </span>
          </div>
          <div className="divide-y divide-slate-100 max-h-80 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-6 text-center text-xs text-slate-400">No notifications emitted yet.</div>
            ) : (
              notifications.map((n) => (
                <div key={n.id} className="p-4 hover:bg-slate-50">
                  <div className="flex items-center justify-between text-[11px] text-slate-500 mb-1">
                    <span className="font-semibold text-slate-700">{n.customerName} ({n.recipient})</span>
                    <span>{formatTime(n.timestamp)}</span>
                  </div>
                  <div className="text-xs font-bold text-slate-900">{n.subject}</div>
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">{n.message}</p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// VIEW 3: EVENT ARCHITECTURE & LIVE LOG INSPECTOR
// ============================================================================

function EventArchitectureView({
  events,
  engineState,
  queuedSnapshot,
  claimsCount,
  notificationsCount
}) {
  const [selectedEventType, setSelectedEventType] = useState('ALL');
  const [expandedIds, setExpandedIds] = useState({});

  const toggleExpand = (id) => {
    setExpandedIds((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const filteredEvents = useMemo(() => {
    if (selectedEventType === 'ALL') return events;
    return events.filter((e) => e.name === selectedEventType);
  }, [events, selectedEventType]);

  const pipelineStages = [
    {
      title: '1. Event Producers',
      subtitle: 'Customer Portal & Staff UI',
      metric: '5 Active Producers',
      active: false,
      icon: Send,
      detail: 'Emits claim_submitted, document_uploaded, adjuster_assigned, claim_approved/rejected, payment_processed'
    },
    {
      title: '2. Local Event Queue',
      subtitle: 'FIFO In-Memory Buffer',
      metric: `${queuedSnapshot.length} Queued`,
      active: queuedSnapshot.length > 0,
      icon: Layers,
      detail: 'Temporarily holds emitted events before asynchronous consumption'
    },
    {
      title: '3. Event Dispatcher',
      subtitle: 'Async Router & Loop',
      metric: engineState.isProcessing ? 'Dispatching...' : 'Idle / Ready',
      active: engineState.isProcessing,
      icon: Cpu,
      detail: engineState.activeEvent
        ? `Routing ${engineState.activeEvent.name}`
        : 'Distributes events to subscribed handlers'
    },
    {
      title: '4. Event Handlers',
      subtitle: '10 Decoupled Consumers',
      metric: engineState.activeHandlerName || '10 Registered',
      active: Boolean(engineState.activeHandlerName),
      icon: ShieldCheck,
      detail: 'PolicyVerification, RiskScreening, Decision, Payment & Notification Handlers'
    },
    {
      title: '5. State & Event Log',
      subtitle: 'LocalStorage Persistence',
      metric: `${claimsCount} Claims · ${notificationsCount} Alerts`,
      active: false,
      icon: Database,
      detail: `${events.length} immutable audit log entries stored`
    }
  ];

  return (
    <div className="space-y-6">
      {/* Interactive Visual Pipeline Diagram */}
      <div className="bg-[#0F172A] text-white rounded-xl p-6 border border-slate-800 shadow-md">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
          <div>
            <h2 className="text-base font-bold text-white flex items-center">
              <Activity className="w-5 h-5 mr-2 text-blue-400" />
              Live Event-Driven Architecture Pipeline
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Real-time visualization of events flowing through InsureFlow&apos;s local message bus.
            </p>
          </div>
          <span className="text-xs font-mono px-3 py-1 rounded-full bg-slate-800 border border-slate-700 text-blue-300">
            Step Latency: 320ms (Visualized)
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-3 items-stretch">
          {pipelineStages.map((stage, idx) => {
            const Icon = stage.icon;
            return (
              <div key={stage.title} className="relative flex flex-col">
                <div
                  className={`flex-1 p-4 rounded-xl border transition-all ${
                    stage.active
                      ? 'bg-blue-900/40 border-blue-400 shadow-lg shadow-blue-500/20 scale-[1.02]'
                      : 'bg-[#1E293B] border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div
                      className={`p-2 rounded-lg ${
                        stage.active ? 'bg-blue-500 text-white animate-pulse' : 'bg-slate-800 text-blue-400'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                    </div>
                    {idx < pipelineStages.length - 1 && (
                      <ArrowRight className="w-4 h-4 text-slate-500 hidden md:block" />
                    )}
                  </div>
                  <div className="text-xs font-bold text-white">{stage.title}</div>
                  <div className="text-[11px] text-slate-400">{stage.subtitle}</div>
                  <div className="mt-3 pt-2 border-t border-slate-700/80">
                    <span
                      className={`text-xs font-mono font-bold ${
                        stage.active ? 'text-amber-300' : 'text-blue-300'
                      }`}
                    >
                      {stage.metric}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1.5 leading-snug">{stage.detail}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Filterable Event Log Inspector */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-base font-bold text-slate-900">Immutable Event Activity Log</h3>
            <p className="text-xs text-slate-500">
              Click any event row to inspect its JSON payload, unique ID, producer, and assigned handler.
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-xs font-semibold text-slate-600">Filter Event:</span>
            <select
              value={selectedEventType}
              onChange={(e) => setSelectedEventType(e.target.value)}
              className="text-xs font-mono bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="ALL">ALL EVENTS ({events.length})</option>
              {EVENT_TYPES.map((type) => (
                <option key={type} value={type}>
                  {type} ({events.filter((e) => e.name === type).length})
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="divide-y divide-slate-200">
          {filteredEvents.map((evt) => {
            const isExpanded = !!expandedIds[evt.id];
            return (
              <div key={evt.id} className="hover:bg-slate-50/80 transition-colors">
                <button
                  onClick={() => toggleExpand(evt.id)}
                  className="w-full px-5 py-3.5 text-left flex flex-wrap items-center justify-between gap-3"
                >
                  <div className="flex items-center space-x-3">
                    {isExpanded ? (
                      <ChevronDown className="w-4 h-4 text-slate-400" />
                    ) : (
                      <ChevronRight className="w-4 h-4 text-slate-400" />
                    )}
                    <span className="font-mono text-xs font-semibold text-slate-500">{evt.id}</span>
                    <EventBadge eventName={evt.name} />
                    {evt.claimId && (
                      <span className="font-mono text-xs text-blue-600 bg-blue-50 px-2 py-0.5 rounded border border-blue-100">
                        {evt.claimId}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center space-x-4 text-xs">
                    <span className="text-slate-500 hidden md:inline">
                      Producer: <strong className="text-slate-700">{evt.producer}</strong> → Handler:{' '}
                      <strong className="text-slate-700">{evt.handler || 'Pending'}</strong>
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[11px] font-bold uppercase ${
                        evt.status === 'processed'
                          ? 'bg-emerald-100 text-emerald-700'
                          : evt.status === 'processing'
                          ? 'bg-amber-100 text-amber-700'
                          : evt.status === 'failed'
                          ? 'bg-rose-100 text-rose-700'
                          : 'bg-slate-200 text-slate-700'
                      }`}
                    >
                      {evt.status}
                    </span>
                    <span className="text-slate-400 font-mono text-[11px]">{formatTime(evt.timestamp)}</span>
                  </div>
                </button>

                {isExpanded && (
                  <div className="px-12 pb-4">
                    <div className="bg-[#0F172A] text-slate-100 p-4 rounded-lg font-mono text-xs overflow-x-auto border border-slate-800">
                      <div className="text-slate-400 mb-1">
                        // Event Envelope & JSON Payload ({evt.timestamp})
                      </div>
                      <pre className="leading-relaxed text-blue-200">
                        {JSON.stringify(
                          {
                            eventId: evt.id,
                            eventName: evt.name,
                            timestamp: evt.timestamp,
                            status: evt.status,
                            producer: evt.producer,
                            consumerHandler: evt.handler,
                            payload: evt.payload
                          },
                          null,
                          2
                        )}
                      </pre>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// VIEW 4: EDP DOCUMENTATION (ARCHITECTURE, EVENTS CATALOG & DEMO SCRIPT)
// ============================================================================

function DocumentationView() {
  const eventDocs = [
    {
      name: 'claim_submitted',
      producer: 'CustomerPortalProducer',
      handler: 'PolicyVerificationHandler',
      purpose: 'Initiates the claims automation lifecycle when a policyholder files a new accident report.',
      next: 'Triggers policy validation rules; emits policy_verified or policy_verification_failed.'
    },
    {
      name: 'policy_verified',
      producer: 'PolicyVerificationHandler',
      handler: 'RiskScreeningHandler',
      purpose: 'Confirms the policy number follows POL-XXXXXX and is not expired or invalid.',
      next: 'Triggers automated fraud/risk screening rules on damage amount, keywords, and dates.'
    },
    {
      name: 'policy_verification_failed',
      producer: 'PolicyVerificationHandler',
      handler: 'PolicyRejectionHandler',
      purpose: 'Signals that the policy does not exist or is inactive.',
      next: 'Sets claim status to Rejected (Invalid Policy) and emits customer_notified.'
    },
    {
      name: 'document_uploaded',
      producer: 'CustomerPortalProducer / StaffDashboardProducer',
      handler: 'DocumentEvidenceHandler',
      purpose: 'Records supporting photos, police reports, or repair quotes onto the claim file.',
      next: 'Appends file metadata to claim documents and logs a timeline entry.'
    },
    {
      name: 'claim_flagged',
      producer: 'RiskScreeningHandler',
      handler: 'FlaggedEscalationHandler',
      purpose: 'Flags high-value claims (>15,000), suspicious keywords, or future accident dates.',
      next: 'Marks claim as Flagged for Review and emits customer_notified.'
    },
    {
      name: 'adjuster_assigned',
      producer: 'StaffDashboardProducer',
      handler: 'AdjusterAssignmentHandler',
      purpose: 'Assigns a licensed claims adjuster to investigate and evaluate the claim.',
      next: 'Updates assignedAdjuster field and emits customer_notified.'
    },
    {
      name: 'claim_approved',
      producer: 'StaffDashboardProducer',
      handler: 'ClaimDecisionHandler',
      purpose: 'Records formal staff approval of the claim settlement amount.',
      next: 'Sets status to Approved (unlocking payment disbursement) and emits customer_notified.'
    },
    {
      name: 'claim_rejected',
      producer: 'StaffDashboardProducer',
      handler: 'ClaimDecisionHandler',
      purpose: 'Records staff denial of a claim along with a mandatory explanation.',
      next: 'Sets status to Rejected (blocking payments) and emits customer_notified.'
    },
    {
      name: 'customer_notified',
      producer: 'Multiple Handlers',
      handler: 'CustomerNotificationHandler',
      purpose: 'Delivers asynchronous status alerts to the policyholder inbox.',
      next: 'Persists notification record visible in the Customer Portal.'
    },
    {
      name: 'payment_processed',
      producer: 'StaffDashboardProducer',
      handler: 'PaymentSettlementHandler',
      purpose: 'Executes simulated settlement payout for Approved claims only.',
      next: 'Transitions claim to Paid, records payout timestamp, and emits customer_notified.'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Architecture Overview Card */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-4">
        <div className="flex items-center space-x-2 text-blue-700 font-bold text-sm uppercase tracking-wider">
          <BookOpen className="w-4 h-4" />
          <span>University EDP Project Reference</span>
        </div>
        <h2 className="text-xl font-bold text-slate-900">
          InsureFlow — Event-Driven Architecture Specification
        </h2>
        <p className="text-sm text-slate-600 leading-relaxed">
          InsureFlow demonstrates loosely coupled <strong>Event-Driven Programming (EDP)</strong>. Instead of UI buttons directly mutating business state in a single monolithic function, user actions act as <strong>Event Producers</strong> that publish immutable event envelopes into a <strong>Local Event Queue</strong>. An asynchronous <strong>Event Dispatcher</strong> consumes events and routes them to specialized, independent <strong>Event Handlers</strong>.
        </p>

        <div className="bg-[#0F172A] text-blue-200 p-4 rounded-xl font-mono text-xs overflow-x-auto">
          <div className="text-slate-400 mb-2">// Architecture Flow Diagram</div>
          <pre>{`[Event Producers] ──▶ [LocalEventQueue] ──▶ [EventDispatcher] ──▶ [Independent Handlers]
   │                        │                       │                        │
   ├─ Customer Portal       ├─ FIFO Buffer          ├─ Async Step Loop       ├─ PolicyVerificationHandler
   └─ Staff Dashboard       └─ Status: queued       └─ Error Boundary        ├─ RiskScreeningHandler
                                                                             ├─ ClaimDecisionHandler
                                                                             ├─ PaymentSettlementHandler
                                                                             └─ CustomerNotificationHandler
                                                                                      │
                                                                                      ▼
                                                                     [LocalStorage DB & Event Log]`}</pre>
        </div>
      </div>

      {/* Lecturer Demonstration Sequence */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 space-y-3">
        <h3 className="text-base font-bold text-blue-950 flex items-center">
          <Play className="w-4 h-4 mr-2 text-blue-600" />
          Recommended 3-Minute Lecturer Demonstration Sequence
        </h3>
        <ol className="list-decimal list-inside space-y-2 text-xs sm:text-sm text-blue-900">
          <li>
            <strong>Happy Path & Automated Approval:</strong> Go to <em>Customer Portal</em>, click{' '}
            <strong>&ldquo;1. Valid Standard Claim&rdquo;</strong>, and submit. Observe{' '}
            <code>claim_submitted</code> → <code>policy_verified</code> → <code>customer_notified</code>.
          </li>
          <li>
            <strong>Automated Risk Flagging:</strong> Click <strong>&ldquo;2. High-Value Flagged Claim&rdquo;</strong>{' '}
            and submit. Because damage exceeds 15,000 and contains &ldquo;stolen&rdquo; / &ldquo;no witnesses&rdquo;, the{' '}
            <code>RiskScreeningHandler</code> emits <code>claim_flagged</code>.
          </li>
          <li>
            <strong>Invalid Policy Auto-Rejection:</strong> Click <strong>&ldquo;3. Invalid Policy Claim&rdquo;</strong>{' '}
            (<code>POL-EXPIRED</code>) and submit. Observe <code>policy_verification_failed</code> immediately rejecting the claim.
          </li>
          <li>
            <strong>Staff Review & Payment Guardrails:</strong> Open the <em>Staff Dashboard</em>, select a claim, assign an adjuster, approve it, and observe how <strong>Record Payment</strong> is disabled until status becomes <code>Approved</code>.
          </li>
          <li>
            <strong>Payload Inspection & Persistence:</strong> Open <em>Event Architecture &amp; Log</em> to expand JSON payloads, then refresh the browser page to prove state persists across reloads.
          </li>
        </ol>
      </div>

      {/* Complete 10-Event Reference Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-200">
          <h3 className="text-base font-bold text-slate-900">Event Catalog (All 10 Domain Events)</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold uppercase text-slate-500">
                <th className="py-3 px-4">Event Name</th>
                <th className="py-3 px-4">Producer</th>
                <th className="py-3 px-4">Consumer Handler</th>
                <th className="py-3 px-4">Purpose &amp; Downstream Effect</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {eventDocs.map((ev) => (
                <tr key={ev.name} className="hover:bg-slate-50">
                  <td className="py-3 px-4 align-top">
                    <EventBadge eventName={ev.name} />
                  </td>
                  <td className="py-3 px-4 font-mono text-slate-700 align-top">{ev.producer}</td>
                  <td className="py-3 px-4 font-mono text-blue-700 align-top">{ev.handler}</td>
                  <td className="py-3 px-4 text-slate-600 align-top">
                    <div className="font-medium text-slate-800">{ev.purpose}</div>
                    <div className="text-slate-500 mt-0.5">{ev.next}</div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// CLAIM DETAIL MODAL / SLIDE-OVER DRAWER
// ============================================================================

function ClaimDetailModal({
  claim,
  events,
  onClose,
  onAssignAdjuster,
  onApproveClaim,
  onRejectClaim,
  onProcessPayment,
  onUploadEvidence
}) {
  const [selectedAdjuster, setSelectedAdjuster] = useState(claim.assignedAdjuster || ADJUSTERS[0].name);
  const [rejectReason, setRejectReason] = useState('');
  const [showRejectBox, setShowRejectBox] = useState(false);
  const [newDocName, setNewDocName] = useState('');

  const isTerminalRejected = claim.status.startsWith('Rejected');
  const isPaid = claim.status === 'Paid';
  const canApprove = !isTerminalRejected && !isPaid && claim.status !== 'Approved';
  const canReject = !isTerminalRejected && !isPaid;
  const canPay = claim.status === 'Approved';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-end bg-slate-900/60 backdrop-blur-xs">
      <div className="w-full max-w-2xl h-full bg-white shadow-2xl flex flex-col overflow-hidden animate-slide-left">
        {/* Drawer Header */}
        <div className="px-6 py-4 bg-[#0F172A] text-white flex items-center justify-between">
          <div>
            <div className="flex items-center space-x-2.5">
              <span className="font-mono text-base font-bold text-blue-300">{claim.id}</span>
              <StatusBadge status={claim.status} />
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Policy <span className="font-mono text-slate-200">{claim.policyNumber}</span> · Vehicle{' '}
              <span className="font-mono text-slate-200">{claim.vehicleReg}</span>
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Risk Flag Alert Banner if Flagged */}
          {claim.flagReasons && claim.flagReasons.length > 0 && (
            <div className="p-4 rounded-xl bg-amber-50 border border-amber-300 text-amber-900">
              <div className="flex items-center font-bold text-xs uppercase tracking-wider text-amber-800 mb-1.5">
                <AlertTriangle className="w-4 h-4 mr-1.5 text-amber-600" />
                Automated Risk Screening Flags
              </div>
              <ul className="list-disc list-inside text-xs space-y-1">
                {claim.flagReasons.map((r, i) => (
                  <li key={i}>{r}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Rejection Reason Banner */}
          {claim.rejectionReason && (
            <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-900 text-xs">
              <strong className="block uppercase tracking-wider text-rose-800 mb-1">
                Rejection Reason:
              </strong>
              {claim.rejectionReason}
            </div>
          )}

          {/* Claim Summary Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs">
            <div>
              <span className="text-slate-500 block">Policyholder</span>
              <span className="font-bold text-slate-900">{claim.customerName}</span>
            </div>
            <div>
              <span className="text-slate-500 block">Contact Email</span>
              <span className="font-medium text-slate-800">{claim.email}</span>
            </div>
            <div>
              <span className="text-slate-500 block">Accident Date</span>
              <span className="font-semibold text-slate-800">{claim.accidentDate}</span>
            </div>
            <div>
              <span className="text-slate-500 block">Estimated Damage</span>
              <span className="font-bold text-blue-700 text-sm">
                {formatCurrency(claim.estimatedDamage)}
              </span>
            </div>
            <div>
              <span className="text-slate-500 block">Assigned Adjuster</span>
              <span className="font-semibold text-slate-800">
                {claim.assignedAdjuster || 'Unassigned'}
              </span>
            </div>
            <div>
              <span className="text-slate-500 block">Settlement Payout</span>
              <span className="font-bold text-emerald-700">
                {claim.paymentAmount ? `${formatCurrency(claim.paymentAmount)} (Paid)` : 'Not Disbursed'}
              </span>
            </div>
          </div>

          {/* Incident Description */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
              Accident Description
            </h4>
            <p className="text-sm text-slate-700 bg-white p-3.5 rounded-lg border border-slate-200 leading-relaxed">
              {claim.description}
            </p>
          </div>

          {/* Staff Event Producer Controls */}
          <div className="p-4 rounded-xl border border-blue-200 bg-blue-50/40 space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-blue-900">
              Staff Workflow Actions (Event Producers)
            </h4>

            {/* Assign Adjuster */}
            <div className="flex flex-col sm:flex-row gap-2">
              <select
                value={selectedAdjuster}
                onChange={(e) => setSelectedAdjuster(e.target.value)}
                disabled={isTerminalRejected || isPaid}
                className="flex-1 text-xs bg-white border border-slate-300 rounded-lg px-3 py-2 font-medium text-slate-800 disabled:opacity-50"
              >
                {ADJUSTERS.map((adj) => (
                  <option key={adj.id} value={adj.name}>
                    {adj.name} — {adj.specialty}
                  </option>
                ))}
              </select>
              <button
                type="button"
                disabled={isTerminalRejected || isPaid}
                onClick={() => onAssignAdjuster(claim.id, selectedAdjuster)}
                className="px-4 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 disabled:opacity-40 text-white text-xs font-semibold flex items-center justify-center"
              >
                <UserCheck className="w-3.5 h-3.5 mr-1.5" />
                Assign Adjuster
              </button>
            </div>

            {/* Approve / Reject / Record Payment Buttons */}
            <div className="flex flex-wrap gap-2 pt-1">
              <button
                type="button"
                disabled={!canApprove}
                onClick={() => onApproveClaim(claim.id, claim.estimatedDamage)}
                className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-semibold flex items-center"
              >
                <CheckCircle2 className="w-3.5 h-3.5 mr-1.5" />
                Approve Claim
              </button>

              <button
                type="button"
                disabled={!canReject}
                onClick={() => setShowRejectBox((v) => !v)}
                className="px-4 py-2 rounded-lg bg-rose-600 hover:bg-rose-700 disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-semibold flex items-center"
              >
                <XCircle className="w-3.5 h-3.5 mr-1.5" />
                Reject Claim
              </button>

              <button
                type="button"
                disabled={!canPay}
                onClick={() => onProcessPayment(claim)}
                title={
                  canPay
                    ? 'Disburse settlement payment'
                    : 'Payment is strictly disabled unless claim status is Approved'
                }
                className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-semibold flex items-center ml-auto"
              >
                <DollarSign className="w-3.5 h-3.5 mr-1.5" />
                {isPaid ? 'Payment Completed' : 'Record Payment'}
              </button>
            </div>

            {!canPay && !isPaid && (
              <p className="text-[11px] text-slate-500">
                * Payment Guardrail: <strong>Record Payment</strong> remains locked until the claim is in{' '}
                <code>Approved</code> status.
              </p>
            )}

            {/* Rejection Reason Form */}
            {showRejectBox && canReject && (
              <div className="pt-2 border-t border-blue-200 flex flex-col sm:flex-row gap-2">
                <input
                  type="text"
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  placeholder="Enter rejection reason (e.g., Damage pre-existed policy inception)..."
                  className="flex-1 px-3 py-2 text-xs bg-white border border-rose-300 rounded-lg"
                />
                <button
                  type="button"
                  onClick={() => {
                    if (!rejectReason.trim()) return;
                    onRejectClaim(claim.id, rejectReason);
                    setShowRejectBox(false);
                    setRejectReason('');
                  }}
                  className="px-4 py-2 rounded-lg bg-rose-700 hover:bg-rose-800 text-white text-xs font-semibold"
                >
                  Confirm Rejection
                </button>
              </div>
            )}
          </div>

          {/* Evidence Documents Section */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Uploaded Evidence ({claim.documents.length})
              </h4>
            </div>
            <div className="space-y-2 mb-3">
              {claim.documents.length === 0 ? (
                <p className="text-xs text-slate-400 italic">No supporting files attached yet.</p>
              ) : (
                claim.documents.map((doc) => (
                  <div
                    key={doc.id}
                    className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-xs"
                  >
                    <div className="flex items-center space-x-2">
                      <FileCheck className="w-4 h-4 text-blue-600" />
                      <span className="font-mono font-medium text-slate-800">{doc.name}</span>
                      <span className="text-slate-400">({doc.size})</span>
                    </div>
                    <span className="text-[11px] text-slate-400">{formatTime(doc.uploadedAt)}</span>
                  </div>
                ))
              )}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={newDocName}
                onChange={(e) => setNewDocName(e.target.value)}
                placeholder="e.g., adjuster_inspection_report.pdf"
                className="flex-1 px-3 py-1.5 text-xs border border-slate-300 rounded-lg"
              />
              <button
                type="button"
                onClick={() => {
                  onUploadEvidence(claim.id, newDocName || 'adjuster_notes.pdf', 'Claims Staff');
                  setNewDocName('');
                }}
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-900 text-white text-xs font-semibold flex items-center"
              >
                <Upload className="w-3.5 h-3.5 mr-1.5" />
                Upload Additional Evidence
              </button>
            </div>
          </div>

          {/* Claim Activity Timeline */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
              Claim Processing Timeline
            </h4>
            <div className="space-y-3 border-l-2 border-blue-200 ml-2 pl-4">
              {claim.timeline.map((item, idx) => (
                <div key={idx} className="relative">
                  <span
                    className={`w-2.5 h-2.5 rounded-full absolute -left-[21px] top-1 ${
                      item.type === 'error'
                        ? 'bg-rose-500'
                        : item.type === 'warning'
                        ? 'bg-amber-500'
                        : item.type === 'success'
                        ? 'bg-emerald-500'
                        : 'bg-blue-500'
                    }`}
                  />
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-800">{item.title}</span>
                    <span className="text-[11px] text-slate-400 font-mono">{formatTime(item.time)}</span>
                  </div>
                  <p className="text-xs text-slate-600 mt-0.5">{item.detail}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Events Associated With This Claim */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
              Emitted Events for {claim.id} ({events.length})
            </h4>
            <div className="flex flex-wrap gap-1.5">
              {events.map((e) => (
                <EventBadge key={e.id} eventName={e.name} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}