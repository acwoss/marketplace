#!/usr/bin/env node
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import {
  getNote,
  linkNotes,
  listNotes,
  regenerateIndex,
  summarizeNote,
  upsertNote,
} from "./notes.js";
import { searchNotes } from "./search.js";
import {
  NoteType,
  VaultError,
  ensureVaultInitialized,
  getVaultPath,
  inferProjectFromCwd,
  listProjectSlugs,
} from "./vault.js";

const NOTE_TYPES = ["fact", "evidence", "preference", "decision"] as const;

let sessionProject: string | undefined;

function resolveProject(explicit?: string): string {
  const project =
    explicit?.trim() ||
    sessionProject ||
    inferProjectFromCwd() ||
    undefined;
  if (!project) {
    throw new VaultError(
      "Could not resolve project. Pass project or call memory_set_project."
    );
  }
  return project;
}

function textResult(payload: unknown) {
  return {
    content: [
      {
        type: "text" as const,
        text:
          typeof payload === "string"
            ? payload
            : JSON.stringify(payload, null, 2),
      },
    ],
  };
}

function errorResult(error: unknown) {
  const message =
    error instanceof Error ? error.message : "Unknown memory server error";
  return {
    content: [{ type: "text" as const, text: message }],
    isError: true,
  };
}

const server = new McpServer({
  name: "memory",
  version: "1.0.0",
});

server.tool(
  "memory_status",
  "Show vault path, current project resolution, and note counts",
  {},
  async () => {
    try {
      const vaultPath = getVaultPath();
      ensureVaultInitialized(vaultPath);
      const projects = listProjectSlugs(vaultPath);
      const inferred = inferProjectFromCwd();
      const current = sessionProject || inferred || null;
      const notes = listNotes(vaultPath);
      const byProject: Record<string, number> = {};
      for (const note of notes) {
        byProject[note.frontmatter.project] =
          (byProject[note.frontmatter.project] ?? 0) + 1;
      }
      return textResult({
        vaultPath,
        sessionProject: sessionProject ?? null,
        inferredProject: inferred ?? null,
        currentProject: current,
        projectCount: projects.length,
        projects,
        noteCount: notes.length,
        notesByProject: byProject,
      });
    } catch (error) {
      return errorResult(error);
    }
  }
);

server.tool(
  "memory_set_project",
  "Override the project slug for this MCP server session",
  {
    project: z.string().describe("Project slug to use for subsequent calls"),
  },
  async ({ project }) => {
    try {
      const vaultPath = getVaultPath();
      ensureVaultInitialized(vaultPath);
      sessionProject = project.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
      if (!sessionProject) {
        throw new VaultError("Invalid project slug.");
      }
      regenerateIndex(vaultPath, sessionProject);
      return textResult({
        sessionProject,
        message: `Project set to ${sessionProject}`,
      });
    } catch (error) {
      return errorResult(error);
    }
  }
);

server.tool(
  "memory_list",
  "List memory notes with optional filters (project, type, tag, jira)",
  {
    project: z.string().optional().describe("Project slug (defaults to session/cwd)"),
    type: z.enum(NOTE_TYPES).optional().describe("Note type filter"),
    tag: z.string().optional().describe("Tag filter"),
    jira: z.string().optional().describe("Optional Jira ticket key filter"),
  },
  async ({ project, type, tag, jira }) => {
    try {
      const vaultPath = getVaultPath();
      ensureVaultInitialized(vaultPath);
      const resolved = project ? resolveProject(project) : sessionProject || inferProjectFromCwd();
      const notes = listNotes(vaultPath, {
        project: resolved,
        type: type as NoteType | undefined,
        tag,
        jira,
      });
      return textResult({
        project: resolved ?? null,
        count: notes.length,
        notes: notes.map(summarizeNote),
      });
    } catch (error) {
      return errorResult(error);
    }
  }
);

server.tool(
  "memory_get",
  "Read a memory note by id or relative path",
  {
    id: z.string().optional().describe("Note id"),
    path: z.string().optional().describe("Path relative to vault or absolute"),
    project: z.string().optional().describe("Project slug when resolving by id"),
  },
  async ({ id, path: notePath, project }) => {
    try {
      const vaultPath = getVaultPath();
      const note = getNote(vaultPath, {
        id,
        path: notePath,
        project: project || sessionProject || inferProjectFromCwd(),
      });
      return textResult({
        ...summarizeNote(note),
        body: note.body,
      });
    } catch (error) {
      return errorResult(error);
    }
  }
);

server.tool(
  "memory_search",
  "Full-text search across markdown notes (local, case-insensitive)",
  {
    query: z.string().describe("Search query"),
    project: z.string().optional().describe("Limit to project"),
    type: z.enum(NOTE_TYPES).optional(),
    tag: z.string().optional(),
    jira: z.string().optional(),
  },
  async ({ query, project, type, tag, jira }) => {
    try {
      const vaultPath = getVaultPath();
      ensureVaultInitialized(vaultPath);
      const resolved = project
        ? resolveProject(project)
        : sessionProject || inferProjectFromCwd();
      const notes = searchNotes(vaultPath, {
        query,
        project: resolved,
        type: type as NoteType | undefined,
        tag,
        jira,
      });
      return textResult({
        query,
        project: resolved ?? null,
        count: notes.length,
        notes: notes.map(summarizeNote),
      });
    } catch (error) {
      return errorResult(error);
    }
  }
);

server.tool(
  "memory_upsert",
  "Create or update a fact/evidence/preference/decision note and refresh index.md",
  {
    title: z.string().describe("Note title"),
    body: z.string().describe("Markdown body"),
    id: z.string().optional().describe("Stable id (defaults from title)"),
    type: z.enum(NOTE_TYPES).optional().describe("Defaults to fact"),
    tags: z.array(z.string()).optional(),
    project: z.string().optional().describe("Project slug"),
    jira: z.string().optional().describe("Optional Jira ticket key"),
    sources: z
      .array(
        z.object({
          kind: z.string(),
          ref: z.string(),
        })
      )
      .optional()
      .describe("Optional evidence sources (newrelic, aws, ...)"),
  },
  async (args) => {
    try {
      const vaultPath = getVaultPath();
      const project = resolveProject(args.project);
      const note = upsertNote(vaultPath, {
        id: args.id,
        title: args.title,
        body: args.body,
        type: args.type as NoteType | undefined,
        tags: args.tags,
        project,
        jira: args.jira,
        sources: args.sources,
      });
      return textResult({
        message: `Upserted ${note.frontmatter.id}`,
        note: {
          ...summarizeNote(note),
          body: note.body,
        },
      });
    } catch (error) {
      return errorResult(error);
    }
  }
);

server.tool(
  "memory_link",
  "Add a wiki-style [[link]] from one note to another",
  {
    fromId: z.string().describe("Source note id"),
    toId: z.string().describe("Target note id"),
    project: z.string().optional().describe("Project slug"),
  },
  async ({ fromId, toId, project }) => {
    try {
      const vaultPath = getVaultPath();
      const resolved = resolveProject(project);
      const note = linkNotes(vaultPath, fromId, toId, resolved);
      return textResult({
        message: `Linked [[${fromId}]] -> [[${toId}]]`,
        note: summarizeNote(note),
      });
    } catch (error) {
      return errorResult(error);
    }
  }
);

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
