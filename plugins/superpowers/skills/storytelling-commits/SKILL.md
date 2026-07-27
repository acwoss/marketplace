---
name: storytelling-commits
description: "Use when the user asks to commit, create commits, or commit pending work — especially with mixed diffs, pressure to squash into one commit, short subject-only messages, or skipping git status/diff analysis"
---

# Storytelling Commits

## Overview

**Core principle:** Analyze first, split into the smallest coherent semantic commits, each with a Conventional Commit subject and a What/Why/How story body.

**Violating the letter of the rules is violating the spirit of the rules.**

## The Iron Law

```
NO COMMIT WITHOUT: (1) FRESH DIFF ANALYSIS  (2) SEMANTIC GROUPING
                   (3) ATOMIC STAGING         (4) WHAT/WHY/HOW BODY
```

Skip any step = invalid. Never invent messages from memory.

## When to Use

- User asks to commit / create commits / "commit everything"
- Mixed pending changes; pressure to squash, skip bodies, or rush

**Do not use** for status/review-only requests with no commit ask.

## Workflow

### 1. Analyze (mandatory, parallel)

```bash
git status
git diff
git diff --staged
git log -5 --oneline
```

### 2. Group by semantic intent

One intent per commit. **Smallest commit that still leaves a coherent tree.**

| Split | Keep together |
|-------|----------------|
| feat vs fix vs refactor vs test vs docs vs chore | Same change + tightly coupled test |
| Unrelated typo / drive-by cleanup | Multi-file single bugfix |
| Dep bump vs behavior change | Lockfile with its dependency |

### 3. Stage and commit one group at a time

- Explicit paths/hunks only. **Never** `git add -A` / `git add .` when intents differ.
- No secrets (`.env`, credentials). No empty commits. No hook skips unless user asks.
- Commit only when the user asked. After all groups: `git status`.

### 4. Message contract (English by default)

English unless the user explicitly requests another language.

```text
type(optional-scope): imperative subject ≤72 chars

What:
<observable change — one or two sentences>

Why:
<motivation/problem — not "because user asked">

How:
<approach/mechanism — not a file-list dump>
```

**Types:** `feat` `fix` `refactor` `test` `docs` `chore` `perf` `style` `ci` `build` `revert`

**Subject:** imperative, no trailing period. Match `git log` tone when compatible.

Example:

```text
feat(auth): add OAuth login callback handler

What:
Accept the provider callback, create a session, and redirect home.

Why:
Password login alone blocks SSO customers; Google OAuth was requested.

How:
Validate state, exchange the code via HttpClient, persist via SessionStore.
```

## Rationalizations

| Excuse | Reality |
|--------|---------|
| "Commit everything" | All work — as atomic storytelling commits, not one blob |
| "Tired / dinner / deploy window" | Analysis + split is the job |
| "Senior said squash / nobody reads bodies" | Atomic + What/Why/How unless user explicitly orders one squash |
| "File list in body = storytelling" | Storytelling is What/Why/How |
| "Skip diff — I remember" | Memory lies; read diffs first |
| "Unrelated typo rides along" | Own `chore:` / `style:` commit |
| "Subject-only is enough" | Missing What/Why/How fails this skill |
| "Non-English by default" | English unless user requests otherwise |
| "One commit is pragmatic" | Atomic history wins for revert, bisect, review |

## Red Flags — STOP and Restart

- `git add -A` with mixed intents
- Message drafted before reading diffs
- Mega-commit mixing unrelated intents
- Subject-only, or body that only lists files
- Missing What, Why, or How
- Squashing for time, authority, or "commit everything"

**All of these mean:** stop, re-analyze, regroup, recommit.

## Common Mistakes

| Mistake | Fix |
|---------|-----|
| "How" restates "What" | How = mechanism; What = outcome |
| "Why" = "user asked to commit" | Why = product/technical reason |
| Over-splitting into broken steps | Each commit must leave a coherent tree |
| Drive-by cleanup in feature commit | Separate chore/style commit |
