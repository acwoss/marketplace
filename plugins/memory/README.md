# memory

Memória permanente em **markdown** para agentes de IA: fatos estáveis do projeto e evidências de incidente, em um vault global compatível com Obsidian.

| | `memory` (este) | `memory-mcp` (remoto) |
|--|-----------------|------------------------|
| Storage | Markdown no vault | ChromaDB |
| Uso | Fatos + evidências legíveis | Memória vetorial |
| Rede | Offline filesystem | Offline local DB |

## Componentes

- **MCP** (`mcp.json` → `server/`) — tools locais de CRUD/busca
- **Skills** — `using-memory`, `capture-evidence`
- **Rule** — `memory-bootstrap` (recall cedo; persistir decisões/evidências)
- **Command** — `/memory-init`

## Configuração

1. Defina `MEMORY_VAULT_PATH` (path absoluto do vault).
2. Build do server (gera `server/dist/index.js` empacotado; necessário após clonar se o bundle não estiver presente):

```shell
cd plugins/memory/server
npm install
npm run build
```

3. Instale o plugin pelo marketplace ou, para dev rápido:

```shell
# Windows (PowerShell) — symlink
New-Item -ItemType Junction -Path "$env:USERPROFILE\.cursor\plugins\local\memory" -Target "<repo>\plugins\memory"
```

Depois: **Developer: Reload Window**.

## Tools MCP

| Tool | Função |
|------|--------|
| `memory_status` | Path do vault, projeto, contagens |
| `memory_list` | Lista com filtros `project`, `type`, `tag`, `jira` |
| `memory_get` | Lê nota por `id` ou path |
| `memory_search` | Busca full-text local |
| `memory_upsert` | Cria/atualiza nota + regenera `index.md` |
| `memory_link` | Adiciona `[[wiki]]` entre notas |
| `memory_set_project` | Override do projeto na sessão |

## Layout do vault

```text
<MEMORY_VAULT_PATH>/
├── README.md
├── _templates/fact.md
└── projects/<slug>/
    ├── index.md
    └── facts/<id>.md
```

Frontmatter: `id`, `title`, `type`, `tags`, `project`, `updated`, opcionais `jira` e `sources`.

## Spec

Design: [`docs/2026-07-27-memory-plugin-design.md`](docs/2026-07-27-memory-plugin-design.md)
