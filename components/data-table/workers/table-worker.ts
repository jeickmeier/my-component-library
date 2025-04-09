/**
 * Table Data Web Worker
 * 
 * This worker handles computationally expensive operations for the data table:
 * - Sorting
 * - Filtering
 * - Grouping
 * - Aggregation
 * 
 * By performing these operations in a separate thread, the main UI thread
 * remains responsive even when processing large datasets.
 */

// Type definitions for messages
type WorkerRequest = {
  operation: 'sort' | 'filter' | 'group' | 'process';
  data: Record<string, unknown>[];
  params: {
    columnId?: string;
    desc?: boolean;
    filters?: Array<{ id: string; value: unknown; type: string }>;
    sorts?: Array<{ columnId: string; desc: boolean }>;
  };
  id?: string; // For identifying responses
};

type WorkerResponse = {
  result: Record<string, unknown>[];
  operation: string;
  id?: string; 
  error?: string;
  performance?: {
    totalTime: number;
    recordCount: number;
  };
};

type SortParams = {
  columnId: string;
  desc: boolean;
};

type FilterParams = {
  filters: Array<{ id: string; value: unknown; type: string }>;
};

type ProcessParams = {
  sorts?: Array<{ columnId: string; desc: boolean }>;
  filters?: Array<{ id: string; value: unknown; type: string }>;
};

type ProcessingResult = {
  result: Record<string, unknown>[];
  performance?: {
    totalTime: number;
    recordCount: number;
  };
  error?: string;
};

/**
 * Sort function that handles various data types
 */
