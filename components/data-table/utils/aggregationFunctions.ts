/**
 * Collection of aggregation functions for grouped data in the table.
 * Provides implementations for common aggregations like sum, average, count,
 * min/max, and custom aggregations for specific data types.
 */

import { Row } from "@tanstack/react-table";

export type AggregationFunction<TData = unknown> = (
  columnId: string,
  leafRows: Row<TData>[],
  childRows?: Row<TData>[],
) => string | number | null | number[];

// First value aggregation - returns the first value in the list
export const firstAggregation: AggregationFunction = (columnId, leafRows) => {
  if (!leafRows.length) return null;

  const firstRow = leafRows[0];
  const value = firstRow.getValue(columnId);

  // Ensure the return type is string | number | null
  if (typeof value === "string" || typeof value === "number") {
    return value;
  }

  // Convert other types to string if possible
  return value != null ? String(value) : null;
};

// Last value aggregation - returns the last value in the list
export const lastAggregation: AggregationFunction = (columnId, leafRows) => {
  if (!leafRows.length) return null;

  const lastRow = leafRows[leafRows.length - 1];
  const value = lastRow.getValue(columnId);

  // Ensure the return type is string | number | null
  if (typeof value === "string" || typeof value === "number") {
    return value;
  }

  // Convert other types to string if possible
  return value != null ? String(value) : null;
};

// Sparkline aggregation - returns all numeric values as an array
export const sparklineAggregation: AggregationFunction = (
  columnId,
  leafRows,
) => {
  if (!leafRows.length) return [];

  // Extract values from all rows
  const values = leafRows.map((row) => {
    const value = row.getValue(columnId);
    return typeof value === "number" ? value : null;
  });

  // Filter out null/undefined values and return the array of numbers
  return values.filter(
    (val): val is number => val !== null && val !== undefined,
  );
};
