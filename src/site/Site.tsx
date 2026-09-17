// The library site: the rules, the cases, the knowledge base, and how to add a case.
//
// Routes (hash, one static build — PLAN.md §7):
//   #/              RULES.md as the front page
//   #/cases         every case folder      #/cases/<id>   that case's README
//   #/kb            the knowledge base     #/kb/<slug>    one document
//   #/contribute    the case template plus the definition of done from PLAN.md §5
import { useEffect, useMemo, type ReactNode } from "react"
import { useRoute } from "@/app/router"
import { applyTheme } from "@/ollopa/session"
import { Markdown, scrollToId } from "./Markdown"
import { getDoc, kbPath, kbSources, kbSynthesis, listCases, planSection, slugify, titleOf } from "./content"
import "./site.css"

const NAV = [
  { href: "#/", label: "Rules", top: "" },
  { href: "#/cases", label: "Cases", top: "cases" },
  { href: "#/kb", label: "Knowledge base", top: "kb" },
  { href: "#/contribute", label: "Contribute", top: "contribute" },
]

export function Site() {
  const route = useRoute()
  const top = route.path[0] ?? ""
  const key = route.path.join("/")
  const anchor = route.query.get("a")

  // The product owns the theme; the site follows it so the two surfaces never disagree.
  useEffect(() => { applyTheme() }, [])

  // A new page starts at the top. A link into a heading starts at that heading.
  useEffect(() => {
    if (anchor) {
      const t = setTimeout(() => scrollToId(anchor), 60)
      return () => clearTimeout(t)
    }
    window.scrollTo({ top: 0 })
  }, [key, anchor])

  return (
    <div className="site flex min-h-dvh flex-col bg-background text-foreground">
      <header className="site-header sticky top-0 z-20 border-b border-border bg-background/90 backdrop-blur">
        <div className="mx-auto flex max-w-3xl flex-wrap items-center gap-x-5 gap-y-2 px-5 py-3">
          <a href="#/" className="text-sm font-semibold tracking-tight">
            OPD
          </a>
          <nav aria-label="Library" className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm">
            {NAV.map((l) => (
              <a
                key={l.href}
                href={l.href}
                aria-current={l.top === top ? "page" : undefined}
                className={
                  l.top === top
                    ? "font-medium text-foreground underline underline-offset-4"
                    : "text-muted-foreground hover:text-foreground"
                }
              >
                {l.label}
              </a>
            ))}
          </nav>
          <a
            href="#/ollopa"
            className="ml-auto rounded-md border border-border px-3 py-1.5 text-sm font-medium hover:bg-accent"
          >
            Open Ollopa
          </a>
        </div>
      </header>

      <main className="mx-auto w-full max-w-3xl flex-1 px-5 py-10 sm:py-12">
        <Page top={top} route={route.path} />
      </main>

      <footer className="mt-16 border-t border-border">
        <div className="mx-auto flex max-w-3xl flex-wrap gap-x-5 gap-y-2 px-5 py-6 text-sm text-muted-foreground">
          <span>OPD · Open Progressive Disclosure</span>
          <a className="hover:text-foreground" href="#/cases">Cases</a>
          <a className="hover:text-foreground" href="#/kb">Knowledge base</a>
          <a className="hover:text-foreground" href="#/contribute">Add a case</a>
          <a className="hover:text-foreground" href="#/ollopa">Open Ollopa</a>
        </div>
      </footer>
    </div>
  )
}

function Page({ top, route }: { top: string; route: string[] }) {
  if (top === "") return <Home />
  if (top === "cases") return route[1] ? <CaseReadme id={route[1]} /> : <Cases />
  if (top === "kb") return route.length > 1 ? <KbDoc slug={route.slice(1).join("/")} /> : <Kb />
  if (top === "contribute") return <Contribute />
  return (
    <NotFound
      title="No such page"
      body="The library has the rules, the cases, the knowledge base and the contribution guide."
    />
  )
}

// ---------------------------------------------------------------- the front page

