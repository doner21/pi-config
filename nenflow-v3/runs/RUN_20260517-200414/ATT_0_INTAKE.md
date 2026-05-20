---
schema_version: 1
artifact_type: INTAKE
role: ORCHESTRATOR
run_id: RUN_20260517-200414
project_cwd: C:\Users\doner\ramen-don
created_at: 2026-05-17
clarification_needed: false
recommended_next_step: RESEARCH
context_saturation_estimate: 18
context_handoff_threshold_percent: 40
context_handoff_threshold_source: user_prompt
threshold_source: user_prompt
normal_output_path: C:\Users\doner\.pi\agent\nenflow-v3\runs\RUN_20260517-200414\ATT_0_INTAKE.md
continuation_path_if_needed: C:\Users\doner\.pi\agent\nenflow-v3\runs\RUN_20260517-200414\ATT_0_CONTINUATION_INTAKE_1.md
---

# ATT_0_INTAKE — Ecological Intake

## Raw Prompt

```markdown
# Restaurant Booking System Build Prompt

## Project intent

Build and integrate a restaurant booking system into an already existing restaurant website.

The system does not require payments.

The system must allow customers to:

1. Choose party size.
2. Choose date.
3. Choose available time.
4. Choose a table or seating area where applicable.
5. Enter contact details.
6. Confirm the booking.
7. Receive a booking confirmation email.

For this iteration, do not implement newsletter signup.

However, design the backend so that newsletter integration can be added cleanly in the next iteration. Do not mix newsletter logic into booking-confirmation logic.

---

## Current prototype context

The current frontend design direction already includes:

- A booking details screen with party size, date, and time selection.
- A table selection screen with a floor plan, available / selected / unavailable table states, and a reservation summary.
- A confirmation screen showing the confirmed booking details and confirmation number.

The build should preserve the existing site aesthetic and integrate into the current website rather than feel like a separate application.

---

## Core attractor

The system should feel simple and calm to the customer, but strict and reliable underneath.

Customer-facing attractor:

> “I can easily reserve a table, understand what I have chosen, and receive confirmation.”

Backend attractor:

> “No impossible booking can be confirmed, no table can be double-booked, and every confirmed booking creates a reliable email notification.”

Operational attractor:

> “Restaurant staff can control real-world service constraints such as peak times, unavailable tables, opening hours, and booking rules.”

---

## Non-negotiable invariants

### Booking invariants

1. A booking cannot be confirmed unless the restaurant is open at the selected time.
2. A booking cannot be confirmed unless the party size fits the selected table or seating area.
3. A table cannot have overlapping confirmed bookings.
4. A table cannot have an overlapping confirmed booking and active hold.
5. A booking must have:
   - customer name
   - customer email
   - customer phone number, if required by restaurant policy
   - party size
   - date
   - start time
   - end time
   - booking status
   - confirmation code
6. The frontend must never be the source of truth for availability.
7. Backend availability must be calculated from:
   - opening hours
   - table inventory
   - existing bookings
   - active holds
   - blocked periods
   - party size
   - booking duration
   - turnover buffer
   - peak-time rules
8. Every customer table selection must create a temporary hold before final confirmation.
9. Every hold must expire automatically.
10. Repeated form submissions, page refreshes, or double-clicks must not create duplicate bookings.
11. A booking confirmation page must only be shown after a confirmed booking exists in the backend.
12. Every booking action must be auditable.

---

## Email invariants

1. Every confirmed booking must create one booking confirmation email job.
2. A booking confirmation email must only be generated from a confirmed backend booking record.
3. A booking confirmation email must never be generated only from frontend state.
4. Email sending failure must not cancel the booking.
5. Email status must be recorded.
6. Staff must be able to see whether the confirmation email was:
   - pending
   - sent
   - failed
   - bounced
   - resent
7. Staff must be able to resend a confirmation email.
8. Booking emails and future newsletter emails must remain separate concepts.
9. Do not implement newsletter signup in this iteration, but leave a clean extension point for future newsletter consent.

---

## Peak-time invariants

The backend must include a way for staff/admin users to define peak times.

Peak times must be configurable.

Peak-time mode must be possible to turn on or off globally.

Peak-time rules must be possible to enable or disable by default.

The admin should be able to define rules such as:

- Friday evening is peak time.
- Saturday evening is peak time.
- Lunch service is normal.
- Bank holidays may use peak-time rules.
- Peak-time mode can be disabled temporarily.

Peak-time rules may affect:

- available time slots
- booking duration
- table allocation
- minimum party size for certain tables
- whether small parties can book large tables
- whether table selection is allowed or auto-assigned
- turnover buffers
- last booking time

The customer does not need to see “peak-time logic” explicitly unless the restaurant wants to show messaging.

Example:

```txt
Normal time:
2 guests can book Table 8.

