"use client"

/**
 * Data Table Context Module
 * 
 * This module implements the state management and context system for the data table.
 * It provides a comprehensive solution for managing:
 * - Table configuration and schema
 * - Data and row models
 * - Sorting state
 * - Filtering (column and global)
 * - Column visibility
 * - Grouping and expansion
 * - Aggregation functions
 * 
 * The implementation uses React Context and TanStack Table's core functionality
 * to provide a powerful yet flexible state management solution.
 * 
 * @module data-table/core/context
 */

import * as React from "react"
import {
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  getGroupedRowModel,
  getExpandedRowModel,
  ExpandedState,
  GroupingState,
  ColumnDef,
  Table,
  AggregationFnOption,
} from "@tanstack/react-table"
import { DataTableSchema } from "../types"
import { createMultiSelectFilterFn, createDateRangeFilterFn, createBooleanFilterFn } from "../filters"
import { DataTableColumnHeader } from "../parts/column-header"
import { createAggregationFunctionRegistry, getGlobalAggregationFunctionRegistry } from "../aggregation"

/**
 * Data Table Context Value Interface
 * 
 * Defines the shape of the context value that will be shared throughout the
 * data table component tree. This interface provides access to:
 * 
 * State:
 * - Table configuration (schema)
 * - Data array
 * - Sorting configuration
 * - Filter states (column and global)
 * - Column visibility settings
 * - Grouping configuration
 * - Expansion state
 * - Aggregation settings
 * 
 * Operations:
 * - State setters for all managed states
 * - Table instance access
 * - Initialization status
 * 
 * @template TData The type of data in the table rows
 */
export interface DataTableContextValue<TData> {
  /** Table configuration schema */
  schema: DataTableSchema<TData>
  /** Array of data items to display */
  data: TData[]
  /** Current sorting state */
  sorting: SortingState
  /** Function to update sorting state */
  setSorting: (sorting: SortingState) => void
  /** Current column filter state */
  columnFilters: ColumnFiltersState
  /** Function to update column filters */
  setColumnFilters: (filters: ColumnFiltersState) => void
  /** Current global filter value */
  globalFilter: string
  /** Function to update global filter */
  setGlobalFilter: (filter: string) => void
  /** Current column visibility state */
  columnVisibility: VisibilityState
  /** Function to update column visibility */
  setColumnVisibility: (visibility: VisibilityState) => void
  /** Current grouping state */
  grouping: GroupingState
  /** Function to update grouping */
  setGrouping: (grouping: GroupingState) => void
  /** Current row expansion state */
  expanded: ExpandedState
  /** Function to update expansion state */
  setExpanded: (expanded: ExpandedState) => void
  /** TanStack Table instance */
  table: Table<TData>
  /** Whether the table has completed initialization */
  isInitialized: boolean
  /** Function to update column aggregation */
  setColumnAggregation: (columnId: string, aggregationType?: string) => void
  /** Current column aggregation settings */
  columnAggregations: Record<string, string | undefined>
}

/**
 * Data Table Context
 * 
 * React Context instance for the data table state management system.
 * This context is consumed by all data table components to access shared state.
 * 
 * @private
 */
const DataTableContext = React.createContext<DataTableContextValue<unknown> | undefined>(undefined)

/**
 * Props for the DataTableProvider component
 * 
 * @template TData The type of data in the table rows
 */
interface DataTableProviderProps<TData> {
  /** Child components that will have access to the context */
  children: React.ReactNode
  /** Table configuration schema */
  schema: DataTableSchema<TData>
  /** Array of data items to display */
  data: TData[]
}

/**
 * Data Table Context Provider
 * 
 * This component manages the state and operations for the entire data table.
 * It combines React's Context API with TanStack Table to provide a complete
 * state management solution.
 * 
 * Features:
 * - Automatic aggregation registry initialization
 * - State management for all table features
 * - Custom filter function creation
 * - Column definition processing
 * - Aggregation function management
 * 
 * The provider handles all complex state interactions and provides a clean
 * interface for child components to access and modify table state.
 * 
 * @template TData The type of data in the table rows
 * 
 * @example
 * ```tsx
 * function MyTable({ data }) {
 *   const schema = {
 *     columns: [
 *       { accessorKey: 'name', header: 'Name' },
 *       { accessorKey: 'age', header: 'Age' }
 *     ]
 *   };
 * 
 *   return (
 *     <DataTableProvider schema={schema} data={data}>
 *       <TableContent />
 *     </DataTableProvider>
 *   );
 * }
 * ```
 */
