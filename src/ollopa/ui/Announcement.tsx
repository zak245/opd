// The one-line workspace-change announcement, shared by Home, the shell and Requests.
// One sentence, one link, no dismissal ceremony: a change in the workspace is news, not an interruption.
export interface AnnouncementProps {
  text: string
  href?: string
}

export function Announcement({ text, href }: AnnouncementProps) {
  return (
    <div className="border-b bg-muted/40 px-6 py-2 text-xs text-muted-foreground">
      {text}
      {href && <> <a className="font-medium text-foreground underline underline-offset-2" href={href}>Open</a></>}
    </div>
  )
}
