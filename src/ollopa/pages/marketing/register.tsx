// The marketing folder's nodes: Campaigns with its three objects, and Workflows with its record.
import type { PageComponent } from "../../Product"
import { CampaignsPage } from "./CampaignsPage"
import { CampaignRecord } from "./CampaignRecord"
import { AudienceRecord } from "./AudienceRecord"
import { FormRecord } from "./FormRecord"
import { WorkflowsPage } from "./WorkflowsPage"
import { WorkflowRecord } from "./WorkflowRecord"

export const nodes: Record<string, PageComponent> = {
  "P-campaigns": CampaignsPage,
  "R-campaign": CampaignRecord,
  "R-audience": AudienceRecord,
  "R-form": FormRecord,
  "P-workflows": WorkflowsPage,
  "R-workflow": WorkflowRecord,
}
