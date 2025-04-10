import * as React from "react";
import { ColumnDef, CellContext } from "@tanstack/react-table";

export function createColumn<T>(options: {
  id: string;
  header: string;
  accessorKey?: keyof T | string;
  accessorFn?: (row: T) => unknown;
  cell?: ((props: CellContext<T, unknown>) => React.ReactNode) | undefined;
  enableSorting?: boolean;
  enableHiding?: boolean;
  meta?: Record<string, unknown>;
}): ColumnDef<T> {
  return {
    id: options.id,
    accessorKey: options.accessorKey as string,
    accessorFn: options.accessorFn,
    header: options.header,
    cell: options.cell,
    enableSorting: options.enableSorting !== false, // Enabled by default
    enableHiding: options.enableHiding !== false,   // Enabled by default
    meta: options.meta || {},
  };
}
