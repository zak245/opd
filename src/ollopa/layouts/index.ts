// The layout system. A page declares its type and fills its parts; it never lays itself out.
// The contract is LAYOUTS.md; the usage is README.md beside this file.

// The parts (LAYOUTS.md §2)
export { PageHeader, StatusRow, Toolbar, SummaryStrip, Section, Container, Group, Rows, SideRail, PageFooter, usePhone } from "./parts"
export type { PageHeaderProps, ToolbarControl, SummaryFigure, SectionProps } from "./parts"

// Which columns a table draws at this width (LAYOUTS.md §5, §6)
export { useColumnFit, useFitColumns, useBand } from "./columns"
export { MetaLine } from "./MetaLine"
export type { MetaValue } from "./MetaLine"
export type { ColumnPriority, Band } from "./columns"

// The filter on a section inside a record: tabs above `md`, one Select below it
export { SectionFilter } from "./SectionFilter"
export type { SectionFilterProps, SectionFilterOption } from "./SectionFilter"

// A table that becomes a divided list below `md` (LAYOUTS.md §5)
export { RowsTable } from "./RowsTable"
export type { RowsTableProps, RowsColumn } from "./RowsTable"

// The frame: the measure a template sets, never a page
export { Measured, PageScroll, type Measure } from "./frame"

// The interactions with an affordance of their own (LAYOUTS.md §4)
export { Split, SplitHandle, type SplitProps } from "./SplitHandle"
export { DragGrip, type DragGripProps } from "./DragGrip"

// The templates (LAYOUTS.md §1)
export { IndexPage, type IndexPageProps } from "./IndexPage"
export { MasterDetail, QueuePage, BoardPage, HomeGrid } from "./MasterDetail"
export type { MasterDetailProps, QueuePageProps, BoardPageProps, BoardStage } from "./MasterDetail"
export { HomePage, WizardPage, SettingsPage, FormSheet } from "./pages"
export type { HomePageProps, WizardPageProps, WizardStep, SettingsPageProps, SettingsArea, FormSheetProps } from "./pages"
