# Financial Analytics Component Library

A powerful React component library designed for financial institution dashboards, providing interactive and analytical components for displaying holdings, performance, relative value, and risk characteristics in both tabular and graphical formats.

## Features

- 📊 Advanced DataTable component with:
  - Client-side sorting and filtering
  - Data grouping capabilities
  - Custom column renderers
  - Advanced filtering options (select, range, range slider, star rating)
  - Custom aggregation functions
  - Virtualized rendering for large datasets
  - Sticky group headers
  - Export functionality
  - Responsive design
- 📅 DatePickerWithRange component with:
  - Rolling date range presets (1D, MTD, QTD, YTD, FYTD, 3Y, 5Y)
  - Absolute date range presets (F20-F26)
  - Dual calendar view
  - Month/Year navigation
  - Custom date range selection

## Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/my-component-library.git
cd my-component-library
```

2. Install dependencies:
```bash
pnpm install
```

3. Run the development server:
```bash
pnpm dev
```

## Project Structure

```
my-component-library/
├── app/                    # Next.js app directory
│   ├── date-picker-example/  # Example pages
│   └── ...
├── components/            # React components
│   ├── data-table/       # DataTable component and related files
│   ├── date-picker/      # DatePicker components
│   └── ui/               # Base UI components
├── hooks/                # Custom React hooks
├── lib/                  # Utility functions and helpers
└── public/              # Static assets
```

## Component Usage

### DataTable

The DataTable component is designed for displaying and analyzing tabular data with advanced features like sorting, filtering, and grouping.

```tsx
import { DataTable } from "@/components/data-table";
import { createColumnHelper } from "@tanstack/react-table";

// Define your data type
type Payment = {
  id: string;
  amount: number;
  status: "pending" | "processing" | "success" | "failed";
  email: string;
  category: string;
};

// Create a column helper
const columnHelper = createColumnHelper<Payment>();

// Define columns
const columns = [
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
  }),
];

// Use the component
export default function PaymentsTable() {
  return (
    <DataTable
      columns={columns}
      data={payments}
      enableGrouping={true}
      groupableColumns={["status", "category"]}
      defaultPageSize={50}
      containerHeight="600px"
    />
  );
}
```

#### DataTable Props

| Prop | Type | Description | Default |
|------|------|-------------|---------|
| `columns` | `ColumnDef<TData, TValue>[]` | Column definitions | Required |
| `data` | `TData[]` | Table data | Required |
| `columnFilters` | `ColumnFilter[]` | Filter configurations | Auto-discovered |
| `enableGrouping` | `boolean` | Enable grouping | `false` |
| `groupableColumns` | `string[]` | Groupable column IDs | Auto-discovered |
| `defaultPageSize` | `number` | Rows per page | `50` |
| `containerHeight` | `string` | Table container height | `"400px"` |

### DatePickerWithRange

A dual-calendar date range picker with preset ranges and flexible navigation.

```tsx
import { DatePickerWithRange } from "@/components/date-picker/date-picker-with-range";
import { DateRange } from "react-day-picker";
import { subDays } from "date-fns";

export default function DateRangeSelector() {
  const today = new Date();
  const thirtyDaysAgo = subDays(today, 30);
  
  const [dateRange, setDateRange] = useState<DateRange>({
    from: thirtyDaysAgo,
    to: today
  });

  return (
    <DatePickerWithRange 
      onDateChange={setDateRange}
      defaultFrom={thirtyDaysAgo}
      defaultTo={today}
    />
  );
}
```

#### DatePickerWithRange Props

| Prop | Type | Description | Default |
|------|------|-------------|---------|
| `onDateChange` | `(date: DateRange) => void` | Date change handler | Required |
| `defaultFrom` | `Date` | Initial start date | `undefined` |
| `defaultTo` | `Date` | Initial end date | `undefined` |
| `className` | `string` | Additional CSS classes | `undefined` |

#### Available Date Presets

Rolling Ranges:
- 1D: Previous business day
- MTD: Month to date
- QTD: Quarter to date
- YTD: Year to date
- FYTD: Fiscal year to date
- 3Y: Last 3 years
- 5Y: Last 5 years

Absolute Ranges:
- F20: FY 2019-2020
- F21: FY 2020-2021
- F22: FY 2021-2022
- F23: FY 2022-2023
- F24: FY 2023-2024
- F25: FY 2024-2025
- F26: FY 2025-2026

## Contributing

1. Fork the repository
2. Create your feature branch: `git checkout -b feature/my-new-feature`
3. Commit your changes: `git commit -am 'Add some feature'`
4. Push to the branch: `git push origin feature/my-new-feature`
5. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.
