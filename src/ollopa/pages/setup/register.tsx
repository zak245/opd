// The set-up node, for when set-up is reached from inside the product rather than before it.
//
// `Product.tsx` renders set-up without the shell only while the trail is empty — a fresh workspace,
// a deep link, a pasted URL. An admin who followed "Change the answers" from Settings is in the
// middle of something, so the route resolves through the map like any other page and lands here,
// inside the shell, with the crumb back to the row above it.
import type { PageComponent } from "../../Product"
import { WorkspaceSetup } from "./WorkspaceSetup"

export const nodes: Record<string, PageComponent> = {
  "W-setup": ({ session }) => <WorkspaceSetup session={session} inShell />,
}
