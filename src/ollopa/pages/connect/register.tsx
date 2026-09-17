// The nodes this folder owns, by the ids IA-MAP part 2 uses.
//
// Two wizards, two records and the six surfaces with no screen of their own. `R-enrichment-job` is
// registered beside `R-job` because both names are in use for the same node; the map's id is `R-job`.
import type { PageComponent } from "../../Product"
import { ConnectWizard } from "./ConnectWizard"
import { IntegrationRecord } from "./IntegrationRecord"
import { ImportWizard } from "./ImportWizard"
import { JobRecord } from "./JobRecord"
import { DeveloperSurfaces } from "./Developer"

const surface = (node: string): PageComponent => ({ session }) => <DeveloperSurfaces session={session} node={node} />

export const nodes: Record<string, PageComponent> = {
  "W-connect": ({ session, id }) => <ConnectWizard session={session} id={id} />,
  "R-integration": ({ session, id }) => <IntegrationRecord session={session} id={id} />,
  "W-import": ({ session }) => <ImportWizard session={session} />,
  "R-job": ({ session, id }) => <JobRecord session={session} id={id} />,
  "R-enrichment-job": ({ session, id }) => <JobRecord session={session} id={id} />,
  "U-api": surface("U-api"),
  "U-hooks": surface("U-hooks"),
  "U-webhook": surface("U-hooks"),
  "U-mcp": surface("U-mcp"),
  "U-cli": surface("U-cli"),
  "U-slack": surface("U-slack"),
  "U-digest": surface("U-digest"),
}