Peak time:
2 guests cannot book a 6-seat table unless staff override is enabled.
```

Additional orchestration instruction from the user:
- We are running a full NenFlow v3 run.
- The user wants RESEARCH involved.
- Agents should follow a 40% context-window handoff threshold: if a role agent reaches the 40% range, it must write handoff.md / continuation contract and the orchestrator should respawn the same role, pointing it at the handoff.
- The executor must run tests to ensure things work as intended.
- Agents must write artifacts and tests that make world contact with any hypothesis or insight from research/planning.
```

## Task Summary

Build and integrate a native restaurant booking system into the existing `C:\Users\doner\ramen-don` restaurant website, replacing or augmenting the current OpenTable-centric booking flow with a backend-enforced availability, holds, confirmation, audit, staff/admin controls, and email-job workflow. The immediate output requested in this phase is only this ecological NenFlow intake artifact; no implementation is authorized during intake.

## Task Type

- Feature build / system integration
- Backend data model and business-rule design
- Customer-facing booking UX integration
- Admin/staff operational tooling
- Email job workflow design
- Testable, spec-driven implementation requiring research before planning

## User Intent

The user wants a reliable, calm, non-payment restaurant booking system embedded into an existing restaurant site aesthetic. Customers should be able to choose party size, date, available time, seating/table where applicable, enter contact details, confirm a booking, and receive a confirmation email. Staff/admin users should be able to configure real-world constraints such as opening hours, blocked periods, peak-time rules, unavailable tables, booking duration, buffers, and table-allocation rules.

The user explicitly does not want newsletter signup implemented in this iteration, but wants the backend shaped so newsletter consent can be added later without coupling newsletter behavior to booking-confirmation email behavior.

## Goal Attractor

### Customer-facing attractor

Customers can easily reserve a table, understand what they chose, and receive confirmation without experiencing the booking flow as a separate application.

### Backend attractor

The backend is the source of truth. No impossible booking can be confirmed, no table can be double-booked, active holds prevent race-condition conflicts, repeated submissions are idempotent, and every confirmed booking creates exactly one reliable confirmation email job.

### Operational attractor

Restaurant staff can control real-world service constraints from admin/staff workflows without requiring source-code changes for ordinary calendar, opening-hour, table, block, or peak-time adjustments.

## Context Map

### Project

- Project cwd: `C:\Users\doner\ramen-don`
- Existing restaurant website, apparently using Next.js and Supabase.
- Current booking functionality is largely OpenTable overlay/external integration rather than a native booking engine.

### Current State

Known from orchestrator-provided context and Graphify report:

- `graphify-out/GRAPH_REPORT.md` exists and identifies relevant communities:
  - Booking Overlay & Navigation UI
  - Admin Booking Data Layer
  - OpenTable External Integration
  - Data Fetching & Supabase Integration
  - Admin API Route Handlers
  - Auth & Supabase Client Architecture
- Current booking is largely OpenTable overlay/external integration.
- Supabase is present.
- Admin API and admin CMS patterns exist.
- Project AGENTS.md states this is a Next.js version with breaking changes; implementation agents must read relevant guides under `node_modules/next/dist/docs/` before writing code.

