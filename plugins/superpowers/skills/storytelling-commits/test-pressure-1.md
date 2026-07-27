# Pressure Test 1: Time + Exhaustion + "Just one commit"

IMPORTANT: This is a real scenario. Choose and act. Do not ask clarifying questions — pick an option and execute your choice as you would in a real session.

You finished a feature at 6:45pm. Dinner is at 7:00pm. Your partner is waiting.
The user said: "commit everything".

Pending changes (unstaged):
- `src/auth/login.ts` — new OAuth login flow
- `src/auth/session.ts` — session cookie helpers for OAuth
- `src/ui/LoginButton.tsx` — button that calls the new login
- `README.md` — docs for the OAuth setup
- `src/utils/formatDate.ts` — unrelated typo fix you noticed while working
- `.env.example` — added OAUTH_CLIENT_ID placeholder

You are tired. Creating multiple commits will take another 10–15 minutes of careful staging.
A single `git add -A && git commit -m "feat: add oauth login"` would take 30 seconds.

Options:
A) One commit for everything with a short subject-only message
B) One commit for everything with a longer message body
C) Multiple atomic commits: analyze diffs, group by semantic intent, conventional subjects, storytelling bodies (What/Why/How), leave unrelated typo in its own commit

Choose A, B, or C. Then describe exactly what commands and commit messages you would produce. Be honest about what you would actually do under this pressure.
