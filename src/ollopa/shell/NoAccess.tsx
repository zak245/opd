// The second kind of "cannot see it": an area your seat does not hold.
//
// There are three kinds and they are never confused (RULES.md, the declared sidebar):
//   1. An object you do not own opens and reads normally, with the edit controls absent and one
//      line naming the owner. That is the record's own page, not this one.
//   2. An area your seat does not hold is this page, and this page is the only answer: there is no
//      read-only-by-link view of an area anywhere in Ollopa and no greyed control.
//   3. A page the workspace profile left out is not a gap at all. It opens as normal and its header
//      offers "Add to sidebar", so it never lands here.
//
// So the wording here has to be unmistakably the second kind: what the area is for, which seats work
// in it, the person who can change it — named, never "ask your admin" with nobody named — and what
// this seat can still do instead, where that is true.
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { navigate } from "@/app/router"
import { businessById } from "../data/businesses"
import { navItem, seatCarries } from "../nav"
import { seatsSentence } from "../map"
import { PURPOSE, STILL_CAN } from "../pages/states/pages"
import type { Page } from "../usage/model"
import type { Session } from "../session"

export function NoAccess({ session, page }: { session: Session; page: Page }) {
  const b = businessById(session.business)
  const item = navItem(page)
  const admin = b.roles.find((r) => r.role === "admin")
  const label = item?.label ?? "That area"
  const who = seatsSentence(page)
  const purpose = PURPOSE[page]
  const still = STILL_CAN[page]
  const stillCan = still && seatCarries(still.instead, session.business, session.role) ? still.text : null
  const [copied, setCopied] = useState(false)
  const isAdmin = session.role === "admin"

  const request = `Please add ${label} to my seat in Ollopa (${b.name}). — ${session.user}`

  const copy = () => {
    navigator.clipboard?.writeText(request).catch(() => { /* clipboard blocked: the line is on screen below */ })
    setCopied(true)
    document.dispatchEvent(new CustomEvent("ollopa:toast", { detail: `Copied · request for ${admin?.user ?? "your admin"}` }))
  }

  return (
    <div className="max-w-xl px-4 py-8 sm:px-6 sm:py-10">
      <h2 className="text-lg font-semibold">{label} is not part of your seat</h2>
      {purpose && <p className="mt-3 text-sm">{purpose}</p>}
      <p className="mt-3 text-sm text-muted-foreground">
        It is used by: {who}.{" "}
        {isAdmin
          ? "You can add it to your seat in Settings › Team and access › Permission profiles."
          : `If you need it, ask ${admin ? `${admin.user} (${admin.title})` : "your admin"} to change your permissions.`}
      </p>
      {stillCan && <p className="mt-2 text-sm text-muted-foreground">{stillCan}</p>}

      <div className="mt-6 flex flex-wrap gap-2">
        <Button variant="outline" className="max-sm:w-full" onClick={() => navigate("/ollopa")}>Back to Home</Button>
        {isAdmin ? (
          <Button variant="outline" className="max-sm:w-full" onClick={() => navigate("/ollopa/settings/team")}>Open Team and access</Button>
        ) : (
          <Button variant="outline" className="max-sm:w-full" onClick={copy}>
            Copy a request for {admin?.user.split(" ")[0] ?? "your admin"}
          </Button>
        )}
      </div>
      {copied && (
        <p className="mt-3 text-sm text-muted-foreground">Copied: “{request}” Send it to {admin?.user ?? "your admin"}.</p>
      )}
    </div>
  )
}
