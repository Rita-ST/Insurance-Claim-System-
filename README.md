# InsureFlow – Event-Driven Insurance Claims Automation

**A Node.js-based Event-Driven Programming (EDP) project demonstrating automated insurance claim processing through event producers, a local event queue, an event dispatcher, and independent event handlers.**

## Project Overview

InsureFlow is a car insurance claims management and automation system designed to demonstrate the principles of Event-Driven Programming.

The application allows customers to submit insurance claims, provide supporting documentation, and monitor claim progress. Insurance staff can review submitted claims, assign adjusters, approve or reject claims, and process approved payments.

Instead of relying on direct function calls between every component, InsureFlow uses an event-driven architecture. When an action occurs, an event is generated, placed into an event queue, and processed by the appropriate event handlers.

## Lecturer Demonstration Workflow
1. **Valid Claim Flow:** Submit a claim with Policy `POL-8841` and Amount `12 500 zł`. Observe `claim_submitted` -> `policy_verified` -> `customer_notified`.
2. **Risk Flagging Flow:** Submit a claim with Amount `55 000 zł`. Observe `claim_flagged` trigger automatically due to the `> 40 000 zł` rule.
3. **Invalid Policy Flow:** Submit a claim with Policy `INVALID-99`. Observe `policy_verification_failed` automatically reject the claim.
4. **Staff Resolution & Payment Guardrail:** Assign an adjuster, approve the valid claim, and trigger `payment_processed`. Attempt to pay a rejected or pending claim to verify the guardrail blocks unauthorized payouts.

## Producer 2: Vehicle Accident & GPS Location Sensor (`producer/accident-sensor/`)
- **Interactive Simulation:** [https://wokwi.com/projects/481222649888585729](https://wokwi.com/projects/481222649888585729)
- **Edge-Latched G-Force Potentiometer (GPIO 34):** Fires `accident.detected` once when impact >= 75%, resetting only below 65% (hysteresis prevents duplicate alerts).
- **Manual SOS Interrupt (GPIO 14):** `FALLING` edge hardware interrupt with 300ms debounce.
- **Telemetry Payload:** Emits `vehicleId` (`CAR-PL-409`), `impactSeverity`, and Warsaw GPS (`52.2297, 21.0122`), triggering an automated claim submission in InsureFlow.
