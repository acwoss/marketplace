import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import {
  getNote,
  linkNotes,
  listNotes,
  upsertNote,
} from "./notes.js";
import { searchNotes } from "./search.js";
import { ensureVaultInitialized } from "./vault.js";

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) {
    throw new Error(message);
  }
}

async function main() {
  const vaultPath = fs.mkdtempSync(path.join(os.tmpdir(), "memory-vault-"));
  process.env.MEMORY_VAULT_PATH = vaultPath;
  ensureVaultInitialized(vaultPath);

  const fact = upsertNote(vaultPath, {
    title: "Prefer local plugins",
    body: "New plugins should live under plugins/<name>/ in this marketplace.",
    type: "preference",
    tags: ["conventions", "marketplace"],
    project: "marketplace",
  });
  assert(fact.frontmatter.id === "prefer-local-plugins", "unexpected fact id");

  const evidence = upsertNote(vaultPath, {
    id: "checkout-timeout-nr-2026-07",
    title: "Checkout timeout correlated with payment latency",
    type: "evidence",
    tags: ["incident", "checkout", "newrelic"],
    project: "marketplace",
    jira: "PROJ-1234",
    sources: [
      { kind: "newrelic", ref: "NRQL: SELECT average(duration) FROM Transaction" },
    ],
    body: [
      "## Achado",
      "Latência do provedor de pagamento subiu durante o pico.",
      "",
      "## Evidência",
      "```text",
      "p95 payment.latency = 2400ms",
      "```",
      "",
      "## Implicação",
      "Ver [[prefer-local-plugins]] não se aplica; registrar padrão de timeout.",
      "",
    ].join("\n"),
  });
  assert(evidence.frontmatter.jira === "PROJ-1234", "jira missing");

  const listed = listNotes(vaultPath, {
    project: "marketplace",
    jira: "PROJ-1234",
  });
  assert(listed.length === 1, `expected 1 jira note, got ${listed.length}`);

  const searched = searchNotes(vaultPath, {
    query: "payment latency",
    project: "marketplace",
  });
  assert(searched.length === 1, "search failed");

  linkNotes(vaultPath, evidence.frontmatter.id, fact.frontmatter.id, "marketplace");
  const linked = getNote(vaultPath, {
    id: evidence.frontmatter.id,
    project: "marketplace",
  });
  assert(linked.body.includes("[[prefer-local-plugins]]"), "link missing");

  const indexPath = path.join(vaultPath, "projects", "marketplace", "index.md");
  assert(fs.existsSync(indexPath), "index.md missing");
  const index = fs.readFileSync(indexPath, "utf8");
  assert(index.includes("PROJ-1234"), "index missing jira group");
  assert(index.includes("[[prefer-local-plugins]]"), "index missing wiki link");

  console.log("smoke ok", {
    vaultPath,
    notes: listNotes(vaultPath).map((note) => note.frontmatter.id),
  });
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
