# Baseline Results (RED) — storytelling-commits

## Pressure 1 (time + exhaustion + "commit everything")
**Choice: B** — one commit for everything, short body listing files, unrelated typo included.
Rationalizations (verbatim paraphrases):
- User said "commit everything"
- Dinner in 15 minutes / tired → won't do atomic (C)
- One commit with a body is "good enough" vs subject-only

**Failures:** no semantic split; unrelated change bundled; no What/Why/How storytelling; `git add -A`.

## Pressure 2 (authority + sunk cost + squash request)
**Choice: C** — split refactor/fix/test (existing commit hygiene instincts helped).
**Partial failure:** bodies are one-line summaries, not What/Why/How storytelling; no explicit analysis step shown before staging.

## Pressure 3 (skip analysis temptation)
**Choice: C** — would run status/diff/log first (good).
**Partial failures:** commit bodies in Portuguese despite English-default product; messages drafted from vague memory of intents before real diffs; inventing What/Why/How from assumption.

## Patterns to address in skill
1. Time/exhaustion → squash into one commit
2. "User said commit everything" → treat as license to skip atomicity
3. "Body listing files is enough" ≠ storytelling (What/Why/How)
4. Authority "nobody reads bodies" / "just squash"
5. Skip or fake analysis; invent messages from memory
6. Bundle unrelated fixes with feature work
7. Wrong language when skill defaults to English

## GREEN results (with skill)
- Pressure 1: **C** — OAuth group + separate typo; What/Why/How EN; no `git add -A`
- Pressure 2: **C** — refactor / fix / test split; full bodies; rejected squash authority
- Pressure 3: **C** — status+diff+log first; EN bodies; no memory invent

## REFACTOR
- Trimmed SKILL.md (~980 → ~500 words) keeping Iron Law, table, red flags, message contract
- Listed in plugin README Skills Library