export function DataTableProvider<TData>({
  children,
  schema,
  data,
}: DataTableProviderProps<TData>) {
  // Initialize the registry on the first render
  React.useEffect(() => {
    createAggregationFunctionRegistry();
  }, []);
  
  // Internal state for data to manage reference changes
  const [internalData, setInternalData] = React.useState<TData[]>(data);

  // Effect to update internalData when the data prop changes
  React.useEffect(() => {
    setInternalData(data);
  }, [data]);

  // Initialize state
  const [sorting, setSorting] = React.useState<SortingState>(schema.defaultSorting || [])
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
  const [globalFilter, setGlobalFilter] = React.useState<string>("")
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>(schema.defaultColumnVisibility || {})
  const [grouping, setGrouping] = React.useState<GroupingState>(schema.defaultGrouping || [])
  const [expanded, setExpanded] = React.useState<ExpandedState>({})
  const [isInitialized, setIsInitialized] = React.useState(false)
  
  // Create state for column aggregation functions
  const [columnAggregations, setColumnAggregations] = React.useState<Record<string, string | undefined>>({})

  // Create filter functions
  const multiSelectFilter = React.useMemo(() => createMultiSelectFilterFn<TData>(), [])
  const dateRangeFilter = React.useMemo(() => createDateRangeFilterFn<TData>(), [])
  const booleanFilter = React.useMemo(() => createBooleanFilterFn<TData>(), [])

  // Get the global aggregation registry to access custom aggregation functions
  const aggregationRegistry = React.useMemo(() => getGlobalAggregationFunctionRegistry(), [])

  // Create aggregation functions map for TanStack Table
  const customAggregationFns = React.useMemo(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const fns: Record<string, any> = {}
    
    // Define built-in types that TanStack already handles
    const builtInTypes = ['sum', 'min', 'max', 'extent', 'mean', 'median', 'unique', 'uniqueCount', 'count'];
    
    // Get all registered types from the registry that aren't built-in
    const customTypes = aggregationRegistry.getTypes().filter(type => !builtInTypes.includes(type));
    
    // If we can't get types from registry, fall back to our static list
    if (customTypes.length === 0) {
      customTypes.push('first', 'last', 'mode', 'stdDev', 'percentile', 'weightedAvg', 'join');
    }
    
    customTypes.forEach(type => {
      const fn = aggregationRegistry.get(type)
      if (fn) {
        // Create a TanStack compatible aggregation function
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        fns[type] = (columnId: string, leafRows: any[], childRows: any[]) => {
          // Find the column configuration from schema
          const schemaColumn = schema.columns.find(col => 
            (col.id === columnId) || (col.accessorKey === columnId)
          );
          
          // Get the aggregation config
          const config = schemaColumn?.aggregationConfig;
          
          // Call our aggregation function with the right parameters
          return fn(columnId, leafRows, childRows, config);
        }
      }
    })
    
    return fns
  }, [aggregationRegistry, schema.columns])

  // Initialize column aggregations from schema
  React.useEffect(() => {
    // Create initial aggregations state from schema definitions
    const initialAggregations: Record<string, string | undefined> = {};
    
    schema.columns.forEach(column => {
      const columnId = column.id || column.accessorKey;
      if (columnId && column.aggregationType) {
        initialAggregations[columnId] = column.aggregationType;
      }
    });
    
    // Only set if we found any aggregations to avoid unnecessary renders
    if (Object.keys(initialAggregations).length > 0) {
      setColumnAggregations(initialAggregations);
    }
  }, [schema.columns]);

  // Convert our schema columns to ColumnDef format
  const columns = React.useMemo(() => {
    // Process columns and add header component
    return schema.columns.map(column => {
      // Create a new column definition with all properties from the original
      // Destructure to handle properties explicitly
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { aggregationFn, meta, ...restOfColumn } = column;
      const columnDef: Partial<ColumnDef<TData, unknown>> = { ...restOfColumn };

      const columnId = column.id || (typeof column.accessorKey === 'string' ? column.accessorKey : undefined);
      
      // If header is a string, replace it with DataTableColumnHeader component
      if (typeof column.header === 'string') {
        const headerText = column.header
        const columnFilter = column.filter
        const columnAlignment = column.alignment
        
        // Replace header with DataTableColumnHeader component
        columnDef.header = ({ column: tableColumn }) => (
          <DataTableColumnHeader
            column={tableColumn}
            title={headerText}
            filter={columnFilter}
            alignment={columnAlignment}
          />
        )
      } else {
        // Ensure header is passed if it's not a string (e.g., a custom component)
        columnDef.header = column.header;
      }

      // Determine the current aggregation type
      let currentAggregationType: string | undefined = undefined;
      if (columnId && columnAggregations[columnId] !== undefined) {
        currentAggregationType = columnAggregations[columnId];
      } else if (column.aggregationType) {
        currentAggregationType = column.aggregationType;
      }

      // Set the aggregation function based on the type
      if (currentAggregationType) {
        // Built-in TanStack aggregation functions can be referenced by string
        const builtInTypes = ['sum', 'min', 'max', 'extent', 'mean', 'median', 'unique', 'uniqueCount', 'count'];
        
        if (builtInTypes.includes(currentAggregationType)) {
          // For built-in types, pass the string directly
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          columnDef.aggregationFn = currentAggregationType as any;
        } else {
          // For custom types, reference the function by name (TanStack resolves via aggregationFns map)
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          columnDef.aggregationFn = currentAggregationType as any;
        }
      } else {
        // No aggregation type specified
        columnDef.aggregationFn = undefined;
      }
      
      // Ensure meta includes aggregationConfig and other relevant properties
      columnDef.meta = {
        ...(column.meta || {}), // Preserve original meta from schema
        aggregationConfig: column.aggregationConfig,
        alignment: column.alignment, 
        filter: column.filter,
      };
      
      return columnDef as ColumnDef<TData, unknown> // Cast back to full type
    })
  }, [schema.columns, columnAggregations])

  // Add forceUpdateCounter to the dependency array of the table options
  const tableOptions = React.useMemo(() => ({
    data: internalData,
    columns,
    getCoreRowModel: getCoreRowModel(),
    // Only use pagination model if explicitly enabled
    ...(schema.enablePagination === true 
      ? { getPaginationRowModel: getPaginationRowModel() } 
      : {}),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    onColumnFiltersChange: setColumnFilters,
    getFilteredRowModel: getFilteredRowModel(),
    onGlobalFilterChange: setGlobalFilter,
    onColumnVisibilityChange: setColumnVisibility,
    onGroupingChange: setGrouping,
    getGroupedRowModel: schema.enableGrouping ? getGroupedRowModel() : undefined,
    onExpandedChange: setExpanded,
    getExpandedRowModel: getExpandedRowModel(),
    filterFns: {
      multiSelect: multiSelectFilter,
      dateRange: dateRangeFilter,
      boolean: booleanFilter,
    },
    // Register custom aggregation functions with TanStack Table
    aggregationFns: customAggregationFns,
    state: {
      sorting,
      columnFilters,
      globalFilter,
      columnVisibility,
      grouping,
      expanded,
      // When pagination is disabled, set the page size to show all data
      ...(schema.enablePagination === true 
        ? {} 
        : { pagination: { pageIndex: 0, pageSize: internalData.length > 10000 ? 10000 : internalData.length || 10 } })
    },
    enableGrouping: schema.enableGrouping,
    enableColumnFilters: true,
    enableSorting: true,
    manualGrouping: !schema.enableGrouping,
    // Only set initialState.pagination if pagination is enabled
    initialState: {
      ...(schema.enablePagination === true ? {
        pagination: {
          pageSize: schema.defaultPageSize || 10,
        }
      } : {})
    },
  }), [
    internalData,
    columns, 
    schema.enablePagination, 
    schema.enableGrouping, 
    schema.defaultPageSize,
    sorting, 
    columnFilters, 
    globalFilter, 
    columnVisibility, 
    grouping, 
    expanded,
    multiSelectFilter,
    dateRangeFilter,
    booleanFilter,
    customAggregationFns,
  ]);

  // Create table instance using memoized options
  const table = useReactTable(tableOptions);

  // Set column aggregation function
  const setColumnAggregation = React.useCallback((columnId: string, aggregationType?: string) => {
    // Update the aggregation state
    setColumnAggregations(prev => {
      const newAggregations = {
        ...prev,
        [columnId]: aggregationType
      };
      return newAggregations;
    });

    // Get the column and update its definition
    const column = table.getColumn(columnId);
    if (column) {
      // Update the column definition
      column.columnDef.aggregationFn = aggregationType as AggregationFnOption<TData>;
      
      // Force the table to recalculate with new aggregation
      table.options.state.grouping = [...(table.getState().grouping || [])];
      table.reset();
    }

    // Trigger a data reference update
    setInternalData(currentData => [...currentData]);
  }, [table]);

  // Mark component as initialized after first render
  React.useEffect(() => {
    setIsInitialized(true)
  }, [])

  // Create context value
  const contextValue = React.useMemo<DataTableContextValue<TData>>(() => ({
    schema,
    data,
    sorting,
    setSorting,
    columnFilters,
    setColumnFilters,
    globalFilter,
    setGlobalFilter,
    columnVisibility, 
    setColumnVisibility,
    grouping,
    setGrouping,
    expanded,
    setExpanded,
    table: table as Table<TData>,
    isInitialized,
    setColumnAggregation,
    columnAggregations,
  }), [
    schema,
    data,
    sorting,
    columnFilters,
    globalFilter,
    columnVisibility,
    grouping,
    expanded,
    table,
    isInitialized,
    setColumnAggregation,
    columnAggregations,
  ])
  return (
    <DataTableContext.Provider value={contextValue as DataTableContextValue<unknown>}>
      {children}
    </DataTableContext.Provider>
  )
}

/**
 * Data Table Hook
 * 
 * A custom hook that provides access to the data table context. This hook
 * enables components to interact with the table state and operations in a
 * type-safe manner.
 * 
 * Features:
 * - Type-safe access to table state
 * - Access to all table operations
 * - Automatic error handling for missing context
 * 
 * @template TData The type of data in the table rows
 * @throws {Error} If used outside of a DataTableProvider
 * 
 * @example
 * ```tsx
 * function TableAction() {
 *   const { sorting, setSorting } = useDataTable<MyDataType>();
 * 
 *   return (
 *     <button onClick={() => setSorting([{ id: 'name', desc: false }])}>
 *       Sort by Name
 *     </button>
 *   );
 * }
 * ```
 */
export function useDataTable<TData>() {
  const context = React.useContext(DataTableContext)
  if (!context) {
    throw new Error("useDataTable must be used within a DataTableProvider")
  }
  return context as DataTableContextValue<TData>
} 