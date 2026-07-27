import { ListFilters, listNotes, MemoryNote } from "./notes.js";

export interface SearchOptions extends ListFilters {
  query: string;
}

function haystack(note: MemoryNote): string {
  const fm = note.frontmatter;
  return [
    fm.id,
    fm.title,
    fm.type,
    fm.project,
    fm.jira ?? "",
    fm.tags.join(" "),
    (fm.sources ?? []).map((source) => `${source.kind} ${source.ref}`).join(" "),
    note.body,
  ]
    .join("\n")
    .toLowerCase();
}

export function searchNotes(
  vaultPath: string,
  options: SearchOptions
): MemoryNote[] {
  const query = options.query.trim().toLowerCase();
  if (!query) {
    return [];
  }
  const terms = query.split(/\s+/).filter(Boolean);
  return listNotes(vaultPath, options).filter((note) => {
    const text = haystack(note);
    return terms.every((term) => text.includes(term));
  });
}