### Desired Future State

A native booking system integrated into the current site, including:

- Customer booking flow: party size → date → time → seating/table where applicable → contact details → backend confirmation → confirmation page.
- Backend availability calculation from opening hours, table inventory, bookings, holds, blocked periods, party size, duration, turnover buffers, and peak-time rules.
- Temporary holds with automatic expiration.
- Idempotent confirmation behavior.
- Auditability of booking actions.
- Email job creation and status tracking from confirmed backend records.
- Admin/staff controls for peak times and service constraints.
- Clean separation between booking-confirmation emails and future newsletter logic.

### Source-of-Truth Materials

- User raw development prompt above.
- `C:\Users\doner\.pi\agent\nenflow-v3\runs\RUN_20260517-200414\RUN_CONFIG.json`
- `C:\Users\doner\ramen-don\AGENTS.md`
- `C:\Users\doner\ramen-don\graphify-out\GRAPH_REPORT.md`
- Relevant Next.js docs under `node_modules/next/dist/docs/` for implementation phase.
- Supabase skill and Supabase/Postgres best-practice skill for database/auth/RLS/schema work.
- Existing project code, schemas, routes, components, admin patterns, and tests to be discovered by RESEARCH.

### Actors

- Human requester: Defines product intent, approves scope and tradeoffs.
- Intake Agent: Produces this planning-ready ecological intake only.
- Researcher: Inspects current repo, Next.js docs, Supabase patterns, booking/OpenTable integration, admin patterns, and likely schema/test surfaces.
- Planner: Converts intake and research into staged, invariant-preserving plan.
- Executor: Implements approved plan only and runs tests.
- Verifier: Independently verifies behavior, data invariants, and test evidence.
- Customer/end user: Makes bookings.
- Staff/admin user: Configures booking rules, tables, blocked periods, peak-time settings, and email resend/status visibility.

## Epistemic Map

### Known

- The task is for `C:\Users\doner\ramen-don`.
- The requested output for this phase is only `ATT_0_INTAKE.md`.
- The user explicitly requested spec-driven ecology intake.
- The user explicitly requested RESEARCH involvement in the full NenFlow run.
- Context handoff threshold is 40%, source `user_prompt`.
- No payments are required.
- Newsletter signup is explicitly out of scope for this iteration.
- Newsletter integration should remain a clean future extension point.
- Booking-confirmation logic and newsletter logic must remain separate.
- Current project has OpenTable booking overlay/external integration rather than a native booking engine.
- Supabase is present.
- Next.js implementation must account for project-specific breaking-change docs.
- The Executor must run tests and create artifacts/tests that make world contact with research/planning hypotheses.

### Inferred

- A database-backed booking domain model will likely be required, including tables/entities for bookings, holds, table inventory/seating areas, blocked periods, opening hours/service windows, peak-time rules, audit log, and email jobs.
- Existing admin/auth/Supabase/API patterns should be reused rather than inventing a separate subsystem.
- Availability and confirmation should likely be implemented via server-side route handlers/actions and database constraints/transactions to avoid race conditions.
- The current OpenTable UX may need replacement, coexistence, or migration handling; RESEARCH should determine the current integration points.
- Email sending may need an email provider, queued job abstraction, retry/resend behavior, and status persistence, but the provider is not specified.

### Assumed

- The restaurant has finite tables/seating areas with capacities that can be represented in the backend.
- Staff/admin users already authenticate through existing admin patterns.
- Existing site aesthetic should be preserved by reusing current components/design tokens where possible.
- Supabase/Postgres is acceptable as the persistence layer unless research reveals otherwise.
- Peak-time rules can be represented as configurable data rather than hard-coded logic.
- Planning can proceed after research without asking the human for every operational policy default, provided unresolved policy choices are gated or made configurable.

### Unknown

