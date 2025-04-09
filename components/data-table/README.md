# Data Table Component

This directory contains a modular, feature-rich data table implementation based on TanStack Table (React Table).

## Architecture

The component follows a modular architecture with clear separation of concerns:

```
components/data-table/
├── index.ts                 # Main export file with backward compatibility re-exports
├── types.ts                 # Shared type definitions
├── utils.ts                 # Common utility functions
├── core/                    # Core table implementation
│   ├── context.tsx          # Table context provider
│   ├── data-table.tsx       # Main DataTable component
│   └── index.ts             # Core module exports
├── parts/                   # UI components for the table
│   ├── table-header.tsx     # Table header implementation
│   ├── table-body.tsx       # Table body implementation
│   ├── table-cell.tsx       # Table cell implementation 
│   ├── toolbar.tsx          # Table toolbar implementation
│   ├── pagination.tsx       # Pagination controls
│   ├── column-header.tsx    # Column header with sorting, filtering, etc.
│   ├── grouping-panel.tsx   # Panel for managing grouping settings
│   ├── grouping-controls.tsx # Controls for group management
│   └── index.ts             # Parts module exports
├── schema/                  # Schema management
│   ├── schema-utils.ts      # Utilities for working with schemas
│   ├── serialization.ts     # Schema serialization/deserialization
│   ├── schema-builder.ts    # Fluent API for building schemas
│   ├── column-serialization.tsx # Schema persistence for columns
│   └── index.ts             # Schema module exports
├── utils/                   # Utility functions
│   ├── column-helper.ts     # Utilities for creating column definitions
│   └── index.ts             # Utils module exports
├── filters/                 # Filter system
│   ├── filter-functions.ts  # Custom filter implementation
│   ├── filter-factory.tsx   # Factory for creating filter UI
│   ├── components/          # Individual filter type components
│   └── index.ts             # Filter module exports
├── cell-renderers/          # Cell renderer system
│   ├── core/                # Core renderer implementation
│   ├── renderers/           # Individual cell renderers
│   └── index.tsx            # Renderer module exports
└── aggregation/             # Aggregation functionality
    ├── core/                # Core aggregation implementation
    ├── functions/           # Aggregation functions
    └── index.ts             # Aggregation module exports
```

## Usage

Basic usage:

```tsx
import { DataTable } from "@/components/data-table";
import { createDataTableSchema } from "@/components/data-table";

const schema = createDataTableSchema({
  columns: [
    // Column definitions...
  ],
  enablePagination: true,
  enableGrouping: true,
});

export function MyTable() {
  return <DataTable schema={schema} data={myData} />;
}
```

## Advanced Usage with Schema Builder

```tsx
import { createTableSchema } from "@/components/data-table";

const schema = createTableSchema<MyDataType>()
  .addColumn({
    id: 'name',
    header: 'Name',
    accessorKey: 'name',
  })
  .addColumn({
    id: 'email',
    header: 'Email',
    accessorKey: 'email',
  })
  .enableGrouping(['name'])
  .setPagination(true, 25)
  .build();
```

## Column Aggregation

When using grouping, you can specify how values should be aggregated:

```tsx
createTableSchema<MyDataType>()
  .addColumn({
    id: 'revenue',
    header: 'Revenue',
    accessorKey: 'revenue',
    aggregationType: 'sum', // Use built-in sum aggregation
    // Optional configuration for the aggregation function
    aggregationConfig: { 
      // Configuration options specific to the aggregation type
    }
  })
  .addColumn({
    id: 'weightedScore',
    header: 'Weighted Score',
    accessorKey: 'score',
    aggregationType: 'weightedAvg', // Use custom weighted average
    aggregationConfig: {
      weightColumnId: 'weight' // Specify the column to use for weights
    }
  })
  .build();
```

### Available Aggregation Types

#### Standard Aggregation Functions
- `sum` - Sum of values
- `avg` - Average of values
- `min` - Minimum value
- `max` - Maximum value
- `count` - Count of rows
- `range` - Range of values (min - max)
- `unique` - List of unique values
- `uniqueCount` - Count of unique values
- `median` - Median value

