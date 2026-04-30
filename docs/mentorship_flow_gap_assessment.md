# Mentozy Mentorship Flow Gap Assessment

## Required Flow (as requested)
1. Student books a mentor session.
2. Mentor accepts the session without manual data handoffs.
3. Student must pay through Razorpay before attending.
4. Payment should auto-split 92% mentor / 8% platform.
5. After successful payment, a Join button appears.
6. Session should run on Mentozy-owned WebRTC (not third-party meeting links).

## Current State vs Required

### 1) Student booking
- **Status:** Implemented (base flow).
- The student can choose date/time/duration and submit booking details.
- **Gap:** no hard coupling between selected slot and conflict-safe backend orchestration yet (still basic workflow).

### 2) Mentor acceptance without manual data
- **Status:** Partially implemented.
- Mentor acceptance currently asks for a meeting link and optional payment link in the modal.
- **Gap:** this is still manual and relies on external meeting URLs.
- **Needed:** acceptance should only update booking status and trigger system-generated payment order + session room metadata.

### 3) Razorpay payment before class
- **Status:** Partially implemented.
- There is a payment page and booking status transition helper to `confirmed` after payment.
- **Gap:** payment is not yet tightly bound to booking lifecycle with mandatory gate, signature verification, and webhook-based finalization.

### 4) Auto split 92% mentor / 8% platform
- **Status:** Not implemented end-to-end.
- **Gap:** no verified payout ledger/settlement pipeline that records commission split and disbursal state per transaction.
- **Needed:** Razorpay Route/Transfers (or equivalent) + internal immutable ledger + reconciliation jobs + payout failure handling.

### 5) Join button only after payment
- **Status:** Partially implemented conceptually.
- **Gap:** UI/business-rule gate is not universally enforced by payment-verified booking state.
- **Needed:** only show join CTA when booking state is `confirmed` (or `paid`) and session time window is valid.

### 6) Native WebRTC (no 3rd-party meeting links)
- **Status:** Prototype-level only.
- There is a native modal with local media preview controls.
- **Gap:** no full peer connection signaling, room presence, TURN/STUN hardening, reconnect logic, moderation, recording policy, or production QoS controls.
- **Needed:** production WebRTC stack with signaling server + auth-scoped room joins + observability.

## Work Left to Complete Platform (practical estimate)

## A. Core Product Flow Completion
- Replace manual acceptance inputs (meeting/payment links) with system orchestration.
- Introduce strict booking state machine:
  - `requested -> accepted -> payment_pending -> paid/confirmed -> in_session -> completed`.
- Add server-side validation for state transitions and actor permissions.

**Estimate:** 4-6 engineering days.

## B. Payments & Revenue Split (critical)
- Booking-scoped Razorpay order creation.
- Webhook endpoint for payment success/failure/refund with signature verification.
- Server-side idempotency keys.
- 92/8 split settlement logic and ledger entries.
- Mentor balance, pending payouts, payout status timeline.
- Refund and dispute handling paths.

**Estimate:** 8-12 engineering days.

## C. Native WebRTC Productionization (critical)
- Signaling service (WebSocket/Supabase Realtime channel strategy).
- SDP/ICE negotiation and peer lifecycle management.
- TURN/STUN infra (NAT traversal reliability).
- Session auth tokens and room authorization.
- Join gating by paid status and session window.
- Metrics: join success rate, packet loss, reconnect rate.

**Estimate:** 10-15 engineering days.

## D. UX & Operations Hardening
- Student and mentor timeline with clear status chips and next action.
- Notification pipeline (acceptance, payment pending, payment success, class reminder).
- Admin operations screen for booking/payment/session audits.
- Error playbooks (payment failed, payout failed, WebRTC drop).

**Estimate:** 5-7 engineering days.

## E. QA, Security, Release
- Integration tests for booking-payment-session path.
- Webhook replay/idempotency tests.
- Role-based access and RLS audit.
- Load test for concurrent live sessions.

**Estimate:** 6-8 engineering days.

## Total Remaining Work
- **Engineering:** ~33 to 48 focused engineering days.
- With one full-stack engineer + part-time QA/designer, realistic delivery is **6 to 10 weeks**.
- With 2 engineers working in parallel, can be compressed to **4 to 6 weeks**.

## Recommended implementation order
1. Booking state machine + acceptance cleanup (remove manual meeting link requirement).
2. Razorpay booking-coupled payment + webhook verification.
3. Split ledger and payout settlement.
4. Payment-gated Join CTA.
5. WebRTC productionization and reliability.
6. QA/security hardening + staged rollout.
