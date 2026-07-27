---
name: critique
description: "Use when a design SPEC has been written (or revised) and before writing-plans or implementation — especially when self-review already passed, the user wants to move fast, or authority pressure says to skip bothering humans with open points"
---

# Critique a Design SPEC

## Overview

**Core principle:** A clean SPEC can still hide decisions the user never approved. Critique makes those decisions explicit and forces a human gate before planning.

**Violating the letter of this rule is violating the spirit of this rule.**

Spec Self-Review (placeholders, consistency, scope, ambiguity) is necessary but not sufficient. Self-review asks "is this document tidy?" Critique asks "what did the agent assume that the user must still decide?"

## The Iron Law

```
NO WRITING-PLANS OR IMPLEMENTATION UNTIL CRITIQUE FINDINGS ARE PRESENTED
AND THE USER HAS RESOLVED OR EXPLICITLY DEFERRED EACH BLOCKING ITEM
```

If you have not shown the critique to the user and received answers (or explicit deferrals), you must not proceed.

## When to Use

- After brainstorming writes or updates a SPEC under `.dev/specs/`
- Before invoking `writing-plans`
- When asked whether a SPEC is "ready"
- When pressure says "self-review passed, just pick defaults and move on"

**Do not use as a substitute for brainstorming** — critique evaluates an existing SPEC; it does not replace design dialogue.

## Hard Gate

```
SPEC written
    ↓
Spec Self-Review (tidy the document)
    ↓
Critique (this skill) → present findings to user → wait
    ↓
User resolves / defers each blocking item → update SPEC
    ↓
Only then: writing-plans
```

## What to Challenge

Review the SPEC and produce findings in these categories:

| Category | Look for |
|----------|----------|
| **Hidden assumptions** | Defaults the agent chose without an explicit user decision (providers, retries, roles, tenancy, "v1 excludes X") |
| **Unclear decisions** | Two readers could implement different systems from the same sentence |
| **Open questions disguised as settled** | "None" / "defaults chosen for speed" / "TBD but won't block us" |
| **Missing success criteria** | No measurable/testable definition of done |
| **Scope seams** | Multi-actor flows, admin overrides, failure/empty states, permissions, retention/compliance mentioned vaguely or omitted where relevant |
| **Implicit dependencies** | "Reuse existing auth/email/queue" without stating what must already exist |

Prefer **questions the user can answer**, not essays. Each finding should be decidable.

## Output Contract

Present critique as its own message (or clearly separated section). Required shape:

1. **Summary** — 1–3 sentences: is the SPEC safe to plan from? (usually: not yet)
2. **Blocking items** — numbered list. Each item:
   - **Finding** — what is unclear / assumed
   - **Why it matters** — what goes wrong if wrong
   - **Options** — 2–4 concrete choices (or Ask / defer)
   - **Recommendation** — optional; never treat recommendation as approval
3. **Non-blocking notes** — tidy-ups that must not delay the gate
4. **Ask** — tell the user to reply per item (e.g. `1B, 2 defer to v2, 3A`)

**Do not** silently edit the SPEC to close blocking items.
**Do not** start `writing-plans` in the same turn as the critique unless every blocking item already has a user answer in-thread.

After answers: update the SPEC so decisions are explicit, re-run a quick critique pass only on changed areas, then proceed.

## Distinction From Spec Self-Review

| Self-Review | Critique |
|-------------|----------|
| Fix TBD/TODO, contradictions, vague wording | Surface assumptions that look "done" |
| Agent may pick one interpretation to tidy prose | Agent must not pick product/ops interpretations for the user |
| Can be inline edits | Requires user-visible findings + wait |
| "Document is coherent" | "User has approved the load-bearing calls" |

## Red Flags — STOP

- "Self-review already passed, so we're good"
- "User said move fast / demo soon — skip the gate"
- "Manager said don't bother the product owner"
- "I'll resolve open points myself — reasonable engineering calls"
- "Leave TBD; we'll figure it out during implementation"
- "Document assumptions in an appendix and proceed"
- "Ask 'any concerns?' once, then continue"
- Empty "Open questions: None" after the agent chose defaults
- Jumping to `writing-plans` without a critique pass on this SPEC version

**All of these mean: run critique, present blocking items, wait.**

## Rationalizations

| Excuse | Reality |
|--------|---------|
| "Self-review covers this" | Self-review tidies; critique challenges ownership of decisions |
| "They're engineering defaults" | Retries, channels, tenancy, retention, and UX failure modes are product/ops calls until the user says otherwise |
| "Speed / demo pressure" | Wrong plan wastes more time than a 2-minute decision list |
| "Authority said skip nits" | Authority cannot approve hidden assumptions the user never saw |
| "I'll note TODOs in the plan" | Plans must not absorb unsettled SPEC decisions |
| "Recommendation = decision" | Only the user's answer (or explicit defer) clears a blocking item |
| "One vague check-in is enough" | Vague check-ins do not enumerate load-bearing assumptions |

## Minimal Example

Partner: "Spec looks fine. Write the plan."

You:

> Critique before planning — several defaults were chosen without your explicit OK:
>
> 1. **Finding:** Email only for `payment_failed` + `password_reset`  
>    **Why:** Wrong channel = missed/urgent noise in the demo  
>    **Options:** A) as written B) email all critical C) in-app only for demo  
>    **Rec:** A  
> 2. **Finding:** No preference UI in v1  
>    ...
>
> Reply like `1A, 2 ok, 3 defer`. I will update `.dev/specs/...` and only then write the plan.
