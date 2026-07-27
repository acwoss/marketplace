# Plugins locais

Plugins versionados neste repositório. Cada pasta em `plugins/<nome>/` é um plugin
instalável via marketplace Claude e Cursor.

## Estrutura mínima

```text
plugins/<nome>/
├── .claude-plugin/
│   └── plugin.json
├── .cursor-plugin/
│   └── plugin.json
├── README.md
└── (skills/ | rules/ | agents/ | commands/ | hooks/ | mcp.json)
```

## Checklist ao adicionar um plugin

1. Criar `plugins/<nome>/` com manifests Claude e Cursor (`name` em kebab-case).
2. Adicionar entrada em `.claude-plugin/marketplace.json` com `"source": "<nome>"`
   (o `pluginRoot` `./plugins` completa o caminho).
3. Adicionar entrada em `.cursor-plugin/marketplace.json` com `"source": "<nome>"`
   (o `pluginRoot` `plugins` completa o caminho).
4. Documentar propósito e componentes no `README.md` do plugin e no README da raiz.
