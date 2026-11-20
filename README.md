# InsureFlow — Event-Driven Insurance Claims Automation

> **Educational Simulation Notice:** InsureFlow is a university Event-Driven Programming (EDP) demonstration project. All policy validation rules, risk screening thresholds, and payout references are simulated for educational purposes.

## Features
- **Custom Event-Driven Architecture:** Local FIFO Event Queue, Asynchronous Event Dispatcher, 10 strongly-typed domain events, and decoupled Event Handlers.
- **Customer Portal:** Submit car accident claims, upload supporting evidence, track real-time claim status, and receive automated notifications.
- **Staff Dashboard:** Real-time KPI metrics, search/filter controls, adjuster assignment, claim approval/rejection, payment guardrails (approved claims only), and a live Event Activity Log.
- **Local Persistence:** Data persists across server restarts via JSON storage (backend/data.json) and browser localStorage.

## Tech Stack
- **Frontend:** React, Vite, Tailwind CSS, Lucide Icons
- **Backend:** Node.js, Express, TypeScript, Vitest

## Installation & Running Locally
1. Install & Start Frontend (Root): npm install && npm run dev
2. Install & Start Backend (Terminal 2): cd backend && npm install && npm run dev
3. Run Backend Unit Tests: cd backend && npm test

## Lecturer Demonstration Workflow
1. Valid Claim Flow: Submit a claim with Policy POL-8841 and Amount $3,200. Observe claim_submitted -> policy_verified -> customer_notified.
2. Risk Flagging Flow: Submit a claim with Amount $15,500. Observe claim_flagged trigger automatically due to the > $10,000 rule.
3. Invalid Policy Flow: Submit a claim with Policy INVALID-99. Observe policy_verification_failed automatically reject the claim.
4. Staff Resolution & Payment Guardrail: Assign an adjuster, approve the valid claim, and trigger payment_processed. Attempt to pay a rejected or pending claim to verify the guardrail blocks unauthorized payouts.
