
import { Row, RowData } from "@tanstack/react-table"

/**
 * Creates a reusable range filter function for numeric columns
 * @param getValue Function to extract the numeric value from the row
 * @returns A filter function compatible with Tanstack Table's filterFn
 */
export function createRangeFilterFn<TData>(
    getValue: (row: TData) => number
  ) {
    return (row: TData, id: string, value: [number, number]) => {
      const amount = getValue(row);
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
  }
  
  /**
   * A custom number range filter function that can be registered with TanStack Table
   * Will be used like: filterFn: 'numberRange'
   */
  export const numberRangeFilterFn = <TData extends RowData>(
    row: Row<TData>, 
    columnId: string, 
    value: [number, number]
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