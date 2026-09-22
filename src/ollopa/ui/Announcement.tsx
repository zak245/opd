// The one-line workspace-change announcement, shared by Home, the shell and Requests.
// One sentence, one link, no dismissal ceremony: a change in the workspace is news, not an interruption.
// Drawn as shadcn's Alert, like every other thing that speaks to the person from the top of a page.
import { Megaphone } from "lucide-react"
import { Alert, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"

export interface AnnouncementProps {
  text: string
  href?: string
}

export function Announcement({ text, href }: AnnouncementProps) {
  return (
    <div className="border-b p-4 sm:px-6">
      <Alert className="flex items-center gap-3 py-2">
        <Megaphone />
        <AlertTitle className="line-clamp-none min-w-0 flex-1 font-normal">{text}</AlertTitle>
        {href && (
          <Button asChild variant="link" size="sm" className="shrink-0 px-0">
            <a href={href}>Open</a>
          </Button>
        )}
      </Alert>
    </div>
  )
}