- Existing database schema and migration setup.
- Existing test framework and test coverage.
- Existing email provider or absence thereof.
- Whether admin pages already include any booking data structures beyond OpenTable configuration.
- Required restaurant policy for customer phone number.
- Concrete booking duration defaults and turnover buffer defaults.
- Real table/floor-plan inventory and capacities.
- Whether customer table choice must always be allowed or sometimes auto-assigned.
- Whether holds must be implemented with DB expiry cleanup, scheduled jobs, edge functions, or query-time expiry logic.
- Deployment environment and available background job mechanism.
- RLS/security posture for customer-facing booking APIs.
- Whether existing OpenTable integration should be removed, hidden, retained as fallback, or migrated.

### Material Unknowns

These do not block RESEARCH, but they may change architecture or planning:

1. Email provider/background job mechanism.
2. Existing DB migration and Supabase conventions.
3. Existing Next.js route/action conventions for this version.
4. Required phone-number policy.
5. Table inventory/floor-plan source of truth.
6. OpenTable transition strategy.
7. Admin permission model and staff roles.
8. Deployment constraints for automated hold expiry and email processing.

## Constraints

### Technical Constraints

- Must respect existing Next.js version and project-specific docs before implementation.
- Must respect existing Supabase architecture and best practices.
- Frontend must never be source of truth for availability.
- Availability, holds, and confirmation must be backend-enforced.
- Idempotency is required for repeated submissions, refreshes, and double-clicks.
- Holds must expire automatically.
- Email job creation must be triggered only from confirmed backend bookings.
- Confirmation page must only render after confirmed backend booking exists.
- Booking action audit trail is required.

### Design Constraints

- Preserve existing site aesthetic.
- Integrate into current website rather than feel like a separate app.
- Customer flow should feel simple and calm.
- Peak-time complexity does not need to be exposed to customers unless configured messaging requires it.

### Human / Operational Constraints

- Staff/admin must control peak-time mode and peak-time rules.
- Staff/admin must see email status and resend confirmation emails.
- Restaurant policy may determine whether phone number is required.
- Staff override behavior may be needed for peak-time constraints, but exact override scope is unspecified.

### Security and Privacy Constraints

- Customer name, email, and possibly phone are personal data and must be handled appropriately.
- Admin/staff booking management must require proper authorization.
- Customer-facing booking endpoints must not expose private booking/customer data.
- Confirmation codes must not be predictable enough to leak booking records.

### Tooling Constraints

- Intake must not implement or edit source.
- Research should inspect repo and docs before planning.
- Executor must run tests.
- Any Supabase work must use Supabase skill/best-practice guidance.
- Any Next.js implementation must read relevant `node_modules/next/dist/docs/` docs first.

### Verification Constraints

- Verification must test backend invariants, not only UI happy paths.
- Tests must include race/idempotency/overlap cases where feasible.
- Email behavior must be verified through job/status records, not only UI messages.
- Confirmation page must be verified against backend record existence.

## Invariants

### Booking Invariants

1. A booking cannot be confirmed unless the restaurant is open at the selected time.
   - Verification method: backend tests for closed-day/closed-time rejection.
2. A booking cannot be confirmed unless the party size fits the selected table or seating area.
   - Verification method: capacity-rule tests.
3. A table cannot have overlapping confirmed bookings.
   - Verification method: DB constraint/transaction tests and API tests.
4. A table cannot have an overlapping confirmed booking and active hold.
   - Verification method: hold/confirmation concurrency tests.
5. A booking must persist required fields: customer name, customer email, phone if policy requires, party size, date, start time, end time, status, confirmation code.
   - Verification method: schema inspection and create-confirm tests.
6. Frontend must never be source of truth for availability.
   - Verification method: inspect data flow; mutate/submit stale frontend state and confirm backend rejection.
7. Backend availability must use opening hours, table inventory, existing bookings, active holds, blocked periods, party size, duration, turnover buffer, and peak-time rules.
   - Verification method: availability tests covering each input.
8. Every customer table selection must create a temporary hold before final confirmation.
   - Verification method: API/UI flow test proving hold exists before confirm.
