// One markdown renderer for the whole site.
//
// Two things it does beyond rendering: every heading gets an id, so anchors written in the markdown
// land where they should, and every link between repository files is rewritten to the hash route
// that shows the same file. External links are left exactly as the author wrote them.
import { isValidElement, useMemo, type ComponentPropsWithoutRef, type ReactNode } from "react"
import ReactMarkdown, { type Components } from "react-markdown"
import remarkGfm from "remark-gfm"
import { assets, resolvePath, routeForFile, slugify, withAnchor } from "./content"

/** The text of a heading, whatever inline markup it contains. */
function textOf(node: ReactNode): string {
  if (node === null || node === undefined || typeof node === "boolean") return ""
  if (typeof node === "string" || typeof node === "number") return String(node)
  if (Array.isArray(node)) return node.map(textOf).join("")
  if (isValidElement(node)) return textOf((node.props as { children?: ReactNode }).children)
  return ""
}

export function scrollToId(id: string) {
  const el = document.getElementById(id)
  if (el) el.scrollIntoView({ block: "start", behavior: "smooth" })
}

const isAbsolute = (href: string) => /^[a-z][a-z0-9+.-]*:/i.test(href) || href.startsWith("//")

function heading(level: 1 | 2 | 3 | 4 | 5 | 6) {
  const Tag = `h${level}` as const
  return function Heading({ children }: ComponentPropsWithoutRef<"h1">) {
    return <Tag id={slugify(textOf(children))}>{children}</Tag>
  }
}

export function Markdown({ body, base }: { body: string; base: string }) {
  const components = useMemo<Components>(
    () => ({
      h1: heading(1),
      h2: heading(2),
      h3: heading(3),
      h4: heading(4),
      h5: heading(5),
      h6: heading(6),

      a({ href, children }) {
        const raw = href ?? ""

        // Off-site: untouched, opened in a new tab.
        if (isAbsolute(raw)) {
          return (
            <a href={raw} target="_blank" rel="noreferrer noopener">
              {children}
            </a>
          )
        }

        // In-page: the route lives in the hash, so scroll rather than navigate.
        if (raw.startsWith("#")) {
          const id = slugify(decodeURIComponent(raw.slice(1)))
          return (
            <a
              href={"#" + (location.hash.replace(/^#/, "") || "/")}
              onClick={(e) => {
                e.preventDefault()
                scrollToId(id)
                history.replaceState(null, "", location.href)
              }}
            >
              {children}
            </a>
          )
        }

        // Another file in the repository: the route that shows it, if the site publishes it.
        const [path, anchor = ""] = raw.split("#")
        const route = routeForFile(resolvePath(base, decodeURIComponent(path)))
        if (!route) return <span className="site-unpublished">{children}</span>
        return <a href={withAnchor(route, anchor && slugify(decodeURIComponent(anchor)))}>{children}</a>
      },

      img({ src, alt }) {
        const raw = typeof src === "string" ? src : ""
        const url = isAbsolute(raw) ? raw : assets[resolvePath(base, raw)]
        if (!url) return <span className="site-unpublished">{alt}</span>
        return <img src={url} alt={alt ?? ""} loading="lazy" />
      },

      // Wide tables scroll inside the measure instead of pushing the page sideways.
      table({ children }) {
        return (
          <div className="site-table">
            <table>{children}</table>
          </div>
        )
      },
    }),
    [base],
  )

  return (
    <div className="site-prose">
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
        {body}
      </ReactMarkdown>
    </div>
  )
}