function Home() {
  const rules = getDoc("RULES.md") ?? ""
  const contents = useMemo(() => [...rules.matchAll(/^##\s+(.+)$/gm)].map((m) => m[1].trim()), [rules])

  useEffect(() => { document.title = "OPD · the rules of progressive disclosure" }, [])

  return (
    <>
      <section className="max-w-[70ch]">
        <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
          Open Progressive Disclosure
        </p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
          Eight rules, the evidence for each, and screens that show them working.
        </h1>
        <p className="mt-4 text-base leading-relaxed text-muted-foreground sm:text-lg">
          OPD is an open library. The rules below are the whole method; every one carries the studies
          it rests on and a test you can run on any screen. A case takes one real screen and changes
          it one rule at a time, so you can watch what moves and read why. The screens are pages of
          Ollopa, a sales platform built to the rules, which you can open and use.
        </p>
        <div className="mt-6 flex flex-wrap gap-3 text-sm">
          <Cta href="#/cases" primary>Read the cases</Cta>
          <Cta href="#/kb">The knowledge base</Cta>
          <Cta href="#/contribute">Add a case</Cta>
          <Cta href="#/ollopa">Open Ollopa</Cta>
        </div>
      </section>

      {contents.length > 0 && (
        <nav aria-label="On this page" className="mt-10 max-w-[70ch] rounded-lg border border-border p-4">
          <h2 className="text-xs font-medium uppercase tracking-widest text-muted-foreground">On this page</h2>
          <ul className="mt-3 grid gap-x-6 gap-y-1.5 text-sm sm:grid-cols-2">
            {contents.map((h) => (
              <li key={h}>
                <a className="text-muted-foreground hover:text-foreground hover:underline" href={`#/?a=${slugify(h)}`}>
                  {h}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      )}

      <hr className="my-10 border-border" />
      <Markdown body={rules} base="RULES.md" />
    </>
  )
}

function Cta({ href, children, primary }: { href: string; children: ReactNode; primary?: boolean }) {
  return (
    <a
      href={href}
      className={
        "rounded-md border px-3.5 py-2 font-medium " +
        (primary
          ? "border-primary bg-primary text-primary-foreground hover:opacity-90"
          : "border-border hover:bg-accent")
      }
    >
      {children}
    </a>
  )
}

// ---------------------------------------------------------------- cases

function Cases() {
  const cases = useMemo(() => listCases(), [])
  useEffect(() => { document.title = "Cases · OPD" }, [])

  return (
    <>
      <Lede
        title="Cases"
        body="One screen per case. Step 0 is the version most teams ship; each step after it applies exactly one rule, to the same page, from the same data. Open the lesson to walk it, or read the case for the task, the numbers and the review."
      />
      {cases.length === 0 ? (
        <NotFound
          title="No cases have landed yet"
          body="A case is a folder under cases/. The template and the checklist are on the contribute page."
        />
      ) : (
        <ul className="mt-10 grid gap-6">
          {cases.map((c) => (
            <li key={c.id} className="site-card rounded-lg border border-border p-5 sm:p-6">
              <h2 className="text-xl font-semibold tracking-tight">{c.title}</h2>
              {c.summary && <p className="mt-2 max-w-[70ch] text-muted-foreground">{c.summary}</p>}

              {(c.stepFirst || c.stepLast) && (
                <div className="mt-5 grid gap-4 sm:grid-cols-2">
                  <Shot src={c.stepFirst} caption="Step 0 · the common version" alt={`${c.title}, before any rule`} />
                  <Shot src={c.stepLast} caption="Last step · every rule applied" alt={`${c.title}, after the rules`} />
                </div>
              )}

              <div className="mt-5 flex flex-wrap items-center gap-3 text-sm">
                {c.hasLesson ? (
                  <Cta href={`#/learn/${c.id}`} primary>Open the lesson</Cta>
                ) : (
                  <span className="text-muted-foreground">The lesson lands with this case's case.ts.</span>
                )}
                {c.hasReadme && <Cta href={`#/cases/${c.id}`}>Read the case</Cta>}
              </div>
            </li>
          ))}
        </ul>
      )}
    </>
  )
}

function Shot({ src, caption, alt }: { src?: string; caption: string; alt: string }) {
  if (!src) {
    return (
      <figure>
        <div className="flex aspect-[16/10] items-center justify-center rounded-md border border-dashed border-border p-4 text-center text-sm text-muted-foreground">
          Screenshot not taken yet.
        </div>
        <figcaption className="mt-2 text-sm text-muted-foreground">{caption}</figcaption>
      </figure>
    )
  }
  return (
    <figure>
      <img
        src={src}
        alt={alt}
        loading="lazy"
        className="aspect-[16/10] w-full rounded-md border border-border bg-muted object-cover object-top"
      />
      <figcaption className="mt-2 text-sm text-muted-foreground">{caption}</figcaption>
    </figure>
  )
}

function CaseReadme({ id }: { id: string }) {
  const entry = useMemo(() => listCases().find((c) => c.id === id), [id])
  const body = getDoc(`cases/${id}/README.md`)
  useEffect(() => { document.title = `${entry?.title ?? id} · OPD` }, [entry, id])

  if (!body) {
    return <NotFound title="No such case" body={`There is no cases/${id}/README.md in the repository.`} />
  }
  return (
    <>
      <Back href="#/cases" label="All cases" />
      {entry?.hasLesson && (
        <div className="mb-8 flex flex-wrap gap-3 text-sm">
          <Cta href={`#/learn/${id}`} primary>Open the lesson</Cta>
        </div>
      )}
      <Markdown body={body} base={`cases/${id}/README.md`} />
    </>
  )
}

// ---------------------------------------------------------------- knowledge base

function Kb() {
  useEffect(() => { document.title = "Knowledge base · OPD" }, [])
  return (
    <>
      <Lede
        title="The knowledge base"
        body="The evidence layer. Every quote in a case comes from one of these files; if a sentence is not here, it is not used. The synthesis is first, the research memos behind it are second."
      />
      <KbList title="The synthesis" entries={kbSynthesis} />
      <KbList title="Source memos and sweeps" entries={kbSources} />
    </>
  )
}

function KbList({ title, entries }: { title: string; entries: { slug: string; title: string }[] }) {
  if (entries.length === 0) return null
  return (
    <section className="mt-10">
      <h2 className="text-xs font-medium uppercase tracking-widest text-muted-foreground">{title}</h2>
      <ul className="mt-3 divide-y divide-border border-y border-border">
        {entries.map((e) => (
          <li key={e.slug}>
            <a href={`#/kb/${e.slug}`} className="flex flex-wrap items-baseline gap-x-3 gap-y-1 py-3 hover:bg-accent">
              <span className="font-medium">{e.title}</span>
              <span className="text-sm text-muted-foreground">{e.slug}</span>
            </a>
          </li>
        ))}
      </ul>
    </section>
  )
}

function KbDoc({ slug }: { slug: string }) {
  const path = kbPath(slug)
  const body = getDoc(path)
  useEffect(() => { document.title = `${titleOf(body, slug)} · OPD` }, [body, slug])

  if (!body) {
    return <NotFound title="No such document" body={`There is no ${path} in the repository.`} />
  }
  return (
    <>
      <Back href="#/kb" label="Knowledge base" />
      <Markdown body={body} base={path} />
    </>
  )
}

// ---------------------------------------------------------------- contribute

function Contribute() {
  const template = getDoc("cases/TEMPLATE/README.md") ?? ""
  const done = useMemo(() => planSection(5), [])
  useEffect(() => { document.title = "Add a case · OPD" }, [])

  return (
    <>
      <Lede
        title="Add a case"
        body="A case is a folder under cases/: the README below with every section filled, case.ts, steps.ts, scores.ts and two screenshots. Copy cases/TEMPLATE/, fill it in, and walk the checklist at the bottom with someone who did not build it."
      />
      <div className="mt-10">
        <h2 className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
          The template · cases/TEMPLATE/README.md
        </h2>
        <div className="mt-4">
          <Markdown body={template} base="cases/TEMPLATE/README.md" />
        </div>
      </div>
      {done && (
        <div className="mt-12 border-t border-border pt-10">
          <h2 className="text-xs font-medium uppercase tracking-widest text-muted-foreground">From PLAN.md</h2>
          <div className="mt-4">
            <Markdown body={done} base="PLAN.md" />
          </div>
        </div>
      )}
    </>
  )
}

// ---------------------------------------------------------------- small parts

function Lede({ title, body }: { title: string; body: string }) {
  return (
    <section className="max-w-[70ch]">
      <h1 className="text-3xl font-semibold tracking-tight">{title}</h1>
      <p className="mt-4 text-base leading-relaxed text-muted-foreground sm:text-lg">{body}</p>
    </section>
  )
}

function Back({ href, label }: { href: string; label: string }) {
  return (
    <a href={href} className="mb-8 inline-block text-sm text-muted-foreground hover:text-foreground">
      ← {label}
    </a>
  )
}

function NotFound({ title, body }: { title: string; body: string }) {
  return (
    <section className="mt-10 max-w-[70ch] rounded-lg border border-border p-6">
      <h2 className="text-lg font-semibold">{title}</h2>
      <p className="mt-2 text-muted-foreground">{body}</p>
      <p className="mt-4 text-sm">
        <a className="underline underline-offset-4" href="#/">Back to the rules</a>
      </p>
    </section>
  )
}
