// The second kind of "cannot see it": an area your seat does not hold.
//
// One answer, and only this one. There is no read-only-by-link view of an area anywhere in Ollopa,
// and no greyed control. The page names what it is for, which seats use it, and the person who can
// change it — never "ask your admin" with nobody named.
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { navigate } from "@/app/router"
import { businessById } from "../data/businesses"
import { navItem } from "../nav"
import { seatsSentence } from "../map"
import type { Page } from "../usage/model"
import type { Session } from "../session"

export function NoAccess({ session, page }: { session: Session; page: Page }) {
  const b = businessById(session.business)
  const item = navItem(page)
  const admin = b.roles.find((r) => r.role === "admin")
  const label = item?.label ?? "That area"
  const who = seatsSentence(page)
  const [copied, setCopied] = useState(false)
  const isAdmin = session.role === "admin"

  const request = `Please add ${label} to my seat in Ollopa (${b.name}). — ${session.user}`

  return (
    <div className="max-w-xl px-6 py-10">
      <h2 className="text-lg font-semibold">{label} is not part of your seat</h2>
      <p className="mt-3 text-sm text-muted-foreground">
        It is used by: {who}.{" "}
        {isAdmin
          ? "You can add it to your seat in Settings › Team and access › Permission profiles."
          : `If you need it, ask ${admin ? `${admin.user} (${admin.title})` : "your admin"} to change your permissions.`}
      </p>
      <div className="mt-6 flex flex-wrap gap-2">
        <Button variant="outline" onClick={() => navigate("/ollopa")}>Back to Home</Button>
        {isAdmin ? (
          <Button variant="outline" onClick={() => navigate("/ollopa/settings/team")}>Open Team and access</Button>
        ) : (
          <Button
            variant="outline"
            onClick={() => {
              navigator.clipboard?.writeText(request).catch(() => { /* clipboard blocked: the line is on screen below */ })
              setCopied(true)
            }}
          >
            Copy a request for {admin?.user.split(" ")[0] ?? "your admin"}
          </Button>
        )}
      </div>
      {copied && <p className="mt-3 text-sm text-muted-foreground">Copied: “{request}”</p>}
    </div>
  )
}
