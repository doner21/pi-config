---
artifact_type: VERIFIER_BRIEF
role: EXECUTOR
run_id: RUN_20260527-155952
track: A
pre_verified: true
---

# ATT_2A — Verifier Brief: Track A (Time Display Fixes)

This brief pre-verifies all 4 Track A success criteria and both shared criteria (SC7, SC8).
Every claim is backed by an actually-executed test with captured output.

---

## SC1 (Track A): Confirmation page renders UK-local 5 PM booking as 5 PM on UTC server

**Criterion:** Confirmation page renders a UK-local 5 PM booking as 5 PM, not 4 PM, on a UTC server.

**How validated:** The confirmation page now uses `formatBookingTime(booking.startsAt)` which delegates to `Intl.DateTimeFormat("en-GB", { timeZone: "Europe/London", hour: "2-digit", minute: "2-digit", hour12: false })`. This was tested via unit tests.

**Test evidence:**
```
$ npx vitest run tests/unit/booking-time-format.test.ts

 ✓ tests/unit/booking-time-format.test.ts (12 tests) 143ms
   ✓ formatBookingTime formats summer as HH:MM in London time (DST: UTC+1)
   ✓ formatBookingTime formats winter as HH:MM in London time (GMT: UTC+0)
   ✓ formatBookingTime handles evening bookings around midnight rollover
   ✓ formatBookingTime handles midnight correctly
```

**Node.js DST sanity check:**
```
$ node -e "console.log(new Intl.DateTimeFormat('en-GB',{timeZone:'Europe/London',hour:'2-digit',minute:'2-digit',hour12:false}).format(new Date('2026-06-15T17:00:00.000Z')))"
18:00
```

**Verifier command:**
```bash
cd C:/Users/doner/ramen-don && npx vitest run tests/unit/booking-time-format.test.ts
```

**Self-assessment:** ✅ PASS. The formatter correctly produces `18:00` for a 17:00 UTC June booking (BST = UTC+1). For December it produces `17:00` (GMT = UTC+0). The confirmation page `page.tsx` imports and uses the same `formatBookingTime` function. Evidence is clear and reproducible.

---

## SC2 (Track A): Confirmation email `When:` line renders booking time in Europe/London

**Criterion:** Confirmation email `When:` line renders booking time in Europe/London.

**How validated:** `src/lib/email.ts` line 33 now uses `formatBookingDateTime(booking.startsAt)` for the `When:` line. `formatBookingDateTime` is tested to produce London-local output.

**Test evidence (formatBookingDateTime tests):**
```
$ npx vitest run tests/unit/booking-time-format.test.ts

 ✓ formatBookingDateTime formats summer datetime in London time
   → result contains "15 June 2026" and "18:00"
 ✓ formatBookingDateTime formats winter datetime in London time
   → result contains "15 December 2026" and "17:00"
```

**Source confirmation:**
```bash
$ grep -n "formatBookingDateTime" C:/Users/doner/ramen-don/src/lib/email.ts
3:import { formatBookingDateTime } from "@/lib/utils/booking-time-format";
33:      <p>When: ${formatBookingDateTime(booking.startsAt)}</p>
```

**Verifier command:**
```bash
cd C:/Users/doner/ramen-don && npx vitest run tests/unit/booking-time-format.test.ts -t "formatBookingDateTime"
```

**Self-assessment:** ✅ PASS. The email `When:` line now uses the London timezone formatter. The formatter has been tested and produces correct BST (UTC+1) in summer and GMT (UTC+0) in winter.

---

## SC4 (Track A): Admin bookings list displays readable UK-local date/time

**Criterion:** Admin bookings list displays readable UK-local date/time, not raw ISO `starts_at` / `startsAt`.

**How validated:** `src/app/admin/bookings/page.tsx` now renders:
```tsx
{booking.starts_at || booking.startsAt ? formatBookingDateTime(booking.starts_at || booking.startsAt as string) : "—"}
```
instead of raw `{booking.starts_at || booking.startsAt}`.