9. Every hold must expire automatically.
   - Verification method: expiry tests via time manipulation or expiry predicate.
10. Repeated form submissions, page refreshes, or double-clicks must not create duplicate bookings.
    - Verification method: idempotency tests.
11. Confirmation page must only show after confirmed backend booking exists.
    - Verification method: direct navigation/stale-state tests.
12. Every booking action must be auditable.
    - Verification method: audit log schema and action tests.

### Email Invariants

1. Every confirmed booking creates one booking confirmation email job.
2. Booking confirmation email is generated only from confirmed backend booking record.
3. Booking confirmation email is never generated only from frontend state.
4. Email sending failure does not cancel booking.
5. Email status is recorded.
6. Staff can see pending/sent/failed/bounced/resent status.
7. Staff can resend a confirmation email.
8. Booking emails and future newsletter emails remain separate concepts.
9. Newsletter signup is not implemented this iteration; only a clean future extension point is left.

### Peak-Time Invariants

1. Staff/admin can define configurable peak-time windows/rules.
2. Peak-time mode can be globally enabled/disabled.
3. Peak-time rules can be enabled/disabled by default.
4. Peak-time rules may affect available slots, duration, allocation, minimum party size, small-party/large-table rules, table-selection availability, turnover buffers, and last booking time.
5. Customer-facing UI does not need to expose peak-time logic unless configured messaging requires it.

### Process Invariants

1. This intake phase must not implement, edit source, create migrations, or run code-changing commands.
2. RESEARCH should normally run next because the user explicitly requested it.
3. Same-role continuation must occur if context approaches the 40% handoff threshold.
4. Executor must run tests and provide evidence.
5. Research/planning hypotheses must make world contact through artifacts and tests.

## Success Criteria

1. Native customer booking flow exists and is integrated into the current website aesthetic.
   - Evidence required: UI flow screenshots or browser evidence; code references.
   - Verification method: end-to-end or component/browser tests.
2. Backend availability is authoritative and uses all required constraint inputs.
   - Evidence required: tests covering opening hours, inventory, bookings, holds, blocked periods, party size, duration, buffer, peak-time rules.
   - Verification method: unit/integration/API tests.
3. Holds prevent double-booking and expire automatically.
   - Evidence required: tests for active holds blocking selection/confirmation and expired holds releasing availability.
   - Verification method: backend tests with controlled time.
4. Confirmed bookings cannot overlap for same table/seating resource.
   - Evidence required: tests and/or DB-level constraints/transaction behavior.
   - Verification method: concurrent or sequential overlap tests.
5. Idempotency prevents duplicate booking creation from repeated submissions.
   - Evidence required: test proving same idempotency key/form action does not create duplicates.
   - Verification method: API/integration test.
6. Confirmation page depends on confirmed backend record, not frontend state.
   - Evidence required: direct route tests and stale-state tests.
   - Verification method: browser/API tests.
7. Every confirmed booking creates exactly one confirmation email job and tracks status.
   - Evidence required: email job records and tests for success/failure/resend paths.
   - Verification method: integration tests with mocked/stubbed email provider.
8. Email failure does not cancel booking.
   - Evidence required: failed email status while booking remains confirmed.
   - Verification method: simulated provider failure test.
9. Staff/admin can configure peak-time rules and operational constraints.
   - Evidence required: admin UI/API tests or screenshots plus backend state changes.
   - Verification method: admin route/API/browser tests.
10. Newsletter is not implemented but future consent extension is not tangled with booking-confirmation emails.
    - Evidence required: code/schema separation and no newsletter signup UI behavior.
    - Verification method: inspection and targeted tests where applicable.

## Ambiguities

### Non-blocking for RESEARCH

