// This folder holds states rather than nodes: the first-run empty state any page can render, the
// sentences the no-access page and the placeholder share,  It registers no node ids of its own — every node here belongs to a page builder — and sits in `pages/`
// beside the pages that use it.
import type { PageComponent } from "../../Product"

export const nodes: Record<string, PageComponent> = {}

export { FirstRunState, firstRunFor, rowsFor, type FirstRun } from "./empty"
export { PURPOSE, STILL_CAN } from "./pages"
