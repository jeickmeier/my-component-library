# DataTable Component

A powerful and flexible data table component for financial dashboards displaying analytical information such as holdings, performance, relative value, and risk characteristics in a tabular format.

## Features

- Powered by [TanStack Table](https://tanstack.com/table) (React Table v8)
- Client-side sorting, and filtering
- Data grouping capabilities
- Custom column renderers
- Advanced filtering options (select, range, range slider, star rating, etc. Extendable)
- Custom aggregation functions
- Virtualized rendering for performance with large datasets
- Sticky group headers
- Customizable toolbar and layout
- Export functionality

## Basic Usage

```tsx
import { DataTable } from "@/components/data-table";
import { createColumnHelper } from "@tanstack/react-table";
import type { Person } from "@/types";

// Define your data
const data: Person[] = [
  { id: 1, firstName: "John", lastName: "Doe", age: 30, rating: 4.5 },
  { id: 2, firstName: "Jane", lastName: "Smith", age: 25, rating: 5.0 },
  // ...more data
];

// Define your columns
const columnHelper = createColumnHelper<Person>();

const columns = [
  columnHelper.accessor('firstName', {
    header: "First Name",
    enableSorting: true,
    enableColumnFilter: true,
  }),
  columnHelper.accessor('lastName', {
    header: "Last Name",
  }),
  columnHelper.accessor('age', {
    header: "Age",
    enableColumnFilter: true,
    // Custom cell renderer
    cell: ({ row }) => <div className="font-medium">{row.original.age}</div>,
  }),
  columnHelper.accessor('rating', {
    header: "Rating",
    // Custom aggregation function
    aggregationFn: "mean",
  }),
];

// Render the table
export default function MyTable() {
  return (
    <DataTable
      columns={columns}
      data={data}
      enableGrouping={true}
      groupableColumns={["firstName", "lastName"]}
      defaultPageSize={10}
      containerHeight="600px"
    />
  );
}
```

## Props

| Prop | Type | Description | Default |
|------|------|-------------|---------|
| `columns` | `ColumnDef<TData, TValue>[]` | Array of column definitions | Required |
| `data` | `TData[]` | Array of data objects | Required |
| `columnFilters` | `ColumnFilter[]` | Optional array of filter configurations | Auto-discovered |
| `enableGrouping` | `boolean` | Enable/disable grouping functionality | `false` |
| `groupableColumns` | `string[]` | Array of column IDs that can be grouped | Auto-discovered |
| `defaultPageSize` | `number` | Number of rows to display per page | `10` |
| `containerHeight` | `string` | CSS height value for the table container | `undefined` |

## Column Configuration

Columns are created using TanStack Table's `createColumnHelper` function:

```tsx
import { createColumnHelper } from "@tanstack/react-table"

// Define your data type
type Payment = {
  id: string
  amount: number
  status: "pending" | "processing" | "success" | "failed"
  email: string
  category: string
}

// Create a helper for this data type
const columnHelper = createColumnHelper<Payment>();

// Define columns using the helper
export const columns = [
  columnHelper.accessor('status', {
    header: "Status",
    enableGrouping: true,
    filterFn: 'equals',
    meta: {
      options: [
        { label: "Pending", value: "pending" },
        { label: "Processing", value: "processing" },
        { label: "Success", value: "success" },
        { label: "Failed", value: "failed" },
      ]
    },    
    aggregationFn: 'first',
  }),
  columnHelper.accessor('email', {
    header: "Email",
    enableGrouping: true,
  }),
  columnHelper.accessor('amount', {
    header: "Amount",
    enableGrouping: false,
    filterFn: 'numberRange',
    meta: {
      filterConfig: {
        type: 'rangeSlider',
        column: 'amount', 
        label: 'Amount Range'
      }
    },
  }),
];
```

## Custom Filters

The DataTable supports several filter types:

### 1. Select Filter

```tsx
const columnFilters = [
  {
    type: "select",
    column: "status", 
    label: "Status",
    options: [
      { label: "Active", value: "active" },
      { label: "Inactive", value: "inactive" }
    ]
  }
];
```

### 2. Range Filter

```tsx
const columnFilters = [
  {
    type: "range",
    column: "age",
    label: "Age Range",
    min: 0,
    max: 100
  }
];
```

### 3. Range Slider Filter

```tsx
const columnFilters = [
  {
    type: "rangeSlider",
    column: "price",
    label: "Price Range",
    min: 0,
    max: 1000,
    step: 10
  }
];
```

### 4. Star Rating Filter

```tsx
const columnFilters = [
  {
    type: "starRating",
    column: "rating",
    label: "Minimum Rating",
    maxStars: 5
  }
];
```

## Custom Cell Rendering

### 1. Direct Custom Renderers

You can provide custom cell renderers directly in the column definition:

```tsx
columnHelper.accessor('status', {
  header: "Status",
  cell: ({ row }) => {
    const status = row.getValue("status");
    return (
      <div className={`badge ${status === 'active' ? 'bg-green-500' : 'bg-red-500'}`}>
        {status}
      </div>
    );
  }
})
```

### 2. Using Cell Renderer Factory Functions

The component provides factory functions for common cell renderers:

```tsx
import { 
  createMoneyRenderer, 
  createCategoryRenderer, 
  createStarRatingRenderer, 
  createDateRenderer, 
  createExtentRenderer 
} from "@/components/data-table/ui/cell-renderers"
import { CheckCircle, Clock, RefreshCcw, XCircle } from "lucide-react"

// Create reusable renderers with proper typing
const moneyRenderer = createMoneyRenderer<Payment>({ 
  digits: 2, 
  showCurrencySymbol: false 
});

// Example using icons
const iconCategoryRenderer = createCategoryRenderer<Payment, Payment['status']>({
  categories: {
    pending: { 
      type: 'icon',
      icon: <Clock className="h-4 w-4 text-yellow-500" />,
    },
    processing: { 
      type: 'icon',
      icon: <RefreshCcw className="h-4 w-4 text-blue-500" />
    },
    success: { 
      type: 'icon',
      icon: <CheckCircle className="h-4 w-4 text-green-500" />
    },
    failed: { 
      type: 'icon',
      icon: <XCircle className="h-4 w-4 text-red-500" />
    }
  }
});

const starRenderer = createStarRatingRenderer<Payment>();
const dateRenderer = createDateRenderer<Payment>();
const extentRenderer = createExtentRenderer<Payment>();

// Use the renderers in your columns
columnHelper.accessor('status', {
  header: "Status",
  cell: (props) => iconCategoryRenderer({ 
    cell: props.cell, 
    row: props.row, 
    value: props.getValue() 
  })
})
```

Available cell renderer factories:
- `createMoneyRenderer`: For currency/number formatting with options for digits, abbreviation, etc.
- `createCategoryRenderer`: For rendering categories with icons or colors
- `createStarRatingRenderer`: For rendering star ratings
- `createDateRenderer`: For formatting dates
- `createExtentRenderer`: For rendering ranges (useful in aggregated cells)

## Custom Aggregation Functions

There are two ways to add custom aggregation functions:

### 1. Use Built-in Aggregation Functions

TanStack Table provides several built-in aggregation functions:
- `sum`
- `avg`/`mean`
- `min`
- `max`
- `count`
- `first` (first value)
- `extent` (min and max as a range)

```tsx
columnHelper.accessor('amount', {
  header: "Amount",
  aggregationFn: "sum" // Use built-in aggregation
})
```

### 2. Create Custom Aggregation Functions

You can define custom aggregation functions in your application:

```tsx
// 1. Create your custom aggregation function
const weightedAverageAggregation = (
  columnId: string,
  leafRows: Row<TData>[],
  childRows: Row<TData>[]
) => {
  // Your custom aggregation logic here
  let sum = 0;
  let totalWeight = 0;
  
  for (const row of leafRows) {
    const value = row.getValue(columnId) as number;
    const weight = row.original.weight as number;
    sum += value * weight;
    totalWeight += weight;
  }
  
  return totalWeight ? sum / totalWeight : 0;
};

// 2. Use it in your column definition
columnHelper.accessor('score', {
  header: "Weighted Score",
  aggregationFn: weightedAverageAggregation
})
```

### 3. Different Renderers for Regular and Aggregated Cells

You can specify different renderers for regular and aggregated cells:

```tsx
// Create specialized renderers for regular and aggregated cells
const moneyRenderer = createMoneyRenderer<Payment>({ 
  digits: 2, 
  showCurrencySymbol: false 
});

const moneyAggregatedRenderer = createMoneyRenderer<Payment>({ 
  digits: 1, 
  abbreviate: true, 
  abbreviationDivider: 'B' 
});

// Use in column definition
columnHelper.accessor('amount', {
  header: "Amount",
  aggregationFn: 'sum',
  cell: (props) => moneyRenderer({ 
    cell: props.cell, 
    row: props.row, 
    value: props.getValue() 
  }),
  aggregatedCell: (props) => moneyAggregatedRenderer({ 
    cell: props.cell, 
    row: props.row, 
    value: props.getValue() 
  })
})
```

## Custom Filter Functions

You can create custom filter functions:

```tsx
// 1. Create your custom filter function
const myCustomFilter = <TData extends RowData>(
  row: Row<TData>,
  columnId: string,
  value: any
) => {
  const cellValue = row.getValue(columnId);
  // Your custom filter logic
  return someCondition(cellValue, value);
};

// 2. Register it with TanStack Table (in your setup or context)
// In some initialization code:
registerFilterFn('myCustom', myCustomFilter);

// 3. Use it in column definition
columnHelper.accessor('myColumn', {
  header: "My Column",
  filterFn: 'myCustom'
})
```

## Advanced Usage

### Table Virtualization

For large datasets, virtualization is enabled automatically. You can control this behavior using:

```tsx
import { useTableVirtualization } from "@/components/data-table";

// Within your component
const { 
  virtualizer, 
  virtualItems, 
  totalSize, 
  scrollToIndex 
} = useTableVirtualization({
  rows,
  containerRef,
  itemHeight: 40 // Optional
});
```

### Sticky Group Headers

The component provides sticky group headers when grouping is enabled:

```tsx
import { useStickyGroupHeaders } from "@/components/data-table";

// Within your component 
useStickyGroupHeaders({
  tableRef: tableRef,
  headerRef: headerRef,
  rowRefs: rowRefsMap,
  isGrouped: grouping.length > 0
});
```

## Component Structure

The DataTable is composed of several subcomponents that can be used independently:

- `DataTable`: Main component that orchestrates everything
- `DataTableToolbar`: Controls for filtering, grouping, and customization
- `DataTableStructure`: The main table structure
- `DataTableFooter`: Pagination and information
- `DataTableGroupingControl`: UI for configuring grouping
- `TableCustomizationControl`: UI for table customization

## Complete Example

Here's a complete example that follows the structure of our example files:

### columns.tsx
```tsx
"use client"

import { createColumnHelper } from "@tanstack/react-table"
import { 
  createMoneyRenderer, 
  createCategoryRenderer, 
  createStarRatingRenderer, 
  createDateRenderer, 
  createExtentRenderer 
} from "@/components/data-table/ui/cell-renderers"
import { CheckCircle, Clock, RefreshCcw, XCircle } from "lucide-react"

// Define your data type
export type Payment = {
  id: string
  amount: number
  status: "pending" | "processing" | "success" | "failed"
  email: string
  category: string
  reviewRating: number
  reviewDate: Date
}

const columnHelper = createColumnHelper<Payment>();

// Create reusable renderers with proper typing
const moneyRenderer = createMoneyRenderer<Payment>({ 
  digits: 2, 
  showCurrencySymbol: false 
});

const moneyAggregatedRenderer = createMoneyRenderer<Payment>({ 
  digits: 1, 
  abbreviate: true, 
  abbreviationDivider: 'B' 
});

// Example using icons
const iconCategoryRenderer = createCategoryRenderer<Payment, Payment['status']>({
  categories: {
    pending: { 
      type: 'icon',
      icon: <Clock className="h-4 w-4 text-yellow-500" />,
    },
    processing: { 
      type: 'icon',
      icon: <RefreshCcw className="h-4 w-4 text-blue-500" />
    },
    success: { 
      type: 'icon',
      icon: <CheckCircle className="h-4 w-4 text-green-500" />
    },
    failed: { 
      type: 'icon',
      icon: <XCircle className="h-4 w-4 text-red-500" />
    }
  }
});

const starRenderer = createStarRatingRenderer<Payment>();
const dateRenderer = createDateRenderer<Payment>();
const extentRenderer = createExtentRenderer<Payment>();

export const columns = [
  columnHelper.accessor('status', {
    header: "Status",
    enableGrouping: true,
    filterFn: 'equals',
    meta: {
      options: [
        { label: "Pending", value: "pending" },
        { label: "Processing", value: "processing" },
        { label: "Success", value: "success" },
        { label: "Failed", value: "failed" },
      ]
    },    
    aggregationFn: 'first',
    cell: (props) => iconCategoryRenderer({ 
      cell: props.cell, 
      row: props.row, 
      value: props.getValue() 
    })
  }),
  columnHelper.accessor('category', {
    header: "Category",
    enableGrouping: true,
    filterFn: 'equals',
    meta: {
      options: [
        { label: "Retail", value: "retail" },
        { label: "Corporate", value: "corporate" },
        { label: "Investment", value: "investment" },
        { label: "Treasury", value: "treasury" },
      ]
    },
    aggregationFn: 'first',
  }),
  columnHelper.accessor('email', {
    header: "Email",
    enableGrouping: true,
  }),
  columnHelper.accessor('amount', {
    header: "Amount",
    enableGrouping: false,
    filterFn: 'numberRange',
    meta: {
      filterConfig: {
        type: 'rangeSlider',
        column: 'amount', 
        label: 'Amount Range'
      }
    },
    aggregationFn: 'sum',
    cell: (props) => moneyRenderer({ 
      cell: props.cell, 
      row: props.row, 
      value: props.getValue() 
    }),
    aggregatedCell: (props) => moneyAggregatedRenderer({ 
      cell: props.cell, 
      row: props.row, 
      value: props.getValue() 
    })
  }),
  columnHelper.accessor('reviewRating', {
    header: "Rating",
    enableGrouping: false,
    aggregationFn: 'mean',
    filterFn: 'starRating',
    meta: {
      maxStars: 5,
      filterConfig: {
        type: 'starRating',
        column: 'reviewRating',
        label: 'Rating',
        maxStars: 5
      }
    },
    cell: (props) => starRenderer({ 
      cell: props.cell, 
      row: props.row, 
      value: props.getValue() 
    }),
    aggregatedCell: (props) => starRenderer({ 
      cell: props.cell, 
      row: props.row, 
      value: props.getValue() 
    })
  }),
  columnHelper.accessor('reviewDate', {
    header: "Review Date",
    enableGrouping: false,
    aggregationFn: 'extent',
    cell: (props) => dateRenderer({ 
      cell: props.cell, 
      row: props.row, 
      value: props.getValue() 
    }),
    aggregatedCell: (props) => extentRenderer({ 
      cell: props.cell, 
      row: props.row, 
      value: props.getValue() 
    })
  })
];
```

### page.tsx
```tsx
"use client";

import React from "react";
import { Payment, columns } from "./columns";
import { DataTable } from "@/components/data-table";
import { ColumnDef } from "@tanstack/react-table";

// Sample data (in a real app, import or fetch this)
const data: Payment[] = [
  {
    id: "1",
    amount: 100,
    status: "success",
    email: "user1@example.com",
    category: "retail",
    reviewRating: 4.5,
    reviewDate: new Date("2023-01-15")
  },
  {
    id: "2",
    amount: 250,
    status: "pending",
    email: "user2@example.com",
    category: "corporate",
    reviewRating: 3.5,
    reviewDate: new Date("2023-02-21")
  },
  // More data would go here
];

export default function DemoPage() {
  return (
    <div className="container mx-auto py-10">
      <h1 className="text-2xl font-bold mb-5">
        Data Table with Multi-level Grouping and Filtering
      </h1>
      <p className="text-muted-foreground mb-4">
        You can group by multiple columns and drag to reorder them. Try grouping
        by status, then email to see hierarchical data.
      </p>
      <p className="text-muted-foreground mb-4">
        Filters are automatically discovered from column definitions with filterFn.
      </p>
      <DataTable
        columns={columns as ColumnDef<Payment>[]}
        data={data}
        enableGrouping={true}
        defaultPageSize={50}
        containerHeight="65vh" 
      />
    </div>
  );
}
```

## Contributing

If you find bugs or have feature requests, please open an issue or submit a PR. 