/**
 * Main DataTable component that orchestrates all the table functionality.
 * Integrates hooks, state management, and UI components to create a fully featured
 * data table with sorting, filtering, grouping, and virtualization capabilities.
 */

"use client";

import * as React from "react";

// Import types
import { DataTableProps } from "@/components/data-table/types";
import { Table as ReactTable } from "@tanstack/react-table";

// Import sub-components
import { DataTableToolbar } from "@/components/data-table/ui/toolbar/Toolbar";
import { DataTableStructure } from "@/components/data-table/core/Structure";
import { DataTableFooter } from "@/components/data-table/ui/footer/Footer";

// Import the custom hook
import { useDataTableLogic } from "@/components/data-table/hooks/useDataTableLogic";

// --- Main DataTable Component ---
export function DataTable<TData, TValue>(props: DataTableProps<TData, TValue>) {
  const {
    table,
    rows,
    isClient,
    grouping,
    globalFilter,
    setGlobalFilter,
    isGroupingDialogOpen: isCustomizationDialogOpen,
    setIsGroupingDialogOpen: setIsCustomizationDialogOpen,
    tableContainerRef,
    headerRef,
    rowRefsMap,
    isMountedRef,
    groupableColumnObjects,
    discoveredColumnFilters,
  } = useDataTableLogic(props); // Use the hook

  // Destructure props needed here or pass `props` down
  const { columns, data, enableGrouping = false, containerHeight } = props;

  return (
    <div className="space-y-1">
      {/* Consolidated Toolbar */}
      <DataTableToolbar
        table={table as unknown as ReactTable<unknown>}
        columnFilters={discoveredColumnFilters}
        globalFilter={globalFilter}
        setGlobalFilter={setGlobalFilter}
        groupableColumnObjects={groupableColumnObjects}
        isCustomizationDialogOpen={isCustomizationDialogOpen}
        setIsCustomizationDialogOpen={setIsCustomizationDialogOpen}
        enableCustomization={enableGrouping}
      />

      {/* Table Structure Area */}
      <DataTableStructure<TData, TValue>
        table={table}
        columns={columns}
        isClient={isClient}
        rows={rows}
        tableContainerRef={tableContainerRef}
        rowRefsMap={rowRefsMap}
        isMountedRef={isMountedRef}
        grouping={grouping}
        headerRef={headerRef}
        columnFilters={discoveredColumnFilters}
        containerHeight={containerHeight}
      />

      {/* Footer Area */}
      <DataTableFooter
        table={table as unknown as ReactTable<unknown>}
        dataLength={data.length}
        grouping={grouping}
        groupableColumnObjects={groupableColumnObjects}
      />
    </div>
  );
}
