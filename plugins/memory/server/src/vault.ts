import fs from "node:fs";
import path from "node:path";

export type NoteType = "fact" | "evidence" | "preference" | "decision";

export interface NoteSource {
  kind: string;
  ref: string;
}

export interface NoteFrontmatter {
  id: string;
  title: string;
  type: NoteType;
  tags: string[];
  project: string;
  jira?: string;
  sources?: NoteSource[];
  updated: string;
}

export interface MemoryNote {
  frontmatter: NoteFrontmatter;
  body: string;
  absolutePath: string;
  relativePath: string;
}

export class VaultError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "VaultError";
  }
}

export function getVaultPath(): string {
  const raw = process.env.MEMORY_VAULT_PATH?.trim();
  if (!raw) {
    throw new VaultError(
      "MEMORY_VAULT_PATH is not set. Configure the plugin variable or env and retry."
    );
  }
  return path.resolve(raw);
}

export function ensureVaultInitialized(vaultPath: string): void {
  const projectsDir = path.join(vaultPath, "projects");
  const templatesDir = path.join(vaultPath, "_templates");
  fs.mkdirSync(projectsDir, { recursive: true });
  fs.mkdirSync(templatesDir, { recursive: true });

  const readmePath = path.join(vaultPath, "README.md");
  if (!fs.existsSync(readmePath)) {
    fs.writeFileSync(
      readmePath,
      [
        "# AI Memory Vault",
        "",
        "Permanent markdown memory for AI agents.",
        "",
        "- `projects/<slug>/facts/` — one note per fact or evidence",
        "- `projects/<slug>/index.md` — wiki-style index (auto-regenerated)",
        "- `_templates/fact.md` — note template",
        "",
      ].join("\n"),
      "utf8"
    );
  }

  const templatePath = path.join(templatesDir, "fact.md");
  if (!fs.existsSync(templatePath)) {
    fs.writeFileSync(
      templatePath,
      [
        "---",
        "id: example-id",
        "title: Example title",
        "type: fact",
        "tags: []",
        "project: example-project",
        "updated: YYYY-MM-DD",
        "---",
        "",
        "Body of the fact or evidence.",
        "",
      ].join("\n"),
      "utf8"
    );
  }
}

export function projectDir(vaultPath: string, project: string): string {
  return path.join(vaultPath, "projects", project);
}

export function factsDir(vaultPath: string, project: string): string {
  return path.join(projectDir(vaultPath, project), "facts");
}

export function ensureProject(vaultPath: string, project: string): void {
  ensureVaultInitialized(vaultPath);
  fs.mkdirSync(factsDir(vaultPath, project), { recursive: true });
}

export function slugifyId(input: string): string {
  return input
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 120);
}

export function inferProjectFromCwd(cwd = process.cwd()): string | undefined {
  const base = path.basename(cwd).trim();
  if (!base || base === "." || base === "/" || base.includes(":")) {
    return undefined;
  }
  return slugifyId(base) || undefined;
}

export function listProjectSlugs(vaultPath: string): string[] {
  const projectsRoot = path.join(vaultPath, "projects");
  if (!fs.existsSync(projectsRoot)) {
    return [];
  }
  return fs
    .readdirSync(projectsRoot, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .sort();
}
