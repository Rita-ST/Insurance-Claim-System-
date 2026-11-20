# InsureFlow — Event-Driven Car Insurance Claims System

- **Frontend Web App (Customer & Staff Portals):** `http://localhost:5173`
- **Backend Event-Driven API:** `http://localhost:4000`
- **GitHub Repository:** [Rita-ST/Insurance-Claim-System-](https://github.com/Rita-ST/Insurance-Claim-System-)

> **Educational Simulation Notice:** InsureFlow is a university Event-Driven Programming (EDP) demonstration project. All policy validation rules, risk screening thresholds, and payout references are simulated for educational purposes.

## Features
- **Custom Event-Driven Architecture:** Local FIFO Event Queue, Asynchronous Event Dispatcher, 10 strongly-typed domain events, and decoupled Event Handlers.
- **Customer Portal:** Submit car accident claims in PLN (zł), upload supporting evidence, track real-time claim status, and receive automated notifications.
- **Staff Dashboard:** Real-time KPI metrics, search/filter controls, adjuster assignment, claim approval/rejection, payment guardrails (approved claims only), and a live Event Activity Log.
- **Local Persistence:** Data persists across server restarts via JSON storage (`backend/data.json`) and browser `localStorage`.

## Tech Stack
- **Frontend:** React, Vite, Tailwind CSS, Lucide Icons
- **Backend:** Node.js, Express, TypeScript, Vitest

## Installation & Running Locally
1. **Install & Start Frontend (Root):** `npm install && npm run dev` -> open `http://localhost:5173`
2. **Install & Start Backend (Terminal 2):** `cd backend && npm install && npm run dev` -> runs on `http://localhost:4000`
3. **Run Backend Unit Tests:** `cd backend && npm test`

## Lecturer Demonstration Workflow
1. **Valid Claim Flow:** Submit a claim with Policy `POL-8841` and Amount `12 500 zł`. Observe `claim_submitted` -> `policy_verified` -> `customer_notified`.
2. **Risk Flagging Flow:** Submit a claim with Amount `55 000 zł`. Observe `claim_flagged` trigger automatically due to the `> 40 000 zł` rule.
3. **Invalid Policy Flow:** Submit a claim with Policy `INVALID-99`. Observe `policy_verification_failed` automatically reject the claim.
4. **Staff Resolution & Payment Guardrail:** Assign an adjuster, approve the valid claim, and trigger `payment_processed`. Attempt to pay a rejected or pending claim to verify the guardrail blocks unauthorized payouts.
