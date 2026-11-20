# InsureFlow Domain Events Catalog

| Event Name | Purpose | Producer | Handler(s) | Post-Processing Action |
| :--- | :--- | :--- | :--- | :--- |
| claim_submitted | Initiates claim lifecycle | Customer Form / API | Policy & Risk Handler | Emits policy_verified or policy_verification_failed, and optionally claim_flagged |
| policy_verified | Confirms policy format (POL-XXXX) | Policy Handler | Claim Status Handler | Moves status to Under Review and emits customer_notified |
| policy_verification_failed | Flags invalid policy numbers | Policy Handler | Rejection Handler | Moves status to Rejected and emits customer_notified |
| document_uploaded | Attaches accident evidence | Customer / Staff UI | Document Handler | Appends file metadata to claim record |
| claim_flagged | Flags high-value (>$10k) or brief claims | Risk Handler | Risk Status Handler | Sets status to Flagged with audit reason |
| adjuster_assigned | Assigns a specialist to review | Staff Dashboard | Assignment Handler | Saves adjuster name and emits customer_notified |
| claim_approved | Approves claim for payout | Staff Dashboard | Approval Handler | Sets status to Approved and emits customer_notified |
| claim_rejected | Denies claim after review | Staff Dashboard | Rejection Handler | Sets status to Rejected and emits customer_notified |
| customer_notified | Logs customer status alerts | Multiple Handlers | Notification Handler | Persists alert to customer notification inbox |
| payment_processed | Records payout on approved claims | Staff Payment Action | Payment Handler | Sets status to Paid, records ref, emits customer_notified |
