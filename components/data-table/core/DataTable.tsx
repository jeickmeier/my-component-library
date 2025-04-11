"use client";

import * as React from "react";

// Import types
import { DataTableProps } from "../types";
import { ColumnFilter } from "../types";
import { Table as ReactTable, GroupingState } from "@tanstack/react-table";

// Import sub-components
import { DataTableToolbar } from "../ui/Toolbar";
import { DataTableGroupingControl } from "../ui/GroupingControl";
import { DataTableStructure } from "./Structure";
import { DataTableFooter } from "../ui/Footer";

// Import the custom hook
import { useDataTableLogic } from "../hooks/useDataTableLogic";

// Create a wrapper component for the toolbar to prevent re-renders
const TableToolbar = React.memo(function TableToolbar({
  table,
  columnFilters,
  globalFilter,
  setGlobalFilter,
  grouping,
  setGrouping,
  groupableColumnObjects,
  isGroupingDialogOpen,
  setIsGroupingDialogOpen,
  enableGrouping,
}: {
  table: ReactTable<unknown>;
  columnFilters: ColumnFilter[];
  globalFilter: string;
  setGlobalFilter: (value: string) => void;
  grouping: GroupingState;
  setGrouping: React.Dispatch<React.SetStateAction<GroupingState>>;
  groupableColumnObjects: { id: string; label: string }[];
  isGroupingDialogOpen: boolean;
  setIsGroupingDialogOpen: (open: boolean) => void;
  enableGrouping: boolean;
}) {
  return (
    <div className="flex items-center justify-between">
      {/* Filters Section */}
      <div className="flex-grow">
        <DataTableToolbar
          table={table}
          columnFilters={columnFilters}
          globalFilter={globalFilter}
          setGlobalFilter={setGlobalFilter}
        />
      </div>

      {/* Grouping Section */}
      <div className="flex items-center pl-2">
        {enableGrouping && groupableColumnObjects.length > 0 && (
          <DataTableGroupingControl
            grouping={grouping}
            setGrouping={setGrouping}
            groupableColumnObjects={groupableColumnObjects}
            isGroupingDialogOpen={isGroupingDialogOpen}
            setIsGroupingDialogOpen={setIsGroupingDialogOpen}
          />
        )}
      </div>
    </div>
  );
});

// --- Main DataTable Component ---
export function DataTable<TData, TValue>(props: DataTableProps<TData, TValue>) {
  const {
    table,
    rows,
    isClient,
    grouping,
    setGrouping,
    globalFilter,
    setGlobalFilter,
    isGroupingDialogOpen,
    setIsGroupingDialogOpen,
    tableContainerRef,
    headerRef,
    rowRefsMap,
    isMountedRef,
    groupableColumnObjects,
  } = useDataTableLogic(props); // Use the hook

  // Destructure props needed here or pass `props` down
  const { columns, data, columnFilters = [], enableGrouping = false } = props;

  return (
    <div className="space-y-4">
      {/* Toolbar Area (Memoized) */}
      <TableToolbar
        table={table as unknown as ReactTable<unknown>}
        columnFilters={columnFilters}
        globalFilter={globalFilter}
        setGlobalFilter={setGlobalFilter}
        grouping={grouping}
        setGrouping={setGrouping}
        groupableColumnObjects={groupableColumnObjects}
        isGroupingDialogOpen={isGroupingDialogOpen}
        setIsGroupingDialogOpen={setIsGroupingDialogOpen}
        enableGrouping={enableGrouping}
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
        columnFilters={columnFilters}
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