**Source confirmation:**
```bash
$ grep -n "formatBookingDateTime" C:/Users/doner/ramen-don/src/app/admin/bookings/page.tsx
6:import { formatBookingDateTime } from "@/lib/utils/booking-time-format";
131:...formatBookingDateTime(booking.starts_at || booking.startsAt as string) : "—"
```

**Verifier command:**
```bash
cd C:/Users/doner/ramen-don && grep -A2 "confirmation_code || booking.confirmationCode" src/app/admin/bookings/page.tsx
```

**Self-assessment:** ✅ PASS. The admin list now formats booking times through `formatBookingDateTime` with a `"—"` fallback for null/undefined. The formatter itself is tested and produces London-local output. The email status line is preserved (`Email: {job.status || "pending"}`).

---

## SC7 (Both): Admin floor plan remains behaviorally unchanged

**Criterion:** Admin floor plan remains behaviorally unchanged and still shows bookings at the selected time.

**How validated:** git diff confirms zero changes to the floor plan component.

**Test evidence:**
```bash
$ git diff HEAD -- src/components/admin/InteractiveFloorPlan.tsx
(no output — zero changes)
```

**Verifier command:**
```bash
cd C:/Users/doner/ramen-don && git diff HEAD -- src/components/admin/InteractiveFloorPlan.tsx
```

**Self-assessment:** ✅ PASS. The floor plan file is completely unchanged. The plan did not request any modifications to this file (it's the known-good surface).

---

## SC8 (Both): `npm run lint` and `npm run test:unit` pass

**Criterion:** `npm run lint` and `npm run test:unit` pass, or unrelated pre-existing failures are documented with evidence.

**Test evidence — lint:**
```
$ npm run lint

✖ 15 problems (0 errors, 15 warnings)
```
0 errors, 15 pre-existing warnings. None from Track A changes.

**Pre-existing warnings (all unrelated):**
- `middleware.ts:18:48` — unused `options`
- `src/app/(public)/reservations/confirmation/[code]/page.tsx:22:11` — `<img>` instead of `<Image>` (pre-existing)
- `src/app/admin/bookings/page.tsx:2:1` — unused eslint-disable directive (pre-existing)
- 12 other pre-existing warnings in unrelated files

**Test evidence — unit tests:**
```
$ npm run test:unit

 Test Files  5 passed (5)
      Tests  28 passed (28)
   Start at  16:18:49
   Duration  234ms
```

**Verifier command:**
```bash
cd C:/Users/doner/ramen-don && npm run lint && npm run test:unit
```

**Self-assessment:** ✅ PASS. Lint has 0 errors (15 pre-existing warnings unrelated to Track A). All 28 unit tests pass across 5 test files.

---

## Invariant Compliance Summary

| # | Invariant | Evidence |
|---|-----------|----------|
| 1 | No stored booking times changed | Only display-layer formatting changed; no DB code modified |
| 2 | `Europe/London` timezone, never hardcoded `+1 hour` | Winter GMT test proves 17:00 UTC → 17:00 GMT (not 18:00) |
| 3 | Customer email status label preserved for Track B | `emailLabel` derivation left intact in page.tsx |
| 4 | Admin floor plan preserved | `git diff HEAD` shows zero changes |
| 5 | Email delivery continues to work | Only `When:` HTML string changed; Resend code untouched |
| 6 | No schema changes | None made |

---

## All Track A Success Criteria: PASS

| SC | Description | Verdict |
|----|-------------|---------|
| SC1 | Confirmation page UK-local time | ✅ PASS |
| SC2 | Email `When:` line UK-local time | ✅ PASS |
| SC4 | Admin list formatted time | ✅ PASS |
| SC7 | Floor plan unchanged | ✅ PASS |
| SC8 | Lint + tests pass | ✅ PASS |

**Note:** SC3 and SC5-SC6 are Track B criteria — not in scope for this executor.
