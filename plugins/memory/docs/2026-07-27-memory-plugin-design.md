# Design: Plugin `memory` — memória permanente em markdown

**Date:** 2026-07-27  
**Status:** Approved

## Problem

Agentes de IA perdem contexto entre sessões. O marketplace já tem `memory-mcp` (ChromaDB, vetorial). Falta uma memória **legível por humanos**, organizada em arquivos markdown, compatível com Obsidian e outras ferramentas, para fatos estáveis e evidências de incidentes.

## Goals

- Persistência permanente de fatos do projeto (decisões, preferências, contexto estável).
- Persistência de evidências empíricas de análises (New Relic, AWS, etc.) como resumo + ponteiros + trechos curtos.
- Vault global configurável, com subpastas por projeto.
- Uma nota markdown por fato; índice wiki-style.
- Filtro opcional por ticket Jira.
- MCP 100% local (filesystem, sem rede, sem DB externo).
- Skills/rules definem política; MCP executa operações.
- Disponível em Cursor e Claude Code via marketplace local.

## Non-goals (v1)

- Sync automático com New Relic, AWS ou Jira.
- Diário completo de sessões/chats.
- Busca semântica / embeddings.
- Anexos binários ou dumps grandes.

## Architecture

```
Agent → Skills/Rules (quando/o quê) → MCP memory (CRUD/busca) → Vault markdown
```

- **Skills/rules:** política de captura e recall.
- **MCP:** operações sobre o vault.
- **Vault:** fonte da verdade em markdown.

## Vault layout

```text
<MEMORY_VAULT_PATH>/
├── README.md
├── projects/<slug>/
│   ├── index.md
│   └── facts/<id>.md
└── _templates/fact.md
```

### Note frontmatter

```yaml
---
id: checkout-timeout-nr-2026-07
title: ...
type: fact | evidence | preference | decision
tags: []
project: marketplace
jira: PROJ-1234          # optional
sources: []              # optional
updated: YYYY-MM-DD
---
```

Evidence notes use sections: Achado / Evidência / Implicação. No secrets, no large dumps.

## MCP tools

| Tool | Behavior |
|------|----------|
| `memory_status` | Vault path, current project, counts |
| `memory_list` | Filters: project, type, tag, jira |
| `memory_get` | By id or relative path |
| `memory_search` | Local full-text + same filters |
| `memory_upsert` | Create/update note; regenerate index.md |
| `memory_link` | Add wiki link between notes |
| `memory_set_project` | Session project slug override |

Project resolution: session override → cwd/workspace name → error asking for `memory_set_project`.

Config: `MEMORY_VAULT_PATH` required. Clear errors if missing/invalid.

## Plugin components

- `skills/using-memory` — capture/recall policy
- `skills/capture-evidence` — incident → evidence note flow
- `rules/memory-bootstrap.mdc` — consult memory early; persist decisions/evidence
- `commands/memory-init` — vault setup + smoke status

## Distinction from `memory-mcp`

| | `memory` | `memory-mcp` |
|--|----------|--------------|
| Storage | Markdown vault | ChromaDB |
| Use | Human-readable facts + evidence | Vector memory |
| Network | Offline filesystem | Offline local DB |

## Implementation notes

- Location: `plugins/memory/` in this marketplace.
- Server: TypeScript + `@modelcontextprotocol/sdk`, stdio.
- Search: scan + case-insensitive match (no external index).
- `index.md` regenerated deterministically; group by `jira` when present.
