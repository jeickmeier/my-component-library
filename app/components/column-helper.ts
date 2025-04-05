import * as React from "react";
import { ColumnDef, CellContext } from "@tanstack/react-table";

/**
 * Helper function to create column definitions with improved header functionality
 * 
 * @param options Column configuration options
 * @returns A column definition with sorting and visibility enabled by default
 */
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

/**
 * Example usage:
 * 
 * import { createColumn } from "@/app/components/column-helper";
 * 
 * const columns = [
 *   createColumn<User>({
 *     id: "name",
 *     header: "Name",
 *     accessorKey: "name",
 *   }),
 *   createColumn<User>({
 *     id: "email",
 *     header: "Email",
 *     accessorKey: "email",
 *   }),
 *   // Custom cell rendering
 *   createColumn<User>({
 *     id: "actions",
 *     header: "Actions",
 *     cell: ({ row }) => (
 *       <button onClick={() => handleEdit(row.original)}>Edit</button>
 *     ),
 *     enableSorting: false, // Disable sorting for this column
 *   }),
 * ];
 */ 