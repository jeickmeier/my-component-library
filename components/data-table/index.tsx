"use client";

// Import CSS
import "./ui/tooltips.css";

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
  StarRatingColumnFilter,
} from "./types";

// Export all sub-components (for those who want direct access)
export { DataTable, createColumn };
export { DataTableToolbar } from "./ui/toolbar/Toolbar";
export { DataTableGroupingControl, TableCustomizationControl } from "./ui/toolbar/TableCustomizationControl";
export { DataTableStructure } from "./core/Structure";
export { DataTableFooter } from "./ui/Footer";
export { useDataTableLogic } from "./hooks/useDataTableLogic";
export { useTableVirtualization } from "./hooks/useTableVirtualization";
export { useStickyGroupHeaders } from "./hooks/useStickyGroupHeaders";
