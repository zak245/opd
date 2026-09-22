// The one-line workspace-change announcement, shared by Home, the shell and Requests.
// One sentence, one link, and a dismiss: a change in the workspace is news, not an interruption, so
// it is one muted row and never an Alert card. On Home it rides inside the health strip's row
// instead, so the page never loses two rows to chrome.
import { useState } from "react"
import { Megaphone, X } from "lucide-react"
import { Button } from "@/components/ui/button"

export interface AnnouncementProps {
  text: string
  href?: string
}

export function Announcement({ text, href }: AnnouncementProps) {
  const [saidIt, setSaidIt] = useState(false)
  if (saidIt) return null
  return (
    <div className="t-small flex items-center gap-1.5 px-4 py-1.5 text-muted-foreground sm:px-6">
      <Megaphone className="size-3.5 shrink-0" aria-hidden="true" />
      <span className="min-w-0 flex-1 truncate">{text}</span>
      {href && (
        <Button asChild variant="link" size="sm" className="h-auto shrink-0 px-0 py-0">
          <a href={href}>Open</a>
        </Button>
      )}
      <Button variant="ghost" size="icon-xs" className="shrink-0" aria-label="Dismiss this notice" onClick={() => setSaidIt(true)}>
        <X aria-hidden="true" />
      </Button>
    </div>
  )
}