#### Custom Aggregation Functions
- `weightedAvg` - Weighted average based on another column
- `mode` - Most frequent value
- `stdDev` - Standard deviation of values
- `percentile` - Calculate percentile of values
- `first` - First value in the group
- `last` - Last value in the group
- `join` - Join values with a separator

### Custom Aggregation Registry

You can register your own aggregation functions:

```tsx
import { getGlobalAggregationFunctionRegistry } from "@/components/data-table";

// Register a custom aggregation function
getGlobalAggregationFunctionRegistry().register(
  'myCustomAggregation',
  (columnId, leafRows, childRows, config) => {
    // Custom aggregation logic here
    return result;
  },
  { 
    label: 'My Custom Aggregation',
    description: 'Description of my custom aggregation'
  }
);
```

## Features

The component includes:

- Column sorting with customizable headers
- Column visibility toggle
- Column filtering with various filter types
- Data grouping by columns
- Column aggregation with standard and custom functions
- Pagination with page size selection
- CSV export for table data
- Responsive design

## Schema Options

The table is configured through a schema object:

```typescript
interface DataTableSchema<TData> {
  columns: DataTableColumnDef<TData>[] // Column definitions
  defaultSorting?: SortingState        // Initial sorting configuration
  defaultGrouping?: GroupingState      // Initial grouping configuration
  defaultColumnVisibility?: VisibilityState // Initial column visibility
  enableGrouping?: boolean            // Enable/disable grouping functionality
  enableGlobalFilter?: boolean        // Enable/disable global search
  enablePagination?: boolean          // Enable/disable pagination
  enableExport?: boolean              // Enable/disable CSV export
  defaultPageSize?: number            // Default pagination page size
}
```

## Column Definition

Extended column definition with filtering, grouping, and aggregation options:

```typescript
interface DataTableColumnDef<TData, TValue = unknown> {
  id?: string                  // Column ID (required if no accessorKey)
  accessorKey?: string         // Data property to access (required if no id)
  header?: string              // Column header text
  enableGrouping?: boolean     // Enable/disable grouping for this column
  filter?: ColumnFilter        // Filter configuration
  alignment?: 'left' | 'center' | 'right' // Text alignment
  cellRenderer?: SerializableCellRenderer // Cell renderer configuration
  aggregationType?: AggregationFunctionType // Aggregation function type
  aggregationConfig?: AggregationFunctionConfig // Aggregation function config
}
```

## Web Worker For Large Datasets

For tables with a large number of rows (10,000+), the data table includes a web worker implementation that offloads computationally expensive operations like sorting and filtering to a separate thread, keeping the UI responsive.

### Using Web Workers

