# marketplace

Marketplace pessoal de plugins para o Claude Code, seguindo o formato
descrito em https://code.claude.com/docs/en/plugin-marketplaces.

Todos os plugins listados aqui são hospedados em seus próprios repositórios
— este repositório contém apenas o catálogo (`.claude-plugin/marketplace.json`),
nenhum código de plugin é versionado aqui.

## Plugins

- **memory-mcp** — Local, 100%-offline persistent memory MCP server for AI
  coding agents, backed by ChromaDB.
  Fonte: [acwoss/memory-mcp](https://github.com/acwoss/memory-mcp) (branch
  padrão, sem versão fixada — a versão efetiva é sempre a declarada no
  `plugin.json` daquele repositório).

## Como usar

Adicionar este marketplace:

```shell
/plugin marketplace add acwoss/marketplace
```

Instalar um plugin dele:

```shell
/plugin install memory-mcp@marketplace
/reload-plugins
```

## Adicionar novos plugins

Cada novo plugin é uma entrada em `plugins[]` no `marketplace.json`, com
`source` apontando para o repositório externo onde aquele plugin vive
(`github`, `url`, ou `git-subdir`, conforme o caso). Nenhum plugin deve ter
seu código vendorizado dentro deste repositório.