function sortData(data: Record<string, unknown>[], params: SortParams): ProcessingResult {
  const { columnId, desc } = params;
  
  // Start tracking performance
  const startTime = performance.now();
  
  try {
    // Clone the data to avoid modifications to the original
    const clonedData = [...data];
    
    // Sort the array
    const sorted = clonedData.sort((a, b) => {
      // Extract values, handling potentially nested paths
      let valueA = a[columnId];
      let valueB = b[columnId];
      
      // Handle nested paths like "user.name"
      if (columnId.includes('.')) {
        const path = columnId.split('.');
        valueA = path.reduce<unknown>((obj, key) => {
          if (obj && typeof obj === 'object') {
            return (obj as Record<string, unknown>)[key];
          }
          return undefined;
        }, a);
        valueB = path.reduce<unknown>((obj, key) => {
          if (obj && typeof obj === 'object') {
            return (obj as Record<string, unknown>)[key];
          }
          return undefined;
        }, b);
      }
      
      // Handle different value types
      if (valueA === valueB) return 0;
      
      if (valueA === null || valueA === undefined) return desc ? 1 : -1;
      if (valueB === null || valueB === undefined) return desc ? -1 : 1;
      
      // Date comparison
      if (valueA instanceof Date && valueB instanceof Date) {
        return desc ? valueB.getTime() - valueA.getTime() : valueA.getTime() - valueB.getTime();
      }
      
      // Try to parse dates from strings
      if (typeof valueA === 'string' && typeof valueB === 'string') {
        const dateA = new Date(valueA);
        const dateB = new Date(valueB);
        if (!isNaN(dateA.getTime()) && !isNaN(dateB.getTime())) {
          return desc ? dateB.getTime() - dateA.getTime() : dateA.getTime() - dateB.getTime();
        }
      }
      
      // Numeric comparison
      if (typeof valueA === 'number' && typeof valueB === 'number') {
        return desc ? valueB - valueA : valueA - valueB;
      }
      
      // String comparison (case-insensitive)
      if (typeof valueA === 'string' && typeof valueB === 'string') {
        return desc 
          ? valueB.localeCompare(valueA, undefined, { sensitivity: 'base' })
          : valueA.localeCompare(valueB, undefined, { sensitivity: 'base' });
      }
      
      // Boolean comparison
      if (typeof valueA === 'boolean' && typeof valueB === 'boolean') {
        return desc ? (valueB === valueA ? 0 : valueB ? -1 : 1) : (valueA === valueB ? 0 : valueA ? -1 : 1);
      }
      
      // Fallback for mixed types
      return desc 
        ? String(valueB).localeCompare(String(valueA))
        : String(valueA).localeCompare(String(valueB));
    });
    
    // Calculate performance metrics
    const endTime = performance.now();
    
    return {
      result: sorted,
      performance: {
        totalTime: endTime - startTime,
        recordCount: data.length
      }
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    return {
      result: data, // Return original data on error
      error: errorMessage,
      performance: {
        totalTime: performance.now() - startTime,
        recordCount: data.length
      }
    };
  }
}

/**
 * Filter function that supports multiple filter types
 */
function filterData(data: Record<string, unknown>[], params: FilterParams): ProcessingResult {
  const { filters } = params;
  
  // Start tracking performance
  const startTime = performance.now();
  
  try {
    // If no filters, return the original data
    if (!filters || filters.length === 0) {
      return {
        result: data,
        performance: {
          totalTime: 0,
          recordCount: data.length
        }
      };
    }
    
    // Apply all filters
    const filtered = data.filter(row => {
      // Item passes if it matches ALL filters (AND logic)
      return filters.every(filter => {
        const { id, value, type } = filter;
        
        // Get the value from the row
        let rowValue = row[id];
        
        // Handle nested paths
        if (id.includes('.')) {
          const path = id.split('.');
          rowValue = path.reduce<unknown>((obj, key) => {
            if (obj && typeof obj === 'object') {
              return (obj as Record<string, unknown>)[key];
            }
            return undefined;
          }, row);
        }
        
        // Different filtering logic based on filter type
        switch (type) {
          case 'text':
            // Basic text search (case-insensitive)
            return rowValue && String(rowValue).toLowerCase().includes(String(value).toLowerCase());
            
          case 'multi-select':
            // Check if value is in the selected options
            if (Array.isArray(value)) {
              return value.length === 0 
                ? true // Empty selection means no filtering
                : value.includes(rowValue);
            }
            return true;
            
          case 'boolean':
            // Boolean filtering
            return value === undefined || value === null 
              ? true 
              : rowValue === value;
              
          case 'date-range':
            // Date range filtering
            if (!value || (typeof value === 'object' && !('from' in value) && !('to' in value))) return true;
            
            const dateValue = rowValue instanceof Date 
              ? rowValue 
              : new Date(String(rowValue));
              
            // Invalid date always fails the filter
            if (isNaN(dateValue.getTime())) return false;
            
            // Check date is within range
            const fromDate = value && typeof value === 'object' && 'from' in value && value.from 
              ? new Date(String(value.from)) 
              : null;
            const toDate = value && typeof value === 'object' && 'to' in value && value.to 
              ? new Date(String(value.to)) 
              : null;
            
            let passes = true;
            if (fromDate && !isNaN(fromDate.getTime())) {
              passes = passes && dateValue >= fromDate;
            }
            if (toDate && !isNaN(toDate.getTime())) {
              passes = passes && dateValue <= toDate;
            }
            return passes;
            
          case 'range':
            // Numeric range filtering
            if (!value || (typeof value === 'object' && !('min' in value) && !('max' in value))) return true;
            
            const numValue = typeof rowValue === 'number' 
              ? rowValue 
              : parseFloat(String(rowValue));
              
            // Invalid number always fails the filter
            if (isNaN(numValue)) return false;
            
            // Check number is within range
            let inRange = true;
            if (value && typeof value === 'object' && 'min' in value && value.min !== undefined && value.min !== null) {
              inRange = inRange && numValue >= Number(value.min);
            }
            if (value && typeof value === 'object' && 'max' in value && value.max !== undefined && value.max !== null) {
              inRange = inRange && numValue <= Number(value.max);
            }
            return inRange;
            
          default:
            // Default for unknown filter types
            return true;
        }
      });
    });
    
    // Calculate performance metrics
    const endTime = performance.now();
    
    return {
      result: filtered,
      performance: {
        totalTime: endTime - startTime,
        recordCount: filtered.length
      }
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    return {
      result: data, // Return original data on error
      error: errorMessage,
      performance: {
        totalTime: performance.now() - startTime,
        recordCount: data.length
      }
    };
  }
}

/**
 * Process data with multiple operations (sort + filter)
 */
function processData(data: Record<string, unknown>[], params: ProcessParams): ProcessingResult {
  const { sorts, filters } = params;
  const startTime = performance.now();
  
  try {
    let processedData = [...data];
    let processingResult: ProcessingResult = { result: processedData };
    
    // Apply filters first to reduce the dataset
    if (filters && filters.length > 0) {
      processingResult = filterData(processedData, { filters });
      processedData = processingResult.result;
    }
    
    // Then apply sorting
    if (sorts && sorts.length > 0) {
      // Sort by multiple columns in order
      for (const sort of sorts.reverse()) {
        processingResult = sortData(processedData, sort);
        processedData = processingResult.result;
      }
    }
    
    // Calculate performance metrics
    const endTime = performance.now();
    
    return {
      result: processedData,
      performance: {
        totalTime: endTime - startTime,
        recordCount: processedData.length
      }
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    return {
      result: data,
      error: errorMessage,
      performance: {
        totalTime: performance.now() - startTime,
        recordCount: data.length
      }
    };
  }
}

/**
 * Main message handler for the worker
 */
self.onmessage = (event: MessageEvent<WorkerRequest>) => {
  const { operation, data, params, id } = event.data;
  let response: WorkerResponse;
  
  switch (operation) {
    case 'sort':
      const sortResult = sortData(data, params as SortParams);
      response = {
        operation,
        result: sortResult.result,
        performance: sortResult.performance,
        error: sortResult.error,
        id
      };
      break;
      
    case 'filter':
      const filterResult = filterData(data, params as FilterParams);
      response = {
        operation,
        result: filterResult.result,
        performance: filterResult.performance,
        error: filterResult.error,
        id
      };
      break;
      
    case 'process':
      const processResult = processData(data, params as ProcessParams);
      response = {
        operation,
        result: processResult.result,
        performance: processResult.performance,
        error: processResult.error,
        id
      };
      break;
      
    default:
      response = {
        operation,
        result: data,
        error: `Unsupported operation: ${operation}`,
        id
      };
  }
  
  // Send back the response
  self.postMessage(response);
};

// Export an empty object to satisfy TypeScript module requirements
export {}; 