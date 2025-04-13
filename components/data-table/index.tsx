/**
 * Main entry point for the data table component library. Exports the core DataTable component,
 * utility functions, types, cell renderers, and toolbar components for building customizable
 * and interactive data tables with filtering, grouping, and custom rendering capabilities.
 */

"use client";

// Import CSS
import "@/components/data-table/ui/tooltips.css";

// Export types
export type {
  DataTableProps,
  ColumnFilter,
  FilterOption,
  SelectColumnFilter,
  RangeColumnFilter,
  RangeSliderColumnFilter,
  StarRatingColumnFilter,
} from "@/components/data-table/types";

// Export main component and essential utilities
export { DataTable } from "@/components/data-table/core/DataTable";
export { createColumn } from "@/components/data-table/utils/columnUtils";

// Export cell renderers
export {
  createMoneyRenderer,
  createCategoryRenderer,
  createStarRatingRenderer,
  createDateRenderer,
  createExtentRenderer,
} from "@/components/data-table/ui/cell-renderers";

// Export essential toolbar components
export { DataTableToolbar } from "@/components/data-table/ui/toolbar/Toolbar";
export { DataTableGroupingControl } from "@/components/data-table/ui/toolbar/TableCustomizationControl";