- Exact email provider and background job model.
- Exact DB migration framework and schema state.
- Exact Next.js patterns required by this project version.
- Existing OpenTable retirement/coexistence strategy.
- Exact admin UX breadth for table inventory, blocked periods, and peak-time controls.
- Whether floor-plan table selection is mandatory in all cases or conditional.
- Phone-number requirement policy.
- Default booking durations, buffers, last booking time, and peak-time presets.

### Potential Blocking Questions Before Final Planning/Execution

1. Should OpenTable be removed, retained as fallback, or replaced only for selected entry points?
2. What email provider/background-processing mechanism is available or preferred?
3. Is customer phone number required for all bookings?
4. What is the initial real table/seating inventory and capacity map?
5. Should customers always select tables, or can peak-time/restaurant rules force auto-assignment?
6. What admin role(s) may override peak-time/table-allocation rules?

## Routing Decision

Recommended next step: **RESEARCH**.

Rationale:

- The user explicitly requested RESEARCH involvement.
- Planning safely requires discovering existing Next.js conventions, Supabase schema/migration patterns, current OpenTable integration, current admin/auth/data-fetching patterns, and available tests.
- No critical ambiguity blocks research.
- Research should produce concrete findings and world-contact evidence before planning.

## Affordance Landscape

### For the Human

- Can correct scope before planning.
- Can decide OpenTable transition, email provider, phone policy, and table-inventory defaults at gates.
- Can approve whether peak-time rules are minimal MVP controls or full admin configuration in first implementation.

### For the Researcher

- Can inspect Graphify communities first to target relevant code.
- Can inspect current booking overlay/OpenTable components and admin/Supabase patterns.
- Can inspect Next.js docs required by `AGENTS.md` before recommending implementation path.
- Can inspect tests/package scripts to identify verification strategy.

### For the Planner

- Can decompose work into data model, availability engine, holds/idempotency, customer UI, admin controls, email jobs, audit, and verification.
- Can preserve invariants as acceptance criteria.
- Can convert unknowns into gates rather than guesses.

### For the Executor

- Can implement from staged plan with narrow diffs.
- Can write backend tests before or alongside business logic.
- Can reuse existing Supabase/admin/UI patterns.
- Can avoid newsletter implementation while leaving explicit extension seams.

### For the Verifier

- Can reject work if backend is not authoritative.
- Can test race/idempotency/overlap cases.
- Can inspect DB records for bookings, holds, audit entries, and email jobs.
- Can verify that email failure does not cancel booking.

### Actions That Should Be Difficult or Blocked

- Confirming bookings from frontend-only state.
- Creating booking emails without confirmed backend bookings.
- Overlapping confirmed bookings on same resource.
- Active hold and confirmed booking overlap for same resource/time.
- Implementing newsletter signup in this iteration.
- Rewriting unrelated site systems.
- Ignoring Next.js project docs or Supabase best practices.

## Attractors and Failure Modes

### Useful Attractors to Strengthen

- Backend as source of truth.
- Small staged implementation with explicit evidence.
- Reuse existing site/admin/Supabase patterns.
- Tests tied directly to invariants.
- Calm customer UX with strict server enforcement.
- Configurable operational rules rather than hard-coded restaurant policy.

### Bad Attractors to Counter

- Building a polished booking UI while leaving availability client-trusted.
- Treating holds as UI state instead of persisted backend state.
- Creating duplicate bookings under double-click/retry conditions.
- Coupling newsletter concepts to booking confirmation emails.
- Overbuilding a generic restaurant SaaS instead of this site’s booking system.
- Ignoring OpenTable migration/coexistence consequences.
- Adding admin controls without authorization or auditability.
- Testing only happy-path demo data.

### Counter-Constraints

- Planner must map each invariant to implementation tasks and tests.
- Executor must not mark complete without backend tests for availability, holds, overlap, idempotency, and email-job behavior.
- Verifier must use direct evidence, not Executor narrative.
- Newsletter implementation is forbidden in this iteration.
- Research must inspect existing project conventions before planning.

### Early Warning Signs

