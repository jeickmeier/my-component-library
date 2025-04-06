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