import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import {
  NoteFrontmatter,
  NoteSource,
  NoteType,
  MemoryNote,
  VaultError,
  ensureProject,
  factsDir,
  projectDir,
  slugifyId,
} from "./vault.js";

export type { MemoryNote, NoteType, NoteSource, NoteFrontmatter };

const NOTE_TYPES: NoteType[] = ["fact", "evidence", "preference", "decision"];

export interface UpsertInput {
  id?: string;
  title: string;
  body: string;
  type?: NoteType;
  tags?: string[];
  project: string;
  jira?: string;
  sources?: NoteSource[];
}

export interface ListFilters {
  project?: string;
  type?: NoteType;
  tag?: string;
  jira?: string;
}

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

function normalizeType(value: unknown): NoteType {
  if (typeof value === "string" && NOTE_TYPES.includes(value as NoteType)) {
    return value as NoteType;
  }
  return "fact";
}

function normalizeTags(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return [];
  }
  return value
    .filter((tag): tag is string => typeof tag === "string")
    .map((tag) => tag.trim())
    .filter(Boolean);
}

function normalizeSources(value: unknown): NoteSource[] | undefined {
  if (!Array.isArray(value)) {
    return undefined;
  }
  const sources = value
    .map((item) => {
      if (!item || typeof item !== "object") {
        return null;
      }
      const record = item as Record<string, unknown>;
      const kind = typeof record.kind === "string" ? record.kind.trim() : "";
      const ref = typeof record.ref === "string" ? record.ref.trim() : "";
      if (!kind || !ref) {
        return null;
      }
      return { kind, ref };
    })
    .filter((item): item is NoteSource => item !== null);
  return sources.length > 0 ? sources : undefined;
}

function parseNote(absolutePath: string, vaultPath: string): MemoryNote | null {
  const raw = fs.readFileSync(absolutePath, "utf8");
  const parsed = matter(raw);
  const data = parsed.data as Record<string, unknown>;
  const id =
    typeof data.id === "string" && data.id.trim()
      ? slugifyId(data.id)
      : slugifyId(path.basename(absolutePath, ".md"));
  if (!id) {
    return null;
  }
  const title =
    typeof data.title === "string" && data.title.trim()
      ? data.title.trim()
      : id;
  const project =
    typeof data.project === "string" && data.project.trim()
      ? slugifyId(data.project)
      : slugifyId(path.basename(path.dirname(path.dirname(absolutePath))));
  const jira =
    typeof data.jira === "string" && data.jira.trim()
      ? data.jira.trim()
      : undefined;
  const updated =
    typeof data.updated === "string" && data.updated.trim()
      ? data.updated.trim()
      : today();

  const frontmatter: NoteFrontmatter = {
    id,
    title,
    type: normalizeType(data.type),
    tags: normalizeTags(data.tags),
    project,
    updated,
  };
  if (jira) {
    frontmatter.jira = jira;
  }
  const sources = normalizeSources(data.sources);
  if (sources) {
    frontmatter.sources = sources;
  }

  return {
    frontmatter,
    body: parsed.content.replace(/^\n+/, ""),
    absolutePath,
    relativePath: path.relative(vaultPath, absolutePath).replace(/\\/g, "/"),
  };
}

export function listNotes(
  vaultPath: string,
  filters: ListFilters = {}
): MemoryNote[] {
  const projects = filters.project
    ? [slugifyId(filters.project)]
    : fs.existsSync(path.join(vaultPath, "projects"))
      ? fs
          .readdirSync(path.join(vaultPath, "projects"), { withFileTypes: true })
          .filter((entry) => entry.isDirectory())
          .map((entry) => entry.name)
      : [];

  const notes: MemoryNote[] = [];
  for (const project of projects) {
    const dir = factsDir(vaultPath, project);
    if (!fs.existsSync(dir)) {
      continue;
    }
    for (const file of fs.readdirSync(dir)) {
      if (!file.endsWith(".md")) {
        continue;
      }
      const absolutePath = path.join(dir, file);
      const note = parseNote(absolutePath, vaultPath);
      if (!note) {
        continue;
      }
      if (filters.type && note.frontmatter.type !== filters.type) {
        continue;
      }
      if (
        filters.tag &&
        !note.frontmatter.tags.some(
          (tag) => tag.toLowerCase() === filters.tag!.toLowerCase()
        )
      ) {
        continue;
      }
      if (
        filters.jira &&
        (note.frontmatter.jira || "").toLowerCase() !==
          filters.jira.toLowerCase()
      ) {
        continue;
      }
      notes.push(note);
    }
  }

  return notes.sort((a, b) =>
    b.frontmatter.updated.localeCompare(a.frontmatter.updated)
  );
}

export function getNote(
  vaultPath: string,
  options: { id?: string; path?: string; project?: string }
): MemoryNote {
  if (options.path) {
    const absolutePath = path.isAbsolute(options.path)
      ? options.path
      : path.join(vaultPath, options.path);
    if (!fs.existsSync(absolutePath)) {
      throw new VaultError(`Note not found at path: ${options.path}`);
    }
    const note = parseNote(absolutePath, vaultPath);
    if (!note) {
      throw new VaultError(`Invalid note at path: ${options.path}`);
    }
    return note;
  }

  if (!options.id) {
    throw new VaultError("Provide id or path to get a note.");
  }

  const id = slugifyId(options.id);
  const candidates = listNotes(vaultPath, {
    project: options.project ? slugifyId(options.project) : undefined,
  });
  const match = candidates.find((note) => note.frontmatter.id === id);
  if (!match) {
    throw new VaultError(
      `Note not found: ${id}${options.project ? ` in project ${options.project}` : ""}`
    );
  }
  return match;
}

