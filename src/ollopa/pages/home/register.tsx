// Home registers itself with Product.tsx. The node id is IA-MAP's.
import type { PageComponent } from "../../Product"
import { HomePage } from "./HomePage"

export const nodes: Record<string, PageComponent> = {
  "P-home": ({ session }) => <HomePage session={session} />,
}
