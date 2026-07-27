---
name: memory-init
description: Initialize the markdown memory vault and verify the memory MCP
---

# Initialize memory vault

1. Choose a global vault directory (often an Obsidian vault folder), e.g. `~/Obsidian/AI-Memory`.
2. Set the plugin variable **MEMORY_VAULT_PATH** to that absolute path (Cursor: Plugins → Configure; or export the env var for local MCP runs).
3. Ensure the memory MCP server is built:
   - From `plugins/memory/server`: `npm install && npm run build`
4. Call `memory_status` via the memory MCP.
5. If project resolution is wrong, call `memory_set_project` with the desired slug.
6. Optionally create a first note with `memory_upsert` to confirm `projects/<slug>/facts/` and `index.md` appear.

Expected vault shape:

```text
<MEMORY_VAULT_PATH>/
├── README.md
├── _templates/fact.md
└── projects/<slug>/
    ├── index.md
    └── facts/<id>.md
```