function serializeNote(frontmatter: NoteFrontmatter, body: string): string {
  const data: Record<string, unknown> = {
    id: frontmatter.id,
    title: frontmatter.title,
    type: frontmatter.type,
    tags: frontmatter.tags,
    project: frontmatter.project,
    updated: frontmatter.updated,
  };
  if (frontmatter.jira) {
    data.jira = frontmatter.jira;
  }
  if (frontmatter.sources?.length) {
    data.sources = frontmatter.sources;
  }
  return matter.stringify(body.replace(/^\n+/, ""), data).trimEnd() + "\n";
}

export function regenerateIndex(vaultPath: string, project: string): void {
  ensureProject(vaultPath, project);
  const notes = listNotes(vaultPath, { project });
  const lines: string[] = [
    `# ${project} memory index`,
    "",
    `Updated: ${today()}`,
    "",
  ];

  const withJira = notes.filter((note) => note.frontmatter.jira);

  const byJira = new Map<string, MemoryNote[]>();
  for (const note of withJira) {
    const key = note.frontmatter.jira!;
    const group = byJira.get(key) ?? [];
    group.push(note);
    byJira.set(key, group);
  }

  if (byJira.size > 0) {
    lines.push("## By Jira ticket", "");
    for (const jira of [...byJira.keys()].sort()) {
      lines.push(`### ${jira}`, "");
      for (const note of byJira.get(jira)!) {
        lines.push(
          `- [[${note.frontmatter.id}]] — ${note.frontmatter.title} (${note.frontmatter.type})`
        );
      }
      lines.push("");
    }
  }

  lines.push("## All notes", "");
  if (notes.length === 0) {
    lines.push("_No notes yet._", "");
  } else {
    for (const note of notes) {
      const jiraSuffix = note.frontmatter.jira
        ? ` · ${note.frontmatter.jira}`
        : "";
      lines.push(
        `- [[${note.frontmatter.id}]] — ${note.frontmatter.title} (${note.frontmatter.type}${jiraSuffix})`
      );
    }
    lines.push("");
  }

  fs.writeFileSync(
    path.join(projectDir(vaultPath, project), "index.md"),
    lines.join("\n"),
    "utf8"
  );
}

export function upsertNote(vaultPath: string, input: UpsertInput): MemoryNote {
  const project = slugifyId(input.project);
  if (!project) {
    throw new VaultError("project is required.");
  }
  const title = input.title.trim();
  if (!title) {
    throw new VaultError("title is required.");
  }
  const id = slugifyId(input.id || title);
  if (!id) {
    throw new VaultError("Could not derive a valid note id.");
  }

  ensureProject(vaultPath, project);
  const absolutePath = path.join(factsDir(vaultPath, project), `${id}.md`);

  let existing: MemoryNote | null = null;
  if (fs.existsSync(absolutePath)) {
    existing = parseNote(absolutePath, vaultPath);
  }

  const frontmatter: NoteFrontmatter = {
    id,
    title,
    type: input.type ?? existing?.frontmatter.type ?? "fact",
    tags: input.tags ?? existing?.frontmatter.tags ?? [],
    project,
    updated: today(),
  };
  const jira = input.jira?.trim() || existing?.frontmatter.jira;
  if (jira) {
    frontmatter.jira = jira;
  }
  const sources = input.sources ?? existing?.frontmatter.sources;
  if (sources?.length) {
    frontmatter.sources = sources;
  }

  const body = input.body?.trim() ? input.body.trim() + "\n" : "";
  fs.writeFileSync(absolutePath, serializeNote(frontmatter, body), "utf8");
  regenerateIndex(vaultPath, project);
  return getNote(vaultPath, { id, project });
}

export function linkNotes(
  vaultPath: string,
  fromId: string,
  toId: string,
  project?: string
): MemoryNote {
  const from = getNote(vaultPath, { id: fromId, project });
  const to = getNote(vaultPath, { id: toId, project: project || from.frontmatter.project });
  const wiki = `[[${to.frontmatter.id}]]`;
  if (from.body.includes(wiki)) {
    return from;
  }
  const addition = `\n\nSee also: ${wiki}\n`;
  const updatedBody = from.body.trimEnd() + addition;
  return upsertNote(vaultPath, {
    id: from.frontmatter.id,
    title: from.frontmatter.title,
    body: updatedBody,
    type: from.frontmatter.type,
    tags: from.frontmatter.tags,
    project: from.frontmatter.project,
    jira: from.frontmatter.jira,
    sources: from.frontmatter.sources,
  });
}

export function summarizeNote(note: MemoryNote): Record<string, unknown> {
  return {
    id: note.frontmatter.id,
    title: note.frontmatter.title,
    type: note.frontmatter.type,
    tags: note.frontmatter.tags,
    project: note.frontmatter.project,
    jira: note.frontmatter.jira ?? null,
    sources: note.frontmatter.sources ?? [],
    updated: note.frontmatter.updated,
    path: note.relativePath,
  };
}
