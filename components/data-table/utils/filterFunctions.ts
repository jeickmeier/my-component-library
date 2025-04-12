import { Row, RowData } from "@tanstack/react-table";

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
