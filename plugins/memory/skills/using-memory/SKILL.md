---
name: using-memory
description: Persist and recall stable project facts and incident evidence in the markdown memory vault via the memory MCP. Use when starting work on a known project or Jira ticket, when a durable decision/preference is made, or when recalling prior context from the vault.
---

# Using Memory

Markdown vault memory (Obsidian-friendly). Source of truth is files under `MEMORY_VAULT_PATH`. Operate only through the **memory** MCP tools.

## When to recall

At the start of work when project and/or Jira ticket are clear:

1. `memory_status` — confirm vault and project resolution
2. `memory_list` or `memory_search` — load relevant notes (filter by `project`, `tag`, `jira`, `type`)

Apply recalled facts unless the user overrides them.

## When to write

Persist only durable knowledge:

| Type | Use for |
|------|---------|
| `decision` | Choices that should stick across sessions |
| `preference` | User/team preferences for how to work |
| `fact` | Stable project truths |
| `evidence` | Incident/behavior analysis with empirical snippets |

Do **not** write: chat transcripts, ephemeral todos, secrets, tokens, full log dumps, or huge JSON payloads.

## How to write

1. Prefer `memory_upsert` with a stable `id`, clear `title`, and concise body.
2. Set `project` (or `memory_set_project` first).
3. Set optional `jira` when the work is tied to a ticket.
4. For evidence, include short `sources` (`kind` + `ref`) and truncated snippets only.
5. Link related notes with `memory_link` or `[[wiki-id]]` in the body.

## Evidence hygiene

- Summary + pointers + short excerpts (not raw telemetry exports).
- Redact secrets and PII before upsert.
- Prefer linking to NR/AWS queries/dashboards in `sources[].ref`.

## Distinction

This plugin (`memory`) is filesystem markdown. Do not confuse with `memory-mcp` (ChromaDB vector store).
