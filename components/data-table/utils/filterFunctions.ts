import { Row, RowData } from "@tanstack/react-table";

/**
 * Collection of filter functions for different data types and filtering scenarios.
 * Implements various filtering strategies including text search, range filtering,
 * categorical filtering, and custom filter functions.
 */

/**
 * A custom number range filter function that can be registered with TanStack Table
 * Will be used like: filterFn: 'numberRange'
 */
export const numberRangeFilterFn = <TData extends RowData>(
  row: Row<TData>,
  columnId: string,
  value: [number, number],
) => {
  const amount = row.getValue(columnId) as number;
  const [min, max] = value;

  if (min !== undefined && max !== undefined) {
    return amount >= min && amount <= max;
  }

  if (min !== undefined) {
    return amount >= min;
  }

  if (max !== undefined) {
    return amount <= max;
  }

  return true;
};

// Optional: Remove filter when both min and max are undefined
numberRangeFilterFn.autoRemove = (value: [number, number]) =>
  value?.[0] === undefined && value?.[1] === undefined;

/**
 * A custom star rating filter function that can be registered with TanStack Table
 * Will be used like: filterFn: 'starRating'
 */
export const starRatingFilterFn = <TData extends RowData>(
  row: Row<TData>,
  columnId: string,
  value: number,
) => {
  const rating = row.getValue(columnId) as number;
  
  // If value is undefined or null, no filtering
  if (value === undefined || value === null) {
    return true;
  }
  
  // Filter for ratings equal to or above the selected value
  return rating >= value;
};

// Remove filter when value is undefined or null
starRatingFilterFn.autoRemove = (value: number) => 
  value === undefined || value === null;
