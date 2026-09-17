// The six nodes this folder owns. Product.tsx picks the map up from here; nothing else needs editing.
import type { PageComponent } from "../../Product"
import { ListsPage } from "./Lists"
import { ListRecord } from "./ListRecord"
import { SequencesPage } from "./Sequences"
import { SequenceRecord } from "./SequenceRecord"
import { TemplatesPage } from "./Templates"
import { TemplateRecord } from "./TemplateRecord"

export const nodes: Record<string, PageComponent> = {
  "P-lists": ListsPage,
  "R-list": ListRecord,
  "P-sequences": SequencesPage,
  "R-sequence": SequenceRecord,
  "P-templates": TemplatesPage,
  "R-template": TemplateRecord,
}
