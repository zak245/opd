// Everything the library site reads off disk: the rules file, the knowledge base, the case folders.
//
// The repository is the content management system. Markdown is loaded raw at build time, case
// folders are discovered the same way the lesson view discovers them, and every repo-relative link
// inside a document is rewritten to the hash route that shows the same file (see `routeForFile`).
import type { CaseMeta } from "@/learn/context"

type Raw = Record<string, string>

const asRaw = (m: Record<string, unknown>): Raw => m as Raw
const repoPath = (globKey: string) => globKey.replace(/^\.\.\/\.\.\//, "")

// Markdown, raw, at build time. Keys are repo-relative once stripped of the "../../" prefix.
const rootDocs = asRaw(import.meta.glob("../../{RULES,PLAN}.md", { query: "?raw", import: "default", eager: true }))
const kbDocs = asRaw(import.meta.glob("../../knowledge-base/*.md", { query: "?raw", import: "default", eager: true }))
const kbSourceDocs = asRaw(import.meta.glob("../../knowledge-base/sources/*.md", { query: "?raw", import: "default", eager: true }))
const caseDocs = asRaw(import.meta.glob("../../cases/*/README.md", { query: "?raw", import: "default", eager: true }))

// Case metadata, discovered exactly as the lesson view discovers it.
const caseModules = import.meta.glob("../../cases/*/case.ts", { eager: true }) as Record<string, { meta?: CaseMeta }>

// The two screenshots a case folder carries. URLs, so the bundler emits the files.
const caseShots = asRaw(
  import.meta.glob("../../cases/*/screens/step-{0,last}.png", { query: "?url", import: "default", eager: true }),
)

/** Every markdown file the site can render, by repo-relative path. */
export const docs: Raw = {}
for (const source of [rootDocs, kbDocs, kbSourceDocs, caseDocs]) {
  for (const [key, body] of Object.entries(source)) docs[repoPath(key)] = body
}

/** Every image a document may point at, by repo-relative path. */
export const assets: Raw = {}
for (const [key, url] of Object.entries(caseShots)) assets[repoPath(key)] = url

export function getDoc(path: string): string | undefined {
  return docs[path]
}

/** The first `# ` heading, which every file in this repository has. */
export function titleOf(body: string | undefined, fallback: string): string {
  const m = body ? /^#\s+(.+)$/m.exec(body) : null
  return m ? m[1].trim() : fallback
}

// ---------------------------------------------------------------- knowledge base

export interface KbEntry {
  /** "00-core-model" or "sources/01-foundations-and-definitions". */
  slug: string
  path: string
  title: string
}

function kbEntriesFrom(source: Raw, prefix: string): KbEntry[] {
  return Object.keys(source)
    .map(repoPath)
    .sort()
    .map((path) => ({
      slug: prefix + path.replace(/^knowledge-base\/(sources\/)?/, "").replace(/\.md$/, ""),
      path,
      title: titleOf(docs[path], path),
    }))
}

/** The synthesis layer: knowledge-base/*.md. */
export const kbSynthesis: KbEntry[] = kbEntriesFrom(kbDocs, "")
/** The research memos: knowledge-base/sources/*.md. */
export const kbSources: KbEntry[] = kbEntriesFrom(kbSourceDocs, "sources/")

export function kbPath(slug: string): string {
  return `knowledge-base/${slug}.md`
}

// ---------------------------------------------------------------- cases

export interface CaseEntry {
  id: string
  title: string
  summary: string
  /** Set when the folder has a README.md to render at #/cases/<id>. */
  hasReadme: boolean
  /** Set when the folder has a case.ts, which is what the lesson view needs. */
  hasLesson: boolean
  stepFirst?: string
  stepLast?: string
}

const idFrom = (globKey: string) => repoPath(globKey).split("/")[1]
/** TEMPLATE is the blank a contributor copies; a leading underscore means work in progress. */
const isCase = (id: string) => id !== "TEMPLATE" && !id.startsWith("_")

export function listCases(): CaseEntry[] {
  const ids = new Set<string>()
  for (const key of [...Object.keys(caseModules), ...Object.keys(caseDocs)]) {
    const id = idFrom(key)
    if (isCase(id)) ids.add(id)
  }
  return [...ids].sort().map((id) => {
    const meta = caseModules[`../../cases/${id}/case.ts`]?.meta
    const readme = docs[`cases/${id}/README.md`]
    return {
      id,
      title: meta?.title ?? titleOf(readme, id).replace(/^Case:\s*/i, ""),
      summary: meta?.summary ?? firstSentence(readme),
      hasReadme: readme !== undefined,
      hasLesson: meta !== undefined,
      stepFirst: assets[`cases/${id}/screens/step-0.png`],
      stepLast: assets[`cases/${id}/screens/step-last.png`],
    }
  })
}

/** Fallback summary for a folder whose case.ts has not landed yet: the first real sentence of its README. */
function firstSentence(body: string | undefined): string {
  if (!body) return ""
  for (const line of body.split("\n").slice(1)) {
    const t = line.trim()
    if (!t || t.startsWith("#") || t.startsWith("*") || t.startsWith("|") || t.startsWith(">")) continue
    const stop = t.indexOf(". ")
    return stop > 0 ? t.slice(0, stop + 1) : t
  }
  return ""
}

// ---------------------------------------------------------------- PLAN.md section 5

/** The definition of done, lifted from PLAN.md so the checklist has exactly one home. */
export function planSection(number: number): string {
  const plan = docs["PLAN.md"] ?? ""
  const start = plan.search(new RegExp(`^## ${number}\\.`, "m"))
  if (start < 0) return ""
  const rest = plan.slice(start)
  const end = rest.search(new RegExp(`^## ${number + 1}\\.`, "m"))
  return (end < 0 ? rest : rest.slice(0, end)).replace(/\n---\s*$/, "").trim()
}

// ---------------------------------------------------------------- links between files

/** Resolve a relative markdown link against the file it appears in. */
export function resolvePath(fromFile: string, href: string): string {
  const dir = fromFile.includes("/") ? fromFile.slice(0, fromFile.lastIndexOf("/")) : ""
  const joined = href.startsWith("/") ? href.slice(1) : (dir ? dir + "/" : "") + href
  const out: string[] = []
  for (const part of joined.split("/")) {
    if (part === "" || part === ".") continue
    if (part === "..") out.pop()
    else out.push(part)
  }
  return out.join("/") + (href.endsWith("/") ? "/" : "")
}

/** The hash route that shows a repo file, or null when the site does not publish it. */
export function routeForFile(path: string): string | null {
  const clean = path.replace(/\/+$/, "")
  if (clean === "RULES.md") return "#/"
  if (clean === "README.md") return "#/kb"
  if (clean === "knowledge-base" || clean === "knowledge-base/sources") return "#/kb"
  if (clean === "cases") return "#/cases"
  if (clean === "cases/TEMPLATE/README.md") return "#/contribute"

  const kb = /^knowledge-base\/(sources\/)?([^/]+)\.md$/.exec(clean)
  if (kb) return `#/kb/${kb[1] ?? ""}${kb[2]}`

  const one = /^cases\/([^/]+)\/README\.md$/.exec(clean)
  if (one && isCase(one[1])) return `#/cases/${one[1]}`

  return null
}

/** A link into a heading of another page. The route lives in the hash, so the anchor travels as a query. */
export function withAnchor(route: string, anchor: string): string {
  if (!anchor) return route
  return route + (route.includes("?") ? "&" : "?") + "a=" + encodeURIComponent(anchor)
}

/** GitHub-style heading slug, so anchors written in the markdown keep working. */
export function slugify(text: string): string {
  return text
    .trim()
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s-]/gu, "")
    .replace(/\s+/g, "-")
    .replace(/^-+|-+$/g, "")
}