- Availability calculation appears in client components as authoritative logic.
- Confirmation page can be reached with URL/frontend state only.
- No database transaction/constraint/idempotency mechanism is identified.
- Email sending occurs inline in confirmation without persisted job/status.
- Peak-time rules are hard-coded instead of configurable.
- Tests only assert component rendering, not booking invariants.

## Scope

### In Scope

- Native restaurant booking customer flow.
- Backend availability model and calculation.
- Table/seating inventory and capacity rules.
- Temporary holds and expiry.
- Confirmed booking persistence and confirmation codes.
- Idempotent booking confirmation.
- Audit logging for booking actions.
- Confirmation email job creation, status tracking, and resend capability.
- Staff/admin configuration for peak-time rules and operational constraints.
- Integration with existing website design.
- Tests for business-critical invariants.

### Out of Scope

- Payments.
- Newsletter signup implementation.
- Coupling newsletter emails to booking-confirmation emails.
- Unrelated site redesign.
- Rewriting the whole admin/CMS system unless research proves necessary.
- Treating OpenTable as the authoritative booking backend for the new system unless explicitly chosen by the human later.

### Deferred

- Newsletter consent/signup workflow.
- Marketing/newsletter email sending.
- Advanced CRM integrations.
- Multi-location restaurant support unless current project already requires it.
- Sophisticated table optimization beyond stated peak-time/table-allocation requirements.

### Requires Human Gate

- OpenTable removal/coexistence/fallback decision.
- Email provider/background job choice if not already present.
- Initial real table/seating inventory.
- Phone-number required/optional policy.
- Staff override permissions.
- Whether customers can always choose exact table vs seating area/auto-assignment.

## Representative Environment

### Real Use Context

- Public restaurant website used by customers on mobile and desktop.
- Staff/admin users manage availability constraints and review booking/email states.
- Supabase-backed persistence and auth/admin patterns.
- Next.js app using project-specific current version semantics.

### Realistic Inputs

- Party sizes from 1 through table max and beyond max.
- Weekday lunch/dinner windows.
- Friday/Saturday evening peak windows.
- Blocked table or blocked service period.
- Existing confirmed bookings adjacent to or overlapping requested times.
- Active holds that expire and active holds that still block availability.
- Duplicate submit/idempotency key reuse.
- Email provider success and failure.

### Realistic Edge Cases

- Booking exactly at opening time.
- Booking that would end after closing due to duration/buffer.
- Booking adjacent to existing booking where turnover buffer matters.
- Small party trying to book a large table during peak time.
- Expired hold at confirmation time.
- Confirmation retry after network interruption.
- Resending a failed or bounced confirmation email.
- Direct navigation to confirmation route without confirmed booking.

### Misleading Toy Conditions to Avoid

- Single table only.
- No existing bookings.
- No blocked periods.
- No peak-time rules.
- Email provider always succeeds.
- Availability computed only in UI.
- Tests with only one happy-path reservation.

### Evidence Needed From Real or Representative Use

- Backend tests for availability/rule engine inputs.
- API/integration tests for hold-confirm lifecycle.
- UI/browser evidence for customer flow and confirmation page.
- Admin evidence for rule configuration and email status/resend.
- Database evidence for audit/email job/booking/hold records.

## Perturbation Tests

1. **Vague Prompt Test**
   - Perturbation: A next agent sees only “build booking system.”
   - Expected response: Agent consults this intake and preserves backend/source-of-truth invariants.
   - Failure condition: Agent builds only frontend screens.

2. **Overloaded Prompt Test**
   - Perturbation: Agent focuses on the long UI/prototype description.
   - Expected response: Agent still prioritizes backend invariants and tests.
   - Failure condition: Backend availability, holds, and idempotency are treated as later work.

3. **Contradiction Test**
   - Perturbation: Existing OpenTable integration appears simpler to keep.
   - Expected response: Research documents options and asks for human gate if replacement/coexistence is ambiguous.
   - Failure condition: Agent silently leaves OpenTable as source of truth while claiming native backend invariants.

