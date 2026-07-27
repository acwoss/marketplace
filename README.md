# acwoss

Marketplace pessoal de plugins para **Claude Code** e **Cursor**.

- Catálogo Claude: [`.claude-plugin/marketplace.json`](.claude-plugin/marketplace.json)
- Catálogo Cursor: [`.cursor-plugin/marketplace.json`](.cursor-plugin/marketplace.json)
- Plugins locais: pasta [`plugins/`](plugins/)

## Modelos de distribuição

| Tipo | Onde vive | Claude | Cursor |
|------|-----------|--------|--------|
| Remoto | Repositório externo (ex.: `memory-mcp`) | `source` GitHub | — |
| Local | `plugins/<nome>/` neste repo | path relativo | path relativo |

Plugins novos devem ser locais neste repositório. O `memory-mcp` permanece remoto
e disponível apenas no marketplace Claude.

## Plugins

### Remotos (Claude)

- **memory-mcp** — Local, 100%-offline persistent memory MCP server for AI
  coding agents, backed by ChromaDB.
  Fonte: [acwoss/memory-mcp](https://github.com/acwoss/memory-mcp)

### Locais

- **superpowers** — Biblioteca de skills (TDD, debugging, colaboração e
  workflows). Baseado em [obra/superpowers](https://github.com/obra/superpowers).
  Código em [`plugins/superpowers/`](plugins/superpowers/).

## Como usar

### Claude Code

```shell
/plugin marketplace add acwoss/marketplace
/plugin install memory-mcp@acwoss
/plugin install superpowers@acwoss
/reload-plugins
```

Para testar localmente a partir deste clone:

```shell
/plugin marketplace add ./caminho/para/marketplace
```

### Cursor

1. Submeta ou aponte o repositório como marketplace de plugins Cursor
   (veja [Plugins reference](https://cursor.com/docs/reference/plugins.md)).
2. Plugins locais listados em `.cursor-plugin/marketplace.json` são instaláveis
   a partir deste repo.
3. Para desenvolvimento rápido de um plugin isolado, copie ou faça symlink de
   `plugins/<nome>` para `~/.cursor/plugins/local/<nome>` e rode
   **Developer: Reload Window**.

## Adicionar um plugin local

1. Criar `plugins/<nome>/` com `.claude-plugin/plugin.json` e
   `.cursor-plugin/plugin.json`.
2. Registrar em ambos os `marketplace.json` com `"source": "<nome>"`
   (os `pluginRoot` já apontam para `plugins/`).
3. Incluir componentes (`skills/`, `rules/`, `agents/`, `commands/`, `hooks/`,
   `mcp.json`) conforme o caso.
4. Atualizar a seção **Plugins** deste README.
