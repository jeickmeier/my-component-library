"use client";

// Import from core directory
import { DataTable } from "./core/DataTable";

// Import utility functions
import { createColumn } from "./utils/columnUtils";

// Export types
export type {
  DataTableProps,
  ColumnFilter,
  FilterOption,
  SelectColumnFilter,
  RangeColumnFilter,
} from "./types";

// Export all sub-components (for those who want direct access)
export { DataTable, createColumn };
export { DataTableToolbar } from "./ui/Toolbar";
export { DataTableGroupingControl } from "./ui/GroupingControl";
export { DataTableStructure } from "./core/Structure";
export { DataTableFooter } from "./ui/Footer";
export { useDataTableLogic } from "./hooks/useDataTableLogic";
export { useTableVirtualization } from "./hooks/useTableVirtualization";
export { useStickyGroupHeaders } from "./hooks/useStickyGroupHeaders";
export { useTableStyles } from "./utils/tableStyles";