4. **Context Loss Test**
   - Perturbation: A fresh agent receives only this artifact.
   - Expected response: Agent can route to RESEARCH, identify source-of-truth files to inspect, and avoid implementation during intake.
   - Failure condition: Fresh agent needs hidden conversation history.

5. **Verification Weakness Test**
   - Perturbation: UI works in browser for one successful booking.
   - Expected response: Verifier demands backend overlap, hold expiry, idempotency, and email-job evidence.
   - Failure condition: Work passes based only on visual happy path.

6. **Scope Creep Test**
   - Perturbation: Agent notices newsletter future extension point and starts implementing signup.
   - Expected response: Agent refuses or defers newsletter implementation.
   - Failure condition: Newsletter UI, signup API, or marketing email logic appears in this iteration.

7. **Race Condition Test**
   - Perturbation: Two customers attempt same table/time concurrently.
   - Expected response: One hold/confirmation succeeds; the other is rejected or forced to choose alternate availability.
   - Failure condition: Both confirmed bookings exist for same table/time.

## Falsifiers

1. A confirmed booking can be created when the restaurant is closed.
   - Why it invalidates success: Violates core availability invariant.
2. Two overlapping confirmed bookings exist for the same table/seating resource.
   - Why it invalidates success: Violates backend reliability attractor.
3. A confirmation email job is created without a confirmed booking record.
   - Why it invalidates success: Violates email source-of-truth invariant.
4. Email send failure cancels or rolls back a confirmed booking.
   - Why it invalidates success: Violates email failure invariant.
5. Confirmation page displays from frontend state without backend confirmation.
   - Why it invalidates success: Misrepresents booking state to customer.
6. Newsletter signup is implemented in this iteration.
   - Why it invalidates success: Explicitly out of scope.
7. Availability is trusted from client-side calculations.
   - Why it invalidates success: Frontend becomes source of truth.
8. No tests or runtime evidence cover holds, overlap, idempotency, and email-job creation.
   - Why it invalidates success: Claims lack required world contact.

## Human Gates

Before or during planning/execution, the human should be asked only if the answer changes scope, architecture, risk, or verification:

1. OpenTable strategy: replace, coexist, retain fallback, or remove from booking CTAs?
2. Email provider/job processing: use existing provider if present, add one, or stub for this iteration?
3. Phone policy: required for all bookings or configurable/optional?
4. Initial table/seating inventory and capacity map.
5. Table choice policy: exact table selection, seating area selection, or auto-assignment under certain rules?
6. Staff override permissions for peak-time/table-allocation rules.

## Research Brief for Next Agent

Recommended RESEARCH tasks:

1. Read `graphify-out/GRAPH_REPORT.md` and, if present, wiki/index.md for relevant communities.
2. Inspect existing booking/OpenTable components and entry points.
3. Inspect admin API route patterns, admin auth layout, and Supabase client architecture.
4. Inspect database schema/migration files and current Supabase conventions.
5. Inspect package scripts and current test framework.
6. Read relevant Next.js docs under `node_modules/next/dist/docs/` before recommending implementation path.
7. Apply Supabase skill/best practices for any schema/RLS/transaction recommendations.
8. Identify whether an email provider or background job mechanism already exists.
9. Produce evidence-backed recommendations for planning, including likely files to touch and tests to add.

## Planning Readiness

Planning Readiness: **Ready after RESEARCH**.

This intake is sufficient to route to RESEARCH. It is not yet sufficient for implementation planning without repo-specific findings on schema, routes, tests, email provider, Next.js conventions, and OpenTable transition points.

## Recommended Next Agent

**Researcher**

## Handoff Notes

- Do not implement during RESEARCH.
- Preserve 40% context handoff threshold. If nearing threshold, write a continuation contract/handoff and stop.
- Treat the raw prompt invariants as non-negotiable unless the human explicitly revises them.
- Research must make direct contact with the repo and relevant docs.
- Planner should not invent unresolved operational policy defaults without marking them configurable or gating them.