```tsx
import { DataTable, WorkerDataProvider, useDataTable } from "@/components/data-table";
import { useState } from "react";

// Example component that uses web workers for data processing
function LargeDataTable() {
  // Your data (10,000+ rows)
  const [data, setData] = useState(generateLargeDataset());
  
  // Create your schema
  const schema = {
    columns: [
      // Your column definitions
    ],
    enableVirtualization: true, // Enable virtualization for better performance
  };
  
  // The WorkerTable handles the worker integration
  return (
    <WorkerTable 
      schema={schema} 
      data={data} 
    />
  );
}

// Component that integrates the worker with the data table
function WorkerTable({ schema, data }) {
  // Create a local state to store the processed data
  const [processedData, setProcessedData] = useState(data);
  
  // Render the data table
  return (
    <DataTable schema={schema} data={processedData}>
      <DataTableContent>
        {(table) => (
          <WorkerDataProvider
            data={data}
            table={table}
            sorting={table.getState().sorting}
            columnFilters={table.getState().columnFilters}
            globalFilter={table.getState().globalFilter}
            onDataProcessed={setProcessedData}
          >
            {/* Optional: Show processing indicator */}
            <WorkerStatusIndicator />
            
            {/* Render the table content */}
            <div className="rounded-md border">
              <Table>
                <TableHeader />
                <TableBody />
              </Table>
            </div>
            <Pagination />
          </WorkerDataProvider>
        )}
      </DataTableContent>
    </DataTable>
  );
}

// Optional component to show processing status
function WorkerStatusIndicator() {
  const { isProcessing, processingTime, recordCount } = useWorkerStatus();
  
  if (!isProcessing && !processingTime) return null;
  
  return (
    <div className="text-xs text-muted-foreground flex items-center gap-2 mb-2">
      {isProcessing ? (
        <div className="flex items-center">
          <span className="mr-2">Processing...</span>
          <Spinner size="sm" />
        </div>
      ) : (
        <div>
          Processed {recordCount} records in {processingTime?.toFixed(2)}ms
        </div>
      )}
    </div>
  );
}

### Performance Benefits

Using web workers provides several performance benefits:

1. **Responsive UI**: The main thread remains responsive during heavy operations
2. **Parallel Processing**: Data operations run in parallel with UI rendering
3. **Improved User Experience**: No freezing or janky scrolling with large datasets
4. **Better Resource Utilization**: Takes advantage of multi-core processors

### When to Use Web Workers

Consider using web workers when:

- You have datasets with 10,000+ rows
- Users need to sort or filter data frequently
- Table operations are causing noticeable UI lag
- Your table includes complex custom cell renderers 

## Performance Optimizations

The `DataTable` component includes several performance optimizations to ensure smooth performance even with large datasets:

### 1. Virtualization

For large datasets, the table uses virtualization to render only the visible rows:

```tsx
<DataTable
  schema={{
    columns: [...],
    enableVirtualization: true,      // Enable virtualization (enabled by default)
    virtualizationThreshold: 100,    // Number of rows before virtualization kicks in
    rowHeight: 35,                   // Height of each row in pixels
    virtualOverscan: 10,             // Number of extra rows to render outside viewport
    tableHeight: '400px',            // Height of the virtualized table container
  }}
  data={largeDataset}
/>
```

### 2. Memoization

Critical components are wrapped with `React.memo` to prevent unnecessary re-renders, with custom comparison functions where needed:

- `DataTablePartCell`
- `DataTableCell`
- `DataTableAggregatedCell`

### 3. Web Workers

Computationally intensive operations are offloaded to web workers to keep the main thread responsive:

```tsx
<WorkerDataProvider>
  <DataTable schema={schema} data={largeDataset} />
</WorkerDataProvider>
```

The worker handles:
- Sorting
- Filtering
- Data processing

### 4. Debounced Inputs

User input handlers (particularly for filters) are debounced to prevent excessive re-renders while typing:

```tsx
// Using the debounce utility
const debouncedHandler = debounce((value) => {
  // Handle input
}, 300);

// Or with the React hook
const handleFilterChange = useDebounce((value) => {
  column.setFilterValue(value);
}, 300, [column]);
```

### 5. Adaptive Sizing with ResizeObserver

The table automatically adapts to container size changes using ResizeObserver, providing better performance and user experience:

```tsx
<DataTable
  schema={{
    columns: [...],
    enableAdaptiveSizing: true,       // Enable adaptive sizing (enabled by default)
    enableAdaptiveColumns: true,      // Enable adaptive column widths (disabled by default)
    minColumnWidth: 50,               // Minimum column width in pixels
    resizeThrottleMs: 200,            // Throttle resize calculations (ms)
  }}
  data={data}
/>
```

This optimization:
- Dynamically adjusts to container size changes
- Recalculates virtualization parameters when dimensions change
- Optimizes column widths to make best use of available space
- Improves user experience on different screen sizes
- Prevents layout shifts and visual disruptions

The ResizeObserver implementation provides these benefits with minimal overhead by:
- Using debounced resize handlers to limit recalculations
- Only updating dimensions when actual changes occur
- Calculating optimal column widths based on available space
- Respecting column-specific sizing constraints

### Performance Impact

These optimizations have the following impact (ranked from highest to lowest):

1. **Virtualization**: Most effective for tables with many rows (1000+)
2. **Web Workers**: Critical for expensive operations on large datasets
3. **Adaptive Sizing**: Improves responsiveness and prevents layout thrashing
4. **Memoization**: Reduces unnecessary component re-renders
5. **Debounced Inputs**: Prevents filter input performance issues

## Usage Examples

// ... rest of existing content ... 