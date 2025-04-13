/**
 * Utility functions for column configuration and management.
 * Provides helpers for creating column definitions, handling column types,
 * and configuring column-specific features like sorting and filtering.
 */

import * as React from "react";

// Define our interfaces with generic types
interface ColumnDef<T> {
  id: string;
  header: string | React.ReactElement | ((props: unknown) => React.ReactNode);
  cell?: ((props: unknown) => React.ReactNode) | undefined;
  accessorKey?: string;
  accessorFn?: (row: T) => unknown;
  enableColumnFilter?: boolean;
  enableSorting?: boolean;
  enableHiding?: boolean;
  aggregationFn?:
    | string
    | ((
        columnId: string,
        leafRows: unknown[],
        childRows: unknown[],
      ) => unknown);
  meta?: Record<string, unknown>;
  [key: string]: unknown;
}

// Define a more specific interface for our column with optional properties
interface TableColumn<T>
  extends Omit<
    ColumnDef<T>,
    "accessorKey" | "accessorFn" | "enableColumnFilter"
  > {
  accessorKey?: string;
  accessorFn?: (row: T) => unknown;
  enableColumnFilter?: boolean;
  aggregationFn?:
    | string
    | ((
        columnId: string,
        leafRows: unknown[],
        childRows: unknown[],
      ) => unknown);
}

export function createColumn<T>(options: {
  id: string;
  header: string;
  accessorKey?: keyof T | string;
  accessorFn?: (row: T) => unknown;
  cell?: ((props: Record<string, unknown>) => React.ReactNode) | undefined;
  enableSorting?: boolean;
  enableHiding?: boolean;
  enableFiltering?: boolean;
  aggregationFn?:
    | string
    | ((
        columnId: string,
        leafRows: unknown[],
        childRows: unknown[],
      ) => unknown);
  meta?: Record<string, unknown>;
}): ColumnDef<T> {
  // Start with common properties that are always defined
  const column: TableColumn<T> = {
    id: options.id,
    header: options.header,
    cell: options.cell,
    enableSorting: options.enableSorting !== false, // Enabled by default
    enableHiding: options.enableHiding !== false, // Enabled by default
    meta: options.meta || {},
  };

  // Add either accessorKey or accessorFn, but not both
  if (options.accessorKey) {
    column.accessorKey = options.accessorKey as string;
  } else if (options.accessorFn) {
    column.accessorFn = options.accessorFn;
  }

  // Add enableColumnFilter if enableFiltering is specified
  if (options.enableFiltering !== undefined) {
    column.enableColumnFilter = options.enableFiltering;
  }

  // Add aggregationFn if specified
  if (options.aggregationFn !== undefined) {
    column.aggregationFn = options.aggregationFn;
  }

  return column as ColumnDef<T>;
}
