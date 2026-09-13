import { useEffect, useState } from "react"
import { useSession } from "./session"
import { useRoute } from "@/app/router"
import { SignIn } from "./pages/SignIn"
import { AppShell, NoAccess } from "./shell/AppShell"
import { Home } from "./pages/Home"
import { People, Companies, Sequences, Tasks, InboxPage, Lists } from "./pages/tables"
import { navFor } from "./nav"
import type { Page } from "./usage/model"

/** Pages not yet built in this iteration render their name with the real seed counts, so navigation stays whole. */
function Soon({ page }: { page: Page }) {
  return <div className="p-6 text-sm text-muted-foreground">{page} is being built.</div>
}

function Toaster() {
  const [msg, setMsg] = useState<string | null>(null)
  useEffect(() => {
    let t: number | undefined
    const on = (e: Event) => { setMsg((e as CustomEvent<string>).detail); window.clearTimeout(t); t = window.setTimeout(() => setMsg(null), 2200) }
    document.addEventListener("ollopa:toast", on)
    return () => document.removeEventListener("ollopa:toast", on)
  }, [])
  return (
    <div role="status" aria-live="polite" className={"pointer-events-none fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-md bg-foreground px-3 py-2 text-sm text-background shadow-lg transition-opacity " + (msg ? "opacity-100" : "opacity-0")}>{msg}</div>
  )
}

export function Product() {
  const session = useSession()
  const route = useRoute()
  if (!session) return <SignIn />
  const page = ((route.path[1] as Page | undefined) ?? "home") as Page
  const allowed = navFor(session.role).some((n) => n.page === page || (page === "deal" && n.page === "deals") || (page === "connect" && n.page === "settings"))

  let body
  if (!allowed) body = <NoAccess session={session} page={page} />
  else if (page === "home") body = <Home session={session} />
  else if (page === "people") body = <People session={session} />
  else if (page === "companies") body = <Companies session={session} />
  else if (page === "sequences") body = <Sequences session={session} />
  else if (page === "tasks") body = <Tasks session={session} />
  else if (page === "inbox") body = <InboxPage session={session} />
  else if (page === "lists") body = <Lists session={session} />
  else body = <Soon page={page} />

  return (
    <AppShell session={session} page={page}>
      {body}
      <Toaster />
    </AppShell>
  )
}
