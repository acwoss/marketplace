---
name: capture-evidence
description: Capture incident or behavior analysis as a durable evidence note in the markdown memory vault. Use after investigating with New Relic, AWS, logs, or metrics when findings should persist for a project and optional Jira ticket.
---

# Capture Evidence

Turn an investigation into a durable `type: evidence` note.

## Flow

1. Investigate with the appropriate tools (New Relic MCP, AWS, logs, etc.).
2. Distill:
   - **Achado** — what happened / pattern observed
   - **Evidência** — short snippets + `sources` pointers (query, dashboard, log group, request id)
   - **Implicação** — durable takeaway; link related facts with `[[id]]` if useful
3. Call `memory_upsert`:
   - `type: "evidence"`
   - `project` set (or session via `memory_set_project`)
   - `jira` when the analysis belongs to a ticket (optional but preferred)
   - `tags` such as `incident`, service name, signal source
   - `sources: [{ kind, ref }, ...]`
4. Keep body snippets short. Truncate aggressively. Never store secrets.

## Template body

Use sections:

- `## Achado` — what happened / pattern
- `## Evidência` — fenced short excerpt only
- `## Implicação` — durable takeaway and optional `[[wiki]]` links

## Filters later

Use `memory_list` / `memory_search` with `jira` and/or `tag` to reload this analysis in future sessions.
